<script setup lang="ts">
import { LButton } from '@lolita-ui/components-vue';
import { createRequestPipeline, isAbortError, mergePagination, normalizePagination, type PaginationState } from '@lolita-ui/utils';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import type {
  ProRowAction,
  ProSearchTableLifecycle,
  ProSearchTableRequest,
  ProTableColumn,
  ProToolbarAction,
  SearchFieldSchema
} from './types';

type TableRow = Record<string, unknown>;
type SearchForm = Record<string, unknown>;

const props = withDefaults(
  defineProps<{
    columns: ProTableColumn<TableRow>[];
    searchSchema?: SearchFieldSchema[];
    request: ProSearchTableRequest<TableRow, SearchForm>;
    rowActions?: ProRowAction<TableRow>[];
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

const buildDefaultForm = (): SearchForm => {
  return props.searchSchema.reduce<SearchForm>((acc, item) => {
    acc[item.name] = item.defaultValue ?? '';
    return acc;
  }, {});
};

const formValues = reactive<SearchForm>(buildDefaultForm());
const totalPages = computed(() => Math.max(1, Math.ceil(pagination.total / pagination.pageSize)));
const skipSymbol = Symbol('skip-query');

const requestPipeline = createRequestPipeline<
  { pagination: { current: number; pageSize: number }; formValues: SearchForm },
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

  try {
    const execution = requestPipeline.execute(payload);
    const result = await execution.promise;
    rows.value = result.data;
    Object.assign(pagination, mergePagination(pagination, { total: result.total }));
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

const onPrev = async () => {
  if (pagination.current <= 1 || loading.value) {
    return;
  }
  Object.assign(pagination, mergePagination(pagination, { current: pagination.current - 1 }));
  await runQuery();
};

const onNext = async () => {
  if (pagination.current >= totalPages.value || loading.value) {
    return;
  }
  Object.assign(pagination, mergePagination(pagination, { current: pagination.current + 1 }));
  await runQuery();
};

const readCell = (row: TableRow, column: ProTableColumn<TableRow>): unknown => {
  if (!column.dataIndex) {
    return '';
  }
  return row[String(column.dataIndex)];
};

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
        <div class="l-pro-table__fields">
          <label
            v-for="field in searchSchema"
            :key="field.name"
            class="l-pro-table__field"
            :style="{ width: typeof field.width === 'number' ? `${field.width}px` : field.width }"
          >
            <span class="l-pro-table__field-label">{{ field.label }}</span>
            <slot :name="`search-field-${field.name}`" :field="field" :form-values="formValues">
              <input
                v-if="field.type === 'text'"
                v-model="formValues[field.name] as string"
                class="l-pro-table__input"
                :placeholder="field.placeholder || `Please input ${field.label}`"
              />
              <select v-else v-model="formValues[field.name]" class="l-pro-table__select">
                <option
                  v-for="option in field.options || []"
                  :key="`${field.name}-${String(option.value)}`"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </slot>
          </label>
        </div>
      </slot>
      <div class="l-pro-table__search-actions">
        <LButton type="primary" :loading="loading" @click="onSearch">Search</LButton>
        <LButton type="dashed" :disabled="loading" @click="onReset">Reset</LButton>
      </div>
    </div>

    <header class="l-pro-table__toolbar">
      <div class="l-pro-table__toolbar-left">
        <slot name="toolbar" :loading="loading">
          <LButton
            v-for="item in toolbar"
            :key="item.key"
            type="text"
            :disabled="loading"
            @click="item.onClick()"
          >
            {{ item.label }}
          </LButton>
        </slot>
      </div>
      <span class="l-pro-table__meta">
        {{ pagination.total }} items · page {{ pagination.current }}/{{ totalPages }}
      </span>
    </header>

    <div v-if="error" class="l-pro-table__error">
      <slot name="error" :error="error">
        Request failed. Please retry.
      </slot>
    </div>

    <table v-else class="l-pro-table__table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" :style="{ textAlign: column.align || 'left', width: String(column.width || '') }">
            <slot :name="`header-${column.key}`" :column="column">
              {{ column.title }}
            </slot>
          </th>
          <th v-if="rowActions.length || $slots['row-actions']">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!rows.length && !loading">
          <td :colspan="columns.length + (rowActions.length || $slots['row-actions'] ? 1 : 0)" class="l-pro-table__empty">
            <slot name="empty">No data.</slot>
          </td>
        </tr>
        <tr v-for="(row, rowIndex) in rows" :key="String(rowIndex)">
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
            <slot name="row-actions" :row="row" :index="rowIndex">
              <LButton
                v-for="action in rowActions"
                :key="action.key"
                type="text"
                :disabled="action.disabled?.(row, rowIndex) ?? false"
                @click="action.onClick(row, rowIndex)"
              >
                {{ action.label }}
              </LButton>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <footer class="l-pro-table__pagination">
      <LButton type="text" :disabled="pagination.current <= 1 || loading" @click="onPrev">Prev</LButton>
      <span>{{ pagination.current }} / {{ totalPages }}</span>
      <LButton type="text" :disabled="pagination.current >= totalPages || loading" @click="onNext">Next</LButton>
    </footer>
  </section>
</template>
