"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

async function fetchProgramDetail(programName, institution) {
  const res = await fetch("/api/program-detail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ program_name: programName, institution }),
  });
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

function StatBox({ label, value, sub, accent = "#0D9488", large = false }) {
  return (
    <div className="rounded-xl p-4 sm:p-5 flex flex-col gap-1"
      style={{ background: accent + "08", border: `1px solid ${accent}20` }}>
      <span className="text-[10px] font-body font-semibold uppercase tracking-widest text-slate-400">{label}</span>
      <span className={`font-display font-bold leading-tight ${large ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"}`}
        style={{ color: accent }}>{value}</span>
      {sub && <span className="text-[11px] font-body text-slate-400">{sub}</span>}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
        <div className="w-1 h-5 rounded-full bg-primary" />
        <h2 className="font-display font-bold text-base sm:text-lg text-slate-800">{title}</h2>
        <div className="h-px flex-1 bg-surface-200" />
      </div>
      {children}
    </div>
  );
}

function TimelineRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-2.5 border-b border-surface-100 last:border-0">
      <span className="font-body text-[12px] sm:text-sm text-slate-400 w-36 shrink-0 pt-0.5">{label}</span>
      <span className="font-body text-[13px] sm:text-sm text-slate-700 leading-relaxed">{value}</span>
    </div>
  );
}

function Tag({ text, color = "#0D9488" }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] sm:text-xs font-body font-semibold"
      style={{ background: color + "12", color, border: `1px solid ${color}25` }}>
      {text}
    </span>
  );
}

