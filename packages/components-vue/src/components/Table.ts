import { computed, defineComponent, h, ref, watch, type PropType } from 'vue';
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
};

export type TablePaginationConfig = {
  current?: number;
  defaultCurrent?: number;
  pageSize?: number;
  total?: number;
  disabled?: boolean;
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
    }
  },
  setup(props, { attrs, slots }) {
    const config = useLolitaConfig();
    const internalCurrent = ref(1);

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

    const slicedDataSource = computed(() => {
      if (!paginationConfig.value) {
        return props.dataSource;
      }

      const start = (mergedCurrent.value - 1) * mergedPageSize.value;
      return props.dataSource.slice(start, start + mergedPageSize.value);
    });

    const setCurrent = (nextCurrent: number): void => {
      const nextPage = Math.min(Math.max(toPositiveInteger(nextCurrent, 1), 1), totalPages.value);
      internalCurrent.value = nextPage;
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
                h(
                  'tr',
                  {},
                  props.columns.map((column) =>
                    h(
                      'th',
                      {
                        key: column.key,
                        scope: 'col',
                        class: 'l-table__head-cell',
                        style: {
                          textAlign: column.align ?? 'left',
                          width: column.width !== undefined ? String(column.width) : undefined
                        }
                      },
                      column.title
                    )
                  )
                )
              ),
              h(
                'tbody',
                {},
                showLoading
                  ? h('tr', {}, [
                      h(
                        'td',
                        {
                          colspan: Math.max(props.columns.length, 1),
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
                          colspan: Math.max(props.columns.length, 1),
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

                        return h(
                          'tr',
                          {
                            key: rowKey,
                            class: 'l-table__row',
                            'data-row-key': String(rowKey)
                          },
                          props.columns.map((column) => {
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
