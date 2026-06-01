import { computed, defineComponent, h, type PropType, type VNode } from 'vue';
import { useLolitaConfig, type ComponentSize } from '../config/context';
import { classNames } from '../utils/classNames';

export type AvatarShape = 'circle' | 'square';

export const LAvatar = defineComponent({
  name: 'LAvatar',
  inheritAttrs: false,
  props: {
    src: {
      type: String,
      default: undefined
    },
    alt: {
      type: String,
      default: undefined
    },
    size: {
      type: String as PropType<ComponentSize>,
      default: undefined
    },
    shape: {
      type: String as PropType<AvatarShape>,
      default: 'circle'
    },
    fallbackText: {
      type: String,
      default: undefined
    }
  },
  setup(props, { attrs, slots }) {
    const config = useLolitaConfig();
    const mergedSize = computed<ComponentSize>(() => props.size ?? config.value.componentSize);
    const prefixedClass = computed(() => `${config.value.prefixCls}-avatar`);

    const className = computed(() =>
      classNames(
        'l-avatar',
        `l-avatar--${mergedSize.value}`,
        `l-avatar--${props.shape}`,
        props.src && 'l-avatar--image',
        prefixedClass.value !== 'l-avatar' && prefixedClass.value
      )
    );

    return () => {
      const { class: attrsClass, style: attrsStyle, ...avatarAttrs } = attrs;
      const fallbackContent = (slots.default?.() ?? []) as VNode[];

      return h(
        'span',
        {
          ...avatarAttrs,
          class: [className.value, attrsClass],
          style: attrsStyle
        },
        props.src
          ? h('img', {
              class: 'l-avatar__image',
              src: props.src,
              alt: props.alt
            })
          : h(
              'span',
              { class: 'l-avatar__content' },
              fallbackContent.length > 0 ? fallbackContent : props.fallbackText
            )
      );
    };
  }
});

export const Avatar = LAvatar;
