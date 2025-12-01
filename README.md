# @ldesign/chart - 现代化图表库

> 一个高性能、可扩展的 TypeScript 图表库，支持多渲染引擎、丰富的图表类型和插件化架构

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

## 📖 项目概述

这是一个对标并超越 ECharts 和 VChart 的现代化图表库项目，从零开始构建。

### ✨ 核心特性

- 🚀 **高性能** - 支持百万级数据渲染
- 🎨 **多渲染引擎** - Canvas / SVG / WebGL 可切换
- 📊 **丰富图表** - 支持 20+ 种图表类型
- 🎭 **主题系统** - 内置多套主题，支持自定义
- 🔌 **插件化** - 灵活的插件系统，易于扩展
- 🎯 **类型安全** - 完整的 TypeScript 支持
- 🌈 **框架无关** - 核心库不依赖任何框架
- ⚡ **Vue 集成** - 提供官方 Vue 适配器

### 🛠️ 技术栈

- TypeScript 5.x
- Vite
- pnpm workspace
- Vitest
- VitePress

## 🚀 快速开始

### 安装

```bash
# 使用 pnpm（推荐）
pnpm add @ldesign/chart-core

# 或使用 npm
npm install @ldesign/chart-core

# 或使用 yarn
yarn add @ldesign/chart-core
```

### 基础示例

```typescript
import { Chart, CanvasRenderer, LinearScale, CartesianCoordinate, Axis, LineSeries } from '@ldesign/chart-core'

// 创建图表实例
const chart = new Chart(document.getElementById('chart'), {
  renderer: new CanvasRenderer(container),
  width: 800,
  height: 400,
})

// 准备数据
const data = [30, 45, 28, 60, 55, 70, 65]

// 创建比例尺
const xScale = new LinearScale({ domain: [0, 6], range: [0, 1] })
const yScale = new LinearScale({ domain: [0, 100], range: [0, 1] })

// 创建坐标系
const coordinate = new CartesianCoordinate({
  x: [50, 750],
  y: [350, 50],
})

// 创建并渲染
const lineSeries = new LineSeries({
  type: 'line',
  data: data,
  lineStyle: { stroke: '#1890ff', lineWidth: 2 },
  showSymbol: true,
}, xScale, yScale, coordinate)

const renderer = chart.getRenderer()
if (renderer) {
  renderer.clear()
  lineSeries.render(renderer)
}
```

### 查看示例

```bash
# 克隆项目
git clone <repository-url>
cd chart

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 访问示例
# http://localhost:5173/examples/basic-line/
# http://localhost:5173/examples/line-chart/
```

## 📚 文档

### 核心文档

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

### API 文档

- [核心库 API](./packages/core/README.md)
- [Canvas 渲染器](./packages/renderer-canvas/README.md)
- [示例集合](./examples/README.md)

## 📁 项目结构

```
chart/
├── packages/
│   ├── core/                 # 核心库（包含 Canvas 渲染器）✅
│   ├── renderer-svg/         # SVG 渲染器（可选）📅
│   ├── renderer-webgl/       # WebGL 渲染器（可选）📅
│   ├── vue/                  # Vue 适配器 📅
│   ├── react/                # React 适配器 📅
│   ├── charts-basic/         # 基础图表包 📅
│   ├── charts-statistical/   # 统计图表包 📅
│   ├── charts-relationship/  # 关系图表包 📅
│   └── charts-geo/           # 地理图表包 📅
├── examples/                 # 示例集合 ✅
│   ├── basic/               # 基础示例 ✅
│   ├── basic-line/          # 基础折线图 ✅
│   ├── line-chart/          # 完整折线图 ✅
│   ├── bar-chart/           # 柱状图示例 ✅
│   ├── scatter-chart/       # 散点图示例 ✅
│   └── area-chart/          # 面积图示例 ✅
├── docs/                     # 文档站点 📅
├── ARCHITECTURE.md           # 架构设计文档 ✅
├── TECHNICAL_DETAILS.md      # 技术细节文档 ✅
├── GETTING_STARTED.md        # 开发指南 ✅
└── README.md                 # 本文件 ✅
```

## 🗓️ 开发路线图

