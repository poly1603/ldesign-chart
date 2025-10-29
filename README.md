# @ldesign/chart

企业级智能图表插件 - Monorepo

## 📦 包结构 (v2.0)

从 v2.0 开始，@ldesign/chart 已拆分为多个独立的包，按需安装：

| 包名 | 描述 | 使用场景 |
|------|------|----------|
| [@ldesign/chart-core](./packages/core) | 核心图表库（框架无关） | 任何 JavaScript 项目 |
| [@ldesign/chart-vue](./packages/vue) | Vue 3 适配器 | Vue 3 项目 |
| [@ldesign/chart-react](./packages/react) | React 适配器 | React 项目 |
| [@ldesign/chart-lit](./packages/lit) | Lit/Web Components 适配器 | Web Components 项目 |
| [@ldesign/chart-angular](./packages/angular) | Angular 适配器 | Angular 14+ 项目 |
| [@ldesign/chart-svelte](./packages/svelte) | Svelte 适配器 | Svelte 4/5 项目 |
| [@ldesign/chart-solid](./packages/solid) | Solid.js 适配器 | Solid.js 项目 |
| [@ldesign/chart-qwik](./packages/qwik) | Qwik 适配器 | Qwik 项目 |

## 🚀 快速开始

### Vue 3 项目

```bash
pnpm add @ldesign/chart-vue echarts
```

```vue
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

### React 项目

```bash
pnpm add @ldesign/chart-react echarts
```

```tsx
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

### Lit/Web Components 项目

```bash
pnpm add @ldesign/chart-lit echarts
```

```typescript
import { ChartElement } from '@ldesign/chart-lit'

// 自动注册 <ldesign-chart> 自定义元素
```

```html
<ldesign-chart
  type="line"
  title="销售趋势"
></ldesign-chart>
```

### 框架无关（纯 JS/TS）

```bash
pnpm add @ldesign/chart-core echarts
```

```typescript
import { createChart } from '@ldesign/chart-core'

const chart = createChart('#chart-container', {
  type: 'line',
  data: {
    labels: ['一月', '二月', '三月'],
    datasets: [{ data: [10, 20, 30] }]
  }
})
```

## ✨ 主要特性

- 🎨 **双引擎支持** - ECharts 和 VChart
- 🚀 **高性能** - 虚拟渲染、Web Worker、智能缓存
- 📊 **丰富图表类型** - 折线图、柱状图、饼图、瀑布图等 15+ 种图表
- 🎯 **智能配置** - 自动优化配置，开箱即用
- 💾 **内存优化** - 自动缓存管理、对象池
- 📈 **数据处理** - CSV 解析、实时数据流、数据验证
- 🔄 **图表联动** - 多图表同步交互
- 📱 **响应式** - 自动适配不同屏幕尺寸
- 🎭 **主题系统** - 内置多种主题，支持自定义

## 📚 文档

- [核心库文档](./packages/core/README.md)
- [Vue 适配器文档](./packages/vue/README.md)
- [React 适配器文档](./packages/react/README.md)
- [Lit 适配器文档](./packages/lit/README.md)

## 🔄 从 v1.x 迁移到 v2.0

### 安装变更

**v1.x (旧版)**:
```bash
pnpm add @ldesign/chart
```

**v2.0 (新版)**:
```bash
# Vue 3 项目
pnpm add @ldesign/chart-vue echarts

# React 项目
pnpm add @ldesign/chart-react echarts

# Lit 项目
pnpm add @ldesign/chart-lit echarts
```

### 导入变更

**v1.x (旧版)**:
```typescript
// Vue
import { Chart } from '@ldesign/chart/vue'

// React
import { Chart } from '@ldesign/chart/react'

// Lit
import { ChartElement } from '@ldesign/chart/lit'
```

**v2.0 (新版)**:
```typescript
// Vue
import { Chart } from '@ldesign/chart-vue'

// React
import { Chart } from '@ldesign/chart-react'

// Lit
import { ChartElement } from '@ldesign/chart-lit'
```

### 优势

1. **包体积更小** - 只安装需要的框架适配器，减少 ~60% 包大小
2. **类型更精确** - 无框架污染，TypeScript 类型提示更准确
3. **版本独立** - 可以独立升级某个适配器，无需升级全部
4. **按需安装** - 用什么框架就装什么包

## 🛠️ 开发

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 构建单个包
pnpm build:core
pnpm build:vue
pnpm build:react
pnpm build:lit

# 开发模式（监听）
pnpm dev

# 测试
pnpm test
```

## 📄 License

MIT

## 🤝 贡献

欢迎贡献代码！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md)
