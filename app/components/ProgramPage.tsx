"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar";
import { VERIFIED_PROGRAMS } from "../lib/verified-programs";
import { findInstitution } from "../lib/data";
import { SearchResult } from "./ResultCard";

// ── Program → Unsplash hero photo ─────────────────────────────────────────
type ImageSet = "hero" | "card";

const HERO_IMAGES: Record<string, string> = {
  nursing:     "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1600&q=80",
  health:      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=80",
  medical:     "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1600&q=80",
  pharmacy:    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1600&q=80",
  software:    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600&q=80",
  computer:    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&q=80",
  data:        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80",
  engineering: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1600&q=80",
  business:    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&q=80",
  commerce:    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&q=80",
  education:   "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80",
  arts:        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&q=80",
  science:     "https://images.unsplash.com/photo-1532094349884-543559c42f79?w=1600&q=80",
  law:         "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1600&q=80",
  welding:     "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&q=80",
  trades:      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&q=80",
  culinary:    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80",
  kinesiology: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=80",
  default:     "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=80",
};

const CARD_IMAGES: Record<string, string> = {
  nursing:     "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=75",
  health:      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=75",
  software:    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=75",
  computer:    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=75",
  data:        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=75",
  engineering: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=75",
  business:    "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=75",
  commerce:    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=75",
  education:   "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=75",
  arts:        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=75",
  science:     "https://images.unsplash.com/photo-1532094349884-543559c42f79?w=600&q=75",
  law:         "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=75",
  trades:      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=75",
  kinesiology: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=75",
  default:     "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=75",
};

function getProgramImage(programName: string, set: ImageSet = "hero"): string {
  const images = set === "card" ? CARD_IMAGES : HERO_IMAGES;
  const lower = (programName || "").toLowerCase();
  for (const [key, url] of Object.entries(images)) {
    if (key !== "default" && lower.includes(key)) return url;
  }
  return images.default;
}

interface SimilarProgram {
  institution: string;
  program_name: string;
  credential?: string;
  duration?: string;
  _score?: number;
}

function getSimilarPrograms(currentName: string, currentInstitution: string, limit = 4): SimilarProgram[] {
  const stopWords = new Set(["of","in","and","the","a","for","to","bachelor","master","diploma","certificate","science","arts"]);
  const keywords = (currentName || "").toLowerCase().split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
  if (!keywords.length) return [];
  return VERIFIED_PROGRAMS
    .filter(p => p.institution !== currentInstitution)
    .map(p => ({ ...p, _score: keywords.filter(kw => p.program_name.toLowerCase().includes(kw)).length }))
    .filter(p => (p._score ?? 0) > 0)
    .sort((a, b) => (b._score ?? 0) - (a._score ?? 0))
    .slice(0, limit);
}

interface ProgramDetail {
  program_name?: string;
  institution?: string;
  credential?: string | null;
  duration?: string | null;
  tuition_domestic?: string | null;
  tuition_international?: string | null;
  intake?: string | null;
  semester_structure?: string | null;
  last_verified?: string | null;
  source_url?: string | null;
  description?: string | null;
  admission_requirements?: string | null;
  career_outcomes?: string[];
  courses?: string[];
  co_op?: boolean | null;
  online_available?: boolean | null;
  accreditation?: string | null;
  application_deadline?: string | null;
  program_code?: string | null;
  campus?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  application_url?: string | null;
  from_verified?: boolean;
  from_ai?: boolean;
  from_db?: boolean;
}

async function fetchProgramDetail(programName: string, institution: string): Promise<ProgramDetail> {
  const res = await fetch("/api/program-detail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ program_name: programName, institution }),
  });
  if (!res.ok) throw new Error("Not found");
  return res.json() as Promise<ProgramDetail>;
}

// ── Small components ─────────────────────────────────────────────────────────
interface SectionHeadingProps {
  icon: string;
  title: string;
  color?: string;
}

function SectionHeading({ icon, title, color = "#1d56c9" }: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span style={{ fontSize: 26 }}>{icon}</span>
      <h2 className="font-display text-2xl font-black text-slate-900">{title}</h2>
    </div>
  );
}

