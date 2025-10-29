---
layout: home

hero:
  name: "@ldesign/chart"
  text: "企业级智能图表库"
  tagline: 高性能、多框架、易用的图表解决方案
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: 查看示例
      link: /examples/basic
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/chart

features:
  - icon: 🚀
    title: 多框架支持
    details: 支持 Vue、React、Angular、Svelte、Solid.js、Qwik、Lit 等主流框架
  - icon: ⚡️
    title: 高性能
    details: 虚拟渲染、Web Worker、智能缓存，轻松处理百万级数据
  - icon: 🎨
    title: 丰富图表
    details: 15+ 种图表类型，满足各种可视化需求
  - icon: 🎯
    title: 智能配置
    details: 自动优化配置，开箱即用，同时支持深度定制
  - icon: 💾
    title: 内存优化
    details: 自动内存管理、对象池、缓存策略，确保应用流畅运行
  - icon: 📱
    title: 响应式
    details: 自动适配不同屏幕尺寸，完美支持移动端
  - icon: 🎭
    title: 主题系统
    details: 内置多种主题，支持暗黑模式和自定义主题
  - icon: 🔄
    title: 图表联动
    details: 支持多图表同步交互，提供更好的数据分析体验
  - icon: 📊
    title: 数据处理
    details: 内置 CSV 解析、实时数据流、数据验证等功能
---

## 安装

::: code-group

```sh [npm]
npm install @ldesign/chart-vue echarts
```

```sh [pnpm]
pnpm add @ldesign/chart-vue echarts
```

```sh [yarn]
yarn add @ldesign/chart-vue echarts
```

:::

## 快速体验

::: code-group

```vue [Vue]
<template>
  <Chart 
    type="line" 
    :data="chartData" 
    title="销售趋势" 
  />
</template>

<script setup>
import { Chart } from '@ldesign/chart-vue'

const chartData = {
  labels: ['一月', '二月', '三月'],
  datasets: [{ data: [10, 20, 30] }]
}
</script>
```

```tsx [React]
import { Chart } from '@ldesign/chart-react'

function App() {
  const chartData = {
    labels: ['一月', '二月', '三月'],
    datasets: [{ data: [10, 20, 30] }]
  }
  
  return (
    <Chart 
      type="line" 
      data={chartData} 
      title="销售趋势" 
    />
  )
}
```

```ts [Angular]
import { ChartComponent } from '@ldesign/chart-angular'

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [ChartComponent],
  template: `
    <ldesign-chart
      type="line"
      [data]="chartData"
      title="销售趋势"
    />
  `
})
export class DemoComponent {
  chartData = {
    labels: ['一月', '二月', '三月'],
    datasets: [{ data: [10, 20, 30] }]
  }
}
```

:::

## 为什么选择 @ldesign/chart？

### 🎯 开箱即用

无需复杂配置，简单几行代码即可创建专业图表。智能配置系统会根据数据自动优化图表展示。

### ⚡️ 极致性能

- **虚拟渲染**：处理大数据集时自动启用虚拟渲染
- **Web Worker**：后台线程处理数据，不阻塞 UI
- **智能缓存**：配置缓存和结果缓存，减少重复计算
- **对象池**：复用对象，减少 GC 压力

### 🔧 灵活扩展

虽然提供智能配置，但仍然保留完整的 ECharts/VChart API，满足深度定制需求。

### 📦 按需加载

采用 monorepo 架构，只安装需要的框架适配器，大幅减少包体积。

---

<div class="vp-doc" style="text-align: center; padding: 2rem 0;">
  <a href="/guide/quick-start" class="vp-button brand">开始使用</a>
</div>
