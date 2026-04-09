"use client";
import { useState, useEffect } from "react";
import { findInstitution } from "../lib/data";

export interface SearchResult {
  program_name: string;
  institution: string;
  credential?: string | null;
  duration?: string | null;
  tuition_domestic?: string | null;
  tuition_international?: string | null;
  intake?: string | null;
  semester_structure?: string | null;
  match_reason?: string | null;
  source_url?: string | null;
  verified?: boolean;
}

interface ResultCardProps {
  result: SearchResult;
  index: number;
  onViewDetail: () => void;
}

type UrlStatus = "checking" | "direct" | "search";

export default function ResultCard({ result, index, onViewDetail }: ResultCardProps) {
  const [hovered, setHovered] = useState(false);
  const inst = findInstitution(result.institution);
  const accent = inst?.color ?? "#0D9488";

  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [urlStatus, setUrlStatus] = useState<UrlStatus>("checking");

  useEffect(() => {
    const fallbackUrl = buildGoogleSearchUrl(result.program_name, result.institution, inst?.website);
    const aiUrl = result.source_url;

    if (!aiUrl || !aiUrl.startsWith("http")) {
      setVerifyUrl(fallbackUrl);
      setUrlStatus("search");
      return;
    }

    let cancelled = false;

    async function validateUrl() {
      try {
        const res = await fetch("/api/validate-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: aiUrl }),
        });
        const data = await res.json() as { valid: boolean };

        if (cancelled) return;

        if (data.valid) {
          setVerifyUrl(aiUrl!);
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

      {/* Buttons row */}
      <div className="flex items-center gap-2.5 flex-wrap">
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
            href={verifyUrl ?? "#"}
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

function buildGoogleSearchUrl(
  programName: string,
  institution: string,
  website?: string
): string {
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

interface InfoBoxProps {
  label: string;
  value: string;
  accent: string;
}

function InfoBox({ label, value, accent }: InfoBoxProps) {
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