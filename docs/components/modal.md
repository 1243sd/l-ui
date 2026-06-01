# Modal

`LModal` 是 M2 的阻断式浮层基线，覆盖焦点圈定、Esc 关闭、遮罩关闭、`destroyOnClose`，以及 `teleported` 开关。

## 示例
```vue
<script setup lang="ts">
import { ref } from 'vue';

const open = ref(false);
</script>

<template>
  <LButton type="primary" @click="open = true">打开弹窗</LButton>

  <LModal
    v-model:open="open"
    title="发布确认"
    :maskClosable="true"
  >
    请再次确认发布信息。
  </LModal>
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean \| undefined` | `undefined` | 受控开关 |
| `defaultOpen` | `boolean` | `false` | 非受控初始开关 |
| `title` | `string` | `''` | 标题 |
| `closable` | `boolean` | `true` | 是否显示右上角关闭按钮 |
| `maskClosable` | `boolean` | `true` | 点击遮罩是否关闭 |
| `keyboard` | `boolean` | `true` | 是否允许 `Escape` 关闭 |
| `destroyOnClose` | `boolean` | `false` | 关闭后是否销毁内容 |
| `width` | `number \| string` | `560` | 面板宽度 |
| `teleported` | `boolean` | `true` | `true` 时挂载到 `document.body` |

## Emits

- `update:open`
- `openChange`
- `ok`
- `cancel`

## Slots

| 名称 | 说明 |
| --- | --- |
| `default` | 弹窗主体内容 |

## 当前已覆盖

- 焦点进入弹窗、关闭后返回触发器。
- body 滚动锁定与恢复。
- `maskClosable`、`keyboard`、`destroyOnClose`。
- 默认页脚的取消 / 确定行为。
- `teleported=true/false`。

## 当前未覆盖

- 自定义 footer、异步确认、loading 态。
- 多层弹窗堆叠管理。
- 尺寸矩阵、居中策略扩展、动画体系。

## 兼容说明

- 当前 `Modal` 以最小阻断行为正确性优先，先把焦点、Esc、遮罩和滚动锁定打稳。
- footer 仍是内建按钮，不做过早抽象；如果后续业务需要自定义 footer，应在规划里单独确认，而不是在现有 API 上猜测扩展。
