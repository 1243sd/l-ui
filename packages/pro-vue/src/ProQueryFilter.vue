<script setup lang="ts">
import {
  LButton,
  LCascader,
  LDatePicker,
  LDateRangePicker,
  LForm,
  LFormItem,
  LInput,
  LSelect
} from '@lolita-ui/components-vue';
import { computed, ref, useSlots, watch } from 'vue';
import { resolveProIconMarkup } from './proIcons';
import { buildDefaultFormValues } from './searchSchema';
import type { 
  SearchFieldSchema, 
  SearchFieldSelectValue, 
  SearchFormValues 
} from './types'; 

const props = withDefaults(
  defineProps<{
    schema?: SearchFieldSchema[];
    values?: SearchFormValues;
    loading?: boolean;
    expanded?: boolean;
    visibleFieldCount?: number;
    testIdPrefix?: string;
    submitText?: string;
    resetText?: string;
  }>(),
  {
    schema: () => [],
    values: () => ({}),
    loading: false,
    expanded: undefined,
    visibleFieldCount: 4,
    testIdPrefix: 'pro-query-filter',
    submitText: '查询',
    resetText: '重置'
  }
);

const emit = defineEmits<{
  'update:values': [SearchFormValues];
  'update:expanded': [boolean];
  submit: [SearchFormValues];
  reset: [SearchFormValues];
}>();

const slots = useSlots();
const internalExpanded = ref(false);

const buildDefaultValues = (): SearchFormValues => buildDefaultFormValues(props.schema);

const mergedValues = computed<SearchFormValues>(() => ({
  ...buildDefaultValues(),
  ...props.values
}));

const isExpandedControlled = computed(() => props.expanded !== undefined);
const mergedExpanded = computed(() =>
  isExpandedControlled.value ? Boolean(props.expanded) : internalExpanded.value
);

const isCollapsible = computed(
  () => props.schema.length > props.visibleFieldCount
);
const collapsedSchema = computed(() =>
  props.schema.slice(props.visibleFieldCount)
);
const visibleSchema = computed(() =>
  isCollapsible.value && !mergedExpanded.value
    ? props.schema.slice(0, props.visibleFieldCount)
    : props.schema
);

const hasMeaningfulValue = (value: unknown): boolean => {
  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0 && value.some((item) => hasMeaningfulValue(item));
  }

  return true;
};

const hiddenActiveFilterCount = computed(() =>
  collapsedSchema.value.reduce((count, field) => {
    return count + (hasMeaningfulValue(mergedValues.value[field.name]) ? 1 : 0);
  }, 0)
);

const summaryLabel = computed(() => {
  if (props.schema.length === 0) {
    return '未配置筛选';
  }

  if (isCollapsible.value && !mergedExpanded.value) {
    return `${visibleSchema.value.length}/${props.schema.length} 常用`;
  }

  return `${props.schema.length} 项筛选`;
});

const detailLabel = computed(() => {
  if (props.schema.length === 0) {
    return '支持自定义';
  }

  if (hiddenActiveFilterCount.value > 0) {
    return '高级已生效';
  }

  if (mergedExpanded.value && collapsedSchema.value.length > 0) {
    return '高级已展开';
  }

  if (collapsedSchema.value.length > 0) {
    return '高级待展开';
  }

  return '支持回车快速查询';
});

const detailBadgeLabel = computed(() => {
  if (hiddenActiveFilterCount.value > 0) {
    return String(hiddenActiveFilterCount.value);
  }

  if (!mergedExpanded.value && collapsedSchema.value.length > 0) {
    return `+${collapsedSchema.value.length}`;
  }

  return '';
});

const toggleText = computed(() => (mergedExpanded.value ? '收起' : '高级'));

const toggleBadgeLabel = computed(() => {
  if (mergedExpanded.value || collapsedSchema.value.length === 0) {
    return '';
  }

  return hiddenActiveFilterCount.value > 0
    ? String(hiddenActiveFilterCount.value)
    : `+${collapsedSchema.value.length}`;
});

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

const resolveSelectFieldValue = (fieldName: string): SearchFieldSelectValue | undefined => {
  const value = mergedValues.value[fieldName];
  return isSelectFieldValue(value) ? value : undefined;
};

const resolveDateFieldValue = (fieldName: string): string | undefined => {
  const value = mergedValues.value[fieldName];
  return typeof value === 'string' ? value : undefined;
};

const resolveDateRangeFieldValue = (
  fieldName: string
): [string, string] | undefined => {
  const value = mergedValues.value[fieldName];
  return isDateRangeFieldValue(value) ? value : undefined;
};

const resolveCascaderFieldValue = (fieldName: string): string[] | undefined => {
  const value = mergedValues.value[fieldName];
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
    ? value
    : undefined;
};

const emitNextValues = (fieldName: string, value: unknown): void => {
  emit('update:values', {
    ...mergedValues.value,
    [fieldName]: value
  });
};

const resolveFieldSlotName = (fieldName: string): string =>
  slots[`search-field-${fieldName}`] ? `search-field-${fieldName}` : `field-${fieldName}`;

const renderIconMarkup = resolveProIconMarkup;

const toggleExpanded = (): void => {
  if (!isCollapsible.value) {
    return;
  }

  const nextExpanded = !mergedExpanded.value;
  if (!isExpandedControlled.value) {
    internalExpanded.value = nextExpanded;
  }
  emit('update:expanded', nextExpanded);
};

const onSubmit = (): void => {
  emit('submit', { ...mergedValues.value });
};

const onReset = (): void => {
  const nextValues = buildDefaultValues();
  emit('update:values', nextValues);
  emit('reset', nextValues);
};

