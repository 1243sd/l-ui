# Input

`LInput` is the M1 core text input with AntD-friendly `v-model:value` behavior.

## Example
```vue
<template>
  <LInput v-model:value="name" allow-clear placeholder="Your name" />
</template>
```

## Props
| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `string \| number` | `undefined` | Controlled mode |
| `defaultValue` | `string \| number` | `''` | Uncontrolled initial value |
| `size` | `'small' \| 'middle' \| 'large'` | inherited | Inherits `ConfigProvider` |
| `status` | `'default' \| 'error' \| 'warning'` | `'default'` | Status style |
| `disabled` | `boolean` | `false` | Disabled input |
| `allowClear` | `boolean` | `false` | Show clear button |
| `placeholder` | `string` | `undefined` | Placeholder text |

## Emits
- `update:value`
- `change` (value, event)
- `focus`
- `blur`
