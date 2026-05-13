import { inject } from 'vue';
import { createLolitaTheme } from './createLolitaTheme';
import { lolitaThemeKey } from './context';

export const useLolitaTheme = () => {
  const theme = inject(lolitaThemeKey, undefined);
  if (!theme) {
    return createLolitaTheme();
  }
  return theme.value;
};
