# 快速使用指南

## 一分钟开始使用

### 1. 选择你的框架并安装

```bash
# Vue 3
pnpm add @ldesign/chart-vue echarts

# React
pnpm add @ldesign/chart-react echarts

# Angular
pnpm add @ldesign/chart-angular echarts

# Svelte
pnpm add @ldesign/chart-svelte echarts

# Solid.js
pnpm add @ldesign/chart-solid echarts

# Qwik
pnpm add @ldesign/chart-qwik echarts

# Lit / Web Components
pnpm add @ldesign/chart-lit echarts

# 纯 JavaScript/TypeScript
pnpm add @ldesign/chart-core echarts
```

### 2. 导入并使用

::: code-group

```vue [Vue 3]
<template>
  <Chart type="line" :data="chartData" title="销售趋势" />
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
  
  return <Chart type="line" data={chartData} title="销售趋势" />
}
```

```typescript [Angular]
import { Component } from '@angular/core'
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

```svelte [Svelte]
<script>
  import { Chart } from '@ldesign/chart-svelte'
  
  const chartData = {
    labels: ['一月', '二月', '三月'],
    datasets: [{ data: [10, 20, 30] }]
  }
</script>

<Chart type="line" data={chartData} title="销售趋势" />
```

```tsx [Solid.js]
import { Chart } from '@ldesign/chart-solid'

function App() {
  const chartData = {
    labels: ['一月', '二月', '三月'],
    datasets: [{ data: [10, 20, 30] }]
  }
  
  return <Chart type="line" data={chartData} title="销售趋势" />
}
```

```tsx [Qwik]
import { component$ } from '@builder.io/qwik'
import { Chart } from '@ldesign/chart-qwik'

export default component$(() => {
  const chartData = {
    labels: ['一月', '二月', '三月'],
    datasets: [{ data: [10, 20, 30] }]
  }
  
  return <Chart type="line" data={chartData} title="销售趋势" />
})
```

```typescript [Vanilla JS]
import { createChart } from '@ldesign/chart-core'

const chart = createChart('#chart-container', {
  type: 'line',
  data: {
    labels: ['一月', '二月', '三月'],
    datasets: [{ data: [10, 20, 30] }]
  },
  title: '销售趋势'
})
```

:::

## 支持的图表类型

```typescript
// 15+ 种图表类型
type ChartType = 
  | 'line'        // 折线图
  | 'bar'         // 柱状图
  | 'pie'         // 饼图
  | 'scatter'     // 散点图
  | 'radar'       // 雷达图
  | 'heatmap'     // 热力图
  | 'candlestick' // K线图
  | 'funnel'      // 漏斗图
  | 'gauge'       // 仪表盘
  | 'waterfall'   // 瀑布图
  | 'sunburst'    // 旭日图
  // ... 更多
```

## 常用配置

```typescript
<Chart
  type="line"
  data={chartData}
  title="图表标题"
  theme="dark"           // 主题: 'light' | 'dark'
  darkMode={true}        // 暗黑模式
  responsive={true}      // 响应式
  config={{
    color: ['#5470c6'],  // 自定义颜色
    dataZoom: true,      // 数据缩放
    toolbox: true,       // 工具箱
    virtual: true,       // 虚拟渲染(大数据)
    worker: true,        // Web Worker
    cache: true          // 缓存
  }}
/>
```

## 更多资源

- [完整文档](./docs/index.md)
- [项目状态](./PROJECT_STATUS.md)
- [重构总结](./REFACTORING_COMPLETE.md)
- [各包 README](./packages/)

## 获取帮助

- **GitHub**: https://github.com/ldesign/chart
- **Issues**: 报告问题
- **Discussions**: 讨论和提问
