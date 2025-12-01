# Core Basic Demo - @ldesign/chart-core

这是 `@ldesign/chart-core` 核心包的基础演示项目，展示主题系统和动画系统的功能。

## 功能展示

- ✅ **主题系统** - 主题注册、切换和颜色管理
- ✅ **属性动画** - 各种缓动函数的动画效果
- ✅ **关键帧动画** - 多属性关键帧动画

## 开发

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

开发服务器将在 http://localhost:5173 启动

### 构建

```bash
pnpm build
```

### 预览构建结果

```bash
pnpm preview
```

## 技术特点

- **Vite 别名配置** - 使用 alias 直接指向 core/src 源代码
- **实时开发** - 修改源代码即时反映到演示
- **TypeScript** - 完整类型支持

## 项目结构

```
basic/
├── index.html       # HTML 模板
├── main.ts          # 演示代码
├── package.json     # 项目配置
├── vite.config.ts   # Vite 配置（含 alias）
└── README.md        # 本文档
```

## Vite 配置说明

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@ldesign/chart-core': resolve(__dirname, '../../src')
    }
  }
})
```

这样可以直接从源代码导入：
```typescript
import { ThemeManager } from '@ldesign/chart-core/theme/ThemeManager'
```

## 了解更多

- [@ldesign/chart-core 文档](../../README.md)
- [主题系统文档](../../src/theme/README.md)
- [动画系统文档](../../src/animation/README.md)