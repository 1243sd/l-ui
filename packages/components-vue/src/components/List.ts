import { computed, defineComponent, h, type PropType } from 'vue';
import { useLolitaConfig } from '../config/context';
import { classNames } from '../utils/classNames';

export type ListRenderItemContext = {
  item: unknown;
  index: number;
};

const renderItemFallback = (item: unknown): string => {
  if (item === null || item === undefined) {
    return '';
  }

  if (typeof item === 'string') {
    return item;
  }

  if (typeof item === 'number' || typeof item === 'boolean') {
    return String(item);
  }

  return JSON.stringify(item);
};

export const LList = defineComponent({
  name: 'LList',
  inheritAttrs: false,
  props: {
    dataSource: {
      type: Array as PropType<unknown[]>,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    emptyText: {
      type: String,
      default: '暂无数据'
    },
    split: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { attrs, slots }) {
    const config = useLolitaConfig();
    const prefixedClass = computed(() => `${config.value.prefixCls}-list`);

    const rootClassName = computed(() =>
      classNames('l-list', props.split && 'l-list--split', prefixedClass.value !== 'l-list' && prefixedClass.value)
    );

    const renderLoadingState = () =>
      h(
        'div',
        {
          class: 'l-list__state l-list__state--loading',
          role: 'status',
          'aria-live': 'polite'
        },
        '加载中...'
      );

    const renderEmptyState = () => {
      const emptySlot = slots.empty?.();

      if (emptySlot && emptySlot.length > 0) {
        return h(
          'div',
          {
            class: 'l-list__state l-list__state--empty'
          },
          emptySlot
        );
      }

      return h(
        'div',
        {
          class: 'l-list__state l-list__state--empty'
        },
        props.emptyText
      );
    };

    return () => {
      const { class: attrsClass, style: attrsStyle, ...rootAttrs } = attrs;

      if (props.loading) {
        return h(
          'div',
          {
            ...rootAttrs,
            class: [rootClassName.value, attrsClass],
            style: attrsStyle,
            'aria-busy': 'true'
          },
          [renderLoadingState()]
        );
      }

      if (props.dataSource.length === 0) {
        return h(
          'div',
          {
            ...rootAttrs,
            class: [rootClassName.value, attrsClass],
            style: attrsStyle
          },
          [renderEmptyState()]
        );
      }

      return h(
        'div',
        {
          ...rootAttrs,
          class: [rootClassName.value, attrsClass],
          style: attrsStyle
        },
        [
          h(
            'ul',
            {
              class: 'l-list__items',
              role: 'list'
            },
            props.dataSource.map((item, index) => {
              const isLastItem = index === props.dataSource.length - 1;

              return h(
                'li',
                {
                  key: index,
                  class: classNames(
                    'l-list__item',
                    props.split && !isLastItem && 'l-list__item--split'
                  )
                },
                slots.renderItem?.({ item, index } satisfies ListRenderItemContext) ?? renderItemFallback(item)
              );
            })
          )
        ]
      );
    };
  }
});

export const List = LList;
