# Lolita UI

Lolita UI is a Vue 3 component library with a cute visual direction and Ant Design Vue-friendly API habits.

## Current Status

- M0-M7 are implemented inside the workspace.
- The current verified gate set is:
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
- Dual theme support: `light` / `dark` via CSS variables.
- Browser gates, tarball-based consumer smoke, and size budgets are active.
- Progress memory and release truth sources live in `docs/memory` and `docs/release`.
- M8 is reserved for follow-up Pro preferences and persistence work after M7 remains green.

## Install (workspace/local)

```bash
pnpm install
pnpm dev
```

## Release Docs

- Consumer install flow: `docs/release/consumer-installation.md`
- First release checklist: `docs/release/first-release-checklist.md`

## Package Overview

- `@lolita-ui/tokens`: design tokens
- `@lolita-ui/theme`: theme creation + provider
- `@lolita-ui/components-vue`: base components and plugin
- `@lolita-ui/icons`: icon adapter/provider
- `@lolita-ui/utils`: reusable infra helpers
- `@lolita-ui/pro-vue`: business-level Pro components
- Pro roadmap: `/pro/business-components-roadmap` tracks the next scenario-first CRUD delivery packs after M7.
