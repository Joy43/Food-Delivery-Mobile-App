/**
 * Vibrant Cravings — Design System Tokens
 *
 * Single-mode (no dark/light switching).
 * Import `Colors`, `Typography`, `Spacing`, `Radius`, `Shadows` wherever you need them.
 */

// ─── Colors ───────────────────────────────────────────────────────────────────
export const Colors = {
  // Surfaces
  surface:                  '#fbf9f8',
  surfaceDim:               '#dcd9d9',
  surfaceBright:            '#fbf9f8',
  surfaceContainerLowest:   '#ffffff',
  surfaceContainerLow:      '#f6f3f2',
  surfaceContainer:         '#f0eded',
  surfaceContainerHigh:     '#eae8e7',
  surfaceContainerHighest:  '#e4e2e1',

  // On-surface text
  onSurface:        '#1b1c1c',
  onSurfaceVariant: '#5b4039',

  // Inverse
  inverseSurface:   '#303030',
  inverseOnSurface: '#f3f0f0',

  // Outlines
  outline:        '#907067',
  outlineVariant: '#e4beb4',

  // Primary — deep orange/red (dark brand), used for text on light bg
  primary:            '#b02f00',
  onPrimary:          '#ffffff',
  // Primary container — vivid orange, used for CTA buttons & highlights
  primaryContainer:   '#ff5722',
  onPrimaryContainer: '#541200',
  inversePrimary:     '#ffb5a0',
  surfaceTint:        '#b02f00',

  // Secondary — green, used for success, available, free delivery
  secondary:            '#006d37',
  onSecondary:          '#ffffff',
  secondaryContainer:   '#6bfe9c',
  onSecondaryContainer: '#00743a',

  // Tertiary — amber/gold, used for ratings, rewards
  tertiary:            '#785900',
  onTertiary:          '#ffffff',
  tertiaryContainer:   '#b78a00',
  onTertiaryContainer: '#372700',

  // Error
  error:            '#ba1a1a',
  onError:          '#ffffff',
  errorContainer:   '#ffdad6',
  onErrorContainer: '#93000a',

  // Fixed & Extras
  primaryFixedDim:    '#ffb5a0',
  tertiaryFixed:      '#ffdf9e',
  onTertiaryFixed:    '#261a00',

  // Background
  background:     '#fbf9f8',
  onBackground:   '#1b1c1c',
  surfaceVariant: '#e4e2e1',

  // Legacy compat aliases
  text:           '#1b1c1c',
  textSecondary:  '#5b4039',
  backgroundElement: '#f6f3f2',
  backgroundSelected: '#f0eded',

  light: {
    text: '#1b1c1c',
    background: '#fbf9f8',
    backgroundElement: '#f6f3f2',
    backgroundSelected: '#f0eded',
    textSecondary: '#5b4039',
  },
  dark: {
    text: '#1b1c1c',
    background: '#fbf9f8',
    backgroundElement: '#f6f3f2',
    backgroundSelected: '#f0eded',
    textSecondary: '#5b4039',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export type ColorToken = keyof typeof Colors;

// ─── Typography ───────────────────────────────────────────────────────────────
export const Typography = {
  fontFamily: 'Inter',

  fontSize: {
    xs:    10,
    sm:    12,
    md:    14,
    base:  16,
    lg:    18,
    xl:    20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
  },

  fontWeight: {
    regular:   '400' as const,
    medium:    '500' as const,
    semibold:  '600' as const,
    bold:      '700' as const,
    extrabold: '800' as const,
  },

  lineHeight: {
    tight:   20,
    snug:    24,
    normal:  26,
    relaxed: 28,
    loose:   32,
    xl:      40,
    '2xl':   48,
  },

  // Preset composable text styles
  headlineXL:       { fontSize: 40, fontWeight: '800' as const, lineHeight: 48, letterSpacing: -0.8 },
  headlineLG:       { fontSize: 32, fontWeight: '700' as const, lineHeight: 40, letterSpacing: -0.32 },
  headlineLGMobile: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  headlineMD:       { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  bodyLG:           { fontSize: 18, fontWeight: '400' as const, lineHeight: 26 },
  bodyMD:           { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  labelMD:          { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
  labelSM:          { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const Spacing = {
  xs:           4,
  sm:           8,
  md:           16,
  lg:           24,
  xl:           32,
  gutter:       16,
  marginMobile: 20,
  // Legacy aliases (used in older screens)
  half:  2,
  one:   4,
  two:   8,
  three: 16,
  four:  24,
  five:  32,
  six:   64,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────
export const Radius = {
  sm:   4,
  md:   8,
  lg:   16,
  xl:   24,
  full: 9999,
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const Shadows = {
  /** Level 1 — Cards */
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  /** Level 2 — Floating primary CTAs (orange-tinted shadow) */
  floating: {
    shadowColor: '#ff5722',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 6,
  },
  /** Level 2b — Upward shadow for bottom sheets */
  sheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

// ─── Legacy compat ─────────────────────────────────────────────────────────────
import { Platform } from 'react-native';
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

