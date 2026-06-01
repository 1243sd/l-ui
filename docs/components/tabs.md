# Tabs

`LTabs` 是 M2 的页签导航基线实现，当前同时支持 `items` 模式、`LTabPane` 模式，以及按 key 的内容插槽。

## 示例

### `items` 模式
```vue
<script setup lang="ts">
import { ref } from 'vue';

const activeKey = ref('overview');
const items = [
  { key: 'overview', label: '总览' },
  { key: 'detail', label: '详情' },
  { key: 'archive', label: '归档', disabled: true }
];
</script>

<template>
  <LTabs v-model:activeKey="activeKey" :items="items">
    <template #pane-overview>总览面板</template>
    <template #pane-detail>详情面板</template>
  </LTabs>
</template>
```

### `LTabPane` 模式
```vue
<template>
  <LTabs defaultActiveKey="timeline" destroyInactiveTabPane>
    <LTabPane key="timeline" tab="时间线">
      时间线内容
    </LTabPane>
    <LTabPane key="assets" tab="素材库">
      素材库内容
    </LTabPane>
  </LTabs>
</template>
```

## `LTabs` Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `activeKey` | `string \| undefined` | `undefined` | 受控激活 key |
| `defaultActiveKey` | `string \| undefined` | `undefined` | 非受控初始激活 key |
| `items` | `TabsItem[]` | `[]` | `items` 模式的数据源 |
| `destroyInactiveTabPane` | `boolean` | `false` | 关闭后销毁非激活面板 |

`TabsItem` 结构：

```ts
type TabsItem = {
  key: string;
  label: string;
  disabled?: boolean;
};
```

## `LTabPane` Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `tab` | `string` | `''` | 页签标题 |
| `tabKey` | `string \| undefined` | `undefined` | 当 VNode key 不方便时可显式传入 |
| `disabled` | `boolean` | `false` | 禁用页签 |

## Slots

| 名称 | 说明 |
| --- | --- |
| `default` | `LTabPane` 模式下传入面板内容 |
| `pane-${key}` | `items` 模式下，为指定 key 提供面板内容 |
| `tab` | `LTabPane` 内部可选标题插槽 |

## Emits

- `update:activeKey`
- `change`

## 当前已覆盖

- `items + pane-${key}` 的轻量模式。
- `LTabPane` 的结构化模式。
- `ArrowLeft / ArrowRight / Home / End` 键盘切换。
- 跳过 disabled tab。
- `destroyInactiveTabPane` 面板销毁策略。

## 当前未覆盖

- 可编辑/可关闭标签页。
- 垂直 tabs、卡片 tabs、额外操作区。
- 动画、墨条、滚动溢出处理。

## 兼容说明

- 与 ant-design-vue 的核心选中和键盘路径基本对齐。
- 如果同时传 `items` 和 `LTabPane`，当前会给出 warning，并优先按 `LTabPane` 渲染；这是当前的明确边界，不做静默合并。
