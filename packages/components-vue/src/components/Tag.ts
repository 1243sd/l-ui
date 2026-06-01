import { computed, defineComponent, h, type PropType } from 'vue';
import { useLolitaConfig } from '../config/context';
import { classNames } from '../utils/classNames';

export type TagColor = 'default' | 'primary' | 'success' | 'warning' | 'danger';

export const LTag = defineComponent({
  name: 'LTag',
  inheritAttrs: false,
  props: {
    color: {
      type: String as PropType<TagColor>,
      default: 'default'
    },
    bordered: {
      type: Boolean,
      default: true
    },
    round: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { attrs, slots }) {
    const config = useLolitaConfig();
    const prefixedClass = computed(() => `${config.value.prefixCls}-tag`);

    const className = computed(() =>
      classNames(
        'l-tag',
        `l-tag--${props.color}`,
        !props.bordered && 'l-tag--borderless',
        props.round && 'l-tag--round',
        prefixedClass.value !== 'l-tag' && prefixedClass.value
      )
    );

    return () => {
      const { class: attrsClass, style: attrsStyle, ...tagAttrs } = attrs;

      return h(
        'span',
        {
          ...tagAttrs,
          class: [className.value, attrsClass],
          style: attrsStyle
        },
        slots.default?.()
      );
    };
  }
});

export const Tag = LTag;
