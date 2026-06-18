# @lolita-ui/components-vue Compatibility Notes

## M0 Foundation

### ConfigProvider
- Aligned: `prefixCls`, `componentSize`, `themeMode`.
- Difference: locale, direction, and richer global validation copy remain out of scope.

### ThemeProvider
- Aligned: theme provider wrapper and CSS-variable application.
- Difference: nested isolated theme scopes are not implemented.

### Button
- Aligned: `type`, `size`, `danger`, `loading`, `disabled`, `block`.
- Difference: the full Ant Design shape matrix is not implemented.

### Space
- Aligned: `size`, `direction`, `align`, `wrap`, `split`.
- Difference: compact mode is not implemented.

## M1 Form Core

### Input
- Aligned: `v-model:value`, `defaultValue`, `disabled`, `allowClear`, `status`, `change/focus/blur`.
- Difference: prefix/suffix, password, and textarea variants are still out of scope.

### Form / FormItem
- Aligned: `model + rules`, `validate()`, `resetFields()`, field registration, status linkage, `valuePropName="checked"`.
- Difference: advanced layout props and trigger strategies remain out of scope.

### Select
- Aligned: single/multiple selection, local search, controlled search state, remote search hooks, loading states, keyboard navigation.
- Difference: tags mode, virtualization, and richer remote data behaviors are still pending.

### Choice Controls
- Aligned: checkbox, radio, radio-group, and switch controlled/uncontrolled flows.
- Difference: checkbox groups, radio button variants, and advanced switch variants remain out of scope.

## M2 Navigation And Overlays

### Tabs / Menu
- Aligned: primary keyboard flows, disabled skipping, and single-level navigation patterns.
- Difference: editable tabs, overflow handling, submenus, and multiple selection are still out of scope.

### Tooltip / Popover / Dropdown
- Aligned: the baseline trigger, placement, teleported mounting, and close flows used by playground and Pro surfaces.
- Difference: collision-aware positioning and deeply interactive overlays are not implemented.

### Modal / Drawer
- Aligned: open state, close affordances, focus return, keyboard escape, mask behavior, and teleported mounting.
- Difference: async confirm flows, stack management, and richer footer/action layouts remain out of scope.

## M3 Data Display

### Tag / Badge / Avatar / Pagination / List
- Aligned: the baseline M3 visual and interaction surface used throughout the workspace.
- Difference: advanced grouped, counted, grid, and infinite-loading variants remain out of scope.

### Table
- Aligned: `columns`, `dataSource`, `rowKey`, `loading`, `emptyText`, `pagination`, `bodyCell`, `empty`.
- Aligned: single-column `sortState` / `defaultSortState` plus `update:sortState` / `sortChange`.
- Aligned: checkbox `rowSelection`, `selectedRowKeys`, `defaultSelectedRowKeys`, `preserveSelectedRowKeys`, and disabled-row skipping.
- Aligned: accessible labels for select-all and row selection controls.
- Difference: filters, multi-column sorting, expandable rows, fixed columns, and virtual scrolling remain out of scope.
- Difference: string `rowKey` still resolves only top-level properties.

## M4 Complex Inputs

### DatePicker
- Aligned: single-date selection, clear, formatting, disabled state, and `FormItem` status linkage.
- Difference: `showTime`, advanced calendar modes, and timezone-aware behavior remain out of scope.

### DateRangePicker
- Aligned: start/end range selection, controlled/uncontrolled values, clear behavior, formatting, and `FormItem` status linkage.
- Difference: presets, `showTime`, disabled-date policies, and alternate range modes remain out of scope.

### Upload / Tree / Cascader / Transfer
- Aligned: the baseline single-path/single-selection workflow primitives required by the current playground.
- Difference: drag upload, async tree loading, cascader search, transfer pagination, and richer composition variants remain out of scope.

## M6 Delivery

### Package Delivery
- Aligned: `types`, root exports, `files`, `sideEffects`, and package metadata resolve from `dist`.
- Aligned: tarball consumer smoke verifies the published component entrypoints in a separate `Vite + Vue 3 + ESM` app.
- Difference: `Nuxt / SSR / CDN` delivery remains outside the current support contract.
