import { computed, defineComponent, h, type PropType } from 'vue';
import { useLolitaConfig, type ComponentSize } from '../config/context';
import { classNames } from '../utils/classNames';

export type ButtonType = 'default' | 'primary' | 'dashed' | 'text' | 'link';
export type ButtonHtmlType = 'button' | 'submit' | 'reset';

export const LButton = defineComponent({
  name: 'LButton',
  inheritAttrs: false,
  props: {
    type: {
      type: String as PropType<ButtonType>,
      default: 'default'
    },
    size: {
      type: String as PropType<ComponentSize>,
      default: undefined
    },
    round: {
      type: Boolean,
      default: false
    },
    block: {
      type: Boolean,
      default: false
    },
    danger: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    htmlType: {
      type: String as PropType<ButtonHtmlType>,
      default: 'button'
    }
  },
  emits: {
    click: (event: MouseEvent) => event instanceof MouseEvent
  },
  setup(props, { attrs, slots, emit }) {
    const config = useLolitaConfig();
    const mergedSize = computed<ComponentSize>(() => props.size ?? config.value.componentSize);
    const prefixedClass = computed(() => `${config.value.prefixCls}-btn`);

    const className = computed(() =>
      classNames(
        'l-btn',
        `l-btn--${props.type}`,
        `l-btn--${mergedSize.value}`,
        props.round && 'l-btn--round',
        props.block && 'l-btn--block',
        props.danger && 'l-btn--danger',
        props.loading && 'l-btn--loading',
        prefixedClass.value !== 'l-btn' && prefixedClass.value
      )
    );

    const onClick = (event: MouseEvent) => {
      if (props.disabled || props.loading) {
        event.preventDefault();
        return;
      }
      emit('click', event);
    };

    return () =>
      h(
        'button',
        {
          ...attrs,
          type: props.htmlType,
          class: [className.value, attrs.class],
          style: attrs.style,
          disabled: props.disabled || props.loading,
          'aria-busy': props.loading ? 'true' : undefined,
          onClick
        },
        [
          props.loading ? h('span', { class: 'l-btn__spinner', 'aria-hidden': 'true' }) : null,
          h('span', { class: 'l-btn__content' }, slots.default?.())
        ]
      );
  }
});

export const Button = LButton;
