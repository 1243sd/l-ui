<script setup lang="ts">
import { LButton, type TableSortState } from '@lolita-ui/components-vue'; 
import { computed, reactive } from 'vue'; 
import {
  hasProActionIcon,
  resolveProActionIconMarkup,
  resolveProIconMarkup
} from './proIcons';
import type { ProActionIcon, ProBulkAction, ProBulkActionContext } from './types'; 

type TableRow = Record<string, unknown>;
type TableSelectionKey = string | number;

const SELECTED_DESCRIPTION = '\u53ef\u6267\u884c\u6279\u91cf\u64cd\u4f5c';
const CLEAR_SELECTED_LABEL = '\u6e05\u7a7a\u5df2\u9009';

const props = withDefaults( 
  defineProps<{
    actions?: ProBulkAction<TableRow>[];
    selectedRowKeys?: TableSelectionKey[];
    selectedRows?: TableRow[];
    clearSelection?: () => void;
    refresh?: () => void | Promise<void>;
    sortState?: TableSortState;
    loading?: boolean;
    title?: string;
    description?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    clearText?: string;
    clearable?: boolean;
  }>(),
  {
    actions: () => [],
    selectedRowKeys: () => [],
    selectedRows: () => [],
    refresh: async () => {},
    clearSelection: () => {},
    sortState: undefined,
    loading: false,
    title: undefined,
    description: undefined,
    emptyTitle: '\u6279\u91cf\u5f85\u547d',
    emptyDescription: '\u9009\u4e2d\u540e\u542f\u7528',
    clearText: '\u6e05\u7a7a',
    clearable: true
  }
);

const pendingActionKeys = reactive<Record<string, boolean>>({});

const selectionCount = computed(() => props.selectedRowKeys.length);

const buildContext = (): ProBulkActionContext<TableRow> => ({
  selectedRowKeys: [...props.selectedRowKeys],
  selectedRows: [...props.selectedRows],
  clearSelection: props.clearSelection,
  refresh: async () => {
    await Promise.resolve(props.refresh());
  },
  sortState: props.sortState
});

const visibleActions = computed(() =>
  props.actions.filter((action) => action.visible?.(buildContext()) ?? true)
);

const heading = computed(() => {
  if (props.title) {
    return props.title;
  }

  if (selectionCount.value > 0) {
    return `${selectionCount.value} \u9879\u5df2\u9009`;
  }

  return props.emptyTitle;
});

const helperText = computed(() => {
  if (props.description !== undefined) {
    return props.description;
  }

  if (selectionCount.value > 0) {
    return SELECTED_DESCRIPTION;
  }

  return props.emptyDescription;
});

const showClear = computed(() => props.clearable && selectionCount.value > 0);

const hasActionIcon = hasProActionIcon;
const resolveActionIconMarkup = resolveProActionIconMarkup;

const isActionDisabled = (action: ProBulkAction<TableRow>): boolean => {
  const context = buildContext();
  return (
    props.loading ||
    pendingActionKeys[action.key] ||
    selectionCount.value === 0 ||
    (action.disabled?.(context) ?? false)
  );
};

const isActionLoading = (action: ProBulkAction<TableRow>): boolean => {
  const context = buildContext();
  return pendingActionKeys[action.key] || (action.loading?.(context) ?? false);
};

const runAction = async (action: ProBulkAction<TableRow>): Promise<void> => {
  const context = buildContext();
  pendingActionKeys[action.key] = true;

  try {
    await Promise.resolve(action.onClick(context));

    if (action.refreshOnSuccess !== false) {
      await Promise.resolve(props.refresh());
      if (action.clearSelectionOnSuccess !== false) {
        props.clearSelection();
      }
      return;
    }

    if (action.clearSelectionOnSuccess !== false) {
      props.clearSelection();
    }
  } finally {
    pendingActionKeys[action.key] = false;
  }
};
</script>

<template>
  <section
    class="l-pro-batch-action-bar l-pro-table__toolbar-left"
    data-testid="pro-batch-action-bar"
  >
    <div
      class="l-pro-batch-action-bar__hint l-pro-table__selection-hint"
      data-testid="pro-selection-hint"
    >
      <div class="l-pro-batch-action-bar__copy l-pro-table__selection-copy">
        <span class="l-pro-batch-action-bar__title l-pro-table__selection-count">
          <span
            class="l-pro-table__icon"
            aria-hidden="true"
            v-html="resolveProIconMarkup('sparkles')"
          />
          <span>{{ heading }}</span>
        </span>
        <span
          v-if="helperText"
          class="l-pro-batch-action-bar__description l-pro-table__selection-note"
        >
          {{ helperText }}
        </span>
      </div>

      <LButton
        v-if="showClear"
        class="l-pro-batch-action-bar__clear l-pro-table__selection-clear"
        data-testid="pro-batch-action-clear"
        type="text"
        :aria-label="CLEAR_SELECTED_LABEL"
        :title="CLEAR_SELECTED_LABEL"
        @click="props.clearSelection"
      >
        <span class="l-pro-table__icon" aria-hidden="true" v-html="resolveProIconMarkup('close')" />
        {{ clearText }}
      </LButton>
    </div>

    <div v-if="visibleActions.length" class="l-pro-batch-action-bar__actions l-pro-table__bulk-actions">
      <LButton
        v-for="action in visibleActions"
        :key="action.key"
        :class="['l-pro-batch-action-bar__action', 'l-pro-table__toolbar-button', { 'is-loading': isActionLoading(action) }]"
        :data-testid="`pro-bulk-action-${action.key}`"
        :type="action.type ?? 'dashed'"
        :danger="action.danger"
        :disabled="isActionDisabled(action)"
        :loading="isActionLoading(action)"
        @click="runAction(action)"
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
  </section>
</template>
