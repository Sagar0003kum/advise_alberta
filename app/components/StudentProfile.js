"use client";
import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { db } from "../lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const INTEREST_EMOJIS = { "Technology": "💻", "Healthcare": "🏥", "Business": "💼", "Engineering": "⚙️", "Arts": "🎨", "Education": "📚", "Trades": "🔧", "Science": "🔬", "Law": "⚖️", "Finance": "📊", "Sports": "⚽", "Environment": "🌿", "AI & Data": "🤖", "Music": "🎵", "Social Work": "🤝" };
const ALL_INTERESTS = Object.keys(INTEREST_EMOJIS);
const GOALS = ["Get a well-paying job", "Transfer to university", "Start my own business", "Help my community", "Work in tech", "Work in healthcare", "Go international", "Research & innovation"];
const PERSONALITY = ["Night owl 🦉", "Early bird 🐦", "Team player 🤝", "Solo learner 📖", "Hands-on 🔨", "Theory lover 🧠", "Creative 🎨", "Analytical 📐"];

// Scholarship matching based on profile
const SCHOLARSHIPS_DB = [
  { name: "Alexander Rutherford Scholarship", amount: "$2,500", match: (p) => parseFloat(p.gpa) >= 75, reason: "Your grades qualify you", url: "https://studentaid.alberta.ca/scholarships/alexander-rutherford-scholarship/" },
  { name: "Jason Lang Scholarship", amount: "$1,000", match: (p) => parseFloat(p.gpa) >= 80, reason: "GPA above 3.2 threshold", url: "https://studentaid.alberta.ca/scholarships/jason-lang-scholarship/" },
  { name: "Louise McKinney Scholarship", amount: "$2,500", match: (p) => parseFloat(p.gpa) >= 90, reason: "Top academic achiever", url: "https://studentaid.alberta.ca/scholarships/louise-mckinney-scholarship/" },
  { name: "STEM Diversity Scholarship", amount: "$1,000-$5,000", match: (p) => p.interests?.some(i => ["Technology","Engineering","Science","AI & Data"].includes(i)), reason: "Matched your STEM interests" },
  { name: "Alberta Indigenous Students Award", amount: "$2,000", match: (p) => p.indigenous === true, reason: "Indigenous student support" },
  { name: "Alberta Student Aid Grant", amount: "Up to $12,000", match: (p) => p.financial_need === true, reason: "Based on financial need", url: "https://studentaid.alberta.ca/" },
  { name: "International Student Entrance Award", amount: "$5,000-$15,000", match: (p) => p.status === "international", reason: "International student merit award" },
  { name: "Women in STEM Scholarship", amount: "$1,000-$3,000", match: (p) => p.interests?.some(i => ["Technology","Engineering","Science"].includes(i)), reason: "Encouraging STEM participation" },
  { name: "Arts & Culture Scholarship", amount: "$500-$2,000", match: (p) => p.interests?.some(i => ["Arts","Music"].includes(i)), reason: "Supporting creative talent" },
  { name: "Rural Alberta Scholarship", amount: "$1,500", match: (p) => p.from_rural === true, reason: "Supporting rural students" },
  { name: "Trades Training Bursary", amount: "$1,000", match: (p) => p.interests?.includes("Trades"), reason: "Matched your trades interest", url: "https://studentaid.alberta.ca/" },
  { name: "Healthcare Heroes Bursary", amount: "$2,000", match: (p) => p.interests?.includes("Healthcare"), reason: "Supporting future healthcare workers" },
];

