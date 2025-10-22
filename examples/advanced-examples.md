# @ldesign/chart 高级示例

本文档包含 @ldesign/chart v1.3.0 的高级使用示例。

## 📊 大数据可视化

### 示例 1: 10万数据点散点图

```vue
<template>
  <div>
    <p>数据量: {{ dataPoints.toLocaleString() }} 点</p>
    <Chart 
      ref="chartRef"
      type="scatter"
      :data="largeData"
      virtual
      cache
      :data-zoom="true"
      title="大数据散点图（虚拟渲染）"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Chart } from '@ldesign/chart/vue';

const chartRef = ref();
const dataPoints = 100000;

// 生成大数据集
const largeData = ref({
  labels: [],
  datasets: [{
    name: '数据点',
    data: []
  }]
});

onMounted(() => {
  console.time('生成数据');
  
  // 生成10万个随机数据点
  for (let i = 0; i < dataPoints; i++) {
    largeData.value.datasets[0].data.push([
      Math.random() * 100,
      Math.random() * 100
    ]);
  }
  
  console.timeEnd('生成数据');
});
</script>
```

### 示例 2: 流式数据加载

```typescript
import { DataParser } from '@ldesign/chart';

const parser = new DataParser();
const largeCSV = fetchLargeCSVFile();

// 流式解析，显示进度
await parser.parseStream(largeCSV, (chunk, progress) => {
  console.log(`解析进度: ${Math.round(progress * 100)}%`);
  progressBar.value = progress * 100;
  
  // 可以在解析过程中就开始渲染
  if (progress > 0.1) {
    chart.updateData(chunk);
  }
}, 5000); // 每次处理5000行
```

## 🔄 实时数据流

### 示例 3: WebSocket 实时股票图表

```vue
<template>
  <div>
    <h3>实时股票价格</h3>
    <Chart ref="chartRef" type="line" :data="stockData" />
    <button @click="connect">连接</button>
    <button @click="disconnect">断开</button>
    <span>状态: {{ status }}</span>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { Chart } from '@ldesign/chart/vue';
import { createChartStream, mergeStreamData } from '@ldesign/chart';

const chartRef = ref();
const status = ref('未连接');

// 初始数据
const stockData = ref({
  labels: [],
  datasets: [{
    name: '股票价格',
    data: [],
    smooth: true,
    areaStyle: {}
  }]
});

let stream;

const connect = () => {
  stream = createChartStream({
    source: 'websocket',
    url: 'ws://stock-api.example.com/stream',
    reconnect: {
      enabled: true,
      maxAttempts: 5,
      delay: 3000
    },
    transform: (rawData) => {
      // 转换服务器数据格式
      return {
        label: new Date().toLocaleTimeString(),
        values: [rawData.price]
      };
    }
  }, (newData) => {
    // 合并新数据（保留最近100个点）
    stockData.value = mergeStreamData(stockData.value, newData, 100);
  });

  // 监听事件
  stream.on((event) => {
    if (event.type === 'open') {
      status.value = '已连接';
    } else if (event.type === 'close') {
      status.value = '已断开';
    } else if (event.type === 'error') {
      status.value = '错误: ' + event.error?.message;
    }
  });

  stream.connect();
};

const disconnect = () => {
  stream?.disconnect();
  status.value = '已断开';
};

onUnmounted(() => {
  stream?.disconnect();
});
</script>
```

### 示例 4: SSE 服务器推送

```typescript
import { DataStreamManager } from '@ldesign/chart';

const stream = new DataStreamManager({
  source: 'sse',
  url: 'https://api.example.com/events',
  bufferSize: 500
});

stream.on((event) => {
  if (event.type === 'data') {
    chart.updateData(event.data);
  }
});

stream.connect();
```

### 示例 5: HTTP 轮询

```typescript
const stream = new DataStreamManager({
  source: 'polling',
  url: 'https://api.example.com/data',
  interval: 5000 // 每5秒请求一次
});

stream.connect();
```

## 🔗 复杂图表联动

### 示例 6: 多维度数据联动分析

