# M3 数据展示阶段开发计划（详细执行版）

> 版本：`v1`（文件级产物、接口契约、测试矩阵、子代理任务卡、门禁与风险项已细化）  
> 适用：M2 导航与浮层收口后，下一次进入仓库可直接按顺序执行。  
> 规则：不理解、不合理、需求冲突时，先问用户，不允许自己猜。

## 1. 阶段目标与范围边界

- 目标组件：
  - `Table`
  - `Pagination`
  - `Tag`
  - `Badge`
  - `Avatar`
  - `List`
- 阶段目标：
  - 建立 M3 的数据展示主链路，让“列表页 / 表格页 / 轻量状态展示”具备可复用基线。
  - 先打稳分页契约、基础展示原子和空态 / loading 呈现，不急着把高复杂功能一次塞满。
  - 保持 Ant Design Vue 友好 API，但只做当前阶段明确边界内的能力，减少废代码。
- 不在本阶段范围内：
  - `Tree`、`Descriptions`、`Timeline`、`Collapse`、`Statistic`、`Card`
  - 表格的虚拟滚动、列拖拽、固定列、复杂排序 / 筛选体系
  - `Avatar.Group`
  - `Pagination` 的 page-size changer / jumper / mini 形态
  - `List` 的 grid 模式、无限滚动、load-more 体系

## 2. 产品清单（文件级）

### 2.1 代码产物
- 新增：
  - `packages/components-vue/src/components/Table.ts`
  - `packages/components-vue/src/components/Pagination.ts`
  - `packages/components-vue/src/components/Tag.ts`
  - `packages/components-vue/src/components/Badge.ts`
  - `packages/components-vue/src/components/Avatar.ts`
  - `packages/components-vue/src/components/List.ts`
- 修改：
  - `packages/components-vue/src/components/index.ts`
  - `packages/components-vue/src/index.ts`
  - `packages/components-vue/src/plugin.ts`
  - `packages/components-vue/src/style.css`

### 2.2 测试产物
- 新增：
  - `packages/components-vue/src/Table.spec.ts`
  - `packages/components-vue/src/Pagination.spec.ts`
  - `packages/components-vue/src/Tag.spec.ts`
  - `packages/components-vue/src/Badge.spec.ts`
  - `packages/components-vue/src/Avatar.spec.ts`
  - `packages/components-vue/src/List.spec.ts`

### 2.3 文档产物
- 新增：
  - `docs/components/table.md`
  - `docs/components/pagination.md`
  - `docs/components/tag.md`
  - `docs/components/badge.md`
  - `docs/components/avatar.md`
  - `docs/components/list.md`
- 修改：
  - `docs/.vitepress/config.ts`
  - `packages/components-vue/COMPATIBILITY.md`
  - `docs/implementation/parity-manifest.json`
  - `docs/memory/components-progress.md`

## 3. 执行顺序与依赖（硬顺序）

1. `Tag / Badge / Avatar`
2. `Pagination`
3. `Table`
4. `List`
5. 文档 / 兼容清单 / memory 收口
6. 阶段门禁

顺序理由：
- `Tag / Badge / Avatar` 是轻量原子，依赖少，先做可以稳定色彩 / 状态 / 圆角等展示规范。
- `Pagination` 先定下页码和事件契约，避免 `Table` 做完后再反向改分页模型。
- `Table` 是 M3 主干，依赖前面的分页契约，且最容易膨胀，所以必须在边界明确后再实现。
- `List` 放最后，复用前面原子组件和空态 / loading 经验，避免做出另一套展示逻辑。

## 4. 组件详细规格

### 4.1 Tag
- 接口契约：
  - `color?: 'default' | 'primary' | 'success' | 'warning' | 'danger'`
  - `bordered?: boolean`
  - `round?: boolean`
- Slots：
  - `default`
- 行为约束：
  - 仅做静态展示，不在 M3 猜测 closable、可编辑标签、图标位。
  - 颜色必须走 token，不写死魔法值。
- 相对 AntD 的差异策略：
  - 先做语义色标签，不做 closable 和自定义颜色自由输入。
- 测试矩阵：
  - 默认渲染
  - 颜色 class
  - bordered / round 组合

