# @ldesign/chart-core 图表示例

本示例展示了 @ldesign/chart-core 图表库的丰富图表类型，参考了 [VChart](https://www.visactor.io/vchart/example) 和 [ECharts](https://echarts.apache.org/examples/zh/index.html) 的示例设计。

## 运行示例

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 图表类型

### 📈 折线图 (Line Chart)

| 示例 | 说明 |
|------|------|
| 基础折线图 | 最基础的折线图，展示数据随时间的变化趋势 |
| 平滑折线图 | 使用贝塞尔曲线平滑连接数据点 |
| 面积图 | 在折线图基础上填充面积，强调数据体积感 |
| 堆叠面积图 | 多系列堆叠显示，展示各部分对总体的贡献 |
| 阶梯折线图 | 阶梯式连接数据点，适合展示离散变化的数据 |
| 多系列折线图 | 展示多个数据系列的对比趋势 |
| 带标记线的折线图 | 添加平均值、最大值、最小值等标记线 |
| 虚线和点线 | 使用不同的线型样式区分数据系列 |

### 📊 柱状图 (Bar Chart)

| 示例 | 说明 |
|------|------|
| 基础柱状图 | 最基础的柱状图，展示各类别数据的数值对比 |
| 分组柱状图 | 多系列并排显示，便于同一类别下不同系列的对比 |
| 堆叠柱状图 | 多系列堆叠显示，展示各部分对总体的贡献 |
| 负值柱状图 | 支持正负值的柱状图，展示盈亏等场景 |
| 圆角柱状图 | 带圆角的柱状图，视觉效果更柔和 |
| 渐变色柱状图 | 使用渐变色填充的柱状图 |

### 🥧 饼状图 (Pie Chart)

| 示例 | 说明 |
|------|------|
| 基础饼图 | 最基础的饼图，展示各部分占总体的比例 |
| 环形图 | 中间镂空的饼图，可以在中心显示汇总信息 |
| 南丁格尔玫瑰图 | 扇形半径表示数值大小的饼图 |
| 带标签的饼图 | 在扇形外部或内部显示数据标签 |
| 半圆饼图 | 只显示半圆的饼图，节省垂直空间 |
| 嵌套环形图 | 多层环形图，展示层级关系数据 |

## 功能特点

- **主题切换**: 支持浅色/深色主题切换
- **动画效果**: 入场动画和数据更新动画
- **交互功能**: 鼠标悬停、图例点击、数据更新
- **响应式设计**: 适配不同屏幕尺寸

## 使用方法

### 创建折线图

```typescript
import { LineChart } from '@ldesign/chart-core'

const chart = new LineChart('#container', {
  xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  series: [
    { name: 'Sales', data: [150, 230, 224, 218, 135] },
    { name: 'Profit', data: [80, 120, 160, 140, 180], smooth: true },
  ],
})
```

### 创建柱状图

```typescript
import { BarChart } from '@ldesign/chart-core'

const chart = new BarChart('#container', {
  xAxis: { data: ['A', 'B', 'C', 'D', 'E'] },
  series: [
    { name: 'Sales', data: [120, 200, 150, 80, 70] },
  ],
})
```

### 创建饼状图

```typescript
import { PieChart } from '@ldesign/chart-core'

const chart = new PieChart('#container', {
  data: [
    { name: 'Category A', value: 335 },
    { name: 'Category B', value: 310 },
    { name: 'Category C', value: 234 },
  ],
  radius: [0.4, 0.7], // 环形图
})
```

## API 参考

### LineSeriesData

```typescript
interface LineSeriesData {
  name?: string
  data: (number | null)[]
  color?: string
  smooth?: boolean
  step?: false | 'start' | 'middle' | 'end'
  areaStyle?: boolean | { opacity?: number; color?: string }
  lineStyle?: { width?: number; type?: 'solid' | 'dashed' | 'dotted' }
  symbol?: 'circle' | 'rect' | 'triangle' | 'diamond' | 'none'
  symbolSize?: number
  showSymbol?: boolean
  stack?: string
}
```

### BarSeriesData

```typescript
interface BarSeriesData {
  name?: string
  data: (number | null)[]
  color?: string
  stack?: string
  barWidth?: number
  borderRadius?: number
}
```

### PieDataItem

```typescript
interface PieDataItem {
  name: string
  value: number
  color?: string
  selected?: boolean
}
```
