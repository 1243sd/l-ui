# Lolita UI Monorepo

`l-ui` is a `pnpm` monorepo for the `@lolita-ui/*` component library ecosystem.

## Prerequisites

- Node.js `>= 20`
- pnpm `9.x`

## Quick Start

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts the playground app at `apps/playground`.

## Workspace Layout

```text
apps/
  playground/          # Local demo app for component development
packages/
  tokens/              # Design tokens
  theme/               # Theme system and providers
  components-vue/      # Base Vue components
  icons/               # Icon abstractions/providers
  utils/               # Shared utilities
  pro-vue/             # Pro-level composed components (e.g. ProSearchTable)
docs/                  # VitePress docs + implementation/memory records
```

## Common Commands

```bash
# playground
pnpm dev

# build all publishable packages
pnpm build

# type checks for all packages
pnpm typecheck

# unit tests
pnpm test

# docs site
pnpm docs:dev
pnpm docs:build
```

## Targeted Package Commands

```bash
pnpm --filter @lolita-ui/components-vue build
pnpm --filter @lolita-ui/pro-vue typecheck
pnpm --filter @lolita-ui/tokens build
```

## Governance Docs

- Implementation plan: `docs/implementation/lolita-ui-plan.md`
- Component parity tracking: `docs/implementation/parity-manifest.json`
- Progress memory: `docs/memory/components-progress.md`
- Subagent responsibilities: `docs/implementation/subagents.md`

## Notes

- The old root single-app Vite scaffold files are deprecated. Use `apps/playground` for local UI development.
- Do not add new runtime code under root `src/`; place app code in `apps/*` and package code in `packages/*`.
