# @ldesign/chart v2.0.0

> 🎉 企业级智能图表插件 - 现已支持**双引擎架构**！

[![npm version](https://img.shields.io/npm/v/@ldesign/chart.svg)](https://www.npmjs.com/package/@ldesign/chart)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## ✨ v2.0.0 重大更新

**双引擎架构来了！** 🚀

- ✅ **ECharts + VChart** 双引擎支持
- ✅ **统一 API** - 一套代码，多种选择
- ✅ **小程序优先** - 完整的小程序支持
- ✅ **3D 图表** - VChart 独家 3D 可视化
- ✅ **智能选择** - 根据特性自动选择引擎
- ✅ **100% 兼容** - 现有代码无需改动

---

## 🎯 核心特性

### 双引擎架构

同时支持 ECharts 和 VChart，根据需求选择：

```typescript
// 使用 ECharts（成熟稳定）
const chart1 = new Chart(container, {
  type: 'line',
  data: myData,
  engine: 'echarts',
});

// 使用 VChart（小程序优先、3D图表）
const chart2 = new Chart(container, {
  type: '3d-bar',
  data: myData,
  engine: 'vchart',
});

// 自动选择（智能检测）
const chart3 = new Chart(container, {
  type: '3d-scatter', // 自动使用 VChart
  data: myData,
});
```

### 小程序完整支持

```javascript
// 微信小程序
import { createWechatChart } from '@ldesign/chart';

const chart = createWechatChart({
  canvas: canvasNode,
  context: ctx,
  type: 'line',
  data: myData,
});

// 支付宝小程序
import { createAlipayChart } from '@ldesign/chart';

const chart = createAlipayChart({
  canvas: canvasNode,
  context: ctx,
  type: 'bar',
  data: myData,
});
```

### 多框架支持

#### Vue 3
```vue
<template>
  <Chart 
    type="line" 
    :data="[1, 2, 3, 4, 5]"
    engine="vchart"
    title="使用 VChart 引擎"
  />
</template>

<script setup>
import { Chart } from '@ldesign/chart/vue';
import { VChartEngine, engineManager } from '@ldesign/chart';

engineManager.register('vchart', new VChartEngine());
</script>
```

#### React
```jsx
import { Chart } from '@ldesign/chart/react';
import { EChartsEngine, engineManager } from '@ldesign/chart';

engineManager.register('echarts', new EChartsEngine());

function App() {
  return <Chart type="bar" data={[100, 200, 150, 300]} />;
}
```

#### Lit
```html
<script type="module">
  import '@ldesign/chart/lit';
  import { EChartsEngine, engineManager } from '@ldesign/chart';
  
  engineManager.register('echarts', new EChartsEngine());
</script>

<ldesign-chart 
  type="pie" 
  .data="${[30, 25, 25, 20]}"
  engine="echarts"
></ldesign-chart>
```

---

## 📦 安装

```bash
# 安装核心库
npm install @ldesign/chart

# 安装引擎（选择一个或两个）
npm install echarts              # ECharts 引擎
npm install @visactor/vchart     # VChart 引擎

# 或使用 yarn/pnpm
yarn add @ldesign/chart echarts @visactor/vchart
pnpm add @ldesign/chart echarts @visactor/vchart
```

---

## 🎨 支持的图表类型

### 通用图表（两个引擎都支持）

- 📈 折线图 `line`
- 📊 柱状图 `bar`
- 🥧 饼图 `pie`
- 📍 散点图 `scatter`
- 🕸️ 雷达图 `radar`
- 🔥 热力图 `heatmap`
- 🎯 仪表盘 `gauge`
- 🌊 瀑布图 `waterfall`
- 📐 漏斗图 `funnel`
- 📊 混合图 `mixed`

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

## 🚀 快速开始

### 1. 基础用法

```typescript
import { Chart, EChartsEngine, engineManager } from '@ldesign/chart';

// 注册引擎（通常在应用入口做一次）
engineManager.register('echarts', new EChartsEngine());

// 创建图表
const chart = new Chart(document.getElementById('chart'), {
  type: 'line',
  data: [1, 2, 3, 4, 5],
  title: '我的第一个图表',
});
```

### 2. 使用 VChart 3D 图表

```typescript
import { Chart, VChartEngine, engineManager } from '@ldesign/chart';

engineManager.register('vchart', new VChartEngine());

const chart3D = new Chart(container, {
  type: '3d-bar',
  data: {
    labels: ['产品A', '产品B', '产品C'],
    datasets: [{
      name: '销量',
      data: [120, 200, 150]
    }]
  },
  engine: 'vchart',
});
```

### 3. 小程序使用

```javascript
// 微信小程序页面
import { createWechatChart } from '@ldesign/chart';

Page({
  onReady() {
    const query = wx.createSelectorQuery();
    query.select('#chart')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        
        const chart = createWechatChart({
          canvas,
          context: ctx,
          pixelRatio: wx.getSystemInfoSync().pixelRatio,
          type: 'line',
          data: [100, 200, 150, 300, 250],
        });
      });
  }
});
```

---

## 📚 文档

- 📖 [快速开始](./GETTING_STARTED.md)
- 📖 [双引擎使用指南](./docs/dual-engine-guide.md)
- 📖 [小程序开发指南](./docs/miniprogram-guide.md)
- 📖 [API 参考](./docs/api-reference.md)
- 📖 [性能优化指南](./docs/performance-guide.md)

---

## 🌟 核心优势

### 1. 统一 API
一套代码，多个引擎，只需修改 `engine` 参数即可切换。

### 2. 智能选择
根据图表类型、平台、特性自动选择最优引擎。

### 3. 按需加载
引擎为可选依赖，只打包使用的功能。

### 4. 100% 兼容
现有 ECharts 代码无需任何修改。

### 5. 小程序优先
VChart 提供卓越的小程序支持。

### 6. 3D 可视化
支持 3D 柱状图、散点图、饼图等。

---

## 🎭 引擎对比

| 场景 | 推荐引擎 |
|------|---------|
| Web 应用 | ECharts |
| 小程序 | VChart ⭐ |
| 3D 图表 | VChart ⭐ |
| 复杂交互 | ECharts |
| 数据故事 | VChart ⭐ |

---

## 💡 示例代码

查看 `examples/` 目录获取完整示例：

- Vue 3 示例
- React 示例
- Lit 示例
- 双引擎演示
- 小程序示例

---

## 🔧 API

### 引擎管理

```typescript
import { engineManager, EChartsEngine, VChartEngine } from '@ldesign/chart';

// 注册引擎
engineManager.register('echarts', new EChartsEngine());
engineManager.register('vchart', new VChartEngine());

// 设置默认引擎
engineManager.setDefaultEngine('vchart');

// 获取引擎信息
const stats = engineManager.getStats();
```

### 图表创建

```typescript
import { Chart } from '@ldesign/chart';

const chart = new Chart(container, {
  type: 'line',
  data: myData,
  engine: 'vchart', // 可选: 'echarts' | 'vchart' | 'auto'
  title: '标题',
  legend: true,
  tooltip: true,
  darkMode: false,
  fontSize: 14,
});
```

### 小程序

```typescript
import { createWechatChart, createAlipayChart } from '@ldesign/chart';

// 微信
const wechatChart = createWechatChart({ /* ... */ });

// 支付宝
const alipayChart = createAlipayChart({ /* ... */ });
```

---

## 📈 版本历史

### v2.0.0 (2025-10-24) - 双引擎架构 🎉

**重大更新**：
- ✨ 新增 VChart 引擎支持
- ✨ 引擎抽象层设计
- ✨ 智能引擎选择机制
- ✨ 完整的小程序支持
- ✨ 3D 图表支持
- ✨ Vue/React/Lit 引擎选择参数
- 📚 2,800+ 行详细文档
- 🔧 100% 向后兼容

### v1.3.0 - 性能优化版

- 新增瀑布图
- CSV 数据支持
- 实时数据流
- 图表联动
- 手势交互
- 性能提升 30-70%

---

## 🤝 兼容性

### 浏览器
- Chrome >= 64
- Firefox >= 67
- Safari >= 12
- Edge >= 79

### 框架
- Vue 3.x
- React 16.8+
- Lit 2.x / 3.x

### 小程序
- 微信小程序
- 支付宝小程序
- 字节跳动小程序
- QQ 小程序

---

## 🛠️ 开发

```bash
# 克隆仓库
git clone https://github.com/ldesign/chart.git

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
- [VChart](https://www.visactor.io/vchart) - 字节跳动的数据可视化方案
- 所有贡献者和用户

---

## 🔗 相关链接

- [GitHub](https://github.com/ldesign/chart)
- [文档](./docs/)
- [示例](./examples/)
- [Changelog](./CHANGELOG.md)

---

**开始使用 v2.0.0，体验双引擎的强大功能！** 🎉🚀


