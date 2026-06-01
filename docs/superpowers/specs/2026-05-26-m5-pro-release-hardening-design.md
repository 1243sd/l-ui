# M5 Pro Release Hardening Design

## 1. Context

`Lolita UI` has completed the M0-M4 component baseline and already ships a first-pass `ProSearchTable`, but the current M5 space is still split between two unfinished threads:

- `ProSearchTable` is useful but still closer to an M0 wrapper than a release-grade Pro business component.
- The repository still lacks real browser-level release gates for `E2E`, visual regression, and accessibility.

This design turns M5 into a single coordinated stage with one shared completion bar: the repository must be able to prove both product capability and release safety inside the workspace, without performing a real package publish.

## 2. Locked Product Decisions

The following decisions are already confirmed and are treated as hard constraints for M5:

1. M5 stops at repository-internal completion and verification and does not include an actual release or publish action.
2. `ProSearchTable` enhancement and release governance are equal-priority tracks.
3. `E2E`, visual regression, and `A11y` must all be truly connected and runnable as stage gates.
4. The quality stack uses a single browser stack: `Playwright` for browser flows, Playwright screenshots for visual baselines, and `@axe-core/playwright` for accessibility checks.
5. `ProSearchTable` takes the stronger enhancement path rather than a minimal stabilization pass.
6. M5 optimizes with a balanced strategy across smoothness, clarity, runtime footprint, and implementation cost.
7. M5 uses soft-plus-hard quality control: critical constraints are mandatory, while lower-risk polish is expressed as explicit behavior guidance.
8. Dark mode is a first-class release surface and must always participate in M5 visual hardening.

## 3. Current Baseline

### 3.1 ProSearchTable Today

Current `ProSearchTable` already supports:

- schema-driven `text/select` search fields
- request lifecycle hooks: `beforeQuery`, `transform`, `afterQuery`
- retry and abort behavior through `@lolita-ui/utils`
- pagination state sync
- toolbar and row action extension points
- basic docs, playground demo, and unit tests

Current gaps that matter for M5:

- search form is still rendered with native `<input>` and `<select>` controls rather than the library's own components
- pagination UI is still lightweight `Prev/Next`
- `rowKey` is not yet explicit and still effectively falls back to row index
- richer field types and request-shaping patterns are not yet codified
- browser-level verification is absent

### 3.2 Repository Quality Gates Today

Current repository gates already cover:

- `vitest`
- package typecheck
- package build
- docs build
- playground build

Current missing gates:

- `Playwright` browser E2E
- screenshot-based visual regression
- automated accessibility checks

## 4. Stage Strategy

### Approach A: Gate-First, Feature-Second

Build browser gates first, then come back to `ProSearchTable`.

- Pros: lowest release-risk profile at the start
- Cons: delays visible product progress and increases the chance that Pro work later fights the freshly-added test harness

### Approach B: Feature-First, Gate-Second

Push `ProSearchTable` closer to a mature Pro component first, then bolt on release gates.

- Pros: faster visible feature momentum
- Cons: highest end-of-stage integration risk; test debt piles up at the most expensive moment

### Approach C: Dual-Track With Gate Skeleton First

Stand up the unified browser gate skeleton first, then evolve `ProSearchTable` against that live harness while governance artifacts track both threads.

- Pros: matches the product decision for equal-priority dual tracks, keeps release hardening real from the beginning, and avoids a late-stage verification cliff
- Cons: requires more up-front coordination across playground, tests, and docs

### Selected Strategy

M5 uses **Approach C**.

The stage runs as three coordinated tracks:

- **Track A:** `ProSearchTable` enhancement
- **Track B:** release gates (`E2E`, visual, `A11y`)
- **Track C:** governance and closeout truth sources

## 5. Design

### 5.1 Stage Goal

Turn `ProSearchTable` into a genuinely stronger Pro-layer component while also making the repository capable of proving release readiness through repeatable browser-level verification.

### 5.2 Stage Architecture

M5 will not introduce a second showcase system and will not pivot the repo into `Storybook`.

Instead, it will:

- keep `apps/playground` as the single human-visible and browser-test-visible fixture surface
- add deterministic QA-oriented showcase states inside the existing playground flow
- use a single `Playwright` stack for interactive checks, screenshot baselines, and `axe` accessibility scans
- keep all outcome truth synchronized through docs, compatibility files, memory, and stage closeout evidence

This keeps the stage cohesive: the same surface that humans review locally is also the surface that the browser gates verify.

### 5.3 Experience Principles

M5 follows a balanced optimization strategy: user-perceived smoothness, response clarity, runtime footprint, and implementation cost must all improve together rather than maximizing a single dimension at the expense of the others.

Default interaction principles are:

