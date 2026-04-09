import { INSTITUTIONS } from "../lib/data";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center py-3 sm:py-4 px-4 sm:px-6 bg-white border-b border-surface-200">
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-display font-extrabold text-base sm:text-lg text-white"
          style={{ background: "linear-gradient(135deg, #0D9488, #0891B2)" }}
        >
          A
        </div>
        <span className="font-display font-bold text-base sm:text-lg text-slate-800 tracking-tight">
          AdviseAlberta
        </span>
        <span className="hidden sm:inline text-[10px] font-bold text-white bg-primary px-2 py-0.5 rounded-md tracking-wider">
          AI-POWERED
        </span>
      </div>
      <div className="text-[11px] sm:text-xs text-slate-400 font-body hidden sm:block">
        Searching {INSTITUTIONS.length} Alberta institutions
      </div>
    </nav>
  );
}