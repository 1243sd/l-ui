# First Release Checklist

## Goal

This checklist is the M6 closeout path for a manual first release. It stops at dry-run readiness and does not publish to a registry.

## Required Commands

Run from the workspace root:

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm docs:build
pnpm test:e2e
pnpm test:visual
pnpm test:a11y
pnpm pack:check
pnpm consumer:build
pnpm test:consumer
pnpm size:check
pnpm release:dry-run
```

## Release Truth Sources

Before considering the release dry-run complete, verify that these files are current:

- `docs/implementation/stage-plans/M6-release-delivery-and-consumer-readiness.md`
- `docs/release/consumer-installation.md`
- `docs/release/first-release-checklist.md`
- `docs/memory/components-progress.md`
- `docs/implementation/parity-manifest.json`
- `packages/components-vue/COMPATIBILITY.md`
- `packages/pro-vue/COMPATIBILITY.md`

## Manual Maintainer Checks

These items still need human review even when all scripts pass:

- confirm the release notes in `.changeset/*.md` match the intended first-release story
- confirm repository, homepage, and package metadata are appropriate for public distribution
- confirm the final package license decision before any real publish step
- confirm registry credentials and publish access outside the repository

## Dry-Run Exit State

M6 release delivery is considered ready when:

- package artifacts build from clean workspace inputs
- tarball contract checks pass
- the consumer smoke app installs from tarballs and passes browser smoke
- size budgets stay within the recorded baseline thresholds
- `changeset status` passes with the intended release notes in place

At that point, the repository is ready for a human-driven publish sequence, but M6 still stops short of calling `npm publish`.
