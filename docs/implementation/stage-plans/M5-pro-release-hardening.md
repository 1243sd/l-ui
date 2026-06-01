# M5 Pro Release Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `ProSearchTable` to the locked M5 contract and wire browser-level release gates (`E2E`, visual, `A11y`) into the repository using `apps/playground` as the single QA surface.

**Architecture:** Build the browser-gate skeleton first so `apps/playground` becomes a deterministic QA surface, then evolve `ProSearchTable` against that live harness with TDD, and finally update docs/parity/memory so repository truth matches executable behavior. Keep the runtime lean by composing existing Lolita primitives and only widening base-component contracts when the locked M5 public API truly depends on them.

**Tech Stack:** Vue 3, Vitest, Vite, VitePress, Playwright, `@axe-core/playwright`, `@lolita-ui/components-vue`, `@lolita-ui/pro-vue`, `@lolita-ui/utils`

---

## 1. 执行前提与范围

- 当前工作区在 `main`，且已有未提交改动；M5 执行时只修改与 browser gates、`ProSearchTable`、playground、docs truth sources 直接相关的文件。
- 本阶段不做真实发版，不做 `Storybook`，不做第二套视觉回归系统，不做 Ant Design Pro 全量克隆。
- Browser gate 依赖只允许进入 `devDependencies`。
- `searchSchema` 的 `select` 分支允许 `boolean` 值；如果现有 `LSelect` 不能承载，就在本阶段一起扩展基础组件契约，禁止在 Pro 层做隐式字符串映射。

## 2. 文件清单

### 2.1 新增文件

- `D:\project\lo\l-ui\playwright.config.ts`
- `D:\project\lo\l-ui\tests\playwright\e2e.spec.ts`
- `D:\project\lo\l-ui\tests\playwright\visual.spec.ts`
- `D:\project\lo\l-ui\tests\playwright\a11y.spec.ts`
- `D:\project\lo\l-ui\packages\pro-vue\src\searchSchema.ts`

### 2.2 重点修改文件

- `D:\project\lo\l-ui\package.json`
- `D:\project\lo\l-ui\apps\playground\src\App.vue`
- `D:\project\lo\l-ui\docs\.vitepress\config.ts`
- `D:\project\lo\l-ui\docs\pro\pro-search-table.md`
- `D:\project\lo\l-ui\docs\implementation\parity-manifest.json`
- `D:\project\lo\l-ui\docs\memory\components-progress.md`
- `D:\project\lo\l-ui\packages\components-vue\src\components\Select.ts`
- `D:\project\lo\l-ui\packages\components-vue\src\Select.spec.ts`
- `D:\project\lo\l-ui\packages\pro-vue\COMPATIBILITY.md`
- `D:\project\lo\l-ui\packages\pro-vue\src\types.ts`
- `D:\project\lo\l-ui\packages\pro-vue\src\ProSearchTable.vue`
- `D:\project\lo\l-ui\packages\pro-vue\src\ProSearchTable.spec.ts`

## 3. 执行顺序

1. Browser gate 工具链与 root scripts
2. Playground deterministic QA surface
3. Visual / `A11y` smoke coverage
4. `searchSchema` 契约与 payload 分层
5. `ProSearchTable` 组件重构与默认交互语义
6. `rowKey` / actions / pagination 收口
7. Pro docs 与 playground Pro 场景
8. Compatibility / parity / memory / nav / final gates

顺序理由：

- 先让 playground 变成机器可测表面，后续 Pro 改动才不会在阶段末尾集中补门禁。
- `searchSchema` 与 payload 分层是 `ProSearchTable` 的核心边界，必须先于 UI 行为细节锁定。
- `rowKey` / actions / pagination 依赖前面的 request 和 form contract，放在后半段更稳。

## 4. 任务拆解

### Task 1: Browser Gate Skeleton

**Files:**

- Create: `D:\project\lo\l-ui\playwright.config.ts`
- Create: `D:\project\lo\l-ui\tests\playwright\e2e.spec.ts`
- Modify: `D:\project\lo\l-ui\package.json`

