# Avatar

`LAvatar` 是 M3 的头像基础件，先统一图片、回退文本、尺寸和形状，让后面的列表与表格可以直接复用。

## 示例
```vue
<template>
  <LSpace wrap :size="[12, 12]">
    <LAvatar src="data:image/svg+xml;utf8,..." alt="演示头像" />
    <LAvatar size="small" fallback-text="露" />
    <LAvatar fallback-text="莉塔" />
    <LAvatar size="large" shape="square" fallback-text="UI" />
  </LSpace>
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string \| undefined` | `undefined` | 图片地址 |
| `alt` | `string \| undefined` | `undefined` | 图片替代文案 |
| `size` | `'small' \| 'middle' \| 'large' \| undefined` | `undefined` | 尺寸；默认继承全局 `componentSize` |
| `shape` | `'circle' \| 'square'` | `'circle'` | 外形 |
| `fallbackText` | `string \| undefined` | `undefined` | 无图时的回退文本 |

## Slots

| 名称 | 说明 |
| --- | --- |
| `default` | 自定义回退内容；优先级高于 `fallbackText` |

## 当前已覆盖

- 图片头像模式。
- 文本 / slot 回退。
- `small / middle / large` 尺寸。
- `circle / square` 形状。

## 当前未覆盖

- 图片加载失败后的自动切换。
- `Avatar.Group`。
- icon 头像与徽标角标。

## 兼容说明

- 当前只保留最常用的图片 / 文本头像主路径，不提前扩展群组能力。
- `size` 默认走全局 `componentSize`，和其他基础组件的尺寸继承策略保持一致。
