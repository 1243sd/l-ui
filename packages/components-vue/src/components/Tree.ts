import { computed, defineComponent, h, ref, watch, type PropType } from 'vue';
import { classNames } from '../utils/classNames';

export type TreeNode = {
  key: string;
  title: string;
  disabled?: boolean;
  children?: TreeNode[];
};

type VisibleTreeNode = {
  key: string;
  title: string;
  level: number;
  parentKey?: string;
  disabled: boolean;
  hasChildren: boolean;
  childrenKeys: string[];
};

const flattenVisibleNodes = (
  nodes: TreeNode[],
  expandedKeys: Set<string>,
  level = 0,
  parentKey?: string
): VisibleTreeNode[] => {
  const result: VisibleTreeNode[] = [];

  nodes.forEach((node) => {
    const children = node.children ?? [];
    const visibleNode: VisibleTreeNode = {
      key: node.key,
      title: node.title,
      level,
      parentKey,
      disabled: node.disabled === true,
      hasChildren: children.length > 0,
      childrenKeys: children.map((item) => item.key)
    };

    result.push(visibleNode);

    if (visibleNode.hasChildren && expandedKeys.has(node.key)) {
      result.push(...flattenVisibleNodes(children, expandedKeys, level + 1, node.key));
    }
  });

  return result;
};

const findFirstEnabledKey = (nodes: VisibleTreeNode[]): string | undefined =>
  nodes.find((node) => !node.disabled)?.key;

const findNextEnabledIndex = (
  nodes: VisibleTreeNode[],
  startIndex: number,
  direction: 1 | -1
): number => {
  let cursor = startIndex;
  while (cursor >= 0 && cursor < nodes.length) {
    if (!nodes[cursor]?.disabled) {
      return cursor;
    }
    cursor += direction;
  }

  return -1;
};

