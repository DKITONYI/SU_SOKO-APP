import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  doc,
  where,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";
import { Report } from "../types/marketplace";
import { getProductById } from "./productService";
import { getUserProfileById } from "./userService";

export const reportProduct = async (productId: string, reason: string) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User not logged in.");
  }

  if (!reason.trim()) {
    throw new Error("Please provide a report reason.");
  }

  const [product, reporter] = await Promise.all([
    getProductById(productId).catch(() => null),
    getUserProfileById(currentUser.uid).catch(() => null),
  ]);

  await addDoc(collection(db, "reports"), {
    product_id: productId,
    product_title: product?.title ?? "Product",
    reporter_id: currentUser.uid,
    reporter_name: reporter?.fullName || reporter?.email || "User",
    seller_id: product?.seller_id ?? "",
    reason: reason.trim(),
    status: "pending",
    created_at: serverTimestamp(),
  });
};

export const getPendingReports = async (): Promise<Report[]> => {
  const snapshot = await getDocs(
    query(collection(db, "reports"), where("status", "==", "pending"))
  );

  return Promise.all(
    snapshot.docs.map(async (reportDoc) => {
      const report = {
        id: reportDoc.id,
        ...(reportDoc.data() as Omit<Report, "id">),
      };
      const [product, reporter] = await Promise.all([
        report.product_id ? getProductById(report.product_id).catch(() => null) : null,
        report.reporter_id ? getUserProfileById(report.reporter_id).catch(() => null) : null,
      ]);
      const sellerId = report.seller_id || product?.seller_id || "";
      const seller = sellerId
        ? await getUserProfileById(sellerId).catch(() => null)
        : null;

      return {
        ...report,
        product_title: report.product_title || product?.title || "Product",
        reporter_name: report.reporter_name || reporter?.fullName || reporter?.email || "User",
        seller_id: sellerId,
        seller_name: seller?.fullName || seller?.email || "Seller",
      };
    })
  );
};

export const markReportReviewed = async (reportId: string) => {
  await updateDoc(doc(db, "reports", reportId), {
    status: "reviewed",
    reviewed_at: serverTimestamp(),
  });
};
