// ─── Color tokens ─────────────────────────────────────────────────────────────
// Survival / elimination aesthetic. Every hue has semantic meaning.
// Retuned for Phase 1: warmer near-black bg, punchier green, saturated red.
export const Colors = {
  // Backgrounds
  background: '#0A0A0B',      // near-black, slightly warm
  surface: '#16161A',         // cards
  surfaceElevated: '#1F1F25', // modals, sheets
  surfaceHigh: '#2A2A33',     // highest elevation (chips, nested cards)

  // Alias — semantic clarity where "surfaceElevated" reads as wrong shape
  bgElevated: '#1F1F25',

  // Brand
  primary: '#22D67E',   // electric green — alive/win
  danger: '#FF3B47',    // eliminated/loss/sub-24h countdown
  warning: '#FFB020',   // deadline approaching / locks soon
  gold: '#FFD700',      // reset-available phase (knockout resets)

  // Text
  text: '#FFFFFF',
  textSecondary: '#9A9AA3',
  textMuted: '#5C5C66',

  // UI
  border: '#2A2A33',        // default visible border
  borderStrong: '#3A3A44',  // emphasised border (focus/active cards)
  overlay: 'rgba(0,0,0,0.7)',

  // Semantic aliases
  alive: '#22D67E',
  eliminated: '#FF3B47',
  pending: '#FFB020',
} as const;

// ─── Font families ────────────────────────────────────────────────────────────
// Bebas Neue is a single-weight condensed display face — it reads as bold
// because of its compression. Loaded via expo-font at app startup.
// Used for: headlines, big numbers, countdowns, the wordmark.
// Body text uses the platform system font (no bundled body face — saves ~200kb).
export const Fonts = {
  display: 'BebasNeue',
  body: undefined as string | undefined,
} as const;

export const Typography = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
  '4xl': 42,

  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 56,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;
