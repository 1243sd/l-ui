# M6 Release Delivery And Consumer Readiness

## 1. 阶段目标与边界
- 目标：
  - 把 `Lolita UI` 从“仓库内已验证”推进到“对外部消费者可交付”的状态。
  - 统一各包的发布产物契约：`exports`、`types`、`files`、CSS 入口、README / LICENSE / repository metadata、`sideEffects` 语义。
  - 建立真实 consumer smoke 流程：以打包产物而不是 workspace 源码为输入，验证 `@lolita-ui/components-vue`、`@lolita-ui/theme`、`@lolita-ui/pro-vue` 在独立 Vite + Vue 3 消费端中能安装、构建、启动并完成最小交互。
  - 建立首次 release 的变更说明与 dry-run 流程：版本管理、changelog 来源、`pack` 校验、consumer 验证、体积预算与人工发布清单。
- 不在本阶段范围：
  - 新增重量级业务组件或把 `ProSearchTable` 继续扩成 `dateRange`、inline edit、column pinning、preset persistence、remote schema builders。
  - `Storybook`、第二套 showcase 系统、SSR / Nuxt 支持、React 适配、多框架分发。
  - 真实 `npm publish` 或向外部 registry 推送制品；M6 只做到“可 dry-run 且可人工执行首发”。
  - 重新设计主题视觉语言；本阶段只关注外部分发与消费稳定性。

## 2. 产物清单（文件级）
- 新增文件：
  - `docs/implementation/stage-plans/M6-release-delivery-and-consumer-readiness.md`
  - `apps/consumer-smoke/package.json`
  - `apps/consumer-smoke/index.html`
  - `apps/consumer-smoke/tsconfig.json`
  - `apps/consumer-smoke/vite.config.ts`
  - `apps/consumer-smoke/src/main.ts`
  - `apps/consumer-smoke/src/App.vue`
  - `scripts/release/pack-check.mjs`
  - `scripts/release/size-budget-check.mjs`
  - `scripts/release/consumer-install.mjs`
  - `docs/release/first-release-checklist.md`
  - `docs/release/consumer-installation.md`
  - `.changeset/config.json`
  - `.changeset/README.md`
  - `tests/playwright/consumer.spec.ts`
- 修改文件：
  - `package.json`
  - `playwright.config.ts`
  - `pnpm-workspace.yaml`（仅在 `apps/consumer-smoke` 需要特殊 workspace 处理时才修改；正常情况下可不动）
  - `packages/components-vue/package.json`
  - `packages/pro-vue/package.json`
  - `packages/theme/package.json`
  - `packages/icons/package.json`
  - `packages/tokens/package.json`
  - `packages/utils/package.json`
  - `packages/components-vue/vite.config.ts`
  - `packages/pro-vue/vite.config.ts`
  - `packages/theme/vite.config.ts`
  - `docs/index.md`
  - `docs/.vitepress/config.*`（若 release / install 文档需要进导航）
  - `docs/implementation/lolita-ui-plan.md`
  - `docs/implementation/plan.md`
  - `docs/memory/components-progress.md`
- 兼容性/对齐清单更新文件：
  - `packages/components-vue/COMPATIBILITY.md`
  - `packages/pro-vue/COMPATIBILITY.md`
  - `docs/implementation/parity-manifest.json`

## 3. 执行顺序与依赖
1. 先锁定“发布产物契约”：统一各包 `types` / `exports` / `files` / CSS 入口 / metadata，避免 consumer smoke 建在不稳定包面之上。
2. 再建立 `pack` 与 consumer smoke 链路：先能从 tarball 安装，再能在独立 app 中 build / preview / browser smoke。
3. 然后接版本与变更说明体系：引入 `changesets`、release dry-run 脚本、首发 checklist。
4. 最后再加体积预算、文档与 memory 真源同步，把 M6 收口成“可人工首发”的仓库状态。

## 4. 组件/模块详细规格
### 4.1 Publishable Package Contracts
- 接口契约（package surface）：
  - 所有 publishable package 的 `types` 必须指向 `dist/*.d.ts`，不允许继续指向 `src/index.ts`。
  - `exports` 必须显式包含：
    - root import entry
    - types entry
    - CSS entry（对外承诺样式路径的包）
  - `files` 必须只包含发布所需产物与必要文档；默认不再把整个 `src/` 暴露为发布内容。
  - `repository`、`license`、`homepage`、`keywords`、`sideEffects` 必须按对外分发语义补齐。
  - `components-vue` 与 `pro-vue` 的样式契约必须稳定为显式 CSS 入口，不再依赖消费方读取源码目录。
