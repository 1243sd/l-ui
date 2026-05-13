# Lolita UI Subagent 运行手册

> 目标：让子代理“可直接执行”，不是只写在文档里。

## 强制规则（全部必须遵守）
- 每个 Subagent 以“对应区域顶级工程师”标准交付，不写一次性拼凑代码。
- 只修改自己职责目录，不越权修改其他包。
- 优先复用现有公共能力，禁止重复实现同类逻辑。
- 组件或能力完成后，测试必须通过，才能标记完成。
- 每次完成后必须更新 `docs/memory/components-progress.md`。
- **遇到不理解、不合理、需求冲突：必须先问用户，不允许猜。**

## 任务分配协议（Assignment Protocol）
1. Governance Agent 从 `Next Component Queue` 选择唯一任务，避免多人同时改同一组件。
2. 生成任务卡（见下方模板），明确：指派 Subagent、可改路径、不可改范围、验收测试。
3. 被指派 Subagent 先做“理解确认”：
   - 复述目标与边界。
   - 列出疑点/不合理点；有疑点立即问用户，未澄清前不进入实现。
4. 实现完成后提交交接包（Handoff Checklist 全项通过）再交给 QA Agent 验收。
5. QA 通过后，Governance Agent 更新 memory 并指派下一个组件。

## 交接清单（Handoff Checklist）
- 变更文件列表（确认全部在 Owner Scope 内）。
- 已执行测试与结果（unit/e2e/visual/a11y）。
- 测试证据链接（日志、报告、CI 记录）。
- 兼容性备注（已对齐/差异/暂不支持+替代方案）。
- 已更新 `docs/memory/components-progress.md`（含下一组件建议）。

## Done 标准（任务关闭条件）
- 需求目标达成，且未引入明显废代码或重复实现。
- 所有门禁测试通过，失败项有阻断说明并已同步用户。
- 兼容性备注完整可追溯。
- memory 记录完整（完成项、证据、下一步）。
- 如出现任何不清楚或不合理点，已有提问记录与用户结论。

## Agent 分工与职责边界

### Governance Agent
- 职责：维护计划、队列、兼容清单、memory；控制任务分配与阶段门禁。
- Owner Scope：`docs/implementation/**`, `docs/memory/**`
- 限制：不改 `packages/**` 实现代码。

### Theme Agent
- 职责：维护 token、主题变量、ThemeProvider 与主题切换稳定性。
- Owner Scope：`packages/tokens/**`, `packages/theme/**`
- 限制：不改业务组件与 Pro 组件逻辑。

### Core Components Agent
- 职责：维护基础组件与安装入口，保持 AntD 风格 API 习惯。
- Owner Scope：`packages/components-vue/**`
- 限制：不改 Pro 组件和治理文档。

### Pro Components Agent
- 职责：维护 `@lolita-ui/pro-vue`（如 `ProSearchTable`）与业务增强能力。
- Owner Scope：`packages/pro-vue/**`
- 限制：不改基础公共协议，除非先问用户并得到确认。

### QA & Release Agent
- 职责：维护测试门禁与发版检查，给出可复现结论。
- Owner Scope：测试与 CI 相关配置目录
- 限制：不直接改业务实现，除非收到明确授权。

## 任务卡模板（可直接复制）
```md
Task: <component/stage>
Assigned Subagent: <name>
Owner Scope: <paths>
Out of Scope: <must not change>
Goal: <single objective>
Acceptance Tests: <unit/e2e/visual/a11y>
Mandatory Rule: 有不理解或不合理点先问用户，不猜。
```
