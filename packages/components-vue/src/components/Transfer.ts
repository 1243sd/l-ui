import { computed, defineComponent, h, ref, type PropType } from 'vue';
import { classNames } from '../utils/classNames';

export type TransferItem = {
  key: string;
  title: string;
  disabled?: boolean;
};

export const LTransfer = defineComponent({
  name: 'LTransfer',
  props: {
    dataSource: {
      type: Array as PropType<TransferItem[]>,
      required: true
    },
    targetKeys: {
      type: Array as PropType<string[] | undefined>,
      default: undefined
    },
    defaultTargetKeys: {
      type: Array as PropType<string[]>,
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
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    'update:targetKeys': (keys: string[]) => Array.isArray(keys),
    'update:selectedKeys': (keys: string[]) => Array.isArray(keys),
    change: (keys: string[]) => Array.isArray(keys)
  },
  setup(props, { attrs, emit }) {
    const targetControlled = computed(() => props.targetKeys !== undefined);
    const selectedControlled = computed(() => props.selectedKeys !== undefined);
    const internalTargetKeys = ref<string[]>(props.defaultTargetKeys);
    const internalSelectedKeys = ref<string[]>(props.defaultSelectedKeys);

    const mergedTargetKeys = computed<string[]>(() =>
      targetControlled.value ? props.targetKeys ?? [] : internalTargetKeys.value
    );
    const mergedSelectedKeys = computed<string[]>(() =>
      selectedControlled.value ? props.selectedKeys ?? [] : internalSelectedKeys.value
    );
    const targetKeySet = computed(() => new Set(mergedTargetKeys.value));
    const sourceItems = computed(() =>
      props.dataSource.filter((item) => !targetKeySet.value.has(item.key))
    );
    const targetItems = computed(() =>
      props.dataSource.filter((item) => targetKeySet.value.has(item.key))
    );
    const selectedSourceKeys = computed(() =>
      mergedSelectedKeys.value.filter((key) => sourceItems.value.some((item) => item.key === key))
    );
    const selectedTargetKeys = computed(() =>
      mergedSelectedKeys.value.filter((key) => targetItems.value.some((item) => item.key === key))
    );

    const commitSelectedKeys = (nextKeys: string[]): void => {
      if (!selectedControlled.value) {
        internalSelectedKeys.value = nextKeys;
      }

      emit('update:selectedKeys', nextKeys);
    };

    const commitTargetKeys = (nextKeys: string[]): void => {
      if (!targetControlled.value) {
        internalTargetKeys.value = nextKeys;
      }

      emit('update:targetKeys', nextKeys);
      emit('change', nextKeys);
    };

    const toggleItem = (item: TransferItem): void => {
      if (props.disabled || item.disabled) {
        return;
      }

      const nextKeys = mergedSelectedKeys.value.includes(item.key)
        ? mergedSelectedKeys.value.filter((key) => key !== item.key)
        : [...mergedSelectedKeys.value, item.key];

      commitSelectedKeys(nextKeys);
    };

    const moveRight = (): void => {
      if (props.disabled || selectedSourceKeys.value.length === 0) {
        return;
      }

      const movingKeys = [...selectedSourceKeys.value];
      const nextTargetKeys = [...mergedTargetKeys.value];
      movingKeys.forEach((key) => {
        if (!nextTargetKeys.includes(key)) {
          nextTargetKeys.push(key);
        }
      });

      commitTargetKeys(nextTargetKeys);
      commitSelectedKeys(mergedSelectedKeys.value.filter((key) => !movingKeys.includes(key)));
    };

    const moveLeft = (): void => {
      if (props.disabled || selectedTargetKeys.value.length === 0) {
        return;
      }

      const movingKeys = [...selectedTargetKeys.value];
      const nextTargetKeys = mergedTargetKeys.value.filter(
        (key) => !movingKeys.includes(key)
      );

      commitTargetKeys(nextTargetKeys);
      commitSelectedKeys(mergedSelectedKeys.value.filter((key) => !movingKeys.includes(key)));
    };

    const renderPane = (title: string, items: TransferItem[], pane: 'source' | 'target') =>
      h('div', { class: 'l-transfer-pane', 'data-transfer-pane': pane }, [
        h('div', { class: 'l-transfer-pane__title' }, title),
        items.length > 0
          ? h(
              'ul',
              {
                class: 'l-transfer-pane__list'
              },
              items.map((item) =>
                h(
                  'li',
                  {
                    key: item.key
                  },
                  [
                    h(
                      'button',
                      {
                        type: 'button',
                        class: classNames(
                          'l-transfer-item',
                          mergedSelectedKeys.value.includes(item.key) &&
                            'l-transfer-item--selected',
                          item.disabled && 'l-transfer-item--disabled'
                        ),
                        'data-transfer-item': item.key,
                        disabled: props.disabled || item.disabled,
                        onClick: () => toggleItem(item)
                      },
                      item.title
                    )
                  ]
                )
              )
            )
          : h('div', { class: 'l-transfer-pane__empty' }, 'No items')
      ]);

    return () =>
      h(
        'div',
        {
          ...attrs,
          class: ['l-transfer', props.disabled && 'l-transfer--disabled', attrs.class],
          style: attrs.style
        },
        [
          renderPane('Source', sourceItems.value, 'source'),
          h('div', { class: 'l-transfer__actions' }, [
            h(
              'button',
              {
                type: 'button',
                class: ['l-transfer__action', 'l-btn'],
                'data-transfer-move': 'right',
                disabled: props.disabled || selectedSourceKeys.value.length === 0,
                onClick: moveRight
              },
              '>'
            ),
            h(
              'button',
              {
                type: 'button',
                class: ['l-transfer__action', 'l-btn'],
                'data-transfer-move': 'left',
                disabled: props.disabled || selectedTargetKeys.value.length === 0,
                onClick: moveLeft
              },
              '<'
            )
          ]),
          renderPane('Target', targetItems.value, 'target')
        ]
      );
  }
});

export const Transfer = LTransfer;
