import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProQueryFilter from './ProQueryFilter.vue';
import type { SearchFieldSchema } from './types';

const schema: SearchFieldSchema[] = [
  { name: 'keyword', label: 'Keyword', type: 'text' },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    options: [{ label: 'Designer', value: 'designer' }]
  },
  { name: 'releasedAt', label: 'Released At', type: 'date' },
  { name: 'window', label: 'Window', type: 'dateRange' },
  {
    name: 'region',
    label: 'Region',
    type: 'cascader',
    options: [{ label: 'Zhejiang', value: 'zhejiang' }]
  }
];

describe('ProQueryFilter', () => {
  it('collapses to the visible field count and expands advanced fields on demand', async () => {
    const wrapper = mount(ProQueryFilter, {
      props: {
        schema,
        values: {}
      }
    });

    expect(wrapper.findAll('.l-form-item')).toHaveLength(4);
    expect(wrapper.get('[data-testid="pro-query-filter-summary"]').text()).toContain('4/5 常用');
    expect(wrapper.find('.l-input-wrapper').exists()).toBe(true);
    expect(wrapper.find('.l-select-wrapper').exists()).toBe(true);
    expect(wrapper.find('.l-date-picker-wrapper').exists()).toBe(true);
    expect(wrapper.find('.l-date-range-picker-wrapper').exists()).toBe(true);
    expect(wrapper.find('.l-cascader-wrapper').exists()).toBe(false);

    await wrapper.get('[data-testid="pro-query-filter-toggle"]').trigger('click');

    expect(wrapper.emitted('update:expanded')?.[0]).toEqual([true]);
    expect(wrapper.findAll('.l-form-item')).toHaveLength(5);
    expect(wrapper.find('.l-cascader-wrapper').exists()).toBe(true);
  });

  it('propagates select, date, date range, and cascader updates through update:values', async () => {
    const wrapper = mount(ProQueryFilter, {
      props: {
        expanded: true,
        schema,
        values: {
          keyword: '',
          role: undefined,
          releasedAt: undefined,
          window: undefined,
          region: undefined
        }
      }
    });

    await wrapper.get('.l-select').trigger('click');
    await wrapper.get('.l-select-option__button').trigger('click');

    let nextValues = wrapper.emitted('update:values')?.at(-1)?.[0] as Record<string, unknown>;
    expect(nextValues).toEqual({
      keyword: '',
      role: 'designer',
      releasedAt: undefined,
      window: undefined,
      region: undefined
    });

    await wrapper.setProps({ values: nextValues });
    await wrapper.get('.l-date-picker').trigger('click');
    await wrapper.get('[data-date="2026-06-14"]').trigger('click');

    nextValues = wrapper.emitted('update:values')?.at(-1)?.[0] as Record<string, unknown>;
    expect(nextValues).toEqual({
      keyword: '',
      role: 'designer',
      releasedAt: '2026-06-14',
      window: undefined,
      region: undefined
    });

    await wrapper.setProps({ values: nextValues });
    await wrapper.get('.l-date-range-picker').trigger('click');
    await wrapper.get('[data-date="2026-06-14"]').trigger('click');
    await wrapper.get('[data-date="2026-06-18"]').trigger('click');

    nextValues = wrapper.emitted('update:values')?.at(-1)?.[0] as Record<string, unknown>;
    expect(nextValues).toEqual({
      keyword: '',
      role: 'designer',
      releasedAt: '2026-06-14',
      window: ['2026-06-14', '2026-06-18'],
      region: undefined
    });

    await wrapper.setProps({ values: nextValues });
    await wrapper.get('.l-cascader').trigger('click');
    await wrapper.get('[data-cascader-option="zhejiang"]').trigger('click');

    expect(wrapper.emitted('update:values')?.at(-1)?.[0]).toEqual({
      keyword: '',
      role: 'designer',
      releasedAt: '2026-06-14',
      window: ['2026-06-14', '2026-06-18'],
      region: ['zhejiang']
    });
  });

  it('emits updated values and resets back to schema defaults', async () => {
    const wrapper = mount(ProQueryFilter, {
      props: {
        schema: [
          {
            name: 'keyword',
            label: 'Keyword',
            type: 'text',
            defaultValue: 'violet'
          },
          {
            name: 'role',
            label: 'Role',
            type: 'select',
            options: [{ label: 'Designer', value: 'designer' }],
            defaultValue: 'designer'
          }
        ],
        values: {
          keyword: '',
          role: undefined
        }
      }
    });

    await wrapper.get('.l-input').setValue('cute');

    expect(wrapper.emitted('update:values')?.[0]?.[0]).toEqual({
      keyword: 'cute',
      role: undefined
    });

    await wrapper.get('[data-testid="pro-query-filter-reset"]').trigger('click');

    expect(wrapper.emitted('update:values')?.[1]?.[0]).toEqual({
      keyword: 'violet',
      role: 'designer'
    });
    expect(wrapper.emitted('reset')?.[0]?.[0]).toEqual({
      keyword: 'violet',
      role: 'designer'
    });
  });

  it('emits submit with the current value snapshot', async () => {
    const wrapper = mount(ProQueryFilter, {
      props: {
        schema: [{ name: 'keyword', label: 'Keyword', type: 'text' }],
        values: {
          keyword: 'alice'
        }
      }
    });

    await wrapper.get('[data-testid="pro-query-filter-submit"]').trigger('click');

    expect(wrapper.emitted('submit')?.[0]?.[0]).toEqual({
      keyword: 'alice'
    });
  });
});
