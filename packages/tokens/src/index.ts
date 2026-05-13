import { darkTokens } from './dark';
import { lightTokens } from './light';
import type { LolitaTokenSet, ThemeMode } from './types';

export * from './types';

export const presetTokens: Record<ThemeMode, LolitaTokenSet> = {
  light: lightTokens,
  dark: darkTokens
};

export const resolveTokens = (mode: ThemeMode): LolitaTokenSet => {
  return presetTokens[mode];
};
