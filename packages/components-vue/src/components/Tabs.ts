import {
  Comment,
  Fragment,
  computed,
  defineComponent,
  h,
  isVNode,
  nextTick,
  ref,
  watch,
  type PropType,
  type Slot,
  type VNode,
  type VNodeChild
} from 'vue';
import { useLolitaConfig } from '../config/context';
import { classNames } from '../utils/classNames';
import { createOverlayId } from './overlayState';
import {
  findFirstEnabledIndex,
  findLastEnabledIndex,
  moveRovingIndex,
  resolveRovingIndex
} from './rovingFocus';

export type TabsItem = {
  key: string;
  label: string;
  disabled?: boolean;
};

type TabsPaneDescriptor = {
  key: string;
  disabled: boolean;
  renderLabel: () => VNodeChild;
  renderContent: () => VNodeChild;
};

const flattenChildren = (nodes: VNode[]): VNode[] => {
  const result: VNode[] = [];

  nodes.forEach((node) => {
    if (!isVNode(node) || node.type === Comment) {
      return;
    }

    if (node.type === Fragment && Array.isArray(node.children)) {
      result.push(...flattenChildren(node.children as VNode[]));
      return;
    }

    result.push(node);
  });

  return result;
};

export const LTabPane = defineComponent({
  name: 'LTabPane',
  props: {
    tab: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    tabKey: {
      type: String,
      default: undefined
    }
  },
  setup(_, { slots }) {
    return () => slots.default?.();
  }
});

