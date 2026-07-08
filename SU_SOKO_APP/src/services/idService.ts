import { doc, runTransaction, serverTimestamp } from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

const padUserNumber = (value: number) => value.toString().padStart(3, "0");

const nextCounterValue = async (counterName: "users" | "products") => {
  const counterRef = doc(db, "counters", counterName);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(counterRef);
    const currentValue = snapshot.exists()
      ? Number(snapshot.data().current ?? 0)
      : 0;
    const nextValue = currentValue + 1;

    transaction.set(
      counterRef,
      {
        current: nextValue,
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );

    return nextValue;
  });
};

export const getNextUserNumber = async () => {
  const nextValue = await nextCounterValue("users");

  return padUserNumber(nextValue);
};

export const getNextProductNumber = async () => {
  return nextCounterValue("products");
};
