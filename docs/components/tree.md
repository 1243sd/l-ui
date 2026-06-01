# Tree

`LTree` 是 M4 的单选树基线，当前只做展开 / 收起、单选、禁用节点跳过和基础键盘导航。

## 示例
```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { TreeNode } from '@lolita-ui/components-vue';

const selectedKeys = ref<string[]>(['design']);
const expandedKeys = ref<string[]>(['team']);

const treeData: TreeNode[] = [
  {
    key: 'team',
    title: '设计团队',
    children: [{ key: 'design', title: '视觉设计' }]
  }
];
</script>

<template>
  <LTree
    v-model:selectedKeys="selectedKeys"
    v-model:expandedKeys="expandedKeys"
    :tree-data="treeData"
  />
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `treeData` | `TreeNode[]` | - | 树节点数据 |
| `selectedKeys` | `string[] \| undefined` | `undefined` | 受控选中 key |
| `defaultSelectedKeys` | `string[]` | `[]` | 非受控初始选中 |
| `expandedKeys` | `string[] \| undefined` | `undefined` | 受控展开 key |
| `defaultExpandedKeys` | `string[]` | `[]` | 非受控初始展开 |
| `disabled` | `boolean` | `false` | 整体禁用 |

## Emits

- `update:selectedKeys`
- `update:expandedKeys`
- `select`
- `expand`

## 当前边界

- 已覆盖：单选树、展开 / 收起、受控 / 非受控、禁用节点阻断、基础方向键导航。
- 暂不支持：`checkable`、多选、异步懒加载、拖拽、虚拟滚动。
