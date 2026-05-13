# Button

`LButton` keeps AntD-like common controls while using Lolita token styles.

## Example
```vue
<template>
  <LButton type="primary">Primary</LButton>
  <LButton type="dashed">Dashed</LButton>
  <LButton type="text">Text</LButton>
</template>
```

## Props
| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `type` | `'default' \| 'primary' \| 'dashed' \| 'text' \| 'link'` | `'default'` | AntD-aligned |
| `size` | `'small' \| 'middle' \| 'large'` | inherited | Inherits `ConfigProvider` |
| `danger` | `boolean` | `false` | Danger style |
| `loading` | `boolean` | `false` | Blocks click emit |
| `disabled` | `boolean` | `false` | Native disabled |
| `block` | `boolean` | `false` | Full width |
| `round` | `boolean` | `false` | M0 shape simplification |

## Emits
- `click`

## Compatibility Notes
- Aligned: main `type`, `size`, `loading`, `danger`, `disabled`, `block`.
- Difference: M0 uses `round` boolean instead of full `shape` enum.
