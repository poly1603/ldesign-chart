# @ldesign/chart-vue

Vue 3 适配器，用于 @ldesign/chart 图表库。

## 安装

```bash
npm install @ldesign/chart-vue
# 或
pnpm add @ldesign/chart-vue
# 或
yarn add @ldesign/chart-vue
```

## 快速开始

### 使用组件

```vue
<template>
  <LChart 
    :option="chartOption" 
    theme="default"
    width="600px"
    height="400px"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LChart } from '@ldesign/chart-vue'

const chartOption = ref({
  series: [
    {
      type: 'line',
      data: [10, 20, 30, 40, 50]
    }
  ]
})
</script>
```

### 使用 Composable

```vue
<template>
  <div ref="containerRef" style="width: 600px; height: 400px"></div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useChart } from '@ldesign/chart-vue'

const chartOption = ref({
  series: [
    {
      type: 'line',
      data: [10, 20, 30, 40, 50]
    }
  ]
})

const { containerRef, chartInstance } = useChart({
  option: chartOption,
  autoResize: true
})
</script>
```

## API

### LChart 组件

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| option | `ChartOption` | - | 图表配置对象（必需） |
| theme | `string` | `'default'` | 主题名称 |
| width | `number \| string` | `'100%'` | 图表宽度 |
| height | `number \| string` | `'400px'` | 图表高度 |
| autoResize | `boolean` | `true` | 自动调整大小 |

#### 暴露的方法

```typescript
interface LChartExpose {
  chartInstance: Ref<Chart | null>
  resize: () => void
  dispose: () => void
}
```

### useChart Composable

#### 参数

```typescript
interface UseChartOptions {
  option: Ref<ChartOption>      // 图表配置（响应式）
  theme?: Ref<string>           // 主题（响应式）
  autoResize?: boolean          // 是否自动调整大小
}
```

#### 返回值

```typescript
interface UseChartReturn {
  containerRef: Ref<HTMLDivElement | null>  // 容器引用
  chartInstance: Ref<Chart | null>          // 图表实例
  resize: () => void                        // 手动调整大小
  dispose: () => void                       // 销毁图表
}
```

## 示例

### 响应式数据更新

```vue
<template>
  <div>
    <LChart :option="chartOption" />
    <button @click="updateData">更新数据</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LChart } from '@ldesign/chart-vue'

const chartOption = ref({
  series: [{
    type: 'line',
    data: [10, 20, 30, 40, 50]
  }]
})

const updateData = () => {
  chartOption.value = {
    series: [{
      type: 'line',
      data: [50, 40, 30, 20, 10]
    }]
  }
}
</script>
```

### 主题切换

```vue
<template>
  <div>
    <LChart :option="chartOption" :theme="currentTheme" />
    <button @click="toggleTheme">切换主题</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LChart } from '@ldesign/chart-vue'

const chartOption = ref({
  series: [{
    type: 'line',
    data: [10, 20, 30, 40, 50]
  }]
})

const currentTheme = ref('default')

const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'default' ? 'dark' : 'default'
}
</script>
```

### 获取图表实例

```vue
<template>
  <LChart ref="chartRef" :option="chartOption" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { LChart } from '@ldesign/chart-vue'

const chartRef = ref()
const chartOption = ref({
  series: [{
    type: 'line',
    data: [10, 20, 30, 40, 50]
  }]
})

onMounted(() => {
  // 访问图表实例
  console.log(chartRef.value.chartInstance)
  
  // 手动调整大小
  chartRef.value.resize()
})
</script>
```

## TypeScript 支持

本包完全使用 TypeScript 编写，提供完整的类型定义。

```typescript
import type { 
  ChartOption,
  LChartProps,
  UseChartOptions,
  UseChartReturn 
} from '@ldesign/chart-vue'
```

## License

MIT