export const LTree = defineComponent({
  name: 'LTree',
  props: {
    treeData: {
      type: Array as PropType<TreeNode[]>,
      required: true
    },
    selectedKeys: {
      type: Array as PropType<string[] | undefined>,
      default: undefined
    },
    defaultSelectedKeys: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    expandedKeys: {
      type: Array as PropType<string[] | undefined>,
      default: undefined
    },
    defaultExpandedKeys: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    'update:selectedKeys': (keys: string[]) => Array.isArray(keys),
    'update:expandedKeys': (keys: string[]) => Array.isArray(keys),
    select: (keys: string[], node: VisibleTreeNode | undefined) => Array.isArray(keys) && !!node,
    expand: (keys: string[], node: VisibleTreeNode | undefined) => Array.isArray(keys) && !!node
  },
  setup(props, { attrs, emit }) {
    const selectedControlled = computed(() => props.selectedKeys !== undefined);
    const expandedControlled = computed(() => props.expandedKeys !== undefined);
    const internalSelectedKeys = ref<string[]>(props.defaultSelectedKeys);
    const internalExpandedKeys = ref<string[]>(props.defaultExpandedKeys);
    const activeKey = ref<string | undefined>(undefined);

    const mergedSelectedKeys = computed<string[]>(() =>
      selectedControlled.value ? props.selectedKeys ?? [] : internalSelectedKeys.value
    );
    const mergedExpandedKeys = computed<string[]>(() =>
      expandedControlled.value ? props.expandedKeys ?? [] : internalExpandedKeys.value
    );
    const expandedKeySet = computed(() => new Set(mergedExpandedKeys.value));
    const visibleNodes = computed(() =>
      flattenVisibleNodes(props.treeData, expandedKeySet.value)
    );
    const visibleNodeMap = computed(() => {
      const map = new Map<string, VisibleTreeNode>();
      visibleNodes.value.forEach((node) => map.set(node.key, node));
      return map;
    });

    watch(
      [visibleNodes, mergedSelectedKeys],
      ([nodes, selectedKeys]) => {
        if (activeKey.value && nodes.some((node) => node.key === activeKey.value)) {
          return;
        }

        activeKey.value = selectedKeys[0];
      },
      { immediate: true }
    );

    const commitSelectedKeys = (nextKeys: string[], node: VisibleTreeNode): void => {
      if (!selectedControlled.value) {
        internalSelectedKeys.value = nextKeys;
      }

      emit('update:selectedKeys', nextKeys);
      emit('select', nextKeys, node);
    };

    const commitExpandedKeys = (nextKeys: string[], node: VisibleTreeNode): void => {
      if (!expandedControlled.value) {
        internalExpandedKeys.value = nextKeys;
      }

      emit('update:expandedKeys', nextKeys);
      emit('expand', nextKeys, node);
    };

    const toggleExpanded = (node: VisibleTreeNode): void => {
      if (props.disabled || node.disabled || !node.hasChildren) {
        return;
      }

      const nextKeys = expandedKeySet.value.has(node.key)
        ? mergedExpandedKeys.value.filter((key) => key !== node.key)
        : [...mergedExpandedKeys.value, node.key];

      activeKey.value = node.key;
      commitExpandedKeys(nextKeys, node);
    };

    const selectNode = (node: VisibleTreeNode): void => {
      if (props.disabled || node.disabled) {
        return;
      }

      activeKey.value = node.key;
      commitSelectedKeys([node.key], node);
    };

    const moveActive = (direction: 1 | -1): void => {
      const currentIndex = visibleNodes.value.findIndex((node) => node.key === activeKey.value);
      const startIndex = currentIndex < 0 ? (direction > 0 ? 0 : visibleNodes.value.length - 1) : currentIndex + direction;
      const nextIndex = findNextEnabledIndex(visibleNodes.value, startIndex, direction);
      if (nextIndex >= 0) {
        activeKey.value = visibleNodes.value[nextIndex]?.key;
      }
    };

    const onKeydown = (event: KeyboardEvent): void => {
      if (props.disabled || visibleNodes.value.length === 0) {
        return;
      }

      const current = activeKey.value ? visibleNodeMap.value.get(activeKey.value) : undefined;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        moveActive(1);
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveActive(-1);
        return;
      }

      if (!current) {
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (current.hasChildren && !expandedKeySet.value.has(current.key)) {
          toggleExpanded(current);
          return;
        }

        const firstChildKey = current.childrenKeys[0];
        if (firstChildKey) {
          activeKey.value = firstChildKey;
        }
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (current.hasChildren && expandedKeySet.value.has(current.key)) {
          toggleExpanded(current);
          return;
        }

        if (current.parentKey) {
          activeKey.value = current.parentKey;
        }
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectNode(current);
      }
    };

    return () =>
      h(
        'div',
        {
          ...attrs,
          class: ['l-tree', props.disabled && 'l-tree--disabled', attrs.class],
          style: attrs.style,
          tabIndex: props.disabled ? -1 : 0,
          role: 'tree',
          onKeydown
        },
        [
          h(
            'ul',
            {
              class: 'l-tree__list'
            },
            visibleNodes.value.map((node) =>
              h(
                'li',
                {
                  key: node.key,
                  class: 'l-tree__item'
                },
                [
                  h(
                    'div',
                    {
                      class: 'l-tree-row',
                      style: {
                        paddingLeft: `${node.level * 18}px`
                      }
                    },
                    [
                      node.hasChildren
                        ? h(
                            'button',
                            {
                              type: 'button',
                              class: 'l-tree-toggle',
                              'data-tree-toggle': node.key,
                              'aria-label': `${expandedKeySet.value.has(node.key) ? 'Collapse' : 'Expand'} ${node.title}`,
                              disabled: props.disabled || node.disabled,
                              onClick: () => toggleExpanded(node)
                            },
                            expandedKeySet.value.has(node.key) ? '▾' : '▸'
                          )
                        : h('span', { class: 'l-tree-row__spacer' }),
                      h(
                        'button',
                        {
                          type: 'button',
                          class: classNames(
                            'l-tree-node',
                            mergedSelectedKeys.value.includes(node.key) && 'l-tree-node--selected',
                            activeKey.value === node.key && 'l-tree-node--active',
                            node.disabled && 'l-tree-node--disabled'
                          ),
                          'data-tree-node': node.key,
                          role: 'treeitem',
                          'aria-level': node.level + 1,
                          'aria-expanded': node.hasChildren ? expandedKeySet.value.has(node.key) : undefined,
                          disabled: props.disabled || node.disabled,
                          onClick: () => selectNode(node)
                        },
                        node.title
                      )
                    ]
                  )
                ]
              )
            )
          )
        ]
      );
  }
});

export const Tree = LTree;
