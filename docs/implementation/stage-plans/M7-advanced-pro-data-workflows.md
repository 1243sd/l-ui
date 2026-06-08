# M7 Advanced Pro Data Workflows

## 1. 阶段目标与边界
- 目标：
  - 把 `ProSearchTable` 从“配置驱动的单页查询表格”推进到“能承载真实后台数据工作流”的层级。
  - 优先打通三条最高频工作流：日期范围查询、排序驱动的请求链路、行选择与批量操作。
  - 在不牺牲 M5/M6 已有丝滑体验的前提下，补齐必要的基础表格能力，让 Pro 层不再被 M3 的展示型 `LTable` 边界卡住。
  - 保持阶段可控：只做单列排序、单批量工作流和本地可验证的 UX，不把 M7 膨胀成第二次发布治理或全量 ProTable 克隆。
- 不在本阶段范围：
  - inline editing、column pinning、drag sorting、remote column persistence、saved views / preset persistence。
  - `dateRange` 以外的高级日期族：`showTime`、时区体系、快捷范围、周/月/季度面板。
  - 列级 `filters`、多列排序、树表 / 可展开表格、虚拟滚动。
  - 真实 registry publish、release governance 重做；M6 的发布门禁只需继续保持全绿。

## 2. 产物清单（文件级）
- 新增文件：
  - `docs/implementation/stage-plans/M7-advanced-pro-data-workflows.md`
  - `packages/components-vue/src/components/DateRangePicker.ts`
  - `packages/components-vue/src/DateRangePicker.spec.ts`
  - `docs/components/date-range-picker.md`
- 修改文件：
  - `packages/components-vue/src/components/Table.ts`
  - `packages/components-vue/src/Table.spec.ts`
  - `packages/components-vue/src/components/index.ts`
  - `packages/components-vue/src/index.ts`
  - `packages/components-vue/src/plugin.ts`
  - `packages/components-vue/src/style.css`
  - `packages/components-vue/src/DatePicker.spec.ts`
  - `packages/pro-vue/src/types.ts`
  - `packages/pro-vue/src/searchSchema.ts`
  - `packages/pro-vue/src/searchSchema.spec.ts`
  - `packages/pro-vue/src/ProSearchTable.vue`
  - `packages/pro-vue/src/ProSearchTable.spec.ts`
  - `packages/pro-vue/src/style.css`
  - `apps/playground/src/App.vue`
  - `tests/playwright/e2e.spec.ts`
  - `tests/playwright/visual.spec.ts`
  - `tests/playwright/a11y.spec.ts`
  - `docs/pro/pro-search-table.md`
  - `docs/components/date-picker.md`
  - `docs/.vitepress/config.*`
  - `docs/index.md`
  - `docs/implementation/lolita-ui-plan.md`
  - `docs/implementation/plan.md`
  - `docs/memory/components-progress.md`
- 兼容性/对齐清单更新文件：
  - `packages/components-vue/COMPATIBILITY.md`
  - `packages/pro-vue/COMPATIBILITY.md`
  - `docs/implementation/parity-manifest.json`

## 3. 执行顺序与依赖
1. 先扩基础底座：落地 `LDateRangePicker`，并把 `LTable` 补到“可排序 + 可选择”的工作流最小面。
2. 再升级 `ProSearchTable` 契约：新增 `dateRange` 搜索字段、排序请求面、批量操作与选择态策略。
3. 然后把 playground / Playwright / docs 同步到 M7 的真实 UX，确保新能力既可人工看，也可机器测。
4. 最后更新 compatibility / parity / memory / 路线图，把 M7 写成“执行中可依赖”的真计划。

## 4. 组件/模块详细规格
### 4.1 `LDateRangePicker`
- 接口契约（props/emits/slots/methods）：
  - 新增独立导出 `LDateRangePicker`，不把 range 语义硬塞进现有 `LDatePicker` 的单值契约。
  - `value?: [string, string] | undefined`
  - `defaultValue?: [string, string] | undefined`
  - `placeholder?: [string, string]`
  - `disabled?: boolean`
  - `allowClear?: boolean`
  - `format?: string`
  - `status?: InputStatus`
  - `size?: ComponentSize`
  - emits：
    - `update:value`
    - `change`
    - `openChange`
    - `focus`
    - `blur`
