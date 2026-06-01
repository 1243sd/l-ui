import { computed, defineComponent, h, type PropType, type VNode } from 'vue';
import { useLolitaConfig } from '../config/context';
import { classNames } from '../utils/classNames';

export type BadgeStatus = 'default' | 'processing' | 'success' | 'warning' | 'error';

export const LBadge = defineComponent({
  name: 'LBadge',
  inheritAttrs: false,
  props: {
    status: {
      type: String as PropType<BadgeStatus>,
      default: 'default'
    },
    text: {
      type: String,
      default: undefined
    },
    dot: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { attrs, slots }) {
    const config = useLolitaConfig();
    const prefixedClass = computed(() => `${config.value.prefixCls}-badge`);

    const className = computed(() =>
      classNames(
        'l-badge',
        `l-badge--${props.status}`,
        props.dot && 'l-badge--dot',
        prefixedClass.value !== 'l-badge' && prefixedClass.value
      )
    );

    return () => {
      const { class: attrsClass, style: attrsStyle, ...badgeAttrs } = attrs;
      const content = (slots.default?.() ?? []) as VNode[];
      const hasContent = content.length > 0;

      return h(
        'span',
        {
          ...badgeAttrs,
          class: [className.value, hasContent && 'l-badge--with-content', attrsClass],
          style: attrsStyle
        },
        [
          hasContent ? h('span', { class: 'l-badge__content' }, content) : null,
          h('span', { class: 'l-badge__indicator' }, [
            h('span', { class: 'l-badge__dot', 'aria-hidden': 'true' }),
            !props.dot && props.text ? h('span', { class: 'l-badge__text' }, props.text) : null
          ])
        ]
      );
    };
  }
});

export const Badge = LBadge;
