import { collection, getDocs, doc, getDoc } from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { User } from "../types/marketplace";

export const getUserProfileById = async (uid: string): Promise<User> => {
  const snapshot = await getDoc(doc(db, "users", uid));

  if (!snapshot.exists()) {
    throw new Error("User profile not found.");
  }

  return snapshot.data() as User;
};

export const getAllUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(collection(db, "users"));

  return snapshot.docs
    .map((userDoc) => userDoc.data() as User)
    .sort((first, second) =>
      (first.fullName || first.email || first.uid).localeCompare(
        second.fullName || second.email || second.uid
      )
    );
};
