# Badge

`LBadge` 是 M3 的轻量状态徽标，先覆盖状态点、状态文案和带内容包裹的基础路径，不把数字计数过早混进来。

## 示例
```vue
<template>
  <LSpace direction="vertical" align="start" :size="10">
    <LBadge status="processing" text="部署中" />
    <LBadge status="success" text="校验通过" />
    <LBadge status="warning" text="等待确认" />
    <LBadge status="error" text="回滚中" />
    <LBadge status="processing" dot>
      <LButton type="text">待处理消息</LButton>
    </LBadge>
  </LSpace>
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `status` | `'default' \| 'processing' \| 'success' \| 'warning' \| 'error'` | `'default'` | 语义状态 |
| `text` | `string \| undefined` | `undefined` | 状态文案 |
| `dot` | `boolean` | `false` | 是否只显示状态点 |

## Slots

| 名称 | 说明 |
| --- | --- |
| `default` | 被徽标包裹的内容 |

## 当前已覆盖

- 语义状态 class。
- `dot` 状态点模式。
- 文本文案展示。
- default slot 包裹内容。

## 当前未覆盖

- `count / overflowCount` 数字徽标。
- `Ribbon`。
- 动态动画与更复杂的内容布局。

## 兼容说明

- 当 `dot=true` 时，当前优先展示状态点，不再同时渲染文本。
- 当前聚焦“状态徽标”，不伪装成完整的数字通知体系。
