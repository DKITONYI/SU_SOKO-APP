import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { User } from "../types/marketplace";

export const getUserProfileById = async (uid: string): Promise<User> => {
  const snapshot = await getDoc(doc(db, "users", uid));

  if (!snapshot.exists()) {
    throw new Error("User profile not found.");
  }

  return snapshot.data() as User;
};