### ✅ Phase 1: 基础架构（已完成）
- [x] 架构设计文档
- [x] Monorepo 项目搭建
- [x] TypeScript 配置
- [x] 构建工具配置
- [x] 代码规范工具

### ✅ Phase 2: 核心功能（已完成）
- [x] 渲染器抽象层
- [x] Canvas 渲染器实现
- [x] 事件系统（EventEmitter）
- [x] 工具函数库
- [x] Chart 核心类

### ✅ Phase 3: 数据可视化基础（已完成）
- [x] 比例尺系统（LinearScale、BandScale）
- [x] 坐标系统（CartesianCoordinate）
- [x] 组件系统（Axis 坐标轴）
- [x] 系列系统（Series 基类、LineSeries 折线图）
- [x] 完整示例
- [x] API 文档

### ✅ Phase 4: 更多图表类型（已完成）
- [x] BarSeries - 柱状图
- [x] ScatterSeries - 散点图
- [x] AreaSeries - 面积图
- [ ] PieSeries - 饼图

### ✅ Phase 5: 高级组件（已完成）
- [x] Legend - 图例
- [x] Title - 标题组件
- [x] Tooltip - 提示框
- [ ] DataZoom - 数据区域缩放
- [ ] Grid - 网格组件

### ✅ Phase 6: 高级功能 - 主题与动画（已完成）
- [x] 主题系统
  - [x] 主题接口定义
  - [x] ThemeManager 主题管理器
  - [x] 内置主题（default、dark）
  - [x] 主题注册和切换机制
- [x] 动画系统
  - [x] 动画接口和状态管理
  - [x] 30+ 缓动函数
  - [x] Animation 基础类
  - [x] PropertyAnimation 属性动画
  - [x] KeyframeAnimation 关键帧动画
  - [x] AnimationManager 动画管理器

### 📅 Phase 7: 框架集成
- [ ] Vue 适配器
- [ ] React 适配器
- [ ] 组件封装

### 📅 Phase 8: 高级功能扩展
- [ ] 插件系统
- [ ] 性能优化
- [ ] 数据转换器

### 📅 Phase 8: 生态建设
- [ ] 文档站点
- [ ] 示例 Playground
- [ ] 完整测试覆盖
- [ ] CI/CD 流程

## 💡 核心概念

### 渲染器（Renderer）
抽象的渲染接口，支持多种渲染引擎：
```typescript
interface IRenderer {
  drawPath(pathData: PathData, style: PathStyle): void
  drawRect(x: number, y: number, width: number, height: number, style: RectStyle): void
  drawCircle(circle: Circle, style: CircleStyle): void
  drawText(text: Text, style: TextStyle): void
  // ...更多方法
}
```

### 比例尺（Scale）
将数据域映射到视觉空间：
```typescript
const scale = new LinearScale({
  domain: [0, 100],  // 数据范围
  range: [0, 1]      // 归一化范围
})
scale.map(50)  // 0.5
```

### 坐标系（Coordinate）
定义数据的空间映射关系：
```typescript
const coord = new CartesianCoordinate({
  x: [left, right],
  y: [bottom, top]
})
```

### 组件（Component）
可复用的图表组件（坐标轴、图例等）：
```typescript
const axis = new Axis({
  type: 'axis',
  orientation: 'bottom',
  scale: xScale
})
```

### 系列（Series）
数据可视化的核心（折线图、柱状图等）：
```typescript
const series = new LineSeries(options, xScale, yScale, coordinate)
```

## 🎯 架构亮点

### 1. 多渲染引擎架构
通过抽象渲染器接口，支持 Canvas、SVG、WebGL 三种渲染方式无缝切换。

### 2. 分层设计
- 应用层（用户代码）
- 框架适配层（Vue/React）
- 核心层（图表逻辑）
- 渲染层（Canvas/SVG/WebGL）

### 3. 插件化扩展
所有功能都可以通过插件方式扩展：
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

## 📊 当前进展

### 已实现功能（~7,200 行 TypeScript 代码）

**核心系统：**
- ✅ Chart 图表核心类（223 行）
- ✅ EventEmitter 事件系统（100 行）
- ✅ 工具函数库（209 行）
- ✅ 完整类型定义（246 行）

