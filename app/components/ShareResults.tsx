import { ProgramResult } from "../types";
"use client";
import { useState } from "react";

interface ShareResultsProps { query: string; results: ProgramResult[] | null; }
export default function ShareResults({ query, results }: ShareResultsProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!results || results.length === 0) return null;

  // Build shareable text
  const shareText = `Check out these ${results.length} programs I found on AdviseAlberta for "${query}":\n\n` +
    results.slice(0, 5).map((r, i) =>
      `${i + 1}. ${r.program_name} — ${r.institution} (${r.tuition_domestic || "See website"})`
    ).join("\n") +
    (results.length > 5 ? `\n...and ${results.length - 5} more` : "") +
    `\n\nSearch at: ${typeof window !== "undefined" ? window.location.origin : "advisealberta.com"}`;

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";

  function copyToClipboard() {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  }

  function shareEmail() {
    const subject = encodeURIComponent(`Programs found on AdviseAlberta: "${query}"`);
    const body = encodeURIComponent(shareText);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="inline-flex items-center gap-1.5 text-sm font-body font-semibold text-slate-500 hover:text-primary transition-colors px-3 py-1.5 rounded-lg border border-surface-200 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:text-primary-light hover:border-primary/30"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share
      </button>

      {showPanel && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 border border-surface-200 dark:border-slate-600 rounded-xl shadow-lg z-30 overflow-hidden animate-fade-slide-up">
          {/* Copy link */}
          <button
            onClick={copyToClipboard}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-body text-slate-600 dark:text-slate-300 hover:bg-surface-50 dark:hover:bg-slate-700 transition-colors text-left"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {copied ? "Copied!" : "Copy results"}
            {copied && <span className="ml-auto text-emerald-500 text-xs font-semibold">✓</span>}
          </button>

          {/* WhatsApp */}
          <button
            onClick={shareWhatsApp}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-body text-slate-600 dark:text-slate-300 hover:bg-surface-50 dark:hover:bg-slate-700 transition-colors text-left border-t border-surface-100 dark:border-slate-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Share via WhatsApp
          </button>

          {/* Email */}
          <button
            onClick={shareEmail}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-body text-slate-600 dark:text-slate-300 hover:bg-surface-50 dark:hover:bg-slate-700 transition-colors text-left border-t border-surface-100 dark:border-slate-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Share via Email
          </button>

          {/* Close */}
          <button
            onClick={() => setShowPanel(false)}
            className="w-full text-center py-2 text-xs font-body text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border-t border-surface-100 dark:border-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
