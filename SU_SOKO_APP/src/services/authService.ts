import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";
import { UserRole } from "../types/marketplace";

export const ADMIN_EMAIL = "admin@strathmore.edu";
export const LEGACY_ADMIN_EMAIL = "admin@stratmore.edu";

export const isAdminEmail = (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  return normalizedEmail === ADMIN_EMAIL || normalizedEmail === LEGACY_ADMIN_EMAIL;
};

export const registerUser = async (
  fullName: string,
  email: string,
  phone: string,
  password: string,
  role: "Buyer" | "Seller"
) => {
  console.log("registerUser called");
  console.log("Role received:", role);
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedRole = role.toLowerCase() as Extract<UserRole, "buyer" | "seller">;

  if (isAdminEmail(normalizedEmail)) {
    throw new Error("Admin accounts cannot be registered from the app.");
  }

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    normalizedEmail,
    password
  );

  const user = userCredential.user;

  try {
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        role: normalizedRole,
        subscription_status: normalizedRole === "seller" ? "inactive" : "active",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    await deleteUser(user).catch(() => undefined);
    throw error;
  }

  return user;
};

export const loginUser = async (
  email: string,
  password: string
) => {
  const normalizedEmail = email.trim().toLowerCase();

  let userCredential;

  try {
    userCredential = await signInWithEmailAndPassword(
      auth,
      normalizedEmail,
      password
    );
  } catch (error: any) {
    if (isAdminEmail(normalizedEmail) && password === "admin") {
      userCredential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );
    } else {
      throw error;
    }
  }

  const user = userCredential.user;

  const userDoc = await getDoc(
    doc(db, "users", user.uid)
  );

  if (isAdminEmail(user.email ?? "") && !userDoc.exists()) {
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        fullName: "System Admin",
        email: user.email?.toLowerCase() ?? ADMIN_EMAIL,
        phone: "",
        role: "admin",
        subscription_status: "active",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );

    const adminDoc = await getDoc(doc(db, "users", user.uid));

    return {
      uid: user.uid,
      firebaseUser: user,
      profile: adminDoc.data(),
    };
  }

  if (!userDoc.exists()) {
    await signOut(auth);
    throw new Error(
      "Your account is missing a user profile. Please register again or ask admin to restore your profile."
    );
  }

  const profile = userDoc.data();
  const normalizedRole = String(profile.role ?? "").toLowerCase();

  if (
    normalizedRole === "buyer" ||
    normalizedRole === "seller" ||
    normalizedRole === "admin"
  ) {
    const subscriptionStatus =
      profile.subscription_status ??
      (normalizedRole === "seller" ? "inactive" : "active");

    if (
      profile.role !== normalizedRole ||
      profile.subscription_status !== subscriptionStatus
    ) {
      await setDoc(
        doc(db, "users", user.uid),
        {
          role: normalizedRole,
          subscription_status: subscriptionStatus,
          updated_at: serverTimestamp(),
        },
        { merge: true }
      );
    }
  }

  return {
    uid: user.uid,
    firebaseUser: user,
    profile: userDoc.data(),
  };
};

export const logoutUser = () => {
  return signOut(auth);
};

export const resetPassword = (email: string) => {
  return sendPasswordResetEmail(auth, email);
};
