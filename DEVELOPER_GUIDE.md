# 开发者指南

## 开发环境设置

### 前置要求

- Node.js >= 16.0.0
- pnpm >= 8.0.0
- Git

### 克隆仓库

```bash
git clone https://github.com/ldesign/chart.git
cd chart
```

### 安装依赖

```bash
pnpm install
```

## 项目结构

```
chart/
├── packages/           # 子包目录
│   ├── core/          # 核心库
│   ├── vue/           # Vue 适配器
│   ├── react/         # React 适配器
│   ├── angular/       # Angular 适配器
│   ├── svelte/        # Svelte 适配器
│   ├── solid/         # Solid.js 适配器
│   ├── qwik/          # Qwik 适配器
│   └── lit/           # Lit 适配器
├── docs/              # VitePress 文档
├── demos/             # 演示项目
├── benchmarks/        # 性能测试
├── scripts/           # 构建和工具脚本
└── src/               # 旧版源码（保留用于参考）
```

## 开发工作流

### 1. 开发单个包

```bash
# 开发 core 包
cd packages/core
pnpm dev

# 或者从根目录
pnpm --filter @ldesign/chart-core dev
```

### 2. 构建

```bash
# 构建所有包
pnpm build

# 或使用增强版构建脚本（带验证）
pnpm build:all

# 构建单个包
pnpm build:core
pnpm build:vue
pnpm build:react
# ...
```

### 3. 代码质量检查

```bash
# Lint 检查
pnpm lint

# Lint 并自动修复
pnpm lint:fix

# 使用增强版 lint 脚本
pnpm lint:all
node scripts/lint-all.js --fix

# TypeScript 类型检查
pnpm typecheck

# 完整验证（lint + typecheck + build）
pnpm validate
```

### 4. 测试

```bash
# 运行所有测试
pnpm test

# 运行单个包的测试
pnpm --filter @ldesign/chart-core test

# 测试覆盖率
pnpm test:coverage

# 性能测试
pnpm --filter @ldesign/chart-core test:bench
```

### 5. 文档

```bash
# 启动文档开发服务器
pnpm docs:dev

# 构建文档
pnpm docs:build

# 预览文档
pnpm docs:preview
```

## 创建新的框架适配器

### 步骤

1. **创建包目录**

```bash
mkdir -p packages/your-framework
cd packages/your-framework
```

2. **创建 package.json**

```json
{
  "name": "@ldesign/chart-your-framework",
  "version": "2.0.0",
  "description": "企业级图表 YourFramework 适配器",
  "type": "module",
  "main": "./lib/index.cjs",
  "module": "./es/index.js",
  "types": "./es/index.d.ts",
  "exports": {
    ".": {
      "types": "./es/index.d.ts",
      "import": "./es/index.js",
      "require": "./lib/index.cjs"
    }
  },
  "scripts": {
    "build": "ldesign-builder build",
    "dev": "ldesign-builder build --watch",
    "clean": "rimraf es lib",
    "lint": "eslint .",
    "test": "vitest"
  },
  "dependencies": {
    "@ldesign/chart-core": "workspace:*"
  },
  "peerDependencies": {
    "your-framework": "^x.x.x",
    "echarts": "^5.4.0"
  },
  "devDependencies": {
    "@antfu/eslint-config": "^6.0.0",
    "@ldesign/builder": "workspace:*",
    "eslint": "^9.18.0",
    "typescript": "^5.3.3",
    "vitest": "^1.2.1"
  }
}
```

