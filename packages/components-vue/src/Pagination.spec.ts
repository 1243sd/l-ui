import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { LPagination } from './components/Pagination';

describe('LPagination', () => {
  it('renders page buttons and updates uncontrolled current page', async () => {
    const wrapper = mount(LPagination, {
      props: {
        defaultCurrent: 2,
        pageSize: 10,
        total: 35
      }
    });

    expect(wrapper.text()).toContain('1');
    expect(wrapper.text()).toContain('4');
    expect(wrapper.find('[aria-current="page"]').text()).toBe('2');

    await wrapper.findAll('.l-pagination__item')[3].trigger('click');

    expect(wrapper.emitted('update:current')?.at(-1)?.[0]).toBe(4);
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toBe(4);
    expect(wrapper.find('[aria-current="page"]').text()).toBe('4');
  });

  it('keeps controlled current immutable until the parent updates props', async () => {
    const wrapper = mount(LPagination, {
      props: {
        current: 2,
        pageSize: 10,
        total: 35
      }
    });

    await wrapper.findAll('.l-pagination__item')[2].trigger('click');

    expect(wrapper.find('[aria-current="page"]').text()).toBe('2');
    expect(wrapper.emitted('update:current')?.at(-1)?.[0]).toBe(3);

    await wrapper.setProps({ current: 3 });

    expect(wrapper.find('[aria-current="page"]').text()).toBe('3');
  });

  it('clamps navigation at the first and last pages', async () => {
    const wrapper = mount(LPagination, {
      props: {
        defaultCurrent: 1,
        pageSize: 10,
        total: 25
      }
    });

    const previous = wrapper.find('.l-pagination__nav--prev');
    const next = wrapper.find('.l-pagination__nav--next');

    expect(previous.attributes('disabled')).toBeDefined();

    await next.trigger('click');
    await next.trigger('click');
    await next.trigger('click');

    expect(wrapper.find('[aria-current="page"]').text()).toBe('3');
    expect(wrapper.find('.l-pagination__nav--next').attributes('disabled')).toBeDefined();
  });

  it('blocks interaction while disabled', async () => {
    const wrapper = mount(LPagination, {
      props: {
        defaultCurrent: 2,
        pageSize: 10,
        total: 40,
        disabled: true
      }
    });

    await wrapper.findAll('.l-pagination__item')[0].trigger('click');
    await wrapper.find('.l-pagination__nav--next').trigger('click');

    expect(wrapper.find('[aria-current="page"]').text()).toBe('2');
    expect(wrapper.emitted('update:current')).toBeUndefined();
  });
});
