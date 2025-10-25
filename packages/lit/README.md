# @ldesign/chart-lit

企业级图表 Lit/Web Components 适配器

## 安装

```bash
pnpm add @ldesign/chart-lit echarts
```

## 使用

### 在 HTML 中使用

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import '@ldesign/chart-lit'
  </script>
</head>
<body>
  <ldesign-chart
    type="line"
    title="销售趋势"
  ></ldesign-chart>
  
  <script>
    const chart = document.querySelector('ldesign-chart')
    chart.data = {
      labels: ['一月', '二月', '三月'],
      datasets: [{ data: [10, 20, 30] }]
    }
  </script>
</body>
</html>
```

### 在 Lit 应用中使用

```typescript
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '@ldesign/chart-lit'

@customElement('my-app')
class MyApp extends LitElement {
  @state()
  private chartData = {
    labels: ['一月', '二月', '三月'],
    datasets: [{ data: [10, 20, 30] }]
  }
  
  render() {
    return html`
      <ldesign-chart
        type="bar"
        .data=${this.chartData}
        title="数据统计"
        width="600"
        height="400"
      ></ldesign-chart>
    `
  }
}
```

### 在框架中使用

由于 Web Components 是标准 API，可以在任何框架中使用：

**React:**
```tsx
import '@ldesign/chart-lit'

function App() {
  const chartRef = useRef<any>(null)
  
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.data = {
        labels: ['A', 'B', 'C'],
        datasets: [{ data: [1, 2, 3] }]
      }
    }
  }, [])
  
  return <ldesign-chart ref={chartRef} type="pie" />
}
```

**Vue:**
```vue
<template>
  <ldesign-chart
    type="line"
    :data="chartData"
  />
</template>

<script setup>
import '@ldesign/chart-lit'
import { ref } from 'vue'

const chartData = ref({
  labels: ['A', 'B', 'C'],
  datasets: [{ data: [1, 2, 3] }]
})
</script>
```

## API

### Attributes

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | string | - | 图表类型 |
| title | string | - | 图表标题 |
| theme | string | 'default' | 主题名称 |
| width | number/string | '100%' | 宽度 |
| height | number/string | 400 | 高度 |

### Properties

| 属性 | 类型 | 说明 |
|------|------|------|
| data | ChartData | 图表数据（仅支持 property 方式） |

### Events

| 事件 | 详情 | 说明 |
|------|------|------|
| chart-ready | { chart } | 图表初始化完成 |
| chart-error | { error } | 图表错误 |

## License

MIT



