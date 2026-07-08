import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";
import { ADMIN_EMAIL, isAdminEmail } from "../services/authService";
import { SubscriptionStatus, UserRole } from "../types/marketplace";

export type UserProfile = {
  uid: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  subscription_status?: SubscriptionStatus;
};

const normalizeRole = (role?: string): UserRole | null => {
  const normalizedRole = role?.toLowerCase();

  if (
    normalizedRole === "buyer" ||
    normalizedRole === "seller" ||
    normalizedRole === "admin"
  ) {
    return normalizedRole;
  }

  return null;
};

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;
    let unsubscribeProfile: (() => void) | undefined;
    let mounted = true;

    const watchAuthState = () => onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) {
        return;
      }

      setUser(firebaseUser);
      unsubscribeProfile?.();
      unsubscribeProfile = undefined;

      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      unsubscribeProfile = onSnapshot(
        doc(db, "users", firebaseUser.uid),
        (profileSnapshot) => {
          if (!mounted) {
            return;
          }

          if (profileSnapshot.exists()) {
            const profileData = profileSnapshot.data() as Omit<UserProfile, "uid">;
            const normalizedRole = normalizeRole(profileData.role);
            const subscriptionStatus =
              profileData.subscription_status ??
              (normalizedRole === "seller" ? "inactive" : "active");

            if (
              normalizedRole &&
              (profileData.role !== normalizedRole ||
                profileData.subscription_status !== subscriptionStatus)
            ) {
              setDoc(
                doc(db, "users", firebaseUser.uid),
                {
                  role: normalizedRole,
                  subscription_status: subscriptionStatus,
                  updated_at: serverTimestamp(),
                },
                { merge: true }
              ).catch((error) => {
                console.log("Failed to normalize user profile:", error);
              });
            }

            setProfile({
              uid: firebaseUser.uid,
              ...profileData,
              role: normalizedRole ?? undefined,
              subscription_status: subscriptionStatus,
            });
          } else if (isAdminEmail(firebaseUser.email ?? "")) {
            setDoc(
              doc(db, "users", firebaseUser.uid),
              {
                uid: firebaseUser.uid,
                fullName: "System Admin",
                email: firebaseUser.email?.toLowerCase() ?? ADMIN_EMAIL,
                phone: "",
                role: "admin",
                subscription_status: "active",
                created_at: serverTimestamp(),
                updated_at: serverTimestamp(),
              },
              { merge: true }
            ).catch((error) => {
              console.log("Failed to create admin profile:", error);
            });
          } else {
            setProfile(null);
          }

          setLoading(false);
        },
        (error) => {
          console.log("Failed to load user profile:", error);
          setProfile(null);
          setLoading(false);
        }
      );
    });

    unsubscribeAuth = watchAuthState();

    return () => {
      mounted = false;
      unsubscribeProfile?.();
      unsubscribeAuth?.();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      role: profile?.role ?? null,
      loading,
    }),
    [loading, profile, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
};
