import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDn3xCSu5fh_hYcZNXSsYuG4mdHsfST7c4",
  authDomain: "pronurse1.firebaseapp.com",
  projectId: "pronurse1",
  storageBucket: "pronurse1.firebasestorage.app",
  messagingSenderId: "1014206351110",
  appId: "1:1014206351110:web:86e7279d1dfebdb9ad4087",
  measurementId: "G-JK8ZEMVELN"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
