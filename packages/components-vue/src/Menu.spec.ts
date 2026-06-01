import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { LMenu } from './components/Menu';

const items = [
  { key: 'overview', label: '概览' },
  { key: 'archive', label: '归档', disabled: true },
  { key: 'settings', label: '设置' }
];

describe('LMenu', () => {
  it('selects an item by click and emits the selected keys', async () => {
    const wrapper = mount(LMenu, {
      props: {
        items,
        defaultSelectedKeys: ['overview']
      }
    });

    await wrapper.findAll('[role="menuitem"]')[2].trigger('click');

    expect(wrapper.emitted('update:selectedKeys')?.at(-1)?.[0]).toEqual(['settings']);
    expect(wrapper.emitted('select')?.at(-1)?.[0]).toBe('settings');
    expect(wrapper.findAll('.l-menu__item')[2].classes()).toContain('l-menu__item--selected');
  });

  it('supports vertical keyboard navigation and skips disabled items', async () => {
    const wrapper = mount(LMenu, {
      props: {
        items,
        defaultSelectedKeys: ['overview']
      },
      attachTo: document.body
    });

    const menuitem = wrapper.findAll('[role="menuitem"]')[0];

    await menuitem.trigger('keydown', { key: 'ArrowDown' });
    expect(document.activeElement?.textContent).toContain('设置');

    await wrapper.findAll('[role="menuitem"]')[2].trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('select')?.at(-1)?.[0]).toBe('settings');
  });

  it('supports horizontal keyboard navigation', async () => {
    const wrapper = mount(LMenu, {
      props: {
        items,
        mode: 'horizontal',
        defaultSelectedKeys: ['overview']
      },
      attachTo: document.body
    });

    await wrapper.findAll('[role="menuitem"]')[0].trigger('keydown', { key: 'ArrowRight' });

    expect(document.activeElement?.textContent).toContain('设置');
  });

  it('keeps controlled selectedKeys immutable until the parent updates props', async () => {
    const wrapper = mount(LMenu, {
      props: {
        items,
        selectedKeys: ['overview']
      }
    });

    await wrapper.findAll('[role="menuitem"]')[2].trigger('click');

    expect(wrapper.findAll('.l-menu__item')[0].classes()).toContain('l-menu__item--selected');
    expect(wrapper.emitted('update:selectedKeys')?.at(-1)?.[0]).toEqual(['settings']);

    await wrapper.setProps({
      selectedKeys: ['settings']
    });

    expect(wrapper.findAll('.l-menu__item')[2].classes()).toContain('l-menu__item--selected');
  });
});
