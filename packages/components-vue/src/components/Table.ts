import { computed, defineComponent, getCurrentInstance, h, ref, watch, type PropType } from 'vue';
import { useLolitaConfig } from '../config/context';
import { classNames } from '../utils/classNames';
import { LPagination } from './Pagination';

export type TableRowKey<T extends Record<string, unknown> = Record<string, unknown>> =
  | string
  | ((record: T, index: number) => string | number);

export type TableColumn<T extends Record<string, unknown> = Record<string, unknown>> = {
  key: string;
  title: string;
  dataIndex?: keyof T | string;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
  sortable?: boolean;
};

export type TablePaginationConfig = {
  current?: number;
  defaultCurrent?: number;
  pageSize?: number;
  total?: number;
  disabled?: boolean;
};

export type TableSortOrder = 'ascend' | 'descend';

export type TableSortState = {
  columnKey: string;
  order: TableSortOrder;
};

export type TableRowSelection<T extends Record<string, unknown> = Record<string, unknown>> = {
  selectedRowKeys?: Array<string | number>;
  defaultSelectedRowKeys?: Array<string | number>;
  preserveSelectedRowKeys?: boolean;
  getDisabled?: (record: T, index: number) => boolean;
};

const toPositiveInteger = (value: number | undefined, fallback: number): number => {
  const normalized = Number.isFinite(value) ? Math.trunc(Number(value)) : fallback;
  return normalized > 0 ? normalized : fallback;
};

const resolveCellValue = (
  record: Record<string, unknown>,
  dataIndex: string | undefined
): unknown => {
  if (!dataIndex) {
    return '';
  }

  return record[dataIndex];
};

const formatCellText = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
};

const resolveRowKey = (
  rowKey: TableRowKey | undefined,
  record: Record<string, unknown>,
  index: number
): string | number => {
  if (typeof rowKey === 'function') {
    const value = rowKey(record, index);
    return typeof value === 'string' || typeof value === 'number' ? value : index;
  }

  if (typeof rowKey === 'string') {
    const value = record[rowKey];
    return typeof value === 'string' || typeof value === 'number' ? value : index;
  }

  return index;
};

