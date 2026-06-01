# M4 复杂组件阶段开发计划（详细执行版）

> 版本：`v1`
> 适用：M3 数据展示完成后，进入高复杂度交互组件阶段。
> 规则：不理解、不合理、需求冲突时，先问用户，不允许自己猜。

## 1. 阶段目标与边界
- 目标组件：
  - `DatePicker`
  - `Upload`
  - `Tree`
  - `Cascader`
  - `Transfer`
- 阶段目标：
  - 建立 M4 高复杂度组件的最小可维护基线，让组件库从“常用表单 + 展示 + 浮层”进入更真实的业务场景。
  - 优先打稳受控 / 非受控、状态同步、空态 / 错误态、键盘与基础可达性，不为了“看起来像全量 AntD”提前引入废代码。
  - 所有复杂组件都必须保留清晰边界，未覆盖能力要明确写进兼容文档。
- 不在本阶段范围：
  - `RangePicker`、复杂时间面板、时区处理、国际化日历体系
  - 拖拽上传、分片上传、图片裁剪、目录上传
  - Tree 的虚拟滚动、拖拽、异步懒加载、多列树表
  - Cascader 的多选、远程搜索、复杂懒加载
  - Transfer 的搜索、分页、树穿梭、表格穿梭、自定义渲染器体系

## 2. 产物清单（文件级）

### 2.1 代码产物
- 新增：
  - `packages/components-vue/src/components/DatePicker.ts`
  - `packages/components-vue/src/components/Upload.ts`
  - `packages/components-vue/src/components/Tree.ts`
  - `packages/components-vue/src/components/Cascader.ts`
  - `packages/components-vue/src/components/Transfer.ts`
- 修改：
  - `packages/components-vue/src/components/index.ts`
  - `packages/components-vue/src/index.ts`
  - `packages/components-vue/src/plugin.ts`
  - `packages/components-vue/src/style.css`

### 2.2 测试产物
- 新增：
  - `packages/components-vue/src/DatePicker.spec.ts`
  - `packages/components-vue/src/Upload.spec.ts`
  - `packages/components-vue/src/Tree.spec.ts`
  - `packages/components-vue/src/Cascader.spec.ts`
  - `packages/components-vue/src/Transfer.spec.ts`

### 2.3 文档与治理产物
- 新增：
  - `docs/components/date-picker.md`
  - `docs/components/upload.md`
  - `docs/components/tree.md`
  - `docs/components/cascader.md`
  - `docs/components/transfer.md`
- 修改：
  - `docs/.vitepress/config.ts`
  - `packages/components-vue/COMPATIBILITY.md`
  - `docs/implementation/parity-manifest.json`
  - `docs/memory/components-progress.md`
  - `apps/playground/src/App.vue`

## 3. 执行顺序与依赖
1. `DatePicker`
2. `Upload`
3. `Tree`
4. `Cascader`
5. `Transfer`
6. 文档 / 兼容清单 / memory / playground 收口
7. 阶段门禁

顺序理由：
- `DatePicker` 和 `Upload` 都是高频表单复杂件，且会反向影响表单基线与状态联动。
- `Tree` 是 `Cascader` 的部分交互基础，先做树结构更稳。
- `Transfer` 依赖前面阶段已经稳定的列表、选择与状态展示能力，放在后面更容易复用。

## 4. 组件详细规格

### 4.1 DatePicker
- 接口契约：
  - `value?: string | undefined`
  - `defaultValue?: string | undefined`
  - `placeholder?: string`
  - `disabled?: boolean`
  - `allowClear?: boolean`
  - `format?: string`
  - `status?: 'default' | 'warning' | 'error'`
  - Emits：`update:value`、`change`、`openChange`
- 行为约束：
  - M4 只做单日期选择，不做 `RangePicker`。
  - 默认依赖 `dayjs` 格式化与解析。
  - 打开 / 关闭面板、受控 / 非受控值、清空、禁用态必须稳定。
- 差异策略：
  - 不提前做 `showTime`、周选择、月选择、多格式输入。
- 测试矩阵：
  - 受控 / 非受控值
  - 打开 / 关闭
  - 日期选择
  - `allowClear`
  - `disabled`
  - `FormItem` 状态联动

### 4.2 Upload
- 接口契约：
  - `fileList?: UploadFile[] | undefined`
  - `defaultFileList?: UploadFile[]`
  - `accept?: string`
  - `multiple?: boolean`
  - `disabled?: boolean`
  - `maxCount?: number | undefined`
  - `beforeUpload?: (file) => boolean | Promise<boolean>`
  - `customRequest?: (options) => void`
  - Emits：`update:fileList`、`change`、`remove`
- 行为约束：
  - M4 只做按钮触发型上传列表，不做拖拽与分片。
  - `beforeUpload`、`customRequest`、移除、受控 / 非受控 `fileList` 必须稳定。
- 差异策略：
  - 不提前做图片墙、裁剪、目录上传、拖拽上传。
- 测试矩阵：
  - 受控 / 非受控 fileList
  - `beforeUpload` 阻断
  - `customRequest` 调用
  - `maxCount`
  - 移除文件
  - `disabled`

### 4.3 Tree
- 接口契约：
  - `treeData: TreeNode[]`
  - `selectedKeys?: string[] | undefined`
  - `defaultSelectedKeys?: string[]`
  - `expandedKeys?: string[] | undefined`
  - `defaultExpandedKeys?: string[]`
  - `disabled?: boolean`
  - Emits：`update:selectedKeys`、`update:expandedKeys`、`select`、`expand`
- 行为约束：
  - M4 先做单选树与展开收起，不做 `checkable`。
  - 键盘导航、disabled 跳过、展开状态同步必须稳定。
- 差异策略：
  - 不做拖拽、虚拟滚动、异步懒加载。
