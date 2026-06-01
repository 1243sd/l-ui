import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { LDrawer } from './components/Drawer';

describe('LDrawer', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    document.body.style.overflow = '';
  });

  it('renders the requested placement and closes from the close button', async () => {
    const wrapper = mount(LDrawer, {
      attachTo: document.body,
      props: {
        title: '右侧抽屉',
        defaultOpen: true,
        placement: 'left',
        teleported: false
      },
      slots: {
        default: '<div>抽屉内容</div>'
      }
    });

    expect(wrapper.find('.l-drawer__panel').classes()).toContain('l-drawer__panel--left');

    await wrapper.find('.l-drawer__close').trigger('click');

    expect(wrapper.emitted('close')?.length).toBe(1);
    expect(wrapper.emitted('update:open')?.at(-1)?.[0]).toBe(false);
    expect(wrapper.find('.l-drawer__overlay').exists()).toBe(false);
  });

  it('closes on Escape when keyboard is enabled', async () => {
    const wrapper = mount(LDrawer, {
      attachTo: document.body,
      props: {
        title: '快捷关闭',
        defaultOpen: true,
        teleported: false
      },
      slots: {
        default: '<div>抽屉内容</div>'
      }
    });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('close')?.length).toBe(1);
    expect(wrapper.find('.l-drawer__overlay').exists()).toBe(false);
  });

  it('uses unique title ids across multiple drawer instances', () => {
    const wrapper = mount(
      defineComponent({
        components: {
          LDrawer
        },
        template: `
          <div>
            <LDrawer title="第一个抽屉" :defaultOpen="true" :teleported="false">
              <div>第一个内容</div>
            </LDrawer>
            <LDrawer title="第二个抽屉" :defaultOpen="true" :teleported="false">
              <div>第二个内容</div>
            </LDrawer>
          </div>
        `
      }),
      {
        attachTo: document.body
      }
    );

    const labelledByIds = wrapper
      .findAll('.l-drawer__panel')
      .map((panel) => panel.attributes('aria-labelledby'));
    const titleIds = wrapper.findAll('.l-drawer__title').map((title) => title.attributes('id'));

    expect(new Set(labelledByIds).size).toBe(labelledByIds.length);
    expect(new Set(titleIds).size).toBe(titleIds.length);
  });
});
