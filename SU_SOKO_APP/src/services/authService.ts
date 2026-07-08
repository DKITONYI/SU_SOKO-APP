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
import { getNextUserNumber } from "./idService";

export const ADMIN_EMAIL = "admin@strathmore.edu";
export const LEGACY_ADMIN_EMAIL = "admin@stratmore.edu";
const ADMIN_TYPED_PASSWORD = "admin";
const ADMIN_FIREBASE_PASSWORD = "admin123";

export const isAdminEmail = (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  return normalizedEmail === ADMIN_EMAIL || normalizedEmail === LEGACY_ADMIN_EMAIL;
};

const normalizeRole = (role?: unknown): UserRole | null => {
  const normalizedRole = String(role ?? "").toLowerCase();

  if (
    normalizedRole === "buyer" ||
    normalizedRole === "seller" ||
    normalizedRole === "admin"
  ) {
    return normalizedRole;
  }

  return null;
};

const buildAdminProfile = (uid: string, email?: string | null) => ({
  uid,
  fullName: "System Admin",
  email: email?.toLowerCase() ?? ADMIN_EMAIL,
  phone: "",
  role: "admin" as const,
  subscription_status: "active" as const,
  updated_at: serverTimestamp(),
});

const buildFallbackBuyerProfile = (uid: string, email?: string | null) => ({
  uid,
  fullName: email?.split("@")[0] ?? "Buyer",
  email: email?.toLowerCase() ?? "",
  phone: "",
  role: "buyer" as const,
  subscription_status: "active" as const,
  created_at: serverTimestamp(),
  updated_at: serverTimestamp(),
});

const allocateUserNumber = async () => {
  return getNextUserNumber().catch((error) => {
    console.log("Failed to allocate user number:", error);
    return null;
  });
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
    const userNumber = await allocateUserNumber();

    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        ...(userNumber ? { user_number: userNumber } : {}),
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
  const adminLogin = isAdminEmail(normalizedEmail);
  const signInPassword =
    adminLogin && password === ADMIN_TYPED_PASSWORD
      ? ADMIN_FIREBASE_PASSWORD
      : password;

  if (adminLogin && password !== ADMIN_TYPED_PASSWORD) {
    throw new Error("Incorrect admin password.");
  }

  let userCredential;

  try {
    userCredential = await signInWithEmailAndPassword(
      auth,
      normalizedEmail,
      signInPassword
    );
  } catch (error: any) {
    if (adminLogin && password === ADMIN_TYPED_PASSWORD) {
      try {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          normalizedEmail,
          ADMIN_FIREBASE_PASSWORD
        );
      } catch (createError: any) {
        if (createError.code === "auth/email-already-in-use") {
          throw new Error(
            "The admin account already exists in Firebase Auth with a different password. Reset it to admin123 in Firebase Authentication, then login in the app using admin."
          );
        }

        throw createError;
      }
    } else {
      throw error;
    }
  }

  const user = userCredential.user;

  const userDoc = await getDoc(
    doc(db, "users", user.uid)
  );

  if (isAdminEmail(user.email ?? "")) {
    await setDoc(
      doc(db, "users", user.uid),
      {
        ...buildAdminProfile(user.uid, user.email),
        created_at: userDoc.exists()
          ? userDoc.data().created_at ?? serverTimestamp()
          : serverTimestamp(),
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
    const userNumber = await allocateUserNumber();

    await setDoc(
      doc(db, "users", user.uid),
      {
        ...buildFallbackBuyerProfile(user.uid, user.email),
        ...(userNumber ? { user_number: userNumber } : {}),
      },
      { merge: true }
    );

    const restoredDoc = await getDoc(doc(db, "users", user.uid));

    return {
      uid: user.uid,
      firebaseUser: user,
      profile: restoredDoc.data(),
    };
  }

  const profile = userDoc.data();
  const normalizedRole = normalizeRole(profile.role) ?? "buyer";
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

    const normalizedDoc = await getDoc(doc(db, "users", user.uid));

    return {
      uid: user.uid,
      firebaseUser: user,
      profile: normalizedDoc.data(),
    };
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
