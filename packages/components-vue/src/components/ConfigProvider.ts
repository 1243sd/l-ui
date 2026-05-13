import { type LolitaThemeOverrides } from '@lolita-ui/theme';
import { computed, defineComponent, h, provide, type PropType } from 'vue';
import { type ComponentSize, lolitaConfigKey } from '../config/context';
import { LThemeProvider } from './ThemeProvider';

export const LConfigProvider = defineComponent({
  name: 'LConfigProvider',
  props: {
    prefixCls: {
      type: String,
      default: 'l'
    },
    componentSize: {
      type: String as PropType<ComponentSize>,
      default: 'middle'
    },
    themeMode: {
      type: String as PropType<'light' | 'dark'>,
      default: 'light'
    },
    themeOverrides: {
      type: Object as PropType<LolitaThemeOverrides>,
      default: () => ({})
    },
    autoApplyTheme: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { slots }) {
    const configRef = computed(() => ({
      prefixCls: props.prefixCls,
      componentSize: props.componentSize
    }));

    provide(lolitaConfigKey, configRef);

    return () =>
      h(
        LThemeProvider,
        {
          mode: props.themeMode,
          overrides: props.themeOverrides,
          autoApply: props.autoApplyTheme
        },
        slots
      );
  }
});

export const ConfigProvider = LConfigProvider;
