# M2 下一阶段开发计划（导航 / 浮层基础，详细执行版）

> 版本：`v1`（已细化到阶段边界、文件级产物、接口契约、测试矩阵、任务卡、门禁与风险项）  
> 适用：M1 choice controls 收口完成后，下一次进入仓库可直接按顺序执行。

## 1. 阶段目标与边界
- 目标组件：`Tabs`、`Menu`、`Tooltip`、`Popover`、`Dropdown`、`Modal`、`Drawer`。
- 目标能力：
  - 建立统一的导航选中态与键盘导航模型。
  - 建立统一的浮层开关契约（受控 / 非受控、外部点击关闭、Esc 关闭）。
  - 为后续复杂反馈组件保留可复用的焦点管理、滚动锁定、状态同步基础。
- 范围边界：
  - 本阶段不做 `Breadcrumb`、`Pagination`、`Popconfirm`、`Notification`、`Tour`。
  - `Menu` 只覆盖单层 `items` 导航，不做 `SubMenu` / 级联菜单。
  - `Dropdown` 只覆盖单层菜单弹出，不做右键菜单、级联菜单、命令面板。
  - `Tooltip` / `Popover` 先覆盖 `top | bottom | left | right` 四向 placement，不在本阶段处理碰撞检测与自动翻转。
  - `Modal` / `Drawer` 先覆盖单实例基础交互，不做多层堆叠策略与复杂动画编排。

## 2. 文件级交付清单（完成后必须存在）

### 2.1 代码产物
- 新增：
  - `packages/components-vue/src/components/Tabs.ts`
  - `packages/components-vue/src/components/Menu.ts`
  - `packages/components-vue/src/components/Tooltip.ts`
  - `packages/components-vue/src/components/Popover.ts`
  - `packages/components-vue/src/components/Dropdown.ts`
  - `packages/components-vue/src/components/Modal.ts`
  - `packages/components-vue/src/components/Drawer.ts`
  - `packages/components-vue/src/components/overlayState.ts`
  - `packages/components-vue/src/components/rovingFocus.ts`
  - `packages/components-vue/src/components/focusScope.ts`
- 修改：
  - `packages/components-vue/src/components/index.ts`
  - `packages/components-vue/src/plugin.ts`
  - `packages/components-vue/src/style.css`

### 2.2 测试产物
- 新增：
  - `packages/components-vue/src/Tabs.spec.ts`
  - `packages/components-vue/src/Menu.spec.ts`
  - `packages/components-vue/src/Tooltip.spec.ts`
  - `packages/components-vue/src/Popover.spec.ts`
  - `packages/components-vue/src/Dropdown.spec.ts`
  - `packages/components-vue/src/Modal.spec.ts`
  - `packages/components-vue/src/Drawer.spec.ts`

### 2.3 文档产物
- 新增：
  - `docs/components/tabs.md`
  - `docs/components/menu.md`
  - `docs/components/tooltip.md`
  - `docs/components/popover.md`
  - `docs/components/dropdown.md`
  - `docs/components/modal.md`
  - `docs/components/drawer.md`
- 修改：
  - `docs/.vitepress/config.ts`
  - `docs/implementation/parity-manifest.json`
  - `docs/memory/components-progress.md`

### 2.4 兼容性产物
- 修改：
  - `packages/components-vue/COMPATIBILITY.md`
  - `docs/implementation/parity-manifest.json`

## 3. 执行顺序（硬顺序，不得乱序）
1. 共享基础：`overlayState.ts` + `rovingFocus.ts` + `focusScope.ts`
2. `Tabs`
3. `Menu`
4. `Tooltip`
5. `Popover`
6. `Dropdown`
7. `Modal`
8. `Drawer`
9. 文档 / 兼容清单 / memory 收口
10. 阶段门禁

顺序理由：
- `Tabs` / `Menu` 先定义“选中项、禁用项、箭头键、焦点游走”的导航基础。
- `Tooltip` / `Popover` 先建立最小浮层开关模型，再让 `Dropdown` 复用。
- `Modal` / `Drawer` 最后处理阻断式浮层，因为它们依赖更完整的焦点、Esc、滚动锁定规则。

