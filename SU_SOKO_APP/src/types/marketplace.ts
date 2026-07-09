import { Timestamp } from "firebase/firestore";

export const PRODUCT_CATEGORIES = [
  "household_items",
  "books",
  "electronics",
  "clothes",
  "shoes",
  "jewellery",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export type Category = ProductCategory;

export const PRODUCT_STATUSES = [
  "pending",
  "active",
  "sold",
  "deleted",
] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export type UserRole = "buyer" | "seller" | "admin";
export type SubscriptionStatus = "active" | "inactive";

export interface User {
  uid: string;
  role: UserRole;
  subscription_status: SubscriptionStatus;
  user_number?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
}

export interface Product {
  id: string;
  seller_id: string;
  title: string;
  category: ProductCategory;
  status: ProductStatus;
  created_at: Timestamp;
  description?: string;
  imageUrl?: string;
  price?: number;
  product_number?: number;
  sold_at?: Timestamp;
  sold_to?: string;
  updated_at?: Timestamp;
}

export type CreateProductListingInput = {
  title: string;
  category: ProductCategory;
  description?: string;
  imageUrl?: string;
  price?: number;
};

export interface Report {
  id: string;
  product_id: string;
  product_title?: string;
  reporter_id: string;
  reporter_name?: string;
  seller_id?: string;
  seller_name?: string;
  reason: string;
  status: "pending" | "reviewed" | "dismissed";
  created_at: Timestamp;
}

export interface Message {
  id: string;
  product_id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  created_at: Timestamp;
  read: boolean;
}

export interface ProductReview {
  id: string;
  product_id: string;
  product_title: string;
  seller_id: string;
  buyer_id: string;
  buyer_name?: string;
  rating: 1 | 2 | 3;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export const isCategory = (value: string): value is Category => {
  return PRODUCT_CATEGORIES.includes(value as Category);
};
