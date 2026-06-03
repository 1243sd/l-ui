import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, nextTick, reactive } from 'vue';
import { describe, expect, it } from 'vitest';
import { LConfigProvider } from './components/ConfigProvider';
import { LDatePicker } from './components/DatePicker';
import { LForm } from './components/Form';
import { LFormItem } from './components/FormItem';

describe('LDatePicker', () => {
  it('opens, selects a date, and closes in uncontrolled mode', async () => {
    const wrapper = mount(LDatePicker, {
      props: {
        defaultValue: '2026-05-10'
      }
    });

    expect(wrapper.find('.l-date-picker-dropdown').exists()).toBe(false);

    await wrapper.find('.l-date-picker').trigger('click');
    expect(wrapper.find('.l-date-picker-dropdown').exists()).toBe(true);
    expect(wrapper.emitted('openChange')?.[0]?.[0]).toBe(true);

    await wrapper.find('[data-date="2026-05-14"]').trigger('click');

    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toBe('2026-05-14');
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toBe('2026-05-14');
    expect(wrapper.find('.l-date-picker__value').text()).toBe('2026-05-14');
    expect(wrapper.find('.l-date-picker-dropdown').exists()).toBe(false);
    expect(wrapper.emitted('openChange')?.at(-1)?.[0]).toBe(false);
  });

  it('keeps controlled value stable until parent updates props', async () => {
    const wrapper = mount(LDatePicker, {
      props: {
        value: '2026-05-10'
      }
    });

    await wrapper.find('.l-date-picker').trigger('click');
    await wrapper.find('[data-date="2026-05-12"]').trigger('click');

    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toBe('2026-05-12');
    expect(wrapper.find('.l-date-picker__value').text()).toBe('2026-05-10');

    await wrapper.setProps({ value: '2026-05-12' });

    expect(wrapper.find('.l-date-picker__value').text()).toBe('2026-05-12');
  });

  it('supports allowClear and custom format', async () => {
    const wrapper = mount(LDatePicker, {
      props: {
        defaultValue: '2026/05/08',
        format: 'YYYY/MM/DD',
        allowClear: true
      }
    });

    expect(wrapper.classes()).toContain('l-date-picker-wrapper--clearable');
    expect(wrapper.find('.l-date-picker__clear').exists()).toBe(true);
    expect(wrapper.find('.l-date-picker__value').text()).toBe('2026/05/08');

    await wrapper.find('.l-date-picker__clear').trigger('click');

    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toBeUndefined();
    expect(wrapper.find('.l-date-picker__value').text()).toBe('Select date');
  });

  it('respects disabled state and inherits size from ConfigProvider', async () => {
    const Root = defineComponent({
      components: { LConfigProvider, LDatePicker },
      template: `
        <LConfigProvider component-size="large">
          <LDatePicker default-value="2026-05-10" disabled status="error" />
        </LConfigProvider>
      `
    });

    const wrapper = mount(Root);
    const datePicker = wrapper.find('.l-date-picker-wrapper');

    expect(datePicker.classes()).toContain('l-date-picker-wrapper--large');
    expect(datePicker.classes()).toContain('l-date-picker-wrapper--disabled');
    expect(datePicker.classes()).toContain('l-date-picker-wrapper--error');

    await wrapper.find('.l-date-picker').trigger('click');
    expect(wrapper.find('.l-date-picker-dropdown').exists()).toBe(false);
  });

  it('works with FormItem required validation', async () => {
    const Root = defineComponent({
      components: { LForm, LFormItem, LDatePicker },
      setup() {
        const model = reactive<{ birthday: string | undefined }>({
          birthday: undefined
        });
        const rules = {
          birthday: [{ required: true, message: 'Birthday is required' }]
        };

        return { model, rules };
      },
      template: `
        <LForm :model="model" :rules="rules">
          <LFormItem label="Birthday" name="birthday">
            <LDatePicker v-model:value="model.birthday" />
          </LFormItem>
          <button type="submit">Submit</button>
        </LForm>
      `
    });

    const wrapper = mount(Root);

    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await nextTick();

    expect(wrapper.text()).toContain('Birthday is required');
    expect(wrapper.find('.l-date-picker-wrapper').classes()).toContain('l-date-picker-wrapper--error');

    await wrapper.find('.l-date-picker').trigger('click');
    const selectableDate = wrapper
      .findAll('.l-date-picker-dropdown__cell')
      .find((cell) => !cell.classes().includes('l-date-picker-dropdown__cell--muted'));

    expect(selectableDate).toBeDefined();
    await selectableDate!.trigger('click');
    await nextTick();

    expect(wrapper.text()).not.toContain('Birthday is required');
  });
});
