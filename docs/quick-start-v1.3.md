# 快速开始 - v1.3.0

本指南将帮助你快速上手 @ldesign/chart v1.3.0 的新功能。

## 安装

```bash
npm install @ldesign/chart@1.3.0 echarts
```

## 基础使用

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

---

## 🆕 v1.3.0 新功能

### 1. 瀑布图

展示财务数据的最佳选择。

```vue
<template>
  <Chart 
    type="waterfall"
    :data="{
      labels: ['期初', '收入', '支出', '投资', '期末'],
      datasets: [{
        data: [10000, 5000, -3000, 2000, 0],
        positiveColor: '#91cc75',
        negativeColor: '#ee6666',
        autoTotal: true
      }]
    }"
    title="月度资金流水"
  />
</template>
```

**功能特点**:
- 自动计算累计值
- 正负值不同颜色
- 自动添加总计列
- 丰富的提示信息

### 2. 增强漏斗图

#### 金字塔模式

```vue
<Chart 
  type="funnel"
  :data="data"
  :datasets="[{ 
    mode: 'pyramid',
    showConversionRate: true 
  }]"
/>
```

#### 对比模式

```vue
<Chart 
  type="funnel"
  :data="{
    labels: ['访问', '注册', '购买'],
    datasets: [
      { data: [1000, 500, 200] },
      { data: [1200, 600, 300] }
    ]
  }"
  :datasets="[{ 
    mode: 'compare',
    leftName: '上月',
    rightName: '本月'
  }]"
/>
```

### 3. CSV 数据导入

```typescript
import { csvParser } from '@ldesign/chart';

// 从字符串解析
const data = csvParser.parse(`
Label,Series1,Series2
A,10,20
B,15,25
C,20,30
`);

// 从文件读取
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const data = await csvParser.parseFile(file);
  chart.updateData(data);
});

// 导出为 CSV
const csvString = csvParser.export(chartData);
```

### 4. 实时数据流

#### WebSocket 数据源

```typescript
import { createChartStream, mergeStreamData } from '@ldesign/chart';

let chartData = {
  labels: [],
  datasets: [{ name: '实时数据', data: [] }]
};

const stream = createChartStream({
  source: 'websocket',
  url: 'ws://your-server.com/data',
  reconnect: { enabled: true, maxAttempts: 5 }
}, (newData) => {
  // 合并新数据
  chartData = mergeStreamData(chartData, newData, 100);
  chart.updateData(chartData);
});

stream.connect();
```

#### 轮询模式

```typescript
const stream = createChartStream({
  source: 'polling',
  url: 'https://api.example.com/data',
  interval: 5000 // 每 5 秒轮询一次
}, (data) => {
  chart.updateData(data);
});

stream.connect();
```

### 5. 图表联动

#### 连接两个图表

```vue
<template>
  <div>
    <Chart ref="chart1" type="line" :data="data1" />
    <Chart ref="chart2" type="bar" :data="data2" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Chart } from '@ldesign/chart/vue';
import { connectCharts } from '@ldesign/chart';

const chart1 = ref();
const chart2 = ref();
let disconnect;

onMounted(() => {
  // 连接两个图表
  disconnect = connectCharts(
    chart1.value.getInstance(),
    chart2.value.getInstance(),
    {
      events: ['dataZoom', 'brush'],
      syncProps: ['dataZoom']
    }
  );
});

onUnmounted(() => {
  disconnect?.();
});
</script>
```

#### 批量联动

```typescript
import { chartSyncManager } from '@ldesign/chart';

// 创建联动组
const group = chartSyncManager.createGroup([chart1, chart2, chart3], {
  events: ['dataZoom', 'legendselectchanged'],
  syncProps: ['dataZoom', 'legend']
});

// 取消联动
chartSyncManager.destroyGroup(group);
```

### 6. 移动端手势

```vue
<template>
  <div ref="container">
    <Chart ref="chart" type="line" :data="data" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Chart } from '@ldesign/chart/vue';
import { enableGestures } from '@ldesign/chart';

const container = ref();
const chart = ref();
let gestures;

onMounted(() => {
  gestures = enableGestures(
    chart.value.getInstance(),
    container.value,
    {
      enableZoom: true,
      enableSwipe: true,
      minZoom: 0.5,
      maxZoom: 3
    }
  );

  gestures.on((event) => {
    console.log('手势:', event.type, event);
  });
});

onUnmounted(() => {
  gestures?.destroy();
});
</script>
```

### 7. 数据导出

```typescript
import { chartExporter } from '@ldesign/chart';

// 导出为 PNG
chartExporter.downloadImage(chart, 'my-chart', { 
  type: 'png',
  backgroundColor: '#ffffff'
});

// 导出为 SVG
const svg = chartExporter.exportSVG(chart);

// 导出数据为 CSV
chartExporter.exportData(data, { 
  format: 'csv',
  filename: 'chart-data',
  download: true
});

// 复制到剪贴板
await chartExporter.copyToClipboard(chart);

// 打印
chartExporter.print(chart);
```

### 8. 数据验证

```typescript
import { schemaValidator, chartDataSchema } from '@ldesign/chart';

// 验证数据格式
const result = schemaValidator.validate(data, chartDataSchema);

if (result.valid) {
  chart.updateData(result.data); // 应用默认值后的数据
} else {
  console.error('数据格式错误:', result.errors);
}

// 自定义 Schema
const customSchema = {
  type: 'object',
  properties: {
    datasets: {
      type: 'array',
      required: true,
      items: {
        type: 'object',
        properties: {
          data: { 
            type: 'array',
            required: true,
            items: { type: 'number', minimum: 0 }
          }
        }
      }
    }
  }
};
```

---

## 性能最佳实践

### 1. 启用缓存

```vue
<Chart type="line" :data="data" cache />
```

对于静态或变化不频繁的数据，启用缓存可显著提升性能。

### 2. 使用虚拟渲染

```vue
<Chart type="scatter" :data="largeData" virtual />
```

处理大数据集（> 10k 点）时启用虚拟渲染。

### 3. 智能预加载

```typescript
import { echartsLoader } from '@ldesign/chart';

// 应用启动时预加载常用图表
echartsLoader.preload(); // 自动预测并预加载
```

### 4. 流式解析大数据

```typescript
import { DataParser } from '@ldesign/chart';

const parser = new DataParser();
await parser.parseStream(largeData, (chunk, progress) => {
  console.log(`解析进度: ${Math.round(progress * 100)}%`);
});
```

---

## 常见问题

### Q: 如何升级到 v1.3.0？

A: 直接升级即可，完全向后兼容：
```bash
npm install @ldesign/chart@1.3.0
```

### Q: 新功能是否都需要额外配置？

A: 不需要，所有新功能都是可选的，按需使用即可。

### Q: 性能提升会自动生效吗？

A: 是的，性能优化会自动应用，无需任何配置。

### Q: 如何选择合适的图表类型？

A: 
- **瀑布图**: 财务数据、累计变化
- **漏斗图（金字塔）**: 层级数据、转化流程
- **漏斗图（对比）**: AB 测试、期间对比

---

## 下一步

- 查看[完整 API 文档](./api.md)
- 浏览[高级示例](../examples/)
- 阅读[性能优化指南](./performance-guide.md)
- 了解[最佳实践](./best-practices.md)

---

**开始创建你的第一个图表吧！🚀**

