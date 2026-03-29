// ── Design Tokens ──────────────────────────────────────────────
// Source of truth for the terminal aesthetic. Every colour, size,
// and spacing value in page.tsx should reference these tokens.

export const color = {
  bgPrimary: '#0a0f1a',
  accent: '#00c8dc',
  textHigh: '#e8f4f8',
  textMid: '#8aa8b8',
  textLow: '#5a7a8a',
  textMuted: '#4a6a7a',
  textGhost: '#2a4a5a',
  cardBg: 'rgba(255,255,255,0.025)',
  cardBorder: 'rgba(0,200,220,0.12)',
  selectedBg: 'rgba(0,200,220,0.12)',
  selectedBorder: 'rgba(0,200,220,0.4)',
  hoverBg: 'rgba(0,200,220,0.06)',
  hoverBorder: 'rgba(0,200,220,0.2)',
  ctaBg: 'rgba(0,200,220,0.1)',
  ctaBorder: 'rgba(0,200,220,0.35)',
  highlightGlow: 'rgba(0,200,220,0.3)',
  blurBg: 'rgba(0,200,220,0.04)',
  blurBorder: 'rgba(0,200,220,0.08)',
  qrBg: '#e8f4f8',
  qrFg: '#0a0f1a',
  subtleBorder: 'rgba(255,255,255,0.06)',
} as const;

export const font = {
  heading: 'var(--font-space-grotesk), sans-serif',
  mono: 'var(--font-dm-mono), monospace',
} as const;

// Typography presets — [fontSize, fontWeight, letterSpacing]
export const type = {
  headline:  { fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' },
  question:  { fontSize: 16, fontWeight: 600, letterSpacing: '-0.2px' },
  body:      { fontSize: 14, fontWeight: 400, letterSpacing: '0' },
  label:     { fontSize: 12, fontWeight: 400, letterSpacing: '0' },
  code:      { fontSize: 13, fontWeight: 400, letterSpacing: '0.5px' },
  counter:   { fontSize: 11, fontWeight: 400, letterSpacing: '1px' },
  finePrint: { fontSize: 10, fontWeight: 400, letterSpacing: '0' },
  microLabel:{ fontSize: 9,  fontWeight: 400, letterSpacing: '2px' },
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
} as const;
