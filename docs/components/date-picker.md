# DatePicker

`LDatePicker` 是 M4 的单日期选择基线，当前只覆盖单日期、清空、格式化、禁用、状态反馈和表单联动。

## 示例
```vue
<script setup lang="ts">
import { ref } from 'vue';

const value = ref<string | undefined>('2026-05-14');
</script>

<template>
  <LDatePicker
    v-model:value="value"
    allow-clear
    placeholder="请选择发布日期"
  />
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| undefined` | `undefined` | 受控日期值 |
| `defaultValue` | `string \| undefined` | `undefined` | 非受控初始值 |
| `placeholder` | `string` | `'Select date'` | 占位文案 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `allowClear` | `boolean` | `false` | 是否显示清空按钮 |
| `format` | `string` | `'YYYY-MM-DD'` | 输出与回显格式 |
| `status` | `'default' \| 'warning' \| 'error'` | `'default'` | 状态样式 |
| `size` | `'small' \| 'middle' \| 'large'` | 继承 | 组件尺寸 |

## Emits

- `update:value`
- `change`
- `openChange`
- `focus`
- `blur`

## 当前边界

- 已覆盖：单日期选择、受控 / 非受控、清空、格式化、禁用、状态反馈、FormItem 错误态联动。
- 暂不支持：`RangePicker`、`showTime`、月份/季度选择、复杂 locale 与 timezone 行为。
