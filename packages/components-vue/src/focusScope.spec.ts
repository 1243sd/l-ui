import { nextTick } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import {
  acquireBodyScrollLock,
  activateFocusScope,
  getFocusableElements
} from './components/focusScope';

describe('focusScope', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    document.body.style.overflow = '';
  });

  it('collects focusable elements inside a container', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <button type="button">主按钮</button>
      <input />
      <button type="button" disabled>禁用按钮</button>
    `;
    document.body.appendChild(container);

    expect(getFocusableElements(container)).toHaveLength(2);
  });

  it('locks and restores body scroll in pairs', () => {
    const releaseA = acquireBodyScrollLock();
    const releaseB = acquireBodyScrollLock();

    expect(document.body.style.overflow).toBe('hidden');

    releaseB();
    expect(document.body.style.overflow).toBe('hidden');

    releaseA();
    expect(document.body.style.overflow).toBe('');
  });

  it('moves focus into the scope and restores it on cleanup', async () => {
    const trigger = document.createElement('button');
    trigger.type = 'button';
    document.body.appendChild(trigger);
    trigger.focus();

    const container = document.createElement('div');
    container.tabIndex = -1;
    container.innerHTML = `
      <button type="button">确认</button>
      <button type="button">取消</button>
    `;
    document.body.appendChild(container);

    const deactivate = activateFocusScope(container, {
      lockScroll: true,
      returnFocus: () => trigger
    });

    await nextTick();

    expect(document.activeElement?.textContent).toBe('确认');
    expect(document.body.style.overflow).toBe('hidden');

    deactivate();

    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe('');
  });
});
