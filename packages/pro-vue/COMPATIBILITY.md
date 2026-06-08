# @lolita-ui/pro-vue Compatibility Notes (M5)

## ProSearchTable

- Aligned: `searchSchema` now supports `text`, `select`, `date`, and `cascader` with whitelisted field props instead of an unbounded escape hatch.
- Aligned: request lifecycle payloads receive both `formValues` and `queryValues`, and field-level `toQuery` shaping is supported.
- Aligned: `beforeQuery` may adjust `pagination.current` and `pageSize`, and the rendered pagination meta follows the adjusted request state.
- Aligned: duplicate serialized query keys are treated as invalid configuration and block request execution with a development warning.
- Aligned: the search area uses Lolita primitives (`LForm`, `LFormItem`, `LInput`, `LSelect`, `LDatePicker`, `LCascader`) rather than native inputs.
- Aligned: row identity defaults to primitive `id`; otherwise `rowKey` is required and invalid row identity blocks rendering with a warning.
- Aligned: row actions support `visible`, `disabled`, `loading`, and `refreshOnSuccess`, and toolbar / row-action slot contexts expose `refresh`.
- Aligned: pagination now uses `LPagination`, browser gates cover `e2e`, `visual`, and `a11y`, and the playground exposes deterministic `pro-basic` / `pro-error` QA scenarios.
- Difference: M5 still does not include `dateRange`, inline editing, column pinning, drag sorting, table presets, remote column persistence, or remote schema builders.

## M6 Package Delivery

- Aligned: root import and `./style.css` exports now resolve from `dist`, so external consumers do not need workspace source access.
- Aligned: tarball-based consumer smoke installs `@lolita-ui/pro-vue` into an isolated `Vite + Vue 3 + ESM` app and verifies theme wiring, query flow, and pagination in browser smoke.
- Aligned: release package checks now block `.spec/.test` artifacts from leaking into published `dist` contents.
- Difference: M6 only hardens the `Vite + Vue 3 + ESM` consumer path; `Nuxt / SSR / CDN` delivery remains out of scope.
- Difference: real registry publish, credential checks, and final license choice remain manual maintainer steps outside M6 automation.
