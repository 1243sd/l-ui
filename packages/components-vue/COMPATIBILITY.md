# @lolita-ui/components-vue Compatibility Notes (M0)

## ConfigProvider
- Aligned: `theme-mode` (`light`/`dark`) and provider-slot pattern.
- Difference: currently only exposes `prefixCls` and `componentSize` global config; no locale/direction/validation-message config yet.

## ThemeProvider
- Aligned: theme provider wrapper and `mode/overrides/autoApply` concept.
- Difference: wrapper delegates to `@lolita-ui/theme` and does not add nested theme scopes per subtree yet.

## Button (`LButton`)
- Aligned: `type` (`default|primary|dashed|text|link`), `size`, `danger`, `loading`, `disabled`, `block`, click emit.
- Difference: uses `round` boolean instead of full AntD `shape` enum in M0.

## Space (`LSpace`)
- Aligned: `size`, `direction`, `align`, `wrap`, `split` slot.
- Difference: no compact-mode and no item-level style override prop in M0.