- prefer stable page state over aggressive UI churn
- prefer explicit user intent over implicit automatic querying
- prefer immediate visible feedback over silent background work
- prefer reuse of existing Lolita primitives over new runtime abstraction layers
- prefer deterministic behavior that is easy to test, reason about, and document

These principles translate into the following required M5 defaults:

- `autoQuery` defaults to `true`
- text search fields update form state immediately, but only trigger queries on explicit submit or `Enter`
- query failure preserves the last successful table result and surfaces an inline error state with a retry path
- in-flight search, pagination, and retry operations preserve existing table content and use local loading feedback instead of replacing the whole table with a blank loading state
- row actions refresh data on success by default, but action-level policy may disable or override that behavior
- no runtime-heavy Pro dependency may be introduced if the same outcome can be achieved through existing Lolita primitives plus local composition

## 6. Track A: ProSearchTable Enhancement

### 6.1 Product Direction

M5 should move `ProSearchTable` from a lightweight raw-markup helper toward a true Pro wrapper over the component library's own primitives.

That means the component should stop behaving like an isolated demo widget and start behaving like a business composition layer that dogfoods the M0-M4 foundation.

### 6.2 Public Contracts

#### A. Replace raw form controls with Lolita primitives

The search area should compose library components instead of native controls wherever practical:

- `LForm` / `LFormItem`
- `LInput`
- `LSelect`
- `LDatePicker`
- `LCascader`
- existing button primitives for actions

This is both a UX improvement and a dogfooding move: M5 should prove that the component library can support its own Pro abstraction.

#### B. Expand search schema into a real business contract

`searchSchema` will be upgraded from a flat demo model into a discriminated-union contract with four supported field kinds in M5:

- `text`
- `select`
- `date`
- `cascader`

The public contract is:

- Common base:
  - `name: string`
  - `label: string`
  - `type: 'text' | 'select' | 'date' | 'cascader'`
  - `width?: string | number`
  - `placeholder?: string`

- `text`
  - `defaultValue?: string`
  - `inputProps?: { allowClear?: boolean }`

- `select`
  - `options: SearchFieldOption[]`
  - `defaultValue?: string | number | boolean`
  - `selectProps?: { allowClear?: boolean; showSearch?: boolean; loading?: boolean; notFoundContent?: string }`

- `date`
  - `defaultValue?: string`
  - `datePickerProps?: { allowClear?: boolean; format?: string }`

- `cascader`
  - `options: CascaderOption[]`
  - `defaultValue?: string[]`
  - `cascaderProps?: { allowClear?: boolean }`

M5 does not expose a generic `fieldProps: Record<string, any>` escape hatch. Only the whitelisted prop subsets above are supported.

Request shaping is explicit:

- `formValues` remain the raw UI-state snapshot keyed by field `name`
- each field may optionally define `toQuery(value, formValues) => Record<string, unknown>`
- if `toQuery` is omitted, the default query contribution is `{ [name]: value }`
- field contributions are merged in schema order into `queryValues`
- duplicate query keys are invalid M5 configuration
- duplicate query keys must emit a development warning, block the query, and must not use last-write-wins behavior
- if a product case truly needs combined shaping, it must be modeled explicitly as one field or handled at the table request layer, not via duplicate-key collisions

The request and lifecycle contracts must be upgraded to receive both:

- `formValues`: raw UI values
- `queryValues`: serialized request values

`beforeQuery` may adjust `pagination` and `queryValues`, but it must not rewrite `formValues`.

Explicitly out of scope in M5:

- `dateRange`
- unsupported base-component variants
- arbitrary nested form schema layouts
- remote field builders that require new base-component contracts

#### C. Replace lightweight paging with real component-level pagination

`ProSearchTable` should stop rendering a bespoke `Prev/Next` footer and instead integrate a real pagination component path using the existing library baseline (`LPagination`).

This should improve:

- page affordance clarity
- synchronization behavior
- future compatibility with more realistic Pro table flows

#### D. Add explicit row identity and stronger table composition

M5 adds `rowKey?: string | ((record, index) => string | number)` to `ProSearchTable` as a first-class public prop, aligned with the current `LTable` contract.

Row-key resolution rules are:

- if `rowKey` is provided, use it
- if `rowKey` is omitted and every row has a primitive `id`, use `'id'` as the default row key
- otherwise, emit a development warning and treat the configuration as invalid for M5
- there is no silent fallback to row index in completed M5 behavior

M5 should also strengthen table composition so the Pro layer cleanly manages:

- loading state
- error state
- empty state
- row actions
- custom cell rendering
- table-level refresh after user action

#### E. Improve extension contracts without turning M5 into a mega-framework

Toolbar and row-action APIs should become more useful, but M5 should not become a full clone of Ant Design Pro Components.

M5 should prioritize business-critical action control over decorative extensibility.

