import type { LolitaTokenSet } from './types';

export const lightTokens: LolitaTokenSet = {
  mode: 'light',
  colors: {
    page: '#fff8fc',
    surface: '#ffffff',
    surfaceRaised: '#fff2f8',
    border: '#f2dbe8',
    primary: '#ff6ea8',
    primaryHover: '#ff5c9f',
    primaryActive: '#f94992',
    accent: '#7cc9ff',
    success: '#31b57b',
    warning: '#f2ab3f',
    danger: '#ea5b70',
    textPrimary: '#2e2330',
    textSecondary: '#6f5a74',
    textInverse: '#ffffff'
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    capsule: '999px'
  },
  shadow: {
    sm: '0 4px 14px rgba(255, 110, 168, 0.12)',
    md: '0 10px 24px rgba(255, 110, 168, 0.16)',
    lg: '0 20px 44px rgba(144, 94, 175, 0.20)'
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
