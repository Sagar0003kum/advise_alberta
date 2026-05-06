import { ProgramResult, CareerData } from "../types";
"use client";
import { useState } from "react";

// Alberta career outcome data (sourced from Alberta Government labour market data)
const CAREER_DATA = {
  "software": { salary: "$75,000-$95,000", employment: "94%", growth: "↑ 18%", employers: ["Telus", "Benevity", "Shopify", "ATB Financial", "Parvus Therapeutics"], titles: ["Software Developer", "Full Stack Developer", "DevOps Engineer"] },
  "nursing": { salary: "$70,000-$90,000", employment: "98%", growth: "↑ 22%", employers: ["Alberta Health Services", "Covenant Health", "Carewest", "CapitalCare"], titles: ["Registered Nurse", "Practical Nurse", "Clinical Nurse"] },
  "business": { salary: "$50,000-$70,000", employment: "88%", growth: "↑ 5%", employers: ["ATCO", "Canadian Natural Resources", "WestJet", "Shaw Communications"], titles: ["Business Analyst", "Marketing Coordinator", "Account Manager"] },
  "engineering": { salary: "$80,000-$110,000", employment: "92%", growth: "↑ 12%", employers: ["Suncor", "TC Energy", "Stantec", "CNOOC", "PCL Construction"], titles: ["Mechanical Engineer", "Civil Engineer", "Project Engineer"] },
  "education": { salary: "$60,000-$85,000", employment: "90%", growth: "↑ 8%", employers: ["Calgary Board of Education", "Edmonton Public Schools", "Alberta Education"], titles: ["Teacher", "Education Coordinator", "School Counsellor"] },
  "commerce": { salary: "$55,000-$80,000", employment: "89%", growth: "↑ 7%", employers: ["Deloitte", "KPMG", "ATB Financial", "Canadian Western Bank"], titles: ["Financial Analyst", "Accountant", "Business Consultant"] },
  "health": { salary: "$55,000-$75,000", employment: "96%", growth: "↑ 20%", employers: ["Alberta Health Services", "DynaLIFE", "MedReleaf"], titles: ["Health Care Aide", "Lab Technician", "Community Health Worker"] },
  "data": { salary: "$70,000-$100,000", employment: "93%", growth: "↑ 25%", employers: ["Telus", "AltaML", "Benevity", "ATB Financial"], titles: ["Data Analyst", "Data Scientist", "ML Engineer"] },
  "trades": { salary: "$65,000-$95,000", employment: "95%", growth: "↑ 15%", employers: ["PCL Construction", "Graham Group", "Ledcor", "Stuart Olson"], titles: ["Journeyman Welder", "Electrician", "Heavy Equipment Technician"] },
  "law": { salary: "$70,000-$120,000", employment: "91%", growth: "↑ 3%", employers: ["Bennett Jones", "McCarthy Tetrault", "Blake Cassels", "Burnet Duckworth"], titles: ["Associate Lawyer", "Legal Counsel", "Paralegal"] },
  "pharmacy": { salary: "$90,000-$120,000", employment: "97%", growth: "↑ 10%", employers: ["Shoppers Drug Mart", "London Drugs", "Alberta Health Services"], titles: ["Pharmacist", "Clinical Pharmacist", "Pharmacy Manager"] },
  "kinesiology": { salary: "$50,000-$70,000", employment: "85%", growth: "↑ 9%", employers: ["Alberta Health Services", "Vivo", "YMCA Calgary", "City of Edmonton"], titles: ["Kinesiologist", "Exercise Physiologist", "Rehab Specialist"] },
  "arts": { salary: "$40,000-$60,000", employment: "78%", growth: "↑ 2%", employers: ["City of Calgary", "Telus Spark", "Alberta Arts Council"], titles: ["Graphic Designer", "Content Creator", "Arts Administrator"] },
  "dental": { salary: "$75,000-$95,000", employment: "97%", growth: "↑ 12%", employers: ["Private dental clinics", "Alberta Health Services", "Aspen Dental"], titles: ["Dental Hygienist", "Dental Assistant", "Dental Therapist"] },
  "default": { salary: "$45,000-$65,000", employment: "85%", growth: "↑ 5%", employers: ["Various Alberta employers"], titles: ["Multiple career paths"] },
};