### 4.2 Badge
- 接口契约：
  - `status?: 'default' | 'processing' | 'success' | 'warning' | 'error'`
  - `text?: string`
  - `dot?: boolean`
- Slots：
  - `default`
- 行为约束：
  - `dot=true` 时优先展示圆点状态。
  - 不在 M3 做 count、overflowCount、ribbon。
- 相对 AntD 的差异策略：
  - 先做状态点 + 文本，不做数字徽标体系。
- 测试矩阵：
  - status class
  - dot 模式
  - text 展示

### 4.3 Avatar
- 接口契约：
  - `src?: string`
  - `alt?: string`
  - `size?: 'small' | 'middle' | 'large'`
  - `shape?: 'circle' | 'square'`
  - `fallbackText?: string`
- Slots：
  - `default`
- 行为约束：
  - 有 `src` 时渲染图片，没有 `src` 时回退到文本 / slot。
  - 不在 M3 做图片加载错误切换动画、Avatar.Group。
- 相对 AntD 的差异策略：
  - 保留最常用 `shape` 与尺寸语义，先不扩展 icon/avatar-group。
- 测试矩阵：
  - 图片模式
  - 文本回退
  - size / shape class

### 4.4 Pagination
- 接口契约：
  - `current?: number`
  - `defaultCurrent?: number`
  - `pageSize?: number`
  - `total?: number`
  - `disabled?: boolean`
- Emits：
  - `update:current`
  - `change`
- 行为约束：
  - 仅做上一页 / 下一页 / 数字页码。
  - 页码必须做最小值保护，不能出现 `0` 或负数。
  - 不在 M3 自己猜 `showSizeChanger`、`showQuickJumper`。
- 相对 AntD 的差异策略：
  - 先实现稳定分页状态机，不提前做复杂布局插槽。
- 测试矩阵：
  - 受控 / 非受控
  - 首页 / 尾页边界
  - disabled 阻断
  - `change` 回传

### 4.5 Table
- 接口契约：
  - `columns: TableColumn[]`
  - `dataSource: Record<string, unknown>[]`
  - `rowKey?: string | ((record) => string | number)`
  - `loading?: boolean`
  - `emptyText?: string`
  - `pagination?: false | PaginationConfig`
- Slots：
  - `bodyCell`
  - `empty`
- `TableColumn` 最小结构：
  - `key: string`
  - `title: string`
  - `dataIndex?: string`
  - `align?: 'left' | 'center' | 'right'`
  - `width?: number | string`
- 行为约束：
  - M3 只做基础展示表格，不猜测 rowSelection、sorter、filters、expandable。
  - `pagination` 仅支持内建分页对象或 `false`，先不做完整透传。
  - loading 和 empty 必须有明确可见状态。
- 相对 AntD 的差异策略：
  - 保留 columns/dataSource/rowKey 主路径，但不伪装成“全功能 table”。
- 测试矩阵：
  - 基础表头 / 行渲染
  - `rowKey` 字符串 / 函数
  - loading 态
  - empty 态
  - 内建分页联动
  - 自定义 `bodyCell` / `empty` slot

### 4.6 List
- 接口契约：
  - `dataSource: unknown[]`
  - `loading?: boolean`
  - `emptyText?: string`
  - `split?: boolean`
- Slots：
  - `renderItem`
  - `empty`
- 行为约束：
  - `renderItem` 是主入口，不在 M3 猜测复杂 item schema。
  - 仅做纵向列表，不做 grid / masonry / loadMore。
- 相对 AntD 的差异策略：
  - 保留最小列表容器语义，先不扩展 header / footer / pagination 嵌套模式。
- 测试矩阵：
  - 基础项渲染
  - loading 态
  - empty 态
  - split 开关

## 5. 子代理任务卡

### Task A（Core Components Agent）- Tag / Badge / Avatar
- Scope：`packages/components-vue/src/components/{Tag,Badge,Avatar}.ts`、对应 spec、`style.css`
- 禁止项：
  - 擅自引入 closable、count、Avatar.Group
  - 为了“看起来完整”新增未确认 props
- 交付物：
  - 三个轻量展示原子
  - 基础文档需求所需的最小样式
- DoD：
  - 单测通过
  - 能被 playground 和后续 `Table / List` 直接复用

