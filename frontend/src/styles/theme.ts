/**
 * DESIGN TOKENS - DARK THEME
 * Fonte única de verdade para cores do sistema (TypeScript)
 *
 * USO:
 * import { colors, shadows } from '@/styles/theme';
 *
 * <div style={{ background: colors.bg.default }}>
 * <span style={{ color: colors.text.primary }}>
 */

export const colors = {
  // Background
  bg: {
    default: '#0F0F0F',
    card: '#181818',
    elevated: '#212121',
  },

  // Border / Divisores
  border: {
    default: '#282828',
    subtle: 'rgba(255, 255, 255, 0.06)',
    hover: 'rgba(255, 255, 255, 0.1)',
  },

  // Primary
  primary: {
    default: '#2F80ED',
    hover: '#3F8FFF',
    subtle: 'rgba(47, 128, 237, 0.1)',
    muted: 'rgba(47, 128, 237, 0.2)',
  },

  // Secondary
  secondary: {
    default: '#56CCF2',
    hover: '#6DD5F5',
    subtle: 'rgba(86, 204, 242, 0.1)',
  },

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    disabled: '#5F5F5F',
    muted: '#808080',
  },

  // Feedback - Error
  feedback: {
    error: '#E44D4D',
    errorHover: '#F05656',
    errorSubtle: 'rgba(228, 77, 77, 0.1)',
    errorMuted: 'rgba(228, 77, 77, 0.2)',

    // Feedback - Success
    success: '#2ECC71',
    successHover: '#3DD882',
    successSubtle: 'rgba(46, 204, 113, 0.1)',
    successMuted: 'rgba(46, 204, 113, 0.2)',

    // Feedback - Warning
    warning: '#F2994A',
    warningHover: '#F5A85D',
    warningSubtle: 'rgba(242, 153, 74, 0.1)',

    // Feedback - Info
    info: '#56CCF2',
    infoSubtle: 'rgba(86, 204, 242, 0.1)',
  },

  // Interactive overlays
  interactive: {
    hover: 'rgba(255, 255, 255, 0.08)',
    active: 'rgba(255, 255, 255, 0.12)',
    focusRing: 'rgba(47, 128, 237, 0.4)',
  },
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 8px rgba(0, 0, 0, 0.4)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.6)',
  glowPrimary: '0 0 20px rgba(47, 128, 237, 0.3)',
  glowError: '0 0 20px rgba(228, 77, 77, 0.3)',
  glowSuccess: '0 0 20px rgba(46, 204, 113, 0.3)',
} as const;

export const gradients = {
  bg: 'linear-gradient(135deg, #0F0F0F 0%, #141414 50%, #0F0F0F 100%)',
  primary: 'linear-gradient(135deg, #2F80ED 0%, #56CCF2 100%)',
  card: 'linear-gradient(165deg, rgba(24, 24, 24, 0.95) 0%, rgba(15, 15, 15, 0.98) 100%)',
} as const;

export const transitions = {
  fast: '0.15s ease',
  normal: '0.2s ease',
  slow: '0.3s ease',
} as const;

export const radius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

// Objeto completo do tema para facilitar importação
export const theme = {
  colors,
  shadows,
  gradients,
  transitions,
  radius,
} as const;

export default theme;
