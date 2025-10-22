# @ldesign/chart

企业级智能图表插件，支持多框架，基于 Apache ECharts，按需加载，性能优异。

## 核心特性

- **🎯 简单易用**：零配置快速上手，智能推断数据结构
- **💪 功能强大**：支持所有 ECharts 配置，满足复杂场景
- **📦 按需加载**：图表类型和功能模块按需加载，减小打包体积
- **⚡ 性能优越**：虚拟渲染、数据分片、Web Worker 支持大数据
- **🔧 内存优化**：智能实例管理、自动清理、弱引用缓存
- **🎨 主题系统**：内置主题，支持暗黑模式，字体大小可调
- **🌈 多框架支持**：Vue 3、React、Lit 原生支持

## ✨ v1.3.0 新特性 🎉

**重大功能更新！** 新增13项实用功能，全面提升图表能力。

### 新增图表类型
- **🌊 瀑布图（Waterfall）**: 财务数据、累计变化的完美展示
- **🎯 漏斗图增强**: 金字塔模式、对比模式、转化率标注

### 数据支持增强
- **📊 CSV 导入导出**: 完整的 CSV 解析和生成
- **✅ JSON Schema 验证**: 运行时数据验证，类型安全
- **🔄 实时数据流**: WebSocket、SSE、轮询多种数据源

### 交互功能
- **🔗 图表联动**: 多图表数据和事件同步
- **📱 手势支持**: 双指缩放、旋转、滑动等移动端交互
- **💾 导出增强**: PNG/SVG/CSV 导出，复制到剪贴板

### 性能提升
- **配置生成**: 提升 30-40%
- **数据解析**: 提升 40%
- **模块加载**: 提升 20%

> 详见：[CHANGELOG v1.3.0](./CHANGELOG_v1.3.0.md)

## 安装

```bash
npm install @ldesign/chart echarts
# 或
yarn add @ldesign/chart echarts
# 或
pnpm add @ldesign/chart echarts
```

## 快速开始

### Vue 3

```vue
<template>
  <Chart type="line" :data="[1, 2, 3, 4, 5]" />
</template>

<script setup>
import { Chart } from '@ldesign/chart/vue'
</script>
```

### React

```jsx
import { Chart } from '@ldesign/chart/react'

function App() {
  return <Chart type="line" data={[1, 2, 3, 4, 5]} />
}
```

### Lit / Web Components

```html
<script type="module">
  import '@ldesign/chart/lit'
</script>

<ldesign-chart type="line" .data="${[1, 2, 3, 4, 5]}"></ldesign-chart>
```

## 使用示例

### 简单数据

```javascript
// 最简单：纯数组
<Chart type="line" :data="[1, 2, 3, 4, 5]" />

// 带标签
<Chart 
  type="bar"
  :data="{
    labels: ['周一', '周二', '周三', '周四', '周五'],
    datasets: [{ data: [120, 200, 150, 80, 70] }]
  }"
/>

// 多系列
<Chart 
  type="line"
  :data="{
    labels: ['1月', '2月', '3月', '4月'],
    datasets: [
      { name: '销售额', data: [100, 200, 300, 400] },
      { name: '利润', data: [50, 80, 120, 180] }
    ]
  }"
  title="月度报表"
/>
```

### 主题和样式

```javascript
// 暗黑模式
<Chart type="pie" :data="data" dark-mode />

// 自定义字体大小
<Chart type="bar" :data="data" :font-size="16" />

// 自定义主题
<Chart type="line" :data="data" theme="blue" />
```

### 性能优化

```javascript
// 大数据集虚拟渲染
<Chart type="scatter" :data="largeData" virtual />

// 使用 Web Worker
<Chart type="line" :data="hugeData" worker />

// 启用缓存
<Chart type="bar" :data="data" cache />
```

### 高级配置

```javascript
// 使用完整的 ECharts 配置
<Chart 
  type="line" 
  :data="data"
  :echarts="{
    xAxis: { 
      type: 'time',
      axisLabel: { formatter: '{yyyy}-{MM}-{dd}' }
    },
    yAxis: { 
      type: 'log',
      min: 1,
      max: 1000
    },
    dataZoom: [
      { type: 'inside' },
      { type: 'slider' }
    ]
  }"
/>
```

## API 文档

详细文档请访问：[docs/](./docs/)

## License

MIT

