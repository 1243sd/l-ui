# Upload

`LUpload` 是 M4 的按钮触发上传基线，先把 `fileList`、`beforeUpload`、`customRequest`、`maxCount` 和移除链路打稳。

## 示例
```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { UploadFile } from '@lolita-ui/components-vue';

const fileList = ref<UploadFile[]>([]);
</script>

<template>
  <LUpload
    v-model:fileList="fileList"
    :max-count="3"
    button-text="选择文件"
  />
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `fileList` | `UploadFile[] \| undefined` | `undefined` | 受控文件列表 |
| `defaultFileList` | `UploadFile[]` | `[]` | 非受控初始列表 |
| `accept` | `string \| undefined` | `undefined` | 原生 accept |
| `multiple` | `boolean` | `false` | 是否允许多选 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `maxCount` | `number \| undefined` | `undefined` | 最大文件数 |
| `beforeUpload` | `(file) => boolean \| Promise<boolean>` | `undefined` | 上传前拦截 |
| `customRequest` | `(options) => void` | `undefined` | 自定义上传请求 |
| `buttonText` | `string` | `'Select file'` | 触发按钮文案 |

## Emits

- `update:fileList`
- `change`
- `remove`

## 当前边界

- 已覆盖：受控 / 非受控 `fileList`、`beforeUpload`、`customRequest`、`maxCount`、移除、禁用。
- 暂不支持：拖拽上传、图片墙、目录上传、分片上传、预览与裁剪。
