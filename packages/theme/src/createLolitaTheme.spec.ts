import { describe, expect, it } from 'vitest';
import { createLolitaTheme } from './createLolitaTheme';

describe('createLolitaTheme', () => {
  it('creates light theme by default', () => {
    const theme = createLolitaTheme();
    expect(theme.mode).toBe('light');
    expect(theme.cssVars['--l-color-primary']).toBeTruthy();
  });

  it('applies override values', () => {
    const theme = createLolitaTheme({
      mode: 'dark',
      overrides: {
        colors: {
          primary: '#123456'
        }
      }
    });

    expect(theme.mode).toBe('dark');
    expect(theme.cssVars['--l-color-primary']).toBe('#123456');
  });
});
