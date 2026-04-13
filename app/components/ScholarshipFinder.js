"use client";
import { useState } from "react";
import { findInstitution } from "../lib/data";

// Known scholarship pages for Alberta institutions
const SCHOLARSHIP_DATA = {
  "Southern Alberta Institute of Technology": {
    url: "https://www.sait.ca/tuition-and-financial-aid/scholarships-and-awards",
    scholarships: [
      { name: "SAIT President's Scholarship", amount: "$5,000", type: "Merit", note: "Top academic achievers" },
      { name: "SAIT Access Award", amount: "Up to $3,000", type: "Need", note: "Demonstrated financial need" },
      { name: "Alberta Heritage Scholarship", amount: "$2,500", type: "Merit", note: "Alberta high school grads with 75%+ avg" },
    ],
  },
  "Northern Alberta Institute of Technology": {
    url: "https://www.nait.ca/nait/admissions/tuition-and-fees/scholarships-and-bursaries",
    scholarships: [
      { name: "NAIT Entrance Award", amount: "$1,000-$3,000", type: "Merit", note: "New students with strong academics" },
      { name: "NAIT Bursary Program", amount: "Varies", type: "Need", note: "Students with financial barriers" },
    ],
  },
  "University of Calgary": {
    url: "https://ucalgary.ca/registrar/awards",
    scholarships: [
      { name: "U of C Entrance Scholarship", amount: "$1,000-$5,000", type: "Merit", note: "Admission avg 80%+" },
      { name: "International Entrance Award", amount: "$5,000-$15,000", type: "Merit", note: "International students" },
      { name: "Jason Lang Scholarship", amount: "$1,000", type: "Merit", note: "GPA 3.2+ in previous year (Alberta)" },
    ],
  },
  "University of Alberta": {
    url: "https://www.ualberta.ca/en/registrar/scholarships-awards-financial-support.html",
    scholarships: [
      { name: "U of A Academic Excellence Scholarship", amount: "$1,000-$6,000", type: "Merit", note: "Admission avg 80%+" },
      { name: "International Student Scholarship", amount: "$5,000-$9,000", type: "Merit", note: "International applicants" },
      { name: "Jason Lang Scholarship", amount: "$1,000", type: "Merit", note: "GPA 3.2+ (Alberta residents)" },
    ],
  },
  "University of Lethbridge": {
    url: "https://www.ulethbridge.ca/future-student/funding",
    scholarships: [
      { name: "U of L Entrance Scholarship", amount: "$1,000-$2,500", type: "Merit", note: "Admission avg 80%+" },
      { name: "Board of Governors Award", amount: "$500-$2,000", type: "Merit", note: "Academic excellence" },
    ],
  },
  "Bow Valley College": {
    url: "https://bowvalleycollege.ca/student-resources/financial-aid/scholarships",
    scholarships: [
      { name: "BVC Entrance Award", amount: "$500-$2,000", type: "Merit", note: "New students" },
      { name: "BVC Student Bursary", amount: "Up to $1,500", type: "Need", note: "Financial need" },
    ],
  },
  "Mount Royal University": {
    url: "https://www.mtroyal.ca/AcademicsLearning/StudentFinancialAid",
    scholarships: [
      { name: "MRU Entrance Scholarship", amount: "$1,000-$4,000", type: "Merit", note: "Admission avg 80%+" },
    ],
  },
  "MacEwan University": {
    url: "https://www.macewan.ca/campus-life/financial-aid-awards",
    scholarships: [
      { name: "MacEwan Entrance Award", amount: "$1,000-$3,500", type: "Merit", note: "High school grads with 80%+" },
    ],
  },
};

