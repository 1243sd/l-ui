# ConfigProvider

`LConfigProvider` wires global component config and theme application.

## Example
```vue
<template>
  <LConfigProvider theme-mode="dark" component-size="large">
    <LButton type="primary">Dark</LButton>
  </LConfigProvider>
</template>
```

## Props
| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `prefixCls` | `string` | `'l'` | Prefix for css class generation |
| `componentSize` | `'small' \| 'middle' \| 'large'` | `'middle'` | Shared default size |
| `themeMode` | `'light' \| 'dark'` | `'light'` | Theme mode |
| `themeOverrides` | `DeepPartial<Tokens>` | `{}` | Runtime token overrides |
| `autoApplyTheme` | `boolean` | `true` | Auto apply CSS vars to root |

## Compatibility Notes
- Aligned: Provider pattern and global size inheritance.
- Difference: locale/direction/form validate messages are planned for M1+.
