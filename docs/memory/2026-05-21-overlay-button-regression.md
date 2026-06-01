# 2026-05-21 Regression Fix - Overlay Position / Filled Button Hover

## Scope
- `Tooltip / Popover / Dropdown` anchored floating layers
- Filled primary buttons based on `.l-btn--primary`

## Root Causes
- Floating overlays were using an entrance animation that animated `transform`, which overrode the inline `transform` used by anchored positioning.
- Filled primary buttons inherited the base `.l-btn:hover` light background but did not restate their own hover background and inverse text color.

## Fixes
- Changed anchored floating overlays to a fade-only entrance motion and kept transform-based rise motion only on `Select` dropdown.
- Restored explicit hover and active background plus inverse text color for `.l-btn--primary`.
- Added `packages/components-vue/src/StyleContracts.spec.ts` to lock both regressions with CSS contract tests.
- Added `@types/node` to workspace dev dependencies so the new regression spec can read `style.css` directly without weakening type safety.

## Touched Files
- `packages/components-vue/src/style.css`
- `packages/components-vue/src/StyleContracts.spec.ts`
- `package.json`
- `pnpm-lock.yaml`

## Verification
- `rtk pnpm test` -> 29 files / 110 tests passed
- `rtk pnpm typecheck` -> passed
- `rtk pnpm build` -> passed
- `rtk pnpm docs:build` -> passed
- `rtk pnpm --filter @lolita-ui/playground build` -> passed

## Follow-up
- Aristotle flagged a separate future risk in `overlayState.ts`: anchored overlays still do not re-sync when anchor or overlay size changes after opening. This was not the root cause of the current screenshot regression, so it stays as a tracked follow-up instead of being guessed into this fix.
