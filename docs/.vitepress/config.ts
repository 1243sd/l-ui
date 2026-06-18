import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Lolita UI',
  description: '偏可爱风的 Vue 3 组件库，保持 Ant Design Vue 友好 API。',
  themeConfig: {
    nav: [
      { text: '总览', link: '/' },
      { text: '组件', link: '/components/button' },
      { text: '实施计划', link: '/implementation/lolita-ui-plan' },
      { text: 'Pro', link: '/pro/pro-search-table' }
    ],
    sidebar: [
      {
        text: '总览',
        items: [
          { text: '项目首页', link: '/' },
          { text: '总体计划', link: '/implementation/lolita-ui-plan' },
          { text: '计划摘要', link: '/implementation/plan' },
          { text: 'Parity Manifest', link: '/implementation/parity' },
          { text: 'Subagents', link: '/implementation/subagents' },
          { text: 'Memory 工作流', link: '/memory/README' },
          { text: '组件进度记忆', link: '/memory/components-progress' }
        ]
      },
      {
        text: '基础与表单',
        items: [
          { text: 'Button', link: '/components/button' },
          { text: 'Input', link: '/components/input' },
          { text: 'Form', link: '/components/form' },
          { text: 'Select', link: '/components/select' },
          { text: 'Choice Controls', link: '/components/choice-controls' },
          { text: 'Space', link: '/components/space' },
          { text: 'ConfigProvider', link: '/components/config-provider' }
        ]
      },
      {
        text: '导航与浮层（M2）',
        items: [
          { text: 'Tabs', link: '/components/tabs' },
          { text: 'Menu', link: '/components/menu' },
          { text: 'Tooltip', link: '/components/tooltip' },
          { text: 'Popover', link: '/components/popover' },
          { text: 'Dropdown', link: '/components/dropdown' },
          { text: 'Modal', link: '/components/modal' },
          { text: 'Drawer', link: '/components/drawer' }
        ]
      },
      {
        text: '数据展示（M3）',
        items: [
          { text: 'Tag', link: '/components/tag' },
          { text: 'Badge', link: '/components/badge' },
          { text: 'Avatar', link: '/components/avatar' },
          { text: 'Pagination', link: '/components/pagination' },
          { text: 'Table', link: '/components/table' },
          { text: 'List', link: '/components/list' }
        ]
      },
      {
        text: '复杂选择与搬运（M4）',
        items: [
          { text: 'DatePicker', link: '/components/date-picker' },
          { text: 'DateRangePicker', link: '/components/date-range-picker' },
          { text: 'Upload', link: '/components/upload' },
          { text: 'Tree', link: '/components/tree' },
          { text: 'Cascader', link: '/components/cascader' },
          { text: 'Transfer', link: '/components/transfer' }
        ]
      },
      {
        text: '阶段计划',
        items: [
          { text: 'M1 表单核心', link: '/implementation/stage-plans/M1-form-core' },
          { text: 'M2 导航与浮层', link: '/implementation/stage-plans/M2-navigation-overlay' },
          { text: 'M3 数据展示', link: '/implementation/stage-plans/M3-data-display' },
          { text: 'M4 复杂组件', link: '/implementation/stage-plans/M4-complex-data-feedback' },
          { text: '阶段模板', link: '/implementation/stage-plans/TEMPLATE' }
        ]
      },
      {
        text: 'Pro',
        items: [
          { text: 'ProSearchTable', link: '/pro/pro-search-table' },
          { text: 'Business Roadmap', link: '/pro/business-components-roadmap' }
        ]
      }
    ]
  }
});