export const LTabs = defineComponent({
  name: 'LTabs',
  inheritAttrs: false,
  props: {
    activeKey: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    defaultActiveKey: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    items: {
      type: Array as PropType<TabsItem[]>,
      default: () => []
    },
    destroyInactiveTabPane: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    'update:activeKey': (value: string) => typeof value === 'string',
    change: (value: string) => typeof value === 'string'
  },
  setup(props, { attrs, slots, emit }) {
    const config = useLolitaConfig();
    const isControlled = computed(() => props.activeKey !== undefined);
    const internalActiveKey = ref(props.defaultActiveKey);
    const tabRefs = ref<Array<HTMLButtonElement | null>>([]);
    const didWarnMixedMode = ref(false);
    const tabsId = createOverlayId('l-tabs');

    const paneDescriptors = ref<TabsPaneDescriptor[]>([]);

    const resolvePaneDescriptors = (): TabsPaneDescriptor[] => {
      const slotNodes = slots.default ? flattenChildren(slots.default() as VNode[]) : [];
      const paneNodes = slotNodes.filter((node) => node.type === LTabPane);

      if (paneNodes.length > 0) {
        const panes: TabsPaneDescriptor[] = [];

        paneNodes.forEach((node) => {
          const propsRecord = (node.props ?? {}) as Record<string, unknown>;
          const childrenRecord =
            node.children && typeof node.children === 'object'
              ? (node.children as Record<string, Slot>)
              : {};
          const key = String(node.key ?? propsRecord.tabKey ?? '');

          if (!key) {
            return;
          }

          panes.push({
            key,
            disabled: propsRecord.disabled === true,
            renderLabel: () =>
              childrenRecord.tab?.() ?? String(propsRecord.tab ?? ''),
            renderContent: () => childrenRecord.default?.() ?? undefined
          });
        });

        return panes;
      }

      return props.items.map((item) => ({
        key: item.key,
        disabled: item.disabled === true,
        renderLabel: () => item.label,
        renderContent: () => slots[`pane-${item.key}`]?.() ?? null
      }));
    };

    const mergedActiveKey = computed<string | undefined>(() => {
      const preferredKey = isControlled.value ? props.activeKey : internalActiveKey.value;
      const preferredIndex = paneDescriptors.value.findIndex(
        (pane) => pane.key === preferredKey && !pane.disabled
      );

      if (preferredIndex >= 0) {
        return paneDescriptors.value[preferredIndex]?.key;
      }

      const fallbackIndex = findFirstEnabledIndex(
        paneDescriptors.value,
        (pane) => pane.disabled
      );

      return fallbackIndex >= 0 ? paneDescriptors.value[fallbackIndex]?.key : undefined;
    });

    const activeIndex = computed(() =>
      paneDescriptors.value.findIndex((pane) => pane.key === mergedActiveKey.value)
    );

    watch(
      [paneDescriptors, activeIndex],
      ([nextPanes, nextActiveIndex]) => {
        if (nextPanes.length === 0) {
          tabRefs.value = [];
          return;
        }

        const safeIndex = resolveRovingIndex(nextPanes, nextActiveIndex, (pane) => pane.disabled);
        if (safeIndex >= 0) {
          internalActiveKey.value = nextPanes[safeIndex]?.key;
        }
      },
      { immediate: true }
    );

    const rootClassName = computed(() =>
      classNames(
        'l-tabs',
        `${config.value.prefixCls}-tabs`
      )
    );

    const setActiveKey = (nextKey: string): void => {
      const targetPane = paneDescriptors.value.find((pane) => pane.key === nextKey);
      if (!targetPane || targetPane.disabled) {
        return;
      }

      if (!isControlled.value) {
        internalActiveKey.value = nextKey;
      }

      emit('update:activeKey', nextKey);
      emit('change', nextKey);
    };

    const focusTabByIndex = (index: number): void => {
      nextTick(() => {
        tabRefs.value[index]?.focus();
      });
    };

    const moveToIndex = (index: number): void => {
      const targetPane = paneDescriptors.value[index];
      if (!targetPane || targetPane.disabled) {
        return;
      }

      setActiveKey(targetPane.key);
      focusTabByIndex(index);
    };

    const onTabKeydown = (event: KeyboardEvent, index: number): void => {
      if (paneDescriptors.value.length === 0) {
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        const nextIndex = moveRovingIndex(
          paneDescriptors.value,
          index,
          1,
          (pane) => pane.disabled
        );
        moveToIndex(nextIndex);
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        const nextIndex = moveRovingIndex(
          paneDescriptors.value,
          index,
          -1,
          (pane) => pane.disabled
        );
        moveToIndex(nextIndex);
        return;
      }

      if (event.key === 'Home') {
        event.preventDefault();
        moveToIndex(findFirstEnabledIndex(paneDescriptors.value, (pane) => pane.disabled));
        return;
      }

      if (event.key === 'End') {
        event.preventDefault();
        moveToIndex(findLastEnabledIndex(paneDescriptors.value, (pane) => pane.disabled));
      }
    };

    const renderPanels = () => {
      if (props.destroyInactiveTabPane) {
        const currentPane = paneDescriptors.value[activeIndex.value];
        if (!currentPane) {
          return null;
        }

        return h(
          'div',
          {
            id: `${tabsId}-panel-${currentPane.key}`,
            class: 'l-tabs__panel',
            role: 'tabpanel',
            'aria-labelledby': `${tabsId}-tab-${currentPane.key}`
          },
          currentPane.renderContent() ?? undefined
        );
      }

      return paneDescriptors.value.map((pane) =>
        h(
          'div',
          {
            key: pane.key,
            id: `${tabsId}-panel-${pane.key}`,
            class: classNames(
              'l-tabs__panel',
              pane.key === mergedActiveKey.value && 'l-tabs__panel--active'
            ),
            role: 'tabpanel',
            hidden: pane.key !== mergedActiveKey.value,
            'aria-labelledby': `${tabsId}-tab-${pane.key}`
          },
          pane.renderContent() ?? undefined
        )
      );
    };

    return () => {
      const { class: attrsClass, style: attrsStyle, ...rootAttrs } = attrs;
      paneDescriptors.value = resolvePaneDescriptors();
      if (
        props.items.length > 0 &&
        slots.default &&
        paneDescriptors.value.length > 0 &&
        !didWarnMixedMode.value
      ) {
        console.warn(
          '[LTabs] 请勿在同一个实例里同时传入 items 和 LTabPane，当前已按 LTabPane 渲染。'
        );
        didWarnMixedMode.value = true;
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
            'div',
            {
              class: 'l-tabs__nav',
              role: 'tablist',
              'aria-orientation': 'horizontal'
            },
            paneDescriptors.value.map((pane, index) =>
              h(
                'button',
                {
                  key: pane.key,
                  ref: ((element: Element | null) => {
                    tabRefs.value[index] = element as HTMLButtonElement | null;
                  }) as any,
                  id: `${tabsId}-tab-${pane.key}`,
                  type: 'button',
                  class: classNames(
                    'l-tabs__tab',
                    pane.key === mergedActiveKey.value && 'l-tabs__tab--active',
                    pane.disabled && 'l-tabs__tab--disabled'
                  ),
                  role: 'tab',
                  disabled: pane.disabled,
                  tabIndex: pane.key === mergedActiveKey.value ? 0 : -1,
                  'aria-selected': pane.key === mergedActiveKey.value,
                  'aria-controls': `${tabsId}-panel-${pane.key}`,
                  onClick: () => setActiveKey(pane.key),
                  onKeydown: (event: KeyboardEvent) => onTabKeydown(event, index)
                },
                pane.renderLabel() ?? ''
              )
            )
          ),
          h(
            'div',
            {
              class: 'l-tabs__content'
            },
            renderPanels() ?? undefined
          )
        ]
      );
    };
  }
});

export const Tabs = LTabs;
export const TabPane = LTabPane;
