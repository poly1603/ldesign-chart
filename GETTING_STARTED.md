# @ldesign/chart 快速上手

> 5 分钟快速了解双引擎架构 🚀

---

## 🎯 什么是双引擎？

@ldesign/chart 现在支持两个强大的图表引擎：

- **ECharts** - 成熟稳定，丰富生态
- **VChart** - 小程序优先，支持 3D

**关键优势**：
- ✅ 同一套 API
- ✅ 自动选择最优引擎
- ✅ 按需加载
- ✅ 100% 向后兼容

---

## 📦 安装

```bash
# 1. 安装核心库
npm install @ldesign/chart

# 2. 选择引擎（或两个都装）
npm install echarts              # ECharts 引擎
npm install @visactor/vchart     # VChart 引擎
```

---

## 🚀 5 分钟入门

### 1. 基础用法（ECharts）

```html
<!DOCTYPE html>
<html>
<body>
  <div id="chart" style="width: 600px; height: 400px;"></div>
  
  <script type="module">
    import { Chart, EChartsEngine, engineManager } from '@ldesign/chart';
    
    // 注册引擎
    engineManager.register('echarts', new EChartsEngine());
    
    // 创建图表
    const chart = new Chart(document.getElementById('chart'), {
      type: 'line',
      data: [1, 2, 3, 4, 5],
      title: '我的第一个图表',
    });
  </script>
</body>
</html>
```

### 2. 使用 VChart 引擎

```javascript
import { Chart, VChartEngine, engineManager } from '@ldesign/chart';

// 注册 VChart
engineManager.register('vchart', new VChartEngine());

// 指定使用 VChart
const chart = new Chart(container, {
  type: 'line',
  data: [1, 2, 3, 4, 5],
  engine: 'vchart', // 👈 关键
});
```

### 3. Vue 3 集成

```vue
<template>
  <Chart type="bar" :data="salesData" title="月度销售" />
</template>

<script setup>
import { Chart } from '@ldesign/chart/vue';
import { EChartsEngine, engineManager } from '@ldesign/chart';

// 初始化引擎（通常在 main.ts 中做一次）
engineManager.register('echarts', new EChartsEngine());

const salesData = [100, 200, 150, 300, 250];
</script>
```

### 4. React 集成

```jsx
import { Chart } from '@ldesign/chart/react';
import { EChartsEngine, engineManager } from '@ldesign/chart';

// 初始化引擎
engineManager.register('echarts', new EChartsEngine());

function App() {
  return (
    <Chart 
      type="pie" 
      data={[30, 25, 25, 20]}
      title="市场份额"
    />
  );
}
```

---

## 🎨 常用图表类型

### 折线图
```javascript
const chart = new Chart(container, {
  type: 'line',
  data: {
    labels: ['1月', '2月', '3月', '4月'],
    datasets: [{
      name: '销售额',
      data: [100, 200, 150, 300]
    }]
  }
});
```

### 柱状图
```javascript
const chart = new Chart(container, {
  type: 'bar',
  data: {
    labels: ['产品A', '产品B', '产品C'],
    datasets: [{
      name: '销量',
      data: [120, 200, 150]
    }]
  }
});
```

### 饼图
```javascript
const chart = new Chart(container, {
  type: 'pie',
  data: {
    labels: ['苹果', '香蕉', '橙子', '葡萄'],
    datasets: [{
      data: [30, 25, 25, 20]
    }]
  }
});
```

### 3D 柱状图（VChart 专属）
```javascript
import { VChartEngine, engineManager } from '@ldesign/chart';

engineManager.register('vchart', new VChartEngine());

const chart3D = new Chart(container, {
  type: '3d-bar',
  data: myData,
  engine: 'vchart',
});
```

---

## 🔧 常用配置

### 主题和样式
```javascript
const chart = new Chart(container, {
  type: 'line',
  data: myData,
  // 暗黑模式
  darkMode: true,
  // 自定义颜色
  colors: ['#5470c6', '#91cc75', '#fac858'],
  // 字体大小
  fontSize: 14,
});
```

### 性能优化
```javascript
const chart = new Chart(container, {
  type: 'scatter',
  data: largeDataset, // 10万+ 数据点
  // 启用性能优化
  performance: {
    virtual: true,  // 虚拟渲染
    worker: true,   // Web Worker
    cache: true,    // 配置缓存
  },
});
```

### 响应式
```javascript
const chart = new Chart(container, {
  type: 'bar',
  data: myData,
  // 自动响应容器大小变化
  responsive: true,
});
```

---

## 🎯 引擎选择建议

| 场景 | 推荐引擎 | 原因 |
|------|---------|------|
| Web 应用 | ECharts | 成熟稳定，生态丰富 |
| 小程序 | VChart | 更好的小程序支持 |
| 3D 图表 | VChart | 独家支持 3D |
| 复杂交互 | ECharts | 丰富的事件系统 |
| 数据故事 | VChart | 内置故事模式 |

---

## 📚 下一步

### 深入学习
- 📖 [完整使用指南](./docs/dual-engine-guide.md)
- 📖 [API 参考文档](./docs/api-reference.md)
- 📖 [性能优化指南](./docs/performance-guide.md)

### 查看示例
- 🔍 [Vue 3 示例](./examples/vue-example/)
- 🔍 [React 示例](./examples/react-example/)
- 🔍 [双引擎演示](./examples/dual-engine-demo.html)

### 了解更多
- 🌐 [ECharts 官网](https://echarts.apache.org/)
- 🌐 [VChart 官网](https://www.visactor.io/vchart)

---

## 💡 常见问题

### Q: 必须安装两个引擎吗？
**A**: 不需要！只安装你要用的引擎即可。

### Q: 如何在项目中切换引擎？
**A**: 只需修改配置中的 `engine` 参数：
```javascript
// 使用 ECharts
{ engine: 'echarts' }

// 使用 VChart  
{ engine: 'vchart' }

// 自动选择（默认）
{ engine: 'auto' }
```

### Q: 现有 ECharts 代码需要改动吗？
**A**: 不需要！100% 向后兼容，现有代码继续工作。

### Q: 打包体积会变大吗？
**A**: 不会！按需加载，只打包使用的引擎。

---

## 🆘 获取帮助

- 💬 [GitHub Issues](https://github.com/ldesign/chart/issues)
- 📧 Email: support@ldesign.io
- 📖 [完整文档](./docs/)

---

**开始你的数据可视化之旅！** 🎉