- [ ] **Step 1: 写失败的 browser skeleton 用例**

```ts
import { expect, test } from '@playwright/test';

test.describe('playground QA shell', () => {
  test('loads shell scenario in light mode', async ({ page }) => {
    await page.goto('/?scenario=shell&theme=light&motion=off');
    await expect(page.getByTestId('qa-shell')).toBeVisible();
  });
});
```

- [ ] **Step 2: 运行命令确认红灯来自缺少脚本/Playwright**

Run: `pnpm test:e2e`
Expected: FAIL with missing script or missing Playwright dependency/config

- [ ] **Step 3: 增加 root scripts 与 browser-gate devDependencies**

```json
{
  "scripts": {
    "test:e2e": "playwright test --project=e2e",
    "test:visual": "playwright test --project=visual",
    "test:a11y": "playwright test --project=a11y"
  },
  "devDependencies": {
    "@axe-core/playwright": "^4.11.0",
    "@playwright/test": "^1.55.0"
  }
}
```

- [ ] **Step 4: 新增统一 `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playwright',
  fullyParallel: true,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'pnpm --filter @lolita-ui/playground dev -- --host 127.0.0.1 --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: !process.env.CI
  },
  projects: [
    { name: 'e2e', use: { ...devices['Desktop Chrome'] } },
    { name: 'visual', use: { ...devices['Desktop Chrome'] } },
    { name: 'a11y', use: { ...devices['Desktop Chrome'] } }
  ]
});
```

- [ ] **Step 5: 重跑 `pnpm test:e2e`，让失败点前移到 playground QA surface 不存在**

Run: `pnpm test:e2e`
Expected: FAIL because `qa-shell` test id or `scenario` route behavior is not implemented yet

### Task 2: Deterministic Playground QA Surface

**Files:**

- Modify: `D:\project\lo\l-ui\apps\playground\src\App.vue`
- Test: `D:\project\lo\l-ui\tests\playwright\e2e.spec.ts`

- [ ] **Step 1: 扩展失败用例，锁定 URL 参数策略**

```ts
test('opens modal scenario directly by URL', async ({ page }) => {
  await page.goto('/?scenario=overlay-modal&theme=dark&motion=off');
  await expect(page.getByTestId('qa-overlay-modal')).toBeVisible();
});

test('loads Pro scenario directly by URL', async ({ page }) => {
  await page.goto('/?scenario=pro-basic&theme=light&motion=off');
  await expect(page.getByTestId('qa-pro-basic')).toBeVisible();
});
```

- [ ] **Step 2: 运行 `pnpm test:e2e`，确认这两个场景都先失败**

Run: `pnpm test:e2e`
Expected: FAIL because `scenario/theme/motion` parsing and corresponding test ids do not exist yet

- [ ] **Step 3: 在 `App.vue` 接入 QA 参数与稳定 test ids**

```ts
const url = new URL(window.location.href);
const qaScenario = url.searchParams.get('scenario') ?? '';
const qaTheme = url.searchParams.get('theme') === 'dark' ? 'dark' : 'light';
const qaMotion = url.searchParams.get('motion') === 'off' ? 'off' : 'on';
const qaSection = url.searchParams.get('section') ?? '';
```

```vue
<main
  :data-motion="qaMotion"
  :data-theme="mode"
  data-testid="qa-shell"
>
```

```vue
<section
  v-if="qaScenario === 'overlay-modal'"
  data-testid="qa-overlay-modal"
>
```

```vue
<section
  v-if="qaScenario === 'pro-basic'"
  data-testid="qa-pro-basic"
>
```

- [ ] **Step 4: 用固定 fixture 驱动 `shell` / `overlay-modal` / `pro-basic`**

```ts
if (qaScenario === 'overlay-modal') {
  modalOpen.value = true;
  drawerOpen.value = false;
}

if (qaScenario === 'pro-basic') {
  activeSection.value = 'pro-search-table';
}
```

- [ ] **Step 5: 重跑 `pnpm test:e2e`，确保 shell 与 overlay 直达通过**

