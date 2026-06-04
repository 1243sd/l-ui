# 组件进度记忆（持续维护）

> 本文件是组件库唯一进度真源。  
> 组件测试通过后，必须同步更新 `apps/playground/src/App.vue` 的示例页面；showcase 未更新，不算真正完成。  
> 每个阶段收口后，必须把“下一阶段详细计划”写成独立 `.md` 文件并登记到这里，方便下次直接接着做。

## 本地展示页状态（Playground Showcase）

| 日期 | 入口 | 已覆盖组件 | 状态 | 备注 |
| --- | --- | --- | --- | --- |
| 2026-05-20 | `apps/playground/src/App.vue` | M0、M1、M2、M3 全部已完成组件 + `ProSearchTable` | 已同步 | 当前已包含 `tabs-menu`、`floating-overlays`、`blocking-overlays`、`data-display-foundation`、`data-display-shells` 五个阶段 section，并接入 `LTabs`、`LTabPane`、`LMenu`、`LTooltip`、`LPopover`、`LDropdown`、`LModal`、`LDrawer`、`LTag`、`LBadge`、`LAvatar`、`LPagination`、`LTable`、`LList`。 |
| 2026-05-21 | `apps/playground/src/App.vue` | M0、M1、M2、M3、M4 全部已完成组件 + `ProSearchTable` | 已同步 | 新增 `complex-data-feedback` 段落，接入 `LDatePicker`、`LUpload`、`LTree`、`LCascader`、`LTransfer`，并按阶段顺序插在 M3 与 Pro 之间。 |
| 2026-05-26 | `apps/playground/src/App.vue` | M0、M1、M2、M3、M4 + M5 `ProSearchTable / browser gates` | 已同步 | `ProSearchTable` showcase 升级到 M5：四类 `searchSchema` 字段、`queryValues` 过滤、`LPagination`、`pro-basic / pro-error` QA 场景、重试入口与 deterministic browser gates 全部接入。 |

## 已完成组件

| 日期 | 阶段 | 组件 | 指派子代理 / 区域 | 状态 | 交付证据 |
| --- | --- | --- | --- | --- | --- |
| 2026-05-13 | M0 | ConfigProvider | Core Components Agent | 已完成 | `packages/components-vue/src/components/ConfigProvider.ts` |
| 2026-05-13 | M0 | ThemeProvider | Theme Agent + Core Components Agent | 已完成 | `packages/theme/src/LolitaThemeProvider.ts` |
| 2026-05-13 | M0 | LButton | Core Components Agent | 已完成 | `packages/components-vue/src/components/Button.ts` |
| 2026-05-13 | M0 | LSpace | Core Components Agent | 已完成 | `packages/components-vue/src/components/Space.ts` |
| 2026-05-13 | M0 | ProSearchTable | Pro Components Agent | 已完成 | `packages/pro-vue/src/ProSearchTable.vue` |
| 2026-05-13 | M1 | LInput | Core Components Agent | 已完成 | `packages/components-vue/src/components/Input.ts` |
| 2026-05-13 | M1 | Form / FormItem | Core Components Agent | 已完成 | `packages/components-vue/src/components/Form.ts` + `packages/components-vue/src/components/FormItem.ts` |
| 2026-05-19 | M1 | LSelect（含搜索 / 多选 / 远程搜索口子） | Core Components Agent | 已完成 | `packages/components-vue/src/components/Select.ts` |
| 2026-05-19 | M1 | LCheckbox / LRadio / LRadioGroup / LSwitch | Core Components Agent | 已完成 | `packages/components-vue/src/components/Checkbox.ts` 等 |
| 2026-05-20 | M2 | LTabs / LTabPane | Core Components Agent | 已完成 | `packages/components-vue/src/components/Tabs.ts` |
| 2026-05-20 | M2 | LMenu | Core Components Agent | 已完成 | `packages/components-vue/src/components/Menu.ts` |
| 2026-05-20 | M2 | LTooltip / LPopover / LDropdown | Core Components Agent | 已完成 | `packages/components-vue/src/components/Tooltip.ts` 等 |
| 2026-05-20 | M2 | LModal / LDrawer | Core Components Agent | 已完成 | `packages/components-vue/src/components/Modal.ts` + `packages/components-vue/src/components/Drawer.ts` |
| 2026-05-20 | M3 | LTag / LBadge / LAvatar | Core Components Agent（Anscombe） | 已完成 | `packages/components-vue/src/components/Tag.ts` 等 |
| 2026-05-20 | M3 | LPagination | Core Components Agent | 已完成 | `packages/components-vue/src/components/Pagination.ts` |
| 2026-05-20 | M3 | LTable | Core Components Agent（Newton） | 已完成 | `packages/components-vue/src/components/Table.ts` |
| 2026-05-20 | M3 | LList | Core Components Agent（Planck） | 已完成 | `packages/components-vue/src/components/List.ts` |
| 2026-05-21 | M4 | LDatePicker | Core Components Agent | 已完成 | `packages/components-vue/src/components/DatePicker.ts` |
| 2026-05-21 | M4 | LUpload | Core Components Agent | 已完成 | `packages/components-vue/src/components/Upload.ts` |
| 2026-05-21 | M4 | LTree | Core Components Agent | 已完成 | `packages/components-vue/src/components/Tree.ts` |
| 2026-05-21 | M4 | LCascader | Core Components Agent | 已完成 | `packages/components-vue/src/components/Cascader.ts` |
| 2026-05-21 | M4 | LTransfer | Core Components Agent | 已完成 | `packages/components-vue/src/components/Transfer.ts` |
| 2026-05-26 | M5 | ProSearchTable / Browser Gates | 本地主线集成 | 已完成 | `packages/pro-vue/src/ProSearchTable.vue` + `tests/playwright/*.spec.ts` + `playwright.config.ts` |

