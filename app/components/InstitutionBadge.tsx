"use client";
import { useState } from "react";

export interface Institution {
  name: string;
  city: string;
  type: string;
  color: string;
  website: string;
}

interface InstitutionBadgeProps {
  inst: Institution;
  index: number;
}

export default function InstitutionBadge({ inst, index }: InstitutionBadgeProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={inst.website}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-xl px-3 py-3 sm:px-4 sm:py-3.5 transition-all duration-300 no-underline block"
      style={{
        background: hovered ? inst.color + "0A" : "#FFFFFF",
        border: `1px solid ${hovered ? inst.color + "40" : "#E2E8F0"}`,
        boxShadow: hovered
          ? `0 4px 12px ${inst.color}18`
          : "0 1px 3px rgba(0,0,0,0.03)",
      }}
    >
      <div className="flex items-center gap-2 sm:gap-2.5">
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all duration-300"
          style={{
            background: inst.color,
            boxShadow: hovered ? `0 0 10px ${inst.color}50` : "none",
          }}
        />
        <div className="min-w-0">
          <div className="font-display font-semibold text-xs sm:text-sm text-slate-800 truncate">
            {inst.name}
          </div>
          <div className="font-body text-[10px] sm:text-[11px] text-slate-400">
            {inst.city} · {inst.type}
          </div>
        </div>
      </div>
    </a>
  );
}
