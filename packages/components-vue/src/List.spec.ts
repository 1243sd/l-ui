import { h } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { LList } from './components/List';

describe('LList', () => {
  it('renders dataSource through renderItem slot', async () => {
    const wrapper = mount(LList, {
      props: {
        dataSource: [{ name: '张三' }, { name: '李四' }]
      },
      slots: {
        renderItem: ({ item, index }) => h('span', { class: 'list-row' }, `${index + 1}. ${(item as { name: string }).name}`)
      }
    });

    expect(wrapper.findAll('.list-row')).toHaveLength(2);
    expect(wrapper.findAll('.list-row')[0].text()).toBe('1. 张三');
    expect(wrapper.findAll('.list-row')[1].text()).toBe('2. 李四');
  });

  it('renders loading state before empty or items', () => {
    const wrapper = mount(LList, {
      props: {
        loading: true,
        emptyText: '暂无内容',
        dataSource: []
      },
      slots: {
        empty: () => h('div', { class: 'empty-slot' }, '空内容')
      }
    });

    expect(wrapper.find('.l-list__state--loading').exists()).toBe(true);
    expect(wrapper.text()).toContain('加载中...');
    expect(wrapper.find('.empty-slot').exists()).toBe(false);
  });

  it('renders empty slot or emptyText when dataSource is empty', () => {
    const emptySlotWrapper = mount(LList, {
      props: {
        dataSource: [],
        emptyText: '暂无内容'
      },
      slots: {
        empty: () => h('div', { class: 'empty-slot' }, '空内容')
      }
    });

    expect(emptySlotWrapper.find('.empty-slot').exists()).toBe(true);
    expect(emptySlotWrapper.text()).toContain('空内容');

    const emptyTextWrapper = mount(LList, {
      props: {
        dataSource: [],
        emptyText: '暂无内容'
      }
    });

    expect(emptyTextWrapper.find('.l-list__state--empty').exists()).toBe(true);
    expect(emptyTextWrapper.text()).toContain('暂无内容');
  });

  it('renders split separators only between list items', () => {
    const wrapper = mount(LList, {
      props: {
        dataSource: ['A', 'B', 'C'],
        split: true
      }
    });

    const items = wrapper.findAll('.l-list__item');

    expect(items).toHaveLength(3);
    expect(items[0].classes()).toContain('l-list__item--split');
    expect(items[1].classes()).toContain('l-list__item--split');
    expect(items[2].classes()).not.toContain('l-list__item--split');
  });
});