- 行为约束：
  - 只支持“开始日期 + 结束日期”的基础范围选择，不支持时间维度与快捷面板。
  - 第一次点击写入开始日期，第二次点击写入结束日期；若结束日期早于开始日期，则自动交换为升序区间。
  - 已选完整区间后再次开始选择，默认从新的开始日期重置一次选择过程。
  - `allowClear` 语义与 `LDatePicker` 对齐，清空时发出 `undefined`。
  - 与 `FormItem` 的状态联动要保持一致，外壳错误态不能另起一套视觉语言。
- 差异策略（相对 AntD）：
  - M7 只做最小稳定 `LDateRangePicker`，不承诺 `RangePicker` 的完整生态能力。
  - 不做 `showTime`、`presets`、`disabledDate`、多面板模式切换。
- 测试矩阵：
  - 受控 / 非受控区间选择
  - 开始 / 结束顺序交换
  - `allowClear`
  - `format`
  - `FormItem` 错误态联动

### 4.2 `LTable` Workflow Primitives
- 接口契约（props/emits/slots/methods）：
  - `TableColumn` 新增 `sortable?: boolean`
  - 新增 `TableSortOrder = 'ascend' | 'descend'`
  - 新增 `sortState?: { columnKey: string; order: TableSortOrder } | undefined`
  - 新增 `defaultSortState?: { columnKey: string; order: TableSortOrder } | undefined`
  - emits：
    - `update:sortState`
    - `sortChange`
  - 新增 `rowSelection?: {`
    - `selectedRowKeys?: Array<string | number>`
    - `defaultSelectedRowKeys?: Array<string | number>`
    - `preserveSelectedRowKeys?: boolean`
    - `getDisabled?: (record, index) => boolean`
    - `}`
  - emits：
    - `update:selectedRowKeys`
    - `selectionChange`
  - `bodyCell` slot 继续保留，不牺牲现有渲染扩展面。
- 行为约束：
  - 排序只支持单列排序，点击列头循环 `undefined -> ascend -> descend -> undefined`。
  - `LTable` 只负责暴露排序状态和交互 affordance，不在组件内部偷偷重排 `dataSource`。
  - 行选择只做 checkbox 语义，不做树形级联或 radios。
  - “全选”只作用于当前页可见且未禁用的数据行。
  - `preserveSelectedRowKeys` 默认 `false`，避免用户在翻页 / 查询后误操作不可见历史选择项。
- 差异策略（相对 AntD）：
  - 不在 M7 一次性补 `filters`、`expandable`、固定列、虚拟滚动。
  - `LTable` 依旧偏轻量展示底座，但从 M3 的纯展示面升级到可承载 Pro 工作流的基础表格。
- 测试矩阵：
  - 排序状态循环与受控 / 非受控
  - `sortChange` / `update:sortState`
  - 当前页全选 / 单行选择 / 禁用行跳过
  - 翻页后选择态清理或保留规则

### 4.3 `ProSearchTable` Advanced Workflows
- 接口契约（props/emits/slots/methods）：
  - `searchSchema` 新增第五类字段：
    - `dateRange`
    - `value` 语义为 `[string, string] | undefined`
    - `dateRangePickerProps?: { allowClear?: boolean; format?: string }`
    - `toQuery?: (value, formValues) => Record<string, unknown>`
  - `request` / `beforeQuery` / `afterQuery` payload 新增：
    - `sortState`
  - 新增 `rowSelection?: {`
    - `selectedRowKeys?: Array<string | number>`
    - `defaultSelectedRowKeys?: Array<string | number>`
    - `preserveSelectedRowKeys?: boolean`
    - `getDisabled?: (row, index) => boolean`
    - `}`
  - 新增 `bulkActions?: ProBulkAction[]`
  - `ProBulkAction` 合同：
    - `key: string`
    - `label: string`
    - `visible?: (context) => boolean`
    - `disabled?: (context) => boolean`
    - `loading?: (context) => boolean`
    - `refreshOnSuccess?: boolean`
    - `clearSelectionOnSuccess?: boolean`
    - `onClick: (context) => void | Promise<void>`
  - `toolbar` slot context 新增：
    - `selectedRowKeys`
    - `selectedRows`
    - `clearSelection`
    - `sortState`
    - `refresh`
