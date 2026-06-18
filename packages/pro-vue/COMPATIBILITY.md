# @lolita-ui/pro-vue Compatibility Notes (M7)

## ProSearchTable

- Aligned: `searchSchema` supports `text`, `select`, `date`, `dateRange`, and `cascader` with whitelisted field props.
- Aligned: request lifecycle payloads receive `formValues`, `queryValues`, `pagination`, and `sortState`.
- Aligned: `beforeQuery` may adjust `pagination.current` and `pageSize`, and rendered pagination stays in sync with the adjusted request state.
- Aligned: duplicate serialized query keys are treated as invalid configuration and block request execution with a development warning.
- Aligned: the search area uses Lolita primitives (`LForm`, `LFormItem`, `LInput`, `LSelect`, `LDatePicker`, `LDateRangePicker`, `LCascader`).
- Aligned: row identity defaults to primitive `id`; otherwise `rowKey` is required and invalid row identity blocks rendering with a warning.
- Aligned: single-column sorting is driven by `sortState` and forwards through the request lifecycle without mutating local rows.
- Aligned: `rowSelection` supports controlled and uncontrolled checkbox selection and clears invisible selections by default.
- Aligned: `bulkActions` receive selected rows plus `refresh` and `clearSelection`, and refresh plus clear selection by default after success.
- Aligned: pagination uses `LPagination`, browser gates cover `e2e`, `visual`, and `a11y`, and the playground exposes deterministic `pro-basic` / `pro-error` QA scenarios.
- Difference: M7 still does not include inline editing, column pinning, drag sorting, saved views, remote column persistence, remote schema builders, or multi-column sorting.

## Post-M7 List Pack

- Aligned: `ProQueryFilter`, `ProBatchActionBar`, `StatusTag`, and `ValueEnum` are exported as reusable CRUD list building blocks from `@lolita-ui/pro-vue`.
- Aligned: `ProSearchTable` reuses `ProQueryFilter` and `ProBatchActionBar` internally instead of keeping private list-page glue for search and bulk actions.
- Aligned: the `pro-basic` playground scenario now proves shared status mapping through `StatusTag` + `ValueEnum` on the real list page, alongside query, selection, and bulk-action workflows.

## M6 Package Delivery

- Aligned: root import and `./style.css` exports resolve from `dist`, so external consumers do not need workspace source access.
- Aligned: tarball-based consumer smoke installs `@lolita-ui/pro-vue` into an isolated `Vite + Vue 3 + ESM` app and verifies theme wiring plus table workflow behavior.
- Aligned: release package checks block `.spec/.test` artifacts from leaking into published `dist` contents.
- Difference: M6 only hardens the `Vite + Vue 3 + ESM` consumer path; `Nuxt / SSR / CDN` delivery remains out of scope.
- Difference: real registry publish, credential checks, and final license choice remain manual maintainer steps outside M6 automation.
