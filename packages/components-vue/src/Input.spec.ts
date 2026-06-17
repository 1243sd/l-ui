import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { describe, expect, it } from 'vitest';
import { LConfigProvider } from './components/ConfigProvider';
import { LInput } from './components/Input';

describe('LInput', () => {
  it('emits update:value in controlled mode', async () => {
    const wrapper = mount(LInput, {
      props: {
        value: 'alpha'
      }
    });

    await wrapper.find('input').setValue('beta');
    expect(wrapper.emitted('update:value')?.[0]?.[0]).toBe('beta');
    expect(wrapper.emitted('change')?.[0]?.[0]).toBe('beta');
  });

  it('updates internal value in uncontrolled mode', async () => {
    const wrapper = mount(LInput, {
      props: {
        defaultValue: 'hello'
      }
    });

    const input = wrapper.find('input');
    expect((input.element as HTMLInputElement).value).toBe('hello');

    await input.setValue('world');
    expect((input.element as HTMLInputElement).value).toBe('world');
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toBe('world');
  });

  it('supports allowClear in uncontrolled mode', async () => {
    const wrapper = mount(LInput, {
      props: {
        defaultValue: 'cute',
        allowClear: true
      }
    });

    const clear = wrapper.find('.l-input__clear');
    expect(clear.exists()).toBe(true);
    expect(wrapper.classes()).toContain('l-input-wrapper--clearable');
    expect(clear.classes()).toContain('l-field-affix-action');

    await clear.trigger('click');
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toBe('');
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('');
  });

  it('stays controlled when the parent clears the value to undefined', async () => {
    const wrapper = mount(LInput, {
      props: {
        value: 'cute'
      }
    });

    await wrapper.setProps({ value: undefined });
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('');
  });

  it('applies disabled and status classes', async () => {
    const wrapper = mount(LInput, {
      props: {
        defaultValue: 'x',
        allowClear: true,
        disabled: true,
        status: 'error'
      }
    });

    expect(wrapper.classes()).toContain('l-input-wrapper--disabled');
    expect(wrapper.classes()).toContain('l-input-wrapper--error');
    expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    expect(wrapper.find('.l-input__clear').exists()).toBe(false);

    await wrapper.find('input').setValue('blocked');
    expect(wrapper.emitted('update:value')).toBeUndefined();
  });

  it('inherits size from ConfigProvider by default', () => {
    const Root = defineComponent({
      components: { LConfigProvider, LInput },
      template: `
        <LConfigProvider component-size="large">
          <LInput default-value="ok" />
        </LConfigProvider>
      `
    });

    const wrapper = mount(Root);
    expect(wrapper.find('.l-input-wrapper').classes()).toContain('l-input-wrapper--large');
  });
});
