import {
  computed,
  defineComponent,
  h,
  nextTick,
  ref,
  watch,
  type PropType
} from 'vue';
import { useLolitaConfig } from '../config/context';
import { classNames } from '../utils/classNames';
import {
  findFirstEnabledIndex,
  findLastEnabledIndex,
  moveRovingIndex,
  resolveRovingIndex
} from './rovingFocus';

export type MenuMode = 'vertical' | 'horizontal';
export type MenuItem = {
  key: string;
  label: string;
  disabled?: boolean;
};

export const LMenu = defineComponent({
  name: 'LMenu',
  inheritAttrs: false,
  props: {
    items: {
      type: Array as PropType<MenuItem[]>,
      default: () => []
    },
    selectedKeys: {
      type: Array as PropType<string[] | undefined>,
      default: undefined
    },
    defaultSelectedKeys: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    mode: {
      type: String as PropType<MenuMode>,
      default: 'vertical'
    }
  },
  emits: {
    'update:selectedKeys': (value: string[]) => value.every((item) => typeof item === 'string'),
    select: (value: string) => typeof value === 'string'
  },
  setup(props, { attrs, emit, expose }) {
    const config = useLolitaConfig();
    const isControlled = computed(() => props.selectedKeys !== undefined);
    const internalSelectedKeys = ref<string[]>([...props.defaultSelectedKeys]);
    const activeIndex = ref(-1);
    const itemRefs = ref<Array<HTMLButtonElement | null>>([]);

    const mergedSelectedKeys = computed<string[]>(() =>
      isControlled.value ? props.selectedKeys ?? [] : internalSelectedKeys.value
    );

    const selectedIndex = computed(() =>
      props.items.findIndex(
        (item) => mergedSelectedKeys.value.includes(item.key) && item.disabled !== true
      )
    );

    watch(
      [() => props.items, selectedIndex],
      ([nextItems, nextSelectedIndex]) => {
        activeIndex.value = resolveRovingIndex(
          nextItems,
          nextSelectedIndex,
          (item) => item.disabled === true
        );
      },
      { immediate: true }
    );

    const focusItemByIndex = (index: number): void => {
      nextTick(() => {
        itemRefs.value[index]?.focus();
      });
    };

    const selectItem = (key: string): void => {
      const targetItem = props.items.find((item) => item.key === key);
      if (!targetItem || targetItem.disabled) {
        return;
      }

      if (!isControlled.value) {
        internalSelectedKeys.value = [key];
      }

      emit('update:selectedKeys', [key]);
      emit('select', key);
      activeIndex.value = props.items.findIndex((item) => item.key === key);
    };

    const moveFocus = (direction: 1 | -1): void => {
      const nextIndex = moveRovingIndex(
        props.items,
        activeIndex.value,
        direction,
        (item) => item.disabled === true
      );

      if (nextIndex >= 0) {
        activeIndex.value = nextIndex;
        focusItemByIndex(nextIndex);
      }
    };

    const focusFirst = (): void => {
      const firstIndex = findFirstEnabledIndex(props.items, (item) => item.disabled === true);
      if (firstIndex >= 0) {
        activeIndex.value = firstIndex;
        focusItemByIndex(firstIndex);
      }
    };

    const focusLast = (): void => {
      const lastIndex = findLastEnabledIndex(props.items, (item) => item.disabled === true);
      if (lastIndex >= 0) {
        activeIndex.value = lastIndex;
        focusItemByIndex(lastIndex);
      }
    };

    expose({
      focusFirst,
      focusLast
    });

    const onItemKeydown = (event: KeyboardEvent, item: MenuItem): void => {
      const isVertical = props.mode === 'vertical';
      const previousKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
      const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';

      if (event.key === nextKey) {
        event.preventDefault();
        moveFocus(1);
        return;
      }

      if (event.key === previousKey) {
        event.preventDefault();
        moveFocus(-1);
        return;
      }

      if (event.key === 'Home') {
        event.preventDefault();
        focusFirst();
        return;
      }

      if (event.key === 'End') {
        event.preventDefault();
        focusLast();
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectItem(item.key);
      }
    };

    const rootClassName = computed(() =>
      classNames(
        'l-menu',
        `l-menu--${props.mode}`,
        `${config.value.prefixCls}-menu`
      )
    );

    return () => {
      const { class: attrsClass, style: attrsStyle, ...rootAttrs } = attrs;

      return h(
        'div',
        {
          ...rootAttrs,
          class: [rootClassName.value, attrsClass],
          style: attrsStyle,
          role: 'menu',
          'aria-orientation': props.mode
        },
        props.items.map((item, index) =>
          h(
            'button',
            {
              key: item.key,
              ref: ((element: Element | null) => {
                itemRefs.value[index] = element as HTMLButtonElement | null;
              }) as any,
              type: 'button',
              class: classNames(
                'l-menu__item',
                mergedSelectedKeys.value.includes(item.key) && 'l-menu__item--selected',
                item.disabled && 'l-menu__item--disabled'
              ),
              role: 'menuitem',
              disabled: item.disabled,
              tabIndex: activeIndex.value === index ? 0 : -1,
              'aria-disabled': item.disabled ? 'true' : undefined,
              onFocus: () => {
                activeIndex.value = index;
              },
              onClick: () => selectItem(item.key),
              onKeydown: (event: KeyboardEvent) => onItemKeydown(event, item)
            },
            item.label
          )
        )
      );
    };
  }
});

export const Menu = LMenu;
