/**
 * Feature flags. Flip these to enable/disable features without
 * touching component code. Intended to be replaced by a remote
 * config service eventually — for now they're compile-time constants.
 */
export const FEATURES = {
  /** Apple / Google sign-in buttons. Requires native build (EAS). */
  socialAuth: false,
} as const;