## 4. 共享契约（先统一，再实现组件）

### 4.1 浮层开关契约
- 所有浮层类组件优先使用：
  - `open?: boolean`
  - `defaultOpen?: boolean`
  - `disabled?: boolean`
- 统一 emits：
  - `update:open`
  - `openChange`
- 统一行为：
  - 受控模式只 emit，不擅自改内部状态。
  - 非受控模式内部维护 `open` 并与触发事件同步。
  - `disabled` 时忽略触发事件。
  - 外部点击关闭、`Escape` 关闭必须可测试。

### 4.2 导航选中契约
- `Tabs` / `Menu` 统一区分：
  - 受控：`activeKey` / `selectedKeys`
  - 非受控：`defaultActiveKey` / `defaultSelectedKeys`
- 导航型组件必须暴露：
  - 当前活动项 class
  - 键盘移动时的焦点游走
  - 禁用项不可选中

### 4.3 焦点与滚动契约
- `Modal` / `Drawer` 打开后：
  - 焦点进入浮层根节点或首个可聚焦元素。
  - 关闭后焦点返回触发器。
  - body 滚动锁定恢复必须成对发生。
- `Tooltip` / `Popover` / `Dropdown`：
  - 不做完整 focus trap。
  - 必须处理触发器与浮层内容之间的基本可达性。

## 5. 组件级 API 契约（M2 只做这一版）

### 5.1 Tabs
- Props：
  - `activeKey?: string`
  - `defaultActiveKey?: string`
  - `items: Array<{ key: string; label: string; disabled?: boolean }>`
  - `destroyInactiveTabPane?: boolean`
- Emits：
  - `update:activeKey`
  - `change`
- 行为要求：
  - 点击标签切换 active key。
  - 左右箭头在可用 tab 间移动。
  - `Home/End` 跳到首尾 tab。
  - 禁用 tab 不进入焦点与选中流。

### 5.2 Menu
- Props：
  - `items: Array<{ key: string; label: string; disabled?: boolean }>`
  - `selectedKeys?: string[]`
  - `defaultSelectedKeys?: string[]`
  - `mode?: 'vertical' | 'horizontal'`
- Emits：
  - `update:selectedKeys`
  - `select`
- 行为要求：
  - 仅支持单层 items。
  - 垂直模式支持 `ArrowUp/ArrowDown`。
  - 水平模式支持 `ArrowLeft/ArrowRight`。
  - `Enter/Space` 触发选择。

### 5.3 Tooltip
- Props：
  - `title?: string`
  - `open?: boolean`
  - `defaultOpen?: boolean`
  - `trigger?: 'hover' | 'focus'`
  - `placement?: 'top' | 'bottom' | 'left' | 'right'`
  - `disabled?: boolean`
- Emits：
  - `update:open`
  - `openChange`
- 行为要求：
  - hover/focus 打开，离开关闭。
  - 为触发器补齐 `aria-describedby` 关联。

### 5.4 Popover
- Props：
  - `title?: string`
  - `content?: string`
  - `open?: boolean`
  - `defaultOpen?: boolean`
  - `trigger?: 'click' | 'hover'`
  - `placement?: 'top' | 'bottom' | 'left' | 'right'`
  - `disabled?: boolean`
- Emits：
  - `update:open`
  - `openChange`
- 行为要求：
  - click 模式下再次点击 trigger 可关闭。
  - 点击外部区域关闭。

### 5.5 Dropdown
- Props：
  - `menuItems: Array<{ key: string; label: string; disabled?: boolean }>`
  - `open?: boolean`
  - `defaultOpen?: boolean`
  - `trigger?: 'click' | 'hover'`
  - `placement?: 'bottom' | 'bottomLeft' | 'bottomRight'`
  - `disabled?: boolean`
- Emits：
  - `update:open`
  - `openChange`
  - `select`
- 行为要求：
  - 复用 `Menu` 的选中与键盘能力。
  - `ArrowDown` 可从 trigger 直接进入第一项。
  - 选择 item 后默认关闭浮层。

