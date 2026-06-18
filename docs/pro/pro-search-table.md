# ProSearchTable

`ProSearchTable` is the M7 workflow surface for schema-driven CRUD search, table sorting, row selection, and bulk operations.

## What M7 Locks In

- `searchSchema` supports `text`, `select`, `date`, `dateRange`, and `cascader`.
- Request payloads carry both `formValues` and serialized `queryValues`.
- `sortState` is part of `request`, `beforeQuery`, and `afterQuery` payloads.
- `rowSelection` supports controlled and uncontrolled checkbox selection.
- `bulkActions` use selected rows as first-class context and refresh plus clear selection by default.
- Query failures keep previous rows visible and expose an explicit retry action.

## Example

```vue
<script setup lang="ts">
import {
  ProSearchTable,
  StatusTag,
  defineValueEnum,
  resolveValueEnumText
} from '@lolita-ui/pro-vue';

const memberStatusValueEnum = defineValueEnum({
  active: { text: 'Active', tone: 'success', icon: 'check' },
  processing: { text: 'Processing', tone: 'primary', icon: 'clock' },
  archived: { text: 'Archived', tone: 'default', icon: 'pause' }
});

const columns = [
  { key: 'name', title: 'Name', dataIndex: 'name', sortable: true },
  { key: 'status', title: 'Status', dataIndex: 'status' },
  { key: 'releasedAt', title: 'Released At', dataIndex: 'releasedAt', sortable: true }
];

const searchSchema = [
  {
    name: 'keyword',
    label: 'Keyword',
    type: 'text',
    inputProps: { allowClear: true }
  },
  {
    name: 'window',
    label: 'Release Window',
    type: 'dateRange',
    dateRangePickerProps: { allowClear: true }
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: Object.keys(memberStatusValueEnum).map((value) => ({
      label: resolveValueEnumText(value, memberStatusValueEnum),
      value
    }))
  }
];

const request = async ({ queryValues, sortState, pagination }) => {
  console.log(queryValues, sortState, pagination);

  return {
    data: [
      {
        id: 'demo-1',
        name: 'Demo row',
        status: 'processing',
        releasedAt: '2026-06-17'
      }
    ],
    total: 1
  };
};
</script>

<template>
  <ProSearchTable
    :columns="columns"
    :search-schema="searchSchema"
    :request="request"
    :row-selection="{}"
    :bulk-actions="[
      {
        key: 'archive',
        label: 'Archive',
        onClick: async ({ selectedRowKeys }) => console.log(selectedRowKeys)
      }
    ]"
  >
    <template #cell-status="{ row }">
      <StatusTag :value="row.status" :value-enum="memberStatusValueEnum" />
    </template>
  </ProSearchTable>
</template>
```

## Search Schema

| Field kind | Required | Supported extras |
| --- | --- | --- |
| `text` | `name`, `label`, `type` | `defaultValue`, `placeholder`, `width`, `inputProps.allowClear`, `toQuery` |
| `select` | `name`, `label`, `type`, `options` | `defaultValue`, `placeholder`, `width`, `selectProps.allowClear`, `selectProps.showSearch`, `selectProps.loading`, `selectProps.notFoundContent`, `toQuery` |
| `date` | `name`, `label`, `type` | `defaultValue`, `placeholder`, `width`, `datePickerProps.allowClear`, `datePickerProps.format`, `toQuery` |
| `dateRange` | `name`, `label`, `type` | `defaultValue`, `placeholder`, `width`, `dateRangePickerProps.allowClear`, `dateRangePickerProps.format`, `toQuery` |
| `cascader` | `name`, `label`, `type`, `options` | `defaultValue`, `placeholder`, `width`, `cascaderProps.allowClear`, `toQuery` |

Default serialization remains `{ [name]: value }`. If product code needs a split payload such as `startAt` / `endAt`, provide a field-level `toQuery`.

## Request Contract

`request`, `beforeQuery`, and `afterQuery` all operate on the same stable payload layers:

- `formValues`: raw UI state keyed by field name
- `queryValues`: serialized payload after field shaping
- `pagination`: current request pagination
- `sortState`: current single-column sort state

This keeps outgoing request shape changes separate from the UI form contract.

## Selection And Bulk Actions

- `rowSelection` mirrors `LTable` checkbox selection semantics.
- `preserveSelectedRowKeys` defaults to `false`.
- Querying, paging, and sorting clear invisible selections by default.
- `bulkActions.refreshOnSuccess` defaults to `true`.
- `bulkActions.clearSelectionOnSuccess` defaults to `true`.
- Toolbar and bulk-action contexts expose `refresh`, `selectedRowKeys`, `selectedRows`, `clearSelection`, and `sortState`.

## Reusable Building Blocks

`ProSearchTable` is still the main page-level workflow surface, but its highest-frequency list glue now maps to reusable List Pack building blocks:

- `ProQueryFilter`: owns the schema-driven query area and keeps the same `searchSchema` contract.
- `ProBatchActionBar`: owns selected-count copy, disabled states, pending states, and success refresh / clear-selection behavior for bulk actions.
- `StatusTag` + `ValueEnum`: intended for shared list-cell and filter-display semantics, so teams do not hand-roll status text plus color mappings on every page.

This means teams can either use `ProSearchTable` as the full workflow surface or gradually reuse the same list contracts in custom list pages without inventing a second vocabulary.

## Default Interaction Semantics

- `autoQuery` defaults to `true`.
- Typing in text fields does not auto-query.
- `Enter` in a text field and the primary search button both trigger a query.
- Reset restores schema defaults, moves pagination back to page 1, and re-queries.
- Loading keeps old rows visible.
- Failure keeps old rows visible and shows a retry path.

## Compatibility Notes

- Aligned: `dateRange`, `sortState`, `rowSelection`, `bulkActions`, retry pipeline, deterministic playground scenarios, and browser-gate coverage.
- Difference: M7 still does not include inline editing, column pinning, drag sorting, saved views, remote schema builders, or multi-column sorting.
