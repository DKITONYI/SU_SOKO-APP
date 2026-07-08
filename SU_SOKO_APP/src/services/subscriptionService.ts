import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";
import { SubscriptionStatus, User } from "../types/marketplace";

export const getCurrentUserSubscription = async (): Promise<SubscriptionStatus> => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User not logged in.");
  }

  const snapshot = await getDoc(doc(db, "users", currentUser.uid));

  if (!snapshot.exists()) {
    throw new Error("User profile not found.");
  }

  const profile = snapshot.data() as User;

  return profile.subscription_status ?? "inactive";
};

export const getSellerSubscriptions = async (): Promise<User[]> => {
  const snapshot = await getDocs(
    query(collection(db, "users"), where("role", "==", "seller"))
  );

  return snapshot.docs.map((sellerDoc) => sellerDoc.data() as User);
};

export const updateSellerSubscriptionStatus = async (
  sellerId: string,
  subscriptionStatus: SubscriptionStatus
) => {
  await updateDoc(doc(db, "users", sellerId), {
    subscription_status: subscriptionStatus,
    subscription_updated_at: serverTimestamp(),
  });
};
