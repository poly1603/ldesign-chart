# 性能优化指南

## 📊 性能目标

| 指标 | 目标值 | 当前值 | 状态 |
|------|--------|--------|------|
| 首次渲染 | < 100ms | 待测 | ⏳ |
| 数据更新 | < 16ms | 待测 | ⏳ |
| 内存占用 | < 1MB/1000点 | 待测 | ⏳ |
| 包体积 | < 50KB (gzip) | 待测 | ⏳ |
| FPS | > 55 | 待测 | ⏳ |

## 🔍 性能分析工具

### 1. Chrome DevTools

#### Performance 面板
```javascript
// 开始性能记录
performance.mark('chart-start')

// 你的代码
createChart(container, config)

// 结束并测量
performance.mark('chart-end')
performance.measure('chart-init', 'chart-start', 'chart-end')

// 查看结果
const measures = performance.getEntriesByType('measure')
console.log(measures[0].duration)
```

#### Memory 面板
1. 打开 Chrome DevTools
2. 切换到 Memory 标签
3. 选择 Heap snapshot
4. 创建快照并分析

#### Coverage 面板
1. Cmd/Ctrl + Shift + P
2. 输入 "Coverage"
3. 开始记录
4. 查看未使用代码

### 2. Lighthouse

```bash
# 安装
npm install -g lighthouse

# 运行分析
lighthouse http://localhost:5173 --view
```

### 3. Bundle Analyzer

```bash
# 安装
pnpm add -D rollup-plugin-visualizer

# 在 builder.config.ts 中添加
import { visualizer } from 'rollup-plugin-visualizer'

export default {
  plugins: [
    visualizer({
      filename: './stats.html',
      open: true
    })
  ]
}
```

## ⚡ 优化技巧

### 1. 虚拟渲染（大数据集）

```typescript
// 自动启用虚拟渲染
const config = {
  type: 'line',
  data: largeDataset, // > 10000 点
  virtual: true,      // 启用虚拟渲染
}

// 手动配置
import { VirtualRenderer } from '@ldesign/chart-core'

const virtualRenderer = new VirtualRenderer({
  chunkSize: 1000,        // 每块大小
  preloadCount: 2,        // 预加载块数
  adaptiveChunkSize: true // 自适应
})
```

### 2. Web Worker（CPU密集）

```typescript
const config = {
  type: 'line',
  data: complexData,
  worker: true,  // 使用 Web Worker 处理数据
}

// 手动使用
import { ChartWorker } from '@ldesign/chart-core'

const worker = new ChartWorker()
const result = await worker.processData(data, 'optimize')
```

### 3. 智能缓存

```typescript
const config = {
  type: 'line',
  data: chartData,
  cache: true,  // 启用缓存
}

// 手动管理缓存
import { chartCache } from '@ldesign/chart-core'

// 设置缓存
chartCache.set('my-chart', config, 5 * 60 * 1000) // 5分钟

// 获取缓存
const cached = chartCache.get('my-chart')

// 清理缓存
chartCache.clear()

// 查看统计
console.log(chartCache.getStats())
```

### 4. 对象池（内存优化）

```typescript
import { ObjectPool, arrayPool } from '@ldesign/chart-core'

// 使用数组池
const arr = arrayPool.acquire(1000)
// 使用数组...
arrayPool.release(arr)

// 自定义对象池
const pointPool = new ObjectPool(
  () => ({ x: 0, y: 0 }),  // 创建函数
  (obj) => { obj.x = 0; obj.y = 0 }  // 重置函数
)

const point = pointPool.acquire()
// 使用 point...
pointPool.release(point)
```

### 5. 渲染调度（批量更新）

```typescript
import { renderScheduler } from '@ldesign/chart-core'

// 调度渲染任务
renderScheduler.schedule('update-chart', () => {
  chart.updateData(newData)
}, 6) // 优先级 1-10

// 取消任务
renderScheduler.cancel('update-chart')
```

### 6. 按需加载

```typescript
// 动态导入图表类型
const loadLineChart = () => import('./charts/line')

// 懒加载 ECharts
import { echartsLoader } from '@ldesign/chart-core'

await echartsLoader.loadChart('line')
await echartsLoader.loadComponents(['grid', 'tooltip'])
```

## 🎯 具体优化场景

### 场景 1: 大数据集折线图（100,000+ 点）

```typescript
const config = {
  type: 'line',
  data: massiveDataset,
  
  // 启用所有优化
  virtual: true,      // 虚拟渲染
  worker: true,       // Web Worker
  cache: true,        // 缓存
  
  // 采样配置
  sampling: {
    method: 'lttb',   // Largest-Triangle-Three-Buckets
    threshold: 1000   // 采样到1000点
  },
  
  // 动画优化
  animation: false,   // 禁用动画
  
  // 渲染优化
  progressive: 1000,  // 渐进式渲染
}
```

### 场景 2: 实时数据更新（高频更新）

