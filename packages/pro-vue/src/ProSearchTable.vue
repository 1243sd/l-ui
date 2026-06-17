<script setup lang="ts">
import {
  LButton,
  LCascader,
  LDatePicker,
  LDateRangePicker,
  LForm,
  LFormItem,
  LInput,
  LPagination,
  LSelect,
  LTable,
  type TableSortState
} from '@lolita-ui/components-vue';
import {
  createRequestPipeline,
  isAbortError,
  mergePagination,
  normalizePagination,
  type PaginationState
} from '@lolita-ui/utils';
import { computed, onMounted, reactive, ref, useSlots, watch } from 'vue';
import { buildDefaultFormValues, serializeQueryValues } from './searchSchema';
import type {
  ProActionIcon,
  ProBulkAction,
  ProBulkActionContext,
  ProRowAction,
  ProRowKey,
  ProRowSelection,
  ProSearchTableLifecycle,
  ProSearchTableRequest,
  ProTableColumn,
  ProToolbarAction,
  SearchFieldSchema,
  SearchFieldSelectValue,
  SearchQueryValues
} from './types';

type TableRow = Record<string, unknown>;
type SearchForm = Record<string, unknown>;
type TableSelectionKey = string | number;
type QueryExecutionOptions = {
  clearSelectionOnSuccess?: boolean;
};

const ACTION_COLUMN_KEY = '__actions';
const SEARCH_VISIBLE_FIELD_COUNT = 4;

const PRO_ICON_MARKUP: Record<ProActionIcon, string> = {
  archive:
    '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="4" y="4" width="12" height="3.5" rx="1.5"/><path d="M5.5 8.5h9v6.75A1.75 1.75 0 0 1 12.75 17h-5.5A1.75 1.75 0 0 1 5.5 15.25V8.5Z"/><path d="M8 11h4"/></svg>',
  close:
    '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M6 6l8 8"/><path d="M14 6l-8 8"/></svg>',
  eye:
    '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M2.5 10s2.6-4.25 7.5-4.25S17.5 10 17.5 10s-2.6 4.25-7.5 4.25S2.5 10 2.5 10Z"/><circle cx="10" cy="10" r="2.15"/></svg>',
  filter:
    '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3.5 5.5h13"/><path d="M6.5 10h7"/><path d="M8.5 14.5h3"/></svg>',
  plus:
    '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 4.5v11"/><path d="M4.5 10h11"/></svg>',
  refresh:
    '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M16 9.75A6 6 0 1 1 9.7 4"/><path d="M12.75 4H16v3.25"/></svg>',
  reset:
    '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 6.25V3.75h2.5"/><path d="M4.2 4.2A7 7 0 1 1 3 10"/></svg>',
  search:
    '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8.75" cy="8.75" r="4.75"/><path d="M12.5 12.5 16 16"/></svg>',
  sparkles:
    '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m10 3 1.2 3.4L14.6 7.6l-3.4 1.2L10 12.2 8.8 8.8 5.4 7.6l3.4-1.2L10 3Z"/><path d="m15.1 12.7.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6.6-1.6Z"/><path d="m4.8 11.6.45 1.15 1.15.45-1.15.45-.45 1.15-.45-1.15-1.15-.45 1.15-.45.45-1.15Z"/></svg>'
};

const slots = useSlots();

const props = withDefaults(
  defineProps<{
    columns: ProTableColumn<TableRow>[];
    searchSchema?: SearchFieldSchema[];
    request: ProSearchTableRequest<TableRow, SearchForm>;
    rowActions?: ProRowAction<TableRow>[];
    rowKey?: ProRowKey<TableRow>;
    rowSelection?: ProRowSelection<TableRow>;
    bulkActions?: ProBulkAction<TableRow>[];
    toolbar?: ProToolbarAction[];
    lifecycle?: ProSearchTableLifecycle<TableRow, SearchForm>;
    autoQuery?: boolean;
    retries?: number;
    retryDelay?: number;
    initialPagination?: Partial<PaginationState>;
    paginationSync?: boolean;
  }>(),
  {
    searchSchema: () => [],
    rowActions: () => [],
    bulkActions: () => [],
    toolbar: () => [],
    lifecycle: () => ({}),
    autoQuery: true,
    retries: 0,
    retryDelay: 120,
    initialPagination: () => ({ current: 1, pageSize: 10, total: 0 }),
    paginationSync: true
  }
);

