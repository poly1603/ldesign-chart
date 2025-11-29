# 项目启动指南

## 快速开始

本文档帮助您快速了解项目结构和开始开发。

## 前置要求

- Node.js 18+
- pnpm 8+
- Git

## 初始化项目

```bash
# 安装 pnpm（如果还没有）
npm install -g pnpm

# 克隆项目
git clone <repository-url>
cd chart

# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 启动开发模式
pnpm dev
```

## 项目结构说明

```
chart/
├── packages/
│   ├── core/                 # 核心包（最重要）
│   ├── vue/                  # Vue 适配器
│   ├── renderer-canvas/      # Canvas 渲染器
│   ├── renderer-svg/         # SVG 渲染器
│   └── charts-basic/         # 基础图表类型
├── docs/                     # 文档站点
├── ARCHITECTURE.md           # 架构设计文档
├── TECHNICAL_DETAILS.md      # 技术实现细节
└── pnpm-workspace.yaml       # Workspace 配置
```

## 开发工作流

### 1. 创建新功能分支

```bash
git checkout -b feature/your-feature-name
```

### 2. 开发和测试

```bash
# 在具体包目录下开发
cd packages/core

# 运行测试
pnpm test

# 运行类型检查
pnpm type-check

# 运行 lint
pnpm lint
```

### 3. 提交代码

```bash
# 使用约定式提交
git commit -m "feat: add new feature"
git commit -m "fix: fix bug"
git commit -m "docs: update documentation"
```

### 4. 创建变更集（发布前）

```bash
pnpm changeset
```

## 开发优先级

### 第一阶段：核心基础（2-3周）
1. 搭建 monorepo 结构
2. 配置 TypeScript 和构建工具
3. 实现渲染器接口和 Canvas 实现
4. 实现 Chart 核心类

### 第二阶段：基础功能（3-4周）
1. 坐标系统
2. 比例尺系统
3. 事件系统
4. 基础组件（轴、图例）

### 第三阶段：图表实现（4-6周）
1. 折线图
2. 柱状图
3. 饼图
4. 散点图

### 第四阶段：框架集成（2-3周）
1. Vue 适配器
2. 组件封装
3. 示例开发

## 常用命令

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 开发模式（监听文件变化）
pnpm dev

# 运行测试
pnpm test

# 运行测试（监听模式）
pnpm test:watch

# 类型检查
pnpm type-check

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 清理构建产物
pnpm clean

# 启动文档站点
pnpm docs:dev

# 构建文档站点
pnpm docs:build
```

## 包开发说明

### 创建新包

```bash
# 在 packages 目录下创建新包
mkdir -p packages/your-package/src
cd packages/your-package

# 创建 package.json
pnpm init
```

### package.json 模板

```json
{
  "name": "@ldesign/chart-your-package",
  "version": "0.0.1",
  "description": "",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch",
    "test": "vitest",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {},
  "devDependencies": {}
}
```

## 代码规范

### TypeScript

- 使用严格模式
- 明确的类型定义
- 避免 any 类型
- 使用接口定义公共 API

### 命名规范

- 类名：PascalCase（如 `Chart`, `LineSeries`）
- 接口：I前缀 + PascalCase（如 `IRenderer`, `IScale`）
- 函数/方法：camelCase（如 `render`, `setOption`）
- 常量：UPPER_SNAKE_CASE（如 `DEFAULT_COLOR`）
- 文件名：kebab-case（如 `line-series.ts`）

### 注释规范

```typescript
/**
 * 图表主类
 * @example
 * ```ts
 * const chart = new Chart('#container')
 * chart.setOption({ ... })
 * ```
 */
export class Chart {
  /**
   * 设置图表配置
   * @param option - 图表配置对象
   * @param opts - 可选的设置选项
   */
  setOption(option: ChartOption, opts?: SetOptionOpts): void {
    // ...
  }
}
```

## 测试规范

### 单元测试示例

```typescript
import { describe, it, expect } from 'vitest'
import { LinearScale } from '../scale/LinearScale'

describe('LinearScale', () => {
  it('should map value correctly', () => {
    const scale = new LinearScale({
      domain: [0, 100],
      range: [0, 500]
    })
    
    expect(scale.map(50)).toBe(250)
    expect(scale.map(0)).toBe(0)
    expect(scale.map(100)).toBe(500)
  })
  
  it('should invert pixel correctly', () => {
    const scale = new LinearScale({
      domain: [0, 100],
      range: [0, 500]
    })
    
    expect(scale.invert(250)).toBe(50)
  })
})
```

## 调试技巧

### 1. 使用 Source Maps

开发模式下会生成 source maps，可以直接在浏览器中调试 TypeScript 代码。

### 2. 渲染调试

```typescript
// 开启渲染调试模式
const chart = new Chart('#container', {
  debug: true  // 显示边界框、坐标等调试信息
})
```

### 3. 性能分析

```typescript
// 使用浏览器性能分析工具
performance.mark('render-start')
chart.render()
performance.mark('render-end')
performance.measure('render', 'render-start', 'render-end')
```

## 常见问题

### Q: 如何添加新的图表类型？

1. 在 `packages/charts-*` 创建新的 Series 类
2. 继承 `Series` 基类
3. 实现 `render` 方法
4. 注册到图表系统

### Q: 如何添加新的渲染器？

1. 在 `packages/renderer-*` 创建新包
2. 实现 `IRenderer` 接口
3. 在核心包中注册渲染器

### Q: 如何贡献代码？

1. Fork 项目
2. 创建功能分支
3. 提交 PR
4. 等待代码审查

## 相关资源

- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vite 文档](https://vitejs.dev/)
- [pnpm 文档](https://pnpm.io/)
- [Vitest 文档](https://vitest.dev/)
- [ECharts 源码](https://github.com/apache/echarts)
- [VChart 文档](https://visactor.io/vchart)

## 获取帮助

- 提交 Issue
- 查看文档
- 加入讨论组