# @ldesign/chart 示例说明

## 🚀 快速启动示例

### Vue 3 双引擎示例

```bash
cd examples/vue-example
pnpm install
pnpm dev
```

**访问**: http://localhost:9000

**展示内容**:
- 折线图 (ECharts 引擎)
- 柱状图 (VChart 引擎)
- 暗黑模式切换
- 数据刷新功能

### React 双引擎示例

```bash
cd examples/react-example
pnpm install
pnpm dev
```

**访问**: http://localhost:5173

**展示内容**:
- 折线图 (ECharts 引擎)
- 柱状图 (VChart 引擎)
- 暗黑模式切换
- 数据刷新功能

---

## 📝 示例代码

### Vue 3 用法

```vue
<template>
  <Chart 
    type="line" 
    :data="[1, 2, 3, 4, 5]"
    engine="echarts"
    title="销售趋势"
  />
</template>

<script setup>
import { Chart } from '@ldesign/chart/vue';
import { EChartsEngine, engineManager } from '@ldesign/chart';

onMounted(() => {
  engineManager.register('echarts', new EChartsEngine());
});
</script>
```

### React 用法

```jsx
import { Chart } from '@ldesign/chart/react';
import { EChartsEngine, engineManager } from '@ldesign/chart';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    engineManager.register('echarts', new EChartsEngine());
  }, []);

  return (
    <Chart 
      type="bar" 
      data={[100, 200, 150, 300]}
      engine="echarts"
      title="季度销售"
    />
  );
}
```

---

## ✅ 验证清单

### 启动验证
- [ ] Vue 示例服务器启动成功
- [ ] React 示例服务器启动成功
- [ ] 无端口冲突

### 页面验证
- [ ] 页面正常加载
- [ ] 图表正常渲染
- [ ] 无 JavaScript 错误
- [ ] 无模块导入错误

### 功能验证
- [ ] 暗黑模式切换正常
- [ ] 数据刷新正常
- [ ] 按钮交互正常
- [ ] 图表响应式调整

---

## 🎯 注意事项

### 1. 引擎初始化

**必须**在使用图表前注册引擎：

```typescript
// Vue
onMounted(() => {
  engineManager.register('echarts', new EChartsEngine());
});

// React
useEffect(() => {
  engineManager.register('echarts', new EChartsEngine());
}, []);
```

### 2. 依赖安装

示例已包含所需依赖：

```json
{
  "dependencies": {
    "@ldesign/chart": "workspace:*",
    "echarts": "^5.4.3",
    "vue": "^3.4.15" // 或 react
  }
}
```

### 3. 导入路径

确保使用正确的导入路径：

```typescript
// ✅ 正确
import { Chart } from '@ldesign/chart/vue';
import { EChartsEngine } from '@ldesign/chart';

// ❌ 错误
import { Chart } from '@ldesign/chart';  // 这是核心类，不是 Vue 组件
```

---

## 📚 更多资源

- [快速开始](../GETTING_STARTED.md)
- [双引擎指南](../docs/dual-engine-guide.md)
- [完整文档](../docs/)

---

**最后更新**: 2025-10-24

