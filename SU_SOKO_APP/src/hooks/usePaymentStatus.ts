import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

export type PaymentStatus =
  | "idle"
  | "pending"
  | "stk_sent"
  | "paid"
  | "failed";

export const usePaymentStatus = (paymentId: string | null) => {
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [failureReason, setFailureReason] = useState("");

  useEffect(() => {
    if (!paymentId) {
      setStatus("idle");
      setFailureReason("");
      return undefined;
    }

    const unsubscribe = onSnapshot(doc(db, "payments", paymentId), (snapshot) => {
      if (!snapshot.exists()) {
        return;
      }

      const payment = snapshot.data();
      setStatus((payment.status as PaymentStatus) ?? "pending");
      setFailureReason(payment.failure_reason ?? payment.result_description ?? "");
    });

    return unsubscribe;
  }, [paymentId]);

  return {
    status,
    failureReason,
  };
};
