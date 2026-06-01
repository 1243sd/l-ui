import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, nextTick, reactive } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { LCheckbox } from './components/Checkbox';
import { LForm } from './components/Form';
import { LFormItem } from './components/FormItem';
import { LRadio } from './components/Radio';
import { LRadioGroup } from './components/RadioGroup';
import { LSwitch } from './components/Switch';

describe('choice controls', () => {
  it('toggles checkbox in uncontrolled mode and emits checked updates', async () => {
    const wrapper = mount(LCheckbox, {
      props: {
        defaultChecked: false
      },
      slots: {
        default: () => 'Agree'
      }
    });

    expect(wrapper.find('.l-checkbox').classes()).not.toContain('l-checkbox--checked');

    await wrapper.find('input[type="checkbox"]').setValue(true);

    expect(wrapper.emitted('update:checked')?.at(-1)?.[0]).toBe(true);
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toBe(true);
    expect(wrapper.find('.l-checkbox').classes()).toContain('l-checkbox--checked');
  });

  it('keeps checkbox controlled and only emits when checked prop is owned by parent', async () => {
    const wrapper = mount(LCheckbox, {
      props: {
        checked: false
      }
    });

    await wrapper.find('input[type="checkbox"]').setValue(true);

    expect(wrapper.emitted('update:checked')?.at(-1)?.[0]).toBe(true);
    expect(wrapper.find('.l-checkbox').classes()).not.toContain('l-checkbox--checked');
  });

  it('supports standalone radio checked model', async () => {
    const wrapper = mount(LRadio, {
      props: {
        defaultChecked: false,
        value: 'pink'
      },
      slots: {
        default: () => 'Pink'
      }
    });

    await wrapper.find('input[type="radio"]').setValue(true);

    expect(wrapper.emitted('update:checked')?.at(-1)?.[0]).toBe(true);
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toBe(true);
    expect(wrapper.find('.l-radio').classes()).toContain('l-radio--checked');
  });

  it('updates radio group selection from options and emits value changes', async () => {
    const wrapper = mount(LRadioGroup, {
      props: {
        defaultValue: 'strawberry',
        options: [
          { label: 'Strawberry', value: 'strawberry' },
          { label: 'Vanilla', value: 'vanilla' }
        ]
      }
    });

    const radios = wrapper.findAll('input[type="radio"]');
    expect((radios[0]?.element as HTMLInputElement | undefined)?.checked).toBe(true);

    await radios[1].setValue(true);

    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toBe('vanilla');
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toBe('vanilla');
    expect((radios[1]?.element as HTMLInputElement | undefined)?.checked).toBe(true);
  });

  it('keeps radio group parent-owned when value prop is explicitly undefined', async () => {
    const wrapper = mount(LRadioGroup, {
      props: {
        value: undefined,
        'onUpdate:value': () => undefined,
        options: [
          { label: 'Strawberry', value: 'strawberry' },
          { label: 'Vanilla', value: 'vanilla' }
        ]
      }
    });

    const radios = wrapper.findAll('input[type="radio"]');
    await radios[1].setValue(true);

    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toBe('vanilla');
    expect((radios[0]?.element as HTMLInputElement | undefined)?.checked).toBe(false);
    expect((radios[1]?.element as HTMLInputElement | undefined)?.checked).toBe(false);
  });

  it('toggles switch and respects disabled state', async () => {
    const onChange = vi.fn();
    const wrapper = mount(LSwitch, {
      props: {
        defaultChecked: false,
        onChange
      }
    });

    expect(wrapper.find('.l-switch button').attributes('aria-checked')).toBe('false');
    await wrapper.find('.l-switch button').trigger('click');
    expect(wrapper.emitted('update:checked')?.at(-1)?.[0]).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(wrapper.find('.l-switch button').attributes('aria-checked')).toBe('true');

    await wrapper.setProps({ disabled: true });
    await wrapper.find('.l-switch button').trigger('click');
    expect(wrapper.emitted('update:checked')?.length).toBe(1);
  });

  it('binds checked controls through FormItem valuePropName and fails required when unchecked', async () => {
    const Root = defineComponent({
      components: { LCheckbox, LForm, LFormItem },
      setup() {
        const model = reactive({ agree: false });
        const rules = {
          agree: [{ required: true, message: 'Please accept terms' }]
        };
        return { model, rules };
      },
      template: `
        <LForm :model="model" :rules="rules">
          <LFormItem name="agree" label="Agreement" valuePropName="checked">
            <LCheckbox v-model:checked="model.agree">Agree</LCheckbox>
          </LFormItem>
          <button type="submit">Submit</button>
        </LForm>
      `
    });

    const wrapper = mount(Root);

    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await nextTick();

    expect(wrapper.text()).toContain('Please accept terms');
    expect(wrapper.find('.l-form-item').classes()).toContain('l-form-item--error');

    await wrapper.find('input[type="checkbox"]').setValue(true);
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await nextTick();

    expect((wrapper.vm as { model: { agree: boolean } }).model.agree).toBe(true);
    expect(wrapper.text()).not.toContain('Please accept terms');
  });

  it('preserves explicit warning status inside FormItem when there is no validation error', async () => {
    const Root = defineComponent({
      components: { LCheckbox, LForm, LFormItem },
      setup() {
        const model = reactive({ agree: false });
        return { model };
      },
      template: `
        <LForm :model="model">
          <LFormItem name="agree" valuePropName="checked">
            <LCheckbox v-model:checked="model.agree" status="warning">Agree</LCheckbox>
          </LFormItem>
        </LForm>
      `
    });

    const wrapper = mount(Root);

    expect(wrapper.find('.l-checkbox').classes()).toContain('l-checkbox--warning');
    expect(wrapper.find('.l-checkbox').classes()).not.toContain('l-checkbox--error');
  });
});