const emit = defineEmits<{
  'update:pagination': [PaginationState];
  'data-loaded': [{ data: TableRow[]; total: number }];
  'request-error': [unknown];
  'update:selectedRowKeys': [TableSelectionKey[]];
  'selectionChange': [TableSelectionKey[], TableRow[]];
}>();

const loading = ref(false);
const rows = ref<TableRow[]>([]);
const error = ref<unknown>(null);
const pagination = reactive<PaginationState>(normalizePagination(props.initialPagination));
const sortState = ref<TableSortState | undefined>(undefined);
const pendingRowActionKeys = reactive<Record<string, boolean>>({});
const pendingToolbarActionKeys = reactive<Record<string, boolean>>({});
const pendingBulkActionKeys = reactive<Record<string, boolean>>({});
const selectedRowSnapshots = reactive<Record<string, TableRow>>({});

const rowSelectionConfig = computed(() => props.rowSelection);
const selectionEnabled = computed(() => !!rowSelectionConfig.value);
const isSelectionControlled = computed(() =>
  rowSelectionConfig.value
    ? Object.prototype.hasOwnProperty.call(rowSelectionConfig.value, 'selectedRowKeys')
    : false
);
const shouldPreserveSelectedRowKeys = computed(
  () => rowSelectionConfig.value?.preserveSelectedRowKeys ?? false
);
const internalSelectedRowKeys = ref<TableSelectionKey[]>(
  props.rowSelection?.defaultSelectedRowKeys ?? props.rowSelection?.selectedRowKeys ?? []
);

const buildDefaultForm = (): SearchForm => buildDefaultFormValues(props.searchSchema);

const formValues = reactive<SearchForm>(buildDefaultForm());
const totalPages = computed(() => Math.max(1, Math.ceil(pagination.total / pagination.pageSize)));
const mergedSelectedRowKeys = computed<TableSelectionKey[]>(() =>
  isSelectionControlled.value
    ? rowSelectionConfig.value?.selectedRowKeys ?? []
    : internalSelectedRowKeys.value
);
const isSearchCollapsible = computed(
  () => props.searchSchema.length > SEARCH_VISIBLE_FIELD_COUNT
);
const collapsedSearchSchema = computed(() =>
  props.searchSchema.slice(SEARCH_VISIBLE_FIELD_COUNT)
);
const searchExpanded = ref(false);
const visibleSearchSchema = computed(() =>
  isSearchCollapsible.value && !searchExpanded.value
    ? props.searchSchema.slice(0, SEARCH_VISIBLE_FIELD_COUNT)
    : props.searchSchema
);
const hasRowActions = computed(
  () => props.rowActions.length > 0 || Boolean(slots['row-actions'])
);
const hasToolbarSlot = computed(() => Boolean(slots.toolbar));
const effectiveRowKey = computed<ProRowKey<TableRow>>(() => props.rowKey ?? 'id');
const skipSymbol = Symbol('skip-query');
const missingRowKeyWarning =
  '[ProSearchTable] rowKey is required when rows do not expose a primitive "id".';

const requestPipeline = createRequestPipeline<
  {
    pagination: { current: number; pageSize: number };
    formValues: SearchForm;
    queryValues: SearchQueryValues;
    sortState?: TableSortState;
  },
  { data: TableRow[]; total: number }
>({
  retry: {
    retries: props.retries,
    delayMs: props.retryDelay
  },
  query: async (payload, context) => {
    return props.request({
      pagination: payload.pagination,
      formValues: payload.formValues,
      queryValues: payload.queryValues,
      sortState: payload.sortState,
      signal: context.signal,
      attempt: context.attempt
    });
  },
  transform: async (result) => {
    if (!props.lifecycle.transform) {
      return result;
    }
    return props.lifecycle.transform(result);
  },
  afterQuery: async (result, payload) => {
    if (!props.lifecycle.afterQuery) {
      return;
    }
    await props.lifecycle.afterQuery(result, payload);
  }
});

const syncPagination = () => {
  if (props.paginationSync) {
    emit('update:pagination', { ...pagination });
  }
};

const applyRequestedPagination = (next: { current: number; pageSize: number }) => {
  const nextCurrent = Number.isFinite(next.current)
    ? Math.trunc(Number(next.current))
    : pagination.current;
  const nextPageSize = Number.isFinite(next.pageSize)
    ? Math.trunc(Number(next.pageSize))
    : pagination.pageSize;

  if (nextCurrent > 0) {
    pagination.current = nextCurrent;
  }

  if (nextPageSize > 0) {
    pagination.pageSize = nextPageSize;
  }
};

