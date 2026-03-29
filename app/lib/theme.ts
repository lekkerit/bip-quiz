// ── Design Tokens ──────────────────────────────────────────────
// Source of truth for the terminal aesthetic. Every colour, size,
// and spacing value in page.tsx should reference these tokens.

export const color = {
  bgPrimary: '#0a0f1a',
  accent: '#e8753a',
  textHigh: '#f0e8e0',
  textMid: '#b8a898',
  textLow: '#8a7a6a',
  textMuted: '#7a6a5a',
  textGhost: '#4a3a2a',
  cardBg: 'rgba(255,255,255,0.025)',
  cardBorder: 'rgba(232,117,58,0.12)',
  selectedBg: 'rgba(232,117,58,0.12)',
  selectedBorder: 'rgba(232,117,58,0.4)',
  hoverBg: 'rgba(232,117,58,0.06)',
  hoverBorder: 'rgba(232,117,58,0.2)',
  ctaBg: 'rgba(232,117,58,0.1)',
  ctaBorder: 'rgba(232,117,58,0.35)',
  highlightGlow: 'rgba(232,117,58,0.3)',
  blurBg: 'rgba(232,117,58,0.04)',
  blurBorder: 'rgba(232,117,58,0.08)',
  qrBg: '#f0e8e0',
  qrFg: '#0a0f1a',
  subtleBorder: 'rgba(255,255,255,0.06)',
} as const;

export const font = {
  heading: 'var(--font-space-grotesk), sans-serif',
  mono: 'var(--font-dm-mono), monospace',
} as const;

// Typography presets — [fontSize, fontWeight, letterSpacing]
export const type = {
  headline:  { fontSize: 26, fontWeight: 700, letterSpacing: '-0.3px' },
  question:  { fontSize: 20, fontWeight: 600, letterSpacing: '-0.2px' },
  body:      { fontSize: 16, fontWeight: 400, letterSpacing: '0' },
  label:     { fontSize: 15, fontWeight: 400, letterSpacing: '0' },
  code:      { fontSize: 14, fontWeight: 400, letterSpacing: '0.5px' },
  counter:   { fontSize: 12, fontWeight: 400, letterSpacing: '1px' },
  finePrint: { fontSize: 11, fontWeight: 400, letterSpacing: '0' },
  microLabel:{ fontSize: 10, fontWeight: 400, letterSpacing: '2px' },
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
} as const;
