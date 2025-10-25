# @ldesign/chart-vue

企业级图表 Vue 3 适配器

## 安装

```bash
pnpm add @ldesign/chart-vue echarts
```

## 使用

### 基础用法

```vue
<template>
  <Chart
    type="line"
    :data="chartData"
    title="销售趋势"
    :width="600"
    :height="400"
  />
</template>

<script setup>
import { Chart } from '@ldesign/chart-vue'
import { ref } from 'vue'

const chartData = ref({
  labels: ['一月', '二月', '三月', '四月', '五月'],
  datasets: [{
    name: '销售额',
    data: [120, 200, 150, 80, 70]
  }]
})
</script>
```

### 使用 Composable

```vue
<script setup>
import { useChart } from '@ldesign/chart-vue'
import { ref } from 'vue'

const chartRef = ref()
const { chart, refresh, resize } = useChart(chartRef, {
  type: 'bar',
  data: {
    labels: ['产品A', '产品B', '产品C'],
    datasets: [{ data: [30, 50, 20] }]
  }
})

// 刷新图表
function handleRefresh() {
  refresh()
}
</script>

<template>
  <div ref="chartRef"></div>
  <button @click="handleRefresh">刷新</button>
</template>
```

### 作为插件安装

```typescript
import { createApp } from 'vue'
import { ChartPlugin } from '@ldesign/chart-vue'
import App from './App.vue'

const app = createApp(App)

app.use(ChartPlugin, {
  defaultConfig: {
    theme: 'dark'
  },
  componentName: 'LChart'  // 可选，默认为 'Chart'
})

app.mount('#app')
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

### Chart 组件 Events

| 事件 | 参数 | 说明 |
|------|------|------|
| ready | (chart) | 图表初始化完成 |
| error | (error) | 图表错误 |
| data-update | (data) | 数据更新 |

## License

MIT



