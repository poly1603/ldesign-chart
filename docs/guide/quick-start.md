# 快速开始

本指南将帮助你在几分钟内创建第一个图表。

## 选择框架

@ldesign/chart 支持多种前端框架，请根据你的项目选择对应的包：

| 框架 | 包名 | 文档 |
|------|------|------|
| Vue 3 | `@ldesign/chart-vue` | [查看](/guide/frameworks/vue) |
| React | `@ldesign/chart-react` | [查看](/guide/frameworks/react) |
| Angular | `@ldesign/chart-angular` | [查看](/guide/frameworks/angular) |
| Svelte | `@ldesign/chart-svelte` | [查看](/guide/frameworks/svelte) |
| Solid.js | `@ldesign/chart-solid` | [查看](/guide/frameworks/solid) |
| Qwik | `@ldesign/chart-qwik` | [查看](/guide/frameworks/qwik) |
| Lit | `@ldesign/chart-lit` | [查看](/guide/frameworks/lit) |
| 原生 JS/TS | `@ldesign/chart-core` | [查看](/guide/frameworks/vanilla) |

## 基础示例

### 1. 安装依赖

::: code-group

```sh [Vue]
pnpm add @ldesign/chart-vue echarts
```

```sh [React]
pnpm add @ldesign/chart-react echarts
```

```sh [Angular]
pnpm add @ldesign/chart-angular echarts
```

:::

### 2. 创建图表

::: code-group

```vue [Vue]
<template>
  <div style="width: 600px; height: 400px;">
    <Chart 
      type="line" 
      :data="chartData" 
      title="月度销售额"
      :responsive="true"
    />
  </div>
</template>

<script setup>
import { Chart } from '@ldesign/chart-vue'

const chartData = {
  labels: ['一月', '二月', '三月', '四月', '五月', '六月'],
  datasets: [
    {
      name: '销售额',
      data: [120, 200, 150, 80, 70, 110]
    }
  ]
}
</script>
```

```tsx [React]
import { Chart } from '@ldesign/chart-react'

function App() {
  const chartData = {
    labels: ['一月', '二月', '三月', '四月', '五月', '六月'],
    datasets: [
      {
        name: '销售额',
        data: [120, 200, 150, 80, 70, 110]
      }
    ]
  }
  
  return (
    <div style={{ width: '600px', height: '400px' }}>
      <Chart 
        type="line" 
        data={chartData} 
        title="月度销售额"
        responsive
      />
    </div>
  )
}
```

:::

### 3. 运行项目

启动你的开发服务器，你应该能看到一个漂亮的折线图了！

## 更多图表类型

@ldesign/chart 支持 15+ 种图表类型：

```vue
<!-- 柱状图 -->
<Chart type="bar" :data="data" />

<!-- 饼图 -->
<Chart type="pie" :data="data" />

<!-- 散点图 -->
<Chart type="scatter" :data="data" />

<!-- 雷达图 -->
<Chart type="radar" :data="data" />

<!-- 更多... -->
```

查看 [图表类型](/guide/concepts/chart-types) 了解所有支持的图表。

## 下一步

- [了解数据格式](/guide/concepts/data-formats)
- [配置图表](/guide/concepts/configuration)
- [定制主题](/guide/concepts/theming)
- [查看更多示例](/examples/basic)
