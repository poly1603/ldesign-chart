# @ldesign/chart-solid

企业级图表 Solid.js 适配器

## 安装

```bash
pnpm add @ldesign/chart-solid echarts
```

## 使用

```tsx
import { Chart } from '@ldesign/chart-solid'

function App() {
  const chartData = {
    labels: ['一月', '二月', '三月'],
    datasets: [{ data: [10, 20, 30] }]
  }
  
  const handleInit = (chart) => {
    console.log('Chart initialized', chart)
  }

  const handleClick = (params) => {
    console.log('Chart clicked', params)
  }
  
  return (
    <Chart
      type="line"
      data={chartData}
      title="销售趋势"
      responsive
      onInit={handleInit}
      onClick={handleClick}
    />
  )
}
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
| `onInit` | `(chart: ChartCore) => void` | - | 初始化回调 |
| `onClick` | `(params: any) => void` | - | 点击回调 |

## 示例

### 响应式数据

```tsx
import { createSignal } from 'solid-js'
import { Chart } from '@ldesign/chart-solid'

function App() {
  const [chartData, setChartData] = createSignal({
    labels: ['A', 'B', 'C'],
    datasets: [{ data: [10, 20, 30] }]
  })

  const updateData = () => {
    setChartData({
      labels: ['X', 'Y', 'Z'],
      datasets: [{ data: [30, 20, 10] }]
    })
  }
  
  return (
    <>
      <Chart type="line" data={chartData()} />
      <button onClick={updateData}>更新数据</button>
    </>
  )
}
```

### 多系列图表

```tsx
function MultiSeriesChart() {
  const chartData = {
    labels: ['一月', '二月', '三月', '四月'],
    datasets: [
      { name: '产品A', data: [120, 200, 150, 80] },
      { name: '产品B', data: [100, 180, 170, 90] }
    ]
  }
  
  return (
    <Chart 
      type="line" 
      data={chartData}
      title="多产品销售对比"
    />
  )
}
```

### 自定义配置

```tsx
function CustomChart() {
  const chartData = {
    labels: ['A', 'B', 'C'],
    datasets: [{ data: [10, 20, 30] }]
  }

  const customConfig = {
    color: ['#5470c6', '#91cc75'],
    dataZoom: true,
    toolbox: true
  }
  
  return (
    <Chart 
      type="bar" 
      data={chartData}
      config={customConfig}
    />
  )
}
```

### 主题切换

```tsx
import { createSignal } from 'solid-js'

function ThemeToggle() {
  const [darkMode, setDarkMode] = createSignal(false)
  
  const chartData = {
    labels: ['A', 'B', 'C'],
    datasets: [{ data: [10, 20, 30] }]
  }
  
  return (
    <>
      <Chart 
        type="line" 
        data={chartData}
        darkMode={darkMode()}
      />
      <button onClick={() => setDarkMode(!darkMode())}>
        切换主题
      </button>
    </>
  )
}
```

## TypeScript 支持

完整的 TypeScript 类型定义：

```tsx
import type {
  ChartConfig,
  ChartData,
  ChartType,
  ChartInstance,
} from '@ldesign/chart-solid'
```

## 图表类型

支持 15+ 种图表类型：
- `line` - 折线图
- `bar` - 柱状图
- `pie` - 饼图
- `scatter` - 散点图
- `radar` - 雷达图
- `heatmap` - 热力图
- 等等...

## 性能优化

Solid.js 的细粒度响应式系统天然高性能，对于大数据集：

```tsx
const config = {
  virtual: true,  // 启用虚拟渲染
  worker: true,   // 使用 Web Worker
  cache: true     // 启用缓存
}

<Chart type="line" data={largeDataset} config={config} />
```

## License

MIT
