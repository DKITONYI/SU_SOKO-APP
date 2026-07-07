import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";

export const addProduct = async (
  title: string,
  price: string,
  category: string,
  description: string
) => {

  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User not logged in.");
  }

  await addDoc(collection(db, "products"), {
    title,
    price: Number(price),
    category,
    description,
    sellerId: currentUser.uid,
    createdAt: serverTimestamp(),
  });
};