# Drawer

`LDrawer` 是 M2 的抽屉基线实现，复用 `Modal` 的阻断式焦点和滚动策略，当前覆盖左右抽屉、Esc / 遮罩关闭，以及 `teleported` 控制。

## 示例
```vue
<script setup lang="ts">
import { ref } from 'vue';

const open = ref(false);
</script>

<template>
  <LButton @click="open = true">打开抽屉</LButton>

  <LDrawer
    v-model:open="open"
    title="团队设置"
    placement="right"
  >
    抽屉内容
  </LDrawer>
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean \| undefined` | `undefined` | 受控开关 |
| `defaultOpen` | `boolean` | `false` | 非受控初始开关 |
| `title` | `string` | `''` | 标题 |
| `placement` | `'left' \| 'right'` | `'right'` | 抽屉方向 |
| `closable` | `boolean` | `true` | 是否显示关闭按钮 |
| `maskClosable` | `boolean` | `true` | 点击遮罩是否关闭 |
| `keyboard` | `boolean` | `true` | 是否允许 `Escape` 关闭 |
| `width` | `number \| string` | `420` | 抽屉宽度 |
| `teleported` | `boolean` | `true` | `true` 时挂载到 `document.body` |

## Emits

- `update:open`
- `openChange`
- `close`

## Slots

| 名称 | 说明 |
| --- | --- |
| `default` | 抽屉主体内容 |

## 当前已覆盖

- `left / right` 两个方向。
- 焦点进入抽屉、关闭后回到触发器。
- body 滚动锁定与恢复。
- `maskClosable`、`keyboard`、关闭按钮。
- `teleported=true/false`。

## 当前未覆盖

- `top / bottom` 抽屉。
- 多层抽屉堆叠和 push 行为。
- 尺寸变体、额外操作区、自定义 footer。

## 兼容说明

- 当前刻意只做左右抽屉，避免在 M2 里把四向布局和尺寸系统一起拉进来。
- `Drawer` 与 `Modal` 共用阻断式浮层规则，但事件名保持 `close`，便于和抽屉语义对齐。
