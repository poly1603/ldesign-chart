# @ldesign/chart-core

企业级图表核心库 - 框架无关

## 特性

✨ 框架无关 - 可在任何环境使用
🚀 高性能 - 智能缓存、虚拟渲染、Web Worker
📊 双引擎 - 支持 ECharts 和 VChart
🎨 主题系统 - 内置多种主题，支持自定义
💾 内存优化 - 智能缓存和对象池
📈 数据处理 - CSV解析、实时数据流、数据验证

## 安装

```bash
pnpm add @ldesign/chart-core echarts
```

## 使用

```typescript
import { createChart } from '@ldesign/chart-core'

const chart = createChart('#chart-container', {
  type: 'line',
  data: {
    labels: ['一月', '二月', '三月'],
    datasets: [{ data: [10, 20, 30] }]
  }
})
```

## 文档

详见主文档：https://github.com/ldesign/chart

## License

MIT



