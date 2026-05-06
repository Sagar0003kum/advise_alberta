import { ProgramResult } from "../types";
"use client";
import { useState } from "react";

const LIVING_COSTS = {
  "Calgary": { shared: 1200, solo: 1800, oncampus: 900 },
  "Edmonton": { shared: 1100, solo: 1700, oncampus: 850 },
  "Lethbridge": { shared: 900, solo: 1400, oncampus: 750 },
  "Red Deer": { shared: 950, solo: 1450, oncampus: 800 },
  "Medicine Hat": { shared: 850, solo: 1300, oncampus: 700 },
  "Grande Prairie": { shared: 950, solo: 1500, oncampus: 800 },
  "Fort McMurray": { shared: 1200, solo: 1900, oncampus: 900 },
  "Other": { shared: 950, solo: 1500, oncampus: 800 },
};

function extractNumber(str) {
  if (!str) return 0;
  const match = str.replace(/,/g, "").match(/\$([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

interface TuitionCalculatorProps { result: ProgramResult; onClose: () => void; }
export default function TuitionCalculator({ result, onClose }: TuitionCalculatorProps) {
  const [status, setStatus] = useState("domestic");
  const [housing, setHousing] = useState("shared");
  const [city, setCity] = useState(() => {
    const inst = result?.institution?.toLowerCase() || "";
    if (inst.includes("calgary") || inst.includes("sait") || inst.includes("bow valley") || inst.includes("mount royal")) return "Calgary";
    if (inst.includes("edmonton") || inst.includes("nait") || inst.includes("macewan") || inst.includes("norquest") || inst.includes("alberta")) return "Edmonton";
    if (inst.includes("lethbridge")) return "Lethbridge";
    if (inst.includes("red deer")) return "Red Deer";
    if (inst.includes("medicine hat")) return "Medicine Hat";
    if (inst.includes("grande prairie") || inst.includes("northwestern")) return "Grande Prairie";
    if (inst.includes("fort mcmurray") || inst.includes("keyano")) return "Fort McMurray";
    return "Other";
  });

  const tuitionStr = status === "domestic" ? result?.tuition_domestic : result?.tuition_international;
  const annualTuition = extractNumber(tuitionStr);
  const livingCosts = LIVING_COSTS[city] || LIVING_COSTS["Other"];
  const monthlyHousing = livingCosts[housing === "shared" ? "shared" : housing === "solo" ? "solo" : "oncampus"];
  const monthlyFood = 400;
  const monthlyTransit = 100;
  const monthlyPersonal = 200;
  const monthlyTotal = monthlyHousing + monthlyFood + monthlyTransit + monthlyPersonal;
  const annualLiving = monthlyTotal * 8; // 8 months academic year
  const books = 1500;
  const totalAnnual = annualTuition + annualLiving + books;

  // Duration estimate
  const durStr = (result?.duration || "").toLowerCase();
  const yearMatch = durStr.match(/([\d.]+)\s*year/);
  const years = yearMatch ? parseFloat(yearMatch[1]) : 2;
  const totalProgram = totalAnnual * years;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-[600px] mx-4 my-8 bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-slide-up">

        {/* Header */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-surface-200" style={{ background: "linear-gradient(135deg, #0D9488, #0891B2)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg text-white">Tuition Calculator</h2>
              <p className="font-body text-xs text-white/70 mt-0.5">{result?.program_name} · {result?.institution}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="px-5 sm:px-6 py-5 space-y-5">

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-body font-semibold uppercase tracking-widest text-slate-400 mb-1.5 block">Student Status</label>
              <div className="flex rounded-lg border border-surface-200 overflow-hidden">
                {["domestic", "international"].map((s) => (
                  <button key={s} onClick={() => setStatus(s)}
                    className={`flex-1 text-xs font-body font-semibold py-2 transition-all ${status === s ? "bg-primary text-white" : "bg-surface-50 text-slate-500 hover:bg-surface-100"}`}
                  >
                    {s === "domestic" ? "Domestic" : "Int'l"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-body font-semibold uppercase tracking-widest text-slate-400 mb-1.5 block">Housing</label>
              <select value={housing} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setHousing(e.target.value)}
                className="w-full text-xs font-body text-slate-600 bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 outline-none">
                <option value="shared">Shared apartment</option>
                <option value="solo">Solo apartment</option>
                <option value="oncampus">On-campus residence</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-body font-semibold uppercase tracking-widest text-slate-400 mb-1.5 block">City</label>
              <select value={city} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setCity(e.target.value)}
                className="w-full text-xs font-body text-slate-600 bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 outline-none">
                {Object.keys(LIVING_COSTS).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Breakdown */}
          <div className="border border-surface-200 rounded-xl overflow-hidden">
            <div className="bg-surface-50 px-4 py-2.5 border-b border-surface-200">
              <span className="text-[11px] font-body font-semibold uppercase tracking-widest text-slate-400">Annual Cost Breakdown</span>
            </div>

            <CostRow label="Tuition & Fees" amount={annualTuition} highlight />
            <CostRow label={`Housing (${housing}, ${city})`} amount={monthlyHousing * 8} sub={`$${monthlyHousing.toLocaleString()}/mo × 8 months`} />
            <CostRow label="Food & Groceries" amount={monthlyFood * 8} sub="$400/mo × 8 months" />
            <CostRow label="Transit (UPass/bus)" amount={monthlyTransit * 8} sub="$100/mo × 8 months" />
            <CostRow label="Personal & Supplies" amount={monthlyPersonal * 8} sub="$200/mo × 8 months" />
            <CostRow label="Books & Materials" amount={books} />

            <div className="flex items-center justify-between px-4 py-3 bg-primary-50 border-t-2 border-primary/20">
              <span className="font-display font-bold text-sm text-primary">Total per Year</span>
              <span className="font-display font-bold text-lg text-primary">${totalAnnual.toLocaleString()}</span>
            </div>
          </div>

          {/* Total program cost */}
          <div className="flex items-center justify-between px-5 py-4 rounded-xl" style={{ background: "linear-gradient(135deg, #0D9488, #0891B2)" }}>
            <div>
              <span className="font-display font-bold text-sm text-white">Total Program Cost</span>
              <span className="font-body text-xs text-white/60 ml-2">({years} year{years !== 1 ? "s" : ""})</span>
            </div>
            <span className="font-display font-extrabold text-xl text-white">${totalProgram.toLocaleString()}</span>
          </div>

          <p className="text-[11px] font-body text-slate-400 text-center">
            ⓘ Estimates based on average costs in {city}. Actual costs may vary. {annualTuition === 0 && "Tuition amount not available — enter manually or check the institution website."}
          </p>
        </div>
      </div>
    </div>
  );
}

function CostRow({ label, amount, sub, highlight }: { label: string; amount: number; sub?: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-100">
      <div>
        <span className={`text-sm font-body ${highlight ? "font-semibold text-slate-700" : "text-slate-600"}`}>{label}</span>
        {sub && <span className="text-[11px] font-body text-slate-400 ml-2">{sub}</span>}
      </div>
      <span className={`font-display font-semibold text-sm ${highlight ? "text-primary" : "text-slate-700"}`}>
        ${amount.toLocaleString()}
      </span>
    </div>
  );
}
