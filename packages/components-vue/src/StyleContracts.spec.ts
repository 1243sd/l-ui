/// <reference types="node" />

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const stylePath = resolve(process.cwd(), 'packages/components-vue/src/style.css');
const css = readFileSync(stylePath, 'utf8');

const readRuleBody = (selector: string): string => {
  const escapedSelector = selector
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\s+/g, '\\s*');
  const ruleMatch = css.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`, 'm'));

  if (!ruleMatch) {
    throw new Error(`Missing CSS rule: ${selector}`);
  }

  return ruleMatch[1];
};

describe('style contracts', () => {
  it('keeps filled primary button hover readable', () => {
    const hoverRule = readRuleBody('.l-btn--primary:hover');

    expect(hoverRule).toMatch(/background\s*:/);
    expect(hoverRule).toMatch(/color:\s*var\(--l-color-textInverse\)/);
  });

  it('avoids transform-based motion on anchored floating overlays', () => {
    const overlayRule = readRuleBody(
      '.l-tooltip__overlay,\n.l-popover__overlay,\n.l-dropdown__overlay'
    );

    expect(overlayRule).toContain('animation: l-pop-layer-fade');
    expect(overlayRule).not.toContain('l-pop-layer-in');
    expect(overlayRule).not.toContain('l-pop-layer-rise');
  });
});
