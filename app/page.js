"use client";
import { useState, useRef } from "react";
import Navbar from "./components/Navbar";
import TypingPlaceholder from "./components/TypingPlaceholder";
import ResultCard from "./components/ResultCard";
import SkeletonCard from "./components/SkeletonCard";
import InstitutionBadge from "./components/InstitutionBadge";
import ProgramPage from "./components/ProgramPage";
import { INSTITUTIONS, SUGGESTED_QUERIES } from "./lib/data";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [summary, setSummary] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchedAt, setSearchedAt] = useState(null);
  const resultsRef = useRef(null);
  const inputRef = useRef(null);
  const [selectedResult, setSelectedResult] = useState(null);

  async function handleSearch(searchQuery) {
    const q = (searchQuery || query).trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setResults(null);
    setSummary("");
    setDisclaimer("");
    setSearchedAt(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      setResults(data.results || []);
      setSummary(data.summary || "");
      setDisclaimer(data.disclaimer || "");
      setSearchedAt(data.searched_at || data.cached_at || new Date().toISOString());

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearch();
  }

  function handleSuggestionClick(sq) {
    setQuery(sq);
    handleSearch(sq);
  }

  if (selectedResult) {
  return (
    <ProgramPage
      result={selectedResult}
      onBack={() => setSelectedResult(null)}
    />
  );
}

  return (
    <div className="min-h-screen bg-white font-body">
      <Navbar />

      {/* ── Hero Section ─────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Bold teal-to-cyan gradient */}
        <div
          className="absolute inset-x-0 top-0 h-[380px] sm:h-[420px]"
          style={{
            background: "linear-gradient(135deg, #0D9488 0%, #0891B2 45%, #06B6D4 100%)",
          }}
        />
        {/* Curved bottom edge */}
        <div
          className="absolute inset-x-0 bottom-0 h-[380px] sm:h-[420px]"
          style={{
            background: "linear-gradient(135deg, #0D9488 0%, #0891B2 45%, #06B6D4 100%)",
            borderRadius: "0 0 50% 50% / 0 0 60px 60px",
          }}
        />
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-x-0 top-0 h-[380px] sm:h-[420px] opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            borderRadius: "0 0 50% 50% / 0 0 60px 60px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-[900px] mx-auto px-4 sm:px-6">
          <div className="pt-10 sm:pt-14 pb-12 sm:pb-16 text-center">
            <div className="animate-fade-slide-up">
              <h1
                className="font-display font-extrabold leading-[1.12] tracking-tight mb-4 text-white"
                style={{ fontSize: "clamp(28px, 5.5vw, 50px)" }}
              >
                Find Your Perfect
                <br />
                Program in Alberta
              </h1>
              <p className="font-body text-base sm:text-lg text-white/80 max-w-[480px] mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
                AI-powered search across all 26 Alberta colleges and universities.
                Real-time fees, program details, and direct source links.
              </p>
            </div>

            {/* ── Search Bar ──────────────────────────────── */}
            <div className="animate-fade-slide-up delay-200">
              <div className={`relative max-w-[680px] mx-auto ${loading ? "animate-search-pulse" : ""}`}>
                <div
                  className="flex items-center bg-white rounded-xl sm:rounded-2xl px-3 sm:pl-5 sm:pr-1.5 py-1 sm:py-1.5 transition-all duration-300"
                  style={{
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Search icon */}
                  <svg
                    width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="flex-shrink-0 mr-2 sm:mr-3"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>

                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-transparent border-none outline-none text-slate-800 font-body text-sm sm:text-base py-2.5 sm:py-3"
                      placeholder=""
                    />
                    {!query && (
                      <div className="absolute inset-0 flex items-center pointer-events-none">
                        <TypingPlaceholder texts={SUGGESTED_QUERIES} />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleSearch()}
                    disabled={loading || !query.trim()}
                    className="font-display font-bold text-xs sm:text-sm text-white rounded-lg sm:rounded-xl px-5 sm:px-7 py-2 sm:py-2.5 whitespace-nowrap tracking-wide transition-all duration-200 disabled:opacity-40 hover:brightness-110 hover:shadow-lg"
                    style={{
                      background: loading
                        ? "rgba(245,158,11,0.5)"
                        : "linear-gradient(135deg, #F59E0B, #F97316)",
                      cursor: loading ? "wait" : "pointer",
                    }}
                  >
                    {loading ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>

              {/* ── Suggested Searches ────────────────────── */}
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-5 max-w-[680px] mx-auto px-2">
                {SUGGESTED_QUERIES.slice(0, 4).map((sq, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(sq)}
                    disabled={loading}
                    className="rounded-full px-3 sm:px-4 py-1.5 sm:py-[7px] font-body text-[11px] sm:text-xs font-medium transition-all duration-200 disabled:cursor-wait border"
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      borderColor: "rgba(255,255,255,0.35)",
                      color: "rgba(255,255,255,0.9)",
                      backdropFilter: "blur(4px)",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(255,255,255,0.35)";
                      e.target.style.borderColor = "rgba(255,255,255,0.5)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(255,255,255,0.2)";
                      e.target.style.borderColor = "rgba(255,255,255,0.35)";
                    }}
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6">

        {/* ── Error ────────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 sm:px-6 py-4 mb-6 mt-6 font-body text-sm text-red-600 text-center animate-fade-slide-up">
            {error}
          </div>
        )}

        {/* ── Loading ──────────────────────────────────── */}
        {loading && (
          <div ref={resultsRef} className="mb-10 mt-6">
            <div className="text-center mb-6 animate-fade-slide-up">
              <div className="inline-flex items-center gap-3 bg-primary-50 border border-primary-100 rounded-xl px-5 py-2.5">
                <div
                  className="w-4 h-4 rounded-full border-2 border-primary-200 animate-spin"
                  style={{ borderTopColor: "#0D9488" }}
                />
                <span className="font-body text-sm text-primary-600 font-medium">
                  Searching Alberta institutions in real-time...
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        )}

        {/* ── Results ──────────────────────────────────── */}
        {results && !loading && (
          <div ref={resultsRef} className="mb-12 mt-6">
            {/* Summary */}
            {summary && (
              <div className="bg-primary-50 border border-primary-100 rounded-xl px-4 sm:px-6 py-4 sm:py-5 mb-5 animate-fade-slide-up">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <span className="text-base sm:text-lg leading-none text-primary">✦</span>
                  <div>
                    <p className="font-body text-sm sm:text-[15px] text-slate-700 leading-relaxed">
                      {summary}
                    </p>
                    <p className="font-body text-xs text-slate-400 mt-2">
                      Found {results.length} matching program{results.length !== 1 ? "s" : ""}
                      {searchedAt && (
                        <> · Searched {new Date(searchedAt).toLocaleString()}</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cards */}
            {results.length > 0 ? (
              <div className="flex flex-col gap-3 sm:gap-4">
                {results.map((result, i) => (
                  <ResultCard key={i} result={result} index={i} onViewDetail={() => setSelectedResult(result)}/>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 font-body">
                <p className="text-lg mb-2">No programs found</p>
                <p className="text-sm">Try different keywords or broaden your search.</p>
              </div>
            )}

            {/* Disclaimer */}
            {disclaimer && (
              <div className="mt-5 p-3 sm:p-4 bg-surface-50 border border-surface-200 rounded-xl flex items-start gap-2.5">
                <span className="text-sm text-slate-400 flex-shrink-0">ⓘ</span>
                <p className="font-body text-xs text-slate-400 leading-relaxed">{disclaimer}</p>
              </div>
            )}

            {/* Search again */}
            <div className="text-center mt-6 sm:mt-8">
              <button
                onClick={() => {
                  setResults(null);
                  setSummary("");
                  setDisclaimer("");
                  setQuery("");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setTimeout(() => inputRef.current?.focus(), 500);
                }}
                className="font-body text-sm text-primary hover:text-primary-dark transition-colors font-semibold underline underline-offset-4"
              >
                ← Search for something else
              </button>
            </div>
          </div>
        )}

        {/* ── Institutions Grid ────────────────────────── */}
        {!loading && !results && (
          <div className="py-8 sm:py-12 animate-fade-slide-up delay-400">
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <div className="h-px flex-1 bg-surface-200" />
              <span className="font-display text-[11px] sm:text-[13px] font-semibold text-slate-400 uppercase tracking-widest">
                {INSTITUTIONS.length} Partner Institutions
              </span>
              <div className="h-px flex-1 bg-surface-200" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
              {INSTITUTIONS.map((inst, i) => (
                <InstitutionBadge key={inst.name} inst={inst} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ───────────────────────────────────── */}
        <footer className="border-t border-surface-200 py-6 pb-8 text-center">
          <p className="font-body text-[11px] sm:text-xs text-slate-400 leading-relaxed px-2">
            AdviseAlberta is an independent tool and is not affiliated with ApplyAlberta or any Alberta institution.
            <br className="hidden sm:block" />
            <span className="sm:inline"> All program data is retrieved in real-time from official institution websites. Always verify before applying.</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
