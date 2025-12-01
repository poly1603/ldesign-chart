# Phase 7 规划 - 框架集成适配器

## 📅 计划时间
2025-12-01 开始

## 🎯 目标
为 @ldesign/chart 提供主流前端框架的集成适配器，让开发者能够在 Vue 和 React 项目中便捷使用图表库。

## 📦 计划实现的包

### 1. Vue 3 适配器 (`@ldesign/chart-vue`)

#### 功能特性
- ✅ Vue 3 Composition API 支持
- ✅ 响应式数据绑定
- ✅ TypeScript 类型支持
- ✅ 自动管理图表生命周期
- ✅ 提供便捷的组件封装

#### 核心组件
```vue
<template>
  <LChart :option="chartOption" :theme="theme" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LChart } from '@ldesign/chart-vue'

const chartOption = ref({
  series: [
    {
      type: 'line',
      data: [1, 2, 3, 4, 5]
    }
  ]
})
</script>
```

#### 技术栈
- Vue 3.3+
- TypeScript
- Vite（开发和构建）
- Vitest（测试）

### 2. React 适配器 (`@ldesign/chart-react`)

#### 功能特性
- ✅ React 18+ 支持
- ✅ React Hooks 集成
- ✅ TypeScript 类型支持
- ✅ 自动管理图表生命周期
- ✅ 性能优化（memo、useMemo）

#### 核心组件
```tsx
import { LChart } from '@ldesign/chart-react'

function App() {
  const chartOption = {
    series: [
      {
        type: 'line',
        data: [1, 2, 3, 4, 5]
      }
    ]
  }

  return <LChart option={chartOption} theme="dark" />
}
```

#### 技术栈
- React 18+
- TypeScript
- Vite（开发和构建）
- Vitest + React Testing Library（测试）

## 🏗️ 架构设计

### 适配器模式
```
@ldesign/chart-core (核心包)
    ↓
┌─────────────────┬─────────────────┐
│                 │                 │
@ldesign/        @ldesign/        其他框架
chart-vue        chart-react       适配器...
│                 │
Vue组件           React组件
```

### 核心抽象
1. **ChartAdapter** - 适配器基类
2. **useChart** - Hooks/Composables
3. **ChartComponent** - 框架组件封装

## 📋 实现计划

### Phase 7.1: Vue 适配器
- [ ] 创建 `packages/vue` 包结构
- [ ] 配置 TypeScript 和构建工具
- [ ] 实现 `LChart` 核心组件
- [ ] 实现 `useChart` Composable
- [ ] 实现具体图表组件（可选）
- [ ] 编写单元测试
- [ ] 创建使用示例
- [ ] 编写文档

### Phase 7.2: React 适配器
- [ ] 创建 `packages/react` 包结构
- [ ] 配置 TypeScript 和构建工具
- [ ] 实现 `LChart` 核心组件
- [ ] 实现 `useChart` Hook
- [ ] 实现具体图表组件（可选）
- [ ] 编写单元测试
- [ ] 创建使用示例
- [ ] 编写文档

### Phase 7.3: 文档站点
- [ ] 使用 VitePress 搭建文档框架
- [ ] 编写 API 文档
- [ ] 创建交互式示例
- [ ] 部署到 GitHub Pages

## 🎨 组件 API 设计

### 通用 Props
```typescript
interface ChartProps {
  // 图表配置
  option: ChartOption
  
  // 主题
  theme?: string | Theme
  
  // 尺寸
  width?: number | string
  height?: number | string
  
  // 自动调整大小
  autoResize?: boolean
  
  // 事件
  onClick?: (event: ChartEvent) => void
  onHover?: (event: ChartEvent) => void
}
```

### Vue Composable
```typescript
function useChart(options: {
  container: Ref<HTMLElement | null>
  option: Ref<ChartOption>
  theme?: Ref<string | Theme>
}) {
  const chart = ref<Chart | null>(null)
  
  // 初始化
  const init = () => { /* ... */ }
  
  // 更新
  const update = () => { /* ... */ }
  
  // 销毁
  const dispose = () => { /* ... */ }
  
  return {
    chart,
    init,
    update,
    dispose
  }
}
```

### React Hook
```typescript
function useChart(options: {
  option: ChartOption
  theme?: string | Theme
}) {
  const chartRef = useRef<Chart | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // 初始化和更新逻辑
  useEffect(() => {
    // ...
  }, [option, theme])
  
  // 清理
  useEffect(() => {
    return () => chartRef.current?.dispose()
  }, [])
  
  return { chartRef, containerRef }
}
```

## 📊 预估工作量

### Vue 适配器
- 核心实现: ~300 行
- 测试: ~200 行
- 示例: ~150 行
- 文档: ~100 行
- **总计**: ~750 行

### React 适配器
- 核心实现: ~300 行
- 测试: ~200 行
- 示例: ~150 行
- 文档: ~100 行
- **总计**: ~750 行

### 文档站点
- VitePress 配置: ~100 行
- API 文档: ~500 行
- 示例: ~400 行
- **总计**: ~1,000 行

## 🎯 Phase 7 总预估
**新增代码**: ~2,500 行

## 🚀 开始实现

从 Vue 适配器开始，因为：
1. Vue 的响应式系统更容易集成
2. Composition API 与我们的设计理念一致
3. 可以为 React 适配器提供参考

准备好开始 Phase 7.1 了吗？