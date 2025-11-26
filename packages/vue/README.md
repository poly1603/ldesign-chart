# @aspect/lchart-vue

LChart Vue 3 适配器 - 在 Vue 项目中使用 LChart 图表库

## 安装

```bash
pnpm add @aspect/lchart-vue @aspect/lchart-core
```

## 快速开始

### 全局注册

```typescript
// main.ts
import { createApp } from 'vue'
import { LChartPlugin } from '@aspect/lchart-vue'
import App from './App.vue'

const app = createApp(App)
app.use(LChartPlugin)
app.mount('#app')
```

### 按需使用

```vue
<script setup lang="ts">
import { LChart, LineChart, BarChart, PieChart } from '@aspect/lchart-vue'

const chartData = {
  labels: ['一月', '二月', '三月', '四月', '五月'],
  datasets: [
    { name: '销售额', data: [120, 200, 150, 80, 70] },
  ],
}
</script>

<template>
  <!-- 通用图表组件 -->
  <LChart type="line" :data="chartData" title="销售趋势" />

  <!-- 专用图表组件 -->
  <LineChart :data="chartData" title="折线图" smooth />
  <BarChart :data="chartData" title="柱状图" :border-radius="4" />
  <PieChart :data="chartData" title="饼图" donut />
</template>
```

## 组件

### LChart

通用图表组件，支持所有图表类型。

```vue
<LChart
  type="line"
  :data="chartData"
  :options="chartOptions"
  title="图表标题"
  theme="dark"
  width="600"
  height="400"
  @click="handleClick"
  @rendered="handleRendered"
/>
```

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | `'line' \| 'bar' \| 'pie' \| 'scatter'` | - | 图表类型 |
| data | `ChartData` | - | 图表数据 |
| options | `ChartOptions` | - | 完整配置项 |
| title | `string` | - | 图表标题 |
| width | `number \| string` | `'100%'` | 宽度 |
| height | `number \| string` | `'400px'` | 高度 |
| theme | `string` | `'default'` | 主题名称 |
| responsive | `boolean` | `true` | 是否响应式 |
| autoresize | `boolean` | `true` | 是否自动调整大小 |

#### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| click | `MouseEventParams` | 点击图表时触发 |
| mouseover | `MouseEventParams` | 鼠标移入时触发 |
| mouseout | `MouseEventParams` | 鼠标移出时触发 |
| rendered | `{ elapsedTime: number }` | 渲染完成时触发 |
| init | `Chart` | 图表初始化完成时触发 |

#### Methods

```vue
<script setup>
import { ref } from 'vue'

const chartRef = ref()

// 更新配置
chartRef.value.setOption({ title: '新标题' })

// 调整大小
chartRef.value.resize()

// 获取实例
const instance = chartRef.value.getInstance()
</script>

<template>
  <LChart ref="chartRef" type="line" :data="data" />
</template>
```

### LineChart

折线图组件。

```vue
<LineChart
  :data="chartData"
  title="折线图"
  smooth
  area
  :show-symbol="true"
/>
```

#### 特有 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| smooth | `boolean` | `false` | 是否平滑曲线 |
| area | `boolean` | `false` | 是否显示区域填充 |
| showSymbol | `boolean` | `true` | 是否显示数据点 |

### BarChart

柱状图组件。

```vue
<BarChart
  :data="chartData"
  title="柱状图"
  bar-width="60%"
  :border-radius="4"
/>
```

#### 特有 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| barWidth | `number \| string` | `'60%'` | 柱宽度 |
| borderRadius | `number` | `0` | 圆角大小 |
| horizontal | `boolean` | `false` | 是否横向显示 |

### PieChart

饼图组件。

```vue
<PieChart
  :data="chartData"
  title="饼图"
  donut
  inner-radius="40%"
  outer-radius="75%"
/>
```

#### 特有 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| donut | `boolean` | `false` | 是否环形图 |
| innerRadius | `string` | `'40%'` | 内半径 |
| outerRadius | `string` | `'75%'` | 外半径 |
| roseType | `'radius' \| 'area' \| false` | `false` | 南丁格尔玫瑰图类型 |

## Composables

### useChart

图表 Composable，用于更灵活的控制。

```vue
<script setup lang="ts">
import { useChart } from '@aspect/lchart-vue'

const { containerRef, chartInstance, setOption, resize } = useChart({
  options: {
    type: 'line',
    data: {
      labels: ['一月', '二月', '三月'],
      datasets: [{ data: [10, 20, 30] }],
    },
  },
})

// 更新数据
const updateData = () => {
  setOption({
    data: {
      labels: ['一月', '二月', '三月'],
      datasets: [{ data: [20, 30, 40] }],
    },
  })
}
</script>

<template>
  <div ref="containerRef" style="width: 600px; height: 400px" />
  <button @click="updateData">更新数据</button>
</template>
```

### useResize

响应式监听元素大小变化。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useResize } from '@aspect/lchart-vue'

const elementRef = ref<HTMLElement | null>(null)
const { width, height } = useResize(elementRef)
</script>

<template>
  <div ref="elementRef">
    当前尺寸: {{ width }} x {{ height }}
  </div>
</template>
```

## TypeScript 支持

所有组件和函数都有完整的 TypeScript 类型定义。

```typescript
import type {
  ChartOptions,
  ChartEventMap,
  SeriesOptions,
  DataPoint,
} from '@aspect/lchart-vue'
```

## License

MIT
