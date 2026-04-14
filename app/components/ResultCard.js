"use client";
import { useState, useEffect } from "react";
import { findInstitution } from "../lib/data";

export default function ResultCard({ result, index, onViewDetail, isCompared, onToggleCompare, compareCount, onCalculator, onDeadline, onCareer }) {
  const [hovered, setHovered] = useState(false);
  const inst = findInstitution(result.institution);
  const accent = inst?.color || "#0D9488";

  // ── Smart URL validation state ────────────────────────────────────
  const [verifyUrl, setVerifyUrl] = useState(null);
  const [urlStatus, setUrlStatus] = useState("checking"); // "checking" | "direct" | "search"

  useEffect(() => {
    const fallbackUrl = buildGoogleSearchUrl(result.program_name, result.institution, inst?.website);
    const aiUrl = result.source_url;

    // If no AI URL provided, go straight to Google search fallback
    if (!aiUrl || !aiUrl.startsWith("http")) {
      setVerifyUrl(fallbackUrl);
      setUrlStatus("search");
      return;
    }

    // Validate the AI-generated URL via our backend
    let cancelled = false;

    async function validateUrl() {
      try {
        const res = await fetch("/api/validate-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: aiUrl }),
        });
        const data = await res.json();

        if (cancelled) return;

        if (data.valid) {
          setVerifyUrl(aiUrl);
          setUrlStatus("direct");
        } else {
          setVerifyUrl(fallbackUrl);
          setUrlStatus("search");
        }
      } catch {
        if (cancelled) return;
        setVerifyUrl(fallbackUrl);
        setUrlStatus("search");
      }
    }

    validateUrl();

    return () => { cancelled = true; };
  }, [result.source_url, result.program_name, result.institution, inst?.website]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-xl p-5 sm:p-6 transition-all duration-300 cursor-default bg-white"
      style={{
        border: `1px solid ${hovered ? accent + "40" : "#E2E8F0"}`,
        boxShadow: hovered
          ? `0 8px 24px ${accent}10, 0 2px 6px rgba(0,0,0,0.04)`
          : "0 1px 3px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        animationDelay: `${index * 0.08}s`,
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3 mb-1.5">
        <h3 className="font-display text-lg sm:text-xl font-semibold text-slate-800 leading-tight flex-1 min-w-0">
          {result.program_name}
        </h3>
        {result.credential && (
          <span className="self-start text-[11px] font-bold font-body uppercase tracking-wider whitespace-nowrap px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
            {result.credential}
          </span>
        )}
      </div>

      {/* Institution */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: accent }} />
        <span className="font-body text-sm text-slate-500 font-medium">
          {result.institution}
          {inst?.city && ` · ${inst.city}`}
        </span>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
        {result.tuition_domestic && (
          <InfoBox label="Domestic Tuition" value={result.tuition_domestic} accent="#0D9488" />
        )}
        {result.tuition_international && (
          <InfoBox label="International Tuition" value={result.tuition_international} accent="#0891B2" />
        )}
        {result.duration && (
          <InfoBox label="Duration" value={result.duration} accent="#334155" />
        )}
      </div>

      {/* Extra details */}
      {(result.intake || result.semester_structure) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
          {result.intake && (
            <p className="text-[13px] font-body text-slate-400">
              <span className="font-semibold text-slate-500">Intake: </span>
              {result.intake}
            </p>
          )}
          {result.semester_structure && (
            <p className="text-[13px] font-body text-slate-400">
              <span className="font-semibold text-slate-500">Semesters: </span>
              {result.semester_structure}
            </p>
          )}
        </div>
      )}

      {/* Match reason */}
      {result.match_reason && (
        <p className="text-[13px] font-body italic text-slate-400 mb-4 leading-relaxed">
          {result.match_reason}
        </p>
      )}

      {/* ── Buttons row ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 flex-wrap">

        {/* Compare checkbox */}
        <button
          onClick={onToggleCompare}
          disabled={!isCompared && compareCount >= 3}
          className={`inline-flex items-center gap-1.5 text-[13px] font-body font-semibold px-3 py-2 rounded-lg border transition-all duration-200 ${
            isCompared
              ? "bg-amber-50 border-amber-300 text-amber-700"
              : compareCount >= 3
              ? "bg-surface-50 border-surface-200 text-slate-300 cursor-not-allowed"
              : "bg-surface-50 border-surface-200 text-slate-500 hover:border-amber-300 hover:text-amber-600"
          }`}
        >
          {isCompared ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="3" fill="#F59E0B" stroke="#F59E0B" />
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="3" />
            </svg>
          )}
          {isCompared ? "Selected" : "Compare"}
        </button>

        {/* View full details button */}
        <button
          onClick={onViewDetail}
          className="inline-flex items-center gap-1.5 text-[13px] font-body font-semibold px-4 py-2 rounded-lg border transition-all duration-200 hover:shadow-md"
          style={{
            color: accent,
            borderColor: accent + "40",
            background: accent + "08",
          }}
        >
          View full details →
        </button>

        {/* Calculator button */}
        <button
          onClick={onCalculator}
          className="inline-flex items-center gap-1.5 text-[13px] font-body font-semibold px-3 py-2 rounded-lg border border-surface-200 text-slate-500 hover:text-primary hover:border-primary/30 bg-white transition-all"
          title="Tuition Calculator"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="8" y1="6" x2="16" y2="6" />
            <line x1="8" y1="10" x2="10" y2="10" />
            <line x1="14" y1="10" x2="16" y2="10" />
            <line x1="8" y1="14" x2="10" y2="14" />
            <line x1="14" y1="14" x2="16" y2="14" />
            <line x1="8" y1="18" x2="10" y2="18" />
            <line x1="14" y1="18" x2="16" y2="18" />
          </svg>
          <span className="hidden sm:inline">Cost Calculator</span>
        </button>

        {/* Deadline button */}
        <button
          onClick={onDeadline}
          className="inline-flex items-center gap-1.5 text-[13px] font-body font-semibold px-3 py-2 rounded-lg border border-surface-200 text-slate-500 hover:text-amber-600 hover:border-amber-300 bg-white transition-all"
          title="Application Deadlines"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="hidden sm:inline">Deadlines</span>
        </button>

        {/* Career Outcomes button */}
        <button
          onClick={onCareer}
          className="inline-flex items-center gap-1.5 text-[13px] font-body font-semibold px-3 py-2 rounded-lg border border-surface-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 bg-white transition-all"
          title="Career Outcomes"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
          </svg>
          <span className="hidden sm:inline">Career</span>
        </button>

        {/* Smart Verify Link */}
        {urlStatus === "checking" ? (
          <span className="inline-flex items-center gap-2 text-[13px] font-body font-semibold px-4 py-2 rounded-lg bg-surface-100 text-slate-400">
            <span
              className="w-3 h-3 rounded-full border-2 border-slate-200 animate-spin"
              style={{ borderTopColor: "#94A3B8" }}
            />
            Verifying link...
          </span>
        ) : (
          <a
            href={verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] font-body font-semibold no-underline px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md text-white"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accent}CC)`,
            }}
          >
            {urlStatus === "direct" ? "View on official website →" : "Find on official website →"}
          </a>
        )}

        {/* Status badge */}
        {urlStatus === "direct" && (
          <span className="inline-flex items-center gap-1 text-[11px] font-body font-medium text-emerald-500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Direct link verified
          </span>
        )}
        {urlStatus === "search" && (
          <span className="inline-flex items-center gap-1 text-[11px] font-body font-medium text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            Via Google search
          </span>
        )}
      </div>
    </div>
  );
}

function buildGoogleSearchUrl(programName, institution, website) {
  let domain = "";
  if (website) {
    try {
      const url = new URL(website);
      domain = url.hostname.replace(/^www\./, "");
    } catch {
      domain = website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
    }
  }
  const searchQuery = domain
    ? `${programName} ${institution} site:${domain}`
    : `${programName} ${institution} Alberta`;
  return `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
}

function InfoBox({ label, value, accent }) {
  return (
    <div className="bg-surface-50 border border-surface-200 rounded-lg px-3.5 py-2.5 sm:px-4 sm:py-3">
      <div className="text-[10px] font-body font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
        {label}
      </div>
      <div className="text-sm sm:text-base font-display font-bold" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}