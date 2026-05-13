# @lolita-ui/pro-vue Compatibility Notes (M0)

## ProSearchTable
- Aligned: `searchSchema + slots` mixed usage, pagination + search linkage, and request lifecycle hooks (`beforeQuery/query/transform/afterQuery`).
- Aligned: retry + abort behavior is supported via shared request pipeline from `@lolita-ui/utils`.
- Difference: current pagination UI is lightweight (`Prev/Next`) rather than a full AntD pagination control.
- Difference: schema currently supports `text/select`; complex field types (date range, cascader, remote select) are planned for M1+.
- Difference: row key still defaults to row index in M0; custom `rowKey` support is planned for follow-up.
