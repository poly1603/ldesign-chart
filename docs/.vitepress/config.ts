import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/chart',
  description: '企业级智能图表库 - 支持多框架',
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '示例', link: '/examples/' },
      { text: 'GitHub', link: 'https://github.com/ldesign/chart' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '简介', link: '/guide/' },
            { text: '快速开始', link: '/guide/quick-start' },
            { text: '安装', link: '/guide/installation' },
          ],
        },
        {
          text: '框架集成',
          items: [
            { text: 'Vue 3', link: '/guide/frameworks/vue' },
            { text: 'React', link: '/guide/frameworks/react' },
            { text: 'Angular', link: '/guide/frameworks/angular' },
            { text: 'Svelte', link: '/guide/frameworks/svelte' },
            { text: 'Solid.js', link: '/guide/frameworks/solid' },
            { text: 'Qwik', link: '/guide/frameworks/qwik' },
            { text: 'Lit/Web Components', link: '/guide/frameworks/lit' },
            { text: '原生 JS/TS', link: '/guide/frameworks/vanilla' },
          ],
        },
        {
          text: '核心概念',
          items: [
            { text: '图表类型', link: '/guide/concepts/chart-types' },
            { text: '数据格式', link: '/guide/concepts/data-formats' },
            { text: '配置系统', link: '/guide/concepts/configuration' },
            { text: '主题定制', link: '/guide/concepts/theming' },
          ],
        },
        {
          text: '高级特性',
          items: [
            { text: '性能优化', link: '/guide/advanced/performance' },
            { text: '内存管理', link: '/guide/advanced/memory' },
            { text: '事件系统', link: '/guide/advanced/events' },
            { text: '图表联动', link: '/guide/advanced/sync' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '核心 API', link: '/api/core' },
            { text: '配置选项', link: '/api/config' },
            { text: '类型定义', link: '/api/types' },
            { text: '工具函数', link: '/api/utils' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '基础图表', link: '/examples/basic' },
            { text: '高级图表', link: '/examples/advanced' },
            { text: '交互示例', link: '/examples/interaction' },
            { text: '性能测试', link: '/examples/performance' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/chart' },
    ],
  },
})
