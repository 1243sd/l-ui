import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Lolita UI',
  description: 'Cute and practical Vue component library with AntD-friendly APIs.',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/' },
      { text: 'Components', link: '/components/button' },
      { text: 'Pro', link: '/pro/pro-search-table' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Plan', link: '/implementation/plan' },
          { text: 'Subagents', link: '/implementation/subagents' },
          { text: 'Parity Manifest', link: '/implementation/parity' },
          { text: 'Memory Workflow', link: '/memory/workflow' }
        ]
      },
      {
        text: 'Components',
        items: [
          { text: 'Button', link: '/components/button' },
          { text: 'Space', link: '/components/space' },
          { text: 'ConfigProvider', link: '/components/config-provider' }
        ]
      },
      {
        text: 'Pro',
        items: [{ text: 'ProSearchTable', link: '/pro/pro-search-table' }]
      }
    ]
  }
});
