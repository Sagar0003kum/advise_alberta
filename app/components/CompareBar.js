"use client";
import { findInstitution } from "../lib/data";

export default function CompareBar({ compareList, onRemove, onCompare, onClear }) {
  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 animate-fade-slide-up">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 pb-4">
        <div
          className="rounded-xl p-3 sm:p-4 flex items-center gap-3 flex-wrap"
          style={{
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 -4px 24px rgba(0,0,0,0.15)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* Selected program pills */}
          <div className="flex items-center gap-2 flex-1 flex-wrap min-w-0">
            <span className="text-[11px] sm:text-xs font-body font-semibold text-white/50 uppercase tracking-wider whitespace-nowrap">
              Compare ({compareList.length}/3):
            </span>
            {compareList.map((program, i) => {
              const inst = findInstitution(program.institution);
              return (
                <div
                  key={i}
                  className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1.5 max-w-[200px]"
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: inst?.color || "#0D9488" }}
                  />
                  <span className="text-[11px] sm:text-xs font-body text-white/80 truncate">
                    {program.program_name}
                  </span>
                  <button
                    onClick={() => onRemove(i)}
                    className="text-white/40 hover:text-white/80 transition-colors ml-0.5 flex-shrink-0"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClear}
              className="text-[11px] sm:text-xs font-body font-medium text-white/40 hover:text-white/70 transition-colors px-2 py-1"
            >
              Clear
            </button>
            <button
              onClick={onCompare}
              disabled={compareList.length < 2}
              className="font-display font-bold text-xs sm:text-sm text-white rounded-lg px-4 sm:px-6 py-2 whitespace-nowrap transition-all duration-200 disabled:opacity-30 hover:brightness-110"
              style={{
                background: compareList.length >= 2
                  ? "linear-gradient(135deg, #F59E0B, #F97316)"
                  : "rgba(255,255,255,0.1)",
              }}
            >
              Compare {compareList.length >= 2 ? "→" : `(need ${2 - compareList.length} more)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
