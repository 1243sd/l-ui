import { describe, expect, it } from 'vitest';
import {
  findFirstEnabledIndex,
  findLastEnabledIndex,
  moveRovingIndex,
  resolveRovingIndex
} from './components/rovingFocus';

const items = [
  { key: 'first', disabled: false },
  { key: 'second', disabled: true },
  { key: 'third', disabled: false },
  { key: 'fourth', disabled: false }
];

describe('rovingFocus', () => {
  it('finds the first and last enabled item', () => {
    expect(findFirstEnabledIndex(items, (item) => item.disabled)).toBe(0);
    expect(findLastEnabledIndex(items, (item) => item.disabled)).toBe(3);
  });

  it('skips disabled items when moving focus', () => {
    expect(moveRovingIndex(items, 0, 1, (item) => item.disabled)).toBe(2);
    expect(moveRovingIndex(items, 2, -1, (item) => item.disabled)).toBe(0);
  });

  it('resolves a safe active index when the preferred item is disabled', () => {
    expect(resolveRovingIndex(items, 1, (item) => item.disabled)).toBe(0);
    expect(resolveRovingIndex(items, 2, (item) => item.disabled)).toBe(2);
  });
});