- 行为约束：
  - `components-vue` / `pro-vue` / `theme` 必须产出真正可发布的 `dist` 类型声明。
  - `components-vue` 的库构建要消除“named and default exports together”这类会误导消费者的分发警告，统一成清晰的 named exports 契约。
  - `pack` 后 tarball 里不得出现测试文件、未编译 TypeScript 源文件、无用 snapshot、workspace 内部记忆文件。
  - `@lolita-ui/utils` 与 `@lolita-ui/tokens` 当前已经是 `dist` 类型面，M6 只做元数据对齐，不重做其分发结构。
- 差异策略（相对 AntD / 成熟库）：
  - M6 不追求多格式全家桶，只保证 Vue 3 + ESM + CSS 入口的主消费路径干净、稳定、可文档化。
  - 不引入额外 bundler compatibility matrix；先把 Vite + Vue 3 的首发体验打到极致。
- 测试矩阵：
  - `pnpm pack --dry-run` 能列出预期文件集。
  - `types` 解析来自 `dist` 而不是 workspace `src`。
  - CSS 路径能在 consumer smoke app 中直接 import。
  - `components-vue` / `pro-vue` named import 在外部 app 中可通过构建。

### 4.2 Consumer Smoke Application
- 接口契约（app surface）：
  - `apps/consumer-smoke` 必须只通过 package entry 消费 `@lolita-ui/*`，不得使用 workspace source alias。
  - app 至少同时消费：
    - `@lolita-ui/theme`
    - `@lolita-ui/components-vue`
    - `@lolita-ui/pro-vue`
  - app 必须包含一个基础组件区和一个 `ProSearchTable` 区，证明基础层与 Pro 层都可被外部消费。
- 行为约束：
  - app 安装来源必须来自本地打包产物（tarball 或等价 dry-run install 结果），而不是直接 workspace link。
  - app 的 UI 只做最小 deterministic surface，不在 M6 额外引入复杂 mock server。
  - consumer smoke 至少验证：
    - 样式已生效
    - 主题 / `ConfigProvider` 可工作
    - `ProSearchTable` 能渲染、查询、分页一次
  - browser smoke 使用现有 `Playwright` 栈；不再引入第二套浏览器测试框架。
- 差异策略（相对 AntD / 成熟库）：
  - 先验证“最真实的首个消费端”而不是做复杂模板生态。
  - 不在 M6 覆盖 Nuxt / SSR / CDN script-tag 消费路径。
- 测试矩阵：
  - `pnpm consumer:build`：consumer app 能 build。
  - `pnpm test:consumer`：consumer app preview 下至少有一个 browser smoke 通过。
  - `pack:check`：consumer install 使用 tarball 成功，且 lockfile / install 结果稳定。

### 4.3 Versioning, Changelog, And Release Dry-Run
- 接口契约（release workflow）：
  - 采用 `changesets` 作为版本与变更说明来源。
  - root scripts 至少补齐：
    - `pack:check`
    - `consumer:build`
    - `test:consumer`
    - `size:check`
    - `release:dry-run`
  - `release:dry-run` 必须串起：构建、打包、consumer 安装、consumer build / browser smoke、size budget、changeset 状态检查。
- 行为约束：
  - M6 不直接发版，但必须让维护者可以按 checklist 走完首发前最后一步，只差 registry credentials 与最终 publish 确认。
  - changelog 生成源要明确，不允许继续靠手工散落记录拼接 release note。
  - package metadata 若不完整，不允许进入 dry-run 通过态。
- 差异策略（相对成熟库）：
  - 不引入复杂 monorepo release bot；先用 `changesets + dry-run scripts + manual checklist` 打稳首发路径。
  - 不在 M6 承诺自动 GitHub Release / npm provenance；若后续需要再做 M7+ 治理增强。
- 测试矩阵：
  - `changeset status` 可跑通。
  - `release:dry-run` 通过且能给出清晰失败位置。
  - 首发 checklist 能对应到仓库中的真实命令和产物。

### 4.4 Bundle, Tarball, And Delivery Budgets
- 接口契约（budget surface）：
  - 建立 package-level budget script，至少覆盖：
    - built JS artifact size
    - built CSS artifact size
    - packed tarball size
  - budget 结果必须是可机器校验的，不接受只写在 PR 描述里。
- 行为约束：
  - 预算采用“锁定 M5/M6 初始基线 + 回归阈值”的方式，而不是拍脑袋写绝对值。
  - 默认阈值：
    - 单包 built JS/CSS 不得相对基线上涨超过 `15%`
    - tarball 不得相对基线上涨超过 `20%`
  - 若业务价值充分、必须突破阈值，必须同步更新预算文件与兼容备注，并写明原因。