```vue
<template>
  <div class="dashboard">
    <div class="row">
      <Chart 
        ref="chart1" 
        type="line" 
        :data="salesData"
        title="销售趋势" 
      />
      <Chart 
        ref="chart2" 
        type="bar" 
        :data="regionData"
        title="区域分布" 
      />
    </div>
    <div class="row">
      <Chart 
        ref="chart3" 
        type="pie" 
        :data="categoryData"
        title="品类占比" 
      />
      <Chart 
        ref="chart4" 
        type="scatter" 
        :data="correlationData"
        title="价格-销量关系" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Chart } from '@ldesign/chart/vue';
import { chartSyncManager } from '@ldesign/chart';

const chart1 = ref();
const chart2 = ref();
const chart3 = ref();
const chart4 = ref();

let syncGroup;

onMounted(() => {
  // 创建联动组
  const charts = [
    chart1.value.getInstance(),
    chart2.value.getInstance(),
    chart3.value.getInstance(),
    chart4.value.getInstance()
  ];

  syncGroup = chartSyncManager.createGroup(charts, {
    events: ['dataZoom', 'brush', 'legendselectchanged'],
    syncProps: ['dataZoom', 'brush', 'legend'],
    bidirectional: true
  });

  console.log('图表联动已启用');
});

onUnmounted(() => {
  if (syncGroup) {
    chartSyncManager.destroyGroup(syncGroup);
  }
});
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.row {
  display: flex;
  gap: 20px;
}
.row > * {
  flex: 1;
}
</style>
```

### 示例 7: 主从图表联动

```typescript
import { connectCharts } from '@ldesign/chart';

// 主图表控制从图表，但不反向
const disconnect = connectCharts(masterChart, slaveChart, {
  events: ['dataZoom'],
  syncProps: ['dataZoom'],
  bidirectional: false // 单向同步
});
```

## 📱 移动端交互

### 示例 8: 完整的移动端图表

```vue
<template>
  <div ref="containerRef" class="mobile-chart">
    <Chart ref="chartRef" type="line" :data="data" />
    <div class="controls">
      <button @click="resetZoom">重置缩放</button>
      <span>当前缩放: {{ currentZoom.toFixed(2) }}x</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Chart } from '@ldesign/chart/vue';
import { enableGestures } from '@ldesign/chart';

const containerRef = ref();
const chartRef = ref();
const currentZoom = ref(1);

let gestures;

onMounted(() => {
  gestures = enableGestures(
    chartRef.value.getInstance(),
    containerRef.value,
    {
      enableZoom: true,
      enableRotate: false,
      enableSwipe: true,
      enableLongPress: true,
      minZoom: 0.5,
      maxZoom: 5,
      zoomSensitivity: 1.2
    }
  );

  // 监听手势事件
  gestures.on((event) => {
    console.log('手势:', event.type);
    
    if (event.type === 'zoom') {
      currentZoom.value = event.scale || 1;
    } else if (event.type === 'swipe') {
      console.log('滑动方向:', event.direction);
    } else if (event.type === 'longpress') {
      console.log('长按位置:', event.position);
      // 显示详情弹窗
      showDetails(event.position);
    }
  });
});

const resetZoom = () => {
  gestures?.resetZoom();
  currentZoom.value = 1;
};

onUnmounted(() => {
  gestures?.destroy();
});
</script>

<style scoped>
.mobile-chart {
  touch-action: none; /* 禁用浏览器默认触摸行为 */
}
.controls {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
```

## 💾 数据导入导出

### 示例 9: CSV 批量导入

```vue
<template>
  <div>
    <input type="file" @change="handleFileUpload" accept=".csv" />
    <Chart v-if="data" type="line" :data="data" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Chart } from '@ldesign/chart/vue';
import { csvParser } from '@ldesign/chart';

const data = ref(null);

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    // 解析 CSV 文件
    const parsed = await csvParser.parseFile(file, {
      hasHeader: true,
      autoType: true,
      skipEmptyLines: true
    });

    // 验证数据
    const validation = csvParser.validate(parsed);
    if (!validation.valid) {
      console.error('数据验证失败:', validation.errors);
      return;
    }

    data.value = parsed;
    console.log('成功导入', parsed.datasets[0].data.length, '行数据');
  } catch (error) {
    console.error('导入失败:', error);
  }
};
</script>
```

### 示例 10: 多格式导出

