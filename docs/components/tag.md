# Tag

`LTag` 是 M3 的轻量状态标签，先覆盖语义色、描边开关和圆角胶囊形态，给后续的 `Table / List` 提供统一的状态原子。

## 示例
```vue
<template>
  <LSpace wrap :size="[10, 10]">
    <LTag>默认</LTag>
    <LTag color="primary">进行中</LTag>
    <LTag color="success">已通过</LTag>
    <LTag color="warning">待确认</LTag>
    <LTag color="danger">已阻塞</LTag>
    <LTag color="primary" :bordered="false" round>轻可爱</LTag>
  </LSpace>
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `color` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | 语义色 |
| `bordered` | `boolean` | `true` | 是否显示描边 |
| `round` | `boolean` | `false` | 是否使用胶囊圆角 |

## Slots

| 名称 | 说明 |
| --- | --- |
| `default` | 标签内容 |

## 当前已覆盖

- 默认标签渲染。
- 语义色切换。
- `bordered` 与 `round` 组合。

## 当前未覆盖

- `closable`。
- 自定义任意颜色输入。
- 图标位、可编辑标签。

## 兼容说明

- 当前只做语义色标签，不提前猜 `closable` 或任意颜色字符串。
- 颜色全部走 token 体系，后续扩展时也应沿用同一条语义链路。
