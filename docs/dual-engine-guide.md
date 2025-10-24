# @ldesign/chart 双引擎使用指南

## 🎯 概述

@ldesign/chart 现在支持**双引擎架构**，可以同时使用 **ECharts** 和 **VChart** 两个强大的图表库。通过统一的 API，您可以根据需求灵活选择最适合的引擎。

### 为什么选择双引擎？

| 特性 | ECharts | VChart |
|------|---------|--------|
| 成熟度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 性能 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 小程序支持 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 3D图表 | ❌ | ✅ |
| 数据故事 | ❌ | ✅ |
| 生态系统 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 📦 安装

### 1. 安装核心库

```bash
npm install @ldesign/chart
```

### 2. 安装图表引擎

根据需要选择一个或两个引擎：

```bash
# 安装 ECharts（推荐用于 Web 应用）
npm install echarts

# 安装 VChart（推荐用于小程序和 3D 图表）
npm install @visactor/vchart

# 或者同时安装两个
npm install echarts @visactor/vchart
```

---

## 🚀 快速开始

### 使用 ECharts 引擎（默认）

```typescript
import { Chart, EChartsEngine, engineManager } from '@ldesign/chart';

// 注册 ECharts 引擎
const echartsEngine = new EChartsEngine();
engineManager.register('echarts', echartsEngine);

// 创建图表（自动使用 ECharts）
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
const vchartEngine = new VChartEngine();
engineManager.register('vchart', vchartEngine);

// 显式指定使用 VChart
const chart = new Chart(document.getElementById('chart'), {
  type: 'line',
  data: [1, 2, 3, 4, 5],
  title: '月度销售趋势',
  engine: 'vchart', // 👈 指定引擎
});
```

### 智能引擎选择

根据特性自动选择合适的引擎：

```typescript
import { Chart, EChartsEngine, VChartEngine, engineManager } from '@ldesign/chart';

// 注册两个引擎
engineManager.register('echarts', new EChartsEngine());
engineManager.register('vchart', new VChartEngine());

// 需要 3D 图表时，自动选择 VChart
const chart3D = new Chart(container, {
  type: '3d-bar', // 自动使用 VChart
  data: myData,
});

// 普通图表使用默认的 ECharts
const chart2D = new Chart(container, {
  type: 'bar',
  data: myData,
});
```

---

## 🎨 框架集成

### Vue 3

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

// 初始化时注册引擎
engineManager.register('vchart', new VChartEngine());
</script>
```

### React

```jsx
import { Chart } from '@ldesign/chart/react';
import { VChartEngine, engineManager } from '@ldesign/chart';

// 注册引擎
engineManager.register('vchart', new VChartEngine());

function App() {
  return (
    <Chart 
      type="3d-scatter" 
      data={myData}
      engine="vchart"
      title="3D 散点图"
    />
  );
}
```

---

## 🏗️ 引擎管理

### 设置默认引擎

```typescript
import { engineManager } from '@ldesign/chart';

// 设置 VChart 为默认引擎
engineManager.setDefaultEngine('vchart');
```

### 获取引擎信息

```typescript
// 获取已注册的引擎列表
const engines = engineManager.getRegisteredEngines();
console.log(engines); // ['echarts', 'vchart']

// 获取引擎统计信息
const stats = engineManager.getStats();
console.log(stats);
/*
{
  total: 2,
  engines: [
    {
      name: 'echarts',
      version: '5.4.3',
      features: ['webWorker', 'virtualRender', 'canvas', 'svg']
    },
    {
      name: 'vchart',
      version: '1.2.0',
      features: ['miniProgram', 'storyMode', '3d', 'ssr']
    }
  ]
}
*/
```

### 自定义引擎选择策略

```typescript
import { EngineManager, EngineSelectionStrategy } from '@ldesign/chart';

class CustomStrategy implements EngineSelectionStrategy {
  select(engines, feature) {
    // 自定义选择逻辑
    if (feature === 'miniProgram') {
      return engines.get('vchart');
    }
    return engines.get('echarts');
  }
}

const manager = new EngineManager(new CustomStrategy());
```

---

## 📱 小程序支持

VChart 提供了优秀的小程序支持。

### 微信小程序

```typescript
import { Chart, VChartEngine, engineManager } from '@ldesign/chart';

// 注册 VChart 引擎
engineManager.register('vchart', new VChartEngine());

// 在小程序中创建图表
const chart = new Chart(canvas, {
  type: 'line',
  data: myData,
  engine: 'vchart',
  // 小程序特定配置
  mode: 'miniprogram',
});
```

---

## 🎭 特性检测

检查引擎是否支持特定特性：

```typescript
import { VChartEngine, ChartFeature } from '@ldesign/chart';

const vchart = new VChartEngine();

console.log(vchart.supports(ChartFeature.MINI_PROGRAM)); // true
console.log(vchart.supports(ChartFeature.THREE_D)); // true
console.log(vchart.supports(ChartFeature.STORY_MODE)); // true
```

可用特性：

- `MINI_PROGRAM` - 小程序支持
- `WEB_WORKER` - Web Worker 支持
- `VIRTUAL_RENDER` - 虚拟渲染（大数据）
- `STORY_MODE` - 数据故事模式
- `THREE_D` - 3D 图表
- `CANVAS_RENDERER` - Canvas 渲染器
- `SVG_RENDERER` - SVG 渲染器
- `SSR` - 服务端渲染

---

## 🎨 高级图表类型

### 3D 图表（VChart 专属）

```typescript
// 3D 柱状图
const chart3D = new Chart(container, {
  type: '3d-bar',
  data: myData,
  engine: 'vchart',
});