Run: `pnpm test:e2e`
Expected: PASS for `shell` and `overlay-modal`; `pro-basic` may still fail until Pro area gains final deterministic hooks

### Task 3: Visual Regression 与 A11y Smoke Matrix

**Files:**

- Create: `D:\project\lo\l-ui\tests\playwright\visual.spec.ts`
- Create: `D:\project\lo\l-ui\tests\playwright\a11y.spec.ts`
- Test: `D:\project\lo\l-ui\tests\playwright\visual.spec.ts`
- Test: `D:\project\lo\l-ui\tests\playwright\a11y.spec.ts`

- [ ] **Step 1: 写 required smoke matrix 的视觉用例**

```ts
import { expect, test } from '@playwright/test';

const requiredScenarios = [
  ['shell', 'light'],
  ['shell', 'dark'],
  ['overlay-modal', 'light'],
  ['overlay-modal', 'dark'],
  ['pro-basic', 'light'],
  ['pro-basic', 'dark']
] as const;

for (const [scenario, theme] of requiredScenarios) {
  test(`${scenario}-${theme}`, async ({ page }) => {
    await page.goto(`/?scenario=${scenario}&theme=${theme}&motion=off`);
    await expect(page).toHaveScreenshot(`${scenario}-${theme}.png`);
  });
}
```

