import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAvcmbmwaCLa_kQ5rzMMjWnPkiQLE0VYAI",
  authDomain: "su-soko-9d9ae.firebaseapp.com",
  projectId: "su-soko-9d9ae",
  storageBucket: "su-soko-9d9ae.firebasestorage.app",
  messagingSenderId: "961441274814",
  appId: "1:961441274814:web:cd8163a5de23de1363b7ef",
};

const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
