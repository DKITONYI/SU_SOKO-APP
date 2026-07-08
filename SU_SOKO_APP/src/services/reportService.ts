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

export const reportProduct = async (productId: string, reason: string) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User not logged in.");
  }

  if (!reason.trim()) {
    throw new Error("Please provide a report reason.");
  }

  await addDoc(collection(db, "reports"), {
    product_id: productId,
    reporter_id: currentUser.uid,
    reason: reason.trim(),
    status: "pending",
    created_at: serverTimestamp(),
  });
};

export const getPendingReports = async (): Promise<Report[]> => {
  const snapshot = await getDocs(
    query(collection(db, "reports"), where("status", "==", "pending"))
  );

  return snapshot.docs.map((reportDoc) => ({
    id: reportDoc.id,
    ...(reportDoc.data() as Omit<Report, "id">),
  }));
};

export const markReportReviewed = async (reportId: string) => {
  await updateDoc(doc(db, "reports", reportId), {
    status: "reviewed",
    reviewed_at: serverTimestamp(),
  });
};
