# @ldesign/chart-svelte

企业级图表 Svelte 适配器

## 安装

```bash
pnpm add @ldesign/chart-svelte echarts
```

## 使用

```svelte
<script>
  import { Chart } from '@ldesign/chart-svelte'

  const chartData = {
    labels: ['一月', '二月', '三月'],
    datasets: [{ data: [10, 20, 30] }]
  }

  function handleChartInit(event) {
    console.log('Chart initialized', event.detail)
  }

  function handleChartClick(event) {
    console.log('Chart clicked', event.detail)
  }
</script>

<Chart
  type="line"
  data={chartData}
  title="销售趋势"
  responsive={true}
  on:init={handleChartInit}
  on:click={handleChartClick}
/>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `ChartType` | - | 图表类型 (必填) |
| `data` | `ChartData` | - | 图表数据 (必填) |
| `title` | `string` | - | 图表标题 |
| `theme` | `string` | - | 主题 |
| `darkMode` | `boolean` | `false` | 暗黑模式 |
| `responsive` | `boolean` | `true` | 响应式 |
| `config` | `Partial<ChartConfig>` | - | 额外配置 |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `init` | `ChartCore` | 图表初始化完成 |
| `click` | `any` | 图表点击事件 |

### Methods

组件导出以下方法：

```svelte
<script>
  let chartComponent

  function resizeChart() {
    chartComponent.resize()
  }

  function getChartInstance() {
    return chartComponent.getChart()
  }
</script>

<Chart bind:this={chartComponent} type="line" data={chartData} />
```

## 示例

### 响应式数据

```svelte
<script>
  import { Chart } from '@ldesign/chart-svelte'
  
  let chartData = {
    labels: ['A', 'B', 'C'],
    datasets: [{ data: [10, 20, 30] }]
  }

  // 数据变化会自动更新图表
  function updateData() {
    chartData = {
      labels: ['X', 'Y', 'Z'],
      datasets: [{ data: [30, 20, 10] }]
    }
  }
</script>

<Chart type="line" data={chartData} />
<button on:click={updateData}>更新数据</button>
```

### 多系列图表

```svelte
<script>
  const chartData = {
    labels: ['一月', '二月', '三月', '四月'],
    datasets: [
      { name: '产品A', data: [120, 200, 150, 80] },
      { name: '产品B', data: [100, 180, 170, 90] },
    ]
  }
</script>

<Chart 
  type="line" 
  data={chartData}
  title="多产品销售对比"
/>
```

### 自定义配置

```svelte
<script>
  const chartData = {
    labels: ['A', 'B', 'C'],
    datasets: [{ data: [10, 20, 30] }]
  }

  const customConfig = {
    color: ['#5470c6', '#91cc75'],
    dataZoom: true,
    toolbox: true,
  }
</script>

<Chart 
  type="bar" 
  data={chartData}
  config={customConfig}
/>
```

### 主题切换

```svelte
<script>
  let darkMode = false
  
  const chartData = {
    labels: ['A', 'B', 'C'],
    datasets: [{ data: [10, 20, 30] }]
  }
</script>

<Chart 
  type="line" 
  data={chartData}
  darkMode={darkMode}
/>
<button on:click={() => darkMode = !darkMode}>
  切换主题
</button>
```

## TypeScript 支持

```typescript
import type {
  ChartConfig,
  ChartData,
  ChartType,
} from '@ldesign/chart-svelte'
```

## 图表类型

支持 15+ 种图表类型：
- `line` - 折线图
- `bar` - 柱状图
- `pie` - 饼图
- `scatter` - 散点图
- `radar` - 雷达图
- 等等...

## 性能优化

对于大数据集：

```svelte
<script>
  const config = {
    virtual: true,  // 虚拟渲染
    worker: true,   // Web Worker
    cache: true,    // 启用缓存
  }
</script>

<Chart type="line" data={largeDataset} config={config} />
```

## License

MIT