The public action contracts become:

- `ProToolbarAction`
  - `key: string`
  - `label: string`
  - `visible?: boolean`
  - `disabled?: boolean`
  - `loading?: boolean`
  - `onClick: () => void | Promise<void>`

- `ProRowAction`
  - `key: string`
  - `label: string`
  - `visible?: (row, index) => boolean`
  - `disabled?: (row, index) => boolean`
  - `loading?: (row, index) => boolean`
  - `refreshOnSuccess?: boolean`
  - `onClick: (row, index) => void | Promise<void>`

Action rules are:

- `visible === false` removes the action from rendering instead of only disabling it
- if an action returns a promise, only that action enters pending state by default
- `refreshOnSuccess` defaults to `true` for row actions
- row actions that handle their own state reconciliation may set `refreshOnSuccess: false`
- toolbar and row-action slot contexts must expose `refresh`

Explicitly out of scope:

- inline editing
- column pinning
- drag sorting
- schema-driven form layouts with arbitrary nesting
- multi-view table presets
- remote column config persistence

### 6.3 Default Interaction Semantics

M5 standardizes the default `ProSearchTable` interaction model:

- `autoQuery` defaults to `true`
- text inputs do not auto-query while typing by default
- clicking the primary search action or pressing `Enter` in a text field triggers a query
- `reset` restores schema defaults, resets pagination to page 1, and triggers a fresh query
- when a new query or pagination request starts, the current rows remain visible and the component enters a local loading state
- when a query fails, the last successful rows remain visible and the component renders an error surface with a retry action
- row actions refresh the table on successful completion by default

These defaults are part of the M5 experience contract and must be visible in docs, tests, and playground scenarios.

### 6.4 Track A Exit Criteria

Track A is complete when:

- `ProSearchTable` demonstrably uses stronger library composition
- search schema supports the selected richer field model
- row identity no longer defaults to row index
- pagination uses a real component path
- docs, playground demos, and tests all reflect the upgraded contract
- search, pagination, retry, and row-action flows preserve user context and provide immediate visible feedback without unnecessary page-state churn

## 7. Track B: Browser-Level Release Gates

### 7.1 Stack Choice

M5 will use:

- `@playwright/test` for browser automation
- Playwright screenshot assertions for visual regression
- `@axe-core/playwright` for accessibility checks

This is intentionally one stack, not three separate systems.

### 7.2 Verification Surface

M5 will use `apps/playground` as the single browser-test surface and will not introduce a second demo app or `Storybook`.

Browser-test scenarios must be selected through URL query parameters rather than hidden test-only toggles or manual click setup.

The playground must support a deterministic QA surface with parameters such as:

- `scenario`
- `theme`
- `motion`
- `section`

Rules:

- `scenario` selects a fixed test fixture state such as `shell`, `overlay-modal`, `pro-basic`, `pro-error`, or `tree-cascader-transfer`
- `theme` must support both `light` and `dark`
- `motion=off` must disable or stabilize animation-sensitive presentation for screenshot tests
- `section` may be used to jump directly to a showcase region when helpful, but scenario state must remain the primary source of truth
- all required visual-regression scenarios must be directly addressable in both `theme=light` and `theme=dark` forms

Playwright tests must enter scenarios by direct URL rather than by replaying long setup interactions wherever a deterministic scenario URL is available.

The playground must expose stable `data-testid` hooks only at scenario roots and critical interaction points, not as blanket instrumentation across every node.

### 7.3 Required Gate Types

Browser gates are not only correctness checks in M5; they also verify that key interaction flows preserve visual continuity and feedback clarity under loading, retry, and error conditions.

#### A. E2E

E2E should cover real user flows, not only page load.

Minimum M5 browser flows should include:

- `ProSearchTable` initial query
- search submit and reset
- pagination flow
- error or retry-visible path
- at least one representative interaction from the main component showcase outside the Pro section, to prove the release gate is not Pro-only

#### B. Visual Regression

Visual regression uses screenshot baselines against stable playground states.

The target is not exhaustive per-pixel coverage of every component permutation. The target is a maintainable release smoke matrix across the main stage sections, including the Pro area.

Dark mode is a required release surface in M5, not an optional extension.

The required M5 visual smoke matrix is:

- `shell` in `light`
- `shell` in `dark`
- `overlay-modal` in `light`
- `overlay-modal` in `dark`
- `pro-basic` in `light`
- `pro-basic` in `dark`

Recommended secondary coverage:

- `pro-error` in `light`
- `pro-error` in `dark`
- `tree-cascader-transfer` in `light`
- `tree-cascader-transfer` in `dark`

The purpose of the required matrix is:

- `shell`: verify global tokens, navigation contrast, page surfaces, and theme-level hierarchy
- `overlay-modal`: verify mask, raised surfaces, shadows, action emphasis, and blocking-layer contrast
- `pro-basic`: verify the densest business surface, including search area, toolbar, table, and pagination under both themes

Visual smoke coverage is incomplete if only light-mode baselines pass.

#### C. Accessibility

A11y checks should be automated and fail the gate on meaningful violations.

The initial automated scope should focus on:

- playground shell
- `ProSearchTable` search region and results region
- at least one overlay or keyboard-driven interaction area

Any intentional exceptions must be documented instead of silently ignored.

### 7.4 Track B Exit Criteria

Track B is complete when the repository can run real commands for:

- browser E2E
- screenshot regression
- accessibility scanning

and those commands succeed on the intended M5 scenarios inside the workspace.

## 8. Track C: Governance And Truth Sources

M5 must keep implementation truth, documentation truth, and verification truth synchronized.

Required update surfaces include:

- `docs/pro/pro-search-table.md`
- `packages/pro-vue/COMPATIBILITY.md`
- `docs/implementation/parity-manifest.json`
- `docs/memory/components-progress.md`
- root scripts in `package.json`
- any stage-level docs that define active execution order or release gate expectations

M5 is not complete if the code is upgraded but the repository still describes M5 as pending or vaguely defined.

## 9. Dependency, Runtime, And Footprint Constraints

M5 must optimize for smoothness without casually increasing runtime weight.

Rules:

- browser-gate dependencies such as `Playwright` and `axe` must remain dev-only
- M5 must not add new Pro runtime dependencies if the same outcome can be achieved through existing Lolita components and local composition
- schema enhancement must compile down to a small contract layer rather than a generic runtime form engine
- new M5 abstractions should prefer composition over feature-framework layering
- any added runtime cost must be justified by visible user benefit in interaction quality, clarity, or stability

If an implementation option improves capability but meaningfully increases runtime complexity or bundle weight without a clear user-facing gain, M5 should reject it.

## 10. Testing Strategy

### 10.1 Unit And Component Tests

`Vitest` remains the first line of proof for:

- new `ProSearchTable` prop and schema behavior
- payload shaping logic
- lifecycle hook interaction
- row identity and pagination state changes
- slot and action contract behavior where DOM-level assertions are sufficient

### 10.2 Browser Tests

`Playwright` becomes the second line of proof for:

- end-to-end search/table flows
- retry and failure UX
- visual regression
- keyboard and accessibility-sensitive surfaces

### 10.3 Stage Gate Commands

M5 should end with first-class root scripts for:

- `pnpm test`
- `pnpm typecheck`
- `pnpm build`
- `pnpm docs:build`
- `pnpm test:e2e`
- `pnpm test:visual`
- `pnpm test:a11y`

`pnpm playwright test` may still exist as an umbrella command, but M5 closeout evidence must record the three named browser-gate entrypoints explicitly.

Visual-regression closeout evidence is incomplete unless both `light` and `dark` baselines pass for the required M5 smoke matrix.

## 11. Out Of Scope

M5 does not include:

- actual npm publish or release execution
- version bumps or changelog publishing as a release action
- `Storybook` adoption
- `Chromatic`, `Percy`, `Loki`, or a second visual toolchain
- a full Ant Design Pro clone
- new base primitives that do not already have a stable foundation in M0-M4

## 12. Risks And Design Countermeasures

### Risk 1: Playground-driven tests become flaky

Countermeasure:

- use deterministic data
- add stable selectors
- stabilize animation-sensitive states for screenshots
- keep QA scenarios explicit rather than relying on incidental default page state

### Risk 2: ProSearchTable enhancement sprawls into a second framework

Countermeasure:

- limit Track A to stronger composition and request/search contracts
- explicitly reject mega-features like inline edit, preset management, and persisted personalization

### Risk 3: Release gates exist on paper but not as true repo gates

Countermeasure:

- make commands first-class in `package.json`
- use the same commands in memory and stage closeout evidence
- avoid hidden manual steps

## 13. Success Criteria

M5 is successful when all of the following are true:

1. `ProSearchTable` is materially stronger than its current baseline and is demonstrably built on top of the library's own component foundation where appropriate.
2. `E2E`, visual regression, and accessibility checks are all truly wired into the repository and runnable in the workspace.
3. The playground serves as both the human review surface and the automated browser verification surface.
4. The required M5 smoke matrix passes in both `light` and `dark` themes.
5. `ProSearchTable` default interaction semantics are reflected consistently in docs, playground scenarios, and tests.
6. Repository truth sources (`compatibility`, `parity`, `memory`, docs, scripts) all describe M5 as completed and verifiable rather than pending or partially defined.
7. The stage is release-hardened inside the repo even though an actual package publish is intentionally out of scope.
