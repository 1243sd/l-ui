# Tooltip

`LTooltip` 提供 M2 的轻量提示浮层，覆盖 `hover / focus` 触发、四向 placement，以及 `teleported` 挂载策略。

## 示例
```vue
<template>
  <LTooltip title="这是提示文案" placement="top">
    <button type="button">查看提示</button>
  </LTooltip>
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | `''` | 提示文案 |
| `open` | `boolean \| undefined` | `undefined` | 受控开关 |
| `defaultOpen` | `boolean` | `false` | 非受控初始开关 |
| `trigger` | `'hover' \| 'focus'` | `'hover'` | 触发方式 |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | 展示方向 |
| `disabled` | `boolean` | `false` | 禁用提示 |
| `teleported` | `boolean` | `true` | `true` 时挂载到 `document.body` |

## Emits

- `update:open`
- `openChange`

## Slots

| 名称 | 说明 |
| --- | --- |
| `default` | 触发器内容 |

## 当前已覆盖

- `hover` 打开 / 关闭。
- `focus` 打开 / 关闭。
- `aria-describedby` 关联。
- `teleported=true/false` 两种挂载策略。

## 当前未覆盖

- 点击触发。
- 自动翻转、碰撞检测、箭头定制。
- 富文本标题或复杂 overlay 内容。

## 兼容说明

- `teleported` 默认值为 `true`，更贴近真实业务里的防裁剪需求。
- 当前只做四向定位，不猜测复杂布局下的自动避让行为；如需扩展，应单独作为后续能力项规划。
