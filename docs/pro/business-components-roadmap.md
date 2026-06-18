# Business Components Roadmap

After M7, `@lolita-ui/pro-vue` has one strong workflow surface: `ProSearchTable`. The next product step is not to publish the longest possible list of business components. It is to help teams finish a real admin CRUD page with less page-level glue code.

## Product Target

- Turn `ProSearchTable` from a capable table workflow into a broader CRUD page toolkit.
- Optimize for the highest-frequency admin screens: list, detail, and create/edit.
- Keep the user story simple: a product team should be able to assemble a working CRUD page with one shared vocabulary instead of stitching together page-local conventions.

## Strategy Principles

- Release by scenario, not by component count.
- Reuse the existing `searchSchema`, `rowKey`, `bulkActions`, `refresh`, and `request` concepts.
- Do not introduce a second form schema, table schema, or action contract.
- Keep `@lolita-ui/components-vue` focused on accessibility, composition, and visual primitives.
- Ship page-level proof in `apps/playground`, not only isolated component examples.
- Delay low-frequency advanced workflows such as inline editable tables, persistence, remote schema builders, and workflow orchestration until the CRUD mainline proves stable.

## Release Pack 1: List Pack

### User Problem

Teams can already query and render rows, but they still reassemble the same list-page glue: status mapping, reusable query areas, and batch operation behavior.

### Goal

Turn the most common CRUD list page into a reusable default pattern.

### Included APIs

- `ValueEnum`
- `StatusTag`
- `ProQueryFilter`
- `ProBatchActionBar`

### Current Progress

- Shipped: the four List Pack APIs are exported from `@lolita-ui/pro-vue`.
- Shipped: `ProSearchTable` now uses `ProQueryFilter` and `ProBatchActionBar` internally, so the pack is proven on the main workflow surface instead of existing only as isolated exports.
- Shipped: the `pro-basic` playground scenario now proves query, shared status mapping, selection, and bulk-action flows together, with `StatusTag` / `ValueEnum` visible in the real list page.
- Next focus: move to Detail Pack without reopening a second list-page vocabulary.

### Done When

- One full list-page playground showcase proves query, status mapping, selection, and bulk-action flows together.
- The list pack reuses the same `searchSchema`, `bulkActions`, `rowKey`, and `refresh` contracts already used by `ProSearchTable`.
- Async pending, selected-count copy, disabled states, and success-refresh semantics are standardized.
- No second query schema or status contract appears in the API surface.

### Why First

- It has the highest reuse across admin products.
- It lowers adoption risk because it builds directly on the M7 table workflow teams already understand.
- It becomes the shared base for both detail and edit flows.

## Release Pack 2: Detail Pack

### User Problem

`list -> detail` is one of the most common admin journeys, but teams still rebuild read-only drawers, enum rendering, and empty/error handling on every page.

### Goal

Make row-to-detail a default product pattern instead of page-specific glue code.

### Included APIs

- `ProDescriptions`
- `ProDetailDrawer`
- Supporting `ProEmptyState` / `ProErrorState` when required by the detail flow

### Done When

- A playground showcase proves row-to-detail access with loading, empty, error, and ready states.
- Detail fields support the highest-frequency read patterns: enum/status text, links, images, dates, and copyable values.
- Detail rendering reuses the same `ValueEnum` mapping as list cells and filters.
- Teams can adopt the detail flow without inventing another display schema.

### Why Second

- It closes the most common read-only workflow immediately after the list page is stable.
- It compounds the value of the list pack instead of starting a parallel API branch.

## Release Pack 3: Edit Pack

### User Problem

Even when list pages are stable, teams still hand-build drawer shells, submit lifecycles, close confirmations, and refresh wiring for create/edit flows.

### Goal

Standardize the add/edit mainline around one drawer-based contract.

### Included APIs

- `ProDrawerForm`
- Submit lifecycle contract for loading, server error feedback, close confirmation, success close, and list refresh

### Done When

- A playground showcase proves create, edit, validation, submit pending, server error, and success-refresh behavior end to end.
- The form flow reuses the existing `LForm` contract instead of inventing another form DSL.
- List-page integration is demonstrated with real refresh wiring, not only isolated form examples.

### Why Third

- It depends on the list surface staying stable.
- It delivers the biggest page-level productivity gain after search and detail flows are normalized.

## Later Enhancements

- `ProTableToolbar`
- `ProColumnSetting`
- `ProAuditTimeline`
- Broader state surfaces where they are not already required by the detail flow
- Persistence and saved preferences remain reserved for M8

These are useful, but they should follow the three main CRUD packs instead of competing with them for the next release slot.

## Delivery Contract

- Each release pack must ship with one full page-level playground scenario, not only isolated component demos.
- Each release pack must update docs, parity, and memory truth sources in the same change.
- Each release pack must prove a real reduction in page-local glue code.
- Browser gates continue to use `apps/playground` as the only showcase surface.
- M8 should begin only after M7 gates remain green across build, docs, e2e, visual, accessibility, pack, consumer, size, and release dry-run.
