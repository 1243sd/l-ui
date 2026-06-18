# Consumer Installation

## Goal

M6 validates that external consumers can install `Lolita UI` from packed artifacts rather than from workspace source links.

## Commands

Run these commands from the workspace root:

```bash
pnpm build
pnpm pack:check
pnpm consumer:build
pnpm test:consumer
```

## What `consumer:build` does

`pnpm consumer:build` drives the tarball-based consumer flow in four steps:

1. It re-validates package contracts with `pnpm pack:check`.
2. It packs the publishable workspace packages into `.artifacts/consumer-tarballs`.
3. It copies the template app from `apps/consumer-smoke` into a fresh `.artifacts/consumer-smoke-runtime-*` directory.
4. It records the active runtime path in `.artifacts/consumer-runtime.json`.
5. It installs the app with `pnpm --ignore-workspace`, forcing all internal `@lolita-ui/*` dependencies to resolve from local tarballs instead of workspace links.

The result is a clean external-consumer runtime that exercises:

- `@lolita-ui/theme`
- `@lolita-ui/components-vue`
- `@lolita-ui/pro-vue`

## Consumer Smoke Surface

The consumer app intentionally stays small and deterministic:

- one themed hero surface
- one base-component action area
- one `ProSearchTable` surface with query and pagination

This keeps failures easy to localize:

- install failure: tarball or dependency graph problem
- build failure: entrypoint, export, or bundler compatibility problem
- browser smoke failure: runtime, style import, or interaction problem

## Artifacts

The consumer runtime is generated into ignored directories:

- `.artifacts/consumer-tarballs`
- `.artifacts/consumer-runtime.json`
- `.artifacts/consumer-smoke-runtime-*`

They are disposable and may be regenerated on every run.
