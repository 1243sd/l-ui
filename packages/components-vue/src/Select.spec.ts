import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { LSelect } from './components/Select';

const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' }
];

describe('LSelect', () => {
  it('opens and closes dropdown by click', async () => {
    const wrapper = mount(LSelect, {
      props: { options }
    });

    expect(wrapper.find('.l-select-dropdown').exists()).toBe(false);
    await wrapper.find('.l-select').trigger('click');
    expect(wrapper.find('.l-select-dropdown').exists()).toBe(true);
    await wrapper.find('.l-select').trigger('click');
    expect(wrapper.find('.l-select-dropdown').exists()).toBe(false);
  });

  it('chooses option and emits update:value + change', async () => {
    const wrapper = mount(LSelect, {
      props: { options, defaultValue: 'apple' }
    });

    await wrapper.find('.l-select').trigger('click');
    await wrapper.findAll('.l-select-option__button')[1].trigger('click');

    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toBe('banana');
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toBe('banana');
    expect(wrapper.find('.l-select__value').text()).toBe('Banana');
    expect(wrapper.find('.l-select-dropdown').exists()).toBe(false);
  });

  it('supports keyboard navigation, Enter confirm and Escape close', async () => {
    const wrapper = mount(LSelect, {
      props: { options }
    });

    const trigger = wrapper.find('.l-select');
    await trigger.trigger('keydown', { key: 'ArrowDown' });
    expect(wrapper.find('.l-select-dropdown').exists()).toBe(true);
    expect(wrapper.findAll('.l-select-option')[0].classes()).toContain('l-select-option--active');

    await trigger.trigger('keydown', { key: 'ArrowDown' });
    expect(wrapper.findAll('.l-select-option')[1].classes()).toContain('l-select-option--active');

    await trigger.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toBe('banana');
    expect(wrapper.find('.l-select-dropdown').exists()).toBe(false);

    await trigger.trigger('click');
    expect(wrapper.find('.l-select-dropdown').exists()).toBe(true);
    await trigger.trigger('keydown', { key: 'Escape' });
    expect(wrapper.find('.l-select-dropdown').exists()).toBe(false);
  });

  it('respects disabled behavior', async () => {
    const wrapper = mount(LSelect, {
      props: {
        options,
        disabled: true
      }
    });

    const trigger = wrapper.find('.l-select');
    expect(trigger.attributes('disabled')).toBeDefined();

    await trigger.trigger('click');
    expect(wrapper.find('.l-select-dropdown').exists()).toBe(false);

    await trigger.trigger('keydown', { key: 'ArrowDown' });
    expect(wrapper.find('.l-select-dropdown').exists()).toBe(false);
    expect(wrapper.emitted('update:value')).toBeUndefined();
  });

  it('supports allowClear', async () => {
    const wrapper = mount(LSelect, {
      props: {
        options,
        defaultValue: 'cherry',
        allowClear: true
      }
    });

    expect(wrapper.classes()).toContain('l-select-wrapper--clearable');
    expect(wrapper.find('.l-select__indicator').exists()).toBe(true);
    expect(wrapper.find('.l-select__clear').exists()).toBe(true);
    expect(wrapper.find('.l-select__clear').classes()).toContain('l-field-affix-action');
    await wrapper.find('.l-select__clear').trigger('click');

    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toBeUndefined();
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toBeUndefined();
    expect(wrapper.find('.l-select__value').text()).toBe('请选择');
    expect(wrapper.find('.l-select__clear').exists()).toBe(false);
  });

  it('supports local search filtering when showSearch is enabled', async () => {
    const wrapper = mount(LSelect, {
      props: {
        options,
        showSearch: true
      }
    });

    await wrapper.find('.l-select').trigger('click');
    const searchInput = wrapper.find('.l-select-dropdown__search-input');

    expect(searchInput.exists()).toBe(true);

    await searchInput.setValue('an');

    expect(wrapper.emitted('update:searchValue')?.at(-1)?.[0]).toBe('an');
    expect(wrapper.emitted('search')?.at(-1)?.[0]).toBe('an');
    expect(wrapper.findAll('.l-select-option')).toHaveLength(1);
    expect(wrapper.find('.l-select-option__button').text()).toBe('Banana');
  });

  it('supports multiple mode selection and clear-all', async () => {
    const wrapper = mount(LSelect, {
      props: {
        options,
        mode: 'multiple',
        allowClear: true
      }
    });

    await wrapper.find('.l-select').trigger('click');
    const optionButtons = wrapper.findAll('.l-select-option__button');

    await optionButtons[0].trigger('click');
    await optionButtons[1].trigger('click');

    expect(wrapper.emitted('update:value')?.[0]?.[0]).toEqual(['apple']);
    expect(wrapper.emitted('update:value')?.[1]?.[0]).toEqual(['apple', 'banana']);
    expect(wrapper.findAll('.l-select__tag')).toHaveLength(2);

    await wrapper.find('.l-select__clear').trigger('click');

    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual([]);
    expect(wrapper.findAll('.l-select__tag')).toHaveLength(0);
  });

  it('supports boolean option values without coercing them to strings', async () => {
    const wrapper = mount(LSelect, {
      props: {
        options: [
          { label: 'Enabled', value: true },
          { label: 'Disabled', value: false }
        ],
        defaultValue: true
      }
    });

    await wrapper.find('.l-select').trigger('click');
    await wrapper.findAll('.l-select-option__button')[1].trigger('click');

    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toBe(false);
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toBe(false);
    expect(wrapper.find('.l-select__value').text()).toBe('Disabled');
  });

  it('supports remote search hooks when filterOption is false', async () => {
    const wrapper = mount(LSelect, {
      props: {
        options,
        showSearch: true,
        filterOption: false,
        loading: true,
        notFoundContent: '暂无结果'
      }
    });

    await wrapper.find('.l-select').trigger('click');
    const searchInput = wrapper.find('.l-select-dropdown__search-input');

    await searchInput.setValue('server');

    expect(wrapper.emitted('update:searchValue')?.at(-1)?.[0]).toBe('server');
    expect(wrapper.emitted('search')?.at(-1)?.[0]).toBe('server');
    expect(wrapper.findAll('.l-select-option')).toHaveLength(0);
    expect(wrapper.find('.l-select-dropdown__state').text()).toContain('加载中');
  });

  it('re-syncs active option when remote options change while dropdown is open', async () => {
    const wrapper = mount(LSelect, {
      props: {
        options,
        showSearch: true,
        filterOption: false
      }
    });

    await wrapper.find('.l-select').trigger('click');

    const searchInput = wrapper.find('.l-select-dropdown__search-input');
    await searchInput.trigger('keydown', { key: 'ArrowDown' });
    await searchInput.trigger('keydown', { key: 'ArrowDown' });

    expect(wrapper.findAll('.l-select-option')[2].classes()).toContain('l-select-option--active');

    await wrapper.setProps({
      options: [{ label: 'Dragonfruit', value: 'dragonfruit' }]
    });

    expect(wrapper.findAll('.l-select-option')).toHaveLength(1);
    expect(wrapper.find('.l-select-option').classes()).toContain('l-select-option--active');

    await searchInput.trigger('keydown', { key: 'Enter' });

    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toBe('dragonfruit');
  });
});
