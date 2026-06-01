import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, reactive, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { LForm } from './components/Form';
import { LFormItem } from './components/FormItem';
import { LInput } from './components/Input';

describe('LForm + LFormItem', () => {
  it('blocks submit and shows required error when invalid', async () => {
    const model = reactive<{ name: string }>({ name: '' });
    const rules = {
      name: [{ required: true, message: 'Name is required' }]
    };
    const onFinishFailed = vi.fn();

    const wrapper = mount(LForm, {
      props: {
        model,
        rules,
        onFinishFailed
      },
      slots: {
        default: () => [
          h(
            LFormItem,
            {
              label: 'Name',
              name: 'name'
            },
            {
              default: () =>
                h(LInput, {
                  value: model.name,
                  'onUpdate:value': (nextValue: string) => {
                    model.name = nextValue;
                  }
                })
            }
          ),
          h('button', { type: 'submit' }, 'Submit')
        ]
      }
    });

    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await nextTick();

    expect(onFinishFailed).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain('Name is required');
    expect(wrapper.find('.l-input-wrapper').classes()).toContain('l-input-wrapper--error');
  });

  it('emits finish when submit passes validation', async () => {
    const model = reactive<{ name: string }>({ name: 'Ada' });
    const rules = {
      name: [{ required: true, message: 'Name is required' }]
    };
    const onFinish = vi.fn();

    const wrapper = mount(LForm, {
      props: {
        model,
        rules,
        onFinish
      },
      slots: {
        default: () => [
          h(
            LFormItem,
            {
              label: 'Name',
              name: 'name'
            },
            {
              default: () =>
                h(LInput, {
                  value: model.name,
                  'onUpdate:value': (nextValue: string) => {
                    model.name = nextValue;
                  }
                })
            }
          ),
          h('button', { type: 'submit' }, 'Submit')
        ]
      }
    });

    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await nextTick();

    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish.mock.calls[0][0]).toEqual({ name: 'Ada' });
  });

  it('clears error after value is corrected and blurred', async () => {
    const Root = defineComponent({
      components: { LForm, LFormItem, LInput },
      setup() {
        const model = reactive<{ name: string }>({ name: '' });
        const rules = {
          name: [{ required: true, message: 'Name is required' }]
        };
        return { model, rules };
      },
      template: `
        <LForm :model="model" :rules="rules">
          <LFormItem label="Name" name="name">
            <LInput v-model:value="model.name" />
          </LFormItem>
          <button type="submit">Submit</button>
        </LForm>
      `
    });

    const wrapper = mount(Root);
    await wrapper.find('form').trigger('submit');
    await nextTick();
    expect(wrapper.text()).toContain('Name is required');

    const input = wrapper.find('input');
    await input.setValue('Good');
    await input.trigger('blur');
    await nextTick();

    expect(wrapper.text()).not.toContain('Name is required');
  });

  it('supports resetFields via form instance', async () => {
    const Root = defineComponent({
      components: { LForm, LFormItem, LInput },
      setup() {
        const formRef = ref<{ resetFields: () => void } | null>(null);
        const model = reactive<{ name: string }>({ name: 'Initial' });
        return { formRef, model };
      },
      template: `
        <LForm ref="formRef" :model="model">
          <LFormItem name="name">
            <LInput v-model:value="model.name" />
          </LFormItem>
        </LForm>
      `
    });

    const wrapper = mount(Root);
    const input = wrapper.find('input');
    await input.setValue('Changed');
    expect((wrapper.vm as { model: { name: string } }).model.name).toBe('Changed');

    (wrapper.vm as { formRef: { resetFields: () => void } }).formRef.resetFields();
    await nextTick();

    expect((wrapper.vm as { model: { name: string } }).model.name).toBe('Initial');
  });

  it('re-registers the field when FormItem name changes', async () => {
    const Root = defineComponent({
      components: { LForm, LFormItem, LInput },
      setup() {
        const activeName = ref<'primary' | 'secondary'>('primary');
        const model = reactive<{ primary: string; secondary: string }>({
          primary: 'Alpha',
          secondary: ''
        });
        const rules = {
          primary: [{ required: true, message: 'Primary required' }],
          secondary: [{ required: true, message: 'Secondary required' }]
        };

        return { activeName, model, rules };
      },
      template: `
        <LForm :model="model" :rules="rules">
          <LFormItem :name="activeName">
            <LInput v-model:value="model[activeName]" />
          </LFormItem>
          <button type="submit">Submit</button>
        </LForm>
      `
    });

    const wrapper = mount(Root);
    const vm = wrapper.vm as {
      activeName: 'primary' | 'secondary';
      model: { primary: string; secondary: string };
      rules: {
        primary: Array<{ required: boolean; message: string }>;
        secondary: Array<{ required: boolean; message: string }>;
      };
    };

    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await nextTick();
    expect(wrapper.text()).not.toContain('Primary required');

    vm.activeName = 'secondary';
    await nextTick();

    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await nextTick();

    expect(wrapper.text()).toContain('Secondary required');
  });
});