## 当前门禁快照

### 2026-05-20 - M2 收口证据
- `rtk pnpm test`：22 files / 83 tests passed。
- `rtk pnpm typecheck`：passed。
- `rtk pnpm build`：passed。
- `rtk pnpm docs:build`：passed。
- `E2E / 视觉回归 / A11y`：当前仓库尚未接入到 M2 的强制门禁，本次明确记为“未接入 / 未执行”，没有假装通过。

### 2026-05-20 - M3 第一波局部验证证据
- `rtk pnpm vitest run packages/components-vue/src/Tag.spec.ts packages/components-vue/src/Badge.spec.ts packages/components-vue/src/Avatar.spec.ts packages/components-vue/src/Pagination.spec.ts`：4 files / 16 tests passed。
- `rtk pnpm exec vue-tsc -p apps/playground/tsconfig.json --noEmit`：passed。
- `rtk pnpm --filter @lolita-ui/playground build`：passed。
- `全量 pnpm test / pnpm typecheck / pnpm build / pnpm docs:build`：已在 M3 收口阶段补跑并通过。

### 2026-05-20 - M3 收口证据
- `rtk pnpm test`：28 files / 108 tests passed。
- `rtk pnpm typecheck`：passed。
- `rtk pnpm build`：passed。
- `rtk pnpm docs:build`：passed。
- `rtk pnpm --filter @lolita-ui/playground build`：passed。
- `E2E / 视觉回归 / A11y`：当前仓库尚未接入到 M3 的强制门禁，本次明确记为“未接入 / 未执行”，没有假装通过。

### 2026-05-21 - 组件库共享动效与样式打磨证据
- `rtk pnpm test`：28 files / 108 tests passed。
- `rtk pnpm typecheck`：passed。
- `rtk pnpm build`：passed。
- `rtk pnpm docs:build`：passed。
- `rtk pnpm --filter @lolita-ui/playground build`：passed。
- 变更范围：共享样式主干 `packages/components-vue/src/style.css`，没有扩 public API。

