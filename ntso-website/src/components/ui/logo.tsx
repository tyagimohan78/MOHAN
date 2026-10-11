import { useId } from "react";

/** NTSO brand mark: a hexagon (infrastructure) containing an "N" drawn as connected network nodes. */
export function LogoMark({ className = "h-9 w-9", title }: { className?: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 48 48" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1f3a66" />
          <stop offset="1" stopColor="#0b1f3a" />
        </linearGradient>
        <linearGradient id={`a${id}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#06b6d4" />
          <stop offset="1" stopColor="#67e8f9" />
        </linearGradient>
      </defs>
      <path d="M24 2.5 42.6 13.25v21.5L24 45.5 5.4 34.75v-21.5Z" fill={`url(#g${id})`} />
      <path d="M24 2.5 42.6 13.25v21.5L24 45.5 5.4 34.75v-21.5Z" fill="none" stroke={`url(#a${id})`} strokeWidth="1.6" opacity=".55" />
      <path d="M15.5 32V16l17 16V16" fill="none" stroke={`url(#a${id})`} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="15.5" cy="16" r="3" fill="#fff" />
      <circle cx="15.5" cy="32" r="3" fill="#22d3ee" />
      <circle cx="32.5" cy="32" r="3" fill="#fff" />
      <circle cx="32.5" cy="16" r="3" fill="#22d3ee" />
    </svg>
  );
}

export function Logo({ inverted = false, compact = false }: { inverted?: boolean; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark className="h-9 w-9 shrink-0" />
      <span className="leading-none">
        <span className={`block font-display text-xl font-extrabold tracking-tight ${inverted ? "text-white" : "text-navy-900"}`}>
          NTSO<span className="text-electric-500">.</span>
        </span>
        {!compact && (
          <span className={`mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.2em] ${inverted ? "text-navy-200" : "text-slate-500"}`}>
            Private Limited
          </span>
        )}
      </span>
    </span>
  );
}
