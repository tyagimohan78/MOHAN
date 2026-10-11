/**
 * Enterprise infrastructure illustration: cloud, servers, firewall, Wi-Fi, CCTV and endpoints
 * connected through a central switch. Pure SVG — no external images, scales crisply, light-weight.
 */
export function HeroIllustration({ className = "" }: { className?: string }) {
  const line = "stroke-electric-400/70";
  return (
    <svg viewBox="0 0 560 480" className={className} role="img" aria-labelledby="hero-ill-title">
      <title id="hero-ill-title">Connected business infrastructure: cloud services, servers, firewall, Wi-Fi, CCTV and user devices linked through a secure network</title>
      <defs>
        <linearGradient id="hi-panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#142a4d" />
          <stop offset="1" stopColor="#0b1f3a" />
        </linearGradient>
        <linearGradient id="hi-cyan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#67e8f9" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
        <radialGradient id="hi-glow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#22d3ee" stopOpacity=".35" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
        <filter id="hi-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#020617" floodOpacity=".45" />
        </filter>
      </defs>

      <circle cx="280" cy="250" r="190" fill="url(#hi-glow)" />
      <circle cx="280" cy="250" r="150" fill="none" stroke="#5e84b8" strokeOpacity=".25" strokeDasharray="3 7" />
      <circle cx="280" cy="250" r="215" fill="none" stroke="#5e84b8" strokeOpacity=".15" />

      {/* connections */}
      <g fill="none" strokeWidth="2" strokeDasharray="6 6" className={`${line} animate-dash`}>
        <path d="M280 250 V120" />
        <path d="M280 250 L120 170" />
        <path d="M280 250 L440 170" />
        <path d="M280 250 L110 340" />
        <path d="M280 250 L450 340" />
        <path d="M280 250 V400" />
      </g>

      {/* cloud */}
      <g filter="url(#hi-shadow)" className="animate-float">
        <rect x="200" y="40" width="160" height="96" rx="20" fill="url(#hi-panel)" stroke="#2a4c80" />
        <path d="M245 104h72a20 20 0 0 0 0-40 28 28 0 0 0-53-6 22 22 0 0 0-19 46Z" fill="none" stroke="url(#hi-cyan)" strokeWidth="4" strokeLinejoin="round" />
        <text x="280" y="126" textAnchor="middle" fontSize="11" fontWeight="600" fill="#94afd3" fontFamily="Inter, sans-serif">Cloud &amp; Microsoft 365</text>
      </g>

      {/* server rack */}
      <g filter="url(#hi-shadow)">
        <rect x="44" y="118" width="130" height="104" rx="16" fill="url(#hi-panel)" stroke="#2a4c80" />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x="66" y={136 + i * 22} width="86" height="16" rx="4" fill="#1f3a66" />
            <circle cx="76" cy={144 + i * 22} r="3" fill={i === 1 ? "#22d3ee" : "#67e8f9"} />
            <rect x="118" y={142 + i * 22} width="26" height="4" rx="2" fill="#5e84b8" />
          </g>
        ))}
        <text x="109" y="214" textAnchor="middle" fontSize="11" fontWeight="600" fill="#94afd3" fontFamily="Inter, sans-serif">Servers &amp; storage</text>
      </g>

      {/* firewall / shield */}
      <g filter="url(#hi-shadow)">
        <rect x="386" y="118" width="130" height="104" rx="16" fill="url(#hi-panel)" stroke="#2a4c80" />
        <path d="M451 134l26 10v18c0 16-11 28-26 33-15-5-26-17-26-33v-18Z" fill="none" stroke="url(#hi-cyan)" strokeWidth="4" strokeLinejoin="round" />
        <path d="M440 163l8 8 15-16" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="451" y="214" textAnchor="middle" fontSize="11" fontWeight="600" fill="#94afd3" fontFamily="Inter, sans-serif">Firewall &amp; endpoint</text>
      </g>

      {/* central switch */}
      <g filter="url(#hi-shadow)">
        <rect x="190" y="214" width="180" height="72" rx="18" fill="#0b1f3a" stroke="url(#hi-cyan)" strokeWidth="2" />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={210 + i * 18.5} y="236" width="12" height="10" rx="2" fill={i % 3 === 0 ? "#22d3ee" : "#2a4c80"} />
        ))}
        <text x="280" y="270" textAnchor="middle" fontSize="11" fontWeight="700" fill="#e3ebf5" fontFamily="Inter, sans-serif" letterSpacing="1.5">CORE NETWORK</text>
      </g>

      {/* wifi */}
      <g filter="url(#hi-shadow)">
        <rect x="40" y="300" width="130" height="90" rx="16" fill="url(#hi-panel)" stroke="#2a4c80" />
        <g fill="none" stroke="url(#hi-cyan)" strokeWidth="4" strokeLinecap="round">
          <path d="M80 338a42 42 0 0 1 58 0" />
          <path d="M90 349a27 27 0 0 1 38 0" />
        </g>
        <circle cx="109" cy="360" r="4.5" fill="#fff" />
        <text x="105" y="382" textAnchor="middle" fontSize="11" fontWeight="600" fill="#94afd3" fontFamily="Inter, sans-serif">Enterprise Wi-Fi</text>
      </g>

      {/* cctv */}
      <g filter="url(#hi-shadow)">
        <rect x="390" y="300" width="130" height="90" rx="16" fill="url(#hi-panel)" stroke="#2a4c80" />
        <rect x="428" y="324" width="48" height="22" rx="6" fill="none" stroke="url(#hi-cyan)" strokeWidth="4" />
        <path d="M476 330l14-6v22l-14-6" fill="none" stroke="url(#hi-cyan)" strokeWidth="4" strokeLinejoin="round" />
        <path d="M440 346v12h-10" fill="none" stroke="#5e84b8" strokeWidth="4" strokeLinecap="round" />
        <circle cx="441" cy="335" r="3" fill="#fff" />
        <text x="455" y="382" textAnchor="middle" fontSize="11" fontWeight="600" fill="#94afd3" fontFamily="Inter, sans-serif">CCTV &amp; NVR</text>
      </g>

      {/* endpoints */}
      <g filter="url(#hi-shadow)">
        <rect x="215" y="380" width="130" height="80" rx="16" fill="url(#hi-panel)" stroke="#2a4c80" />
        <rect x="248" y="396" width="64" height="38" rx="4" fill="none" stroke="url(#hi-cyan)" strokeWidth="3.5" />
        <path d="M238 440h84" stroke="#5e84b8" strokeWidth="4" strokeLinecap="round" />
        <text x="280" y="454" textAnchor="middle" fontSize="11" fontWeight="600" fill="#94afd3" fontFamily="Inter, sans-serif">Users &amp; devices</text>
      </g>

      {/* nodes */}
      {[
        [280, 175],
        [190, 205],
        [370, 205],
        [195, 295],
        [365, 295],
        [280, 330],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="#22d3ee" stroke="#0b1f3a" strokeWidth="2" />
      ))}
    </svg>
  );
}
