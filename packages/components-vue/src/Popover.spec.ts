import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { LPopover } from './components/Popover';

describe('LPopover', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('toggles open by click and closes on outside press', async () => {
    const wrapper = mount(LPopover, {
      attachTo: document.body,
      props: {
        title: '收藏台',
        content: '把它放进常用面板',
        teleported: false
      },
      slots: {
        default: '<button type="button">更多操作</button>'
      }
    });

    const trigger = wrapper.find('.l-overlay-trigger');
    await trigger.trigger('click');

    expect(wrapper.find('.l-popover__overlay').text()).toContain('把它放进常用面板');

    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.l-popover__overlay').exists()).toBe(false);
    expect(wrapper.emitted('update:open')?.at(-1)?.[0]).toBe(false);
  });

  it('keeps controlled open immutable until the parent updates props', async () => {
    const wrapper = mount(LPopover, {
      props: {
        title: '受控标题',
        content: '受控内容',
        teleported: false,
        open: false
      },
      slots: {
        default: '<button type="button">受控触发器</button>'
      }
    });

    await wrapper.find('.l-overlay-trigger').trigger('click');

    expect(wrapper.emitted('update:open')?.at(-1)?.[0]).toBe(true);
    expect(wrapper.find('.l-popover__overlay').exists()).toBe(false);

    await wrapper.setProps({ open: true });

    expect(wrapper.find('.l-popover__overlay').text()).toContain('受控内容');
  });

  it('keeps hover popover open while moving from trigger into overlay content', async () => {
    const wrapper = mount(LPopover, {
      attachTo: document.body,
      props: {
        title: '悬停提示',
        content: '移动到浮层里继续操作',
        trigger: 'hover',
        teleported: false
      },
      slots: {
        default: '<button type="button">悬停触发</button>'
      }
    });

    const trigger = wrapper.find('.l-overlay-trigger');
    await trigger.trigger('mouseenter');

    const overlay = wrapper.find('.l-popover__overlay');
    expect(overlay.exists()).toBe(true);

    await trigger.trigger('mouseleave', { relatedTarget: overlay.element });

    expect(wrapper.find('.l-popover__overlay').exists()).toBe(true);
  });
});
