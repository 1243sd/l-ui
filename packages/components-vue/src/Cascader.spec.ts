import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, nextTick, reactive } from 'vue';
import { describe, expect, it } from 'vitest';
import { LConfigProvider } from './components/ConfigProvider';
import { LCascader, type CascaderOption } from './components/Cascader';
import { LForm } from './components/Form';
import { LFormItem } from './components/FormItem';

const options: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [{ value: 'xihu', label: 'West Lake' }]
      }
    ]
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [
      {
        value: 'nanjing',
        label: 'Nanjing',
        children: [{ value: 'qinhuai', label: 'Qinhuai' }]
      }
    ]
  }
];

describe('LCascader', () => {
  it('opens and selects a single path in uncontrolled mode', async () => {
    const wrapper = mount(LCascader, {
      props: {
        options
      }
    });

    await wrapper.find('.l-cascader').trigger('click');
    await wrapper.find('[data-cascader-option="zhejiang"]').trigger('click');
    await wrapper.find('[data-cascader-option="hangzhou"]').trigger('click');
    await wrapper.find('[data-cascader-option="xihu"]').trigger('click');

    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(['zhejiang', 'hangzhou', 'xihu']);
    expect(wrapper.find('.l-cascader__value').text()).toBe('Zhejiang / Hangzhou / West Lake');
    expect(wrapper.find('.l-cascader-dropdown').exists()).toBe(false);
  });

  it('keeps controlled value stable until parent updates props', async () => {
    const wrapper = mount(LCascader, {
      props: {
        options,
        value: ['jiangsu', 'nanjing', 'qinhuai']
      }
    });

    await wrapper.find('.l-cascader').trigger('click');
    await wrapper.find('[data-cascader-option="zhejiang"]').trigger('click');
    await wrapper.find('[data-cascader-option="hangzhou"]').trigger('click');
    await wrapper.find('[data-cascader-option="xihu"]').trigger('click');

    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(['zhejiang', 'hangzhou', 'xihu']);
    expect(wrapper.find('.l-cascader__value').text()).toBe('Jiangsu / Nanjing / Qinhuai');

    await wrapper.setProps({ value: ['zhejiang', 'hangzhou', 'xihu'] });
    expect(wrapper.find('.l-cascader__value').text()).toBe('Zhejiang / Hangzhou / West Lake');
  });

  it('stays controlled when the parent clears the path to undefined', async () => {
    const wrapper = mount(LCascader, {
      props: {
        options,
        value: ['jiangsu', 'nanjing', 'qinhuai'],
        allowClear: true
      }
    });

    await wrapper.find('.l-cascader__clear').trigger('click');
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toBeUndefined();

    await wrapper.setProps({ value: undefined });
    expect(wrapper.find('.l-cascader__value').text()).toBe('Select option');
  });

  it('supports allowClear, disabled state, and size inheritance', async () => {
    const Root = defineComponent({
      components: { LConfigProvider, LCascader },
      setup() {
        return { options };
      },
      template: `
        <LConfigProvider component-size="large">
          <LCascader
            :options="options"
            :default-value="['zhejiang', 'hangzhou', 'xihu']"
            allow-clear
            disabled
            status="warning"
          />
        </LConfigProvider>
      `
    });

    const wrapper = mount(Root);
    const cascader = wrapper.find('.l-cascader-wrapper');

    expect(cascader.classes()).toContain('l-cascader-wrapper--large');
    expect(cascader.classes()).toContain('l-cascader-wrapper--disabled');
    expect(cascader.classes()).toContain('l-cascader-wrapper--warning');
    expect(wrapper.find('.l-cascader__clear').exists()).toBe(false);

    await wrapper.find('.l-cascader').trigger('click');
    expect(wrapper.find('.l-cascader-dropdown').exists()).toBe(false);
  });

  it('works with FormItem required validation', async () => {
    const Root = defineComponent({
      components: { LForm, LFormItem, LCascader },
      setup() {
        const model = reactive<{ cityPath: string[] | undefined }>({
          cityPath: undefined
        });
        const rules = {
          cityPath: [{ required: true, message: 'City path is required' }]
        };

        return { model, options, rules };
      },
      template: `
        <LForm :model="model" :rules="rules">
          <LFormItem label="City" name="cityPath">
            <LCascader v-model:value="model.cityPath" :options="options" />
          </LFormItem>
          <button type="submit">Submit</button>
        </LForm>
      `
    });

    const wrapper = mount(Root);

    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await nextTick();

    expect(wrapper.text()).toContain('City path is required');
    expect(wrapper.find('.l-cascader-wrapper').classes()).toContain('l-cascader-wrapper--error');

    await wrapper.find('.l-cascader').trigger('click');
    await wrapper.find('[data-cascader-option="zhejiang"]').trigger('click');
    await wrapper.find('[data-cascader-option="hangzhou"]').trigger('click');
    await wrapper.find('[data-cascader-option="xihu"]').trigger('click');
    await nextTick();

    expect(wrapper.text()).not.toContain('City path is required');
  });
});