function SourceBadge({ color, bg, border, icon, label }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-body font-semibold px-3 py-1.5 rounded-full ${bg} ${border}`}
      style={{ color }}>
      {icon}
      {label}
    </span>
  );
}

function DetailSkeleton() {
  return (
    <div className="animate-skeleton space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl p-6 border border-surface-200">
          <div className="w-1/2 h-5 bg-primary-50 rounded mb-3" />
          <div className="w-full h-4 bg-surface-100 rounded mb-2" />
          <div className="w-4/5 h-4 bg-surface-100 rounded" />
        </div>
      ))}
    </div>
  );
}

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const InfoIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
  </svg>
);

export default function ProgramPage({ result, onBack }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const accent = result?.inst_color || "#0D9488";

  useEffect(() => {
    if (!result) return;
    setLoading(true);
    fetchProgramDetail(result.program_name, result.institution)
      .then((data) => { setDetail(data); setLoading(false); })
      .catch(() => { setDetail(null); setLoading(false); });
  }, [result?.program_name, result?.institution]);

  if (!result) return null;

  const d = detail || {};
  const r = result;
  const program = {
    program_name:           d.program_name           || r.program_name,
    institution:            d.institution            || r.institution,
    credential:             d.credential             || r.credential,
    duration:               d.duration               || r.duration,
    tuition_domestic:       d.tuition_domestic       || r.tuition_domestic,
    tuition_international:  d.tuition_international  || r.tuition_international,
    intake:                 d.intake                 || r.intake,
    semester_structure:     d.semester_structure     || r.semester_structure,
    source_url:             d.source_url             || r.source_url,
    description:            d.description            || null,
    admission_requirements: d.admission_requirements || null,
    career_outcomes:        d.career_outcomes        || [],
    courses:                d.courses                || [],
    co_op:                  d.co_op                  ?? null,
    online_available:       d.online_available       ?? null,
    accreditation:          d.accreditation          || null,
    application_deadline:   d.application_deadline   || null,
    program_code:           d.program_code           || null,
    campus:                 d.campus                 || null,
    contact_email:          d.contact_email          || null,
    contact_phone:          d.contact_phone          || null,
    application_url:        d.application_url        || null,
    last_verified:          d.last_verified          || null,
    from_verified:          !!d.from_verified,
    from_ai:                !!d.from_ai,
    from_db:                !!d.from_db,
  };

  return (
    <div className="min-h-screen bg-white font-body">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {["absolute inset-x-0 top-0 h-[220px] sm:h-[260px]", "absolute inset-x-0 bottom-0 h-[220px] sm:h-[260px]"].map((cls, i) => (
          <div key={i} className={cls} style={{
            background: `linear-gradient(135deg, ${accent}E0 0%, #0891B2 60%, #06B6D4 100%)`,
            ...(i === 1 ? { borderRadius: "0 0 50% 50% / 0 0 50px 50px" } : {})
          }} />
        ))}
        <div className="absolute inset-x-0 top-0 h-[220px] sm:h-[260px] opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative z-10 max-w-[900px] mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-14 sm:pb-16">
          <button onClick={onBack}
            className="flex items-center gap-1.5 text-white/75 hover:text-white font-body text-sm font-medium transition-colors mb-6">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to results
          </button>

          <div className="flex flex-wrap items-start gap-3 mb-2">
            {[
              program.credential && { label: program.credential, style: "bg-white/20 border-white/30" },
              program.co_op      && { label: "Co-op Available",   style: "bg-amber-400/30 border-amber-300/40" },
              program.online_available && { label: "Online Available", style: "bg-emerald-400/30 border-emerald-300/40" },
            ].filter(Boolean).map((badge) => (
              <span key={badge.label}
                className={`self-start text-[11px] font-bold font-body uppercase tracking-wider px-3 py-1 rounded-full text-white border backdrop-blur-sm ${badge.style}`}>
                {badge.label}
              </span>
            ))}
          </div>

          <h1 className="font-display font-extrabold text-white leading-[1.1] tracking-tight mb-3"
            style={{ fontSize: "clamp(22px, 4.5vw, 40px)" }}>
            {program.program_name}
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-white/80" />
            <span className="font-body text-white/85 text-sm sm:text-base font-medium">
              {program.institution}{program.campus && ` · ${program.campus}`}
            </span>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 mt-8 sm:mt-10 pb-16">

        {/* Source badges */}
        {(program.from_verified || program.from_ai || program.from_db) && (
          <div className="flex flex-wrap items-center gap-2 mb-4 animate-fade-slide-up">
            {program.from_verified && (
              <>
                <SourceBadge color="#059669" bg="bg-emerald-50" border="border border-emerald-200" icon={<CheckIcon />} label="Fees verified from official source" />
                {program.last_verified && (
                  <span className="text-[11px] font-body text-slate-400">
                    Last checked {new Date(program.last_verified).toLocaleDateString()}
                  </span>
                )}
              </>
            )}
            {program.from_db && <SourceBadge color="#059669" bg="bg-emerald-50" border="border border-emerald-200" icon={<CheckIcon />} label="Verified data from our database" />}
            {program.from_ai && <SourceBadge color="#2563EB" bg="bg-blue-50" border="border border-blue-200" icon={<InfoIcon />} label="Program details AI-sourced · Always verify with institution" />}
          </div>
        )}

        {loading ? (
          <div className="mt-4"><DetailSkeleton /></div>
        ) : (
          <div className="animate-fade-slide-up">

            {/* Key stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-8">
              {program.tuition_domestic    && <StatBox label="Domestic Tuition"      value={program.tuition_domestic}    sub="per year unless noted" accent="#0D9488" large />}
              {program.tuition_international && <StatBox label="International Tuition" value={program.tuition_international} sub="per year unless noted" accent="#0891B2" large />}
              {program.duration            && <StatBox label="Duration"              value={program.duration}            accent="#334155" />}
              {program.intake              && <StatBox label="Intake"                value={program.intake}              accent="#7C3AED" />}
              {program.semester_structure  && <StatBox label="Semesters"             value={program.semester_structure}  accent="#D97706" />}
              {program.application_deadline && <StatBox label="Application Deadline"  value={program.application_deadline} accent="#DC2626" />}
            </div>

            {/* About */}
            {program.description && (
              <Section title="About This Program">
                <div className="bg-surface-50 border border-surface-200 rounded-xl px-5 py-4">
                  <p className="font-body text-sm sm:text-[15px] text-slate-700 leading-relaxed">{program.description}</p>
                </div>
              </Section>
            )}

            {/* Program Details */}
            <Section title="Program Details">
              <div className="bg-white border border-surface-200 rounded-xl px-4 sm:px-5">
                <TimelineRow label="Program Code"        value={program.program_code} />
                <TimelineRow label="Credential"          value={program.credential} />
                <TimelineRow label="Duration"            value={program.duration} />
                <TimelineRow label="Campus / Location"   value={program.campus} />
                <TimelineRow label="Intake Dates"        value={program.intake} />
                <TimelineRow label="Semester Structure"  value={program.semester_structure} />
                <TimelineRow label="Application Deadline" value={program.application_deadline} />
                <TimelineRow label="Accreditation"       value={program.accreditation} />
                <TimelineRow label="Co-op / Work Term"   value={program.co_op === true ? "Yes — Co-op available" : program.co_op === false ? "No" : null} />
                <TimelineRow label="Online Available"    value={program.online_available === true ? "Yes" : program.online_available === false ? "No — In-person only" : null} />
              </div>
            </Section>

            {/* Admission Requirements */}
            {program.admission_requirements && (
              <Section title="Admission Requirements">
                <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4">
                  <p className="font-body text-sm text-slate-700 leading-relaxed whitespace-pre-line">{program.admission_requirements}</p>
                </div>
              </Section>
            )}

            {/* Sample Courses */}
            {program.courses.length > 0 && (
              <Section title="Sample Courses">
                <div className="flex flex-wrap gap-2">
                  {program.courses.map((c, i) => <Tag key={i} text={c} color={accent} />)}
                </div>
              </Section>
            )}

            {/* Career Outcomes */}
            {program.career_outcomes.length > 0 && (
              <Section title="Career Outcomes">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {program.career_outcomes.map((c, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-surface-50 border border-surface-200 rounded-lg px-4 py-2.5">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accent }} />
                      <span className="font-body text-[13px] text-slate-700">{c}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Contact & Apply */}
            {(program.contact_email || program.contact_phone) && (
              <Section title="Contact & Apply">
                <div className="bg-white border border-surface-200 rounded-xl px-4 sm:px-5">
                  <TimelineRow label="Email" value={program.contact_email} />
                  <TimelineRow label="Phone" value={program.contact_phone} />
                </div>
              </Section>
            )}

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              {program.application_url && (
                <a href={program.application_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-display font-bold text-sm text-white px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:brightness-110 no-underline"
                  style={{ background: "linear-gradient(135deg, #F59E0B, #F97316)" }}>
                  Apply Now →
                </a>
              )}
              {program.source_url && (
                <a href={program.source_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-display font-bold text-sm px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-md no-underline border"
                  style={{ color: accent, borderColor: accent + "40", background: accent + "08" }}>
                  View Official Program Page →
                </a>
              )}
            </div>

            {/* Disclaimer */}
            <div className="mt-8 p-3 sm:p-4 bg-surface-50 border border-surface-200 rounded-xl flex items-start gap-2.5">
              <span className="text-sm text-slate-400 flex-shrink-0">ⓘ</span>
              <p className="font-body text-xs text-slate-400 leading-relaxed">
                {program.from_db
                  ? "This program's details are sourced from our verified database. Always confirm directly with the institution before applying."
                  : program.from_verified && program.from_ai
                  ? "Tuition and duration data is sourced from official fee schedules. Program details (description, courses, career outcomes) are AI-sourced. Always verify directly with the institution before applying."
                  : "Program information was retrieved in real-time from official institution websites. Fees marked with ~ are estimates. Always verify directly with the institution before applying."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-surface-200 py-6 text-center">
        <p className="font-body text-[11px] sm:text-xs text-slate-400 leading-relaxed px-4">
          AdviseAlberta is an independent tool and is not affiliated with ApplyAlberta or any Alberta institution.
          <br className="hidden sm:block" />
          <span className="sm:inline"> All program data is sourced from official institution websites. Always verify before applying.</span>
        </p>
      </footer>
    </div>
  );
}