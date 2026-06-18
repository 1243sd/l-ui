# DateRangePicker

`LDateRangePicker` is the M7 minimal range-query primitive for admin workflows. It focuses on stable start/end date selection and intentionally avoids the full Ant Design `RangePicker` surface.

## Example

```vue
<script setup lang="ts">
import { ref } from 'vue';

const value = ref<[string, string] | undefined>(['2026-06-01', '2026-06-08']);
</script>

<template>
  <LDateRangePicker
    v-model:value="value"
    allow-clear
    format="YYYY-MM-DD"
  />
</template>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `[string, string] \| undefined` | `undefined` | Controlled range value. |
| `defaultValue` | `[string, string] \| undefined` | `undefined` | Uncontrolled initial value. |
| `placeholder` | `[string, string] \| undefined` | `['Start date', 'End date']` | Per-endpoint placeholders. |
| `disabled` | `boolean` | `false` | Disables the control. |
| `allowClear` | `boolean` | `false` | Shows the clear action. |
| `format` | `string` | `'YYYY-MM-DD'` | Display and emitted date format. |
| `status` | `'default' \| 'warning' \| 'error'` | `'default'` | Validation/status style. |
| `size` | `'small' \| 'middle' \| 'large'` | inherited | Component size. |

## Events

- `update:value`
- `change`
- `openChange`
- `focus`
- `blur`

## Covered In M7

- Controlled and uncontrolled range selection.
- Start/end auto-ordering when the second click is earlier than the first.
- Clear behavior aligned with `LDatePicker`.
- Re-selection flow after a completed range.
- `FormItem` status linkage.

## Explicitly Out Of Scope

- `showTime`
- presets / quick ranges
- timezone-aware calendar behavior
- week / month / quarter range modes
- arbitrary disabled-date policies

## Compatibility Notes

- This component exists to support range query workflows, not to mirror the full Ant Design ecosystem.
- If product code needs richer calendar modes later, add them as a new milestone rather than overloading the M7 contract.