const resolveRowsForKeys = (keys: TableSelectionKey[]): TableRow[] =>
  keys
    .map((key) => selectedRowSnapshots[String(key)])
    .filter((row): row is TableRow => row !== undefined);

const hasMeaningfulSearchValue = (value: unknown): boolean => {
  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0 && value.some((item) => hasMeaningfulSearchValue(item));
  }

  return true;
};

const commitSelectedRowKeys = (nextKeys: TableSelectionKey[]): void => {
  if (!isSelectionControlled.value) {
    internalSelectedRowKeys.value = nextKeys;
  }

  const nextRows = resolveRowsForKeys(nextKeys);
  emit('update:selectedRowKeys', nextKeys);
  emit('selectionChange', nextKeys, nextRows);
};

const clearSelection = (): void => {
  if (mergedSelectedRowKeys.value.length === 0) {
    return;
  }

  commitSelectedRowKeys([]);
};

const isPrimitiveRowKey = (value: unknown): value is string | number =>
  typeof value === 'string' || typeof value === 'number';

const resolveRowKeyValue = (row: TableRow, index: number): string | number | null => {
  if (typeof props.rowKey === 'function') {
    const value = props.rowKey(row, index);
    return isPrimitiveRowKey(value) ? value : null;
  }

  if (typeof props.rowKey === 'string') {
    const value = row[props.rowKey];
    return isPrimitiveRowKey(value) ? value : null;
  }

  const id = row.id;
  return isPrimitiveRowKey(id) ? id : null;
};

const validateResolvedRows = (data: TableRow[]): TableRow[] | null => {
  for (let index = 0; index < data.length; index += 1) {
    const resolvedRowKey = resolveRowKeyValue(data[index], index);
    if (resolvedRowKey !== null) {
      continue;
    }

    if (props.rowKey) {
      console.warn('[ProSearchTable] rowKey must resolve to a primitive string or number.');
    } else {
      console.warn(missingRowKeyWarning);
    }
    return null;
  }

  return data;
};

const rowActionStateKey = (
  action: ProRowAction<TableRow>,
  row: TableRow,
  index: number
): string => `${action.key}:${String(resolveRowKeyValue(row, index) ?? index)}`;

const selectedRows = computed<TableRow[]>(() =>
  resolveRowsForKeys(mergedSelectedRowKeys.value)
);

const buildBulkActionContext = (): ProBulkActionContext<TableRow> => ({
  selectedRowKeys: [...mergedSelectedRowKeys.value],
  selectedRows: [...selectedRows.value],
  clearSelection,
  refresh: async () => {
    await runQuery();
  },
  sortState: sortState.value
});

const toolbarSlotContext = computed(() => ({
  loading: loading.value,
  refresh: runQuery,
  selectedRowKeys: mergedSelectedRowKeys.value,
  selectedRows: selectedRows.value,
  clearSelection,
  sortState: sortState.value
}));

const tableColumns = computed<ProTableColumn<TableRow>[]>(() => {
  if (!hasRowActions.value) {
    return props.columns;
  }

  return [
    ...props.columns,
    {
      key: ACTION_COLUMN_KEY,
      title: '操作',
      align: 'right'
    }
  ];
});

const effectiveRowSelection = computed(() => {
  if (!selectionEnabled.value) {
    return undefined;
  }

  return {
    selectedRowKeys: mergedSelectedRowKeys.value,
    preserveSelectedRowKeys: rowSelectionConfig.value?.preserveSelectedRowKeys,
    getDisabled: rowSelectionConfig.value?.getDisabled
  };
});

const runToolbarAction = async (action: ProToolbarAction): Promise<void> => {
  pendingToolbarActionKeys[action.key] = true;
  try {
    await Promise.resolve(action.onClick());
  } finally {
    pendingToolbarActionKeys[action.key] = false;
  }
};

const runRowAction = async (
  action: ProRowAction<TableRow>,
  row: TableRow,
  index: number
): Promise<void> => {
  const stateKey = rowActionStateKey(action, row, index);
  pendingRowActionKeys[stateKey] = true;

  try {
    await Promise.resolve(action.onClick(row, index));
    if (action.refreshOnSuccess !== false) {
      await runQuery();
    }
  } finally {
    pendingRowActionKeys[stateKey] = false;
  }
};

