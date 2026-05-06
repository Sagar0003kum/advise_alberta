import { ProgramResult } from "../types";
"use client";
import { useState } from "react";

// Common Alberta post-secondary deadlines (approximate — varies by program)
const DEADLINE_DATA = {
  "Fall 2026": { date: "2026-09-01", applyBy: "2026-06-01", label: "Fall 2026" },
  "Winter 2027": { date: "2027-01-06", applyBy: "2026-10-01", label: "Winter 2027" },
  "Spring 2027": { date: "2027-05-05", applyBy: "2027-02-01", label: "Spring 2027" },
  "Fall 2027": { date: "2027-09-01", applyBy: "2027-06-01", label: "Fall 2027" },
};

function getDaysUntil(dateStr) {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getIntakeDeadlines(intake) {
  if (!intake) return [];
  const lower = intake.toLowerCase();
  const deadlines = [];

  if (lower.includes("september") || lower.includes("fall")) {
    deadlines.push({ ...DEADLINE_DATA["Fall 2026"], type: "fall" });
  }
  if (lower.includes("january") || lower.includes("winter")) {
    deadlines.push({ ...DEADLINE_DATA["Winter 2027"], type: "winter" });
  }
  if (lower.includes("may") || lower.includes("spring")) {
    deadlines.push({ ...DEADLINE_DATA["Spring 2027"], type: "spring" });
  }

  return deadlines.filter((d) => getDaysUntil(d.applyBy) > -30); // Show up to 30 days past
}

interface DeadlineTrackerProps { result: ProgramResult; onClose: () => void; }
export default function DeadlineTracker({ result, onClose }: DeadlineTrackerProps) {
  const deadlines = getIntakeDeadlines(result?.intake);
  const [showAll, setShowAll] = useState(false);

  const applyAlbertaUrl = `https://applyalberta.ca`;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-[500px] mx-4 my-8 bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-slide-up">

        {/* Header */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-surface-200" style={{ background: "linear-gradient(135deg, #F59E0B, #F97316)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg text-white">Application Deadlines</h2>
              <p className="font-body text-xs text-white/80 mt-0.5">{result?.program_name}</p>
              <p className="font-body text-[11px] text-white/60">{result?.institution}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="px-5 sm:px-6 py-5 space-y-4">

          {deadlines.length > 0 ? (
            deadlines.map((d, i) => {
              const daysUntilApply = getDaysUntil(d.applyBy);
              const daysUntilStart = getDaysUntil(d.date);
              const isPast = daysUntilApply < 0;
              const isUrgent = daysUntilApply > 0 && daysUntilApply <= 30;
              const isSoon = daysUntilApply > 30 && daysUntilApply <= 90;

              return (
                <div key={i} className={`border rounded-xl overflow-hidden ${isPast ? "border-surface-200 opacity-60" : isUrgent ? "border-red-200" : "border-surface-200"}`}>
                  {/* Deadline header */}
                  <div className={`px-4 py-3 flex items-center justify-between ${isPast ? "bg-surface-50" : isUrgent ? "bg-red-50" : isSoon ? "bg-amber-50" : "bg-emerald-50"}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${isPast ? "bg-slate-300" : isUrgent ? "bg-red-400 animate-pulse" : isSoon ? "bg-amber-400" : "bg-emerald-400"}`} />
                      <span className="font-display font-bold text-sm text-slate-800">{d.label}</span>
                    </div>
                    {!isPast && (
                      <span className={`text-xs font-body font-bold px-2 py-0.5 rounded-full ${isUrgent ? "bg-red-100 text-red-600" : isSoon ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-600"}`}>
                        {daysUntilApply} days left
                      </span>
                    )}
                    {isPast && (
                      <span className="text-xs font-body font-medium text-slate-400">Deadline passed</span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-body text-slate-500">Apply by</span>
                      <span className={`text-sm font-body font-semibold ${isPast ? "text-slate-400 line-through" : isUrgent ? "text-red-600" : "text-slate-700"}`}>
                        {new Date(d.applyBy).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-body text-slate-500">Classes start</span>
                      <span className="text-sm font-body font-medium text-slate-600">
                        {new Date(d.date).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}
                      </span>
                    </div>

                    {/* Progress bar */}
                    {!isPast && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isUrgent ? "bg-red-400" : isSoon ? "bg-amber-400" : "bg-emerald-400"}`}
                            style={{ width: `${Math.max(5, Math.min(100, 100 - (daysUntilApply / 180) * 100))}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-400 font-body">
              <p className="text-sm mb-1">No upcoming deadlines found</p>
              <p className="text-xs">Check the institution website for current intake dates.</p>
            </div>
          )}

          {/* Apply Now button */}
          <a
            href={applyAlbertaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-display font-bold text-sm text-white transition-all hover:brightness-110 hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, #F59E0B, #F97316)" }}
          >
            Apply Now on ApplyAlberta →
          </a>

          <p className="text-[11px] font-body text-slate-400 text-center">
            ⓘ Deadlines shown are approximate. Some programs have earlier deadlines or rolling admissions. Always check the institution website for exact dates.
          </p>
        </div>
      </div>
    </div>
  );
}
