"use client";
import { useState } from "react";
import { INSTITUTIONS } from "../lib/data";

const CITIES = [...new Set(INSTITUTIONS.map((i) => i.city))].sort();
const CREDENTIALS = ["Degree", "Diploma", "Certificate", "Graduate Degree", "Doctoral", "Transfer"];
const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "cheapest", label: "Cheapest first" },
  { value: "shortest", label: "Shortest duration" },
  { value: "alpha", label: "A → Z" },
];

function extractNumber(str) {
  if (!str) return Infinity;
  const match = str.replace(/,/g, "").match(/\$([\d.]+)/);
  return match ? parseFloat(match[1]) : Infinity;
}

function extractDurationMonths(str) {
  if (!str) return Infinity;
  const lower = str.toLowerCase();
  const yearMatch = lower.match(/([\d.]+)\s*year/);
  const monthMatch = lower.match(/([\d.]+)\s*month/);
  const weekMatch = lower.match(/([\d.]+)\s*week/);
  if (yearMatch) return parseFloat(yearMatch[1]) * 12;
  if (monthMatch) return parseFloat(monthMatch[1]);
  if (weekMatch) return parseFloat(weekMatch[1]) / 4;
  return Infinity;
}

export function applyFiltersAndSort(results, filters, sortBy) {
  let filtered = [...results];

  if (filters.city) {
    filtered = filtered.filter((r) => {
      const inst = INSTITUTIONS.find(
        (i) => r.institution?.toLowerCase().includes(i.name.toLowerCase()) || r.institution?.toLowerCase().includes(i.fullName.toLowerCase())
      );
      return inst?.city === filters.city;
    });
  }

  if (filters.credential) {
    filtered = filtered.filter((r) => r.credential?.toLowerCase().includes(filters.credential.toLowerCase()));
  }

  if (filters.maxTuition) {
    filtered = filtered.filter((r) => {
      const fee = extractNumber(r.tuition_domestic);
      return fee <= filters.maxTuition;
    });
  }

  if (sortBy === "cheapest") {
    filtered.sort((a, b) => extractNumber(a.tuition_domestic) - extractNumber(b.tuition_domestic));
  } else if (sortBy === "shortest") {
    filtered.sort((a, b) => extractDurationMonths(a.duration) - extractDurationMonths(b.duration));
  } else if (sortBy === "alpha") {
    filtered.sort((a, b) => (a.program_name || "").localeCompare(b.program_name || ""));
  }

  return filtered;
}

export default function FilterSort({ filters, setFilters, sortBy, setSortBy, resultCount, totalCount }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-4 animate-fade-slide-up">
      {/* Toggle bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-2 text-sm font-body font-semibold text-slate-600 hover:text-primary transition-colors px-3 py-1.5 rounded-lg border border-surface-200 bg-white hover:border-primary/30"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="14" y2="12" />
            <line x1="4" y1="18" x2="8" y2="18" />
          </svg>
          Filters {(filters.city || filters.credential || filters.maxTuition) && (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-body text-slate-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm font-body font-medium text-slate-600 bg-white border border-surface-200 rounded-lg px-3 py-1.5 outline-none focus:border-primary/30 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter panel */}
      {expanded && (
        <div className="mt-3 p-4 bg-white border border-surface-200 rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* City filter */}
          <div>
            <label className="text-[10px] font-body font-semibold uppercase tracking-widest text-slate-400 mb-1 block">
              City
            </label>
            <select
              value={filters.city || ""}
              onChange={(e) => setFilters({ ...filters, city: e.target.value || null })}
              className="w-full text-sm font-body text-slate-600 bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 outline-none focus:border-primary/30"
            >
              <option value="">All cities</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Credential filter */}
          <div>
            <label className="text-[10px] font-body font-semibold uppercase tracking-widest text-slate-400 mb-1 block">
              Credential
            </label>
            <select
              value={filters.credential || ""}
              onChange={(e) => setFilters({ ...filters, credential: e.target.value || null })}
              className="w-full text-sm font-body text-slate-600 bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 outline-none focus:border-primary/30"
            >
              <option value="">All types</option>
              {CREDENTIALS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Max tuition filter */}
          <div>
            <label className="text-[10px] font-body font-semibold uppercase tracking-widest text-slate-400 mb-1 block">
              Max Domestic Tuition
            </label>
            <select
              value={filters.maxTuition || ""}
              onChange={(e) => setFilters({ ...filters, maxTuition: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full text-sm font-body text-slate-600 bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 outline-none focus:border-primary/30"
            >
              <option value="">Any budget</option>
              <option value="5000">Under $5,000/year</option>
              <option value="8000">Under $8,000/year</option>
              <option value="10000">Under $10,000/year</option>
              <option value="15000">Under $15,000/year</option>
              <option value="20000">Under $20,000/year</option>
            </select>
          </div>

          {/* Clear filters */}
          {(filters.city || filters.credential || filters.maxTuition) && (
            <div className="sm:col-span-3">
              <button
                onClick={() => setFilters({ city: null, credential: null, maxTuition: null })}
                className="text-xs font-body font-medium text-primary hover:text-primary-dark transition-colors underline underline-offset-2"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Result count */}
      {(filters.city || filters.credential || filters.maxTuition) && (
        <p className="text-xs font-body text-slate-400 mt-2">
          Showing {resultCount} of {totalCount} results
        </p>
      )}
    </div>
  );
}