### 2026-05-21 - M4 收口证据
- `rtk pnpm vitest run packages/components-vue/src/DatePicker.spec.ts packages/components-vue/src/Upload.spec.ts packages/components-vue/src/Tree.spec.ts packages/components-vue/src/Cascader.spec.ts packages/components-vue/src/Transfer.spec.ts`：5 files / 24 tests passed。
- `rtk pnpm test`：34 files / 134 tests passed。
- `rtk pnpm typecheck`：passed。
- `rtk pnpm build`：passed。
- `rtk pnpm docs:build`：passed。
- `rtk pnpm exec vue-tsc -p apps/playground/tsconfig.json --noEmit`：passed。
- `rtk pnpm --filter @lolita-ui/playground build`：passed。
- `E2E / 视觉回归 / A11y`：当前仓库尚未接入到 M4 的强制门禁，本次明确记为“未接入 / 未执行”，没有假装通过。

### 2026-05-26 - M5 收口证据
- `rtk pnpm test`：35 files / 147 tests passed。
- `rtk pnpm typecheck`：passed。
- `rtk pnpm build`：passed。
- `rtk pnpm docs:build`：passed。
- `rtk pnpm --filter @lolita-ui/playground build`：passed。
- `rtk pnpm test:e2e`：5 passed。
- `rtk pnpm test:visual`：6 passed，required smoke matrix 覆盖 `shell` / `overlay-modal` / `pro-basic` 的 `light` 与 `dark`。
- `rtk pnpm test:a11y`：2 passed。

## M2 兼容摘要

| 组件 | 已覆盖边界 | 当前差异 / 未覆盖边界 |
| --- | --- | --- |
| `LTabs / LTabPane` | `items` 模式、`LTabPane` 模式、键盘切换、disabled 跳过、`destroyInactiveTabPane` | 不支持可编辑 tabs、垂直模式、额外操作区；混用 `items` 与 `LTabPane` 时会 warning 并优先 `LTabPane` |
| `LMenu` | 单层菜单、垂直/水平方向、roving focus、`Enter/Space/Home/End` | 只实现单选语义；不支持 `SubMenu`、`openKeys`、多层嵌套 |
| `LTooltip` | `hover/focus`、四向 placement、`teleported`、`aria-describedby` | 不支持 click trigger、自动翻转、复杂内容 |
| `LPopover` | `click/hover`、标题/内容、外部点击关闭、`teleported` | 不支持复杂交互内容、延迟开关、自动避让 |
| `LDropdown` | `click/hover`、ArrowDown 进菜单、选择后关闭、`teleported` | 不支持自定义 overlay、级联菜单、右键菜单 |
| `LModal` | `maskClosable`、`keyboard`、`destroyOnClose`、焦点返回、滚动锁定、`teleported` | 不支持自定义 footer、异步确认、弹窗堆叠 |
| `LDrawer` | `left/right`、`maskClosable`、`keyboard`、焦点返回、滚动锁定、`teleported` | 不支持 `top/bottom`、push 行为、footer 和额外操作区 |

## 下一阶段开发规划

| 当前阶段完成 | 下一阶段 | 计划文件 | 状态 | 最后更新 |
| --- | --- | --- | --- | --- |
| M3 | M4 | `docs/implementation/stage-plans/M4-complex-data-feedback.md` | 已生成（详细执行版） | 2026-05-20 |
| M4 | M5 | `docs/implementation/stage-plans/M5-pro-release-hardening.md` | 已完成（执行 + 收口） | 2026-05-26 |
| M5 | M6 | `docs/implementation/stage-plans/M6-release-delivery-and-consumer-readiness.md` | 已生成（详细执行版，待确认后执行） | 2026-06-04 |

## 追加记录

### [2026-05-20] M2 - Tabs / Menu
- 指派子代理：Core Components Agent + Governance Agent
- 完成内容：
  - 落地 `LTabs`、`LTabPane`、`LMenu` 与共享 roving focus 语义。
  - `Tabs` 同时覆盖 `items` 模式、`TabPane` 模式与 `destroyInactiveTabPane`。
  - `Menu` 覆盖垂直 / 水平方向与 disabled 跳过。
