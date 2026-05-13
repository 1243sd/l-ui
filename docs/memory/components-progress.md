# 组件进度记忆（持续维护）

> 本文件是组件库唯一进度真源。每次“阶段/组件测试通过”后必须追加记录。

## 已完成组件（Completed Components）
| 日期 | 阶段 | 组件 | 指派子代理 | 状态 | 交付证据链接 |
| --- | --- | --- | --- | --- | --- |
| 2026-05-13 | M0 | ConfigProvider | Core Components Agent | 已完成 | `packages/components-vue/src/components/ConfigProvider.ts` |
| 2026-05-13 | M0 | ThemeProvider | Theme Agent + Core Components Agent | 已完成 | `packages/theme/src/LolitaThemeProvider.ts` |
| 2026-05-13 | M0 | LButton | Core Components Agent | 已完成 | `packages/components-vue/src/components/Button.ts` |
| 2026-05-13 | M0 | LSpace | Core Components Agent | 已完成 | `packages/components-vue/src/components/Space.ts` |
| 2026-05-13 | M0 | ProSearchTable | Pro Components Agent | 已完成 | `packages/pro-vue/src/ProSearchTable.vue` |

## 测试状态（Test Status）
| 组件 | 指派子代理 | 单测 | E2E | 视觉回归 | A11y | 证据链接（单测/E2E/视觉/A11y） |
| --- | --- | --- | --- | --- | --- | --- |
| ConfigProvider | Core Components Agent | 通过（间接：Button 继承配置） | 未执行 | 未执行 | 未执行 | 单测=`packages/components-vue/src/Button.spec.ts`；E2E=`待 M1`；视觉=`待 M1`；A11y=`待 M1` |
| ThemeProvider | Theme Agent | 通过（主题创建与覆盖） | 未执行 | 未执行 | 未执行 | 单测=`packages/theme/src/createLolitaTheme.spec.ts`；E2E=`待 M1`；视觉=`待 M1`；A11y=`待 M1` |
| LButton | Core Components Agent | 通过 | 未执行 | 未执行 | 未执行 | 单测=`packages/components-vue/src/Button.spec.ts`；E2E=`待 M2`；视觉=`待 M1`；A11y=`待 M1` |
| LSpace | Core Components Agent | 覆盖在组件单测链路内 | 未执行 | 未执行 | 未执行 | 单测=`pnpm test (2026-05-13)`；E2E=`待 M2`；视觉=`待 M1`；A11y=`待 M1` |
| ProSearchTable | Pro Components Agent | 通过 | 未执行 | 未执行 | 未执行 | 单测=`packages/pro-vue/src/ProSearchTable.spec.ts`；E2E=`待 M2`；视觉=`待 M1`；A11y=`待 M1` |

## 兼容性备注（Compatibility Notes）
| 组件 | 对齐状态 | 差异说明 | 替代方案/计划 |
| --- | --- | --- | --- |
| ConfigProvider | 部分对齐 | 仅支持 `prefixCls/componentSize/themeMode` | M1 增加 locale/direction |
| ThemeProvider | 部分对齐 | 仅做主题透传，不含子树隔离主题 | M2 增强多层主题作用域 |
| LButton | 部分对齐 | 用 `round` 替代完整 `shape` 枚举 | M1 增补 `shape` |
| LSpace | 部分对齐 | 缺 compact mode | M1 增补 compact |
| ProSearchTable | 部分对齐 | 分页 UI 轻量，schema 仅 text/select | M1 增加高级字段与完整分页器 |

## 下一组件队列（Next Component Queue）
| 优先级 | 阶段 | 组件 | 前置条件 | 完成定义（DoD） |
| --- | --- | --- | --- | --- |
| P0 | M1 | Input | M0 完整通过（build/test/typecheck） | `v-model:value` + 状态样式 + 单测通过 |
| P1 | M1 | Form / FormItem | Input 可用 | 校验、错误提示、提交流单测通过 |
| P2 | M1 | Select | Input 与 Form 基线稳定 | 下拉交互 + 键盘可达性通过 |
| P3 | M1 | Checkbox / Radio / Switch | Form 能承载受控态 | 受控/非受控行为覆盖 |

## 追加记录模板（每次通过后追加）
```md
### [YYYY-MM-DD] <阶段> - <组件名>
- 指派子代理：<Subagent 名称>
- 完成内容：
- 测试结论：单测(通过/失败)、E2E(通过/失败)、视觉回归(通过/失败)、A11y(通过/失败)
- 证据链接（必填）：单测=<url/path>；E2E=<url/path>；视觉回归=<url/path>；A11y=<url/path>
- 兼容性备注：已对齐 / 行为差异 / 暂不支持 + 替代方案
- 下一组件：<组件名>（原因：依赖关系/业务优先级）
```

### [2026-05-13] M0 - Foundation + ProSearchTable
- 指派子代理：Theme Agent / Core Components Agent / Pro Components Agent / Governance Agent
- 完成内容：
  - 建立 `@lolita-ui/*` monorepo 基础结构。
  - 落地 tokens/theme/components-vue/icons/utils/pro-vue 首批可用能力。
  - 实现 `ConfigProvider`、`ThemeProvider`、`LButton`、`LSpace`、`ProSearchTable`。
  - 建立 parity manifest 与 subagent 运行手册。
- 测试结论：单测(通过)、E2E(未执行)、视觉回归(未执行)、A11y(未执行)
- 证据链接（必填）：单测=`pnpm test (20 passed, 2026-05-13)`；E2E=`待 M2`；视觉回归=`待 M1`；A11y=`待 M1`
- 兼容性备注：核心 API 部分对齐，差异项已记录到 `docs/implementation/parity-manifest.json`
- 下一组件：Input（原因：M1 表单体系与 Pro schema 依赖）