const runBulkAction = async (action: ProBulkAction<TableRow>): Promise<void> => {
  const context = buildBulkActionContext();
  pendingBulkActionKeys[action.key] = true;

  try {
    await Promise.resolve(action.onClick(context));

    if (action.refreshOnSuccess !== false) {
      await runQuery({
        clearSelectionOnSuccess: action.clearSelectionOnSuccess !== false
      });
      return;
    }

    if (action.clearSelectionOnSuccess !== false) {
      clearSelection();
    }
  } finally {
    pendingBulkActionKeys[action.key] = false;
  }
};

const runQuery = async (options: QueryExecutionOptions = {}): Promise<void> => {
  loading.value = true;
  error.value = null;
  const payload = {
    pagination: {
      current: pagination.current,
      pageSize: pagination.pageSize
    },
    formValues: { ...formValues },
    sortState: sortState.value
  };
  const { blocked, queryValues } = serializeQueryValues(props.searchSchema, payload.formValues);

  if (blocked) {
    loading.value = false;
    return;
  }

  try {
    const initialPayload = {
      ...payload,
      queryValues
    };
    const preparedPayload = props.lifecycle.beforeQuery
      ? await props.lifecycle.beforeQuery(initialPayload)
      : initialPayload;

    if (preparedPayload === false) {
      return;
    }

    applyRequestedPagination(preparedPayload.pagination);
    sortState.value = preparedPayload.sortState;

    const execution = requestPipeline.execute(preparedPayload);
    const result = await execution.promise;
    const validatedRows = validateResolvedRows(result.data);
    rows.value = validatedRows ?? [];
    Object.assign(
      pagination,
      mergePagination(pagination, { total: validatedRows ? result.total : 0 })
    );

    if (
      validatedRows &&
      options.clearSelectionOnSuccess &&
      selectionEnabled.value &&
      !shouldPreserveSelectedRowKeys.value
    ) {
      clearSelection();
    }

    emit('data-loaded', { data: result.data, total: result.total });
    syncPagination();
  } catch (err) {
    if (err === skipSymbol || isAbortError(err)) {
      return;
    }
    error.value = err;
    emit('request-error', err);
  } finally {
    loading.value = false;
  }
};

const onSearch = async () => {
  Object.assign(pagination, mergePagination(pagination, { current: 1 }));
  await runQuery({ clearSelectionOnSuccess: true });
};

const onReset = async () => {
  Object.keys(formValues).forEach((key) => {
    delete formValues[key];
  });
  Object.assign(formValues, buildDefaultForm());
  Object.assign(pagination, mergePagination(pagination, { current: 1 }));
  await runQuery({ clearSelectionOnSuccess: true });
};

const onRetry = async () => {
  await runQuery();
};

const onPageChange = async (nextCurrent: number) => {
  if (loading.value || nextCurrent === pagination.current) {
    return;
  }

  Object.assign(pagination, mergePagination(pagination, { current: nextCurrent }));
  await runQuery({ clearSelectionOnSuccess: true });
};

const onSortChange = async (nextSortState: TableSortState | undefined) => {
  if (loading.value) {
    return;
  }

  sortState.value = nextSortState;
  await runQuery({ clearSelectionOnSuccess: true });
};

const resolveFieldWidth = (width: SearchFieldSchema['width']): string | undefined => {
  if (typeof width === 'number') {
    return `${width}px`;
  }
  return width;
};

const isSelectFieldValue = (value: unknown): value is SearchFieldSelectValue =>
  typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';

const isDateRangeFieldValue = (value: unknown): value is [string, string] =>
  Array.isArray(value) &&
  value.length === 2 &&
  value.every((item) => typeof item === 'string');

const resolveSelectFieldValue = (
  fieldName: string
): SearchFieldSelectValue | undefined => {
  const value = formValues[fieldName];
  return isSelectFieldValue(value) ? value : undefined;
};

const resolveDateRangeFieldValue = (fieldName: string): [string, string] | undefined => {
  const value = formValues[fieldName];
  return isDateRangeFieldValue(value) ? value : undefined;
};

const resolveCascaderFieldValue = (fieldName: string): string[] | undefined => {
  const value = formValues[fieldName];
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
    ? value
    : undefined;
};

const visibleToolbarActions = computed(() =>
  props.toolbar.filter((item) => item.visible !== false)
);

const visibleBulkActions = computed(() => {
  const context = buildBulkActionContext();
  return props.bulkActions.filter((action) => action.visible?.(context) ?? true);
});

