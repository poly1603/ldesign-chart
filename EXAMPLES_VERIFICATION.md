# @ldesign/chart 示例验证报告

**验证时间**: 2025-10-24  
**验证状态**: ✅ **准备就绪**

---

## ✅ 配置修复

### package.json exports ✅

已添加框架适配器导出：

```json
{
  "exports": {
    "./vue": {
      "types": "./es/adapters/vue/index.d.ts",
      "import": "./es/adapters/vue/index.js",
      "require": "./lib/adapters/vue/index.cjs"
    },
    "./react": {
      "types": "./es/adapters/react/index.d.ts",
      "import": "./es/adapters/react/index.js",
      "require": "./lib/adapters/react/index.cjs"
    },
    "./lit": {
      "types": "./es/adapters/lit/index.d.ts",
      "import": "./es/adapters/lit/index.js",
      "require": "./lib/adapters/lit/index.cjs"
    }
  }
}
```

**验证**: ✅ 配置正确

---

## ✅ 示例创建

### Vue 3 双引擎示例 ✅

**文件**: `examples/vue-example/src/App-dual-engine.vue`

**特点**:
- ✅ 展示 ECharts 和 VChart 双引擎
- ✅ 引擎初始化在 onMounted 钩子
- ✅ 支持暗黑模式切换
- ✅ 支持数据刷新
- ✅ 显示当前使用的引擎

**代码示例**:
```vue
<template>
  <Chart type="line" :data="lineData" engine="echarts" />
  <Chart type="bar" :data="barData" engine="vchart" />
</template>

<script setup>
import { Chart } from '@ldesign/chart/vue';
import { EChartsEngine, VChartEngine, engineManager } from '@ldesign/chart';

onMounted(() => {
  engineManager.register('echarts', new EChartsEngine());
  engineManager.register('vchart', new VChartEngine());
});
</script>
```

### React 双引擎示例 ✅

**文件**: `examples/react-example/src/App-dual-engine.tsx`

**特点**:
- ✅ 展示 ECharts 和 VChart 双引擎
- ✅ 引擎初始化在 useEffect 钩子
- ✅ 支持暗黑模式切换
- ✅ 支持数据刷新
- ✅ 显示当前使用的引擎

**代码示例**:
```jsx
import { Chart } from '@ldesign/chart/react';
import { EChartsEngine, VChartEngine, engineManager } from '@ldesign/chart';

function App() {
  useEffect(() => {
    engineManager.register('echarts', new EChartsEngine());
    engineManager.register('vchart', new VChartEngine());
  }, []);

  return (
    <>
      <Chart type="line" data={lineData} engine="echarts" />
      <Chart type="bar" data={barData} engine="vchart" />
    </>
  );
}
```

---

## 🚀 启动示例

### Vue 示例

```bash
cd examples/vue-example
pnpm dev
```

**访问**: http://localhost:9000

**预期效果**:
- ✅ 页面正常加载
- ✅ 显示两个图表
- ✅ 一个使用 ECharts引擎
- ✅ 一个使用 VChart 引擎
- ✅ 控制按钮工作正常
- ✅ 控制台无报错

### React 示例

```bash
cd examples/react-example
pnpm dev
```

**访问**: http://localhost:5173

**预期效果**:
- ✅ 页面正常加载
- ✅ 显示两个图表
- ✅ 引擎切换正常
- ✅ 数据刷新正常
- ✅ 控制台无报错

---

## ✅ 功能验证清单

### 基础功能

- [ ] 图表正常渲染
- [ ] 数据正确显示
- [ ] 暗黑模式切换
- [ ] 数据刷新功能

### 双引擎功能

- [ ] ECharts 引擎正常工作
- [ ] VChart 引擎正常工作
- [ ] 引擎切换无报错
- [ ] 两个引擎渲染结果正确

### 控制台验证

- [ ] 无 JavaScript 错误
- [ ] 无模块导入错误
- [ ] 无类型错误
- [ ] 引擎初始化成功日志

---

## 🎯 使用说明

### 在 Vue 项目中使用

```vue
<template>
  <Chart type="line" :data="myData" engine="echarts" />
</template>

<script setup>
import { Chart } from '@ldesign/chart/vue';
import { EChartsEngine, engineManager } from '@ldesign/chart';

// 初始化引擎（只需一次）
engineManager.register('echarts', new EChartsEngine());
</script>
```

### 在 React 项目中使用

```jsx
import { Chart } from '@ldesign/chart/react';
import { EChartsEngine, engineManager } from '@ldesign/chart';
import { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    engineManager.register('echarts', new EChartsEngine());
  }, []);

  return <Chart type="bar" data={myData} engine="echarts" />;
}
```

---

## 📝 注意事项

### 1. 引擎初始化

**重要**: 必须在使用图表前注册引擎

```typescript
// Vue: 在 onMounted 中注册
onMounted(() => {
  engineManager.register('echarts', new EChartsEngine());
});

// React: 在 useEffect 中注册
useEffect(() => {
  engineManager.register('echarts', new EChartsEngine());
}, []);
```

### 2. 引擎选择

```typescript
// 显式指定引擎
<Chart engine="echarts" ... />
<Chart engine="vchart" ... />

// 自动选择（默认 echarts）
<Chart ... />  // 使用默认引擎
```

### 3. 依赖安装

```bash
# 使用 ECharts
npm install echarts

# 使用 VChart
npm install @visactor/vchart

# 使用两个引擎
npm install echarts @visactor/vchart
```

---

## ✅ 下一步验证

1. **访问 Vue 示例**
   - 打开 http://localhost:9000
   - 检查页面是否正常
   - 检查控制台是否有错误

2. **访问 React 示例**
   - 打开 http://localhost:5173
   - 检查页面是否正常
   - 检查控制台是否有错误

3. **功能测试**
   - 点击各个按钮
   - 切换暗黑模式
   - 刷新数据
   - 切换引擎

---

**验证状态**: ✅ 配置完成，等待启动验证  
**下一步**: 访问示例页面进行功能验证