### Task B（Core Components Agent）- Pagination
- Scope：`Pagination.ts`、`Pagination.spec.ts`、`style.css`
- 禁止项：
  - 先做 size changer、quick jumper、mini 变体
- 交付物：
  - 稳定的受控 / 非受控分页
  - 明确边界处理
- DoD：
  - 页码边界正确
  - `update:current` / `change` 契约稳定

### Task C（Core Components Agent）- Table
- Scope：`Table.ts`、`Table.spec.ts`、`style.css`
- 禁止项：
  - sorter / filters / rowSelection / expandable
  - 虚拟滚动与固定列
- 交付物：
  - 基础 columns + dataSource 表格
  - 内建分页联动
  - loading / empty / slot 扩展位
- DoD：
  - 不重复造另一套分页状态
  - 列和单元格渲染路径清晰可维护

### Task D（Core Components Agent）- List
- Scope：`List.ts`、`List.spec.ts`、`style.css`
- 禁止项：
  - grid、loadMore、无限滚动
- 交付物：
  - 纵向列表容器
  - `renderItem` 插槽
- DoD：
  - loading / empty / split 行为稳定
  - 可复用 Avatar / Badge / Tag

### Task E（Governance Agent）- 文档 / 兼容 / memory
- Scope：`docs/components/**`、`docs/.vitepress/config.ts`、`packages/components-vue/COMPATIBILITY.md`、`docs/implementation/parity-manifest.json`、`docs/memory/components-progress.md`
- 禁止项：
  - 修改业务实现代码
  - 替实现层猜测未确认能力
- 交付物：
  - 新组件文档页
  - 兼容差异记录
  - 组件完成记录 + 下一阶段计划登记
- DoD：
  - 每完成一个组件家族就更新 memory
  - playground 已同步才能写“完成”

### Task F（QA & Release Agent）- 阶段门禁
- Scope：测试执行、构建验证、证据沉淀
- 禁止项：
  - 未验证就宣称通过
- 交付物：
  - `test / typecheck / build / docs:build` 结果
  - 如已接入，再补 E2E / 视觉 / A11y 结果
- DoD：
  - 所有结果写入 `docs/memory/components-progress.md`

## 6. 阶段门禁

- 每完成一个组件家族后至少运行：
  - `pnpm test`
  - `pnpm typecheck`
  - `pnpm build`
- 阶段收口额外运行：
  - `pnpm docs:build`
- 若仓库在 M3 期间接入其他门禁，则追加：
  - `pnpm playwright test`
  - 视觉回归命令
  - A11y 扫描命令
- 证据规则：
  - 没接入的门禁，明确写“未接入 / 未执行”。
  - 组件测试通过后，必须同步更新 `apps/playground/src/App.vue`，否则不算完成。

## 7. 风险与待确认项（必须提问，不允许猜）

### 明确风险
1. `Table` 是否需要在 M3 就支持 `rowSelection`、`sorter`、`filters` 还没有确认；当前计划按“基础展示表格”收 scope，如果业务必须要其中任一项，需要先拆成追加小阶段。
2. `Pagination` 是否需要 `showQuickJumper`、`showSizeChanger` 还没有确认；当前不做。
3. `Tag` 是否需要 closable、`Badge` 是否需要 count、`Avatar` 是否需要 group 都还没有确认；当前不做。
4. `List` 是否需要 header / footer / loadMore / grid 还没有确认；当前不做。

### 待确认项
- 若用户在 M3 开始前明确要求以上任一能力，必须先更新本计划文件和 memory，再进入实现。

## 8. 退出条件与下一阶段动作

### Exit Criteria
- `Tag`、`Badge`、`Avatar`、`Pagination`、`Table`、`List` 全部完成并导出。
- `COMPATIBILITY.md` 与 `parity-manifest.json` 已同步差异。
- `docs/memory/components-progress.md` 已同步：
  - 完成组件
  - 门禁证据
  - playground 同步状态
  - M4 计划文件路径
- `test + typecheck + build + docs:build` 全绿。

### M3 完成后的必做动作
1. 新建 `docs/implementation/stage-plans/M4-complex-data-feedback.md`
2. 把 M4 候选组件细化成详细执行版
3. 在 `docs/memory/components-progress.md` 登记 M4 路径