const hiddenSearchFieldCount = computed(() =>
  Math.max(props.searchSchema.length - SEARCH_VISIBLE_FIELD_COUNT, 0)
);

const hiddenActiveFilterCount = computed(() =>
  collapsedSearchSchema.value.reduce((count, field) => {
    return count + (hasMeaningfulSearchValue(formValues[field.name]) ? 1 : 0);
  }, 0)
);

const showSelectionHint = computed(
  () => selectionEnabled.value && (visibleBulkActions.value.length > 0 || mergedSelectedRowKeys.value.length > 0)
);

const searchSummaryLabel = computed(() => {
  if (props.searchSchema.length === 0) {
    return '未配置筛选';
  }

  if (isSearchCollapsible.value && !searchExpanded.value) {
    return `${visibleSearchSchema.value.length}/${props.searchSchema.length} 常用`;
  }

  return `${props.searchSchema.length} 项筛选`;
});

const searchDetailLabel = computed(() => {
  if (props.searchSchema.length === 0) {
    return '支持自定义';
  }

  if (hiddenActiveFilterCount.value > 0) {
    return '高级已生效';
  }

  if (searchExpanded.value && hiddenSearchFieldCount.value > 0) {
    return '高级已展开';
  }

  if (hiddenSearchFieldCount.value > 0) {
    return '高级待展开';
  }

  return '支持回车快速查询';
});

const searchDetailBadgeLabel = computed(() => {
  if (hiddenActiveFilterCount.value > 0) {
    return String(hiddenActiveFilterCount.value);
  }

  if (!searchExpanded.value && hiddenSearchFieldCount.value > 0) {
    return `+${hiddenSearchFieldCount.value}`;
  }

  return '';
});

const searchToggleText = computed(() =>
  searchExpanded.value ? '收起' : '高级'
);

const searchToggleBadgeLabel = computed(() => {
  if (searchExpanded.value || hiddenSearchFieldCount.value === 0) {
    return '';
  }

  return hiddenActiveFilterCount.value > 0
    ? String(hiddenActiveFilterCount.value)
    : `+${hiddenSearchFieldCount.value}`;
});

const selectionHintTitle = computed(() =>
  mergedSelectedRowKeys.value.length > 0
    ? `${mergedSelectedRowKeys.value.length} 项已选`
    : '批量待命'
);

const selectionHintDescription = computed(() =>
  mergedSelectedRowKeys.value.length > 0 ? '可执行批量操作' : '选中后启用'
);

const resultCountLabel = computed(() => `${pagination.total} 条`);
const pageMetaLabel = computed(() => `${pagination.current}/${totalPages.value} 页`);

const inferActionIcon = (key: string): ProActionIcon | undefined => {
  const normalized = key.trim().toLowerCase();

  if (
    normalized.includes('create') ||
    normalized.includes('add') ||
    normalized.includes('new')
  ) {
    return 'plus';
  }

  if (
    normalized.includes('refresh') ||
    normalized.includes('reload') ||
    normalized.includes('retry') ||
    normalized.includes('requery')
  ) {
    return 'refresh';
  }

  if (normalized.includes('archive')) {
    return 'archive';
  }

  if (
    normalized.includes('inspect') ||
    normalized.includes('view') ||
    normalized.includes('detail') ||
    normalized.includes('preview')
  ) {
    return 'eye';
  }

  if (
    normalized.includes('clear') ||
    normalized.includes('close') ||
    normalized.includes('remove')
  ) {
    return 'close';
  }

  return undefined;
};

const resolveActionIcon = (action: { key: string; icon?: ProActionIcon }): ProActionIcon | undefined =>
  action.icon ?? inferActionIcon(action.key);

const hasActionIcon = (action: { key: string; icon?: ProActionIcon }): boolean =>
  resolveActionIcon(action) !== undefined;

const renderIconMarkup = (icon: ProActionIcon): string => PRO_ICON_MARKUP[icon];

const resolveActionIconMarkup = (action: { key: string; icon?: ProActionIcon }): string => {
  const icon = resolveActionIcon(action);
  return icon ? renderIconMarkup(icon) : '';
};

const toggleSearchExpanded = (): void => {
  if (!isSearchCollapsible.value) {
    return;
  }

  searchExpanded.value = !searchExpanded.value;
};

const resolveVisibleRowActions = (row: TableRow, index: number): ProRowAction<TableRow>[] =>
  props.rowActions.filter((action) => action.visible?.(row, index) ?? true);