3. **创建构建配置 `builder.config.ts`**

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    formats: ['es', 'cjs'],
    dir: {
      es: 'es',
      cjs: 'lib',
    },
  },
  external: ['your-framework', 'echarts'],
  dts: {
    enabled: true,
  },
})
```

4. **创建 ESLint 配置 `eslint.config.js`**

```javascript
import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  // 根据框架添加相应配置
  formatters: true,
  ignores: ['es', 'lib', 'dist', 'node_modules'],
})
```

5. **创建 TypeScript 配置 `tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./es",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "es", "lib", "**/*.spec.ts"]
}
```

6. **实现适配器组件**

创建 `src/` 目录并实现框架特定的组件。

7. **编写测试**

创建 `src/__tests__/` 目录并添加测试。

8. **编写文档**

创建 `README.md` 说明如何使用该适配器。

9. **更新根配置**

在根 `package.json` 添加构建脚本：

```json
{
  "scripts": {
    "build:your-framework": "pnpm --filter @ldesign/chart-your-framework build"
  }
}
```

## 代码规范

### TypeScript

- 使用严格模式
- 为所有公共 API 提供类型定义
- 避免使用 `any`，优先使用 `unknown`
- 使用接口而非类型别名（公共 API）

### 命名规范

- 组件: PascalCase (如 `Chart`, `ChartComponent`)
- 函数: camelCase (如 `createChart`, `updateData`)
- 常量: UPPER_SNAKE_CASE (如 `DEFAULT_CONFIG`)
- 文件: kebab-case (如 `chart-component.ts`)

### 提交规范

使用 Conventional Commits:

```
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式化
refactor: 重构代码
perf: 性能优化
test: 添加测试
chore: 构建/工具变更
```

示例:
```
feat(angular): 添加 Angular 适配器
fix(core): 修复内存泄漏问题
docs: 更新快速开始指南
```

## 性能优化

### 关键指标

- 首次渲染时间 < 100ms
- 数据更新延迟 < 16ms (60 FPS)
- 内存占用增长 < 1MB/1000 数据点
- 包体积 < 50KB (gzip)

### 优化技巧

1. **使用虚拟渲染** - 大数据集场景
2. **启用 Web Worker** - CPU 密集型计算
3. **智能缓存** - 避免重复计算
4. **对象池** - 减少 GC 压力
5. **按需加载** - 使用 dynamic import

## 调试技巧

### Chrome DevTools

1. **Performance** - 分析渲染性能
2. **Memory** - 检测内存泄漏
3. **Coverage** - 查看代码使用情况

### 性能分析

```typescript
// 启用性能监控
import { performanceMonitor } from '@ldesign/chart-core'

performanceMonitor.mark('start')
// ... 你的代码
const duration = performanceMonitor.measure('operation', 'start')
console.log(`耗时: ${duration}ms`)
```

### 内存分析

```typescript
// 启用内存监控
import { chartCache } from '@ldesign/chart-core'

console.log('缓存大小:', chartCache.size)
console.log('缓存统计:', chartCache.getStats())
```

## 发布流程

### 版本管理

使用 Semantic Versioning:
- MAJOR: 破坏性变更
- MINOR: 新功能（向后兼容）
- PATCH: Bug 修复

### 发布步骤

1. **更新版本号**

```bash
# 更新所有包版本
pnpm -r version patch|minor|major
```

2. **构建和测试**

```bash
pnpm validate
pnpm test
```

3. **生成变更日志**

```bash
pnpm run changelog
```

4. **发布到 npm**

```bash
pnpm -r publish --access public
```

5. **创建 Git 标签**

```bash
git tag -a v2.0.0 -m "Release v2.0.0"
git push --tags
```

## 常见问题

### Q: 如何修复依赖安装问题？

A: 尝试以下步骤：
1. 删除 `node_modules` 和 `pnpm-lock.yaml`
2. 以管理员权限运行 PowerShell
3. 运行 `pnpm install`

### Q: 构建失败怎么办？

A: 
1. 检查 TypeScript 错误: `pnpm typecheck`
2. 检查 ESLint 错误: `pnpm lint`
3. 清理并重新构建: `pnpm clean && pnpm build`

### Q: 如何调试特定框架的问题？

A:
1. 进入对应的包目录
2. 查看 `src/` 源代码
3. 运行 `pnpm dev` 监听文件变化
4. 在 demos 中测试

## 获取帮助

- GitHub Issues: 报告 bug
- GitHub Discussions: 提问和讨论
- 文档: 查看 docs/
- 示例: 查看 demos/

## 贡献指南

1. Fork 仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交改动 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

确保你的 PR:
- 通过所有测试
- 包含适当的文档
- 遵循代码规范
- 有清晰的提交信息

## License

MIT
