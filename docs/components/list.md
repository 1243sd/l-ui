# List

`LList` 是 M3 的纵向列表容器，当前只覆盖 `dataSource / loading / empty / split` 和 `renderItem / empty` 两个插槽，适合作为轻量 feed 或摘要列表基线。

## 示例
```vue
<script setup lang="ts">
const dataSource = [
  { id: 1, name: '成员 1', role: '设计师' },
  { id: 2, name: '成员 2', role: '工程师' }
];
</script>

<template>
  <LList :data-source="dataSource" split>
    <template #renderItem="{ item }">
      <div>{{ item.name }} / {{ item.role }}</div>
    </template>
  </LList>
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `dataSource` | `unknown[]` | `[]` | 列表数据 |
| `loading` | `boolean` | `false` | 加载态 |
| `emptyText` | `string` | `'暂无数据'` | 默认空状态文案 |
| `split` | `boolean` | `false` | 是否显示分割线 |

## Slots

| 名称 | 说明 |
| --- | --- |
| `renderItem` | 自定义每一项渲染，参数包含 `item / index` |
| `empty` | 自定义空状态 |

## 当前已覆盖

- 基础列表渲染。
- `renderItem` 自定义内容。
- `loading`、默认空状态与 `empty` slot。
- `split` 分隔线。

## 当前未覆盖

- `grid`、`loadMore`、无限滚动。
- `header / footer / pagination`。
- 复杂 item schema。

## 兼容说明

- 当前 `List` 故意保持“只做容器，不猜业务结构”，主入口是 `renderItem`。
- 这让它可以直接复用 `Avatar / Tag / Badge`，而不是为某种固定卡片样式提前绑死结构。
