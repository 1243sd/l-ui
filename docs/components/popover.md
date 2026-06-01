# Popover

`LPopover` 是可承载轻量内容的浮层，当前覆盖 `click / hover` 触发、标题与内容区、外部点击关闭，以及 `teleported` 控制。

## 示例
```vue
<template>
  <LPopover title="收藏夹" content="把它加入常用面板">
    <button type="button">更多操作</button>
  </LPopover>
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | `''` | 标题文案 |
| `content` | `string` | `''` | 内容文案 |
| `open` | `boolean \| undefined` | `undefined` | 受控开关 |
| `defaultOpen` | `boolean` | `false` | 非受控初始开关 |
| `trigger` | `'click' \| 'hover'` | `'click'` | 触发方式 |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | 展示方向 |
| `disabled` | `boolean` | `false` | 禁用浮层 |
| `teleported` | `boolean` | `true` | `true` 时挂载到 `document.body` |

## Emits

- `update:open`
- `openChange`

## Slots

| 名称 | 说明 |
| --- | --- |
| `default` | 触发器内容 |
| `title` | 自定义标题 |
| `content` | 自定义内容 |

## 当前已覆盖

- `click` 模式再次点击触发器可关闭。
- `hover` 模式的打开 / 关闭。
- 外部点击关闭。
- `teleported=true/false`。

## 当前未覆盖

- 焦点陷阱和复杂表单型内容。
- 多触发模式组合。
- 自动翻转、碰撞检测、延迟开关。

## 兼容说明

- `click` 模式下已覆盖最关键的外部点击关闭契约。
- 当前 `Popover` 的定位和 `Tooltip` 使用同一套浮层位置计算，但没有额外抽象出 arrow 或 collision 层；这是刻意控制范围，避免浮层实现分叉。