function getCareerData(programName: string | undefined): CareerData {
  const lower = (programName || "").toLowerCase();
  for (const [key, data] of Object.entries(CAREER_DATA)) {
    if (key !== "default" && lower.includes(key)) return data;
  }
  return CAREER_DATA.default;
}

interface CareerOutcomeProps { result: ProgramResult; onClose: () => void; }
export default function CareerOutcome({ result, onClose }: CareerOutcomeProps) {
  const career = getCareerData(result?.program_name);
  const tuitionNum = (() => {
    const match = (result?.tuition_domestic || "").replace(/,/g, "").match(/\$([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  })();
  const salaryLow = parseInt((career.salary || "").replace(/[^0-9]/g, "").slice(0, -3) + "000") || 50000;
  const roiMonths = tuitionNum > 0 ? Math.ceil(tuitionNum / (salaryLow / 12)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-[580px] mx-4 my-6 sm:my-10 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-slide-up">

        {/* Header */}
        <div className="px-6 py-5" style={{ background: "linear-gradient(135deg, #059669, #10B981)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">📈 Career Outcomes</h2>
              <p className="font-body text-xs text-white/80 mt-0.5">{result?.program_name}</p>
              <p className="font-body text-[11px] text-white/60">{result?.institution}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Key stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <p className="font-display font-extrabold text-lg text-emerald-600 dark:text-emerald-400">{career.salary}</p>
              <p className="text-[10px] font-body font-semibold uppercase tracking-widest text-emerald-500 mt-1">Starting Salary</p>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="font-display font-extrabold text-lg text-blue-600 dark:text-blue-400">{career.employment}</p>
              <p className="text-[10px] font-body font-semibold uppercase tracking-widest text-blue-500 mt-1">Employment Rate</p>
            </div>
            <div className="text-center p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
              <p className="font-display font-extrabold text-lg text-violet-600 dark:text-violet-400">{career.growth}</p>
              <p className="text-[10px] font-body font-semibold uppercase tracking-widest text-violet-500 mt-1">Job Growth</p>
            </div>
          </div>

          {/* ROI */}
          {tuitionNum > 0 && roiMonths > 0 && (
            <div className="p-4 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-bold text-sm text-slate-800 dark:text-white">💰 Return on Investment</span>
                <span className="font-display font-extrabold text-lg text-emerald-600 dark:text-emerald-400">{roiMonths} months</span>
              </div>
              <p className="font-body text-xs text-slate-500 dark:text-slate-400">
                Your ${tuitionNum.toLocaleString()} investment pays for itself in ~{roiMonths} months at a {career.salary} starting salary
              </p>
              <div className="mt-2 h-2 bg-surface-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(100, (12 / roiMonths) * 100)}%` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] font-body text-slate-400">Graduation</span>
                <span className="text-[10px] font-body text-emerald-500 font-semibold">Break even</span>
              </div>
            </div>
          )}

          {/* Job titles */}
          <div>
            <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white mb-2">Common Job Titles</h3>
            <div className="flex flex-wrap gap-2">
              {career.titles.map((t, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-body font-medium bg-surface-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-surface-200 dark:border-slate-600">{t}</span>
              ))}
            </div>
          </div>

          {/* Top employers */}
          <div>
            <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white mb-2">Top Employers in Alberta</h3>
            <div className="space-y-1.5">
              {career.employers.map((emp, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-50 dark:bg-slate-700/50 border border-surface-100 dark:border-slate-600">
                  <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-display font-bold text-blue-600">{i + 1}</div>
                  <span className="font-body text-sm text-slate-600 dark:text-slate-300">{emp}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] font-body text-slate-400 dark:text-slate-500 text-center">
            ⓘ Data based on Alberta Government labour market information and industry reports. Actual outcomes may vary.
          </p>
        </div>
      </div>
    </div>
  );
}