- 测试矩阵：
  - 节点渲染
  - 展开 / 收起
  - 受控 / 非受控 selectedKeys / expandedKeys
  - disabled 节点阻断
  - 键盘导航

### 4.4 Cascader
- 接口契约：
  - `value?: string[] | undefined`
  - `defaultValue?: string[]`
  - `options: CascaderOption[]`
  - `placeholder?: string`
  - `disabled?: boolean`
  - `allowClear?: boolean`
  - `status?: 'default' | 'warning' | 'error'`
  - Emits：`update:value`、`change`、`openChange`
- 行为约束：
  - M4 只做单路径级联选择。
  - 展开、逐级选择、清空、受控 / 非受控必须稳定。
- 差异策略：
  - 不做多选、搜索、远程懒加载。
- 测试矩阵：
  - 多级选项渲染
  - 单路径选择
  - 清空
  - `disabled`
  - 受控 / 非受控
  - `FormItem` 状态联动

### 4.5 Transfer
- 接口契约：
  - `dataSource: TransferItem[]`
  - `targetKeys?: string[] | undefined`
  - `defaultTargetKeys?: string[]`
  - `selectedKeys?: string[] | undefined`
  - `disabled?: boolean`
  - Emits：`update:targetKeys`、`update:selectedKeys`、`change`
- 行为约束：
  - M4 只做基础双栏穿梭。
  - 勾选、左右移动、受控 / 非受控 targetKeys / selectedKeys 必须稳定。
- 差异策略：
  - 不做搜索、分页、树穿梭、表格穿梭。
- 测试矩阵：
  - 左右列表渲染
  - 勾选与移动
  - 受控 / 非受控
  - `disabled`
  - 空数据与边界状态

## 5. 子代理任务卡

### Task A（Core Components Agent）- DatePicker / Upload
- Scope：
  - `DatePicker.ts`、`DatePicker.spec.ts`
  - `Upload.ts`、`Upload.spec.ts`
- 禁止项：
  - 自行扩成 `RangePicker`
  - 自行加入拖拽上传、图片墙、showTime
- 交付物：
  - 两个复杂表单件的主链路实现与单测
- DoD：
  - 受控 / 非受控与边界状态可验证

### Task B（Core Components Agent）- Tree / Cascader
- Scope：
  - `Tree.ts`、`Tree.spec.ts`
  - `Cascader.ts`、`Cascader.spec.ts`
- 禁止项：
  - checkable Tree、多选 Cascader、远程懒加载
- 交付物：
  - 树型选择和级联选择的最小维护实现
- DoD：
  - 展开、选中、禁用、键盘模型可验证

### Task C（Core Components Agent）- Transfer
- Scope：
  - `Transfer.ts`、`Transfer.spec.ts`
- 禁止项：
  - 搜索、分页、树穿梭、表格穿梭
- 交付物：
  - 双栏穿梭主链路
- DoD：
  - 移动、勾选、受控 / 非受控可验证

### Task D（Governance Agent）- 文档 / 兼容 / memory
- Scope：
  - `docs/components/**`
  - `docs/.vitepress/config.ts`
  - `packages/components-vue/COMPATIBILITY.md`
  - `docs/implementation/parity-manifest.json`
  - `docs/memory/components-progress.md`
  - `apps/playground/src/App.vue`
- 禁止项：
  - 未经确认擅自改组件实现范围
- 交付物：
  - docs、兼容差异、showcase、memory
- DoD：
  - 组件测试通过后，playground 已同步，memory 已记录

### Task E（QA & Release Agent）- 阶段门禁
- Scope：
  - `pnpm test`
  - `pnpm typecheck`
  - `pnpm build`
  - `pnpm docs:build`
- 禁止项：
  - 未验证就宣称通过
- 交付物：
  - 阶段门禁证据
- DoD：
  - 结果写入 `docs/memory/components-progress.md`

## 6. 阶段门禁
- 必跑命令：
  - `pnpm test`
  - `pnpm typecheck`
  - `pnpm build`
  - `pnpm docs:build`
- 补充验证：
  - `pnpm --filter @lolita-ui/playground build`
- 通过标准：
  - 复杂组件新增测试全部通过
  - playground 已同步展示新组件
  - 兼容差异和未覆盖边界已写入文档

## 7. 风险与待确认项（必须提问，不得猜）

### 明确风险
1. `DatePicker` 是否需要在 M4 就纳入 `showTime / RangePicker` 还没有确认；当前计划明确不做。
2. `Upload` 是否需要真实上传网络层、拖拽、图片预览还没有确认；当前计划只保留 `beforeUpload / customRequest` 口子。
3. `Tree` 是否需要 `checkable` 与多选还没有确认；当前计划只做单选树。
4. `Cascader` 是否需要搜索、多选、远程懒加载还没有确认；当前计划只做单路径选择。
5. `Transfer` 是否需要搜索或分页还没有确认；当前计划只做最小双栏穿梭。

### 待确认项
- 若用户在 M4 开始前明确要求以上任一高级能力，必须先更新本计划和 memory，再进入实现。

## 8. 退出条件与下一阶段动作
- Exit Criteria：
  - `DatePicker`、`Upload`、`Tree`、`Cascader`、`Transfer` 全部完成并导出。
  - playground 已同步全部 M4 组件。
  - `COMPATIBILITY.md`、`parity-manifest.json`、`components-progress.md` 已同步。
  - `test + typecheck + build + docs:build` 全绿。
- 组件类任务在测试通过后，必须同步更新 `apps/playground` showcase，保证最新完成组件可见。
- 若 showcase 未更新，不得把组件写入“完成”或“已交付”。
- 下一阶段计划文件名（预留）：
  - `docs/implementation/stage-plans/M5-pro-release-hardening.md`
