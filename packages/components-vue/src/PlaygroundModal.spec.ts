import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import App from '../../../apps/playground/src/App.vue';

describe('playground modal showcase', () => {
  it('opens and closes the modal from the demo actions', async () => {
    class MockIntersectionObserver {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }

    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: MockIntersectionObserver
    });

    Object.defineProperty(globalThis, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: MockIntersectionObserver
    });

    const wrapper = mount(App, {
      attachTo: document.body
    });

    const openButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('打开弹窗'));

    if (!openButton) {
      throw new Error('Expected modal open button');
    }

    await openButton.trigger('click');
    await wrapper.vm.$nextTick();

    expect(document.body.textContent).toContain('发布前确认');

    const cancelButton = wrapper
      .findAllComponents({ name: 'LButton' })
      .find((button) => button.text().includes('取消'));

    if (!cancelButton) {
      throw new Error('Expected modal cancel button');
    }

    await cancelButton.trigger('click');
    await wrapper.vm.$nextTick();

    const overlay = document.body.querySelector('.l-modal__overlay');
    expect(overlay).not.toBeNull();
    expect((overlay as HTMLElement).hidden).toBe(true);
  });
});
