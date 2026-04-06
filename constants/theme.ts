export const Colors = {
  // Backgrounds
  background: '#0A0A0A',
  surface: '#141414',
  surfaceElevated: '#1E1E1E',
  surfaceHigh: '#2A2A2A',

  // Brand
  primary: '#00FF87',      // electric green — alive/win
  danger: '#FF3B30',       // eliminated/loss
  warning: '#FF9F0A',      // deadline approaching
  gold: '#FFD700',         // reset-available phase

  // Text
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textMuted: '#48484A',

  // UI
  border: '#2C2C2E',
  overlay: 'rgba(0,0,0,0.7)',

  // Semantic aliases
  alive: '#00FF87',
  eliminated: '#FF3B30',
  pending: '#FF9F0A',
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