- [ ] **Step 2: 写基础 A11y 用例**

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('pro-basic has no critical accessibility violations', async ({ page }) => {
  await page.goto('/?scenario=pro-basic&theme=light&motion=off');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

- [ ] **Step 3: 运行 `pnpm test:visual` 与 `pnpm test:a11y`，确认先红在真实 gate 上**

Run: `pnpm test:visual`
Expected: FAIL because snapshots do not exist yet or Pro scenario is not stable enough

Run: `pnpm test:a11y`
Expected: FAIL if the required scenario/test ids/semantics are incomplete

- [ ] **Step 4: 为截图稳定性补齐等待条件与场景根 test ids**

```ts
await expect(page.getByTestId('qa-shell')).toBeVisible();
await expect(page.getByTestId('qa-overlay-modal')).toBeVisible();
await expect(page.getByTestId('qa-pro-basic')).toBeVisible();
```

- [ ] **Step 5: 用 `--update-snapshots` 建立第一版必需基线**

Run: `pnpm test:visual -- --update-snapshots`
Expected: PASS and create six required light/dark smoke baselines

### Task 4: `searchSchema` Contract 与 Payload Layering

**Files:**

- Create: `D:\project\lo\l-ui\packages\pro-vue\src\searchSchema.ts`
- Modify: `D:\project\lo\l-ui\packages\pro-vue\src\types.ts`
- Modify: `D:\project\lo\l-ui\packages\pro-vue\src\ProSearchTable.spec.ts`

- [ ] **Step 1: 写失败单测，锁定四类字段与 duplicate-key 行为**

```ts
it('serializes queryValues from schema order and blocks duplicate keys', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const request = vi.fn(async () => ({ data: [], total: 0 }));

  const wrapper = mount(ProSearchTable, {
    props: {
      autoQuery: false,
      columns: [{ key: 'name', title: 'Name', dataIndex: 'name' }],
      searchSchema: [
        { name: 'keyword', label: 'Keyword', type: 'text', toQuery: () => ({ q: 'a' }) },
        { name: 'alias', label: 'Alias', type: 'text', toQuery: () => ({ q: 'b' }) }
      ],
      request
    }
  });

  await wrapper.get('[data-testid=\"pro-search-submit\"]').trigger('click');
  expect(warn).toHaveBeenCalled();
  expect(request).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: 运行目标用例，确认红灯来自旧 `SearchFieldSchema` 契约**

Run: `pnpm test -- packages/pro-vue/src/ProSearchTable.spec.ts`
Expected: FAIL with missing field types, missing `queryValues`, or missing duplicate-key blocking behavior

- [ ] **Step 3: 在 `types.ts` 与 `searchSchema.ts` 实现明确契约**

```ts
export type SearchTextField = {
  name: string;
  label: string;
  type: 'text';
  width?: string | number;
  placeholder?: string;
  defaultValue?: string;
  inputProps?: { allowClear?: boolean };
  toQuery?: (value: string, formValues: SearchFormValues) => Record<string, unknown>;
};
```

```ts
export type SearchSelectField = {
  name: string;
  label: string;
  type: 'select';
  options: SearchFieldOption[];
  defaultValue?: string | number | boolean;
  selectProps?: {
    allowClear?: boolean;
    showSearch?: boolean;
    loading?: boolean;
    notFoundContent?: string;
  };
  toQuery?: (value: string | number | boolean | undefined, formValues: SearchFormValues) => Record<string, unknown>;
};
```

```ts
export const serializeQueryValues = (schema, formValues) => {
  const queryValues: Record<string, unknown> = {};
  const owners = new Map<string, string>();
  for (const field of schema) {
    const contribution = field.toQuery ? field.toQuery(formValues[field.name], formValues) : { [field.name]: formValues[field.name] };
    for (const [key, value] of Object.entries(contribution)) {
      if (owners.has(key)) {
        console.warn(`[ProSearchTable] Duplicate query key "${key}" from "${owners.get(key)}" and "${field.name}".`);
        return { blocked: true as const, queryValues: {} };
      }
      owners.set(key, field.name);
      queryValues[key] = value;
    }
  }
  return { blocked: false as const, queryValues };
};
```

- [ ] **Step 4: 重跑目标用例，确认 `formValues/queryValues` 与 duplicate-key 阻断通过**

Run: `pnpm test -- packages/pro-vue/src/ProSearchTable.spec.ts`
Expected: PASS for schema serialization and duplicate-key guard tests

### Task 5: `ProSearchTable` Search UI 与默认交互语义

**Files:**

- Modify: `D:\project\lo\l-ui\packages\pro-vue\src\ProSearchTable.vue`
- Modify: `D:\project\lo\l-ui\packages\pro-vue\src\ProSearchTable.spec.ts`
- Modify: `D:\project\lo\l-ui\packages\components-vue\src\components\Select.ts`
- Modify: `D:\project\lo\l-ui\packages\components-vue\src\Select.spec.ts`

- [ ] **Step 1: 写失败用例，锁定四种字段、显式提交、保留旧数据、重试入口**

```ts
it('does not auto-query on text input, but submits on Enter', async () => {
  const request = vi.fn(async ({ queryValues }) => ({
    data: [{ id: 1, name: String(queryValues.keyword ?? '') }],
    total: 1
  }));

  const wrapper = mount(ProSearchTable, {
    props: {
      autoQuery: false,
      columns: [{ key: 'name', title: 'Name', dataIndex: 'name' }],
      searchSchema: [{ name: 'keyword', label: 'Keyword', type: 'text' }],
      request
    }
  });

  await wrapper.get('.l-input').setValue('violet');
  expect(request).toHaveBeenCalledTimes(0);
  await wrapper.get('.l-input').trigger('keydown', { key: 'Enter' });
  expect(request).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: 如果 `select` 需要 boolean 值，先让基础 `LSelect` 契约补齐**

```ts
export type SelectValue = string | number | boolean;
```

```ts
expect(wrapper.emitted('update:value')?.[0]).toEqual([true]);
```

- [ ] **Step 3: 将搜索区替换为 Lolita primitives**

```vue
<LForm :model="formValues" class="l-pro-table__search-form">
  <LFormItem v-for="field in searchSchema" :key="field.name" :name="field.name" :label="field.label">
    <LInput v-if="field.type === 'text'" v-model:value="formValues[field.name]" v-bind="field.inputProps" />
    <LSelect v-else-if="field.type === 'select'" v-model:value="formValues[field.name]" :options="field.options" v-bind="field.selectProps" />
    <LDatePicker v-else-if="field.type === 'date'" v-model:value="formValues[field.name]" v-bind="field.datePickerProps" />
    <LCascader v-else v-model:value="formValues[field.name]" :options="field.options" v-bind="field.cascaderProps" />
  </LFormItem>
</LForm>
```

- [ ] **Step 4: 在 `runQuery` 中保留旧数据并加入 `queryValues`**

```ts
const { blocked, queryValues } = serializeQueryValues(props.searchSchema, snapshotFormValues);
if (blocked) {
  loading.value = false;
  return;
}

const result = await props.request({
  pagination: payload.pagination,
  formValues: snapshotFormValues,
  queryValues,
  signal: context.signal,
  attempt: context.attempt
});
```

- [ ] **Step 5: 重跑 `ProSearchTable` 单测，确认搜索区语义已对齐**

Run: `pnpm test -- packages/pro-vue/src/ProSearchTable.spec.ts`
Expected: PASS for four field kinds, submit/reset behavior, preserved rows on loading/error, retry surface

### Task 6: `rowKey` / Actions / Pagination / Table Composition

**Files:**

- Modify: `D:\project\lo\l-ui\packages\pro-vue\src\types.ts`
- Modify: `D:\project\lo\l-ui\packages\pro-vue\src\ProSearchTable.vue`
- Modify: `D:\project\lo\l-ui\packages\pro-vue\src\ProSearchTable.spec.ts`

- [ ] **Step 1: 写失败用例，锁定 `rowKey`、`refreshOnSuccess`、`visible`、`loading`**

```ts
it('warns and blocks row rendering when rowKey is missing and rows have no primitive id', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const request = vi.fn(async () => ({ data: [{ name: 'A' }], total: 1 }));

  mount(ProSearchTable, {
    props: {
      columns: [{ key: 'name', title: 'Name', dataIndex: 'name' }],
      request
    }
  });

  await flushPromises();
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('rowKey'));
});
```

- [ ] **Step 2: 用 `LTable` + `LPagination` 替换手写表格/上一页下一页**

```vue
<LTable
  :columns="tableColumns"
  :data-source="rows"
  :row-key="resolvedRowKey"
  :loading="loading"
  :pagination="false"
>
```

```vue
<LPagination
  :current="pagination.current"
  :page-size="pagination.pageSize"
  :total="pagination.total"
  :disabled="loading"
  @update:current="onPageChange"
/>
```

- [ ] **Step 3: 实现 action pending state 与默认刷新**

```ts
const pendingRowActions = reactive<Record<string, boolean>>({});

const runRowAction = async (action, row, index) => {
  pendingRowActions[action.key] = true;
  try {
    await action.onClick(row, index);
    if (action.refreshOnSuccess !== false) {
      await runQuery();
    }
  } finally {
    pendingRowActions[action.key] = false;
  }
};
```

- [ ] **Step 4: 暴露 `refresh` 给 toolbar / row-actions slots**

```vue
<slot name="toolbar" :loading="loading" :refresh="runQuery">
```

```vue
<slot name="row-actions" :row="row" :index="rowIndex" :refresh="runQuery">
```

- [ ] **Step 5: 重跑目标单测，确认 row identity、pending state 与分页联动通过**

Run: `pnpm test -- packages/pro-vue/src/ProSearchTable.spec.ts`
Expected: PASS for `rowKey`, action visibility/disabled/loading, `refreshOnSuccess`, real pagination path

### Task 7: Playground Pro 场景与 Pro 文档

**Files:**

- Modify: `D:\project\lo\l-ui\apps\playground\src\App.vue`
- Modify: `D:\project\lo\l-ui\docs\pro\pro-search-table.md`
- Test: `D:\project\lo\l-ui\tests\playwright\e2e.spec.ts`
- Test: `D:\project\lo\l-ui\tests\playwright\visual.spec.ts`

- [ ] **Step 1: 写失败的 `pro-basic` / `pro-error` browser flows**

```ts
test('submits, resets, paginates, and retries in pro-basic/pro-error', async ({ page }) => {
  await page.goto('/?scenario=pro-basic&theme=light&motion=off');
  await page.getByTestId('pro-search-submit').click();
  await expect(page.getByTestId('qa-pro-basic')).toContainText('Alice');
});
```

- [ ] **Step 2: 在 playground 给 Pro 场景固定 fixture 和错误态切换**

```ts
const isProErrorScenario = computed(() => qaScenario === 'pro-error');

const request: ProSearchTableRequest<ShowcaseTableRow> = async ({ queryValues, pagination }) => {
  if (isProErrorScenario.value) {
    throw new Error('Injected QA error');
  }
  return buildDeterministicResult(queryValues, pagination);
};
```

- [ ] **Step 3: 更新 `docs/pro/pro-search-table.md` 例子与契约表**

```md
- `searchSchema` supports `text`, `select`, `date`, and `cascader`
- request payload receives both `formValues` and `queryValues`
- row actions default to `refreshOnSuccess: true`
- duplicate query keys are invalid configuration and block the request
```

- [ ] **Step 4: 重跑 browser flows 与 visual smoke**

Run: `pnpm test:e2e`
Expected: PASS for initial query, submit/reset, pagination, and retry flow

Run: `pnpm test:visual`
Expected: PASS for required light/dark smoke matrix

### Task 8: Governance Truth Sources 与 Final Gates

**Files:**

- Modify: `D:\project\lo\l-ui\packages\pro-vue\COMPATIBILITY.md`
- Modify: `D:\project\lo\l-ui\docs\implementation\parity-manifest.json`
- Modify: `D:\project\lo\l-ui\docs\memory\components-progress.md`
- Modify: `D:\project\lo\l-ui\docs\.vitepress\config.ts`
- Modify: `D:\project\lo\l-ui\docs\implementation\stage-plans\M5-pro-release-hardening.md`

- [ ] **Step 1: 更新 compatibility，明确已实现边界与未做项**

```md
- Aligned: `text/select/date/cascader` search schema, `queryValues` serialization, `rowKey`, `LPagination`, action refresh control.
- Difference: no `dateRange`, inline edit, column pinning, drag sorting, preset persistence, or remote field builders in M5.
```

- [ ] **Step 2: 更新 parity / memory / nav**

```json
{
  "component": "ProSearchTable / Release Hardening",
  "status": "done",
  "stage": "M5"
}
```

```md
| 2026-05-26 | M5 | ProSearchTable / browser gates | 已同步 | 记录 `test:e2e`、`test:visual`、`test:a11y` 与 light/dark smoke matrix 结果。 |
```

- [ ] **Step 3: 跑完整阶段门禁**

Run: `pnpm test`
Expected: PASS

Run: `pnpm typecheck`
Expected: PASS

Run: `pnpm build`
Expected: PASS

Run: `pnpm docs:build`
Expected: PASS

Run: `pnpm test:e2e`
Expected: PASS

Run: `pnpm test:visual`
Expected: PASS

Run: `pnpm test:a11y`
Expected: PASS

Run: `pnpm --filter @lolita-ui/playground build`
Expected: PASS

- [ ] **Step 4: 回填计划勾选状态并确认退出条件**

```md
- required smoke matrix passes in both `light` and `dark`
- `ProSearchTable` docs / playground / tests use the same default interaction semantics
- repository truth sources describe M5 as completed and verifiable
```

## 5. 自检清单

- 不再保留“native `<input>/<select>` + `Prev/Next`”的旧 Pro UI 主路径。
- `request` / `beforeQuery` / `afterQuery` 全部能接触到 `queryValues`，而不是只有 `formValues`。
- duplicate query keys 在所有表述里都属于 invalid configuration，并且会阻断请求。
- browser gate 命令统一为 `pnpm test:e2e`、`pnpm test:visual`、`pnpm test:a11y`。
- visual smoke matrix 至少覆盖 `shell`、`overlay-modal`、`pro-basic` 的 `light/dark`。

## 6. 退出条件

- `ProSearchTable` 通过 `Vitest`、playground、Pro docs 三条线共同证明已升级到 M5 契约。
- Browser gates 在仓库内真实可跑，不依赖手工点击准备状态。
- `COMPATIBILITY.md`、`parity-manifest.json`、`components-progress.md`、docs nav 与 stage plan 全部同步到 M5 完成态。
