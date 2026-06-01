# Transfer

`LTransfer` 是 M4 的最小双栏穿梭框基线，先把左右列表、勾选、移动和禁用项处理打稳。

## 示例
```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { TransferItem } from '@lolita-ui/components-vue';

const targetKeys = ref<string[]>(['beta']);
const selectedKeys = ref<string[]>([]);

const dataSource: TransferItem[] = [
  { key: 'alpha', title: '设计系统 Token' },
  { key: 'beta', title: '交互验收清单' }
];
</script>

<template>
  <LTransfer
    v-model:targetKeys="targetKeys"
    v-model:selectedKeys="selectedKeys"
    :data-source="dataSource"
  />
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `dataSource` | `TransferItem[]` | - | 全量数据源 |
| `targetKeys` | `string[] \| undefined` | `undefined` | 受控目标列 key |
| `defaultTargetKeys` | `string[]` | `[]` | 非受控初始目标列 |
| `selectedKeys` | `string[] \| undefined` | `undefined` | 受控勾选 key |
| `defaultSelectedKeys` | `string[]` | `[]` | 非受控初始勾选 |
| `disabled` | `boolean` | `false` | 是否整体禁用 |

## Emits

- `update:targetKeys`
- `update:selectedKeys`
- `change`

## 当前边界

- 已覆盖：双栏列表、勾选、左右移动、受控 / 非受控、禁用项阻断。
- 暂不支持：搜索、分页、树穿梭、表格穿梭和自定义渲染器体系。