// Province-wide scholarships available to all Alberta students
const PROVINCIAL_SCHOLARSHIPS = [
  { name: "Alexander Rutherford Scholarship", amount: "$2,500", type: "Merit", note: "Alberta high school grads with 75%+ avg in designated courses", url: "https://studentaid.alberta.ca/scholarships/alexander-rutherford-scholarship/" },
  { name: "Jason Lang Scholarship", amount: "$1,000", type: "Merit", note: "GPA 3.2+ after first year at an Alberta post-secondary", url: "https://studentaid.alberta.ca/scholarships/jason-lang-scholarship/" },
  { name: "Louise McKinney Post-Secondary Scholarship", amount: "$2,500", type: "Merit", note: "Top 2% GPA at Alberta institution", url: "https://studentaid.alberta.ca/scholarships/louise-mckinney-scholarship/" },
  { name: "Alberta Student Aid (Loans & Grants)", amount: "Varies", type: "Need", note: "Government student loans and grants for Alberta residents", url: "https://studentaid.alberta.ca/" },
];

export default function ScholarshipFinder({ results }) {
  const [expanded, setExpanded] = useState(false);

  if (!results || results.length === 0) return null;

  // Get unique institutions from results
  const institutions = [...new Set(results.map((r) => r.institution))];
  const matchedScholarships = institutions
    .map((inst) => ({ institution: inst, data: SCHOLARSHIP_DATA[inst] }))
    .filter((s) => s.data);

  return (
    <div className="mt-5 animate-fade-slide-up">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-800 transition-all group"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🎓</span>
          <span className="font-display font-bold text-sm text-amber-800 dark:text-amber-300">
            Scholarships & Financial Aid
          </span>
          <span className="text-[11px] font-body font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-800/40 px-2 py-0.5 rounded-full">
            {matchedScholarships.length + 1} sources found
          </span>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2"
          className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-2 border border-surface-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">

          {/* Provincial scholarships */}
          <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-b border-surface-200 dark:border-slate-700">
            <h3 className="font-display font-bold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <span>🏛️</span> Alberta Provincial Scholarships
              <span className="text-[10px] font-body font-medium text-emerald-600 dark:text-emerald-400">(available to all)</span>
            </h3>
          </div>
          {PROVINCIAL_SCHOLARSHIPS.map((s, i) => (
            <ScholarshipRow key={`prov-${i}`} scholarship={s} />
          ))}

          {/* Institution-specific scholarships */}
          {matchedScholarships.map(({ institution, data }) => {
            const inst = findInstitution(institution);
            return (
              <div key={institution}>
                <div className="px-4 py-3 bg-surface-50 dark:bg-slate-700/50 border-t border-b border-surface-200 dark:border-slate-600 flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: inst?.color || "#0D9488" }} />
                    {inst?.name || institution}
                  </h3>
                  <a
                    href={data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-body font-semibold text-primary dark:text-primary-light hover:underline"
                  >
                    View all →
                  </a>
                </div>
                {data.scholarships.map((s, i) => (
                  <ScholarshipRow key={`${institution}-${i}`} scholarship={s} />
                ))}
              </div>
            );
          })}

          {/* Footer */}
          <div className="px-4 py-3 bg-surface-50 dark:bg-slate-700/30 border-t border-surface-200 dark:border-slate-700">
            <p className="text-[11px] font-body text-slate-400 dark:text-slate-500">
              ⓘ Scholarship amounts and eligibility are approximate. Always verify on the official scholarship page before applying.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ScholarshipRow({ scholarship }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-surface-100 dark:border-slate-700 last:border-b-0 hover:bg-surface-50 dark:hover:bg-slate-700/30 transition-colors">
      <div className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-body font-bold uppercase tracking-wider flex-shrink-0 ${
        scholarship.type === "Merit"
          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          : "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
      }`}>
        {scholarship.type}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-body font-semibold text-sm text-slate-700 dark:text-slate-200">{scholarship.name}</span>
          <span className="font-display font-bold text-sm text-emerald-600 dark:text-emerald-400">{scholarship.amount}</span>
        </div>
        <p className="text-[12px] font-body text-slate-400 dark:text-slate-500 mt-0.5">{scholarship.note}</p>
      </div>
      {scholarship.url && (
        <a href={scholarship.url} target="_blank" rel="noopener noreferrer" className="text-xs font-body font-semibold text-primary dark:text-primary-light hover:underline flex-shrink-0">
          Apply →
        </a>
      )}
    </div>
  );
}
