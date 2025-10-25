# @ldesign/chart v2.0 迁移指南

## 🎯 重大变更

@ldesign/chart v2.0 采用了全新的 **Monorepo Workspace** 架构，将原来的单一包拆分为4个独立的包。

---

## 📦 新的包结构

### v1.x（旧版）
```
@ldesign/chart - 单一包（2.5 MB）
└── 包含所有框架适配器
```

### v2.0（新版）
```
@ldesign/chart - 元包
├── @ldesign/chart-core      核心库（框架无关）
├── @ldesign/chart-vue       Vue 3 适配器（48 KB）
├── @ldesign/chart-react     React 适配器（42 KB）
└── @ldesign/chart-lit       Lit 适配器（76 KB）
```

---

## 🔄 迁移步骤

### Step 1: 卸载旧版本

```bash
pnpm remove @ldesign/chart
```

### Step 2: 安装新版本

根据您使用的框架，安装对应的包：

**Vue 3 项目**:
```bash
pnpm add @ldesign/chart-vue echarts
```

**React 项目**:
```bash
pnpm add @ldesign/chart-react echarts
```

**Lit 项目**:
```bash
pnpm add @ldesign/chart-lit echarts
```

**仅使用核心功能**:
```bash
pnpm add @ldesign/chart-core echarts
```

### Step 3: 更新导入语句

#### Vue 项目

**v1.x（旧版）**:
```typescript
import { Chart } from '@ldesign/chart/vue'
import { ChartCore } from '@ldesign/chart'
```

**v2.0（新版）**:
```typescript
import { Chart } from '@ldesign/chart-vue'
import { ChartCore } from '@ldesign/chart-core'
```

#### React 项目

**v1.x（旧版）**:
```typescript
import { Chart } from '@ldesign/chart/react'
```

**v2.0（新版）**:
```typescript
import { Chart } from '@ldesign/chart-react'
```

#### Lit 项目

**v1.x（旧版）**:
```typescript
import { ChartElement } from '@ldesign/chart/lit'
```

**v2.0（新版）**:
```typescript
import { ChartElement } from '@ldesign/chart-lit'
```

---

## 🎨 使用示例

### Vue 3

```vue
<template>
  <Chart
    type="line"
    :data="chartData"
    title="销售趋势"
    engine="echarts"
  />
</template>

<script setup>
import { Chart } from '@ldesign/chart-vue'

const chartData = {
  labels: ['一月', '二月', '三月', '四月', '五月'],
  datasets: [{
    name: '销售额',
    data: [120, 200, 150, 80, 70]
  }]
}
</script>
```

### React

```tsx
import { Chart } from '@ldesign/chart-react'

function App() {
  const chartData = {
    labels: ['一月', '二月', '三月', '四月', '五月'],
    datasets: [{
      name: '销售额',
      data: [120, 200, 150, 80, 70]
    }]
  }
  
  return (
    <Chart
      type="line"
      data={chartData}
      title="销售趋势"
      engine="echarts"
    />
  )
}
```

### Lit/Web Components

```typescript
import '@ldesign/chart-lit'

// HTML中使用
<ldesign-chart
  type="line"
  title="销售趋势"
></ldesign-chart>

// JavaScript设置数据
const chart = document.querySelector('ldesign-chart')
chart.data = {
  labels: ['一月', '二月', '三月'],
  datasets: [{ data: [10, 20, 30] }]
}
```

---

## 🆕 v2.0 新功能

### 1. 引擎选择
```vue
<Chart
  type="bar"
  :data="data"
  engine="echarts"    <!-- 明确指定引擎 -->
/>

<Chart
  type="bar"
  :data="data"
  engine="vchart"     <!-- 使用 VChart -->
/>

<Chart
  type="bar"
  :data="data"
  engine="auto"       <!-- 自动选择 -->
/>
```

### 2. 新增图表类型
- ✅ Waterfall（瀑布图）
- ✅ 3D Bar（3D柱状图，VChart）
- ✅ Liquid（水球图，VChart）
- ✅ Circle Packing（圆堆积图，VChart）

### 3. 性能优化
- 包体积减小 98%
- 加载速度提升
- 类型提示更精确

---

## ⚠️ 破坏性变更

### 1. 包名变更

| 旧版 | 新版 |
|------|------|
| `@ldesign/chart/vue` | `@ldesign/chart-vue` |
| `@ldesign/chart/react` | `@ldesign/chart-react` |
| `@ldesign/chart/lit` | `@ldesign/chart-lit` |
| `@ldesign/chart`（核心） | `@ldesign/chart-core` |

### 2. 导出路径变更

**v1.x**:
```typescript
import { ChartCore } from '@ldesign/chart'
import { Chart } from '@ldesign/chart/vue'
```

**v2.0**:
```typescript
import { ChartCore } from '@ldesign/chart-core'
import { Chart } from '@ldesign/chart-vue'
```

### 3. 不再有单一包

v2.0 **不再提供** `@ldesign/chart` 作为可安装的包，它现在是一个元包（workspace根）。

---

## ✅ 迁移检查清单

- [ ] 卸载旧版 `@ldesign/chart`
- [ ] 安装新版对应的框架包
- [ ] 更新所有导入语句
- [ ] 更新 package.json 依赖
- [ ] 测试应用是否正常运行
- [ ] 检查 TypeScript 类型是否正确

---

## 💡 迁移建议

### 1. 渐进式迁移
如果项目较大，可以：
1. 先在新分支进行迁移
2. 逐个文件更新导入
3. 测试通过后合并

### 2. 使用 IDE 批量替换
```
查找: from '@ldesign/chart/vue'
替换: from '@ldesign/chart-vue'

查找: from '@ldesign/chart/react'
替换: from '@ldesign/chart-react'
```

### 3. 验证类型
迁移后运行 TypeScript 类型检查：
```bash
tsc --noEmit
```

---

## 🎁 v2.0 的优势

### 对用户
- 📦 **包体积减小 98%** - 从 2.5MB → 40-76KB
- ⚡ **安装更快** - 依赖更少
- 🎯 **类型更精准** - 无框架污染
- 📝 **按需安装** - 只装需要的

### 对开发者
- 🔧 **代码更清晰** - 职责分离
- 🚀 **独立发版** - 可单独升级某个适配器
- 📈 **易于扩展** - 添加新框架更简单
- 🛠️ **构建更快** - 独立构建

---

## 📚 更多资源

- [主文档](./README.md)
- [Core 包文档](./packages/core/README.md)
- [Vue 适配器文档](./packages/vue/README.md)
- [React 适配器文档](./packages/react/README.md)
- [Lit 适配器文档](./packages/lit/README.md)
- [完整迁移报告](./WORKSPACE_MIGRATION_COMPLETE.md)

---

## ❓ 常见问题

**Q: 为什么要拆分包？**  
A: 用户只需安装需要的框架适配器，包体积减小 98%，安装和加载都更快。

**Q: 类型定义会有问题吗？**  
A: 不会！每个包都有完整的 TypeScript 类型定义，而且更精确（无框架污染）。

**Q: 可以同时使用多个适配器吗？**  
A: 可以！所有适配器都依赖同一个 `@ldesign/chart-core`，不会有冲突。

**Q: v1.x 还会维护吗？**  
A: 建议尽快迁移到 v2.0，v1.x 将逐步停止维护。

---

**版本**: v2.0.0  
**发布日期**: 2025-10-25  
**迁移难度**: ⭐☆☆☆☆ 简单


