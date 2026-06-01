# Mx 阶段开发计划（详细执行版模板）

## 1. 阶段目标与边界
- 目标：
- 不在本阶段范围：

## 2. 产物清单（文件级）
- 新增文件：
- 修改文件：
- 兼容性/对齐清单更新文件：

## 3. 执行顺序与依赖
1.
2.
3.

## 4. 组件/模块详细规格
### 4.1 <组件A>
- 接口契约（props/emits/slots/methods）：
- 行为约束：
- 差异策略（相对 AntD）：
- 测试矩阵：

### 4.2 <组件B>
- 接口契约（props/emits/slots/methods）：
- 行为约束：
- 差异策略（相对 AntD）：
- 测试矩阵：

## 5. 子代理任务卡
### Task A（<Agent 名称>）
- Scope：
- 禁止项：
- 交付物：
- DoD：

### Task B（<Agent 名称>）
- Scope：
- 禁止项：
- 交付物：
- DoD：

## 6. 阶段门禁
- 必跑命令：
  - `pnpm test`
  - `pnpm typecheck`
  - `pnpm build`
  - `pnpm docs:build`
- 通过标准：

## 7. 风险与待确认项（必须提问，不得猜）
- 风险：
- 待确认项：

## 8. 退出条件与下一阶段动作
- Exit Criteria：
- 组件类任务在测试通过后，必须同步更新 `apps/playground` showcase，保证最新完成组件可见。
- 若 showcase 未更新，不得把组件写入“完成”或“已交付”。
- 下一阶段计划文件名（预留）：
