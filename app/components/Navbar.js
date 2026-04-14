import DarkModeToggle from "./DarkModeToggle";
import UserMenu from "./UserMenu";

function AnimatedLogo() {
  return (
    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0D9488, #0891B2)" }}
    >
      <style>{`
        @keyframes kickLeg {
          0%, 18% { transform: rotate(0deg); }
          22% { transform: rotate(-45deg); }
          32%, 100% { transform: rotate(0deg); }
        }
        @keyframes ballPath {
          0%, 18% { transform: translate(0px, 0px); }
          22% { transform: translate(0px, -3px); }
          32% { transform: translate(-6px, -18px); }
          42% { transform: translate(-8px, -28px); }
          52% { transform: translate(-9px, -26px); }
          62% { transform: translate(-9px, -25.5px); }
          72%, 100% { transform: translate(-9px, -25.5px); }
        }
        @keyframes ballToCapFade {
          0%, 28% { opacity: 1; }
          36% { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes capFromBallFade {
          0%, 28% { opacity: 0; }
          36% { opacity: 1; }
          100% { opacity: 1; }
        }
        @keyframes ballSpin {
          0%, 18% { transform: rotate(0deg); }
          22% { transform: rotate(45deg); }
          32% { transform: rotate(180deg); }
          42% { transform: rotate(360deg); }
        }
        @keyframes capSettle {
          0%, 36% { transform: rotate(-20deg); }
          50% { transform: rotate(10deg); }
          62% { transform: rotate(-3deg); }
          72%, 100% { transform: rotate(0deg); }
        }
        @keyframes armCelebrate {
          0%, 68% { transform: rotate(0deg); }
          74% { transform: rotate(-20deg); }
          82% { transform: rotate(-25deg); }
          90% { transform: rotate(-15deg); }
          96%, 100% { transform: rotate(0deg); }
        }
        @keyframes headNod {
          0%, 68% { transform: translateY(0); }
          72% { transform: translateY(1px); }
          76%, 100% { transform: translateY(0); }
        }
        @keyframes starPop1 {
          0%, 70% { opacity: 0; r: 0; }
          76% { opacity: 1; r: 1.2; }
          88% { opacity: 0; r: 0.3; }
          100% { opacity: 0; }
        }
        @keyframes starPop2 {
          0%, 74% { opacity: 0; r: 0; }
          80% { opacity: 1; r: 1; }
          90% { opacity: 0; r: 0.3; }
          100% { opacity: 0; }
        }
        @keyframes starPop3 {
          0%, 78% { opacity: 0; r: 0; }
          84% { opacity: 1; r: 0.8; }
          94% { opacity: 0; r: 0.2; }
          100% { opacity: 0; }
        }
        .kick-leg { animation: kickLeg 5s ease-in-out infinite; transform-origin: 20px 27px; }
        .ball-path { animation: ballPath 5s ease-in-out infinite; }
        .ball-fade { animation: ballToCapFade 5s ease-in-out infinite; }
        .cap-appear { animation: capFromBallFade 5s ease-in-out infinite; }
        .ball-spin { animation: ballSpin 5s ease-in-out infinite; transform-origin: center; }
        .cap-settle { animation: capSettle 5s ease-in-out infinite; transform-origin: center; }
        .arm-cel { animation: armCelebrate 5s ease-in-out infinite; transform-origin: 17px 20px; }
        .head-nod { animation: headNod 5s ease-in-out infinite; }
        .star-1 { animation: starPop1 5s ease-in-out infinite; }
        .star-2 { animation: starPop2 5s ease-in-out infinite; }
        .star-3 { animation: starPop3 5s ease-in-out infinite; }
      `}</style>

      <svg width="30" height="30" viewBox="0 0 40 40" fill="none" className="relative z-10">

        {/* ── STICK FIGURE (line sketch) ── */}
        <g className="head-nod">
          <circle cx="17" cy="12" r="4" stroke="white" strokeWidth="1.5" fill="none" />
          <circle cx="15.5" cy="11.5" r="0.6" fill="white" />
          <circle cx="18.5" cy="11.5" r="0.6" fill="white" />
          <path d="M15.5 13.5Q17 15 18.5 13.5" stroke="white" strokeWidth="0.6" fill="none" strokeLinecap="round" />
        </g>

        <line x1="17" y1="16" x2="17" y2="27" stroke="white" strokeWidth="1.5" strokeLinecap="round" />

        <g className="arm-cel">
          <line x1="17" y1="20" x2="11" y2="24" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="17" y1="20" x2="23" y2="24" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        <line x1="17" y1="27" x2="13" y2="34" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="13" y1="34" x2="11" y2="34" stroke="white" strokeWidth="1.5" strokeLinecap="round" />

        <g className="kick-leg">
          <line x1="17" y1="27" x2="21" y2="34" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="21" y1="34" x2="23" y2="34" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* ── FOOTBALL + CAP (same path, football fades out, cap fades in) ── */}
        <g className="ball-path">

          {/* FOOTBALL — visible at start, fades out mid-air */}
          <g className="ball-fade">
            <g className="ball-spin">
              {/* Football oval */}
              <ellipse cx="26" cy="34.5" rx="2.8" ry="1.8" stroke="white" strokeWidth="1.2" fill="none" />
              {/* Football laces */}
              <line x1="24.5" y1="34.5" x2="27.5" y2="34.5" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
              <line x1="25.2" y1="33.5" x2="25.2" y2="35.5" stroke="white" strokeWidth="0.5" strokeLinecap="round" />
              <line x1="26" y1="33.2" x2="26" y2="35.8" stroke="white" strokeWidth="0.5" strokeLinecap="round" />
              <line x1="26.8" y1="33.5" x2="26.8" y2="35.5" stroke="white" strokeWidth="0.5" strokeLinecap="round" />
            </g>
          </g>

          {/* GRADUATION CAP — hidden at start, appears mid-air */}
          <g className="cap-appear">
            <g className="cap-settle">
              {/* Cap diamond */}
              <path d="M26 33L22.5 35L26 37L29.5 35Z" stroke="white" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
              {/* Cap button top */}
              <line x1="26" y1="33" x2="26" y2="32" stroke="white" strokeWidth="1" strokeLinecap="round" />
              {/* Tassel string */}
              <line x1="26" y1="32" x2="28.5" y2="31" stroke="white" strokeWidth="0.8" strokeLinecap="round" />
              {/* Tassel end */}
              <circle cx="28.5" cy="31" r="0.8" stroke="white" strokeWidth="0.8" fill="none" />
            </g>
          </g>

        </g>

        {/* ── SPARKLES when cap lands ── */}
        <circle cx="8" cy="8" r="0" stroke="white" strokeWidth="0.8" fill="none" className="star-1" />
        <circle cx="28" cy="6" r="0" stroke="white" strokeWidth="0.8" fill="none" className="star-2" />
        <circle cx="10" cy="16" r="0" stroke="white" strokeWidth="0.6" fill="none" className="star-3" />
        <circle cx="30" cy="14" r="0" stroke="white" strokeWidth="0.6" fill="none" className="star-1" />
        <circle cx="6" cy="22" r="0" stroke="white" strokeWidth="0.5" fill="none" className="star-2" />

        {/* Ground */}
        <line x1="6" y1="35.5" x2="34" y2="35.5" stroke="white" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="2 2" />
      </svg>
    </div>
  );
}

export default function Navbar({ onOpenMatcher, onOpenProfile }) {
  return (
    <nav className="flex justify-between items-center py-3 sm:py-4 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-surface-200 dark:border-slate-700 transition-colors">
      <div className="flex items-center gap-2.5">
        <a href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <AnimatedLogo />
          <span className="font-display font-bold text-base sm:text-lg text-slate-800 dark:text-white tracking-tight">
            AdviseAlberta
          </span>
        </a>
        <span className="hidden sm:inline text-[10px] font-bold text-white bg-primary px-2 py-0.5 rounded-md tracking-wider">
          AI-POWERED
        </span>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenMatcher}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-body font-semibold px-3 py-1.5 rounded-lg border transition-all hover:shadow-sm"
          style={{
            background: "linear-gradient(135deg, rgba(13,148,136,0.1), rgba(8,145,178,0.1))",
            borderColor: "rgba(13,148,136,0.3)",
            color: "#0D9488",
          }}
        >
          AI Matcher
        </button>
        <DarkModeToggle />
        <UserMenu onOpenProfile={onOpenProfile} />
      </div>
    </nav>
  );
}