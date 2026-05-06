import { ProgramResult } from "../types";
"use client";
import { findInstitution } from "../lib/data";

interface CompareModalProps { programs: ProgramResult[]; onClose: () => void; }
export default function CompareModal({ programs, onClose }: CompareModalProps) {
  if (!programs || programs.length < 2) return null;

  const rows = [
    { label: "Institution", key: "institution", format: (v, p) => {
      const inst = findInstitution(p.institution);
      return { text: p.institution, sub: inst?.city || "", color: inst?.color };
    }},
    { label: "Credential", key: "credential" },
    { label: "Duration", key: "duration" },
    { label: "Domestic Tuition", key: "tuition_domestic", highlight: true },
    { label: "International Tuition", key: "tuition_international", highlight: true },
    { label: "Intake", key: "intake" },
    { label: "Semesters", key: "semester_structure" },
    { label: "Verified", key: "verified", format: (v) => v ? "✓ Verified" : "AI Sourced" },
  ];

  // Try to find cheapest domestic tuition for highlighting
  function extractNumber(str: string | undefined): number {
    if (!str) return Infinity;
    const match = str.replace(/,/g, "").match(/\$?([\d.]+)/);
    return match ? parseFloat(match[1]) : Infinity;
  }

  const domesticPrices = programs.map(p => extractNumber(p.tuition_domestic));
  const cheapestDomestic = Math.min(...domesticPrices);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-[1000px] mx-4 my-8 sm:my-12 bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 border-b border-surface-200" style={{ background: "linear-gradient(135deg, #0D9488, #0891B2)" }}>
          <div>
            <h2 className="font-display font-bold text-lg sm:text-xl text-white">
              Compare Programs
            </h2>
            <p className="font-body text-xs sm:text-sm text-white/70 mt-0.5">
              {programs.length} programs side by side
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Program names header row */}
        <div className="grid border-b border-surface-200" style={{ gridTemplateColumns: `160px repeat(${programs.length}, 1fr)` }}>
          <div className="px-4 sm:px-5 py-3 sm:py-4 bg-surface-50">
            <span className="text-[11px] font-body font-semibold uppercase tracking-widest text-slate-400">
              Program
            </span>
          </div>
          {programs.map((p, i) => {
            const inst = findInstitution(p.institution);
            return (
              <div key={i} className="px-4 sm:px-5 py-3 sm:py-4 border-l border-surface-200">
                <h3 className="font-display font-bold text-sm sm:text-base text-slate-800 leading-tight mb-1">
                  {p.program_name}
                </h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: inst?.color || "#0D9488" }} />
                  <span className="text-[11px] sm:text-xs font-body text-slate-400">
                    {inst?.name || p.institution}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison rows */}
        {rows.map((row, ri) => (
          <div
            key={row.key}
            className="grid border-b border-surface-100"
            style={{ gridTemplateColumns: `160px repeat(${programs.length}, 1fr)` }}
          >
            {/* Label */}
            <div className={`px-4 sm:px-5 py-3 sm:py-4 flex items-center ${ri % 2 === 0 ? "bg-surface-50" : "bg-white"}`}>
              <span className="text-[11px] sm:text-xs font-body font-semibold uppercase tracking-wider text-slate-400">
                {row.label}
              </span>
            </div>

            {/* Values */}
            {programs.map((p, pi) => {
              let content;
              let extraClass = "";

              if (row.format) {
                const formatted = row.format(p[row.key], p);
                if (typeof formatted === "object" && formatted.text) {
                  content = (
                    <div>
                      <div className="flex items-center gap-1.5">
                        {formatted.color && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: formatted.color }} />}
                        <span className="font-display font-semibold text-sm text-slate-700">{formatted.text}</span>
                      </div>
                      {formatted.sub && <span className="text-[11px] font-body text-slate-400 ml-3.5">{formatted.sub}</span>}
                    </div>
                  );
                } else {
                  content = (
                    <span className={`text-sm font-body ${formatted === "✓ Verified" ? "text-emerald-500 font-semibold" : "text-slate-500"}`}>
                      {formatted}
                    </span>
                  );
                }
              } else {
                const value = p[row.key] || "—";
                const isCheapest = row.key === "tuition_domestic" && extractNumber(p.tuition_domestic) === cheapestDomestic && cheapestDomestic !== Infinity;

                content = (
                  <div>
                    <span className={`text-sm font-body ${row.highlight ? "font-display font-bold" : ""} ${isCheapest ? "text-emerald-600" : row.highlight ? "text-primary" : "text-slate-600"}`}>
                      {value}
                    </span>
                    {isCheapest && (
                      <span className="ml-2 text-[10px] font-body font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">
                        LOWEST
                      </span>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={pi}
                  className={`px-4 sm:px-5 py-3 sm:py-4 border-l border-surface-100 ${ri % 2 === 0 ? "bg-surface-50/50" : "bg-white"}`}
                >
                  {content}
                </div>
              );
            })}
          </div>
        ))}

        {/* Footer */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 bg-surface-50 flex items-center justify-between flex-wrap gap-3">
          <p className="text-[11px] sm:text-xs font-body text-slate-400">
            ⓘ Always verify fees directly with the institution before applying.
          </p>
          <button
            onClick={onClose}
            className="font-display font-bold text-xs sm:text-sm text-white rounded-lg px-5 py-2 transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #0D9488, #0891B2)" }}
          >
            Close comparison
          </button>
        </div>
      </div>
    </div>
  );
}
