# Space

`LSpace` provides horizontal/vertical spacing containers for quick layout composition.

## Example
```vue
<template>
  <LSpace size="middle">
    <LButton>One</LButton>
    <LButton>Two</LButton>
  </LSpace>
</template>
```

## Props
| Prop | Type | Default |
| --- | --- | --- |
| `size` | `'small' \| 'middle' \| 'large' \| number \| [x,y]` | `'small'` |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` |
| `align` | `'start' \| 'end' \| 'center' \| 'baseline'` | `'center'` |
| `wrap` | `boolean` | `false` |

## Slots
- `default`
- `split`
