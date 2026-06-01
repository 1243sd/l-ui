import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { LDropdown } from './components/Dropdown';

const menuItems = [
  { key: 'copy', label: '复制链接' },
  { key: 'archive', label: '归档', disabled: true },
  { key: 'share', label: '分享给团队' }
];

describe('LDropdown', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('opens by click, reuses menu selection, and closes after select', async () => {
    const wrapper = mount(LDropdown, {
      attachTo: document.body,
      props: {
        menuItems,
        teleported: false
      },
      slots: {
        default: '<button type="button">更多操作</button>'
      }
    });

    await wrapper.find('.l-overlay-trigger').trigger('click');
    await wrapper.findAll('[role="menuitem"]')[2].trigger('click');

    expect(wrapper.emitted('select')?.at(-1)?.[0]).toBe('share');
    expect(wrapper.emitted('update:open')?.at(-1)?.[0]).toBe(false);
    expect(wrapper.find('.l-dropdown__overlay').exists()).toBe(false);
  });

  it('opens from ArrowDown and focuses the first enabled menu item', async () => {
    const wrapper = mount(LDropdown, {
      attachTo: document.body,
      props: {
        menuItems,
        teleported: false
      },
      slots: {
        default: '<button type="button">更多操作</button>'
      }
    });

    await wrapper.find('.l-overlay-trigger').trigger('keydown', { key: 'ArrowDown' });

    expect(wrapper.find('.l-dropdown__overlay').exists()).toBe(true);
    expect(document.activeElement?.textContent).toContain('复制链接');
  });

  it('keeps hover dropdown open while moving from trigger into the menu', async () => {
    const wrapper = mount(LDropdown, {
      attachTo: document.body,
      props: {
        menuItems,
        trigger: 'hover',
        teleported: false
      },
      slots: {
        default: '<button type="button">悬停菜单</button>'
      }
    });

    const trigger = wrapper.find('.l-overlay-trigger');
    await trigger.trigger('mouseenter');

    const overlay = wrapper.find('.l-dropdown__overlay');
    expect(overlay.exists()).toBe(true);

    await trigger.trigger('mouseleave', { relatedTarget: overlay.element });

    expect(wrapper.find('.l-dropdown__overlay').exists()).toBe(true);
  });
});
