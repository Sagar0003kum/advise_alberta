"use client";
import { useState } from "react";

const INTEREST_TAGS = ["Technology","Healthcare","Business","Engineering","Arts & Design","Education","Trades","Science","Law","Agriculture","Social Work","Environment","Finance","Data & AI","Sports & Kinesiology"];
const CITIES = ["Calgary","Edmonton","Lethbridge","Red Deer","Medicine Hat","Grande Prairie","Any city"];
const BUDGETS = ["Under $5,000/year","$5,000-$10,000/year","$10,000-$20,000/year","$20,000+/year","Flexible"];

interface ProgramMatcherProps { onClose: () => void; }
export default function ProgramMatcher({ onClose }: ProgramMatcherProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ grades: "", interests: [], city: "", budget: "", credential: "", description: "" });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  function toggleInterest(tag) {
    setForm(prev => ({ ...prev, interests: prev.interests.includes(tag) ? prev.interests.filter(t => t !== tag) : [...prev.interests, tag] }));
  }

  async function getMatches() {
    setLoading(true);
    try {
      const res = await fetch("/api/match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      setResults(data.recommendations || []);
      setStep(4);
    } catch { setResults([]); setStep(4); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-[640px] mx-4 my-6 sm:my-10 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-slide-up">

        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #0D9488, #0891B2)" }}>
          <div>
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">🎯 AI Program Matcher</h2>
            <p className="font-body text-xs text-white/70 mt-0.5">Step {Math.min(step, 3)} of 3 — {step === 1 ? "Your Interests" : step === 2 ? "Your Background" : step === 3 ? "Your Preferences" : "Results"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
        </div>

        {/* Progress */}
        <div className="h-1.5 bg-surface-200 dark:bg-slate-700"><div className="h-full transition-all duration-500 rounded-r" style={{ width: `${(Math.min(step,3)/3)*100}%`, background: "linear-gradient(90deg, #0D9488, #0891B2)" }}/></div>

        <div className="px-6 py-6">
          {/* Step 1: Interests */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-slide-up">
              <div>
                <h3 className="font-display font-bold text-base text-slate-800 dark:text-white">What are you interested in?</h3>
                <p className="font-body text-sm text-slate-400 mt-1">Select all that excite you</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {INTEREST_TAGS.map(tag => (
                  <button key={tag} onClick={() => toggleInterest(tag)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-body font-medium transition-all border ${form.interests.includes(tag) ? "bg-primary-50 dark:bg-primary-700/20 border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-200 shadow-sm" : "bg-surface-50 dark:bg-slate-700 border-surface-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-violet-200"}`}>
                    {form.interests.includes(tag) && "✓ "}{tag}
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(2)} disabled={form.interests.length === 0}
                className="w-full py-3 rounded-xl font-display font-bold text-sm text-white disabled:opacity-30 transition-all hover:brightness-110" style={{ background: "linear-gradient(135deg, #0D9488, #0891B2)" }}>
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Background */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-slide-up">
              <div>
                <h3 className="font-display font-bold text-base text-slate-800 dark:text-white">Tell us about yourself</h3>
                <p className="font-body text-sm text-slate-400 mt-1">This helps estimate your admission chances</p>
              </div>
              <div>
                <label className="text-[11px] font-body font-semibold uppercase tracking-widest text-slate-400 mb-1.5 block">Your grades / GPA</label>
                <input value={form.grades} onChange={e => setForm(p => ({...p, grades: e.target.value}))}
                  placeholder="e.g., 82% average, strong in math and science" className="w-full text-sm font-body text-slate-700 dark:text-slate-200 bg-surface-50 dark:bg-slate-700 border border-surface-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:border-primary-200"/>
              </div>
              <div>
                <label className="text-[11px] font-body font-semibold uppercase tracking-widest text-slate-400 mb-1.5 block">Tell us more (optional)</label>
                <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
                  placeholder="e.g., I love building apps, want to work at a tech company after graduation, interested in AI and machine learning..."
                  rows={3} className="w-full text-sm font-body text-slate-700 dark:text-slate-200 bg-surface-50 dark:bg-slate-700 border border-surface-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:border-primary-200 resize-none"/>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl font-body font-semibold text-sm text-slate-500 border border-surface-200 dark:border-slate-600 hover:bg-surface-50 dark:hover:bg-slate-700">← Back</button>
                <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl font-display font-bold text-sm text-white hover:brightness-110" style={{ background: "linear-gradient(135deg, #0D9488, #0891B2)" }}>Continue →</button>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-slide-up">
              <div>
                <h3 className="font-display font-bold text-base text-slate-800 dark:text-white">Your preferences</h3>
                <p className="font-body text-sm text-slate-400 mt-1">Help us narrow down the best matches</p>
              </div>
              <div>
                <label className="text-[11px] font-body font-semibold uppercase tracking-widest text-slate-400 mb-1.5 block">Preferred city</label>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map(c => (
                    <button key={c} onClick={() => setForm(p => ({...p, city: c}))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium border transition-all ${form.city === c ? "bg-primary-50 dark:bg-primary-700/20 border-primary-200 text-primary-700 dark:text-primary-200" : "bg-surface-50 dark:bg-slate-700 border-surface-200 dark:border-slate-600 text-slate-500 dark:text-slate-400"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-body font-semibold uppercase tracking-widest text-slate-400 mb-1.5 block">Budget</label>
                <div className="flex flex-wrap gap-2">
                  {BUDGETS.map(b => (
                    <button key={b} onClick={() => setForm(p => ({...p, budget: b}))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium border transition-all ${form.budget === b ? "bg-primary-50 dark:bg-primary-700/20 border-primary-200 text-primary-700 dark:text-primary-200" : "bg-surface-50 dark:bg-slate-700 border-surface-200 dark:border-slate-600 text-slate-500 dark:text-slate-400"}`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-body font-semibold uppercase tracking-widest text-slate-400 mb-1.5 block">Credential type</label>
                <div className="flex flex-wrap gap-2">
                  {["Degree","Diploma","Certificate","Any"].map(c => (
                    <button key={c} onClick={() => setForm(p => ({...p, credential: c}))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium border transition-all ${form.credential === c ? "bg-primary-50 dark:bg-primary-700/20 border-primary-200 text-primary-700 dark:text-primary-200" : "bg-surface-50 dark:bg-slate-700 border-surface-200 dark:border-slate-600 text-slate-500 dark:text-slate-400"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="px-5 py-3 rounded-xl font-body font-semibold text-sm text-slate-500 border border-surface-200 dark:border-slate-600">← Back</button>
                <button onClick={getMatches} disabled={loading}
                  className="flex-1 py-3 rounded-xl font-display font-bold text-sm text-white hover:brightness-110 disabled:opacity-50" style={{ background: "linear-gradient(135deg, #0D9488, #0891B2)" }}>
                  {loading ? "🔍 Analyzing..." : "Find My Matches →"}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {step === 4 && results && (
            <div className="space-y-4 animate-fade-slide-up">
              <div>
                <h3 className="font-display font-bold text-base text-slate-800 dark:text-white">Your Top Matches</h3>
                <p className="font-body text-sm text-slate-400 mt-1">Based on your profile, here are your best-fit programs</p>
              </div>
              {results.length > 0 ? results.map((r, i) => (
                <div key={i} className="border border-surface-200 dark:border-slate-600 rounded-xl p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-display font-bold text-sm text-slate-800 dark:text-white">{r.program}</h4>
                      <p className="font-body text-xs text-slate-400 dark:text-slate-500">{r.institution}</p>
                    </div>
                    <div className="flex-shrink-0 text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-display font-extrabold text-sm border-2 ${r.match >= 80 ? "border-emerald-400 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" : r.match >= 60 ? "border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-900/20" : "border-slate-300 text-slate-500 bg-surface-50 dark:bg-slate-700"}`}>
                        {r.match}%
                      </div>
                      <span className="text-[9px] font-body font-semibold text-slate-400 uppercase tracking-wider mt-0.5 block">Match</span>
                    </div>
                  </div>
                  <p className="font-body text-xs text-slate-500 dark:text-slate-400 mb-2">{r.reason}</p>
                  <div className="flex gap-3 text-[11px] font-body text-slate-400 dark:text-slate-500">
                    {r.tuition && <span>💰 {r.tuition}</span>}
                    {r.duration && <span>⏱ {r.duration}</span>}
                    {r.admission && <span>🎓 Admission: {r.admission}</span>}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-slate-400 font-body">
                  <p className="text-sm">No matches found. Try adjusting your preferences.</p>
                </div>
              )}
              <button onClick={() => { setStep(1); setResults(null); }}
                className="w-full py-2.5 rounded-xl font-body font-semibold text-sm text-primary-600 dark:text-primary-light border border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all">
                ← Start Over
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}