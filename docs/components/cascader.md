# Cascader

`LCascader` 是 M4 的单路径级联选择基线，当前只保留列式路径选择、清空、禁用和表单错误态联动。

## 示例
```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { CascaderOption } from '@lolita-ui/components-vue';

const value = ref<string[] | undefined>();
const options: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      {
        value: 'hangzhou',
        label: '杭州',
        children: [{ value: 'xihu', label: '西湖区' }]
      }
    ]
  }
];
</script>

<template>
  <LCascader
    v-model:value="value"
    :options="options"
    allow-clear
    placeholder="请选择城市路径"
  />
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string[] \| undefined` | `undefined` | 受控路径值 |
| `defaultValue` | `string[]` | `[]` | 非受控初始路径 |
| `options` | `CascaderOption[]` | `[]` | 级联选项 |
| `placeholder` | `string` | `'Select option'` | 占位文案 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `allowClear` | `boolean` | `false` | 是否允许清空 |
| `status` | `'default' \| 'warning' \| 'error'` | `'default'` | 状态样式 |
| `size` | `'small' \| 'middle' \| 'large'` | 继承 | 组件尺寸 |

## Emits

- `update:value`
- `change`
- `openChange`
- `focus`
- `blur`

## 当前边界

- 已覆盖：单路径级联选择、受控 / 非受控、清空、禁用、状态反馈、FormItem 错误态联动。
- 暂不支持：多选、搜索、远程懒加载、复杂异步面板行为。
