# Table

`LTable` 是 M3 的基础数据表格，当前只覆盖 `columns / dataSource / rowKey / loading / empty / pagination` 这条主链路，不提前混入排序、筛选和选择态复杂度。

## 示例
```vue
<script setup lang="ts">
const columns = [
  { key: 'name', title: '成员', dataIndex: 'name' },
  { key: 'role', title: '角色', dataIndex: 'role', align: 'center' },
  { key: 'city', title: '城市', dataIndex: 'city', align: 'right' }
];

const dataSource = [
  { id: 1, name: '成员 1', role: '设计师', city: '上海' }
];
</script>

<template>
  <LTable
    :columns="columns"
    :data-source="dataSource"
    row-key="id"
    :pagination="{ defaultCurrent: 1, pageSize: 5, total: dataSource.length }"
  />
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `columns` | `TableColumn[]` | `[]` | 列定义 |
| `dataSource` | `Record<string, unknown>[]` | `[]` | 行数据 |
| `rowKey` | `string \| ((record, index) => string \| number) \| undefined` | `undefined` | 行 key |
| `loading` | `boolean` | `false` | 加载态 |
| `emptyText` | `string` | `'暂无数据'` | 默认空状态文案 |
| `pagination` | `false \| TablePaginationConfig` | `false` | 内建分页配置 |

`TableColumn` 最小结构：

```ts
type TableColumn = {
  key: string;
  title: string;
  dataIndex?: string;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
};
```

## Slots

| 名称 | 说明 |
| --- | --- |
| `bodyCell` | 自定义单元格内容，参数包含 `column / record / index / value` |
| `empty` | 自定义空状态 |

## 当前已覆盖

- 基础表头和行渲染。
- `rowKey` 字符串 / 函数。
- `loading`、默认空状态与 `empty` slot。
- `bodyCell` 自定义单元格。
- 内建分页联动。

## 当前未覆盖

- `rowSelection`、`sorter`、`filters`、`expandable`。
- 固定列、虚拟滚动、拖拽列。
- 点号路径 `rowKey` 与复杂 dataIndex 解析。

## 兼容说明

- 当前 `Table` 是“基础展示表格”而不是“全功能表格”，不会为了看起来完整而提前扩 scope。
- `pagination` 只复用现有 `LPagination` 状态机，不单独长另一套页码实现。
