# @aspect/lchart-core

LChart 核心图表库 - 框架无关的高性能数据可视化引擎

## 特性

- 🎨 **多种图表类型** - 支持折线图、柱状图、饼图、散点图等
- 🚀 **高性能渲染** - 基于 Canvas 的高效渲染引擎
- 📦 **轻量无依赖** - 零外部依赖，体积小巧
- 🎯 **TypeScript** - 完整的类型定义
- 🎭 **主题系统** - 内置多种主题，支持自定义
- 📱 **响应式** - 自动适配容器大小

## 安装

```bash
pnpm add @aspect/lchart-core
```

## 快速开始

```typescript
import { createChart } from '@aspect/lchart-core'

// 创建图表
const chart = createChart('#chart', {
  type: 'line',
  data: {
    labels: ['一月', '二月', '三月', '四月', '五月'],
    datasets: [
      { name: '销售额', data: [120, 200, 150, 80, 70] },
      { name: '利润', data: [50, 80, 60, 30, 20] },
    ],
  },
  title: '月度数据',
})

// 更新数据
chart.setOption({
  data: {
    labels: ['一月', '二月', '三月'],
    datasets: [{ data: [100, 150, 200] }],
  },
})

// 销毁
chart.dispose()
```

## 配置项

### 基础配置

```typescript
interface ChartOptions {
  // 图表类型（简化配置）
  type?: 'line' | 'bar' | 'pie' | 'scatter'
  
  // 简化数据格式
  data?: {
    labels?: string[]
    datasets: Array<{
      name?: string
      data: number[]
    }>
  }
  
  // 标题
  title?: string | TitleOptions
  
  // 图例
  legend?: LegendOptions
  
  // 提示框
  tooltip?: TooltipOptions
  
  // 坐标轴
  xAxis?: AxisOptions
  yAxis?: AxisOptions
  
  // 系列（高级配置）
  series?: SeriesOptions[]
  
  // 主题
  theme?: 'default' | 'dark' | ThemeOptions
  
  // 响应式
  responsive?: boolean
  
  // 尺寸
  width?: number | string
  height?: number | string
}
```

### 系列配置

#### 折线图

```typescript
{
  type: 'line',
  name: '系列名称',
  data: [10, 20, 30, 40],
  smooth: true,           // 平滑曲线
  showSymbol: true,       // 显示数据点
  areaStyle: {            // 填充区域
    opacity: 0.3,
  },
}
```

#### 柱状图

```typescript
{
  type: 'bar',
  name: '系列名称',
  data: [10, 20, 30, 40],
  barWidth: '60%',        // 柱宽度
  borderRadius: 4,        // 圆角
}
```

#### 饼图

```typescript
{
  type: 'pie',
  name: '系列名称',
  data: [
    { x: '类别A', y: 30 },
    { x: '类别B', y: 40 },
    { x: '类别C', y: 30 },
  ],
  radius: ['40%', '70%'], // 内外半径（环形图）
  roseType: 'radius',     // 南丁格尔玫瑰图
}
```

## 事件

```typescript
// 点击事件
chart.on('click', (params) => {
  console.log('点击了:', params.name, params.value)
})

// 渲染完成
chart.on('rendered', (params) => {
  console.log('渲染耗时:', params.elapsedTime)
})
```

## 主题

```typescript
import { registerTheme, createChart } from '@aspect/lchart-core'

// 注册自定义主题
registerTheme('myTheme', {
  colors: ['#c23531', '#2f4554', '#61a0a8'],
  backgroundColor: '#fff',
})

// 使用主题
const chart = createChart('#chart', {
  theme: 'myTheme',
  // ...
})
```

## API

### Chart 实例方法

| 方法 | 描述 |
|------|------|
| `setOption(options, merge?)` | 更新配置 |
| `getOption()` | 获取当前配置 |
| `resize()` | 调整图表大小 |
| `render()` | 重新渲染 |
| `on(event, handler)` | 添加事件监听 |
| `off(event, handler?)` | 移除事件监听 |
| `dispose()` | 销毁图表 |

## License

MIT
