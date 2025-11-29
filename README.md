# @ldesign/chart - 现代化图表库

> 一个高性能、可扩展的 TypeScript 图表库，支持多渲染引擎、丰富的图表类型和插件化架构

## 项目概述

这是一个对标并超越 ECharts 和 VChart 的现代化图表库项目，从零开始构建。

### 核心特性

- 🚀 **高性能** - 支持百万级数据渲染
- 🎨 **多渲染引擎** - Canvas / SVG / WebGL 可切换
- 📊 **丰富图表** - 支持 20+ 种图表类型
- 🎭 **主题系统** - 内置多套主题，支持自定义
- 🔌 **插件化** - 灵活的插件系统，易于扩展
- 🎯 **类型安全** - 完整的 TypeScript 支持
- 🌈 **框架无关** - 核心库不依赖任何框架
- ⚡ **Vue 集成** - 提供官方 Vue 适配器

### 技术栈

- TypeScript 5.x
- Vite
- pnpm workspace
- Vitest
- VitePress

## 项目文档

本仓库包含完整的架构设计文档：

### 📚 核心文档

1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - 架构设计方案
   - 项目结构说明
   - 核心模块设计
   - 包设计详情
   - 性能优化策略
   - 扩展性设计

2. **[TECHNICAL_DETAILS.md](./TECHNICAL_DETAILS.md)** - 技术实现细节
   - 核心接口设计
   - 关键设计模式
   - 性能优化实现
   - 技术难点解决方案

3. **[GETTING_STARTED.md](./GETTING_STARTED.md)** - 快速开始指南
   - 开发环境搭建
   - 项目结构说明
   - 开发工作流
   - 代码规范

## 项目结构

```
chart/
├── packages/
│   ├── core/                 # 核心库（框架无关）
│   ├── vue/                  # Vue 适配器
│   ├── react/                # React 适配器
│   ├── renderer-canvas/      # Canvas 渲染器
│   ├── renderer-svg/         # SVG 渲染器
│   ├── renderer-webgl/       # WebGL 渲染器
│   ├── charts-basic/         # 基础图表包
│   ├── charts-statistical/   # 统计图表包
│   ├── charts-relationship/  # 关系图表包
│   └── charts-geo/           # 地理图表包
├── docs/                     # 文档站点
├── ARCHITECTURE.md           # 架构设计文档
├── TECHNICAL_DETAILS.md      # 技术细节文档
├── GETTING_STARTED.md        # 开发指南
└── README.md                 # 本文件
```

## 开发路线图

### ✅ Phase 1: 基础架构（当前阶段）
- [x] 架构设计
- [ ] Monorepo 项目搭建
- [ ] 渲染器抽象层
- [ ] 核心类设计

### 🔄 Phase 2: 核心功能
- [ ] 坐标系统
- [ ] 比例尺系统
- [ ] 事件系统
- [ ] 动画系统

### 📅 Phase 3: 基础图表
- [ ] 折线图
- [ ] 柱状图
- [ ] 饼图
- [ ] 散点图

### 📅 Phase 4: 框架集成
- [ ] Vue 适配器
- [ ] React 适配器
- [ ] 组件封装

### 📅 Phase 5: 高级功能
- [ ] 主题系统
- [ ] 插件系统
- [ ] 更多图表类型
- [ ] 性能优化

### 📅 Phase 6: 生态建设
- [ ] 文档站点
- [ ] 示例 Playground
- [ ] 测试覆盖
- [ ] CI/CD

## 快速开始

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 启动开发模式
pnpm dev

# 运行测试
pnpm test
```

详细说明请查看 [GETTING_STARTED.md](./GETTING_STARTED.md)

## 使用示例

### 基础用法

```typescript
import { Chart } from '@ldesign/chart-core'

const chart = new Chart('#container')

chart.setOption({
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    type: 'line',
    data: [120, 200, 150, 80, 70]
  }]
})
```

### Vue 组件

```vue
<template>
  <Chart :option="chartOption" theme="dark" />
</template>

<script setup>
import { Chart } from '@ldesign/chart-vue'

const chartOption = {
  // 配置项
}
</script>
```

## 架构亮点

### 1. 多渲染引擎架构

通过抽象渲染器接口，支持 Canvas、SVG、WebGL 三种渲染方式无缝切换。

### 2. 分层设计

- 应用层（用户代码）
- 框架适配层（Vue/React）
- 核心层（图表逻辑）
- 渲染层（Canvas/SVG/WebGL）

### 3. 插件化扩展

所有功能都可以通过插件方式扩展，包括：
- 自定义图表类型
- 自定义组件
- 数据转换器
- 交互行为

### 4. 性能优化

- 脏检查机制
- 分层渲染
- 数据抽样（LTTB 算法）
- 虚拟滚动
- WebGL 加速

## 对比优势

### vs ECharts
- ✅ 更现代的架构设计
- ✅ TypeScript 原生支持
- ✅ 更灵活的插件系统
- ✅ 更好的 Tree-shaking
- ✅ 更小的包体积

### vs VChart
- ✅ 更丰富的图表类型
- ✅ 多渲染引擎支持
- ✅ 更强的扩展性
- ✅ 更完善的框架集成

## 贡献指南

我们欢迎所有形式的贡献！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add some feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

详细的开发指南请查看 [GETTING_STARTED.md](./GETTING_STARTED.md)

## 许可证

MIT License

## 联系方式

- Issue: 提交问题和建议
- Discussions: 参与讨论
- Email: [待添加]

## 致谢

本项目受以下优秀开源项目启发：
- [Apache ECharts](https://echarts.apache.org/)
- [VChart](https://visactor.io/vchart)
- [Chart.js](https://www.chartjs.org/)
- [D3.js](https://d3js.org/)

---

**注意**: 本项目目前处于架构设计阶段，欢迎参与讨论和贡献！