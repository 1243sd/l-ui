# Table

`LTable` is the M7 data-workflow baseline table. It now supports the M3 display surface plus the minimum workflow primitives needed by `ProSearchTable`: single-column sorting and checkbox row selection.

## Example

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { TableSortState } from '@lolita-ui/components-vue';

const sortState = ref<TableSortState | undefined>(undefined);
const selectedRowKeys = ref<Array<string | number>>([]);

const columns = [
  { key: 'name', title: 'Member', dataIndex: 'name', sortable: true },
  { key: 'role', title: 'Role', dataIndex: 'role' }
];

const dataSource = [
  { id: 'u-1', name: 'Alice', role: 'Designer' },
  { id: 'u-2', name: 'Derek', role: 'Engineer' }
];
</script>

<template>
  <LTable
    :columns="columns"
    :data-source="dataSource"
    row-key="id"
    :sort-state="sortState"
    :row-selection="{ selectedRowKeys }"
    :pagination="{ current: 1, pageSize: 10, total: dataSource.length }"
    @update:sort-state="sortState = $event"
    @update:selected-row-keys="selectedRowKeys = $event"
  />
</template>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `columns` | `TableColumn[]` | `[]` | Column definitions. |
| `dataSource` | `Record<string, unknown>[]` | `[]` | Row data. |
| `rowKey` | `string \| ((record, index) => string \| number) \| undefined` | `undefined` | Primitive row key resolver. |
| `loading` | `boolean` | `false` | Loading state. |
| `emptyText` | `string` | `'暂无数据'` | Default empty copy. |
| `pagination` | `false \| TablePaginationConfig` | `false` | Built-in pagination config. |
| `sortState` | `TableSortState \| undefined` | `undefined` | Controlled single-column sort state. |
| `defaultSortState` | `TableSortState \| undefined` | `undefined` | Uncontrolled sort state seed. |
| `rowSelection` | `TableRowSelection \| undefined` | `undefined` | Checkbox selection config. |

## Events

- `update:sortState`
- `sortChange`
- `update:selectedRowKeys`
- `selectionChange`

## Covered In M7

- Base table rendering, loading, empty states, and body-cell slots.
- Built-in pagination using `LPagination`.
- Single-column sort cycle: `undefined -> ascend -> descend -> undefined`.
- Current-page checkbox selection with disabled-row skipping.
- Controlled and uncontrolled selection state.
- Accessible labels for the select-all control and row selection controls.

## Explicitly Out Of Scope

- Column filters and filter dropdowns.
- Multi-column sorting.
- Expandable rows, tree tables, fixed columns, and virtual scrolling.
- Dot-path `rowKey` resolution and complex nested `dataIndex` parsing.

## Compatibility Notes

- `LTable` remains a lightweight workflow-ready table, not a full ProTable clone.
- Sorting only exposes state and interaction affordance. It does not mutate `dataSource` internally.
- `preserveSelectedRowKeys` is opt-in and defaults to `false` for safer CRUD behavior.
