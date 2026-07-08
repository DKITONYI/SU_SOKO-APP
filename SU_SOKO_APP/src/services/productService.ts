import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";
import { getNextProductNumber } from "./idService";
import {
  Category,
  CreateProductListingInput,
  isCategory,
  Product,
  ProductStatus,
  User,
} from "../types/marketplace";

const requireCurrentUser = () => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User not logged in.");
  }

  return currentUser;
};

const getCurrentUserProfile = async () => {
  const currentUser = requireCurrentUser();
  const userSnapshot = await getDoc(doc(db, "users", currentUser.uid));

  if (!userSnapshot.exists()) {
    throw new Error("User profile not found.");
  }

  return {
    currentUser,
    profile: userSnapshot.data() as User,
  };
};

export const createProductListing = async (
  productData: CreateProductListingInput
) => {
  const { currentUser, profile } = await getCurrentUserProfile();
  const { title, price, category, description, imageUrl } = productData;

  if (!isCategory(category)) {
    throw new Error("Invalid product category.");
  }

  if (profile?.role !== "seller" || profile.subscription_status !== "active") {
    throw new Error(
      "Account disabled. Active subscription required to list products."
    );
  }

  const productNumber = await getNextProductNumber().catch((error) => {
    console.log("Failed to allocate product number:", error);
    return null;
  });

  return addDoc(collection(db, "products"), {
    title: title.trim(),
    price: Number(price ?? 0),
    category,
    description: description?.trim() ?? "",
    imageUrl: imageUrl ?? "",
    seller_id: currentUser.uid,
    ...(productNumber ? { product_number: productNumber } : {}),
    status: "pending" satisfies ProductStatus,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
};

export const addProduct = async (
  title: string,
  price: string,
  category: Category,
  description: string,
  imageUrl?: string
) => {
  return createProductListing({
    title,
    price: Number(price),
    category,
    description,
    imageUrl,
  });
};

export type SellerProduct = Partial<Product> & { id: string };

export const getMyProducts = async (): Promise<SellerProduct[]> => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User not logged in.");
  }

  const snapshot = await getDocs(
    query(
      collection(db, "products"),
      where("seller_id", "==", currentUser.uid)
    )
  );

  return snapshot.docs.map((productDoc) => ({
    id: productDoc.id,
    ...(productDoc.data() as Omit<SellerProduct, "id">),
  }));
};

export const getActiveProducts = async (): Promise<SellerProduct[]> => {
  const snapshot = await getDocs(
    query(collection(db, "products"), where("status", "==", "active"), limit(30))
  );

  return snapshot.docs.map((productDoc) => ({
    id: productDoc.id,
    ...(productDoc.data() as Omit<SellerProduct, "id">),
  }));
};

export const getProductById = async (productId: string): Promise<SellerProduct> => {
  const productSnapshot = await getDoc(doc(db, "products", productId));

  if (!productSnapshot.exists()) {
    throw new Error("Product not found.");
  }

  return {
    id: productSnapshot.id,
    ...(productSnapshot.data() as Omit<SellerProduct, "id">),
  };
};

export const searchActiveProducts = async (
  keyword: string,
  category?: Category | "all"
): Promise<SellerProduct[]> => {
  const filters = [where("status", "==", "active")];

  if (category && category !== "all") {
    filters.push(where("category", "==", category));
  }

  const snapshot = await getDocs(
    query(collection(db, "products"), ...filters, limit(50))
  );
  const normalizedKeyword = keyword.trim().toLowerCase();

  return snapshot.docs
    .map((productDoc) => ({
      id: productDoc.id,
      ...(productDoc.data() as Omit<SellerProduct, "id">),
    }))
    .filter((product) => {
      if (!normalizedKeyword) {
        return true;
      }

      return (
        product.title?.toLowerCase().includes(normalizedKeyword) ||
        product.description?.toLowerCase().includes(normalizedKeyword) ||
        product.category?.toLowerCase().includes(normalizedKeyword)
      );
    });
};

export const getPendingProducts = async (): Promise<SellerProduct[]> => {
  const snapshot = await getDocs(
    query(collection(db, "products"), where("status", "==", "pending"))
  );

  return snapshot.docs.map((productDoc) => ({
    id: productDoc.id,
    ...(productDoc.data() as Omit<SellerProduct, "id">),
  }));
};

export const adminApproveProduct = async (productId: string) => {
  const { profile } = await getCurrentUserProfile();

  if (profile.role !== "admin") {
    throw new Error("Only admins can approve products.");
  }

  const productRef = doc(db, "products", productId);
  const productSnapshot = await getDoc(productRef);

  if (!productSnapshot.exists()) {
    throw new Error("Product not found.");
  }

  const product = productSnapshot.data() as Product;

  if (product.status !== "pending") {
    throw new Error("Only pending products can be approved.");
  }

  await updateDoc(productRef, {
    status: "active" satisfies ProductStatus,
    updated_at: serverTimestamp(),
  });
};

export const approveProduct = async (productId: string) => {
  return adminApproveProduct(productId);
};

export const rejectProduct = async (productId: string, reason: string) => {
  await updateDoc(doc(db, "products", productId), {
    status: "deleted" satisfies ProductStatus,
    rejection_reason: reason,
    updated_at: serverTimestamp(),
  });
};

export const markProductSold = async (productId: string) => {
  await updateDoc(doc(db, "products", productId), {
    status: "sold" satisfies ProductStatus,
    updated_at: serverTimestamp(),
  });
};
