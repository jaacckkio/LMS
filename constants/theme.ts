export const Colors = {
  background: '#1A1A2E',
  surface: '#16213E',
  surfaceElevated: '#1F2B47',
  accent: '#E94560',
  navy: '#0F3460',
  text: '#FFFFFF',
  textSecondary: '#8892A4',
  textMuted: '#4A5568',
  border: '#2D3748',
  success: '#48BB78',
  warning: '#ECC94B',
  error: '#E94560',
  eliminated: '#4A5568',
  alive: '#48BB78',
} as const;

export const Typography = {
  // Font sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
  '4xl': 42,

  // Font weights (as names for consistency)
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
  '4xl': 48,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;
