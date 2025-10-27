# Vanilla JavaScript 示例

这是 `@ldesign/chart` 的原生 JavaScript 示例项目，展示如何在纯 JavaScript/TypeScript 项目中使用图表库。

## 功能特性

- ✅ 多种图表类型（折线图、柱状图、饼图、散点图等）
- ✅ 实时数据更新
- ✅ 主题切换（浅色/深色）
- ✅ 双引擎支持（ECharts/VChart）
- ✅ 性能优化（虚拟渲染、懒加载、缓存）
- ✅ 响应式设计
- ✅ 图表导出

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

然后在浏览器中打开 `http://localhost:9002`

### 构建

```bash
pnpm build
```

### 预览构建结果

```bash
pnpm preview
```

## 项目结构

```
vanilla-example/
├── src/
│   ├── main.ts      # 主要逻辑
│   └── style.css    # 样式
├── index.html       # HTML 入口
├── vite.config.ts   # Vite 配置
└── package.json
```

## 使用说明

### 1. 基础用法

```typescript
import { Chart } from '@ldesign/chart-core'

const chart = new Chart(container, {
  type: 'line',
  data: {
    labels: ['一月', '二月', '三月'],
    datasets: [{
      label: '销售额',
      data: [10, 20, 30]
    }]
  },
  title: '月度销售'
})
```

### 2. 实时数据更新

```typescript
setInterval(() => {
  chart.updateData({
    labels: ['一月', '二月', '三月'],
    datasets: [{
      label: '销售额',
      data: [Math.random() * 100, Math.random() * 100, Math.random() * 100]
    }]
  })
}, 1000)
```

### 3. 主题切换

```typescript
await chart.setTheme('dark')
```

### 4. 导出图片

```typescript
const dataURL = chart.getDataURL({ type: 'png' })
// 下载或使用 dataURL
```

### 5. 清理资源

```typescript
chart.dispose()
```

## 性能优化

示例中的图表 4 展示了如何处理大数据集：

- 使用虚拟渲染：`virtual: true`
- 启用懒加载：`lazy: true`
- 启用缓存：`cache: true`

这些优化可以显著提升大数据量时的渲染性能。

## 注意事项

1. 确保先构建核心包：`cd ../../packages/core && pnpm build`
2. 开发时 Vite 会通过 alias 直接引用源码，支持热更新
3. 生产构建时使用的是构建后的包

## 更多信息

- [核心库文档](../../packages/core/README.md)
- [项目主页](../../README.md)

