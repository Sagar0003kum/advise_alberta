import { ProgramResult } from "../types";
"use client";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { db } from "../lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

interface EmailAlertsProps { query: string; results: ProgramResult[] | null; }
export default function EmailAlerts({ query, results }: EmailAlertsProps) {
  const { user, loginWithGoogle } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  if (!results || results.length === 0) return null;

  async function subscribe() {
    if (!user) {
      try {
        await loginWithGoogle();
      } catch { return; }
    }

    setLoading(true);
    try {
      const alertRef = doc(db, "alerts", `${user?.uid || "anon"}_${Date.now()}`);
      await setDoc(alertRef, {
        userId: user?.uid || null,
        email: user?.email || null,
        query: query,
        programs: results.slice(0, 10).map((r) => ({
          program_name: r.program_name,
          institution: r.institution,
          tuition_domestic: r.tuition_domestic,
        })),
        active: true,
        createdAt: serverTimestamp(),
        lastNotified: null,
      });
      setSubscribed(true);
    } catch (error) {
      console.error("Subscribe error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (subscribed) {
    return (
      <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl animate-fade-slide-up">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        <span className="font-body text-sm font-medium text-emerald-700 dark:text-emerald-300">
          Alert set! We'll notify you at {user?.email} when fees or intakes change.
        </span>
      </div>
    );
  }

  return (
    <div className="mt-4 animate-fade-slide-up">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all group"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span className="font-body text-sm font-semibold text-blue-700 dark:text-blue-300 group-hover:text-blue-800">
          Get notified when fees or intakes change
        </span>
      </button>

      {showPanel && (
        <div className="mt-2 p-4 bg-white dark:bg-slate-800 border border-surface-200 dark:border-slate-700 rounded-xl shadow-sm">
          <p className="font-body text-sm text-slate-600 dark:text-slate-300 mb-3">
            We'll email you when tuition fees change or new intakes open for programs matching "<strong>{query}</strong>".
          </p>

          <div className="space-y-2 mb-4">
            {results.slice(0, 3).map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-body text-slate-500 dark:text-slate-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                {r.program_name} — {r.institution}
              </div>
            ))}
            {results.length > 3 && (
              <span className="text-xs font-body text-slate-400 dark:text-slate-500">+{results.length - 3} more programs</span>
            )}
          </div>

          <button
            onClick={subscribe}
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-display font-bold text-sm text-white transition-all disabled:opacity-50 hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)" }}
          >
            {loading ? "Setting up..." : user ? "Enable Email Alerts" : "Sign in & Enable Alerts"}
          </button>

          <p className="text-[11px] font-body text-slate-400 dark:text-slate-500 mt-2 text-center">
            You can unsubscribe anytime from your account settings.
          </p>
        </div>
      )}
    </div>
  );
}