- 测试结论：单测通过；E2E / 视觉回归 / A11y 未接入。
- 证据链接：`packages/components-vue/src/Tabs.spec.ts (5 passed)`、`packages/components-vue/src/Menu.spec.ts (4 passed)`、`packages/components-vue/src/rovingFocus.spec.ts (3 passed)`。
- 兼容备注：保持 AntD 风格的选中与键盘主链路，但显式不做可编辑 tabs 和多层 menu。
- Playground：已同步到 `tabs-menu` section。
- 下一组件：Tooltip / Popover / Dropdown。
- 下一阶段计划文件：`docs/implementation/stage-plans/M3-data-display.md`

### [2026-05-20] M2 - Tooltip / Popover / Dropdown
- 指派子代理：Core Components Agent + Governance Agent
- 完成内容：
  - 落地轻浮层共享开关契约 `open/defaultOpen`。
  - `Tooltip`、`Popover`、`Dropdown` 全部支持 `teleported` 参数，`true` 时挂载到 `document.body`。
  - `Dropdown` 复用 `LMenu`，补齐 ArrowDown 进入菜单和选择后关闭。
- 测试结论：单测通过；E2E / 视觉回归 / A11y 未接入。
- 证据链接：`packages/components-vue/src/Tooltip.spec.ts (2 passed)`、`packages/components-vue/src/Popover.spec.ts (3 passed)`、`packages/components-vue/src/Dropdown.spec.ts (3 passed)`、`packages/components-vue/src/overlayState.spec.ts (3 passed)`。
- 兼容备注：当前只做四向 placement 和最小定位，不猜测自动翻转与复杂 collision 行为。
- Playground：已同步到 `floating-overlays` section。
- 下一组件：Modal / Drawer。
- 下一阶段计划文件：`docs/implementation/stage-plans/M3-data-display.md`

### [2026-05-20] M2 - Modal / Drawer
- 指派子代理：Core Components Agent + Governance Agent
- 完成内容：
  - 落地 `LModal`、`LDrawer`，补齐 Esc 关闭、遮罩关闭、焦点返回、body 滚动锁定。
  - `Drawer` 当前明确只做 `left/right` 两向。
  - 统一保留 `teleported` 挂载参数，默认值为 `true`。
- 测试结论：单测通过；E2E / 视觉回归 / A11y 未接入。
- 证据链接：`packages/components-vue/src/Modal.spec.ts (3 passed)`、`packages/components-vue/src/Drawer.spec.ts (3 passed)`、`packages/components-vue/src/focusScope.spec.ts (3 passed)`。
- 兼容备注：阻断式浮层主链路已稳定，但自定义 footer、异步确认、多层堆叠仍未进入范围。
- Playground：已同步到 `blocking-overlays` section。
- 下一阶段：M3 数据展示。
- 下一阶段计划文件：`docs/implementation/stage-plans/M3-data-display.md`

### [2026-05-20] M3 - Tag / Badge / Avatar / Pagination（第一波）
- 指派子代理：Core Components Agent（Anscombe）+ 本地主线集成。
- 完成内容：
  - 落地 `LTag`、`LBadge`、`LAvatar`、`LPagination`。
  - `Tag / Badge / Avatar` 已接入共享导出、插件注册与 playground。
  - `playground` 解析链路改成直接指向 workspace 源码，避免示例页依赖过期 `dist`。
- 测试结论：组件局部测试与 playground 局部门禁通过；M3 全量门禁待 `Table / List` 合流后统一执行。
- 证据链接：`packages/components-vue/src/Tag.spec.ts (6 passed)`、`packages/components-vue/src/Badge.spec.ts (3 passed)`、`packages/components-vue/src/Avatar.spec.ts (3 passed)`、`packages/components-vue/src/Pagination.spec.ts (4 passed)`。
- 兼容备注：`Tag` 当前不做 `closable`，`Badge` 当前不做 `count`，`Avatar` 当前不做 `Avatar.Group`，`Pagination` 当前不做 `showQuickJumper / showSizeChanger`。
- Playground：已同步到 `data-display-foundation` section。
- 下一组件：`Table`，随后是 `List`。
- 下一阶段计划文件：`docs/implementation/stage-plans/M3-data-display.md`