```typescript
import { throttle } from '@ldesign/chart-core'

// 节流更新
const updateChart = throttle((data) => {
  chart.updateData(data)
}, 16) // 60 FPS

// 使用 RAF
let rafId
const scheduleUpdate = (data) => {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    chart.updateData(data)
  })
}
```

### 场景 3: 多图表页面

```typescript
import { instanceManager } from '@ldesign/chart-core'

// 统一管理图表实例
const chart1 = createChart(container1, config1)
const chart2 = createChart(container2, config2)

// 批量操作
instanceManager.disposeAll() // 清理所有实例
instanceManager.resizeAll()  // 统一调整大小

// 按需显示
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 进入视口才渲染
      initChart(entry.target)
    }
  })
})
```

### 场景 4: 移动端优化

```typescript
const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent)

const config = {
  type: 'line',
  data: chartData,
  
  // 移动端优化
  renderer: isMobile ? 'svg' : 'canvas',
  animation: !isMobile,  // 移动端禁用动画
  
  // 降低精度
  precision: isMobile ? 0 : 2,
  
  // 简化交互
  tooltip: {
    trigger: isMobile ? 'axis' : 'item'
  }
}
```

## 🔬 内存泄漏检测

### 1. 使用 Chrome DevTools

```javascript
// 创建图表
const chart = createChart(container, config)

// 拍摄堆快照 1
// ... 使用图表 ...

// 销毁图表
chart.dispose()

// 强制GC（在DevTools中）
// 拍摄堆快照 2

// 对比快照，查找未释放的对象
```

### 2. 自动检测

```typescript
import { cleanupManager } from '@ldesign/chart-core'

// 注册清理函数
cleanupManager.register('my-chart', () => {
  chart.dispose()
  removeEventListeners()
  clearTimers()
})

// 自动清理
cleanupManager.cleanup('my-chart')

// 清理所有
cleanupManager.cleanupAll()
```

### 3. 常见泄漏点

1. **事件监听器未移除**
```typescript
// ❌ 错误
window.addEventListener('resize', handleResize)

// ✅ 正确
window.addEventListener('resize', handleResize)
// 组件销毁时
window.removeEventListener('resize', handleResize)
```

2. **定时器未清理**
```typescript
// ❌ 错误
setInterval(updateChart, 1000)

// ✅ 正确
const timerId = setInterval(updateChart, 1000)
// 组件销毁时
clearInterval(timerId)
```

3. **DOM引用未释放**
```typescript
// ❌ 错误
let containerRef = document.querySelector('.chart')

// ✅ 正确
let containerRef = document.querySelector('.chart')
// 组件销毁时
containerRef = null
```

## 📈 性能监控

### 1. 自定义监控

```typescript
import { performanceMonitor } from '@ldesign/chart-core'

// 标记开始
performanceMonitor.mark('operation-start')

// 执行操作
doSomething()

// 测量耗时
const duration = performanceMonitor.measure(
  'operation', 
  'operation-start'
)

console.log(`耗时: ${duration}ms`)

// 获取所有指标
const metrics = performanceMonitor.getMetrics()
```

### 2. 生产环境监控

```typescript
// 上报性能数据
window.addEventListener('load', () => {
  const metrics = {
    loadTime: performance.now(),
    memory: performance.memory?.usedJSHeapSize,
    fps: calculateFPS()
  }
  
  // 发送到监控服务
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify(metrics)
  })
})
```

## ✅ 优化检查清单

### 开发阶段
- [ ] 使用 Performance 面板分析
- [ ] 检查 Bundle 大小
- [ ] 运行 Lighthouse
- [ ] 测试不同数据量
- [ ] 检查内存使用

### 上线前
- [ ] 启用生产模式构建
- [ ] 代码分割和懒加载
- [ ] Tree shaking 验证
- [ ] Gzip/Brotli 压缩
- [ ] CDN 部署

### 上线后
- [ ] 真实用户监控（RUM）
- [ ] 错误追踪
- [ ] 性能指标收集
- [ ] A/B 测试
- [ ] 持续优化

## 🎓 最佳实践

1. **避免频繁重渲染**
   - 使用 shouldComponentUpdate / memo
   - 合并状态更新
   - 使用虚拟DOM优化

2. **优化数据处理**
   - 在 Worker 中处理大数据
   - 使用高效算法
   - 数据采样和聚合

3. **减少包体积**
   - 按需导入
   - Tree shaking
   - 代码分割

4. **提升感知性能**
   - 骨架屏
   - 加载动画
   - 渐进式渲染

5. **监控和迭代**
   - 持续监控
   - 数据驱动
   - 逐步优化

## 📚 参考资源

- [Chrome DevTools 文档](https://developer.chrome.com/docs/devtools/)
- [Web Vitals](https://web.dev/vitals/)
- [ECharts 性能优化](https://echarts.apache.org/handbook/en/best-practices/canvas-vs-svg/)
- [React 性能优化](https://react.dev/learn/render-and-commit)
- [Vue 性能优化](https://vuejs.org/guide/best-practices/performance.html)
