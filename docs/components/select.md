# Select

`LSelect` 当前支持单选、多选、本地搜索和远程搜索口子。

## 示例
```vue
<script setup lang="ts">
import { ref } from 'vue';

const value = ref<string | undefined>();
const options = [
  { label: '草莓奶霜', value: '草莓奶霜' },
  { label: '香草云朵', value: '香草云朵' }
];
</script>

<template>
  <LSelect
    v-model:value="value"
    :options="options"
    placeholder="请选择"
    show-search
    allow-clear
  />
</template>
```

## 属性
| 属性 | 类型 | 默认值 |
| --- | --- | --- |
| `value` | `string \| number \| Array<string \| number>` | `undefined` |
| `defaultValue` | `string \| number \| Array<string \| number>` | `undefined` |
| `options` | `{ label: string; value: string \| number }[]` | `[]` |
| `mode` | `'multiple'` | `undefined` |
| `showSearch` | `boolean` | `false` |
| `searchValue` | `string \| undefined` | `undefined` |
| `defaultSearchValue` | `string` | `''` |
| `filterOption` | `boolean \| ((input, option) => boolean)` | `true` |
| `loading` | `boolean` | `false` |
| `notFoundContent` | `string` | `'暂无数据'` |
| `disabled` | `boolean` | `false` |
| `placeholder` | `string` | `'请选择'` |
| `allowClear` | `boolean` | `false` |
| `size` | `'small' \| 'middle' \| 'large'` | 继承 |
| `status` | `'default' \| 'error' \| 'warning'` | `'default'` |

## 事件
- `update:value`
- `change`
- `update:searchValue`
- `search`
- `focus`
- `blur`

## 当前边界
- 已覆盖：单选、多选、`showSearch` 本地过滤、`searchValue` 受控、`filterOption=false` 远程搜索口子、`loading`、`notFoundContent`、键盘导航、`FormItem` 状态联动，以及远程结果变化后的高亮项重新同步。
- 未列入本次说明：更复杂的选择器变体、远程数据编排。