### [2026-05-20] M3 - Table / List 与阶段收口
- 指派子代理：Core Components Agent（Newton / Planck）+ 本地主线集成。
- 完成内容：
  - 落地 `LTable` 与 `LList`，并把它们接入共享导出、插件注册、playground、docs 与兼容清单。
  - `LTable` 只保留 `columns / dataSource / rowKey / loading / empty / pagination / bodyCell` 主链路。
  - `LList` 只保留 `dataSource / loading / empty / split / renderItem` 主链路。
- 测试结论：M3 全量门禁通过；E2E / 视觉回归 / A11y 未接入。
- 证据链接：`packages/components-vue/src/Table.spec.ts (5 passed)`、`packages/components-vue/src/List.spec.ts (4 passed)`、`rtk pnpm test (28 files / 108 tests passed)`。
- 兼容备注：`Table` 不做排序 / 筛选 / 选择态 / 固定列 / 虚拟滚动；`List` 不做 grid / loadMore / infinite scroll。
- Playground：已同步到 `data-display-shells` section。
- 下一阶段：M4 复杂组件。
- 下一阶段计划文件：`docs/implementation/stage-plans/M4-complex-data-feedback.md`

### [2026-05-21] 全组件共享打磨 - Motion / Visual Polish
- 指派子代理：UI 审查子代理（Aristotle / McClintock）+ 本地主线集成。
- 完成内容：
  - 为组件库统一了一层更柔和的共享 motion 语言，补了 hover / press / surface transition / overlay entrance 的节奏。
  - 收口了表单、导航、浮层、数据展示四大家族的边框强度、背景层级、阴影和交互反馈。
  - 保持 public API 不变，没有为了视觉优化引入新 props 或一次性废代码。
- 影响文件：`packages/components-vue/src/style.css`。
- 验证结论：全量 `test / typecheck / build / docs:build / playground build` 全绿。
- 兼容备注：这次主要是视觉与动效层优化，浮层关闭链路仍沿用现有实现，没有重写 overlay 状态机。

### [2026-05-21] M4 - DatePicker / Upload / Tree / Cascader / Transfer
- 指派子代理：Core Components Agent（分组件并行）+ Governance Agent，本地主线负责集成与门禁。
- 完成内容：
  - 落地 `LDatePicker`，覆盖单日期选择、受控 / 非受控、`allowClear`、`format`、`disabled`、`openChange` 与 `FormItem` 状态联动。
  - 落地 `LUpload`，覆盖按钮触发上传列表、`beforeUpload`、`customRequest`、`maxCount`、移除、受控 / 非受控 `fileList`。
  - 落地 `LTree`、`LCascader`、`LTransfer`，分别建立单选树、单路径级联选择、双栏穿梭的最小可维护基线。
  - 同步接入共享导出、插件注册、playground showcase、组件文档、兼容清单与 parity manifest。
- 测试结论：M4 定向单测、全量 `pnpm test`、`pnpm typecheck`、`pnpm build`、`pnpm docs:build`、playground typecheck 与 build 均已通过；E2E / 视觉回归 / A11y 仍未接入。
- 证据链接：`packages/components-vue/src/DatePicker.spec.ts (5 passed)`、`packages/components-vue/src/Upload.spec.ts (6 passed)`、`packages/components-vue/src/Tree.spec.ts (5 passed)`、`packages/components-vue/src/Cascader.spec.ts (4 passed)`、`packages/components-vue/src/Transfer.spec.ts (4 passed)`、`rtk pnpm test (34 files / 134 tests passed)`。
- 兼容备注：本阶段明确不做 `RangePicker` / `showTime`、拖拽上传 / 分片 / 预览、`checkable` Tree、多选 / 搜索 Cascader、搜索 / 分页 Transfer；这些边界已写回兼容文档与 parity 清单。
- Playground：已同步到 `complex-data-feedback` section，并插在 M3 与 Pro 之间。
- 下一阶段：M5 增强与收尾。
- 下一阶段计划文件：`docs/implementation/stage-plans/M5-pro-release-hardening.md`

