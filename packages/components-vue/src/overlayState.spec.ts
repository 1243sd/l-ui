import { mount } from '@vue/test-utils';
import { computed, defineComponent, h } from 'vue';
import { describe, expect, it } from 'vitest';
import { useOverlayOpenState } from './components/overlayState';

const OverlayHarness = defineComponent({
  props: {
    open: {
      type: Boolean,
      default: undefined
    },
    defaultOpen: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:open', 'openChange'],
  setup(props, { emit, expose }) {
    const overlay = useOverlayOpenState(props, emit);

    expose({
      open: computed(() => overlay.open.value),
      setOpen: overlay.setOpen,
      toggle: overlay.toggleOpen
    });

    return () => h('div');
  }
});

describe('useOverlayOpenState', () => {
  it('updates uncontrolled state and emits events', async () => {
    const wrapper = mount(OverlayHarness, {
      props: {
        defaultOpen: false
      }
    });

    expect(wrapper.vm.$.exposed?.open.value).toBe(false);

    wrapper.vm.$.exposed?.setOpen(true);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.$.exposed?.open.value).toBe(true);
    expect(wrapper.emitted('update:open')?.at(-1)?.[0]).toBe(true);
    expect(wrapper.emitted('openChange')?.at(-1)?.[0]).toBe(true);
  });

  it('keeps controlled state immutable until the parent updates props', async () => {
    const wrapper = mount(OverlayHarness, {
      props: {
        open: false
      }
    });

    wrapper.vm.$.exposed?.setOpen(true);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.$.exposed?.open.value).toBe(false);
    expect(wrapper.emitted('update:open')?.at(-1)?.[0]).toBe(true);
    expect(wrapper.emitted('openChange')?.at(-1)?.[0]).toBe(true);

    await wrapper.setProps({ open: true });

    expect(wrapper.vm.$.exposed?.open.value).toBe(true);
  });

  it('ignores open changes while disabled', async () => {
    const wrapper = mount(OverlayHarness, {
      props: {
        defaultOpen: false,
        disabled: true
      }
    });

    wrapper.vm.$.exposed?.toggle();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.$.exposed?.open.value).toBe(false);
    expect(wrapper.emitted('update:open')).toBeUndefined();
  });
});