- 差异策略（相对成熟库）：
  - M6 优先做轻量 size regression gate，不引入复杂 bundle SaaS。
  - 关注“交付成本”而不是追求极端压缩技巧。
- 测试矩阵：
  - `pnpm size:check` 通过。
  - 预算文件与脚本能在 CI / 本地重复运行。
  - 超预算时输出指向具体 package 与产物类型。

## 5. 子代理任务卡
### Task A（Release Contracts Agent）
- Scope：
  - 统一各 package 的 `package.json` 发布面。
  - 调整 `vite.config.ts` / 类型产物 / CSS 导出策略。
  - 产出 pack 校验脚本。
- 禁止项：
  - 不新增业务组件能力。
  - 不改 `ProSearchTable` 公共行为。
  - 不引入第二套 bundler / doc system。
- 交付物：
  - package contracts diff
  - `pack:check`
  - budget baseline 方案
- DoD：
  - tarball 文件集干净，`types` 指向 `dist`，根脚本可跑。

### Task B（Consumer Smoke Agent）
- Scope：
  - 建立 `apps/consumer-smoke`
  - 让其基于打包产物安装并完成 build / browser smoke
  - 接入 `Playwright` consumer project 与 root script
- 禁止项：
  - 不直接复用 `apps/playground` 作为 consumer 验证替身。
  - 不从 workspace source alias 取组件源码。
- 交付物：
  - consumer smoke app
  - `test:consumer`
  - 至少一条外部消费端浏览器 smoke
- DoD：
  - 失败时能明确定位是 install、build、style import 还是 runtime 交互问题。

### Task C（Governance And Release Docs Agent）
- Scope：
  - `changesets` 配置
  - release checklist / consumer install docs
  - `memory` / `parity` / 路线图 / compatibility 同步
- 禁止项：
  - 不代替实现层拍定额外业务 API。
  - 不把“人工流程”写成与仓库现状不符的假文档。
- 交付物：
  - `docs/release/*`
  - 路线图更新
  - `components-progress.md` 与 parity 同步
- DoD：
  - 外部维护者只看文档就能知道怎么做 first release dry-run。

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
  - M5 既有门禁继续全绿，说明 M6 没破坏内部质量面。
  - `pack:check` 证明 tarball 文件集、入口、类型、样式面都正确。
  - `consumer:build` 与 `test:consumer` 证明对外消费端可安装、可构建、可最小交互。
  - `size:check` 证明交付体积没有无感膨胀。
  - `release:dry-run` 串起首发前所有必要动作，并在本地可重复执行。

## 7. 风险与待确认项（必须提问，不得猜）
- 风险：
  - `components-vue` 当前没有独立 `dist` CSS 产物，若样式导出策略选错，会让外部消费端继续依赖源码路径。
  - package `types` 从 `src` 切到 `dist` 后，构建链若没有稳定产出声明文件，consumer 类型面会先碎掉。
  - `consumer-smoke` 若仍意外吃到 workspace alias，会让门禁失真，误以为外部消费端已被覆盖。
  - `changesets` 一旦引入，会对后续版本管理方式形成长期约束，不能边做边改口径。
- 待确认项：
  - 是否接受在 M6 采用 `changesets` 作为版本与 changelog 的唯一来源？推荐：接受。
  - 首次外部消费支持面是否只锁 `Vite + Vue 3 + ESM`，把 `Nuxt / SSR` 明确延后？推荐：只锁 `Vite + Vue 3 + ESM`。
  - M6 结束时是否只做到“可 dry-run + 可人工首发”，而把真实 registry publish 放在后续人工动作？推荐：是。
  - 首发包是否按 npm public scoped package 设计 metadata 与 checklist？推荐：按 public scoped package 设计，但不在 M6 真发。

## 8. 退出条件与下一阶段动作
- Exit Criteria：
  - 所有 publishable package 的发布面都从“workspace 内可用”升级为“外部 consumer 可安装且类型/样式/入口稳定”。
  - `consumer-smoke` 基于 tarball 的 build 与 browser smoke 通过。
  - release dry-run、changeset 状态、体积预算、docs / memory / compatibility / parity 全部同步。
  - M5 现有 UX / visual / a11y / browser gates 不被 M6 回归破坏。
- 组件类任务在测试通过后，必须同步更新 `apps/playground` showcase，保证最新完成组件可见。
- 若 showcase 未更新，不得把组件写入“完成”或“已交付”。
- 下一阶段计划文件名（预留）：
  - `docs/implementation/stage-plans/M7-advanced-pro-data-workflows.md`
