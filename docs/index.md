# Lolita UI

Lolita UI is a Vue 3 component library with a cute visual direction and Ant Design Vue-friendly API habits.

## Current Status
- M0 foundation is implemented:
  - `ConfigProvider`
  - `ThemeProvider`
  - `Button`
  - `Space`
  - `ProSearchTable` (from `@lolita-ui/pro-vue`)
- Dual theme support: `light` / `dark` via CSS variables.
- Progress memory and next-component queue are maintained in `docs/memory`.
- Next executable stage plan: `docs/implementation/stage-plans/M1-form-core.md`.

## Install (workspace/local)
```bash
pnpm install
pnpm dev
```

## Package Overview
- `@lolita-ui/tokens`: design tokens
- `@lolita-ui/theme`: theme creation + provider
- `@lolita-ui/components-vue`: base components and plugin
- `@lolita-ui/icons`: icon adapter/provider
- `@lolita-ui/utils`: reusable infra helpers
- `@lolita-ui/pro-vue`: business-level pro components
