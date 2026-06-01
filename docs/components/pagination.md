# Pagination

`LPagination` 是 M3 的页码状态机基线，当前只做上一页、下一页和数字页码，把受控 / 非受控和边界行为先打稳。

## 示例
```vue
<script setup lang="ts">
import { ref } from 'vue';

const current = ref(2);
</script>

<template>
  <LPagination v-model:current="current" :page-size="6" :total="36" />
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `current` | `number \| undefined` | `undefined` | 受控当前页 |
| `defaultCurrent` | `number` | `1` | 非受控初始页 |
| `pageSize` | `number` | `20` | 每页条数 |
| `total` | `number` | `0` | 总条数 |
| `disabled` | `boolean` | `false` | 是否禁用交互 |

## Emits

- `update:current`
- `change`

## 当前已覆盖

- 受控 / 非受控页码。
- 首尾页边界保护。
- 禁用态阻断。
- 上一页 / 下一页 / 数字页码。

## 当前未覆盖

- `showQuickJumper`。
- `showSizeChanger`。
- mini 模式、简洁模式、总数文案扩展。

## 兼容说明

- 当前只保留最小分页契约，避免 `Table` 做完以后还要反向重写页码状态机。
- 所有页码输入都会被夹到合法范围，不会出现 `0` 或负数页。