**渲染系统：**
- ✅ IRenderer 渲染器接口（210 行）
- ✅ CanvasRenderer 实现（368 行，已集成到核心包）

**数据系统：**
- ✅ LinearScale 线性比例尺（210 行）
- ✅ BandScale 分类比例尺（198 行）
- ✅ CartesianCoordinate 笛卡尔坐标系（141 行）

**组件系统（4个核心组件）：**
- ✅ Axis 坐标轴组件（240 行）
- ✅ Legend 图例组件（448 行）
  - 水平/垂直布局
  - 多种图例标记形状（circle、rect、line、triangle、diamond）
  - 图例项状态管理和切换
  - 灵活的样式配置
- ✅ Title 标题组件（379 行）
  - 主标题和副标题
  - 多种对齐方式（左/中/右）
  - 灵活的位置控制
  - 背景和边框支持
- ✅ Tooltip 提示框组件（459 行）
  - 跟随鼠标显示
  - 自定义格式化
  - 坐标轴指示器
  - 自动位置调整

**系列系统（4种图表类型）：**
- ✅ Series 抽象基类（85 行）
- ✅ LineSeries 折线图（115 行）
- ✅ BarSeries 柱状图（284 行）
  - 支持圆角、标签、动态宽度
- ✅ ScatterSeries 散点图（353 行）
  - 多种形状、动态大小
- ✅ AreaSeries 面积图（258 行）
  - 平滑曲线、面积填充

**主题系统：**
- ✅ Theme 接口定义（151 行）
- ✅ ThemeManager 主题管理器（64 行）
- ✅ 内置主题（210 行）
  - default 默认主题（ECharts 风格）
  - dark 暗色主题

**动画系统（~800 行）：**
- ✅ 动画接口定义（127 行）
- ✅ 缓动函数库（184 行）
  - 30+ 种缓动函数（linear、quad、cubic、sine、expo、circ、back、elastic、bounce）
- ✅ Animation 基础类（178 行）
- ✅ PropertyAnimation 属性动画
- ✅ KeyframeAnimation 关键帧动画（198 行）
- ✅ AnimationManager 动画管理器（153 行）

**测试：**
- ✅ LinearScale 单元测试（176 行）

**文档和示例：**
- ✅ 架构设计文档（1,886 行）
- ✅ 9 个工作示例（~2,500 行）
- ✅ 完整 API 文档（~2,800 行）

## 🔍 对比优势

### vs ECharts
- ✅ 更现代的架构设计
- ✅ TypeScript 原生支持
- ✅ 更灵活的插件系统
- ✅ 更好的 Tree-shaking
- ✅ 更小的包体积

### vs VChart
- ✅ 更丰富的图表类型（目标）
- ✅ 多渲染引擎支持
- ✅ 更强的扩展性
- ✅ 更完善的框架集成（计划）

## 🤝 贡献指南

我们欢迎所有形式的贡献！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add some feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

详细的开发指南请查看 [GETTING_STARTED.md](./GETTING_STARTED.md)

### 开发命令

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test

# 代码检查
pnpm lint

# 格式化代码
pnpm format
```

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 📮 联系方式

- **Issue**: [提交问题和建议](../../issues)
- **Discussions**: [参与讨论](../../discussions)
- **Email**: [待添加]

## 🙏 致谢

本项目受以下优秀开源项目启发：
- [Apache ECharts](https://echarts.apache.org/) - 强大的图表库
- [VChart](https://visactor.io/vchart) - 现代化的图表解决方案
- [Chart.js](https://www.chartjs.org/) - 简洁优雅的图表库
- [D3.js](https://d3js.org/) - 数据可视化的基石

## ⭐ Star History

如果这个项目对你有帮助，请给我们一个 Star ⭐

---

**当前状态**: Phase 6 已完成 ✅ 包含主题系统和动画系统 🎨🎬

**最新更新**:
- ✅ 实现完整的主题系统（颜色主题、组件主题、系列主题）
- ✅ 实现强大的动画系统（基础动画、属性动画、关键帧动画）
- ✅ 提供 30+ 种专业缓动函数
- ✅ 内置 default 和 dark 两套主题

欢迎参与讨论和贡献！