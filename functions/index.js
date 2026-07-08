const axios = require("axios");
const express = require("express");
const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");

admin.initializeApp();

const app = express();
app.use(express.json());

const db = admin.firestore();

const getMpesaBaseUrl = () => {
  return process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
};

const getTimestamp = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");

  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");
};

const getAccessToken = async () => {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;

  if (!key || !secret) {
    throw new Error("M-Pesa consumer key/secret are not configured.");
  }

  const credentials = Buffer.from(`${key}:${secret}`).toString("base64");
  const response = await axios.get(
    `${getMpesaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    }
  );

  return response.data.access_token;
};

const getCallbackMetadataValue = (metadata, name) => {
  return metadata?.Item?.find((item) => item.Name === name)?.Value ?? null;
};

app.post("/mpesa/stk-push", async (req, res) => {
  try {
    const {
      paymentId,
      userId,
      phoneNumber,
      amount,
      purpose,
      productId,
      sellerId,
    } = req.body;

    if (!paymentId || !userId || !phoneNumber || !amount || !purpose) {
      res.status(400).json({ error: "Missing required payment fields." });
      return;
    }

    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;

    if (!shortcode || !passkey || !callbackUrl) {
      res.status(500).json({ error: "M-Pesa shortcode/passkey/callback are not configured." });
      return;
    }

    const timestamp = getTimestamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
    const accessToken = await getAccessToken();

    const response = await axios.post(
      `${getMpesaBaseUrl()}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(Number(amount)),
        PartyA: phoneNumber,
        PartyB: shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: purpose === "seller_subscription" ? "SU-SOKO-SUB" : "SU-SOKO-BUY",
        TransactionDesc: purpose === "seller_subscription"
          ? "SU SOKO seller subscription"
          : "SU SOKO product purchase",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    await db.collection("payments").doc(paymentId).set(
      {
        user_id: userId,
        phone_number: phoneNumber,
        amount: Number(amount),
        purpose,
        product_id: productId ?? "",
        seller_id: sellerId ?? "",
        checkout_request_id: response.data.CheckoutRequestID ?? "",
        merchant_request_id: response.data.MerchantRequestID ?? "",
        status: "stk_sent",
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    res.json({
      checkoutRequestId: response.data.CheckoutRequestID,
      merchantRequestId: response.data.MerchantRequestID,
      responseCode: response.data.ResponseCode,
      responseDescription: response.data.ResponseDescription,
      customerMessage: response.data.CustomerMessage,
    });
  } catch (error) {
    console.error("STK push failed", error.response?.data ?? error.message);
    res.status(500).json({ error: "Failed to initiate M-Pesa STK Push." });
  }
});

app.post("/mpesa/callback", async (req, res) => {
  try {
    const callback = req.body?.Body?.stkCallback;

    if (!callback?.CheckoutRequestID) {
      res.status(400).json({ error: "Invalid M-Pesa callback payload." });
      return;
    }

    const paymentsSnapshot = await db
      .collection("payments")
      .where("checkout_request_id", "==", callback.CheckoutRequestID)
      .limit(1)
      .get();

    if (paymentsSnapshot.empty) {
      console.warn("No payment found for callback", callback.CheckoutRequestID);
      res.json({ received: true });
      return;
    }

    const paymentDoc = paymentsSnapshot.docs[0];
    const payment = paymentDoc.data();
    const success = callback.ResultCode === 0;

    if (!success) {
      await paymentDoc.ref.set(
        {
          status: "failed",
          result_code: callback.ResultCode,
          result_description: callback.ResultDesc ?? "",
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      res.json({ received: true });
      return;
    }

    const metadata = callback.CallbackMetadata;
    const mpesaReceipt = getCallbackMetadataValue(metadata, "MpesaReceiptNumber");
    const paidAmount = getCallbackMetadataValue(metadata, "Amount");
    const paidPhone = getCallbackMetadataValue(metadata, "PhoneNumber");

    const batch = db.batch();

    batch.set(
      paymentDoc.ref,
      {
        status: "paid",
        mpesa_receipt_number: mpesaReceipt,
        paid_amount: paidAmount,
        paid_phone: paidPhone,
        result_code: callback.ResultCode,
        result_description: callback.ResultDesc ?? "",
        paid_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    if (payment.purpose === "seller_subscription" && payment.user_id) {
      batch.set(
        db.collection("users").doc(payment.user_id),
        {
          subscription_status: "active",
          subscription_updated_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    if (payment.purpose === "product_purchase" && payment.product_id) {
      batch.set(
        db.collection("products").doc(payment.product_id),
        {
          status: "sold",
          buyer_id: payment.user_id ?? "",
          sold_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    await batch.commit();

    res.json({ received: true });
  } catch (error) {
    console.error("M-Pesa callback failed", error);
    res.status(500).json({ error: "Callback processing failed." });
  }
});

exports.api = onRequest(
  {
    region: "us-central1",
    cors: true,
  },
  app
);