### 5.6 Modal
- Props：
  - `open?: boolean`
  - `title?: string`
  - `closable?: boolean`
  - `maskClosable?: boolean`
  - `keyboard?: boolean`
  - `destroyOnClose?: boolean`
  - `width?: number | string`
- Emits：
  - `update:open`
  - `openChange`
  - `ok`
  - `cancel`
- 行为要求：
  - 遮罩点击关闭受 `maskClosable` 控制。
  - `Escape` 关闭受 `keyboard` 控制。
  - 包含焦点圈定、焦点归还、body 滚动锁定。

### 5.7 Drawer
- Props：
  - `open?: boolean`
  - `title?: string`
  - `placement?: 'left' | 'right'`
  - `closable?: boolean`
  - `maskClosable?: boolean`
  - `keyboard?: boolean`
  - `width?: number | string`
- Emits：
  - `update:open`
  - `openChange`
  - `close`
- 行为要求：
  - 与 `Modal` 共享遮罩、Esc、焦点归还、滚动锁定规则。
  - 仅覆盖左右抽屉，顶部/底部抽屉留待后续。

## 6. 测试矩阵（每项都要有明确用例）
| 组件 / 基础能力 | 单测必须覆盖 | E2E / 交互重点 | A11y / 语义重点 |
| --- | --- | --- | --- |
| `overlayState.ts` | 受控/非受控切换、外部点击关闭、Esc 关闭、disabled 阻断 | Trigger 与浮层开关链路 | `aria-expanded`/`aria-hidden` 状态同步 |
| `rovingFocus.ts` | 首尾移动、跳过 disabled、Home/End 行为 | 键盘游走稳定 | roving tabindex 语义 |
| `focusScope.ts` | 焦点进入、关闭后归还、滚动锁成对恢复 | Modal/Drawer 打开关闭链路 | 焦点不逃逸出阻断浮层 |
| `Tabs` | 默认项、受控项、disabled、箭头键、销毁非激活面板 | 键盘切换 + 点击切换 | `role=tablist/tab/tabpanels` |
| `Menu` | 默认选中、受控选中、方向键、Enter/Space、disabled | 水平/垂直导航 | `role=menu/menuitem` |
| `Tooltip` | hover/focus 触发、disabled、placement class | 鼠标与焦点切换 | `aria-describedby` |
| `Popover` | click/hover 模式、外部点击关闭、受控开关 | 内容交互后关闭策略 | 触发器与内容可达 |
| `Dropdown` | 触发打开、键盘进入菜单、选择后关闭、disabled item | trigger 到菜单再到选择闭环 | trigger `aria-expanded` + menu 语义 |
| `Modal` | maskClosable、keyboard、destroyOnClose、ok/cancel emit | 打开、关闭、焦点归还 | `role=dialog`、`aria-modal=true` |
| `Drawer` | placement class、keyboard、maskClosable、close emit | 打开、关闭、焦点归还 | `role=dialog` 或等价语义 |

## 7. 子代理任务卡（直接派发即可）

### Task A（Core Components Agent）- 共享基础
- Scope：`packages/components-vue/src/components/overlayState.ts`、`rovingFocus.ts`、`focusScope.ts`
- Depends on：无
- 禁止：引入第三方定位 / 焦点管理库；如遇阻断先回报
- DoD：
  - 提供可被 Tabs/Menu/Dropdown/Tooltip/Popover/Modal/Drawer 复用的最小工具层
  - 单测先行

### Task B（Core Components Agent）- Tabs
- Scope：`Tabs.ts` + `Tabs.spec.ts`
- Depends on：Task A
- 禁止：擅自扩展成 `TabPane` 子组件体系
- DoD：
  - `activeKey/defaultActiveKey/items` 跑通
  - 键盘导航与禁用态覆盖

### Task C（Core Components Agent）- Menu
- Scope：`Menu.ts` + `Menu.spec.ts`
- Depends on：Task A
- 禁止：做多层级 / 折叠菜单
- DoD：
  - 单层 items 选中与方向键稳定
  - 为 Dropdown 复用菜单面板打好基础

