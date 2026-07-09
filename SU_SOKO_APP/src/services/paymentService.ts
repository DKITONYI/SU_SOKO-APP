import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";

const MPESA_API_URL = process.env.EXPO_PUBLIC_MPESA_API_URL;
const PAYMENT_MODE = "mock";
const MOCK_PAYMENT_DELAY_MS = 2500;

export const isMockPaymentMode = () => PAYMENT_MODE === "mock";

type MpesaPurpose = "seller_subscription" | "product_purchase";

type MpesaRequest = {
  phoneNumber: string;
  amount: number;
  purpose: MpesaPurpose;
  productId?: string;
  sellerId?: string;
};

type MpesaResponse = {
  checkoutRequestId?: string;
  merchantRequestId?: string;
  responseCode?: string;
  responseDescription?: string;
  customerMessage?: string;
};

const requireCurrentUser = () => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User not logged in.");
  }

  return currentUser;
};

const normalizePhoneNumber = (phoneNumber: string) => {
  const cleaned = phoneNumber.replace(/\D/g, "");

  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return `254${cleaned.slice(1)}`;
  }

  if (cleaned.startsWith("254") && cleaned.length === 12) {
    return cleaned;
  }

  throw new Error("Enter a valid Safaricom number, e.g. 0712345678.");
};

const initiateMpesaStkPush = async (request: MpesaRequest) => {
  const currentUser = requireCurrentUser();
  const normalizedPhone = normalizePhoneNumber(request.phoneNumber);
  const paymentRef = await addDoc(collection(db, "payments"), {
    user_id: currentUser.uid,
    phone_number: normalizedPhone,
    amount: request.amount,
    purpose: request.purpose,
    product_id: request.productId ?? "",
    seller_id: request.sellerId ?? "",
    payment_mode: PAYMENT_MODE,
    status: "pending",
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });

  if (PAYMENT_MODE === "mock") {
    await updateDoc(doc(db, "payments", paymentRef.id), {
      checkout_request_id: `MOCK-${paymentRef.id}`,
      merchant_request_id: `MOCK-${Date.now()}`,
      response_description: "STK push accepted",
      customer_message: "STK push sent successfully.",
      status: "stk_sent",
      updated_at: serverTimestamp(),
    });

    setTimeout(() => {
      completeMockPayment(paymentRef.id, request, currentUser.uid).catch((error) => {
        console.log("Mock payment completion failed:", error);
      });
    }, MOCK_PAYMENT_DELAY_MS);

    return {
      paymentId: paymentRef.id,
      checkoutRequestId: `MOCK-${paymentRef.id}`,
      merchantRequestId: `MOCK-${Date.now()}`,
      responseCode: "0",
      responseDescription: "STK push accepted",
      customerMessage: "STK push sent successfully.",
    };
  }

  if (!MPESA_API_URL) {
    await updateDoc(doc(db, "payments", paymentRef.id), {
      status: "failed",
      failure_reason: "M-Pesa backend URL is missing.",
      updated_at: serverTimestamp(),
    });

    throw new Error(
      "M-Pesa backend URL is missing. Set EXPO_PUBLIC_MPESA_API_URL."
    );
  }

  const response = await fetch(`${MPESA_API_URL}/mpesa/stk-push`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      paymentId: paymentRef.id,
      userId: currentUser.uid,
      phoneNumber: normalizedPhone,
      amount: request.amount,
      purpose: request.purpose,
      productId: request.productId,
      sellerId: request.sellerId,
    }),
  });

  if (!response.ok) {
    await updateDoc(doc(db, "payments", paymentRef.id), {
      status: "failed",
      failure_reason: "M-Pesa backend rejected the request.",
      updated_at: serverTimestamp(),
    });

    throw new Error("M-Pesa request failed. Please try again.");
  }

  const data = (await response.json()) as MpesaResponse;

  await updateDoc(doc(db, "payments", paymentRef.id), {
    checkout_request_id: data.checkoutRequestId ?? "",
    merchant_request_id: data.merchantRequestId ?? "",
    status: "stk_sent",
    updated_at: serverTimestamp(),
  });

  return {
    paymentId: paymentRef.id,
    ...data,
  };
};

const completeMockPayment = async (
  paymentId: string,
  request: MpesaRequest,
  currentUserId: string
) => {
  await updateDoc(doc(db, "payments", paymentId), {
    status: "paid",
    result_code: 0,
    result_description: "Mock payment completed successfully.",
    paid_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });

  if (request.purpose === "seller_subscription") {
    await updateDoc(doc(db, "users", currentUserId), {
      subscription_status: "active",
      subscription_updated_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  }

  if (request.purpose === "product_purchase" && request.productId) {
    await updateDoc(doc(db, "products", request.productId), {
      status: "sold",
      sold_to: currentUserId,
      sold_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  }
};

export const paySellerSubscription = async (
  phoneNumber: string,
  amount = 500
) => {
  return initiateMpesaStkPush({
    phoneNumber,
    amount,
    purpose: "seller_subscription",
  });
};

export const payForProduct = async (
  phoneNumber: string,
  amount: number,
  productId: string,
  sellerId: string
) => {
  return initiateMpesaStkPush({
    phoneNumber,
    amount,
    purpose: "product_purchase",
    productId,
    sellerId,
  });
};
