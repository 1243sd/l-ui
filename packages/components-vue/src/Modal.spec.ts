import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { LModal } from './components/Modal';
import './style.css';

describe('LModal', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    document.body.style.overflow = '';
  });

  it('locks body scroll, emits ok, and restores body scroll on close', async () => {
    const wrapper = mount(LModal, {
      attachTo: document.body,
      props: {
        title: '发布确认',
        defaultOpen: true,
        teleported: false
      },
      slots: {
        default: '<div>请再次确认发布信息。</div>'
      }
    });

    await wrapper.vm.$nextTick();
    expect(document.body.style.overflow).toBe('hidden');

    await wrapper.find('.l-modal__ok').trigger('click');
    expect(wrapper.emitted('ok')?.length).toBe(1);
    expect(wrapper.emitted('update:open')?.at(-1)?.[0]).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('respects keyboard=false, still allows mask cancel, and destroys content on close', async () => {
    const wrapper = mount(LModal, {
      attachTo: document.body,
      props: {
        title: '键盘策略',
        defaultOpen: true,
        keyboard: false,
        destroyOnClose: true,
        teleported: false
      },
      slots: {
        default: '<div>键盘关闭已禁用。</div>'
      }
    });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.l-modal__overlay').exists()).toBe(true);

    await wrapper.find('.l-modal__mask').trigger('click');
    expect(wrapper.emitted('cancel')?.length).toBe(1);
    expect(wrapper.find('.l-modal__overlay').exists()).toBe(false);
  });

  it('uses unique title ids across multiple modal instances', () => {
    const wrapper = mount(
      defineComponent({
        components: {
          LModal
        },
        template: `
          <div>
            <LModal title="第一个弹窗" :defaultOpen="true" :teleported="false">
              <div>第一个内容</div>
            </LModal>
            <LModal title="第二个弹窗" :defaultOpen="true" :teleported="false">
              <div>第二个内容</div>
            </LModal>
          </div>
        `
      }),
      {
        attachTo: document.body
      }
    );

    const labelledByIds = wrapper
      .findAll('.l-modal__panel')
      .map((panel) => panel.attributes('aria-labelledby'));
    const titleIds = wrapper.findAll('.l-modal__title').map((title) => title.attributes('id'));

    expect(new Set(labelledByIds).size).toBe(labelledByIds.length);
    expect(new Set(titleIds).size).toBe(titleIds.length);
  });

  it('closes in controlled v-model mode from cancel, ok, and close button', async () => {
    const wrapper = mount(
      defineComponent({
        components: {
          LModal
        },
        data: () => ({
          open: true
        }),
        template: `
          <LModal v-model:open="open" title="受控弹窗" :teleported="false">
            <div>受控内容</div>
          </LModal>
        `
      }),
      {
        attachTo: document.body
      }
    );

    expect(wrapper.find('.l-modal__overlay').exists()).toBe(true);

    await wrapper.find('.l-modal__cancel').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.l-modal__overlay').attributes('hidden')).toBeDefined();

    await wrapper.setData({ open: true });
    await wrapper.vm.$nextTick();

    await wrapper.find('.l-modal__ok').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.l-modal__overlay').attributes('hidden')).toBeDefined();

    await wrapper.setData({ open: true });
    await wrapper.vm.$nextTick();

    await wrapper.find('.l-modal__close').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.l-modal__overlay').attributes('hidden')).toBeDefined();
  });

  it('closes in controlled v-model mode when teleported to body', async () => {
    const wrapper = mount(
      defineComponent({
        components: {
          LModal
        },
        data: () => ({
          open: true
        }),
        template: `
          <LModal v-model:open="open" title="受控弹窗" :teleported="true">
            <div>受控内容</div>
          </LModal>
        `
      }),
      {
        attachTo: document.body
      }
    );

    expect(document.body.querySelector('.l-modal__overlay')).not.toBeNull();

    const cancelButton = document.body.querySelector('.l-modal__cancel');
    if (!(cancelButton instanceof HTMLElement)) {
      throw new Error('Expected teleported cancel button');
    }

    cancelButton.click();
    await wrapper.vm.$nextTick();

    expect((document.body.querySelector('.l-modal__overlay') as HTMLElement | null)?.hidden).toBe(true);
  });

  it('keeps hidden overlays visually hidden even though the overlay class uses display flex', () => {
    const overlay = document.createElement('div');
    overlay.className = 'l-modal__overlay';
    overlay.hidden = true;
    document.body.appendChild(overlay);

    expect(window.getComputedStyle(overlay).display).toBe('none');
  });
});
