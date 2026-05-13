export type ThemeMode = 'light' | 'dark';

export type ColorScale = {
  page: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  primary: string;
  primaryHover: string;
  primaryActive: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  textPrimary: string;
  textSecondary: string;
  textInverse: string;
};

export type RadiusScale = {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  capsule: string;
};

export type ShadowScale = {
  sm: string;
  md: string;
  lg: string;
};

export type MotionScale = {
  fast: string;
  normal: string;
  slow: string;
};

export type SpacingScale = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
};

export type TypographyScale = {
  fontFamilyBase: string;
  fontFamilyHeading: string;
  sizeXs: string;
  sizeSm: string;
  sizeMd: string;
  sizeLg: string;
  sizeXl: string;
};

export type LolitaTokenSet = {
  mode: ThemeMode;
  colors: ColorScale;
  radius: RadiusScale;
  shadow: ShadowScale;
  motion: MotionScale;
  spacing: SpacingScale;
  typography: TypographyScale;
};