const isBulkActionDisabled = (action: ProBulkAction<TableRow>): boolean => {
  const context = buildBulkActionContext();
  return (
    loading.value ||
    pendingBulkActionKeys[action.key] ||
    mergedSelectedRowKeys.value.length === 0 ||
    (action.disabled?.(context) ?? false)
  );
};

const isBulkActionLoading = (action: ProBulkAction<TableRow>): boolean => {
  const context = buildBulkActionContext();
  return pendingBulkActionKeys[action.key] || (action.loading?.(context) ?? false);
};

watch(
  rows,
  (nextRows) => {
    nextRows.forEach((row, index) => {
      const rowKey = resolveRowKeyValue(row, index);
      if (rowKey !== null) {
        selectedRowSnapshots[String(rowKey)] = row;
      }
    });
  },
  { immediate: true }
);

watch(
  () => rowSelectionConfig.value?.selectedRowKeys,
  (nextKeys) => {
    if (!isSelectionControlled.value) {
      return;
    }

    internalSelectedRowKeys.value = nextKeys ?? [];
  }
);

watch(
  () => rowSelectionConfig.value?.defaultSelectedRowKeys,
  (nextKeys) => {
    if (isSelectionControlled.value) {
      return;
    }

    internalSelectedRowKeys.value = nextKeys ?? [];
  }
);

watch(
  () => props.searchSchema,
  () => {
    Object.keys(formValues).forEach((key) => {
      delete formValues[key];
    });
    Object.assign(formValues, buildDefaultForm());
    if (props.searchSchema.length <= SEARCH_VISIBLE_FIELD_COUNT) {
      searchExpanded.value = false;
    }
  }
);

onMounted(async () => {
  if (props.autoQuery) {
    await runQuery();
  }
});

defineExpose({
  refresh: runQuery,
  abort: requestPipeline.abortActive
});
</script>

