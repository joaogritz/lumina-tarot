import React from 'react';

export function CelestialRing({ className = '' }) {
  return <svg className={`celestial-ring ${className}`} viewBox="0 0 600 600" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth=".6">
      <circle cx="300" cy="300" r="286" /><circle cx="300" cy="300" r="272" />
      <circle cx="300" cy="300" r="236" /><circle cx="300" cy="300" r="190" />
      <g className="celestial-orbit">{Array.from({ length: 72 }, (_, i) => <path key={i} d={`M300 ${i % 6 === 0 ? 14 : 22}V${i % 6 === 0 ? 40 : 28}`} transform={`rotate(${i * 5} 300 300)`} />)}</g>
      <path d="M300 64 504 418H96Z M300 536 96 182H504Z" opacity=".45" />
      <ellipse cx="300" cy="300" rx="264" ry="90" transform="rotate(-35 300 300)" opacity=".5" />
      <path d="M300 0V600M0 300H600" opacity=".3" />
    </g>
    <g fill="currentColor" fontFamily="Georgia,serif" fontSize="12" textAnchor="middle">{['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'].map((n,i) => <text key={n} x="300" y="58" transform={`rotate(${i*30} 300 300)`}>{n}</text>)}</g>
    <circle cx="300" cy="64" r="3" fill="currentColor" /><circle cx="300" cy="536" r="3" fill="currentColor" />
  </svg>;
}