function CheckRow({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 text-sm text-slate-700">
      <svg className="mt-0.5 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#22c55e" opacity="0.15"/>
        <path d="M7 13l3 3 7-7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span>{text}</span>
    </li>
  );
}

interface FeeRowProps {
  label: string;
  value: string;
  bold?: boolean;
  accent?: string;
}

function FeeRow({ label, value, bold, accent }: FeeRowProps) {
  return (
    <div className={`flex justify-between items-center pb-2 ${bold ? "pt-2" : "border-b border-slate-100"}`}>
      <span className="text-sm" style={bold ? { color: accent, fontWeight: 700 } : { color: "#4b5563" }}>{label}</span>
      <span style={bold ? { color: accent, fontWeight: 900, fontSize: 18 } : { fontWeight: 700, color: "#1e293b" }}>{value}</span>
    </div>
  );
}

function Tag({ text, color = "#0D9488" }: { text: string; color?: string }) {
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
      style={{ background: color + "15", color, border: `1px solid ${color}25` }}
    >
      {text}
    </span>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-2xl p-8 border border-slate-200">
          <div className="w-1/3 h-6 bg-slate-100 rounded mb-4"/>
          <div className="space-y-2">
            <div className="w-full h-4 bg-slate-100 rounded"/>
            <div className="w-4/5 h-4 bg-slate-100 rounded"/>
          </div>
        </div>
      ))}
    </div>
  );
}

interface SimilarCardProps {
  program: SimilarProgram;
  onSelect?: (program: SimilarProgram) => void;
}