- 行为约束：
  - `searchSchema` 的 `dateRange` 默认序列化结果是 `{ [name]: [start, end] }`；若业务需要拆成 `start/end`，必须显式用 `toQuery`。
  - `sortState` 变更应触发真实 re-query，并保持“loading 不清空旧行”的 M5 体验。
  - `rowSelection.preserveSelectedRowKeys` 默认 `false`；查询、分页、排序后默认清理已不再可见的选择态，保证批量操作可预测。
  - `bulkActions` 默认是“选中驱动”的：无选中行时显示但 disabled，避免操作入口闪烁。
  - `bulkActions.refreshOnSuccess` 默认 `true`，`clearSelectionOnSuccess` 默认 `true`，但允许业务显式覆盖。
  - 批量操作、排序、分页、重试都必须保留既有错误处理与反馈连续性，不能因为状态维度增加而重新引入整表闪烁。
- 差异策略（相对 AntD ProTable）：
  - M7 只补高频数据工作流，不追 inline edit、列配置持久化、表格 preset、remote schema builders。
  - 不做多列排序与列级 filter dropdown，先保证单列排序与批量工作流足够稳。
  - 不把选择态、排序态做成魔法自动持久化；默认行为更保守、可预测。
- 测试矩阵：
  - `dateRange` 默认值 / 序列化 / `toQuery`
  - 排序触发请求且 `sortState` 正确进 request payload
  - `rowSelection` 受控 / 非受控
  - `bulkActions` 的 disabled / refresh / clear-selection 默认语义
  - 查询失败后旧行与选择态连续性

### 4.4 Playground And Browser Gates
- 接口契约（QA surface）：
  - `apps/playground` 继续作为唯一 showcase 与 browser-test surface。
  - `pro-search-table` 区域升级为 M7 场景面，至少新增：
    - range query
    - sortable column
    - row selection + bulk action
  - 若需要单独可视化基础范围组件，可在现有 `date-picker` section 内增加 `LDateRangePicker` 子面板，而不是把导航切碎。
- 行为约束：
  - 保留 deterministic URL 入口策略，不再引入第二套路由或 test-only app。
  - visual smoke 至少扩一个 M7 Pro 工作流场景，确保 light/dark 下的 selection / toolbar / sort affordance 都被截图兜住。
  - a11y 要覆盖新的 checkbox、sortable header 与批量按钮区。
- 差异策略：
  - 不新增第二套 visual system；继续复用既有 `Playwright + axe`。
  - 不为了测试方便引入业务无意义的隐藏交互。
- 测试矩阵：
  - `e2e`：range query、sort、selection、bulk action
  - `visual`：M7 pro workflow 在 `light/dark`
  - `a11y`：新增选择与排序交互无额外违反项

## 5. 子代理任务卡
### Task A（Base Data Workflow Agent）
- Scope：
  - `LDateRangePicker`
  - `LTable` 的排序与行选择底座
  - 相关 spec、样式与组件导出
- 禁止项：
  - 不提前做 `filters`、固定列、虚拟滚动、树表。
  - 不修改 `ProSearchTable` 请求合同。
- 交付物：
  - `DateRangePicker` 实现与测试
  - `Table` workflow primitives 与测试
- DoD：
  - 基础组件层单测全绿，且现有 M0-M4 showcase 不回退。

