# Lolita UI 组件库实施计划（v1）

## 1. 目标与边界
- 目标：建设 `@lolita-ui/*` 组件库，能力覆盖 ant-design-vue 主流组件，视觉统一为“轻可爱”。
- 兼容策略：优先保证核心组件 `80%` API 兼容；差异必须文档化，不允许隐式行为变化。
- 范围边界：当前仅 `Vue 3 + Vite`，不包含 `Vue 2/Nuxt SSR`。
- 代码约束：组件库开发优先复用公共能力，禁止为单组件引入一次性废代码。

## 2. 包结构与主入口
- Monorepo 包结构：
  - `@lolita-ui/tokens`
  - `@lolita-ui/theme`
  - `@lolita-ui/components-vue`
  - `@lolita-ui/icons`
  - `@lolita-ui/utils`
  - `@lolita-ui/pro-vue`（承载 `ProSearchTable`）
- 对外主入口：`ConfigProvider`、`ThemeProvider`、`createLolitaTheme`、`install(app)`、按需导出。

## 3. 分阶段落地（M0-M6）
| 阶段 | 目标 | 关键交付 | 退出条件 |
| --- | --- | --- | --- |
| M0 基础能力 | 打稳工程与主题基础 | token、主题变量、Provider、构建与测试基线 | 构建/类型/单测链路可跑通 |
| M1 表单核心 | 首批高频输入组件 | Button、Input、Select、Form、FormItem、Checkbox、Radio、Switch | 核心交互+受控/非受控测试通过 |
| M2 导航与浮层 | 导航与反馈主干 | Menu、Tabs、Dropdown、Modal、Drawer、Tooltip、Popover | 键盘导航与弹层行为稳定 |
| M3 数据展示主干 | 列表与表格基础 | Table、Pagination、Tag、Badge、Avatar、List | 排序/筛选/分页联动测试通过 |
| M4 复杂组件 | 高复杂度业务组件 | DatePicker、Upload、Tree、Cascader、Transfer | 边界场景与错误处理稳定 |
| M5 增强与收尾 | 业务增强与发布治理 | ProSearchTable、兼容清单、文档补全、发布门禁 | 全门禁通过，可独立发版 |
| M6 发版交付与消费端就绪 | 首次外部分发与 consumer 验证 | package 产物契约、consumer smoke、changesets、release dry-run、体积预算 | `pack/consumer/release` 门禁全绿，可人工执行首发 |

## 4. 子代理职责与约束（防止记忆混乱）
| 子代理 | 只负责 | 禁止做 |
| --- | --- | --- |
| Governance Agent | 计划、进度、兼容性文档与 memory 维护 | 改组件实现代码 |
| Theme Agent | tokens、主题变量、`ThemeProvider` | 改业务组件逻辑 |
| Core Components Agent | 基础组件 API/交互实现 | 改发布流程与治理文档 |
| Pro Components Agent | `ProSearchTable` 及其生命周期能力 | 修改基础组件公共协议 |
| QA & Release Agent | 单测/E2E/视觉回归/A11y/发版门禁 | 擅自新增业务功能 |

执行规则：
- 一次只推进一个组件或一个小批次（同类组件）。
- 未完成测试证据前，不得将组件状态标记为“完成”。
- 每次完成后，必须更新 `docs/memory/components-progress.md` 并写明“下一组件”。
- 每个组件测试通过后，必须同步更新 `apps/playground` 的展示页；showcase 未更新，不得视为完成。
- `apps/playground` 是当前本地 showcase 唯一准绳，禁止再以根目录 `src/` 作为展示入口。
- 每个阶段完成后，必须产出下一阶段计划文件：`docs/implementation/stage-plans/*.md`。
- 每个“下一阶段计划文件”必须是详细执行版，至少包含：边界、文件级产物、接口契约、测试矩阵、子代理任务卡、门禁、风险提问项。

## 5. 测试与发布门禁
- 单测：`Vitest + Vue Test Utils`，覆盖 `props/emits/slots` 与边界行为。
- E2E：`Playwright`，覆盖表单流、弹层、分页、上传、键盘导航。
- 视觉回归：`light/dark + 核心断点` 截图比对。
- 无障碍：以 `WCAG AAA` 为目标；未满足项必须在兼容备注中声明替代方案。
- 发版门禁：类型、构建、单测、E2E、视觉回归、A11y 全通过后允许发布。

## 6. 文档与记忆治理
- 组件完成与下一步排期统一记录在：
  - `docs/memory/components-progress.md`
- 更新流程说明：
  - `docs/memory/README.md`
- 所有兼容差异需沉淀为可追踪条目（已对齐/行为差异/暂不支持/替代方案）。
