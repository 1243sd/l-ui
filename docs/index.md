# Lolita UI

Lolita UI is a Vue 3 component library with a cute visual direction and Ant Design Vue-friendly API habits.

## Current Status
- M0-M6 are implemented inside the workspace, including the first release-delivery hardening pass.
- Verified gates now include:
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
- Browser gates, tarball-based consumer smoke, changesets, and size budgets are active.
- Progress memory and release truth sources are maintained in `docs/memory` and `docs/release`.
- Next executable stage plan: `docs/implementation/stage-plans/M7-advanced-pro-data-workflows.md`.

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
- `@lolita-ui/pro-vue`: business-level pro components
