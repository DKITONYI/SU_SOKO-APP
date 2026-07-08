import {
  collection,
  getDocs,
  onSnapshot,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";
import { getProductById } from "./productService";

export type SellerSaleReportItem = {
  id: string;
  amount: number;
  buyer_id: string;
  product_id: string;
  product_title: string;
  paid_at?: Timestamp;
};

export type SellerSaleReport = {
  itemCount: number;
  totalAmount: number;
  items: SellerSaleReportItem[];
};

export type SubscriptionRevenueReport = {
  subscribedSellerCount: number;
  totalAmount: number;
};

export const getSellerSalesReport = async (): Promise<SellerSaleReport> => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User not logged in.");
  }

  const snapshot = await getDocs(
    query(
      collection(db, "payments"),
      where("purpose", "==", "product_purchase"),
      where("seller_id", "==", currentUser.uid),
      where("status", "==", "paid")
    )
  );

  const items = await Promise.all(
    snapshot.docs.map(async (paymentDoc) => {
      const payment = paymentDoc.data();
      const productId = String(payment.product_id ?? "");
      const product = productId
        ? await getProductById(productId).catch(() => null)
        : null;

      return {
        id: paymentDoc.id,
        amount: Number(payment.amount ?? 0),
        buyer_id: String(payment.user_id ?? ""),
        product_id: productId,
        product_title: product?.title ?? "Product",
        paid_at: payment.paid_at,
      };
    })
  );

  return {
    itemCount: items.length,
    totalAmount: items.reduce((total, item) => total + item.amount, 0),
    items,
  };
};

export const getSubscriptionRevenueReport = async (): Promise<SubscriptionRevenueReport> => {
  const snapshot = await getDocs(
    query(
      collection(db, "payments"),
      where("purpose", "==", "seller_subscription"),
      where("status", "==", "paid")
    )
  );

  const subscribedSellerIds = new Set<string>();
  let totalAmount = 0;

  snapshot.docs.forEach((paymentDoc) => {
    const payment = paymentDoc.data();

    if (payment.user_id) {
      subscribedSellerIds.add(String(payment.user_id));
    }

    totalAmount += Number(payment.amount ?? 0);
  });

  return {
    subscribedSellerCount: subscribedSellerIds.size,
    totalAmount,
  };
};

export const subscribeToSellerSalesReport = (
  onReport: (report: SellerSaleReport) => void,
  onError: (error: Error) => void
) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    onError(new Error("User not logged in."));
    return () => undefined;
  }

  const reportQuery = query(
    collection(db, "payments"),
    where("purpose", "==", "product_purchase"),
    where("seller_id", "==", currentUser.uid),
    where("status", "==", "paid")
  );

  return onSnapshot(
    reportQuery,
    async (snapshot) => {
      const items = await Promise.all(
        snapshot.docs.map(async (paymentDoc) => {
          const payment = paymentDoc.data();
          const productId = String(payment.product_id ?? "");
          const product = productId
            ? await getProductById(productId).catch(() => null)
            : null;

          return {
            id: paymentDoc.id,
            amount: Number(payment.amount ?? 0),
            buyer_id: String(payment.user_id ?? ""),
            product_id: productId,
            product_title: product?.title ?? "Product",
            paid_at: payment.paid_at,
          };
        })
      );

      onReport({
        itemCount: items.length,
        totalAmount: items.reduce((total, item) => total + item.amount, 0),
        items,
      });
    },
    onError
  );
};

export const subscribeToSubscriptionRevenueReport = (
  onReport: (report: SubscriptionRevenueReport) => void,
  onError: (error: Error) => void
) => {
  const reportQuery = query(
    collection(db, "payments"),
    where("purpose", "==", "seller_subscription"),
    where("status", "==", "paid")
  );

  return onSnapshot(
    reportQuery,
    (snapshot) => {
      const subscribedSellerIds = new Set<string>();
      let totalAmount = 0;

      snapshot.docs.forEach((paymentDoc) => {
        const payment = paymentDoc.data();

        if (payment.user_id) {
          subscribedSellerIds.add(String(payment.user_id));
        }

        totalAmount += Number(payment.amount ?? 0);
      });

      onReport({
        subscribedSellerCount: subscribedSellerIds.size,
        totalAmount,
      });
    },
    onError
  );
};
