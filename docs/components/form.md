# Form / FormItem

`LForm` and `LFormItem` provide a lightweight validation flow for M1.

## Example
```vue
<script setup lang="ts">
import { reactive } from 'vue';

const model = reactive({ name: '' });
const rules = {
  name: [{ required: true, message: 'Name is required' }]
};
</script>

<template>
  <LForm :model="model" :rules="rules">
    <LFormItem label="Name" name="name">
      <LInput v-model:value="model.name" />
    </LFormItem>
    <button type="submit">Submit</button>
  </LForm>
</template>
```

## Form Props
| Prop | Type | Notes |
| --- | --- | --- |
| `model` | `Record<string, unknown>` | Form data source |
| `rules` | `Record<string, FormRule[]>` | Validation rules by field |

## FormItem Props
| Prop | Type | Notes |
| --- | --- | --- |
| `name` | `string` | Field key in model |
| `label` | `string` | Display label |
| `required` | `boolean` | Adds required rule |
| `help` | `string` | Help text / fallback message |
