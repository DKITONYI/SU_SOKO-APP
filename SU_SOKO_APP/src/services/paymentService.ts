import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";

const MPESA_API_URL = process.env.EXPO_PUBLIC_MPESA_API_URL;

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

  if (!MPESA_API_URL) {
    throw new Error(
      "M-Pesa backend URL is missing. Set EXPO_PUBLIC_MPESA_API_URL."
    );
  }

  const normalizedPhone = normalizePhoneNumber(request.phoneNumber);
  const paymentRef = await addDoc(collection(db, "payments"), {
    user_id: currentUser.uid,
    phone_number: normalizedPhone,
    amount: request.amount,
    purpose: request.purpose,
    product_id: request.productId ?? "",
    seller_id: request.sellerId ?? "",
    status: "pending",
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });

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
