"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { auth, googleProvider, db } from "../lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext<any>(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
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
            // Fetch existing role from Firestore
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
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
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