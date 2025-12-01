# 开发指南

## 🎉 项目初始化完成

恭喜！图表库的基础架构已经搭建完成。以下是已完成的工作：

### ✅ 已完成

1. **Monorepo 项目结构**
   - pnpm workspace 配置
   - 多包管理结构

2. **TypeScript 配置**
   - 严格模式配置
   - 项目引用设置
   - 类型检查规则

3. **核心包 (@ldesign/chart-core)**
   - 类型定义系统
   - 渲染器抽象接口
   - 事件系统 (EventEmitter)
   - 工具函数库
   - Chart 核心类

4. **Canvas 渲染器 (@ldesign/chart-renderer-canvas)**
   - 完整的 Canvas 渲染实现
   - 支持路径、矩形、圆形、文本绘制
   - 状态管理和变换操作

5. **开发工具配置**
   - ESLint 代码检查
   - Prettier 代码格式化
   - Vite 构建配置
   - Vitest 测试框架

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 构建所有包

```bash
pnpm build
```

### 3. 启动开发模式

```bash
pnpm dev
```

### 4. 运行测试

```bash
pnpm test
```

### 5. 查看示例

在浏览器中打开 `examples/basic/index.html` 查看基础示例。

## 📦 包结构

```
packages/
├── core/                    # 核心库 ✅
│   ├── src/
│   │   ├── chart/          # Chart 核心类
│   │   ├── event/          # 事件系统
│   │   ├── renderer/       # 渲染器接口
│   │   ├── types/          # 类型定义
│   │   └── util/           # 工具函数
│   └── package.json
│
└── renderer-canvas/         # Canvas 渲染器 ✅
    ├── src/
    │   └── CanvasRenderer.ts
    └── package.json
```

## 🔄 下一步开发任务

按照优先级排序：

### Phase 1: 坐标系统 (2-3 天)
- [ ] 实现笛卡尔坐标系
- [ ] 实现极坐标系
- [ ] 坐标系布局计算

### Phase 2: 比例尺系统 (2-3 天)
- [ ] 线性比例尺 (Linear Scale)
- [ ] 对数比例尺 (Log Scale)
- [ ] 时间比例尺 (Time Scale)
- [ ] 分类比例尺 (Band Scale)

### Phase 3: 基础组件 (1 周)
- [ ] 坐标轴组件 (Axis)
- [ ] 图例组件 (Legend)
- [ ] 提示框组件 (Tooltip)
- [ ] 网格组件 (Grid)

### Phase 4: 第一个图表类型 (3-4 天)
- [ ] 折线图 (Line Chart)
- [ ] 数据处理
- [ ] 路径生成
- [ ] 动画效果

### Phase 5: 更多图表类型 (持续)
- [ ] 柱状图 (Bar Chart)
- [ ] 饼图 (Pie Chart)
- [ ] 散点图 (Scatter Chart)

## 💡 开发建议

### 1. 遵循架构设计

参考以下文档：
- `ARCHITECTURE.md` - 整体架构设计
- `TECHNICAL_DETAILS.md` - 技术实现细节
- `GETTING_STARTED.md` - 开发指南

### 2. 代码规范

- 使用 TypeScript 严格模式
- 遵循命名规范（见 GETTING_STARTED.md）
- 编写 JSDoc 注释
- 添加单元测试

### 3. 测试驱动开发

为每个新功能编写测试：

```typescript
// 示例：比例尺测试
import { describe, it, expect } from 'vitest'
import { LinearScale } from '../scale/LinearScale'

describe('LinearScale', () => {
  it('should map value correctly', () => {
    const scale = new LinearScale({
      domain: [0, 100],
      range: [0, 500]
    })
    
    expect(scale.map(50)).toBe(250)
  })
})
```

### 4. 渐进式开发

1. 先实现最简单的功能
2. 确保测试通过
3. 逐步添加特性
4. 保持代码整洁

## 🧪 测试命令

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test:watch

# 类型检查
pnpm type-check

# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

## 📝 提交规范

使用约定式提交（Conventional Commits）：

```bash
feat: 添加折线图实现
fix: 修复坐标轴刻度计算问题
docs: 更新 API 文档
test: 添加比例尺单元测试
refactor: 重构渲染器接口
perf: 优化大数据量渲染性能
```

## 🐛 调试技巧

### 1. 使用 Source Maps

开发模式下会生成 source maps，可以直接在浏览器中调试 TypeScript 代码。

### 2. 控制台日志

```typescript
import { Chart } from '@ldesign/chart-core'

const chart = new Chart('#container')

// 监听事件进行调试
chart.on('rendered', () => {
  console.log('图表渲染完成')
})
```

### 3. VSCode 调试配置

创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Run Tests",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["test"],
      "console": "integratedTerminal"
    }
  ]
}
```

## 📚 参考资源

- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vite 文档](https://vitejs.dev/)
- [Vitest 文档](https://vitest.dev/)
- [Canvas API 文档](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [ECharts 源码](https://github.com/apache/echarts)
- [D3.js 文档](https://d3js.org/)

## 🤝 需要帮助？

- 查看 `ARCHITECTURE.md` 了解架构设计
- 查看 `TECHNICAL_DETAILS.md` 了解技术细节
- 查看 `GETTING_STARTED.md` 了解开发规范
- 在项目中搜索 TODO 注释查看待办事项

## 🎯 项目目标

打造一个：
- 🚀 高性能的图表库
- 🎨 支持多渲染引擎
- 📊 提供丰富的图表类型
- 🎭 灵活的主题系统
- 🔌 强大的插件机制
- 🎯 完整的 TypeScript 支持

---

**现在就开始开发吧！** 🎉