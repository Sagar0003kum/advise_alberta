"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { auth, googleProvider, db } from "../lib/firebase";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext<any>(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Handle redirect result on page load
  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      console.error("Redirect result error:", err);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData: any = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: "user",
        };

        // Save/update user in Firestore and fetch role
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              ...userData,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              savedPrograms: [],
              emailAlerts: false,
            });
          } else {
            const existingData = userSnap.data();
            userData.role = existingData.role || "user";
            await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
          }
        } catch (e) {
          console.error("Firestore user save error:", e);
        }

        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function loginWithGoogle() {
    try {
      // Try popup first
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Popup login error:", error?.code, error?.message);

      // If popup was blocked or closed, fall back to redirect
      if (
        error?.code === "auth/popup-blocked" ||
        error?.code === "auth/popup-closed-by-user" ||
        error?.code === "auth/cancelled-popup-request"
      ) {
        console.log("Popup failed, falling back to redirect...");
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      // If unauthorized domain, show a helpful message
      if (error?.code === "auth/unauthorized-domain") {
        alert(
          "This domain is not authorized for sign-in. Please add it to Firebase Console → Authentication → Settings → Authorized domains."
        );
        return;
      }

      // For any other error, try redirect as fallback
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectError) {
        console.error("Redirect login also failed:", redirectError);
        throw redirectError;
      }
    }
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
