<script setup lang="ts">
import {
  LButton,
  LPagination,
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
import ProBatchActionBar from './ProBatchActionBar.vue'; 
import ProQueryFilter from './ProQueryFilter.vue'; 
import {
  hasProActionIcon,
  resolveProActionIconMarkup,
  resolveProIconMarkup
} from './proIcons';
import { buildDefaultFormValues, serializeQueryValues } from './searchSchema'; 
import type { 
  ProBulkAction, 
  ProRowAction, 
  ProRowKey, 
  ProRowSelection,
  ProSearchTableLifecycle,
  ProSearchTableRequest,
  ProTableColumn,
  ProToolbarAction,
  SearchFieldSchema,
  SearchQueryValues 
} from './types'; 

type TableRow = Record<string, unknown>;
type SearchForm = Record<string, unknown>;
type TableSelectionKey = string | number;
type QueryExecutionOptions = {
  clearSelectionOnSuccess?: boolean;
};

const ACTION_COLUMN_KEY = '__actions';

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
const hasRowActions = computed(
  () => props.rowActions.length > 0 || Boolean(slots['row-actions'])
);
const hasToolbarSlot = computed(() => Boolean(slots.toolbar));
const forwardedSearchFieldSchemas = computed(() =>
  props.searchSchema.filter((field) => Boolean(slots[`search-field-${field.name}`]))
);
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

const onReset = async (nextValues?: SearchForm) => {
  replaceFormValues(nextValues ?? buildDefaultForm());
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

const replaceFormValues = (nextValues: SearchForm): void => {
  Object.keys(formValues).forEach((key) => {
    delete formValues[key];
  });
  Object.assign(formValues, nextValues);
};

const visibleToolbarActions = computed(() =>
  props.toolbar.filter((item) => item.visible !== false)
);

const visibleBulkActions = computed(() => {
  const context = {
    selectedRowKeys: [...mergedSelectedRowKeys.value],
    selectedRows: [...selectedRows.value],
    clearSelection,
    refresh: runQuery,
    sortState: sortState.value
  };

  return props.bulkActions.filter((action) => action.visible?.(context) ?? true);
});

const showBatchActionBar = computed(
  () => selectionEnabled.value && (visibleBulkActions.value.length > 0 || mergedSelectedRowKeys.value.length > 0)
);

const resultCountLabel = computed(() => `${pagination.total} 条`);
const pageMetaLabel = computed(() => `${pagination.current}/${totalPages.value} 页`);

const hasActionIcon = hasProActionIcon;
const renderIconMarkup = resolveProIconMarkup;
const resolveActionIconMarkup = resolveProActionIconMarkup;

const resolveVisibleRowActions = (row: TableRow, index: number): ProRowAction<TableRow>[] =>
  props.rowActions.filter((action) => action.visible?.(row, index) ?? true);

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
    replaceFormValues(buildDefaultForm());
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
        <ProQueryFilter
          :schema="props.searchSchema"
          :values="formValues"
          :loading="loading"
          test-id-prefix="pro-search"
          submit-text="查询"
          reset-text="重置"
          @update:values="replaceFormValues"
          @submit="onSearch"
          @reset="onReset"
        >
          <template
            v-for="field in forwardedSearchFieldSchemas"
            :key="field.name"
            #[`search-field-${field.name}`]="slotProps"
          >
            <slot
              :name="`search-field-${field.name}`"
              :field="slotProps.field"
              :form-values="formValues"
            />
          </template>
        </ProQueryFilter>
      </slot>
    </div>

    <header class="l-pro-table__toolbar">
      <slot v-if="hasToolbarSlot" name="toolbar" v-bind="toolbarSlotContext" />
      <template v-else>
        <div class="l-pro-table__toolbar-left">
          <ProBatchActionBar
            v-if="showBatchActionBar"
            :actions="props.bulkActions"
            :selected-row-keys="mergedSelectedRowKeys"
            :selected-rows="selectedRows"
            :clear-selection="clearSelection"
            :refresh="runQuery"
            :sort-state="sortState"
            :loading="loading"
          />
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