// 3D 散点图
const scatter3D = new Chart(container, {
  type: '3d-scatter',
  data: scatterData,
  engine: 'vchart',
});

// 3D 饼图
const pie3D = new Chart(container, {
  type: '3d-pie',
  data: pieData,
  engine: 'vchart',
});
```

### 旭日图

```typescript
const sunburst = new Chart(container, {
  type: 'sunburst',
  data: hierarchicalData,
  engine: 'vchart',
});
```

### 树图

```typescript
const treemap = new Chart(container, {
  type: 'treemap',
  data: treeData,
  engine: 'vchart',
});
```

### 桑基图

```typescript
const sankey = new Chart(container, {
  type: 'sankey',
  data: flowData,
  engine: 'vchart',
});
```

### 水球图

```typescript
const liquid = new Chart(container, {
  type: 'liquid',
  data: { value: 0.75 },
  engine: 'vchart',
});
```

### 词云

```typescript
const wordcloud = new Chart(container, {
  type: 'wordcloud',
  data: wordData,
  engine: 'vchart',
});
```

---

## 🔧 配置适配

### 通用配置格式

两个引擎都支持统一的通用配置格式：

```typescript
const config: UniversalChartConfig = {
  type: 'line',
  data: {
    labels: ['1月', '2月', '3月'],
    datasets: [
      { name: '销售额', data: [100, 200, 150] }
    ]
  },
  title: '月度销售',
  legend: true,
  tooltip: true,
  grid: {
    left: '10%',
    right: '10%',
  },
  colors: ['#5470c6', '#91cc75'],
  darkMode: false,
  fontSize: 14,
  animation: true,
};
```

### 引擎特定配置

如果需要使用引擎特定的高级功能，可以获取原生实例：

```typescript
const chart = new Chart(container, config);
const instance = chart.getInstance();

// 获取原生引擎实例
const nativeInstance = instance.getNativeInstance();

// 使用 ECharts 特定功能
if (config.engine === 'echarts') {
  nativeInstance.dispatchAction({ type: 'highlight', seriesIndex: 0 });
}

// 使用 VChart 特定功能
if (config.engine === 'vchart') {
  nativeInstance.updateData('dataId', newData);
}
```

---

## ⚡ 性能优化

### 按需加载

两个引擎都支持按需加载，只加载使用的图表类型：

```typescript
import { Chart, echartsLoader } from '@ldesign/chart';

// ECharts 按需加载
await echartsLoader.loadChart('line');
await echartsLoader.loadComponents(['tooltip', 'legend']);

// VChart 自动按需加载（无需手动配置）
```

### 大数据优化

```typescript
// ECharts 的虚拟渲染和 Worker 支持
const chart = new Chart(container, {
  type: 'line',
  data: largeDataset, // 10万+ 数据点
  engine: 'echarts',
  performance: {
    virtual: true,
    worker: true,
    cache: true,
  },
});

// VChart 的高性能渲染
const vchartLarge = new Chart(container, {
  type: 'scatter',
  data: hugeDat,
  engine: 'vchart',
  // VChart 内部优化
});
```

---

## 🔄 迁移指南

### 从纯 ECharts 迁移

如果您之前使用的是纯 ECharts：

```typescript
// 之前
import { Chart } from '@ldesign/chart';
const chart = new Chart(container, config);

// 现在（完全兼容，无需改动）
import { Chart } from '@ldesign/chart';
const chart = new Chart(container, config);

// 或者显式指定（推荐）
import { Chart, EChartsEngine, engineManager } from '@ldesign/chart';
engineManager.register('echarts', new EChartsEngine());

const chart = new Chart(container, {
  ...config,
  engine: 'echarts', // 明确指定
});
```

### 切换到 VChart

```typescript
// 1. 安装 VChart
// npm install @visactor/vchart

// 2. 注册引擎
import { VChartEngine, engineManager } from '@ldesign/chart';
engineManager.register('vchart', new VChartEngine());

// 3. 指定引擎
const chart = new Chart(container, {
  ...config,
  engine: 'vchart',
});
```

---

## 🐛 常见问题

### Q: 如何选择引擎？

**A**: 根据您的需求：
- **Web 应用** → ECharts（成熟稳定）
- **小程序** → VChart（更好支持）
- **3D 图表** → VChart（独家功能）
- **复杂交互** → ECharts（丰富的事件系统）
- **数据故事** → VChart（内置支持）

### Q: 可以在同一页面使用两个引擎吗？

**A**: 完全可以！

```typescript
// 注册两个引擎
engineManager.register('echarts', new EChartsEngine());
engineManager.register('vchart', new VChartEngine());

// 不同图表使用不同引擎
const chart1 = new Chart(container1, { engine: 'echarts', ... });
const chart2 = new Chart(container2, { engine: 'vchart', ... });
```

### Q: 打包体积会增加吗？

**A**: 不会！引擎是可选的：
- 只安装需要的引擎
- 按需加载图表类型
- Tree-shaking 自动删除未使用的代码

### Q: 如何获取引擎原生实例？

**A**:

```typescript
const chart = new Chart(container, config);
const instance = chart.getInstance();
const native = instance.getNativeInstance();

// native 是 ECharts 或 VChart 的原生实例
```

---

## 📚 更多资源

- [ECharts 官方文档](https://echarts.apache.org/)
- [VChart 官方文档](https://www.visactor.io/vchart)
- [API 参考文档](./api-reference.md)
- [示例代码](../examples/)

---

**最后更新**: 2025-10-24


