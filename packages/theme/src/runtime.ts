import type { LolitaTheme } from './createLolitaTheme';

export const applyLolitaTheme = (theme: LolitaTheme, target?: HTMLElement): void => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = target ?? document.documentElement;
  Object.entries(theme.cssVars).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });
  root.dataset.lolitaTheme = theme.mode;
};
