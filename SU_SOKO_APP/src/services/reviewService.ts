import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";
import { ProductReview } from "../types/marketplace";
import { getProductById, SellerProduct } from "./productService";
import { getUserProfileById } from "./userService";

export type ReviewRating = 1 | 2 | 3;

export const getRatingLabel = (rating: number) => {
  if (rating === 1) {
    return "Low quality";
  }

  if (rating === 2) {
    return "Okay quality";
  }

  return "High quality";
};

const requireCurrentUser = () => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User not logged in.");
  }

  return currentUser;
};

export const getBuyerReviewableProducts = async (): Promise<SellerProduct[]> => {
  const currentUser = requireCurrentUser();
  const snapshot = await getDocs(
    query(collection(db, "products"), where("sold_to", "==", currentUser.uid))
  );

  return snapshot.docs
    .map((productDoc) => ({
      id: productDoc.id,
      ...(productDoc.data() as Omit<SellerProduct, "id">),
    }))
    .filter((product) => product.status === "sold");
};

export const getBuyerReviews = async (): Promise<ProductReview[]> => {
  const currentUser = requireCurrentUser();
  const snapshot = await getDocs(
    query(collection(db, "reviews"), where("buyer_id", "==", currentUser.uid))
  );

  return snapshot.docs.map((reviewDoc) => ({
    id: reviewDoc.id,
    ...(reviewDoc.data() as Omit<ProductReview, "id">),
  }));
};

export const submitProductReview = async (
  productId: string,
  rating: ReviewRating
) => {
  const currentUser = requireCurrentUser();
  const product = await getProductById(productId);
  const buyer = await getUserProfileById(currentUser.uid).catch(() => null);

  if (product.status !== "sold" || product.sold_to !== currentUser.uid) {
    throw new Error("You can only review products you bought.");
  }

  if (!product.seller_id) {
    throw new Error("Seller information is missing.");
  }

  const reviewRef = doc(db, "reviews", `${productId}_${currentUser.uid}`);
  const existingReview = await getDoc(reviewRef);

  await setDoc(
    reviewRef,
    {
      product_id: productId,
      product_title: product.title ?? "Product",
      seller_id: product.seller_id,
      buyer_id: currentUser.uid,
      buyer_name: buyer?.fullName || buyer?.email || "Buyer",
      rating,
      created_at: existingReview.exists()
        ? existingReview.data().created_at ?? serverTimestamp()
        : serverTimestamp(),
      updated_at: serverTimestamp(),
    },
    { merge: true }
  );
};

export const getSellerReviews = async (): Promise<ProductReview[]> => {
  const currentUser = requireCurrentUser();
  const snapshot = await getDocs(
    query(collection(db, "reviews"), where("seller_id", "==", currentUser.uid))
  );

  return snapshot.docs
    .map((reviewDoc) => ({
      id: reviewDoc.id,
      ...(reviewDoc.data() as Omit<ProductReview, "id">),
    }))
    .sort((first, second) => {
      const firstTime = first.updated_at?.toMillis?.() ?? 0;
      const secondTime = second.updated_at?.toMillis?.() ?? 0;

      return secondTime - firstTime;
    });
};

export const getAllProductReviews = async (): Promise<ProductReview[]> => {
  const snapshot = await getDocs(collection(db, "reviews"));

  return snapshot.docs
    .map((reviewDoc) => ({
      id: reviewDoc.id,
      ...(reviewDoc.data() as Omit<ProductReview, "id">),
    }))
    .sort((first, second) => {
      const firstTime = first.updated_at?.toMillis?.() ?? 0;
      const secondTime = second.updated_at?.toMillis?.() ?? 0;

      return secondTime - firstTime;
    });
};