function SimilarCard({ program, onSelect }: SimilarCardProps) {
  const [hovered, setHovered] = useState(false);
  const inst = findInstitution(program.institution);
  const city = inst?.city ?? "";
  const imgUrl = getProgramImage(program.program_name, "card");
  const shortInst = program.institution
    .replace("Southern Alberta Institute of Technology","SAIT")
    .replace("Northern Alberta Institute of Technology","NAIT")
    .replace("Bow Valley College","BVC")
    .replace("University of Alberta","U of A")
    .replace("University of Calgary","U of C")
    .replace("University of Lethbridge","U of L")
    .replace("Mount Royal University","MRU")
    .replace("MacEwan University","MacEwan")
    .replace("Red Deer Polytechnic","RDP")
    .replace("Northwestern Polytechnic","NW Poly")
    .replace("NorQuest College","NorQuest")
    .replace("Lakeland College","Lakeland")
    .replace("Medicine Hat College","MHC");

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect?.(program)}
      className="group bg-white rounded-xl overflow-hidden border border-slate-200 cursor-pointer transition-all duration-300"
      style={{ boxShadow: hovered ? "0 12px 32px rgba(0,0,0,0.10)" : "none" }}
    >
      <div className="h-40 overflow-hidden relative">
        <img
          src={imgUrl}
          alt={program.program_name}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
          loading="lazy"
        />
        {program.credential && (
          <span
            className="absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          >
            {program.credential}
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{city || shortInst}</p>
        <h4 className="text-base font-bold text-slate-800 group-hover:text-primary transition-colors leading-snug mb-1 line-clamp-2">
          {program.program_name}
        </h4>
        <p className="text-sm text-slate-500">{shortInst}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-slate-500">{program.duration}</span>
          <span className="text-primary font-bold text-sm">View →</span>
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
interface ProgramPageProps {
  result: SearchResult;
  onBack: () => void;
}

type TabId = "overview" | "eligibility" | "fees" | "similar";

interface Tab {
  id: TabId;
  label: string;
  ref: React.RefObject<HTMLElement | null>;
}

export default function ProgramPage({ result, onBack }: ProgramPageProps) {
  const [detail, setDetail]     = useState<ProgramDetail | null>(null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const inst   = findInstitution(result?.institution);
  const accent = inst?.color ?? "#1d56c9";

  const overviewRef    = useRef<HTMLElement>(null);
  const eligibilityRef = useRef<HTMLElement>(null);
  const feesRef        = useRef<HTMLElement>(null);
  const similarRef     = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!result) return;
    setLoading(true);
    fetchProgramDetail(result.program_name, result.institution)
      .then(data => { setDetail(data); setLoading(false); })
      .catch(() => { setDetail(null); setLoading(false); });
  }, [result?.program_name, result?.institution]);

  useEffect(() => {
    if (loading) return;
    const sections: { id: TabId; ref: React.RefObject<HTMLElement | null> }[] = [
      { id: "overview",    ref: overviewRef },
      { id: "eligibility", ref: eligibilityRef },
      { id: "fees",        ref: feesRef },
      { id: "similar",     ref: similarRef },
    ];
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveTab(e.target.id as TabId); }),
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sections.forEach(({ ref }) => { if (ref.current) observer.observe(ref.current); });
    return () => observer.disconnect();
  }, [loading]);

  function scrollTo(ref: React.RefObject<HTMLElement | null>, id: TabId) {
    setActiveTab(id);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!result) return null;

  const d = detail ?? {};
  const r = result;

  const verified = VERIFIED_PROGRAMS.find(p =>
    p.institution?.toLowerCase() === (d.institution || r.institution || "").toLowerCase() &&
    p.program_name?.toLowerCase() === (d.program_name || r.program_name || "").toLowerCase()
  );

  const program = {
    program_name:           d.program_name            || r.program_name,
    institution:            d.institution             || r.institution,
    credential:             d.credential              || r.credential,
    duration:               d.duration               || r.duration               || verified?.duration,
    tuition_domestic:       verified?.tuition_domestic  || d.tuition_domestic   || r.tuition_domestic,
    tuition_international:  verified?.tuition_international || d.tuition_international || r.tuition_international,
    intake:                 verified?.intake          || d.intake                || r.intake,
    semester_structure:     verified?.semester_structure || d.semester_structure || r.semester_structure,
    source_url:             verified?.fee_source_url  || d.source_url            || r.source_url,
    description:            d.description             || null,
    admission_requirements: d.admission_requirements  || null,
    career_outcomes:        d.career_outcomes         || [] as string[],
    courses:                d.courses                 || [] as string[],
    co_op:                  d.co_op                   ?? null,
    online_available:       d.online_available        ?? null,
    accreditation:          d.accreditation           || null,
    application_deadline:   d.application_deadline    || null,
    program_code:           d.program_code            || null,
    campus:                 d.campus                  || inst?.city              || null,
    contact_email:          d.contact_email           || null,
    contact_phone:          d.contact_phone           || null,
    application_url:        d.application_url         || inst?.website           || null,
    last_verified:          verified?.last_verified   || d.last_verified         || null,
    from_verified:          !!(verified              || d.from_verified),
    from_ai:                !!d.from_ai,
    from_db:                !!d.from_db,
  };

  const heroImage   = getProgramImage(program.program_name, "hero");
  const similarList = getSimilarPrograms(program.program_name, program.institution);

  const tabs: Tab[] = [
    { id: "overview",    label: "Overview",              ref: overviewRef },
    { id: "eligibility", label: "Eligibility & Details", ref: eligibilityRef },
    { id: "fees",        label: "Fee Breakdown",          ref: feesRef },
    { id: "similar",     label: "Similar Programs",       ref: similarRef },
  ];

  return (
    <div className="min-h-screen font-body" style={{ background: "#f6f6f8" }}>
      <Navbar />

      {/* HERO */}
      <section className="relative h-[380px] sm:h-[420px] overflow-hidden">
        <img src={heroImage} alt={program.program_name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col justify-end px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
          <button
            onClick={onBack}
            className="absolute top-6 left-4 sm:left-6 lg:left-8 flex items-center gap-1.5 text-white/75 hover:text-white text-sm font-medium transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back to results
          </button>

          <div className="flex items-center gap-1.5 text-white/70 text-sm mb-4 flex-wrap">
            <button onClick={onBack} className="hover:text-white transition-colors">Home</button>
            <span>›</span>
            <span>{inst?.type || "Programs"}</span>
            <span>›</span>
            <span className="text-white font-medium truncate max-w-[200px]">{program.program_name}</span>
          </div>

          <h1
            className="font-display font-black text-white leading-[1.08] mb-5"
            style={{ fontSize: "clamp(26px, 5vw, 54px)" }}
          >
            {program.program_name}
          </h1>

          <div className="flex flex-wrap gap-3">
            {program.campus && (
              <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-sm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {program.campus}
              </span>
            )}
            {program.duration && (
              <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-sm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                {program.duration}
              </span>
            )}
            {program.intake && (
              <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-sm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                Starts {program.intake.split(",")[0].trim()}
              </span>
            )}
            {program.credential && (
              <span className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-sm font-semibold">
                {program.credential}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* TAB BAR */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto">
          <div className="flex gap-6 sm:gap-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => scrollTo(tab.ref, tab.id)}
                className="font-display font-bold text-sm whitespace-nowrap py-4 border-b-2 transition-all"
                style={{
                  color: activeTab === tab.id ? "#1d56c9" : "#94a3b8",
                  borderBottomColor: activeTab === tab.id ? "#1d56c9" : "transparent",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2-COLUMN LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-10">
            {loading ? <DetailSkeleton /> : (
              <>
                {/* OVERVIEW */}
                <section id="overview" ref={overviewRef} className="scroll-mt-20 bg-white rounded-2xl p-8 border border-slate-200">
                  <SectionHeading icon="📋" title="Program Overview" color="#1d56c9" />
                  <p className="text-slate-600 leading-relaxed mb-6">
                    {program.description ||
                      `${program.program_name} at ${program.institution} is a ${program.credential || "program"} designed to prepare graduates with the skills and knowledge for a successful career in the field.${program.duration ? ` This ${program.duration} program` : ""} combines classroom learning with practical experience, and is recognized across Alberta and Canada.`}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="p-5 rounded-xl border" style={{ background: "#1d56c908", borderColor: "#1d56c920" }}>
                      <h4 className="font-bold text-sm mb-1.5" style={{ color: "#1d56c9" }}>
                        {program.co_op ? "Co-op Available" : "Credential Awarded"}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {program.co_op
                          ? "Gain real-world experience through co-operative education work terms integrated into this program."
                          : `Graduates receive a ${program.credential || "recognized credential"} upon successful completion.`}
                      </p>
                    </div>
                    <div className="p-5 rounded-xl border" style={{ background: "#0d948808", borderColor: "#0d948820" }}>
                      <h4 className="font-bold text-sm mb-1.5" style={{ color: "#0d9488" }}>
                        {program.online_available ? "Online Available" : "Program Intake"}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {program.online_available
                          ? "This program offers online or blended learning options for added flexibility."
                          : program.intake
                            ? `Intake: ${program.intake}${program.semester_structure ? ` · ${program.semester_structure}` : ""}`
                            : "Contact the institution for current intake and application dates."}
                      </p>
                    </div>
                  </div>

                  {program.courses.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wide mb-3">Sample Courses</h3>
                      <div className="flex flex-wrap gap-2">
                        {program.courses.map((c, i) => <Tag key={i} text={c} color={accent} />)}
                      </div>
                    </div>
                  )}

                  {program.career_outcomes.length > 0 && (
                    <div>
                      <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wide mb-3">Career Outcomes</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {program.career_outcomes.map((c, i) => (
                          <div key={i} className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accent }}/>
                            <span className="text-sm text-slate-700">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                {/* ELIGIBILITY */}
                <section
                  id="eligibility"
                  ref={eligibilityRef}
                  className="scroll-mt-20 rounded-2xl p-8 border"
                  style={{ background: "linear-gradient(135deg,#d9770608,transparent)", borderColor: "#d9770620" }}
                >
                  <SectionHeading icon="✅" title="Eligibility & Program Details" color="#d97706" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-bold text-base mb-4" style={{ color: "#d97706" }}>Admission Requirements</h3>
                      {program.admission_requirements ? (
                        <ul className="space-y-2.5">
                          {program.admission_requirements.split(/\n|•|-/).map(s => s.trim()).filter(Boolean).map((req, i) => (
                            <CheckRow key={i} text={req} />
                          ))}
                        </ul>
                      ) : (
                        <ul className="space-y-2.5">
                          <CheckRow text="Alberta high school diploma or equivalent" />
                          <CheckRow text="Minimum grade requirements vary — check institution website" />
                          <CheckRow text="English language proficiency may be required" />
                          <CheckRow text="Additional prerequisites may apply depending on specialization" />
                        </ul>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-xl shadow-sm">
                        <p className="text-xs uppercase font-bold text-slate-400 mb-2">Program Details</p>
                        <div className="space-y-2 text-sm">
                          {program.credential       && <div className="flex justify-between"><span className="text-slate-500">Credential</span><span className="font-semibold">{program.credential}</span></div>}
                          {program.duration         && <div className="flex justify-between"><span className="text-slate-500">Duration</span><span className="font-semibold">{program.duration}</span></div>}
                          {program.campus           && <div className="flex justify-between"><span className="text-slate-500">Location</span><span className="font-semibold">{program.campus}</span></div>}
                          {program.semester_structure && <div className="flex justify-between"><span className="text-slate-500">Semesters</span><span className="font-semibold">{program.semester_structure}</span></div>}
                          {program.intake           && <div className="flex justify-between"><span className="text-slate-500">Intake</span><span className="font-semibold text-right max-w-[55%]">{program.intake}</span></div>}
                          {program.program_code     && <div className="flex justify-between"><span className="text-slate-500">Program Code</span><span className="font-semibold">{program.program_code}</span></div>}
                          {program.accreditation    && <div className="flex justify-between"><span className="text-slate-500">Accreditation</span><span className="font-semibold text-right max-w-[55%]">{program.accreditation}</span></div>}
                          {program.co_op !== null   && <div className="flex justify-between"><span className="text-slate-500">Co-op</span><span className="font-semibold">{program.co_op ? "Yes" : "No"}</span></div>}
                          {program.online_available !== null && <div className="flex justify-between"><span className="text-slate-500">Online</span><span className="font-semibold">{program.online_available ? "Yes" : "No"}</span></div>}
                          {program.application_deadline && <div className="flex justify-between"><span className="text-slate-500">Deadline</span><span className="font-semibold text-rose-600">{program.application_deadline}</span></div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* FEE BREAKDOWN */}
                <section id="fees" ref={feesRef} className="scroll-mt-20 bg-white rounded-2xl p-8 border border-slate-200">
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
                    <SectionHeading icon="💳" title="Fee Breakdown" color="#e11d48" />
                    <span className="text-sm text-slate-400 italic">Estimated per year</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "#1d56c920" }}>
                      <div className="p-4 text-white font-bold flex justify-between items-center" style={{ background: "#1d56c9" }}>
                        <span>Domestic Students</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                      </div>
                      <div className="p-6 space-y-3" style={{ background: "#1d56c905" }}>
                        <FeeRow label="Tuition" value={program.tuition_domestic || "Contact institution"} />
                        <FeeRow label="Student Fees" value="~$800 – $1,500" />
                        <FeeRow label="Books & Supplies" value="~$1,000 – $2,000" />
                        <FeeRow label="Annual Total" value={program.tuition_domestic || "See institution"} bold accent="#1d56c9" />
                      </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "#0d948820" }}>
                      <div className="p-4 text-white font-bold flex justify-between items-center" style={{ background: "#0d9488" }}>
                        <span>International Students</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                      </div>
                      <div className="p-6 space-y-3" style={{ background: "#0d948805" }}>
                        <FeeRow label="Tuition" value={program.tuition_international || "Contact institution"} />
                        <FeeRow label="Health Insurance" value="~$600 – $900" />
                        <FeeRow label="Other Fees" value="~$500 – $1,200" />
                        <FeeRow label="Annual Total" value={program.tuition_international || "See institution"} bold accent="#0d9488" />
                      </div>
                    </div>
                  </div>

                  {program.last_verified && (
                    <p className="text-xs text-slate-400 mt-5 text-center">
                      ✓ Fee data verified · Last checked {new Date(program.last_verified).toLocaleDateString()}
                    </p>
                  )}
                </section>

                {/* SIMILAR PROGRAMS */}
                <section id="similar" ref={similarRef} className="scroll-mt-20">
                  <SectionHeading icon="🔍" title="Similar Programs in Alberta" color="#475569" />
                  {similarList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {similarList.map((p, i) => (
                        <SimilarCard
                          key={i}
                          program={p}
                          onSelect={prog => (window as Window & { __similarProgramClick?: (p: SimilarProgram) => void }).__similarProgramClick?.(prog)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No similar programs found in our database.</p>
                  )}
                </section>
              </>
            )}
          </div>

          {/* RIGHT: sticky sidebar */}
          <aside>
            <div className="sticky top-20 space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-xl shadow-slate-200/60">
                {program.application_deadline && (
                  <div className="mb-6">
                    <p className="text-sm text-slate-500 font-medium">Application Deadline</p>
                    <p className="text-2xl font-black" style={{ color: "#e11d48" }}>{program.application_deadline}</p>
                    <p className="text-xs text-slate-400 mt-1">Late applications may not be considered.</p>
                  </div>
                )}

                <div className="space-y-3">
                  {program.application_url && (
                    <a
                      href={program.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center font-display font-extrabold text-base text-white py-4 rounded-xl transition-all hover:brightness-110 hover:-translate-y-0.5 shadow-lg no-underline"
                      style={{ background: "#1d56c9", boxShadow: "0 8px 20px #1d56c930" }}
                    >
                      Apply Now
                    </a>
                  )}
                  {program.source_url && (
                    <a
                      href={program.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 font-bold text-sm text-slate-700 py-4 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all no-underline"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      View Official Page
                    </a>
                  )}
                </div>

                {(program.contact_email || program.contact_phone) && (
                  <>
                    <hr className="my-6 border-slate-100" />
                    <div className="space-y-3">
                      <h5 className="font-bold text-slate-800 text-sm">Need Help?</h5>
                      {program.contact_phone && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg" style={{ background: "#1d56c912", color: "#1d56c9" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Call Admissions</p>
                            <p className="text-sm font-bold text-slate-800">{program.contact_phone}</p>
                          </div>
                        </div>
                      )}
                      {program.contact_email && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg" style={{ background: "#0d948812", color: "#0d9488" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Email Inquiries</p>
                            <p className="text-sm font-bold text-slate-800">{program.contact_email}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 leading-relaxed italic">
                    &ldquo;Always verify program details and fees directly with {program.institution} before applying.&rdquo;
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  {program.from_verified && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                      Fees verified
                    </span>
                  )}
                  {program.from_ai && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                      ✦ AI-enriched
                    </span>
                  )}
                </div>
                {program.last_verified && (
                  <p className="text-[11px] text-slate-400">Last checked {new Date(program.last_verified).toLocaleDateString()}</p>
                )}
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Always verify directly with the institution before applying.
                </p>
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-14 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-extrabold text-white text-sm"
                style={{ background: "linear-gradient(135deg,#0D9488,#0891B2)" }}
              >A</div>
              <span className="font-display font-bold text-slate-800">AdviseAlberta</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Helping students find the best educational paths across all 26 Alberta post-secondary institutions.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-slate-800 mb-4">Resources</h5>
            <ul className="space-y-3 text-sm text-slate-500">
              {["Scholarship Guide","Application Tips","Program Comparisons","Student Stories"].map(l => (
                <li key={l}><a href="#" className="hover:text-primary transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-slate-800 mb-4">Institutions</h5>
            <ul className="space-y-3 text-sm text-slate-500">
              {["University of Calgary","University of Alberta","SAIT","NAIT"].map(l => (
                <li key={l}><a href="#" className="hover:text-primary transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-slate-800 mb-4">Stay Updated</h5>
            <p className="text-xs text-slate-500 mb-3">Get notified about new programs and application deadlines.</p>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-slate-100 border-none rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                className="text-white text-sm font-bold py-2 rounded-lg hover:brightness-110 transition-all"
                style={{ background: "#1d56c9" }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400">
          <p>© 2024 AdviseAlberta. Not affiliated with ApplyAlberta or any Alberta institution.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}