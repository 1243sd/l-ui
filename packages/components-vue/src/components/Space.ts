import { computed, defineComponent, Fragment, h, isVNode, type CSSProperties, type PropType, type VNode } from 'vue';
import { useLolitaConfig } from '../config/context';
import { classNames } from '../utils/classNames';

export type SpaceSize = 'small' | 'middle' | 'large' | number | [number | string, number | string];

const resolveTokenSpace = (size: string | number): string => {
  if (typeof size === 'number') {
    return `${size}px`;
  }

  if (size === 'small') {
    return 'var(--l-space-sm)';
  }
  if (size === 'large') {
    return 'var(--l-space-lg)';
  }
  if (size === 'middle') {
    return 'var(--l-space-md)';
  }
  if (/^\d+$/.test(size)) {
    return `${size}px`;
  }
  return size;
};

const flattenChildren = (nodes: VNode[]): VNode[] => {
  return nodes.flatMap((node) => {
    if (!isVNode(node)) {
      return [];
    }
    if (node.type === Fragment && Array.isArray(node.children)) {
      return flattenChildren(node.children as VNode[]);
    }
    return [node];
  });
};

export const LSpace = defineComponent({
  name: 'LSpace',
  inheritAttrs: false,
  props: {
    size: {
      type: [String, Number, Array] as PropType<SpaceSize>,
      default: 'small'
    },
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal'
    },
    align: {
      type: String as PropType<'start' | 'end' | 'center' | 'baseline'>,
      default: 'center'
    },
    wrap: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { attrs, slots }) {
    const config = useLolitaConfig();
    const prefixedClass = computed(() => `${config.value.prefixCls}-space`);

    const gapStyle = computed<CSSProperties>(() => {
      const raw = props.size;
      const horizontal = Array.isArray(raw) ? raw[0] : raw;
      const vertical = Array.isArray(raw) ? raw[1] : raw;

      return {
        columnGap: resolveTokenSpace(horizontal),
        rowGap: resolveTokenSpace(vertical),
        flexDirection: props.direction === 'vertical' ? 'column' : 'row',
        alignItems: props.align === 'start' ? 'flex-start' : props.align === 'end' ? 'flex-end' : props.align,
        flexWrap: props.wrap && props.direction === 'horizontal' ? 'wrap' : 'nowrap'
      };
    });

    const className = computed(() =>
      classNames('l-space', props.direction === 'vertical' && 'l-space--vertical', prefixedClass.value !== 'l-space' && prefixedClass.value)
    );

    return () => {
      const children = flattenChildren((slots.default?.() ?? []) as VNode[]);
      const hasSplit = Boolean(slots.split);
      const renderedChildren: VNode[] = [];

      children.forEach((child, index) => {
        renderedChildren.push(h('div', { class: 'l-space__item' }, [child]));
        if (hasSplit && index < children.length - 1) {
          renderedChildren.push(h('span', { class: 'l-space__split' }, slots.split?.()));
        }
      });

      return h(
        'div',
        {
          ...attrs,
          class: [className.value, attrs.class],
          style: [gapStyle.value, attrs.style]
        },
        renderedChildren
      );
    };
  }
});

export const Space = LSpace;