watch(
  () => props.schema,
  (nextSchema) => {
    if (nextSchema.length <= props.visibleFieldCount) {
      internalExpanded.value = false;
    }
  }
);
</script>

<template>
  <section class="l-pro-query-filter" :data-testid="testIdPrefix">
    <LForm
      class="l-pro-query-filter__form l-pro-table__search-form"
      :model="mergedValues"
      @submit.prevent="onSubmit"
    >
      <div class="l-pro-query-filter__fields l-pro-table__fields">
        <LFormItem
          v-for="field in visibleSchema"
          :key="field.name"
          class="l-pro-query-filter__field l-pro-table__field"
          :label="field.label"
          :name="field.name"
          :style="{ width: resolveFieldWidth(field.width) }"
        >
          <slot
            :name="resolveFieldSlotName(field.name)"
            :field="field"
            :values="mergedValues"
            :update-value="(nextValue: unknown) => emitNextValues(field.name, nextValue)"
          >
            <LInput
              v-if="field.type === 'text'"
              :value="String(mergedValues[field.name] ?? '')"
              :placeholder="field.placeholder || `请输入${field.label}`"
              v-bind="field.inputProps"
              @update:value="(nextValue) => emitNextValues(field.name, nextValue)"
              @keydown.enter="onSubmit"
            />
            <LSelect
              v-else-if="field.type === 'select'"
              :options="field.options"
              :value="resolveSelectFieldValue(field.name)"
              :placeholder="field.placeholder || `请选择${field.label}`"
              v-bind="field.selectProps"
              @update:value="(nextValue) => emitNextValues(field.name, nextValue)"
            />
            <LDatePicker
              v-else-if="field.type === 'date'"
              :value="resolveDateFieldValue(field.name)"
              :placeholder="field.placeholder || `请选择${field.label}`"
              v-bind="field.datePickerProps"
              @update:value="(nextValue) => emitNextValues(field.name, nextValue)"
            />
            <LDateRangePicker
              v-else-if="field.type === 'dateRange'"
              :value="resolveDateRangeFieldValue(field.name)"
              v-bind="field.dateRangePickerProps"
              @update:value="(nextValue) => emitNextValues(field.name, nextValue)"
            />
            <LCascader
              v-else
              :options="field.options"
              :value="resolveCascaderFieldValue(field.name)"
              :placeholder="field.placeholder || `请选择${field.label}`"
              v-bind="field.cascaderProps"
              @update:value="(nextValue) => emitNextValues(field.name, nextValue)"
            />
          </slot>
        </LFormItem>
      </div>

      <div class="l-pro-query-filter__footer l-pro-table__search-footer">
        <div class="l-pro-query-filter__summary l-pro-table__search-overview">
          <div class="l-pro-query-filter__chips l-pro-table__search-chips">
            <span
              class="l-pro-query-filter__chip l-pro-table__stat-chip"
              :data-testid="`${testIdPrefix}-summary`"
            >
              <span
                class="l-pro-query-filter__icon l-pro-table__icon"
                aria-hidden="true"
                v-html="renderIconMarkup('sparkles')"
              />
              <span>{{ summaryLabel }}</span>
            </span>
            <span
              class="l-pro-query-filter__chip l-pro-query-filter__chip--accent l-pro-table__stat-chip l-pro-table__stat-chip--accent"
            >
              <span
                class="l-pro-query-filter__icon l-pro-table__icon"
                aria-hidden="true"
                v-html="renderIconMarkup(hiddenActiveFilterCount > 0 ? 'filter' : 'sparkles')"
              />
              <span>{{ detailLabel }}</span>
              <span v-if="detailBadgeLabel" class="l-pro-query-filter__badge l-pro-table__badge">
                {{ detailBadgeLabel }}
              </span>
            </span>
          </div>
          <LButton
            v-if="isCollapsible"
            class="l-pro-query-filter__toggle l-pro-table__search-toggle"
            :data-testid="`${testIdPrefix}-toggle`"
            type="text"
            :aria-expanded="mergedExpanded"
            @click="toggleExpanded"
          >
            <span
              class="l-pro-query-filter__icon l-pro-table__icon"
              aria-hidden="true"
              v-html="renderIconMarkup('filter')"
            />
            <span>{{ toggleText }}</span>
            <span v-if="toggleBadgeLabel" class="l-pro-query-filter__badge l-pro-table__badge">
              {{ toggleBadgeLabel }}
            </span>
          </LButton>
        </div>

        <div class="l-pro-query-filter__actions l-pro-table__search-actions">
          <LButton
            class="l-pro-query-filter__action l-pro-table__action-button l-pro-table__action-button--primary"
            :data-testid="`${testIdPrefix}-submit`"
            type="primary"
            :loading="loading"
            @click="onSubmit"
          >
            <span
              class="l-pro-query-filter__icon l-pro-table__icon"
              aria-hidden="true"
              v-html="renderIconMarkup('search')"
            />
            {{ submitText }}
          </LButton>
          <LButton
            class="l-pro-query-filter__action l-pro-table__action-button"
            :data-testid="`${testIdPrefix}-reset`"
            type="dashed"
            :disabled="loading"
            @click="onReset"
          >
            <span
              class="l-pro-query-filter__icon l-pro-table__icon"
              aria-hidden="true"
              v-html="renderIconMarkup('reset')"
            />
            {{ resetText }}
          </LButton>
        </div>
      </div>
    </LForm>
  </section>
</template>

<style scoped>
.l-pro-query-filter {
  display: grid;
}

.l-pro-query-filter__chips {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
