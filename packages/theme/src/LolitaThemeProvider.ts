import { computed, defineComponent, provide, ref, watch, type PropType } from 'vue';
import { type LolitaThemeOverrides, createLolitaTheme } from './createLolitaTheme';
import { lolitaThemeKey } from './context';
import { applyLolitaTheme } from './runtime';

export const LolitaThemeProvider = defineComponent({
  name: 'LolitaThemeProvider',
  props: {
    mode: {
      type: String as PropType<'light' | 'dark'>,
      default: 'light'
    },
    overrides: {
      type: Object as PropType<LolitaThemeOverrides>,
      default: () => ({})
    },
    autoApply: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { slots }) {
    const theme = computed(() => createLolitaTheme({ mode: props.mode, overrides: props.overrides }));
    const themeRef = ref(theme.value);

    watch(
      theme,
      (next) => {
        themeRef.value = next;
        if (props.autoApply) {
          applyLolitaTheme(next);
        }
      },
      { immediate: true }
    );

    provide(lolitaThemeKey, themeRef);
    return () => slots.default?.();
  }
});
