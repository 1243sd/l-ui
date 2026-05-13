import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createMapIconSet } from './adapters';
import { createCuteIconPlugin, createCuteIconProvider, useCuteIconProvider } from './provider';

const HeartA = defineComponent({
  name: 'HeartA',
  setup() {
    return () => h('span', 'a');
  }
});

const HeartB = defineComponent({
  name: 'HeartB',
  setup() {
    return () => h('span', 'b');
  }
});

describe('CuteIconProvider', () => {
  it('resolves latest registered icon set first', () => {
    const provider = createCuteIconProvider({
      sets: [createMapIconSet('base', { heart: HeartA })]
    });

    provider.registerSet(createMapIconSet('override', { heart: HeartB }));
    expect(provider.resolve('heart')).toBe(HeartB);
  });

  it('falls back after unregistering an override set', () => {
    const provider = createCuteIconProvider({
      sets: [
        createMapIconSet('base', { heart: HeartA }),
        createMapIconSet('override', { heart: HeartB })
      ]
    });

    provider.unregisterSet('override');
    expect(provider.resolve('heart')).toBe(HeartA);
  });

  it('injects provider from plugin', () => {
    const provider = createCuteIconProvider({
      sets: [createMapIconSet('base', { heart: HeartA })]
    });

    const plugin = createCuteIconPlugin({ provider });
    let injected = false;

    const Probe = defineComponent({
      setup() {
        injected = useCuteIconProvider() === provider;
        return () => h('div');
      }
    });

    mount(Probe, {
      global: {
        plugins: [plugin]
      }
    });

    expect(injected).toBe(true);
  });

  it('throws when provider is missing', () => {
    const Probe = defineComponent({
      setup() {
        useCuteIconProvider();
        return () => h('div');
      }
    });

    expect(() => mount(Probe)).toThrowError(/CuteIconProvider is not installed/);
  });
});
