import { describe, expect, it } from 'vitest';
import { resolveTokens } from './index';

describe('tokens', () => {
  it('resolves light and dark modes', () => {
    expect(resolveTokens('light').mode).toBe('light');
    expect(resolveTokens('dark').mode).toBe('dark');
  });
});