### Task B（Pro Workflow Agent）
- Scope：
  - `ProSearchTable` 的 `dateRange`、`sortState`、`rowSelection`、`bulkActions`
  - `types.ts` 与 `searchSchema.ts` 合同升级
  - Pro 文档与 playground 的工作流示例
- 禁止项：
  - 不引入 inline edit、preset persistence、remote schema builders。
  - 不绕过 `LTable` / `LDateRangePicker` 重新造一套私有表格或日期范围 UI。
- 交付物：
  - Pro 合同升级 diff
  - 单测与 playground 场景
- DoD：
  - 新工作流在 request payload、UI 连续性和默认安全策略上都有明确测试证据。

### Task C（Governance And Browser Gates Agent）
- Scope：
  - 更新 `tests/playwright/*`
  - 更新 docs / compatibility / parity / memory / 路线图
  - 确保 M6 的发布交付门禁不因 M7 回退
- 禁止项：
  - 不擅自变更 release 策略。
  - 不新增第二套 showcase 或第二套 browser stack。
- 交付物：
  - M7 browser-gate coverage
  - 真源文档同步
- DoD：
  - 维护者只看仓库真源就能知道 M7 做了什么、没做什么、如何验证。

## 6. 阶段门禁
- 必跑命令：
  - `pnpm test`
  - `pnpm typecheck`
  - `pnpm build`
  - `pnpm docs:build`
  - `pnpm test:e2e`
  - `pnpm test:visual`
  - `pnpm test:a11y`
  - `pnpm pack:check`
  - `pnpm consumer:build`
  - `pnpm test:consumer`
  - `pnpm size:check`
  - `pnpm release:dry-run`
- 通过标准：
  - M7 的基础组件与 Pro 单测全部通过。
  - browser gates 覆盖 M7 的 range query / sort / selection / bulk workflow，且 `light/dark` 视觉矩阵全绿。
  - M6 的交付链路继续全绿，证明 M7 没破坏对外交付面。
  - `pack:check` 与 `size:check` 继续通过，说明新工作流没有把发布包面和体积纪律带偏。

## 7. 风险与待确认项（必须提问，不得猜）
- 风险：
  - `LTable` 一旦同时补排序与选择态，最容易出现 header / body / pagination 三者状态漂移，必须先把默认状态语义写死。
  - `dateRange` 如果设计成过宽的通用 schema，会很快把 M7 推向“半个表单引擎”，需要持续守住白名单契约。
  - 批量操作默认行为如果过于激进，容易造成“看不见的历史选择”误操作；如果过于保守，又会让工作流显得笨重。
  - browser gates 若只测单条 happy path，会漏掉排序后保留旧行、失败后 retry、selection 清理等真正高风险边界。
- 待确认项：
  - `LTable` 排序是否只锁单列排序，把多列排序明确延后？推荐：只锁单列排序。
  - 批量操作在成功后是否默认同时 `refresh + clearSelection`？推荐：是，保持安全且可预测。
  - `rowSelection.preserveSelectedRowKeys` 是否默认 `false`？推荐：是，避免跨查询隐式保留旧选择。
  - `dateRange` 是否默认序列化为 `{ [name]: [start, end] }`，由业务用 `toQuery` 自行拆分？推荐：是。

## 8. 退出条件与下一阶段动作
- Exit Criteria：
  - `LDateRangePicker`、`LTable` 排序/选择底座、`ProSearchTable` 批量工作流全部落地并有测试证据。
  - playground 已能直接展示 M7 的 range query / sort / selection / bulk-action 主链路。
  - `e2e / visual / a11y / pack / consumer / release dry-run` 全部继续通过。
  - compatibility / parity / docs / memory / 路线图已同步，且明确写出 M7 刻意不做的高级能力。
- 组件类任务在测试通过后，必须同步更新 `apps/playground` showcase，保证最新完成组件可见。
- 若 showcase 未更新，不得把组件写入“完成”或“已交付”。
- 下一阶段计划文件名（预留）：
  - `docs/implementation/stage-plans/M8-pro-preferences-and-persistence.md`