export default function StudentProfile({ onClose }) {
  const { user, loginWithGoogle } = useAuth();
  const [tab, setTab] = useState("profile"); // profile | scholarships
  const [profile, setProfile] = useState({
    interests: [], goals: [], personality: [], gpa: "", status: "domestic",
    indigenous: false, financial_need: false, from_rural: false, bio: "",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load existing profile
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "profiles", user.uid));
        if (snap.exists()) setProfile(prev => ({ ...prev, ...snap.data() }));
      } catch {}
    })();
  }, [user]);

  function toggle(field, value) {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter(v => v !== value) : [...prev[field], value],
    }));
  }

  async function saveProfile() {
    if (!user) { try { await loginWithGoogle(); } catch { return; } }
    setLoading(true);
    try {
      await setDoc(doc(db, "profiles", user.uid), { ...profile, updatedAt: serverTimestamp() }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const matchedScholarships = SCHOLARSHIPS_DB.filter(s => s.match(profile));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-[580px] mx-4 my-6 sm:my-10 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-slide-up">

        {/* Header — gradient card like dating apps */}
        <div className="relative px-6 py-6" style={{ background: "linear-gradient(135deg, #0D9488, #0891B2)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-white">✨ My Student Profile</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
          </div>
          {/* Profile card preview */}
          <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full border-2 border-white/50" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-white font-display font-bold text-lg">
                  {user?.displayName?.[0] || "?"}
                </div>
              )}
              <div>
                <p className="font-display font-bold text-white">{user?.displayName || "Student"}</p>
                <p className="text-xs text-white/70">{profile.interests.slice(0, 3).map(i => INTEREST_EMOJIS[i] || "📌").join(" ")} {profile.interests.length > 0 ? profile.interests.slice(0, 2).join(", ") : "No interests yet"}</p>
              </div>
            </div>
            {profile.bio && <p className="text-xs text-white/80 mt-2 italic">"{profile.bio}"</p>}
            <div className="flex gap-2 mt-3">
              {profile.gpa && <span className="text-[10px] font-bold text-white/90 bg-white/20 px-2 py-0.5 rounded-full">GPA: {profile.gpa}%</span>}
              <span className="text-[10px] font-bold text-white/90 bg-white/20 px-2 py-0.5 rounded-full capitalize">{profile.status}</span>
              {matchedScholarships.length > 0 && <span className="text-[10px] font-bold text-white/90 bg-emerald-500/40 px-2 py-0.5 rounded-full">🎓 {matchedScholarships.length} scholarships</span>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-surface-200 dark:border-slate-700">
          <button onClick={() => setTab("profile")} className={`flex-1 py-3 text-sm font-body font-semibold transition-all ${tab === "profile" ? "text-primary-600 border-b-2 border-primary-500" : "text-slate-400"}`}>Build Profile</button>
          <button onClick={() => setTab("scholarships")} className={`flex-1 py-3 text-sm font-body font-semibold transition-all relative ${tab === "scholarships" ? "text-primary-600 border-b-2 border-primary-500" : "text-slate-400"}`}>
            Scholarship Matches
            {matchedScholarships.length > 0 && <span className="absolute top-2 right-1/4 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">{matchedScholarships.length}</span>}
          </button>
        </div>

        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {tab === "profile" && (
            <div className="space-y-5 animate-fade-slide-up">
              {/* Bio */}
              <div>
                <label className="text-[11px] font-body font-semibold uppercase tracking-widest text-slate-400 mb-1.5 block">Your bio (one-liner)</label>
                <input value={profile.bio} onChange={e => setProfile(p => ({...p, bio: e.target.value}))} maxLength={100}
                  placeholder="e.g., Future software developer from Calgary 🚀" className="w-full text-sm font-body text-slate-700 dark:text-slate-200 bg-surface-50 dark:bg-slate-700 border border-surface-200 dark:border-slate-600 rounded-xl px-4 py-2.5 outline-none"/>
              </div>

              {/* GPA */}
              <div>
                <label className="text-[11px] font-body font-semibold uppercase tracking-widest text-slate-400 mb-1.5 block">High school average / GPA (%)</label>
                <input value={profile.gpa} onChange={e => setProfile(p => ({...p, gpa: e.target.value}))} type="number" min="0" max="100"
                  placeholder="e.g., 82" className="w-full text-sm font-body text-slate-700 dark:text-slate-200 bg-surface-50 dark:bg-slate-700 border border-surface-200 dark:border-slate-600 rounded-xl px-4 py-2.5 outline-none"/>
              </div>

              {/* Status */}
              <div>
                <label className="text-[11px] font-body font-semibold uppercase tracking-widest text-slate-400 mb-1.5 block">Student status</label>
                <div className="flex gap-2">
                  {["domestic","international"].map(s => (
                    <button key={s} onClick={() => setProfile(p => ({...p, status: s}))}
                      className={`flex-1 py-2 rounded-lg text-xs font-body font-semibold border transition-all capitalize ${profile.status === s ? "bg-primary-50 dark:bg-primary-700/20 border-primary-200 text-primary-700 dark:text-primary-200" : "bg-surface-50 dark:bg-slate-700 border-surface-200 dark:border-slate-600 text-slate-500"}`}>{s}</button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="text-[11px] font-body font-semibold uppercase tracking-widest text-slate-400 mb-1.5 block">Interests (pick all that apply)</label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_INTERESTS.map(i => (
                    <button key={i} onClick={() => toggle("interests", i)}
                      className={`px-2.5 py-1.5 rounded-lg text-[12px] font-body font-medium border transition-all ${profile.interests.includes(i) ? "bg-primary-50 dark:bg-primary-700/20 border-primary-200 text-primary-700 dark:text-primary-200" : "bg-surface-50 dark:bg-slate-700 border-surface-200 dark:border-slate-600 text-slate-500 dark:text-slate-400"}`}>
                      {INTEREST_EMOJIS[i]} {i}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div>
                <label className="text-[11px] font-body font-semibold uppercase tracking-widest text-slate-400 mb-1.5 block">Career goals</label>
                <div className="flex flex-wrap gap-1.5">
                  {GOALS.map(g => (
                    <button key={g} onClick={() => toggle("goals", g)}
                      className={`px-2.5 py-1.5 rounded-lg text-[12px] font-body font-medium border transition-all ${profile.goals.includes(g) ? "bg-amber-100 dark:bg-amber-900/30 border-amber-300 text-amber-700 dark:text-amber-300" : "bg-surface-50 dark:bg-slate-700 border-surface-200 dark:border-slate-600 text-slate-500 dark:text-slate-400"}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personality */}
              <div>
                <label className="text-[11px] font-body font-semibold uppercase tracking-widest text-slate-400 mb-1.5 block">Study personality</label>
                <div className="flex flex-wrap gap-1.5">
                  {PERSONALITY.map(p => (
                    <button key={p} onClick={() => toggle("personality", p)}
                      className={`px-2.5 py-1.5 rounded-lg text-[12px] font-body font-medium border transition-all ${profile.personality.includes(p) ? "bg-ocean-light/10 dark:bg-ocean-dark/20 border-ocean-light text-ocean-dark dark:text-ocean-light" : "bg-surface-50 dark:bg-slate-700 border-surface-200 dark:border-slate-600 text-slate-500 dark:text-slate-400"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Eligibility checkboxes */}
              <div className="space-y-2">
                <label className="text-[11px] font-body font-semibold uppercase tracking-widest text-slate-400 mb-1.5 block">Eligibility (for scholarships)</label>
                {[
                  { key: "indigenous", label: "I am an Indigenous student" },
                  { key: "financial_need", label: "I have financial need" },
                  { key: "from_rural", label: "I'm from rural Alberta" },
                ].map(opt => (
                  <label key={opt.key} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-50 dark:bg-slate-700/50 border border-surface-200 dark:border-slate-600 cursor-pointer hover:bg-surface-100 dark:hover:bg-slate-700 transition-colors">
                    <input type="checkbox" checked={profile[opt.key]} onChange={e => setProfile(p => ({...p, [opt.key]: e.target.checked}))}
                      className="w-4 h-4 rounded accent-primary-500" />
                    <span className="text-sm font-body text-slate-600 dark:text-slate-300">{opt.label}</span>
                  </label>
                ))}
              </div>

              {/* Save */}
              <button onClick={saveProfile} disabled={loading}
                className="w-full py-3 rounded-xl font-display font-bold text-sm text-white disabled:opacity-50 transition-all hover:brightness-110" style={{ background: "linear-gradient(135deg, #0D9488, #0891B2)" }}>
                {loading ? "Saving..." : saved ? "✓ Saved!" : user ? "Save Profile" : "Sign in & Save Profile"}
              </button>
            </div>
          )}

          {tab === "scholarships" && (
            <div className="space-y-3 animate-fade-slide-up">
              {matchedScholarships.length > 0 ? (
                <>
                  <p className="font-body text-sm text-slate-500 dark:text-slate-400">Based on your profile, you may qualify for:</p>
                  {matchedScholarships.map((s, i) => (
                    <div key={i} className="p-4 rounded-xl border border-surface-200 dark:border-slate-600 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-display font-bold text-sm text-slate-800 dark:text-white">{s.name}</h4>
                          <p className="font-display font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{s.amount}</p>
                          <p className="font-body text-xs text-slate-400 dark:text-slate-500 mt-1">✓ {s.reason}</p>
                        </div>
                        {s.url && (
                          <a href={s.url} target="_blank" rel="noopener noreferrer"
                            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-body font-semibold text-white hover:brightness-110" style={{ background: "linear-gradient(135deg, #059669, #10B981)" }}>
                            Apply →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  <p className="text-[11px] font-body text-slate-400 text-center">Complete your profile to discover more scholarships</p>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-3xl mb-3">🎓</p>
                  <p className="font-body text-sm text-slate-500 dark:text-slate-400 mb-2">No matches yet</p>
                  <p className="font-body text-xs text-slate-400">Fill out your profile to find scholarships you qualify for</p>
                  <button onClick={() => setTab("profile")} className="mt-3 text-sm font-body font-semibold text-primary-600 dark:text-primary-light hover:underline">← Build your profile</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}