import type { LolitaTokenSet } from './types';

export const darkTokens: LolitaTokenSet = {
  mode: 'dark',
  colors: {
    page: '#1d1522',
    surface: '#2b2030',
    surfaceRaised: '#37293f',
    border: '#4a3755',
    primary: '#ff8cc2',
    primaryHover: '#ff9ecb',
    primaryActive: '#f37fb5',
    accent: '#8ed6ff',
    success: '#45c590',
    warning: '#f7bb52',
    danger: '#ff7f96',
    textPrimary: '#fff0f8',
    textSecondary: '#d0bdd8',
    textInverse: '#201726'
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    capsule: '999px'
  },
  shadow: {
    sm: '0 4px 14px rgba(0, 0, 0, 0.30)',
    md: '0 10px 24px rgba(0, 0, 0, 0.35)',
    lg: '0 20px 44px rgba(0, 0, 0, 0.45)'
  },
  motion: {
    fast: '120ms',
    normal: '220ms',
    slow: '320ms'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px'
  },
  typography: {
    fontFamilyBase: "'Nunito Sans', 'Segoe UI', sans-serif",
    fontFamilyHeading: "'Baloo 2', 'Nunito Sans', sans-serif",
    sizeXs: '12px',
    sizeSm: '14px',
    sizeMd: '16px',
    sizeLg: '18px',
    sizeXl: '24px'
  }
};
