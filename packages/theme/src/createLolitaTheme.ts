import { presetTokens, resolveTokens, type LolitaTokenSet, type ThemeMode } from '@lolita-ui/tokens';

interface Nested {
  [key: string]: string | Nested;
}
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type LolitaTheme = {
  mode: ThemeMode;
  tokens: LolitaTokenSet;
  cssVars: Record<string, string>;
};

export type LolitaThemeOverrides = DeepPartial<Omit<LolitaTokenSet, 'mode'>>;

const toCssVarName = (path: string[]): string => `--l-${path.join('-')}`;

const flatten = (value: Nested, path: string[] = []): Record<string, string> => {
  return Object.entries(value).reduce<Record<string, string>>((acc, [key, node]) => {
    const nextPath = [...path, key];
    if (typeof node === 'string') {
      acc[toCssVarName(nextPath)] = node;
      return acc;
    }

    Object.assign(acc, flatten(node, nextPath));
    return acc;
  }, {});
};

export const themeToCssVars = (tokens: LolitaTokenSet): Record<string, string> => {
  return flatten({
    color: tokens.colors,
    radius: tokens.radius,
    shadow: tokens.shadow,
    motion: tokens.motion,
    space: tokens.spacing,
    typo: tokens.typography
  });
};

export const mergeTheme = (base: LolitaTokenSet, overrides: LolitaThemeOverrides = {}): LolitaTokenSet => {
  return {
    mode: base.mode,
    colors: { ...base.colors, ...overrides.colors },
    radius: { ...base.radius, ...overrides.radius },
    shadow: { ...base.shadow, ...overrides.shadow },
    motion: { ...base.motion, ...overrides.motion },
    spacing: { ...base.spacing, ...overrides.spacing },
    typography: { ...base.typography, ...overrides.typography }
  };
};

export const createLolitaTheme = (options: {
  mode?: ThemeMode;
  overrides?: LolitaThemeOverrides;
} = {}): LolitaTheme => {
  const mode = options.mode ?? 'light';
  const base = resolveTokens(mode) ?? presetTokens.light;
  const tokens = mergeTheme(base, options.overrides);

  return {
    mode,
    tokens,
    cssVars: themeToCssVars(tokens)
  };
};
