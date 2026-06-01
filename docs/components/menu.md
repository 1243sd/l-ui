# Menu

`LMenu` 是 M2 的单层导航菜单基线，覆盖垂直 / 水平两种方向和 roving focus 键盘游走。

## 示例
```vue
<script setup lang="ts">
import { ref } from 'vue';

const selectedKeys = ref(['overview']);
const items = [
  { key: 'overview', label: '总览' },
  { key: 'team', label: '团队' },
  { key: 'archive', label: '归档', disabled: true }
];
</script>

<template>
  <LMenu v-model:selectedKeys="selectedKeys" :items="items" />
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `MenuItem[]` | `[]` | 单层菜单项 |
| `selectedKeys` | `string[] \| undefined` | `undefined` | 受控选中项 |
| `defaultSelectedKeys` | `string[]` | `[]` | 非受控初始选中项 |
| `mode` | `'vertical' \| 'horizontal'` | `'vertical'` | 方向模式 |

`MenuItem` 结构：

```ts
type MenuItem = {
  key: string;
  label: string;
  disabled?: boolean;
};
```

## Emits

- `update:selectedKeys`
- `select`

## 当前已覆盖

- 单层 `items` 导航。
- 垂直模式 `ArrowUp / ArrowDown`。
- 水平模式 `ArrowLeft / ArrowRight`。
- `Home / End / Enter / Space`。
- disabled 项跳过和阻断选中。

## 当前未覆盖

- `SubMenu`、多层嵌套、折叠态。
- `multiple` 选中模式。
- `openKeys`、内联展开动画、图标位。

## 兼容说明

- 当前只保留 M2 需要的单选路径，适合作为 `Dropdown` 的菜单内核复用。
- `selectedKeys` 对外仍是数组格式，但内部只维护单选语义；这是为了先与 AntD 常见签名保持接近，同时避免提前引入多选复杂度。
