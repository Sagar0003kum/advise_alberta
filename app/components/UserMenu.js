"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "./AuthProvider";

export default function UserMenu({ onOpenProfile }) {
  const { user, loading, loginWithGoogle, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-surface-200 dark:bg-slate-700 animate-pulse" />;
  }

  if (!user) {
    return (
      <button
        onClick={loginWithGoogle}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-body font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-surface-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary/30 hover:text-primary dark:hover:text-primary-light transition-all"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span className="hidden sm:inline">Sign in</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-surface-100 dark:hover:bg-slate-700 transition-colors"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-primary/30" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center text-white font-display font-bold text-xs">
            {user.displayName?.[0] || "U"}
          </div>
        )}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 border border-surface-200 dark:border-slate-600 rounded-xl shadow-lg z-40 overflow-hidden animate-fade-slide-up">
          {/* User info */}
          <div className="px-4 py-3 border-b border-surface-100 dark:border-slate-700">
            <p className="font-display font-bold text-sm text-slate-800 dark:text-white truncate">{user.displayName}</p>
            <p className="font-body text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
          </div>

          {/* My Profile & Scholarships */}
          <button
            onClick={() => { onOpenProfile?.(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-slate-600 dark:text-slate-300 hover:bg-surface-50 dark:hover:bg-slate-700 transition-colors text-left"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            My Profile & Scholarships
          </button>

          {/* Admin — admin only */}
          {user.role === "admin" && (
            <a href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm font-body text-slate-600 dark:text-slate-300 hover:bg-surface-50 dark:hover:bg-slate-700 transition-colors border-t border-surface-100 dark:border-slate-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              Admin Dashboard
            </a>
          )}

          {/* Sign out */}
          <button
            onClick={() => { logout(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-surface-100 dark:border-slate-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}