import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import { describe, expect, it } from 'vitest';
import { LTransfer, type TransferItem } from './components/Transfer';

const dataSource: TransferItem[] = [
  { key: 'alpha', title: 'Alpha' },
  { key: 'beta', title: 'Beta' },
  { key: 'gamma', title: 'Gamma', disabled: true }
];

describe('LTransfer', () => {
  it('moves selected source items to target in uncontrolled mode', async () => {
    const wrapper = mount(LTransfer, {
      props: {
        dataSource
      }
    });

    await wrapper.find('[data-transfer-item="alpha"]').trigger('click');
    expect(wrapper.emitted('update:selectedKeys')?.at(-1)?.[0]).toEqual(['alpha']);

    await wrapper.find('[data-transfer-move="right"]').trigger('click');

    expect(wrapper.emitted('update:targetKeys')?.at(-1)?.[0]).toEqual(['alpha']);
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toEqual(['alpha']);
    expect(wrapper.find('[data-transfer-pane="target"]').text()).toContain('Alpha');
  });

  it('keeps controlled targetKeys stable until parent updates props', async () => {
    const Root = defineComponent({
      components: { LTransfer },
      setup() {
        const targetKeys = ref<string[]>([]);
        const selectedKeys = ref<string[]>([]);

        return { dataSource, selectedKeys, targetKeys };
      },
      template: `
        <LTransfer
          :data-source="dataSource"
          :target-keys="targetKeys"
          :selected-keys="selectedKeys"
          @update:selectedKeys="selectedKeys = $event"
        />
      `
    });

    const wrapper = mount(Root);

    await wrapper.find('[data-transfer-item="alpha"]').trigger('click');
    await wrapper.find('[data-transfer-move="right"]').trigger('click');

    expect(wrapper.find('[data-transfer-pane="source"]').text()).toContain('Alpha');

    (wrapper.vm as { targetKeys: string[] }).targetKeys = ['alpha'];
    await nextTick();

    expect(wrapper.find('[data-transfer-pane="target"]').text()).toContain('Alpha');
  });

  it('moves selected target items back to source and clears moved selection', async () => {
    const wrapper = mount(LTransfer, {
      props: {
        dataSource,
        defaultTargetKeys: ['beta']
      }
    });

    await wrapper.find('[data-transfer-item="beta"]').trigger('click');
    await wrapper.find('[data-transfer-move="left"]').trigger('click');

    expect(wrapper.emitted('update:targetKeys')?.at(-1)?.[0]).toEqual([]);
    expect(wrapper.emitted('update:selectedKeys')?.at(-1)?.[0]).toEqual([]);
    expect(wrapper.find('[data-transfer-pane="source"]').text()).toContain('Beta');
  });

  it('respects disabled items and disabled component state', async () => {
    const wrapper = mount(LTransfer, {
      props: {
        dataSource,
        disabled: true
      }
    });

    await wrapper.find('[data-transfer-item="alpha"]').trigger('click');
    await wrapper.find('[data-transfer-move="right"]').trigger('click');

    expect(wrapper.emitted('update:selectedKeys')).toBeUndefined();
    expect(wrapper.emitted('update:targetKeys')).toBeUndefined();
    expect(wrapper.find('.l-transfer').classes()).toContain('l-transfer--disabled');
  });
});
