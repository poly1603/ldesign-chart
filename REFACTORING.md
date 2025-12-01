# 架构重构说明

## 重构时间
2024-11-29

## 重构目标
简化项目架构，将 Canvas 渲染器从独立包合并到核心包中。

## 重构原因

### 1. 实用性考虑
- **Canvas 是默认渲染器** - 99% 的使用场景都需要 Canvas 渲染
- **减少依赖管理** - 用户只需安装一个包即可使用完整功能
- **简化开发流程** - 减少包之间的依赖关系和构建复杂度

### 2. 架构问题
- **过早优化** - SVG 和 WebGL 渲染器尚未实现，分离包没有实际价值
- **增加复杂度** - Monorepo 包管理、类型定义、构建流程都变复杂
- **用户体验** - 需要安装两个包才能使用基础功能

## 重构内容

### 1. 包结构变化

**重构前：**
```
packages/
├── core/                    # 核心库
│   ├── src/
│   │   ├── renderer/
│   │   │   └── interface.ts # 渲染器接口
│   │   └── ...
│   └── package.json
└── renderer-canvas/         # Canvas 渲染器（独立包）
    ├── src/
    │   ├── CanvasRenderer.ts
    │   └── index.ts
    └── package.json
```

**重构后：**
```
packages/
└── core/                    # 核心库（包含 Canvas 渲染器）
    ├── src/
    │   ├── renderer/
    │   │   ├── interface.ts      # 渲染器接口
    │   │   └── CanvasRenderer.ts # Canvas 实现
    │   └── ...
    └── package.json
```

### 2. 代码变更

#### 移动文件
- `packages/renderer-canvas/src/CanvasRenderer.ts` → `packages/core/src/renderer/CanvasRenderer.ts`

#### 更新导入
**packages/core/src/renderer/CanvasRenderer.ts:**
```typescript
// 修改前
import type { ... } from '@ldesign/chart-core'

// 修改后
import type { ... } from './interface'
```

#### 更新导出
**packages/core/src/index.ts:**
```typescript
// 新增
export { CanvasRenderer } from './renderer/CanvasRenderer'
```

**packages/core/src/renderer/interface.ts:**
```typescript
// 新增
export type { Rect } from '../types'
```

### 3. 构建配置优化

**packages/core/vite.config.ts:**
```typescript
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      outDir: 'dist',
      rollupTypes: true, // 合并类型定义文件
    }),
  ],
  // ...
})
```

**packages/core/package.json:**
```json
{
  "scripts": {
    "build": "vite build" // 移除 tsc 命令，使用 vite-plugin-dts
  },
  "devDependencies": {
    "vite-plugin-dts": "^4.5.4" // 新增依赖
  }
}
```

### 4. 文档更新

**README.md:**
```typescript
// 修改前
import { Chart } from '@ldesign/chart-core'
import { CanvasRenderer } from '@ldesign/chart-renderer-canvas'

// 修改后
import { Chart, CanvasRenderer } from '@ldesign/chart-core'
```

## 重构结果

### 1. 包体积
- **核心包大小**: 73.70 kB (gzip: 13.44 kB)
- **类型定义**: 完整的 TypeScript 类型支持
- **构建产物**: 
  - `dist/index.js` - ESM 模块
  - `dist/index.d.ts` - 类型定义
  - `dist/index.js.map` - Source Map

### 2. 用户体验改善

**安装简化：**
```bash
# 修改前
pnpm add @ldesign/chart-core @ldesign/chart-renderer-canvas

# 修改后
pnpm add @ldesign/chart-core
```

**导入简化：**
```typescript
// 修改前
import { Chart } from '@ldesign/chart-core'
import { CanvasRenderer } from '@ldesign/chart-renderer-canvas'

// 修改后
import { Chart, CanvasRenderer } from '@ldesign/chart-core'
```

### 3. 开发体验改善
- ✅ 减少包管理复杂度
- ✅ 简化构建流程
- ✅ 减少类型定义问题
- ✅ 更快的构建速度

## 未来扩展

### 可选渲染器包
当 SVG 或 WebGL 渲染器实现时，可以作为可选包提供：

```
packages/
├── core/                    # 核心库 + Canvas 渲染器
├── renderer-svg/            # SVG 渲染器（可选）
└── renderer-webgl/          # WebGL 渲染器（可选）
```

用户可以根据需求安装：
```bash
# 基础使用（Canvas）
pnpm add @ldesign/chart-core

# 需要 SVG 渲染
pnpm add @ldesign/chart-core @ldesign/chart-renderer-svg

# 需要 WebGL 渲染（大数据场景）
pnpm add @ldesign/chart-core @ldesign/chart-renderer-webgl
```

## 技术要点

### 1. vite-plugin-dts 插件
使用 `vite-plugin-dts` 替代 `tsc --emitDeclarationOnly`：
- ✅ 自动生成类型定义文件
- ✅ 支持类型定义合并（rollupTypes）
- ✅ 更好的 Vite 集成
- ✅ 自动处理类型导出

### 2. 类型导出处理
需要重新导出 `Rect` 类型，避免"未导出"错误：
```typescript
// renderer/interface.ts
export type { Rect } from '../types'
```

### 3. ESLint 配置
对于工具函数中的类型安全问题，使用适当的 eslint-disable 注释：
```typescript
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
target[key] = merge({ ...targetValue }, sourceValue as any)
```

## 总结

这次重构遵循了"实用主义优于完美主义"的原则：

1. **简化用户体验** - 一个包就能使用完整功能
2. **减少维护成本** - 更少的包意味着更少的维护工作
3. **保持扩展性** - 未来仍可添加可选渲染器包
4. **提升开发效率** - 简化的构建流程和依赖管理

重构后的架构更加实用，同时保持了良好的扩展性，为后续开发打下了坚实的基础。