# @ldesign/chart-react

企业级图表 React 适配器

## 安装

```bash
pnpm add @ldesign/chart-react echarts
```

## 使用

### 基础用法

```tsx
import { Chart } from '@ldesign/chart-react'

function App() {
  const chartData = {
    labels: ['一月', '二月', '三月', '四月', '五月'],
    datasets: [{
      name: '销售额',
      data: [120, 200, 150, 80, 70]
    }]
  }
  
  return (
    <Chart
      type="line"
      data={chartData}
      title="销售趋势"
      width={600}
      height={400}
    />
  )
}
```

### 使用 Ref

```tsx
import { Chart, ChartRef } from '@ldesign/chart-react'
import { useRef } from 'react'

function App() {
  const chartRef = useRef<ChartRef>(null)
  
  const handleRefresh = () => {
    chartRef.current?.refresh()
  }
  
  const handleExport = () => {
    const dataURL = chartRef.current?.getDataURL()
    console.log(dataURL)
  }
  
  return (
    <>
      <Chart
        ref={chartRef}
        type="bar"
        data={{
          labels: ['产品A', '产品B', '产品C'],
          datasets: [{ data: [30, 50, 20] }]
        }}
      />
      <button onClick={handleRefresh}>刷新</button>
      <button onClick={handleExport}>导出</button>
    </>
  )
}
```

### 使用 Hook

```tsx
import { useChart } from '@ldesign/chart-react'
import { useRef } from 'react'

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { chart, loading, error } = useChart(containerRef, {
    type: 'pie',
    data: {
      labels: ['分类A', '分类B', '分类C'],
      datasets: [{ data: [30, 40, 30] }]
    }
  })
  
  if (loading) return <div>加载中...</div>
  if (error) return <div>错误: {error.message}</div>
  
  return <div ref={containerRef} />
}
```

## API

### Chart 组件 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | string | - | 图表类型（line/bar/pie等） |
| data | ChartData | - | 图表数据 |
| title | string | - | 图表标题 |
| theme | string | 'default' | 主题名称 |
| width | number/string | '100%' | 宽度 |
| height | number/string | 400 | 高度 |
| lazy | boolean | false | 懒加载 |
| cache | boolean | true | 启用缓存 |
| onReady | (chart) => void | - | 图表初始化完成回调 |
| onError | (error) => void | - | 错误回调 |

### ChartRef 方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| refresh | () | void | 刷新图表 |
| resize | () | void | 调整大小 |
| getDataURL | () | string | 获取图表图片 |
| getInstance | () | any | 获取图表实例 |

## License

MIT



