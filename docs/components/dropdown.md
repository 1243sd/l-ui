# Dropdown

`LDropdown` 基于 `LMenu` 与共享浮层状态实现，当前覆盖按钮触发、ArrowDown 进入菜单、选择后关闭，以及 `teleported` 控制。

## 示例
```vue
<script setup lang="ts">
const menuItems = [
  { key: 'copy', label: '复制链接' },
  { key: 'share', label: '分享给团队' }
];
</script>

<template>
  <LDropdown :menuItems="menuItems">
    <button type="button">更多操作</button>
  </LDropdown>
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `menuItems` | `MenuItem[]` | `[]` | 下拉菜单项 |
| `open` | `boolean \| undefined` | `undefined` | 受控开关 |
| `defaultOpen` | `boolean` | `false` | 非受控初始开关 |
| `trigger` | `'click' \| 'hover'` | `'click'` | 触发方式 |
| `placement` | `'bottom' \| 'bottomLeft' \| 'bottomRight'` | `'bottomLeft'` | 展示方向 |
| `disabled` | `boolean` | `false` | 禁用触发 |
| `teleported` | `boolean` | `true` | `true` 时挂载到 `document.body` |

## Emits

- `update:open`
- `openChange`
- `select`

## Slots

| 名称 | 说明 |
| --- | --- |
| `default` | 触发器内容 |

## 当前已覆盖

- `click` / `hover` 打开。
- `ArrowDown` 从 trigger 直接进入首个可用菜单项。
- 复用 `LMenu` 的 disabled 跳过与单选菜单逻辑。
- 选择后默认关闭。
- `teleported=true/false`。

## 当前未覆盖

- `overlay` 自定义渲染。
- 多层菜单、右键菜单、split button。
- 快捷键描述、危险项分组、命令面板式能力。

## 兼容说明

- 当前 `menuItems` 走数据驱动而不是完整 `menu` 配置对象，优先保证最小可维护实现。
- `Dropdown` 已保留最关键的打开、键盘进入、选择回传契约，但没有提前猜测更复杂的菜单体系。
