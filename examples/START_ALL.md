# 启动所有示例项目

本文档说明如何启动所有示例项目。

## 前置条件

1. 确保已安装依赖：
```bash
# 在项目根目录
cd libraries/chart
pnpm install
```

2. 构建所有包：
```bash
# 构建核心包和适配器
pnpm build
```

## 启动示例

### 方法一：分别启动（推荐开发时使用）

#### 1. 启动 Vanilla JavaScript 示例

```bash
cd examples/vanilla-example
pnpm dev
```

访问: `http://localhost:9002`

#### 2. 启动 Vue 3 示例

```bash
cd examples/vue-example
pnpm dev
```

访问: `http://localhost:9000`

#### 3. 启动 React 示例

```bash
cd examples/react-example
pnpm dev
```

访问: `http://localhost:9001`

### 方法二：同时启动所有示例（Windows）

在项目根目录运行：

```powershell
# PowerShell
.\examples\start-all.ps1
```

或：

```cmd
# CMD
.\examples\start-all.bat
```

### 方法三：同时启动所有示例（Linux/Mac）

```bash
./examples/start-all.sh
```

## 端口说明

- **Vanilla JS**: `http://localhost:9002`
- **Vue 3**: `http://localhost:9000`
- **React**: `http://localhost:9001`

## 开发说明

### 实时预览

所有示例项目都配置了 alias，指向源码目录：

- `@ldesign/chart-core` → `../../packages/core/es/index.js`
- `@ldesign/chart-vue` → `../../packages/vue/es/index.js`
- `@ldesign/chart-react` → `../../packages/react/es/index.js`

修改源码后，示例项目会自动热更新。

### 构建示例

```bash
# 构建单个示例
cd examples/vanilla-example
pnpm build

# 构建所有示例
cd ../..
pnpm -r --filter './examples/*' build
```

## 故障排除

### 问题 1：端口被占用

修改对应示例的 `vite.config.ts` 中的端口号。

### 问题 2：模块未找到

确保已经构建了所有包：

```bash
cd libraries/chart
pnpm build
```

### 问题 3：类型错误

确保所有包的 TypeScript 配置正确：

```bash
pnpm -r tsc --noEmit
```

## 特性演示

### Vanilla JavaScript 示例
- ✅ 多种图表类型切换
- ✅ 实时数据更新
- ✅ 主题切换
- ✅ 引擎切换（ECharts/VChart）
- ✅ 性能测试（1000+ 数据点）
- ✅ 图表导出

### Vue 3 示例
- ✅ Vue 组件化使用
- ✅ 响应式数据绑定
- ✅ Composition API
- ✅ 双引擎切换
- ✅ 暗黑模式

### React 示例
- ✅ React Hooks
- ✅ 性能优化
- ✅ TypeScript 类型支持
- ✅ 双引擎支持
- ✅ 现代化 UI

## 更多信息

- [核心库文档](../packages/core/README.md)
- [Vue 适配器文档](../packages/vue/README.md)
- [React 适配器文档](../packages/react/README.md)
- [项目主页](../README.md)

