# ProSearchTable

`ProSearchTable` is the M5 Pro surface for schema-driven search plus linked table results.

What it now locks in:
- `searchSchema` supports `text`, `select`, `date`, and `cascader`
- `request` receives both raw `formValues` and serialized `queryValues`
- `beforeQuery` may adjust `pagination.current / pageSize`, and the rendered table meta follows the adjusted request state
- text fields update immediately but only query on explicit submit or `Enter`
- row identity defaults to primitive `id`, otherwise `rowKey` is required
- row actions refresh on success by default and may opt out with `refreshOnSuccess: false`
- query failures keep previous rows visible and expose a retry path

## Example

```vue
<script setup lang="ts">
import { ProSearchTable } from '@lolita-ui/pro-vue';

const columns = [
  { key: 'name', title: 'Name', dataIndex: 'name' },
  { key: 'releasedAt', title: 'Released', dataIndex: 'releasedAt' }
];

const searchSchema = [
  {
    name: 'keyword',
    label: 'Keyword',
    type: 'text',
    inputProps: { allowClear: true }
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { label: 'Designer', value: 'designer' },
      { label: 'Engineer', value: 'engineer' }
    ],
    selectProps: { allowClear: true }
  },
  {
    name: 'releasedAt',
    label: 'Released At',
    type: 'date',
    datePickerProps: { allowClear: true }
  }
];

const request = async ({ pagination, formValues, queryValues }) => {
  console.log(formValues, queryValues);

  return {
    data: [
      {
        id: 'demo-1',
        name: String(queryValues.keyword ?? 'Demo row'),
        releasedAt: String(queryValues.releasedAt ?? '2026-05-26')
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
    :initial-pagination="{ current: 1, pageSize: 10, total: 0 }"
  />
</template>
```

## Search Schema

| Field kind | Required | Supported M5 extras |
| --- | --- | --- |
| `text` | `name`, `label`, `type` | `defaultValue`, `placeholder`, `width`, `inputProps.allowClear`, `toQuery` |
| `select` | `name`, `label`, `type`, `options` | `defaultValue`, `placeholder`, `width`, `selectProps.allowClear`, `selectProps.showSearch`, `selectProps.loading`, `selectProps.notFoundContent`, `toQuery` |
| `date` | `name`, `label`, `type` | `defaultValue`, `placeholder`, `width`, `datePickerProps.allowClear`, `datePickerProps.format`, `toQuery` |
| `cascader` | `name`, `label`, `type`, `options` | `defaultValue`, `placeholder`, `width`, `cascaderProps.allowClear`, `toQuery` |

`toQuery` is optional per field. If omitted, the default query contribution is `{ [name]: value }`.

Duplicate serialized query keys are invalid M5 configuration. The component warns in development and blocks the request rather than silently overwriting values.

## Request Contract

`request`, `beforeQuery`, and `afterQuery` all work with two payload layers:

- `formValues`: raw UI state keyed by schema field name
- `queryValues`: serialized request payload after field-level shaping

This keeps the UI contract stable even when the outgoing request shape differs from displayed field values. When `beforeQuery` adjusts `pagination.current` or `pageSize`, the rendered pagination meta follows the adjusted request state instead of staying on stale local values.

## Row Identity And Actions

- `rowKey?: string | ((record, index) => string | number)` is supported
- if `rowKey` is omitted, `ProSearchTable` uses row `id` only when every row exposes a primitive `id`
- if neither condition is met, the component warns and blocks row rendering

Row actions support:

- `visible`
- `disabled`
- `loading`
- `refreshOnSuccess`

Toolbar and row-action slots receive `refresh` in slot context so custom actions can trigger a clean re-query without reaching into internals.

## Default Interaction Semantics

- `autoQuery` defaults to `true`
- typing in text fields does not auto-query
- clicking the primary search action or pressing `Enter` in a text field triggers a query
- reset restores schema defaults, resets pagination to page 1, and re-queries
- lifecycle-adjusted pagination stays aligned between the outgoing request and the rendered table meta
- loading keeps previous rows visible
- query failure keeps previous rows visible and shows a retry action

## Compatibility Notes

- Aligned: four-field `searchSchema`, `formValues/queryValues` layering, retry pipeline integration, real pagination widget, default `id` row identity, action refresh control, and deterministic playground/browser-gate coverage
- Difference: M5 does not include `dateRange`, inline edit, column pinning, drag sorting, preset persistence, or remote field builders
