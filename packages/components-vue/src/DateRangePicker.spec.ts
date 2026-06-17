import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, nextTick, reactive } from 'vue';
import { describe, expect, it } from 'vitest';
import { LConfigProvider } from './components/ConfigProvider';
import { LDateRangePicker } from './components/DateRangePicker';
import { LForm } from './components/Form';
import { LFormItem } from './components/FormItem';

describe('LDateRangePicker', () => {
  it('selects a start and end date in uncontrolled mode and closes after the range is complete', async () => {
    const wrapper = mount(LDateRangePicker, {
      props: {
        defaultValue: ['2026-06-10', '2026-06-12']
      }
    });

    expect(wrapper.find('.l-date-range-picker-dropdown').exists()).toBe(false);

    await wrapper.find('.l-date-range-picker').trigger('click');
    expect(wrapper.find('.l-date-range-picker-dropdown').exists()).toBe(true);
    expect(wrapper.emitted('openChange')?.[0]?.[0]).toBe(true);

    await wrapper.find('[data-date="2026-06-14"]').trigger('click');
    await wrapper.find('[data-date="2026-06-18"]').trigger('click');

    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(['2026-06-14', '2026-06-18']);
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toEqual(['2026-06-14', '2026-06-18']);
    expect(wrapper.find('.l-date-range-picker__value').text()).toBe('2026-06-14 ~ 2026-06-18');
    expect(wrapper.find('.l-date-range-picker-dropdown').exists()).toBe(false);
    expect(wrapper.emitted('openChange')?.at(-1)?.[0]).toBe(false);
  });

  it('normalizes reversed selections into ascending ranges', async () => {
    const wrapper = mount(LDateRangePicker, {
      props: {
        defaultValue: ['2026-06-10', '2026-06-12']
      }
    });

    await wrapper.find('.l-date-range-picker').trigger('click');
    await wrapper.find('[data-date="2026-06-20"]').trigger('click');
    await wrapper.find('[data-date="2026-06-16"]').trigger('click');

    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(['2026-06-16', '2026-06-20']);
    expect(wrapper.find('.l-date-range-picker__value').text()).toBe('2026-06-16 ~ 2026-06-20');
  });

  it('keeps controlled value stable until parent updates props and supports allowClear', async () => {
    const wrapper = mount(LDateRangePicker, {
      props: {
        value: ['2026/06/01', '2026/06/08'],
        format: 'YYYY/MM/DD',
        allowClear: true
      }
    });

    expect(wrapper.find('.l-date-range-picker__indicator').exists()).toBe(true);
    expect(wrapper.find('.l-date-range-picker__clear').exists()).toBe(true);
    expect(wrapper.find('.l-date-range-picker__value').text()).toBe('2026/06/01 ~ 2026/06/08');

    await wrapper.find('.l-date-range-picker').trigger('click');
    await wrapper.find('[data-date="2026-06-10"]').trigger('click');
    await wrapper.find('[data-date="2026-06-12"]').trigger('click');

    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(['2026/06/10', '2026/06/12']);
    expect(wrapper.find('.l-date-range-picker__value').text()).toBe('2026/06/01 ~ 2026/06/08');

    await wrapper.setProps({ value: ['2026/06/10', '2026/06/12'] });
    expect(wrapper.find('.l-date-range-picker__value').text()).toBe('2026/06/10 ~ 2026/06/12');

    await wrapper.find('.l-date-range-picker__clear').trigger('click');
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toBeUndefined();

    await wrapper.setProps({ value: undefined });
    expect(wrapper.find('.l-date-range-picker__value').text()).toBe('Select date range');
  });

  it('does not backfill the trigger text until the end date is selected', async () => {
    const wrapper = mount(LDateRangePicker);

    expect(wrapper.find('.l-date-range-picker__value').text()).toBe('Select date range');

    await wrapper.find('.l-date-range-picker').trigger('click');
    await wrapper.find('[data-date="2026-06-02"]').trigger('click');

    expect(wrapper.find('.l-date-range-picker__value').text()).toBe('Select date range');
    expect(wrapper.emitted('update:value')).toBeUndefined();
  });

  it('keeps the committed range visible while previewing a new start date', async () => {
    const wrapper = mount(LDateRangePicker, {
      props: {
        defaultValue: ['2026-06-10', '2026-06-12']
      }
    });

    await wrapper.find('.l-date-range-picker').trigger('click');
    await wrapper.find('[data-date="2026-06-18"]').trigger('click');

    expect(wrapper.find('.l-date-range-picker__value').text()).toBe('2026-06-10 ~ 2026-06-12');
    expect(wrapper.find('[data-date="2026-06-18"]').classes()).toContain(
      'l-date-range-picker-dropdown__cell--selected'
    );
    expect(wrapper.find('[data-date="2026-06-10"]').classes()).toContain(
      'l-date-range-picker-dropdown__cell--soft-selected'
    );
    expect(wrapper.find('[data-date="2026-06-11"]').classes()).toContain(
      'l-date-range-picker-dropdown__cell--soft-in-range'
    );
    expect(wrapper.find('[data-date="2026-06-12"]').classes()).toContain(
      'l-date-range-picker-dropdown__cell--soft-selected'
    );
  });

  it('inherits size and works with FormItem required validation', async () => {
    const Root = defineComponent({
      components: { LConfigProvider, LForm, LFormItem, LDateRangePicker },
      setup() {
        const model = reactive<{ window: [string, string] | undefined }>({
          window: undefined
        });
        const rules = {
          window: [{ required: true, message: 'Window is required' }]
        };

        return { model, rules };
      },
      template: `
        <LConfigProvider component-size="large">
          <LForm :model="model" :rules="rules">
            <LFormItem label="Window" name="window">
              <LDateRangePicker v-model:value="model.window" />
            </LFormItem>
            <button type="submit">Submit</button>
          </LForm>
        </LConfigProvider>
      `
    });

    const wrapper = mount(Root);

    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await nextTick();

    const rangePicker = wrapper.find('.l-date-range-picker-wrapper');
    expect(rangePicker.classes()).toContain('l-date-range-picker-wrapper--large');
    expect(rangePicker.classes()).toContain('l-date-range-picker-wrapper--error');
    expect(wrapper.text()).toContain('Window is required');

    await wrapper.find('.l-date-range-picker').trigger('click');
    await wrapper.find('[data-date="2026-06-14"]').trigger('click');
    await wrapper.find('[data-date="2026-06-18"]').trigger('click');
    await flushPromises();
    await nextTick();

    expect(wrapper.text()).not.toContain('Window is required');
  });
});
