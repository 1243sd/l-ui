# ProSearchTable

`ProSearchTable` is a schema + slots hybrid business component:
- top search area
- bottom linked data table
- built-in lifecycle + retry + pagination sync

## Example
```vue
<script setup lang="ts">
import { ProSearchTable } from '@lolita-ui/pro-vue';

const columns = [{ key: 'name', title: 'Name', dataIndex: 'name' }];
const searchSchema = [{ name: 'keyword', label: 'Keyword', type: 'text' }];
const request = async ({ pagination, formValues }) => {
  return { data: [{ name: formValues.keyword || 'Demo' }], total: 1 };
};
</script>

<template>
  <ProSearchTable
    :columns="columns"
    :search-schema="searchSchema"
    :request="request"
  />
</template>
```

## Core Props
| Prop | Type | Notes |
| --- | --- | --- |
| `columns` | `ProTableColumn[]` | Table column schema |
| `searchSchema` | `SearchFieldSchema[]` | Search form schema |
| `request` | `ProSearchTableRequest` | Data loader |
| `lifecycle` | `beforeQuery/transform/afterQuery` | Query lifecycle hooks |
| `rowActions` | `ProRowAction[]` | Row-level quick actions |
| `toolbar` | `ProToolbarAction[]` | Header tools |
| `retries` | `number` | Retry count |
| `retryDelay` | `number` | Retry delay(ms) |

## Emits
- `update:pagination`
- `data-loaded`
- `request-error`

## Compatibility Notes
- Aligned: Search + table linkage and lifecycle hooks.
- Difference: M0 uses lightweight prev/next pagination UI.
- Difference: M0 schema only supports `text/select`.
