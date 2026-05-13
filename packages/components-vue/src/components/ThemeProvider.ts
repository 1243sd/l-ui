import { LolitaThemeProvider, type LolitaThemeOverrides } from '@lolita-ui/theme';
import { defineComponent, h, type PropType } from 'vue';

export const LThemeProvider = defineComponent({
  name: 'LThemeProvider',
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
    return () =>
      h(
        LolitaThemeProvider,
        {
          mode: props.mode,
          overrides: props.overrides,
          autoApply: props.autoApply
        },
        slots
      );
  }
});

export const ThemeProvider = LThemeProvider;