### [2026-05-26] M5 - ProSearchTable / Browser Gates / Release Hardening
- 指派范围：本地主线集成，围绕 `ProSearchTable`、`apps/playground`、`Playwright` 门禁与治理真源同步推进。
- 完成内容：
  - `ProSearchTable` 升级到 M5 公共契约：`text/select/date/cascader`、`formValues/queryValues` 分层、duplicate query key 阻断、默认 `id` 行身份、`rowKey` 告警与阻断、row actions 默认刷新与 `refreshOnSuccess: false`。
  - 搜索区切换到 `LForm / LFormItem / LInput / LSelect / LDatePicker / LCascader`，并补 `Enter` 提交、显式查询 / 重置、失败保留旧行、重试入口、`LPagination` 真分页，以及 `beforeQuery` 改分页后 UI 元信息同步。
  - 接入 root browser gates：`test:e2e`、`test:visual`、`test:a11y`，并把 `apps/playground` 变成 deterministic QA surface。
  - `pro-basic` / `pro-error` 场景已落地到 playground，视觉基线与 A11y 门禁已基于 M5 场景更新。
- 证据链接：`packages/pro-vue/src/ProSearchTable.spec.ts (12 passed)`、`packages/pro-vue/src/searchSchema.spec.ts (3 passed)`、`tests/playwright/e2e.spec.ts (5 passed)`、`tests/playwright/visual.spec.ts (6 passed)`、`tests/playwright/a11y.spec.ts (2 passed)`、`playwright.config.ts`。
- 兼容备注：M5 仍明确不做 `dateRange`、inline edit、column pinning、drag sorting、preset persistence、remote schema builders；这些边界已同步到 `packages/pro-vue/COMPATIBILITY.md` 与 parity manifest。
- Playground：`pro-search-table` section 已升级为 M5 showcase，并支持 `pro-basic / pro-error` 场景直达。
- 下一阶段：M6 发版交付与消费端就绪。
- 下一阶段计划文件：`docs/implementation/stage-plans/M6-release-delivery-and-consumer-readiness.md`

### [2026-06-04] M5 - 稳定性回补
- 指派范围：本地主线针对已完成的 M5 合同做收口审查与最小修复。
- 完成内容：
  - 补回归测试，锁定 `beforeQuery` 修改 `pagination.current / pageSize` 后，请求层与表格元信息必须保持一致。
  - 修正 `ProSearchTable` 的分页同步时机，避免生命周期已经切到新页码、UI 仍被旧 `total` 夹回第一页。
  - 收稳 `LDatePicker` 的 `FormItem` 校验测试，改成选择当前面板内真实存在的日期格，不再依赖固定月份。
- 测试结论：fresh `test / typecheck / build / docs:build / playground build / test:e2e / test:visual / test:a11y` 全部通过。
- 证据链接：`packages/pro-vue/src/ProSearchTable.spec.ts (12 passed)`、`packages/components-vue/src/DatePicker.spec.ts (5 passed)`、`rtk pnpm test (35 files / 147 tests passed)`。

### [2026-06-04] M6 - 计划生成
- 指派范围：本地主线基于 M5 完成态，为下一阶段补齐详细执行计划与路线登记。
- 计划方向：不继续先堆新业务能力，优先建立真实外部分发面，包括 package artifact contract、consumer smoke、release dry-run、体积预算与首发 checklist。
- 计划文件：`docs/implementation/stage-plans/M6-release-delivery-and-consumer-readiness.md`
- 路线同步：`docs/implementation/lolita-ui-plan.md`、`docs/implementation/plan.md`、本文件“下一阶段开发规划”已同步到 M6。
- 待确认项：`changesets` 采用与否、首发支持面是否仅限 `Vite + Vue 3 + ESM`、M6 是否止于 dry-run 不做真实 publish。
