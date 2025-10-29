# @ldesign/chart-qwik

企业级图表 Qwik 适配器

## 安装

```bash
pnpm add @ldesign/chart-qwik echarts
```

## 使用

```tsx
import { component$ } from '@builder.io/qwik'
import { Chart } from '@ldesign/chart-qwik'

export default component$(() => {
  const chartData = {
    labels: ['一月', '二月', '三月'],
    datasets: [{ data: [10, 20, 30] }]
  }

  const handleInit$ = $((chart) => {
    console.log('Chart initialized', chart)
  })

  const handleClick$ = $((params) => {
    console.log('Chart clicked', params)
  })
  
  return (
    <Chart
      type="line"
      data={chartData}
      title="销售趋势"
      responsive
      onInit$={handleInit$}
      onClick$={handleClick$}
    />
  )
})
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
| `onInit$` | `PropFunction` | - | 初始化回调 |
| `onClick$` | `PropFunction` | - | 点击回调 |

## 示例

### 响应式数据

```tsx
import { component$, useSignal } from '@builder.io/qwik'
import { Chart } from '@ldesign/chart-qwik'

export default component$(() => {
  const chartData = useSignal({
    labels: ['A', 'B', 'C'],
    datasets: [{ data: [10, 20, 30] }]
  })

  const updateData$ = $(() => {
    chartData.value = {
      labels: ['X', 'Y', 'Z'],
      datasets: [{ data: [30, 20, 10] }]
    }
  })
  
  return (
    <>
      <Chart type="line" data={chartData.value} />
      <button onClick$={updateData$}>更新数据</button>
    </>
  )
})
```

### 多系列图表

```tsx
export default component$(() => {
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
})
```

### 自定义配置

```tsx
export default component$(() => {
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
})
```

### 主题切换

```tsx
import { component$, useSignal } from '@builder.io/qwik'

export default component$(() => {
  const darkMode = useSignal(false)
  
  const chartData = {
    labels: ['A', 'B', 'C'],
    datasets: [{ data: [10, 20, 30] }]
  }
  
  const toggleTheme$ = $(() => {
    darkMode.value = !darkMode.value
  })
  
  return (
    <>
      <Chart 
        type="line" 
        data={chartData}
        darkMode={darkMode.value}
      />
      <button onClick$={toggleTheme$}>切换主题</button>
    </>
  )
})
```

## SSR 支持

Qwik 的可恢复性(Resumability)确保图表在服务端渲染后能够完美恢复：

```tsx
export default component$(() => {
  // 图表会在客户端可见时才加载和初始化
  return <Chart type="line" data={chartData} />
})
```

## TypeScript 支持

```tsx
import type {
  ChartConfig,
  ChartData,
  ChartType,
} from '@ldesign/chart-qwik'
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

Qwik 的延迟加载和可恢复性提供了极致性能。对于大数据集：

```tsx
const config = {
  virtual: true,  // 虚拟渲染
  worker: true,   // Web Worker
  cache: true     // 启用缓存
}

<Chart type="line" data={largeDataset} config={config} />
```

## License

MIT