export const LTable = defineComponent({
  name: 'LTable',
  inheritAttrs: false,
  emits: {
    'update:sortState': (value: TableSortState | undefined) =>
      value === undefined ||
      (typeof value.columnKey === 'string' &&
        (value.order === 'ascend' || value.order === 'descend')),
    sortChange: (value: TableSortState | undefined) =>
      value === undefined ||
      (typeof value.columnKey === 'string' &&
        (value.order === 'ascend' || value.order === 'descend')),
    'update:selectedRowKeys': (value: Array<string | number>) =>
      Array.isArray(value) && value.every((item) => typeof item === 'string' || typeof item === 'number'),
    selectionChange: (value: Array<string | number>) =>
      Array.isArray(value) && value.every((item) => typeof item === 'string' || typeof item === 'number')
  },
  props: {
    columns: {
      type: Array as PropType<TableColumn[]>,
      default: () => []
    },
    dataSource: {
      type: Array as PropType<Record<string, unknown>[]>,
      default: () => []
    },
    rowKey: {
      type: [String, Function] as PropType<TableRowKey | undefined>,
      default: undefined
    },
    loading: {
      type: Boolean,
      default: false
    },
    emptyText: {
      type: String,
      default: '暂无数据'
    },
    pagination: {
      type: [Boolean, Object] as PropType<false | TablePaginationConfig>,
      default: false
    },
    sortState: {
      type: Object as PropType<TableSortState | undefined>,
      default: undefined
    },
    defaultSortState: {
      type: Object as PropType<TableSortState | undefined>,
      default: undefined
    },
    rowSelection: {
      type: Object as PropType<TableRowSelection | undefined>,
      default: undefined
    }
  },
  setup(props, { attrs, slots, emit }) {
    const config = useLolitaConfig();
    const instance = getCurrentInstance();
    const internalCurrent = ref(1);
    const internalSortState = ref<TableSortState | undefined>(props.defaultSortState);
    const internalSelectedRowKeys = ref<Array<string | number>>(
      props.rowSelection?.defaultSelectedRowKeys ?? props.rowSelection?.selectedRowKeys ?? []
    );

    const vnodePropNames = computed(() => Object.keys(instance?.vnode.props ?? {}));
    const isSortControlled = computed(() =>
      vnodePropNames.value.includes('sortState') || vnodePropNames.value.includes('sort-state')
    );
    const rowSelectionConfig = computed(() => props.rowSelection);
    const isSelectionControlled = computed(() =>
      rowSelectionConfig.value
        ? Object.prototype.hasOwnProperty.call(rowSelectionConfig.value, 'selectedRowKeys')
        : false
    );

    const paginationConfig = computed<TablePaginationConfig | null>(() => {
      if (props.pagination === false) {
        return null;
      }

      return props.pagination ?? {};
    });

    const mergedPageSize = computed(() =>
      toPositiveInteger(paginationConfig.value?.pageSize, 20)
    );
    const mergedTotal = computed(() =>
      Math.max(0, Math.trunc(paginationConfig.value?.total ?? props.dataSource.length))
    );
    const totalPages = computed(() =>
      Math.max(1, Math.ceil(mergedTotal.value / mergedPageSize.value))
    );
    const mergedCurrent = computed(() =>
      Math.min(Math.max(toPositiveInteger(internalCurrent.value, 1), 1), totalPages.value)
    );
    const mergedSortState = computed<TableSortState | undefined>(() =>
      isSortControlled.value ? props.sortState : internalSortState.value
    );
    const mergedSelectedRowKeys = computed<Array<string | number>>(() =>
      isSelectionControlled.value
        ? rowSelectionConfig.value?.selectedRowKeys ?? []
        : internalSelectedRowKeys.value
    );

    watch(
      paginationConfig,
      (nextConfig) => {
        if (!nextConfig) {
          internalCurrent.value = 1;
          return;
        }

        const preferred =
          nextConfig.current ?? nextConfig.defaultCurrent ?? internalCurrent.value ?? 1;
        internalCurrent.value = Math.min(
          Math.max(toPositiveInteger(preferred, 1), 1),
          totalPages.value
        );
      },
      { immediate: true }
    );

    watch(
      () => [props.dataSource.length, paginationConfig.value?.current, paginationConfig.value?.pageSize, paginationConfig.value?.total],
      () => {
        internalCurrent.value = Math.min(
          Math.max(internalCurrent.value, 1),
          totalPages.value
        );
      }
    );

    watch(
      () => props.defaultSortState,
      (nextValue) => {
        if (!isSortControlled.value) {
          internalSortState.value = nextValue;
        }
      }
    );

    watch(
      () => [
        rowSelectionConfig.value?.defaultSelectedRowKeys,
        rowSelectionConfig.value?.selectedRowKeys
      ],
      () => {
        if (!isSelectionControlled.value) {
          internalSelectedRowKeys.value =
            rowSelectionConfig.value?.defaultSelectedRowKeys ??
            rowSelectionConfig.value?.selectedRowKeys ??
            [];
        }
      }
    );

    const slicedDataSource = computed(() => {
      if (!paginationConfig.value) {
        return props.dataSource;
      }

      const start = (mergedCurrent.value - 1) * mergedPageSize.value;
      return props.dataSource.slice(start, start + mergedPageSize.value);
    });

    const selectionColumnEnabled = computed(() => !!rowSelectionConfig.value);
    const isRowDisabled = (
      record: Record<string, unknown>,
      index: number
    ): boolean => Boolean(rowSelectionConfig.value?.getDisabled?.(record, index));
    const visibleSelectableRowKeys = computed(() =>
      slicedDataSource.value
        .map((record, index) => {
          const globalIndex = paginationConfig.value
            ? (mergedCurrent.value - 1) * mergedPageSize.value + index
            : index;
          const rowKey = resolveRowKey(props.rowKey, record, globalIndex);
          return {
            rowKey,
            disabled: isRowDisabled(record, globalIndex)
          };
        })
        .filter((item) => !item.disabled)
        .map((item) => item.rowKey)
    );
    const allVisibleRowsSelected = computed(
      () =>
        visibleSelectableRowKeys.value.length > 0 &&
        visibleSelectableRowKeys.value.every((key) => mergedSelectedRowKeys.value.includes(key))
    );

    const emitSelectedRowKeys = (nextKeys: Array<string | number>): void => {
      if (!isSelectionControlled.value) {
        internalSelectedRowKeys.value = nextKeys;
      }

      emit('update:selectedRowKeys', nextKeys);
      emit('selectionChange', nextKeys);
    };

    const clearSelection = (): void => {
      if (!selectionColumnEnabled.value || rowSelectionConfig.value?.preserveSelectedRowKeys) {
        return;
      }

      if (mergedSelectedRowKeys.value.length === 0) {
        return;
      }

      emitSelectedRowKeys([]);
    };

    const setCurrent = (nextCurrent: number): void => {
      const nextPage = Math.min(Math.max(toPositiveInteger(nextCurrent, 1), 1), totalPages.value);
      internalCurrent.value = nextPage;
      clearSelection();
    };

    const toggleSort = (column: TableColumn): void => {
      if (!column.sortable) {
        return;
      }

      const currentState = mergedSortState.value;
      let nextState: TableSortState | undefined;

      if (!currentState || currentState.columnKey !== column.key) {
        nextState = {
          columnKey: column.key,
          order: 'ascend'
        };
      } else if (currentState.order === 'ascend') {
        nextState = {
          columnKey: column.key,
          order: 'descend'
        };
      } else {
        nextState = undefined;
      }

      if (!isSortControlled.value) {
        internalSortState.value = nextState;
      }

      emit('update:sortState', nextState);
      emit('sortChange', nextState);
    };

    const toggleSelectAllVisible = (checked: boolean): void => {
      const nextKeys = new Set(mergedSelectedRowKeys.value);

      if (checked) {
        visibleSelectableRowKeys.value.forEach((key) => nextKeys.add(key));
      } else {
        visibleSelectableRowKeys.value.forEach((key) => nextKeys.delete(key));
      }

      emitSelectedRowKeys(Array.from(nextKeys));
    };

    const toggleRowSelection = (
      rowKey: string | number,
      checked: boolean
    ): void => {
      const nextKeys = new Set(mergedSelectedRowKeys.value);

      if (checked) {
        nextKeys.add(rowKey);
      } else {
        nextKeys.delete(rowKey);
      }

      emitSelectedRowKeys(Array.from(nextKeys));
    };

    const paginationNode = computed(() => {
      if (!paginationConfig.value) {
        return null;
      }

      return h(
        'div',
        {
          class: 'l-table__pagination'
        },
        [
          h(LPagination, {
            current: mergedCurrent.value,
            pageSize: mergedPageSize.value,
            total: mergedTotal.value,
            disabled: paginationConfig.value.disabled,
            'onUpdate:current': setCurrent,
            onChange: setCurrent
          })
        ]
      );
    });

    return () => {
      const { class: attrsClass, style: attrsStyle, ...rootAttrs } = attrs;
      const hasBodyRows = slicedDataSource.value.length > 0;
      const showLoading = props.loading;
      const showEmpty = !showLoading && !hasBodyRows;

      return h(
        'div',
        {
          ...rootAttrs,
          class: [classNames('l-table', `${config.value.prefixCls}-table`), attrsClass],
          style: attrsStyle,
          'aria-busy': showLoading ? 'true' : undefined
        },
        [
          h(
            'table',
            {
              class: 'l-table__native'
            },
            [
              h(
                'thead',
                {},
                h('tr', {}, [
                  selectionColumnEnabled.value
                    ? h(
                        'th',
                        {
                          key: '__selection',
                          scope: 'col',
                          class: classNames(
                            'l-table__head-cell',
                            'l-table__head-cell--selection'
                          )
                        },
                        h('input', {
                          type: 'checkbox',
                          checked: allVisibleRowsSelected.value,
                          disabled: visibleSelectableRowKeys.value.length === 0,
                          'data-testid': 'l-table-select-all',
                          'aria-label': 'Select visible rows',
                          onChange: (event: Event) =>
                            toggleSelectAllVisible((event.target as HTMLInputElement).checked)
                        })
                      )
                    : null,
                  ...props.columns.map((column) =>
                    h(
                      'th',
                      {
                        key: column.key,
                        scope: 'col',
                        class: classNames(
                          'l-table__head-cell',
                          column.sortable && 'l-table__head-cell--sortable'
                        ),
                        style: {
                          textAlign: column.align ?? 'left',
                          width: column.width !== undefined ? String(column.width) : undefined
                        }
                      },
                      column.sortable
                        ? h(
                            'button',
                            {
                              type: 'button',
                              class: classNames(
                                'l-table__sort-trigger',
                                mergedSortState.value?.columnKey === column.key &&
                                  `l-table__sort-trigger--${mergedSortState.value.order}`
                              ),
                              'data-column-key': column.key,
                              onClick: () => toggleSort(column)
                            },
                            [
                              h('span', { class: 'l-table__sort-label' }, column.title),
                              h(
                                'span',
                                {
                                  class: 'l-table__sort-indicator',
                                  'aria-hidden': 'true'
                                },
                                mergedSortState.value?.columnKey === column.key
                                  ? mergedSortState.value.order === 'ascend'
                                    ? '↑'
                                    : '↓'
                                  : '↕'
                              )
                            ]
                          )
                        : column.title
                    )
                  )
                ])
              ),
              h(
                'tbody',
                {},
                showLoading
                  ? h('tr', {}, [
                      h(
                        'td',
                        {
                          colspan: Math.max(
                            props.columns.length + (selectionColumnEnabled.value ? 1 : 0),
                            1
                          ),
                          class: 'l-table__state-cell'
                        },
                        '加载中...'
                      )
                    ])
                  : showEmpty
                    ? h('tr', {}, [
                        h(
                        'td',
                        {
                          colspan: Math.max(
                            props.columns.length + (selectionColumnEnabled.value ? 1 : 0),
                            1
                          ),
                          class: 'l-table__state-cell'
                        },
                        slots.empty?.() ?? props.emptyText
                      )
                      ])
                    : slicedDataSource.value.map((record, index) => {
                        const globalIndex = paginationConfig.value
                          ? (mergedCurrent.value - 1) * mergedPageSize.value + index
                          : index;
                        const rowKey = resolveRowKey(props.rowKey, record, globalIndex);
                        const rowDisabled = isRowDisabled(record, globalIndex);

                        return h(
                          'tr',
                          {
                            key: rowKey,
                            class: 'l-table__row',
                            'data-row-key': String(rowKey)
                          },
                          [
                            selectionColumnEnabled.value
                              ? h(
                                  'td',
                                  {
                                    key: '__selection',
                                    class: 'l-table__body-cell l-table__selection-cell'
                                  },
                                  h('input', {
                                    type: 'checkbox',
                                    checked: mergedSelectedRowKeys.value.includes(rowKey),
                                    disabled: rowDisabled,
                                    'data-testid': `l-table-row-select-${String(rowKey)}`,
                                    onChange: (event: Event) =>
                                      toggleRowSelection(
                                        rowKey,
                                        (event.target as HTMLInputElement).checked
                                      )
                                  })
                                )
                              : null,
                            ...props.columns.map((column) => {
                              const value = resolveCellValue(record, column.dataIndex as string | undefined);
                              const slotContent = slots.bodyCell?.({
                                column,
                                record,
                                index: globalIndex,
                                value
                              });

                              return h(
                                'td',
                                {
                                  key: column.key,
                                  class: 'l-table__body-cell',
                                  style: {
                                    textAlign: column.align ?? 'left'
                                  }
                                },
                                slotContent ?? formatCellText(value)
                              );
                            })
                          ]
                        );
                      })
              )
            ]
          ),
          paginationNode.value
        ]
      );
    };
  }
});

export const Table = LTable;
