import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";
import { Message } from "../types/marketplace";

export const sendMessage = async (
  productId: string,
  receiverId: string,
  body: string
) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User not logged in.");
  }

  if (!productId.trim()) {
    throw new Error("Product ID is required.");
  }

  if (!receiverId.trim()) {
    throw new Error("Receiver user ID is required.");
  }

  if (!body.trim()) {
    throw new Error("Message cannot be empty.");
  }

  await addDoc(collection(db, "messages"), {
    product_id: productId.trim(),
    sender_id: currentUser.uid,
    receiver_id: receiverId.trim(),
    body: body.trim(),
    read: false,
    created_at: serverTimestamp(),
  });
};

export const getMyMessages = async (): Promise<Message[]> => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User not logged in.");
  }

  const received = await getDocs(
    query(collection(db, "messages"), where("receiver_id", "==", currentUser.uid))
  );

  const sent = await getDocs(
    query(collection(db, "messages"), where("sender_id", "==", currentUser.uid))
  );

  return [...received.docs, ...sent.docs]
    .map((messageDoc) => ({
      id: messageDoc.id,
      ...(messageDoc.data() as Omit<Message, "id">),
    }))
    .sort((first, second) => {
      const firstTime = first.created_at?.toMillis?.() ?? 0;
      const secondTime = second.created_at?.toMillis?.() ?? 0;

      return secondTime - firstTime;
    });
};

export const getMessagesForProduct = async (
  productId: string
): Promise<Message[]> => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User not logged in.");
  }

  const snapshot = await getDocs(
    query(collection(db, "messages"), where("product_id", "==", productId))
  );

  return snapshot.docs
    .map((messageDoc) => ({
      id: messageDoc.id,
      ...(messageDoc.data() as Omit<Message, "id">),
    }))
    .filter(
      (message) =>
        message.sender_id === currentUser.uid ||
        message.receiver_id === currentUser.uid
    )
    .sort((first, second) => {
      const firstTime = first.created_at?.toMillis?.() ?? 0;
      const secondTime = second.created_at?.toMillis?.() ?? 0;

      return firstTime - secondTime;
    });
};