```vue
<template>
  <div>
    <Chart ref="chartRef" type="bar" :data="data" />
    <div class="export-buttons">
      <button @click="exportPNG">导出PNG</button>
      <button @click="exportSVG">导出SVG</button>
      <button @click="exportCSV">导出CSV</button>
      <button @click="copyToClipboard">复制</button>
      <button @click="print">打印</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Chart } from '@ldesign/chart/vue';
import { chartExporter } from '@ldesign/chart';

const chartRef = ref();
const data = ref({
  labels: ['A', 'B', 'C', 'D'],
  datasets: [{ data: [10, 20, 30, 40] }]
});

const exportPNG = () => {
  chartExporter.downloadImage(
    chartRef.value.getInstance(),
    'chart',
    { 
      type: 'png',
      backgroundColor: '#ffffff',
      pixelRatio: 2 // 高清导出
    }
  );
};

const exportSVG = () => {
  const svg = chartExporter.exportSVG(chartRef.value.getInstance());
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'chart.svg';
  a.click();
};

const exportCSV = () => {
  chartExporter.exportData(data.value, {
    format: 'csv',
    filename: 'chart-data',
    download: true
  });
};

const copyToClipboard = async () => {
  try {
    await chartExporter.copyToClipboard(chartRef.value.getInstance());
    alert('已复制到剪贴板');
  } catch (error) {
    console.error('复制失败:', error);
  }
};

const print = () => {
  chartExporter.print(chartRef.value.getInstance());
};
</script>
```

## 🎨 高级定制

### 示例 11: 瀑布图（财务报表）

```vue
<template>
  <Chart 
    type="waterfall"
    :data="{
      labels: ['期初余额', '营业收入', '营业成本', '管理费用', '财务费用', '投资收益', '期末余额'],
      datasets: [{
        data: [50000, 80000, -45000, -8000, -2000, 5000, 0],
        positiveColor: '#52c41a',
        negativeColor: '#f5222d',
        totalColor: '#1890ff',
        autoTotal: true,
        showLabel: true,
        formatter: (value) => `¥${value.toLocaleString()}`
      }]
    }"
    title="月度利润表"
  />
</template>
```

### 示例 12: 增强仪表盘

```vue
<template>
  <div class="gauges">
    <!-- 标准仪表盘（分段颜色） -->
    <Chart 
      type="gauge"
      :data="{ datasets: [{ 
        data: [75],
        name: 'CPU使用率',
        segmentColors: [
          { threshold: 60, color: '#52c41a' },
          { threshold: 80, color: '#faad14' },
          { threshold: 100, color: '#f5222d' }
        ]
      }] }"
    />

    <!-- 进度环 -->
    <Chart 
      type="gauge"
      :data="{ datasets: [{ 
        data: [85],
        name: '项目完成度',
        mode: 'progress'
      }] }"
    />

    <!-- 多指针仪表盘 -->
    <Chart 
      type="gauge"
      :data="{
        labels: ['服务器1', '服务器2', '服务器3'],
        datasets: [{ 
          data: [60, 75, 90],
          mode: 'multi'
        }]
      }"
    />

    <!-- 时钟样式 -->
    <Chart 
      type="gauge"
      :data="{ datasets: [{ 
        data: [9.5],
        mode: 'clock',
        max: 12
      }] }"
    />
  </div>
</template>

<style scoped>
.gauges {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
</style>
```

## 🔍 数据验证

### 示例 13: Schema 验证

```typescript
import { schemaValidator } from '@ldesign/chart';

// 自定义 Schema
const customSchema = {
  type: 'object',
  properties: {
    labels: {
      type: 'array',
      items: { type: 'string' },
      minLength: 1,
      required: true
    },
    datasets: {
      type: 'array',
      required: true,
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          data: {
            type: 'array',
            required: true,
            items: { 
              type: 'number',
              minimum: 0,
              maximum: 100
            }
          }
        }
      }
    }
  }
};

// 验证数据
const result = schemaValidator.validate(data, customSchema);

if (!result.valid) {
  console.error('数据验证失败:');
  result.errors.forEach(err => {
    console.error(`- ${err.path}: ${err.message}`);
  });
} else {
  // 使用经过默认值处理的数据
  chart.updateData(result.data);
}
```

## 🎯 性能优化实战

### 示例 14: 综合性能优化

```vue
<template>
  <Chart 
    ref="chartRef"
    :type="chartType"
    :data="data"
    cache
    virtual
    lazy
    :responsive="{ 
      debounce: 200,
      enableVisibilityDetection: true 
    }"
    @mounted="onChartMounted"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Chart } from '@ldesign/chart/vue';
import { echartsLoader } from '@ldesign/chart';

const chartRef = ref();

// 预加载常用模块
onMounted(() => {
  echartsLoader.preload(); // 智能预测并预加载
});

const onChartMounted = () => {
  console.log('图表挂载完成');
  
  // 获取性能指标
  const perf = performance.getEntriesByType('measure');
  console.log('性能指标:', perf);
};
</script>
```

---

## 📝 更多示例

更多示例请参考：
- [Vue 示例](./vue-example/)
- [React 示例](./react-example/)
- [文档](../docs/)

**开始探索更多可能！** 🚀

