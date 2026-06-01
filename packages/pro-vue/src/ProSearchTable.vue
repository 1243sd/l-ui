<script setup lang="ts">
import {
  LButton,
  LCascader,
  LDatePicker,
  LForm,
  LFormItem,
  LInput,
  LPagination,
  LSelect
} from '@lolita-ui/components-vue';
import {
  createRequestPipeline,
  isAbortError,
  mergePagination,
  normalizePagination,
  type PaginationState
} from '@lolita-ui/utils';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { buildDefaultFormValues, serializeQueryValues } from './searchSchema';
import type {
  ProRowAction,
  ProRowKey,
  ProSearchTableLifecycle,
  ProSearchTableRequest,
  ProTableColumn,
  ProToolbarAction,
  SearchFieldSchema,
  SearchQueryValues
} from './types';

type TableRow = Record<string, unknown>;
type SearchForm = Record<string, unknown>;

const props = withDefaults(
  defineProps<{
    columns: ProTableColumn<TableRow>[];
    searchSchema?: SearchFieldSchema[];
    request: ProSearchTableRequest<TableRow, SearchForm>;
    rowActions?: ProRowAction<TableRow>[];
    rowKey?: ProRowKey<TableRow>;
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
}>();

const loading = ref(false);
const rows = ref<TableRow[]>([]);
const error = ref<unknown>(null);
const pagination = reactive<PaginationState>(normalizePagination(props.initialPagination));
const pendingRowActionKeys = reactive<Record<string, boolean>>({});
const pendingToolbarActionKeys = reactive<Record<string, boolean>>({});

const buildDefaultForm = (): SearchForm => buildDefaultFormValues(props.searchSchema);

const formValues = reactive<SearchForm>(buildDefaultForm());
const totalPages = computed(() => Math.max(1, Math.ceil(pagination.total / pagination.pageSize)));
const skipSymbol = Symbol('skip-query');
const missingRowKeyWarning =
  '[ProSearchTable] rowKey is required when rows do not expose a primitive "id".';

const requestPipeline = createRequestPipeline<
  {
    pagination: { current: number; pageSize: number };
    formValues: SearchForm;
    queryValues: SearchQueryValues;
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
      signal: context.signal,
      attempt: context.attempt
    });
  },
  beforeQuery: async (payload) => {
    if (!props.lifecycle.beforeQuery) {
      return payload;
    }
    const next = await props.lifecycle.beforeQuery(payload);
    if (next === false) {
      throw skipSymbol;
    }
    return next;
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

const runQuery = async () => {
  loading.value = true;
  error.value = null;
  const payload = {
    pagination: {
      current: pagination.current,
      pageSize: pagination.pageSize
    },
    formValues: { ...formValues }
  };
  const { blocked, queryValues } = serializeQueryValues(props.searchSchema, payload.formValues);

  if (blocked) {
    loading.value = false;
    return;
  }

  try {
    const execution = requestPipeline.execute({
      ...payload,
      queryValues
    });
    const result = await execution.promise;
    const validatedRows = validateResolvedRows(result.data);
    rows.value = validatedRows ?? [];
    Object.assign(
      pagination,
      mergePagination(pagination, { total: validatedRows ? result.total : 0 })
    );
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
  await runQuery();
};

const onReset = async () => {
  Object.keys(formValues).forEach((key) => {
    delete formValues[key];
  });
  Object.assign(formValues, buildDefaultForm());
  Object.assign(pagination, mergePagination(pagination, { current: 1 }));
  await runQuery();
};

const onRetry = async () => {
  await runQuery();
};

const onPageChange = async (nextCurrent: number) => {
  if (loading.value || nextCurrent === pagination.current) {
    return;
  }

  Object.assign(pagination, mergePagination(pagination, { current: nextCurrent }));
  await runQuery();
};

const readCell = (row: TableRow, column: ProTableColumn<TableRow>): unknown => {
  if (!column.dataIndex) {
    return '';
  }
  return row[String(column.dataIndex)];
};

const resolveFieldWidth = (width: SearchFieldSchema['width']): string | undefined => {
  if (typeof width === 'number') {
    return `${width}px`;
  }
  return width;
};

const visibleToolbarActions = computed(() =>
  props.toolbar.filter((item) => item.visible !== false)
);

const resolveVisibleRowActions = (row: TableRow, index: number): ProRowAction<TableRow>[] =>
  props.rowActions.filter((action) => action.visible?.(row, index) ?? true);

watch(
  () => props.searchSchema,
  () => {
    Object.keys(formValues).forEach((key) => {
      delete formValues[key];
    });
    Object.assign(formValues, buildDefaultForm());
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
              v-for="field in searchSchema"
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
                  :value="formValues[field.name]"
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
                <LCascader
                  v-else
                  :options="field.options"
                  :value="Array.isArray(formValues[field.name]) ? formValues[field.name] : undefined"
                  :placeholder="field.placeholder || `请选择${field.label}`"
                  v-bind="field.cascaderProps"
                  @update:value="(nextValue) => (formValues[field.name] = nextValue)"
                />
              </slot>
            </LFormItem>
          </div>
          <div class="l-pro-table__search-actions">
            <LButton
              data-testid="pro-search-submit"
              type="primary"
              :loading="loading"
              @click="onSearch"
            >
              查询
            </LButton>
            <LButton
              data-testid="pro-search-reset"
              type="dashed"
              :disabled="loading"
              @click="onReset"
            >
              重置
            </LButton>
          </div>
        </LForm>
      </slot>
    </div>

    <header class="l-pro-table__toolbar">
      <div class="l-pro-table__toolbar-left">
        <slot name="toolbar" :loading="loading" :refresh="runQuery">
          <LButton
            v-for="item in visibleToolbarActions"
            :key="item.key"
            type="text"
            :disabled="loading || item.disabled || pendingToolbarActionKeys[item.key]"
            :loading="item.loading || pendingToolbarActionKeys[item.key]"
            @click="runToolbarAction(item)"
          >
            {{ item.label }}
          </LButton>
        </slot>
      </div>
      <span class="l-pro-table__meta">
        共 {{ pagination.total }} 条 · 第 {{ pagination.current }}/{{ totalPages }} 页
      </span>
    </header>

    <div v-if="error" class="l-pro-table__error">
      <slot name="error" :error="error" :retry="onRetry">
        <span>请求失败，请重试。</span>
        <LButton data-testid="pro-search-retry" type="text" @click="onRetry">重试</LButton>
      </slot>
    </div>

    <table class="l-pro-table__table">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :style="{ textAlign: column.align || 'left', width: String(column.width || '') }"
          >
            <slot :name="`header-${column.key}`" :column="column">
              {{ column.title }}
            </slot>
          </th>
          <th v-if="rowActions.length || $slots['row-actions']">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!rows.length && !loading">
          <td
            :colspan="columns.length + (rowActions.length || $slots['row-actions'] ? 1 : 0)"
            class="l-pro-table__empty"
          >
            <slot name="empty">暂无数据。</slot>
          </td>
        </tr>
        <tr
          v-for="(row, rowIndex) in rows"
          :key="String(resolveRowKeyValue(row, rowIndex))"
          :data-row-key="String(resolveRowKeyValue(row, rowIndex))"
        >
          <td
            v-for="column in columns"
            :key="`${rowIndex}-${column.key}`"
            :style="{ textAlign: column.align || 'left' }"
          >
            <slot :name="`cell-${column.key}`" :row="row" :column="column" :index="rowIndex">
              <component
                :is="column.render ? { render: () => column.render?.(row, rowIndex) } : 'span'"
              >
                <template v-if="!column.render">{{ readCell(row, column) }}</template>
              </component>
            </slot>
          </td>
          <td v-if="rowActions.length || $slots['row-actions']" class="l-pro-table__row-actions">
            <slot name="row-actions" :row="row" :index="rowIndex" :refresh="runQuery">
              <LButton
                v-for="action in resolveVisibleRowActions(row, rowIndex)"
                :key="action.key"
                type="text"
                :disabled="
                  loading ||
                  (action.disabled?.(row, rowIndex) ?? false) ||
                  pendingRowActionKeys[rowActionStateKey(action, row, rowIndex)]
                "
                :loading="
                  (action.loading?.(row, rowIndex) ?? false) ||
                  pendingRowActionKeys[rowActionStateKey(action, row, rowIndex)]
                "
                @click="runRowAction(action, row, rowIndex)"
              >
                {{ action.label }}
              </LButton>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

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
