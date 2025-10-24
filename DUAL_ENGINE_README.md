# 🎉 @ldesign/chart - 双引擎架构

> 企业级智能图表插件，现支持 **ECharts** + **VChart** 双引擎，一套 API，多种选择！

[![npm version](https://img.shields.io/npm/v/@ldesign/chart.svg)](https://www.npmjs.com/package/@ldesign/chart)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## ✨ 新特性：双引擎支持

### 🎯 为什么选择双引擎？

通过统一的 API 同时支持 ECharts 和 VChart，让您可以：

- ✅ **灵活选择**：根据场景选择最合适的引擎
- ✅ **平滑迁移**：现有 ECharts 代码无需改动
- ✅ **按需加载**：只打包使用的引擎
- ✅ **特性检测**：自动选择支持所需特性的引擎
- ✅ **小程序优先**：VChart 提供更好的小程序支持
- ✅ **3D 图表**：VChart 独家 3D 可视化

### 📊 引擎对比

| 特性 | ECharts | VChart |
|------|:-------:|:------:|
| Web 应用 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 小程序 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 3D 图表 | ❌ | ✅ |
| 数据故事 | ❌ | ✅ |
| 性能 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 生态 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| SSR | ✅ | ✅ |

---

## 🚀 快速开始

### 安装

```bash
# 安装核心库
npm install @ldesign/chart

# 选择一个或多个引擎
npm install echarts           # ECharts 引擎
npm install @visactor/vchart  # VChart 引擎
```

### 基础用法

```typescript
import { Chart, EChartsEngine, engineManager } from '@ldesign/chart';

// 注册引擎
engineManager.register('echarts', new EChartsEngine());

// 创建图表
const chart = new Chart(document.getElementById('chart'), {
  type: 'line',
  data: [1, 2, 3, 4, 5],
  title: '月度销售趋势',
});
```

### 使用 VChart 引擎

```typescript
import { Chart, VChartEngine, engineManager } from '@ldesign/chart';

// 注册 VChart 引擎
engineManager.register('vchart', new VChartEngine());

// 创建 3D 图表（VChart 专属）
const chart3D = new Chart(container, {
  type: '3d-bar',
  data: myData,
  title: '3D 柱状图',
  engine: 'vchart', // 指定引擎
});
```

### Vue 3 集成

```vue
<template>
  <Chart 
    type="line" 
    :data="[1, 2, 3, 4, 5]"
    engine="vchart"
    title="使用 VChart"
  />
</template>

<script setup>
import { Chart } from '@ldesign/chart/vue';
import { VChartEngine, engineManager } from '@ldesign/chart';

engineManager.register('vchart', new VChartEngine());
</script>
```

### React 集成

```jsx
import { Chart } from '@ldesign/chart/react';
import { VChartEngine, engineManager } from '@ldesign/chart';

engineManager.register('vchart', new VChartEngine());

function App() {
  return (
    <Chart 
      type="3d-scatter" 
      data={myData}
      engine="vchart"
    />
  );
}
```

---

## 🎨 支持的图表类型

### 通用图表（两个引擎都支持）

- 📈 **折线图** `line`
- 📊 **柱状图** `bar`
- 🥧 **饼图** `pie`
- 📍 **散点图** `scatter`
- 🕸️ **雷达图** `radar`
- 🔥 **热力图** `heatmap`
- 🎯 **仪表盘** `gauge`
- 🌊 **瀑布图** `waterfall`
- 📐 **漏斗图** `funnel`

### VChart 专属图表

- 🎲 **3D 柱状图** `3d-bar`
- 🌐 **3D 散点图** `3d-scatter`
- 🥮 **3D 饼图** `3d-pie`
- ☀️ **旭日图** `sunburst`
- 🗺️ **树图** `treemap`
- 🌊 **桑基图** `sankey`
- 💧 **水球图** `liquid`
- ☁️ **词云图** `wordcloud`

---

## 🎯 智能引擎选择

图表库可以根据需求自动选择合适的引擎：

```typescript
import { engineManager, EChartsEngine, VChartEngine } from '@ldesign/chart';

// 注册两个引擎
engineManager.register('echarts', new EChartsEngine());
engineManager.register('vchart', new VChartEngine());

// 3D 图表自动使用 VChart
const chart3D = new Chart(container, {
  type: '3d-bar', // 自动选择 VChart
  data: myData,
});

// 普通图表使用默认的 ECharts
const chart2D = new Chart(container, {
  type: 'bar',
  data: myData,
});
```

### 特性检测

```typescript
import { VChartEngine, ChartFeature } from '@ldesign/chart';

const vchart = new VChartEngine();

console.log(vchart.supports(ChartFeature.MINI_PROGRAM)); // true
console.log(vchart.supports(ChartFeature.THREE_D)); // true
console.log(vchart.supports(ChartFeature.STORY_MODE)); // true
```

---

## 📱 小程序支持

VChart 提供了卓越的小程序支持：

```typescript
// 微信小程序
const chart = new Chart(canvas, {
  type: 'line',
  data: myData,
  engine: 'vchart',
  mode: 'miniprogram', // 小程序模式
});
```

支持的小程序平台：
- ✅ 微信小程序
- ✅ 支付宝小程序  
- ✅ 字节跳动小程序
- ✅ Taro 跨平台

---

## ⚡ 性能优化

### 大数据处理

```typescript
// ECharts: 虚拟渲染 + Web Worker
const chartECharts = new Chart(container, {
  type: 'line',
  data: largeDataset, // 10万+ 数据点
  engine: 'echarts',
  performance: {
    virtual: true,
    worker: true,
    cache: true,
  },
});

// VChart: 高性能渲染
const chartVChart = new Chart(container, {
  type: 'scatter',
  data: hugeDataset,
  engine: 'vchart',
});
```

### 按需加载

```typescript
// 只加载需要的图表类型
import { echartsLoader } from '@ldesign/chart';

await echartsLoader.loadChart('line');
await echartsLoader.loadComponents(['tooltip', 'legend']);
```

---

## 🔧 API

### 核心类

```typescript
// 引擎
class EChartsEngine implements ChartEngine
class VChartEngine implements ChartEngine

// 引擎管理
class EngineManager {
  register(name: string, engine: ChartEngine): void
  select(name?: string, feature?: ChartFeature): ChartEngine
  setDefaultEngine(name: string): void
  getStats(): EngineStats
}

// 图表实例
class Chart {
  constructor(container: HTMLElement, config: ChartConfig)
  updateData(data: ChartData): Promise<void>
  resize(): void
  dispose(): void
  getInstance(): EngineInstance
}
```

### 配置接口

```typescript
interface UniversalChartConfig {
  type: ChartType
  data: ChartData
  title?: string | TitleConfig
  legend?: boolean | LegendConfig
  tooltip?: boolean | TooltipConfig
  theme?: string | ThemeConfig
  darkMode?: boolean
  fontSize?: number
  engine?: 'echarts' | 'vchart' | 'auto'
  performance?: PerformanceConfig
}
```

---

## 📚 文档

- 📖 [双引擎使用指南](./docs/dual-engine-guide.md)
- 📖 [API 参考文档](./docs/api-reference.md)
- 📖 [小程序开发指南](./docs/miniprogram.md)
- 📖 [迁移指南](./docs/migration.md)
- 📖 [性能优化指南](./docs/performance-guide.md)

---

## 🌟 示例

查看 `examples/` 目录获取完整示例：

- Vue 3 示例
- React 示例
- Lit 示例
- 小程序示例
- 双引擎对比示例

---

## 🤝 兼容性

### 浏览器支持

- Chrome >= 64
- Firefox >= 67
- Safari >= 12
- Edge >= 79

### 框架支持

- Vue 3.x
- React 16.8+
- Lit 2.x / 3.x
- 原生 JavaScript

### 小程序支持

- 微信小程序
- 支付宝小程序
- 字节跳动小程序
- QQ 小程序

---

## 📈 版本历史

### v2.0.0 (2025-10-24) - 双引擎架构

**重大更新**：
- ✨ 新增 VChart 引擎支持
- ✨ 引擎抽象层设计
- ✨ 智能引擎选择
- ✨ 小程序平台优化
- ✨ 3D 图表支持
- 🔧 100% 向后兼容

### v1.3.0 - 性能优化版

- 新增瀑布图
- CSV 数据支持
- 实时数据流
- 图表联动
- 手势交互
- 性能提升 30-70%

---

## 🛠️ 开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 开发模式
pnpm dev

# 运行测试
pnpm test

# 运行示例
cd examples/vue-example && pnpm dev
```

---

## 📄 License

MIT © ldesign

---

## 🙏 致谢

- [Apache ECharts](https://echarts.apache.org/) - 强大的可视化库
- [VChart](https://www.visactor.io/vchart) - 字节跳动的数据可视化解决方案
- 所有贡献者和用户

---

**开始使用双引擎架构，让您的数据可视化更加灵活强大！** 🚀


