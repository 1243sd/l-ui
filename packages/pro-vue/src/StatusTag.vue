<script setup lang="ts">
import { LTag } from '@lolita-ui/components-vue';
import { computed } from 'vue';
import {
  normalizeValueEnumValue,
  resolveValueEnumEntry,
  resolveValueEnumText,
  type ValueEnum,
  type ValueEnumIcon
} from './valueEnum';

const props = withDefaults(
  defineProps<{
    value?: string | number | boolean | null;
    text?: string;
    valueEnum?: ValueEnum;
    fallback?: string;
    bordered?: boolean;
    round?: boolean;
    showIcon?: boolean;
  }>(),
  {
    text: undefined,
    value: undefined,
    valueEnum: undefined,
    fallback: '--',
    bordered: true,
    round: true,
    showIcon: true
  }
);

const resolvedEntry = computed(() =>
  resolveValueEnumEntry(props.value, props.valueEnum)
);

const label = computed(() => {
  if (props.text !== undefined) {
    return props.text;
  }

  return resolveValueEnumText(props.value, props.valueEnum, props.fallback);
});

const color = computed(() => resolvedEntry.value?.color ?? 'default');

const iconName = computed<ValueEnumIcon | undefined>(() => {
  if (!props.showIcon) {
    return undefined;
  }

  return resolvedEntry.value?.icon;
});

const iconPaths: Record<ValueEnumIcon, string[]> = {
  check: ['M3.5 8.5L6.5 11.5L12.5 5.5'],
  clock: ['M8 4.5V8L10.5 9.5', 'M8 14A6 6 0 1 0 8 2A6 6 0 0 0 8 14Z'],
  close: ['M5 5L11 11', 'M11 5L5 11'],
  minus: ['M4 8H12'],
  pause: ['M6 4V12', 'M10 4V12']
};
</script>

<template>
  <LTag
    class="l-pro-status-tag"
    :color="color"
    :bordered="bordered"
    :round="round"
    :data-status-value="normalizeValueEnumValue(value) ?? 'empty'"
    data-testid="pro-status-tag"
  >
    <span
      :style="{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
      }"
    >
      <span
        v-if="iconName"
        data-testid="status-tag-icon"
        :data-icon="iconName"
        aria-hidden="true"
        :style="{
          display: 'inline-flex',
          width: '12px',
          height: '12px',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '0 0 auto'
        }"
      >
        <svg
          viewBox="0 0 16 16"
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            v-for="path in iconPaths[iconName]"
            :key="path"
            :d="path"
          />
        </svg>
      </span>
      <span>{{ label }}</span>
    </span>
  </LTag>
</template>