### Task D（Core Components Agent）- Tooltip / Popover
- Scope：`Tooltip.ts`、`Popover.ts` 及对应 spec
- Depends on：Task A
- 禁止：做碰撞检测、自动翻转、富动画系统
- DoD：
  - 统一 `open/defaultOpen` 契约
  - hover/focus/click 触发模式最小闭环成立

### Task E（Core Components Agent）- Dropdown
- Scope：`Dropdown.ts` + `Dropdown.spec.ts`
- Depends on：Task C、Task D
- 禁止：右键菜单、级联菜单、命令搜索
- DoD：
  - trigger 到 menu 的完整交互闭环
  - 选择后 emit + 关闭规则稳定

### Task F（Core Components Agent）- Modal / Drawer
- Scope：`Modal.ts`、`Drawer.ts` 及对应 spec
- Depends on：Task A
- 禁止：多层 stack manager、复杂动画抽象
- DoD：
  - 焦点圈定、焦点归还、滚动锁定稳定
  - `maskClosable` / `keyboard` / `placement` 覆盖到位

### Task G（Governance Agent）- 文档 / 兼容 / memory
- Scope：`docs/components/**`、`docs/implementation/parity-manifest.json`、`docs/memory/components-progress.md`、`docs/.vitepress/config.ts`
- Depends on：Task B-F 各自完成后分批更新
- 禁止：修改实现代码
- DoD：
  - 每完成一个组件家族就更新文档、差异说明、测试证据、下一组件

### Task H（QA & Release Agent）- 阶段门禁
- Scope：测试执行与证据记录
- Depends on：Task B-G
- 禁止：未经确认修改业务实现
- DoD：
  - 全量门禁通过并把结果沉淀到 memory

## 8. 阶段门禁（必须留痕）
- 每完成一个组件家族后至少运行：
  - `pnpm test`
  - `pnpm typecheck`
  - `pnpm build`
- 阶段收口额外运行：
  - `pnpm docs:build`
- 若仓库在 M2 期间接入额外门禁，则追加：
  - `pnpm playwright test`
  - 视觉回归命令
  - A11y 扫描命令
- 证据规则：
  - 所有结果必须写进 `docs/memory/components-progress.md`
  - 若某类门禁尚未接入，明确写“未接入”，不得写“已通过”

## 9. 风险 / 问题清单（遇到即暂停确认）
1. `open` 是否需要兼容旧别名（如 `visible`）以贴近 ant-design-vue 4.x 的历史接口习惯；若实现阶段发现快照 API 仍依赖别名，先补兼容说明再决定是否实现。
2. `Tooltip` / `Popover` / `Dropdown` 是否默认 `Teleport` 到 `document.body`；若容器裁剪问题影响体验，先确认策略，避免中途重写。
3. `Menu` 是否需要在 M2 就支持多层结构；本计划按“单层 items”控 scope，若业务方要求多层，必须拆成后续小阶段。
4. `Modal` / `Drawer` 的 body scroll lock 若与现有页面布局冲突，先记录复现场景，不允许直接引入外部库规避。
5. 任何一个组件若需要额外子组件体系（例如 `TabPane`、`SubMenu`），先回到治理文档更新边界，再进入实现。

## 10. M2 退出条件（Exit Criteria）
- `Tabs`、`Menu`、`Tooltip`、`Popover`、`Dropdown`、`Modal`、`Drawer` 全部完成并可导出。
- 共享基础文件已复用，不存在每个组件各写一套开关 / 键盘 / 焦点逻辑的情况。
- 兼容差异已同步到 `packages/components-vue/COMPATIBILITY.md` 与 `docs/implementation/parity-manifest.json`。
- `docs/memory/components-progress.md` 已更新：
  - 已完成组件
  - 门禁证据
  - 兼容性摘要
  - M3 下一阶段计划文件路径
- 门禁全绿：`test + typecheck + build + docs:build`。

## 11. M2 完成后的必做动作
1. 新建 `docs/implementation/stage-plans/M3-data-display.md`
2. 将 `Table / Pagination / Tag / Badge / Avatar / List` 顺序细化为详细执行版
3. 在 `docs/memory/components-progress.md` 的“下一阶段开发规划”登记 M3 路径
