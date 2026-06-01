# M1 下一阶段开发计划（详细执行版）

> 版本：`v2`（已细化到接口、文件、测试矩阵、交付顺序）  
> 适用：下次进入仓库后可直接执行，不再做二次拆解。

## 1. 阶段目标与范围边界
- 目标组件：`Input`、`Form/FormItem`、`Select`、`Checkbox/Radio/Switch`。
- API 策略：保持 ant-design-vue 常用行为与命名习惯（80% 兼容）。
- 范围边界：
  - 本阶段不做 `InputNumber`、`DatePicker`、`TreeSelect`。
  - 不新增与表单无关的视觉组件。
  - 不重构 `M0` 已稳定能力，除非修复阻断问题。

## 2. 产物清单（完成后必须存在）
- 代码产物：
  - `packages/components-vue/src/components/Input.ts`
  - `packages/components-vue/src/components/Form.ts`
  - `packages/components-vue/src/components/FormItem.ts`
  - `packages/components-vue/src/components/Select.ts`
  - `packages/components-vue/src/components/Checkbox.ts`
  - `packages/components-vue/src/components/Radio.ts`
  - `packages/components-vue/src/components/Switch.ts`
- 样式产物：
  - 在 `packages/components-vue/src/style.css` 追加上述组件样式（token 驱动）。
- 测试产物：
  - `Input.spec.ts`、`Form.spec.ts`、`FormItem.spec.ts`、`Select.spec.ts`、`ChoiceControls.spec.ts`
- 文档产物：
  - `docs/components/input.md`
  - `docs/components/form.md`
  - `docs/components/select.md`
  - `docs/components/choice-controls.md`
- 兼容性产物：
  - 更新 `packages/components-vue/COMPATIBILITY.md`
  - 更新 `docs/implementation/parity-manifest.json`

## 3. 依赖与执行顺序（硬顺序）
1. Input（P0）
2. Form / FormItem（P1，依赖 Input）
3. Select（P2，依赖 FormItem）
4. Checkbox / Radio / Switch（P3，依赖 Form 基线）
5. 文档与兼容清单补齐（P4）
6. 门禁验收（P5）

## 4. 组件级详细规格

### 4.1 Input（P0）
- 必须支持：
  - `v-model:value`
  - `size`（默认继承 `ConfigProvider`）
  - `status: 'default' | 'error' | 'warning'`
  - `disabled`
  - `allowClear`
  - `placeholder`
- 事件：
  - `update:value`
  - `change`
  - `focus`
  - `blur`
- 差异策略：
  - 若与 AntD 行为不一致，必须在 `COMPATIBILITY.md` 明确记录。
- 测试矩阵：
  - 受控值更新
  - 非受控输入
  - 清空按钮显示/点击
  - 禁用态禁止输入
  - status class 与 aria 属性

### 4.2 Form / FormItem（P1）
- Form 必须支持：
  - `model`
  - `rules`（最小规则集：`required` + `message`）
  - `validate()`、`resetFields()`、`submit`
- FormItem 必须支持：
  - `label`
  - `name`
  - `required`
  - `help/error` 展示
  - 与 Input/Select/ChoiceControls 状态联动
- 测试矩阵：
  - 必填校验触发
  - 错误信息展示
  - 提交流程中断/通过
  - resetFields 行为

### 4.3 Select（P2）
- 必须支持：
  - `v-model:value`
  - `options`
  - `disabled`
  - `placeholder`
  - `allowClear`
- 交互必须支持：
  - 展开/收起
  - 选中回填
  - 键盘导航（↑/↓/Enter/Escape）
- 测试矩阵：
  - 点击展开与关闭
  - 选项选中后更新值
  - 键盘导航与确认
  - 禁用态行为

### 4.4 Checkbox / Radio / Switch（P3）
- 必须支持：
  - 受控/非受控双模式
  - `disabled`
  - 与 FormItem 错误态展示联动
- 测试矩阵：
  - 默认值与切换行为
  - 受控模式 emit 行为
  - 禁用态不可切换
  - 表单提交流中的值采集

## 5. 子代理任务卡（可直接复制执行）

### Task A（Core Components Agent）- Input
- Scope：`packages/components-vue/**`
- 禁止：改 `docs/memory/**` 以外的治理流程文件
- DoD：Input API + tests + compatibility notes

### Task B（Core Components Agent）- Form/FormItem
- Scope：`packages/components-vue/**`
- 禁止：擅自引入第三方校验库
- DoD：最小校验链路稳定 + tests

### Task C（Core Components Agent）- Select
- Scope：`packages/components-vue/**`
- 禁止：做多选/远程搜索（留到后续阶段）
- DoD：单选与键盘可达稳定 + tests

### Task D（Core Components Agent）- Checkbox/Radio/Switch
- Scope：`packages/components-vue/**`
- 禁止：各写一套重复状态逻辑
- DoD：共享受控状态处理 + tests

### Task E（Governance Agent）- 文档/记忆
- Scope：`docs/implementation/**`, `docs/memory/**`
- 禁止：修改组件实现
- DoD：每个组件通过后更新 memory、parity、下一组件

### Task F（QA & Release Agent）- 阶段门禁
- Scope：测试与 CI 配置
- 禁止：未经确认修改业务实现
- DoD：`pnpm test`、`pnpm typecheck`、`pnpm build`、`pnpm docs:build` 全绿并附证据

## 6. 执行门禁（每个组件完成后都要跑）
- 必跑命令：
  - `pnpm test`
  - `pnpm typecheck`
  - `pnpm build`
- 阶段收口额外命令：
  - `pnpm docs:build`
- 证据要求：
  - 命令结果写入 `docs/memory/components-progress.md`。

## 7. 强制规则（硬约束）
- 不理解、不合理、需求冲突：**先问用户，不允许猜**。
- 不得越过 Owner Scope 改动他人区域。
- 未附测试证据不得标记“完成”。
- 未产出下一阶段计划文件，不算阶段完成。

## 8. M1 退出条件（Exit Criteria）
- `Input`、`Form/FormItem`、`Select`、`Checkbox/Radio/Switch` 全部完成。
- 兼容性差异全部记录在 `COMPATIBILITY.md` 与 `parity-manifest.json`。
- 门禁全绿：`test + typecheck + build + docs:build`。
- `docs/memory/components-progress.md` 已更新：
  - 已完成组件
  - 测试证据
  - 兼容性差异
  - **M2 计划文件路径**

## 9. M1 完成后的必做动作
1. 新建 `docs/implementation/stage-plans/M2-navigation-overlay.md`
2. 填写 M2 组件顺序、任务卡、门禁
3. 在 `docs/memory/components-progress.md` 的“下一阶段开发规划”登记 M2 路径
