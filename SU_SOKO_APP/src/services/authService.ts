import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";

export const registerUser = async (
  fullName: string,
  email: string,
  phone: string,
  password: string,
  role: "Buyer" | "Seller"
) => {
  console.log("registerUser called");
  console.log("Role received:", role);
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    fullName,
    email,
    phone,
    role,
    createdAt: new Date(),
  });

  return user;
};

export const loginUser = async (
  email: string,
  password: string
) => {

  const userCredential =
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  const user = userCredential.user;

  const userDoc = await getDoc(
    doc(db, "users", user.uid)
  );

  return {
    firebaseUser: user,
    profile: userDoc.data(),
  };
};