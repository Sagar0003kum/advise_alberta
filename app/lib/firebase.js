import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ══════════════════════════════════════════════════════════════
// PASTE YOUR FIREBASE CONFIG BELOW
// Get it from: Firebase Console → Project Settings → Your apps
// ══════════════════════════════════════════════════════════════
const firebaseConfig = {
  apiKey: "AIzaSyCn4Mrh0407meu5VuKKwIAb4OkGuLofSs4",
  authDomain: "advise-alberta.firebaseapp.com",
  projectId: "advise-alberta",
  storageBucket: "advise-alberta.firebasestorage.app",
  messagingSenderId: "133707505017",
  appId: "1:133707505017:web:e33fcbdb671438453be3a8",
};

// Initialize Firebase (prevent duplicate initialization in dev)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;