<template>
  <section class="l-pro-table">
    <div class="l-pro-table__search">
      <slot name="search" :form-values="formValues">
        <LForm class="l-pro-table__search-form" :model="formValues">
          <div class="l-pro-table__fields">
            <LFormItem
              v-for="field in visibleSearchSchema"
              :key="field.name"
              class="l-pro-table__field"
              :label="field.label"
              :name="field.name"
              :style="{ width: resolveFieldWidth(field.width) }"
            >
              <slot :name="`search-field-${field.name}`" :field="field" :form-values="formValues">
                <LInput
                  v-if="field.type === 'text'"
                  :value="String(formValues[field.name] ?? '')"
                  :placeholder="field.placeholder || `请输入${field.label}`"
                  v-bind="field.inputProps"
                  @update:value="(nextValue) => (formValues[field.name] = nextValue)"
                  @keydown.enter="onSearch"
                />
                <LSelect
                  v-else-if="field.type === 'select'"
                  :options="field.options"
                  :value="resolveSelectFieldValue(field.name)"
                  :placeholder="field.placeholder || `请选择${field.label}`"
                  v-bind="field.selectProps"
                  @update:value="(nextValue) => (formValues[field.name] = nextValue)"
                />
                <LDatePicker
                  v-else-if="field.type === 'date'"
                  :value="
                    typeof formValues[field.name] === 'string'
                      ? String(formValues[field.name])
                      : undefined
                  "
                  :placeholder="field.placeholder || `请选择${field.label}`"
                  v-bind="field.datePickerProps"
                  @update:value="(nextValue) => (formValues[field.name] = nextValue)"
                />
                <LDateRangePicker
                  v-else-if="field.type === 'dateRange'"
                  :value="resolveDateRangeFieldValue(field.name)"
                  v-bind="field.dateRangePickerProps"
                  @update:value="(nextValue) => (formValues[field.name] = nextValue)"
                />
                <LCascader
                  v-else
                  :options="field.options"
                  :value="resolveCascaderFieldValue(field.name)"
                  :placeholder="field.placeholder || `请选择${field.label}`"
                  v-bind="field.cascaderProps"
                  @update:value="(nextValue) => (formValues[field.name] = nextValue)"
                />
              </slot>
            </LFormItem>
          </div>
          <div class="l-pro-table__search-footer">
            <div class="l-pro-table__search-overview">
              <div class="l-pro-table__search-chips">
                <span class="l-pro-table__stat-chip" data-testid="pro-search-summary">
                  <span
                    class="l-pro-table__icon"
                    aria-hidden="true"
                    v-html="renderIconMarkup('sparkles')"
                  />
                  <span>{{ searchSummaryLabel }}</span>
                </span>
                <span class="l-pro-table__stat-chip l-pro-table__stat-chip--accent">
                  <span
                    class="l-pro-table__icon"
                    aria-hidden="true"
                    v-html="renderIconMarkup(hiddenActiveFilterCount > 0 ? 'filter' : 'sparkles')"
                  />
                  <span>{{ searchDetailLabel }}</span>
                  <span v-if="searchDetailBadgeLabel" class="l-pro-table__badge">
                    {{ searchDetailBadgeLabel }}
                  </span>
                </span>
              </div>
              <LButton
                v-if="isSearchCollapsible"
                class="l-pro-table__search-toggle"
                data-testid="pro-search-toggle"
                type="text"
                :aria-expanded="searchExpanded"
                @click="toggleSearchExpanded"
              >
                <span
                  class="l-pro-table__icon"
                  aria-hidden="true"
                  v-html="renderIconMarkup('filter')"
                />
                <span>{{ searchToggleText }}</span>
                <span v-if="searchToggleBadgeLabel" class="l-pro-table__badge">
                  {{ searchToggleBadgeLabel }}
                </span>
              </LButton>
            </div>
            <div class="l-pro-table__search-actions">
              <LButton
                class="l-pro-table__action-button l-pro-table__action-button--primary"
                data-testid="pro-search-submit"
                type="primary"
                :loading="loading"
                @click="onSearch"
              >
                <span
                  class="l-pro-table__icon"
                  aria-hidden="true"
                  v-html="renderIconMarkup('search')"
                />
                查询
              </LButton>
              <LButton
                class="l-pro-table__action-button"
                data-testid="pro-search-reset"
                type="dashed"
                :disabled="loading"
                @click="onReset"
              >
                <span
                  class="l-pro-table__icon"
                  aria-hidden="true"
                  v-html="renderIconMarkup('reset')"
                />
                重置
              </LButton>
            </div>
          </div>
        </LForm>
      </slot>
    </div>

    <header class="l-pro-table__toolbar">
      <slot v-if="hasToolbarSlot" name="toolbar" v-bind="toolbarSlotContext" />
      <template v-else>
        <div class="l-pro-table__toolbar-left">
          <div
            v-if="showSelectionHint"
            class="l-pro-table__selection-hint"
            data-testid="pro-selection-hint"
          >
            <div class="l-pro-table__selection-copy">
              <span class="l-pro-table__selection-count">
                <span
                  class="l-pro-table__icon"
                  aria-hidden="true"
                  v-html="renderIconMarkup('sparkles')"
                />
                <span>{{ selectionHintTitle }}</span>
              </span>
              <span v-if="selectionHintDescription" class="l-pro-table__selection-note">
                {{ selectionHintDescription }}
              </span>
            </div>
            <LButton
              v-if="mergedSelectedRowKeys.length"
              class="l-pro-table__selection-clear"
              type="text"
              aria-label="清空已选"
              title="清空已选"
              @click="clearSelection"
            >
              <span
                class="l-pro-table__icon"
                aria-hidden="true"
                v-html="renderIconMarkup('close')"
              />
              清空
            </LButton>
          </div>
          <div v-if="visibleBulkActions.length" class="l-pro-table__bulk-actions">
            <LButton
              v-for="action in visibleBulkActions"
              :key="action.key"
              class="l-pro-table__toolbar-button"
              :data-testid="`pro-bulk-action-${action.key}`"
              :type="action.type ?? 'dashed'"
              :danger="action.danger"
              :disabled="isBulkActionDisabled(action)"
              :loading="isBulkActionLoading(action)"
              @click="runBulkAction(action)"
            >
              <span
                v-if="hasActionIcon(action)"
                class="l-pro-table__icon"
                aria-hidden="true"
                v-html="resolveActionIconMarkup(action)"
              />
              {{ action.label }}
            </LButton>
          </div>
        </div>
        <div class="l-pro-table__toolbar-right">
          <div v-if="visibleToolbarActions.length" class="l-pro-table__toolbar-actions">
            <LButton
              v-for="item in visibleToolbarActions"
              :key="item.key"
              class="l-pro-table__toolbar-button"
              :type="item.type ?? 'default'"
              :danger="item.danger"
              :disabled="loading || item.disabled || pendingToolbarActionKeys[item.key]"
              :loading="item.loading || pendingToolbarActionKeys[item.key]"
              @click="runToolbarAction(item)"
            >
              <span
                v-if="hasActionIcon(item)"
                class="l-pro-table__icon"
                aria-hidden="true"
                v-html="resolveActionIconMarkup(item)"
              />
              {{ item.label }}
            </LButton>
          </div>
          <div class="l-pro-table__toolbar-meta" data-testid="pro-toolbar-meta">
            <span
              v-if="loading && rows.length"
              class="l-pro-table__meta-chip l-pro-table__meta-chip--status"
            >
              <span
                class="l-pro-table__icon"
                aria-hidden="true"
                v-html="renderIconMarkup('refresh')"
              />
              <span>刷新中</span>
            </span>
            <span class="l-pro-table__meta-chip">
              <span
                class="l-pro-table__icon"
                aria-hidden="true"
                v-html="renderIconMarkup('sparkles')"
              />
              <span>{{ resultCountLabel }}</span>
            </span>
            <span class="l-pro-table__meta-chip">
              <span
                class="l-pro-table__icon"
                aria-hidden="true"
                v-html="renderIconMarkup('filter')"
              />
              <span>{{ pageMetaLabel }}</span>
            </span>
            <span v-if="loading && rows.length" class="l-pro-table__status">更新中...</span>
            <span class="l-pro-table__meta">
              共 {{ pagination.total }} 条 · 第 {{ pagination.current }}/{{ totalPages }} 页
            </span>
          </div>
        </div>
      </template>
    </header>

    <div v-if="error" class="l-pro-table__error">
      <slot name="error" :error="error" :retry="onRetry">
        <span class="l-pro-table__error-copy">
          <span
            class="l-pro-table__icon"
            aria-hidden="true"
            v-html="renderIconMarkup('refresh')"
          />
          <span>请求失败，请重试。</span>
        </span>
        <LButton class="l-pro-table__retry-button" data-testid="pro-search-retry" type="text" @click="onRetry">
          <span
            class="l-pro-table__icon"
            aria-hidden="true"
            v-html="renderIconMarkup('refresh')"
          />
          重试
        </LButton>
      </slot>
    </div>

    <div class="l-pro-table__results">
      <LTable
        :columns="tableColumns"
        :data-source="rows"
        :row-key="effectiveRowKey"
        :loading="loading && rows.length === 0"
        :sort-state="sortState"
        :row-selection="effectiveRowSelection"
        @update:sort-state="onSortChange"
        @update:selected-row-keys="commitSelectedRowKeys"
      >
        <template #bodyCell="{ column, record, index, value }">
          <div
            v-if="column.key === ACTION_COLUMN_KEY"
            class="l-pro-table__row-actions"
          >
            <slot name="row-actions" :row="record" :index="index" :refresh="runQuery">
              <LButton
                v-for="action in resolveVisibleRowActions(record, index)"
                :key="action.key"
                :class="[
                  'l-pro-table__row-action-button',
                  hasActionIcon(action) && 'l-pro-table__row-action-button--icon-only'
                ]"
                type="text"
                :disabled="
                  loading ||
                  (action.disabled?.(record, index) ?? false) ||
                  pendingRowActionKeys[rowActionStateKey(action, record, index)]
                "
                :type="action.type ?? 'text'"
                :danger="action.danger"
                :loading="
                  (action.loading?.(record, index) ?? false) ||
                  pendingRowActionKeys[rowActionStateKey(action, record, index)]
                "
                :aria-label="action.label"
                :title="action.label"
                @click="runRowAction(action, record, index)"
              >
                <span
                  v-if="hasActionIcon(action)"
                  class="l-pro-table__icon"
                  aria-hidden="true"
                  v-html="resolveActionIconMarkup(action)"
                />
                <span class="l-pro-table__row-action-label">{{ action.label }}</span>
              </LButton>
            </slot>
          </div>
          <slot v-else :name="`cell-${column.key}`" :row="record" :column="column" :index="index">
            <component
              :is="column.render ? { render: () => column.render?.(record, index) } : 'span'"
            >
              <template v-if="!column.render">{{ value }}</template>
            </component>
          </slot>
        </template>
        <template #empty>
          <slot name="empty">暂无数据。</slot>
        </template>
      </LTable>
    </div>

    <footer class="l-pro-table__pagination">
      <LPagination
        :current="pagination.current"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        :disabled="loading"
        @update:current="onPageChange"
      />
    </footer>
  </section>
</template>
