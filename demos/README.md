# @ldesign/chart 演示项目

本目录包含各框架的演示项目，展示如何使用 @ldesign/chart。

## 目录结构

```
demos/
├── vue-demo/           Vue 3 演示项目
├── react-demo/         React 演示项目
├── angular-demo/       Angular 演示项目
├── svelte-demo/        Svelte 演示项目
├── solid-demo/         Solid.js 演示项目
├── qwik-demo/          Qwik 演示项目
├── lit-demo/           Lit 演示项目
└── vanilla-demo/       纯 JS/TS 演示项目
```

## 快速启动

### 创建新演示项目

使用 @ldesign/launcher 创建:

```bash
# Vue 3
cd demos && pnpm create @ldesign/launcher vue-demo --template vue

# React
cd demos && pnpm create @ldesign/launcher react-demo --template react

# Angular
cd demos && pnpm create @ldesign/launcher angular-demo --template angular

# Svelte
cd demos && pnpm create @ldesign/launcher svelte-demo --template svelte

# Solid.js
cd demos && pnpm create @ldesign/launcher solid-demo --template solid

# Qwik
cd demos && pnpm create @ldesign/launcher qwik-demo --template qwik
```

### 运行演示项目

```bash
# 进入对应的演示目录
cd demos/vue-demo

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 演示内容

每个演示项目都包含:

1. **基础图表** - 折线图、柱状图、饼图
2. **响应式数据** - 数据更新和响应
3. **主题切换** - 亮色/暗色模式
4. **交互功能** - 点击、缩放、导出
5. **性能测试** - 大数据集渲染
6. **自定义配置** - 高级配置示例

## 示例代码片段

### Vue 3 示例

```vue
<template>
  <div class="demo">
    <h2>基础折线图</h2>
    <Chart 
      type="line" 
      :data="chartData" 
      title="月度销售额"
      :responsive="true"
    />
    
    <button @click="updateData">更新数据</button>
    <button @click="toggleTheme">切换主题</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Chart } from '@ldesign/chart-vue'

const chartData = ref({
  labels: ['一月', '二月', '三月', '四月', '五月', '六月'],
  datasets: [
    {
      name: '销售额',
      data: [120, 200, 150, 80, 70, 110]
    }
  ]
})

const darkMode = ref(false)

function updateData() {
  chartData.value = {
    ...chartData.value,
    datasets: [{
      name: '销售额',
      data: chartData.value.datasets[0].data.map(() => 
        Math.floor(Math.random() * 200)
      )
    }]
  }
}

function toggleTheme() {
  darkMode.value = !darkMode.value
}
</script>
```

### React 示例

```tsx
import { useState } from 'react'
import { Chart } from '@ldesign/chart-react'

function App() {
  const [chartData, setChartData] = useState({
    labels: ['一月', '二月', '三月', '四月', '五月', '六月'],
    datasets: [{
      name: '销售额',
      data: [120, 200, 150, 80, 70, 110]
    }]
  })
  
  const [darkMode, setDarkMode] = useState(false)
  
  const updateData = () => {
    setChartData({
      ...chartData,
      datasets: [{
        name: '销售额',
        data: chartData.datasets[0].data.map(() => 
          Math.floor(Math.random() * 200)
        )
      }]
    })
  }
  
  return (
    <div className="demo">
      <h2>基础折线图</h2>
      <Chart 
        type="line" 
        data={chartData} 
        title="月度销售额"
        darkMode={darkMode}
        responsive
      />
      
      <button onClick={updateData}>更新数据</button>
      <button onClick={() => setDarkMode(!darkMode)}>切换主题</button>
    </div>
  )
}
```

### Angular 示例

```typescript
import { Component } from '@angular/core'
import { ChartComponent } from '@ldesign/chart-angular'

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [ChartComponent],
  template: `
    <div class="demo">
      <h2>基础折线图</h2>
      <ldesign-chart
        type="line"
        [data]="chartData"
        title="月度销售额"
        [darkMode]="darkMode"
        [responsive]="true"
      />
      
      <button (click)="updateData()">更新数据</button>
      <button (click)="toggleTheme()">切换主题</button>
    </div>
  `
})
export class DemoComponent {
  chartData = {
    labels: ['一月', '二月', '三月', '四月', '五月', '六月'],
    datasets: [{
      name: '销售额',
      data: [120, 200, 150, 80, 70, 110]
    }]
  }
  
  darkMode = false
  
  updateData() {
    this.chartData = {
      ...this.chartData,
      datasets: [{
        name: '销售额',
        data: this.chartData.datasets[0].data.map(() => 
          Math.floor(Math.random() * 200)
        )
      }]
    }
  }
  
  toggleTheme() {
    this.darkMode = !this.darkMode
  }
}
```

## 在线演示

启动后访问:
- Vue: http://localhost:5173
- React: http://localhost:5173
- Angular: http://localhost:4200
- Svelte: http://localhost:5173
- Solid.js: http://localhost:3000
- Qwik: http://localhost:5173

## 贡献

欢迎提交新的演示示例！请确保:
1. 代码清晰易读
2. 包含注释说明
3. 展示最佳实践
4. 测试通过

## License

MIT
