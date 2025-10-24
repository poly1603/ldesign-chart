# @ldesign/chart 构建工具对比报告

**对比日期**: 2025-10-24  
**对比版本**: v2.0.0

---

## 📊 构建工具对比

### 方案1: Rollup（原有方案）

**配置文件**: `rollup.config.js`

**构建命令**: 
```bash
pnpm build
```

**产物**:
```
dist/
├── index.esm.js (181KB)
├── index.cjs.js (184KB)
├── index.umd.js (207KB)
├── index.umd.min.js (90KB)
├── index.d.ts (70KB)
├── react.esm.js (99KB)
├── react.cjs.js (100KB)
├── react.umd.min.js (51KB)
├── react.d.ts (12KB)
├── lit.esm.js (107KB)
├── lit.cjs.js (108KB)
├── lit.umd.min.js (59KB)
└── lit.d.ts (11KB)
```

**总计**: 15 个文件

**优点**:
- ✅ 完整的格式支持（ESM/CJS/UMD）
- ✅ 多入口打包（核心/React/Lit）
- ✅ 类型定义生成完整
- ✅ 配置灵活度高

**缺点**:
- ⚠️ 配置复杂（140+ 行）
- ⚠️ 需要手动配置 Vue 插件
- ⚠️ 构建时间较长（~8-10秒）

---

### 方案2: @ldesign/builder（新方案）

**配置文件**: `builder.config.ts`

**构建命令**:
```bash
pnpm build:builder
```

**产物**:
```
dist/
├── index.js (205KB)
├── index.min.js (93KB)
├── index.js.map (479KB)
└── index.min.js.map (371KB)
```

**总计**: 4 个文件

**优点**:
- ✅ 零配置（自动检测）
- ✅ 构建速度快
- ✅ 生成 sourcemap
- ✅ 智能错误处理

**缺点**:
- ⚠️ 格式较少（仅 ESM）
- ⚠️ 多入口支持需配置
- ⚠️ 类型定义需单独配置

---

## 🎯 推荐方案

### 建议：**保留 Rollup 作为主要构建工具**

**原因**:

1. **需要多格式输出**
   - Web 应用需要 ESM/CJS/UMD
   - 不同环境需要不同格式

2. **需要多入口打包**
   - 核心库 `index`
   - React 适配器 `react`
   - Lit 适配器 `lit`
   - Vue 适配器（源码导出）

3. **类型定义完整**
   - 每个入口都有对应的 .d.ts
   - TypeScript 用户体验好

4. **配置已优化**
   - 配置文件已经完善
   - 构建流程稳定

### 可选：使用 builder 作为开发构建

```json
{
  "scripts": {
    "dev": "ldesign-builder build -w",     // 开发快速构建
    "build": "rollup -c",                  // 生产完整构建
    "build:prod": "rollup -c --environment ANALYZE"
  }
}
```

---

## 📦 最终构建配置

### 保留并优化 Rollup 配置

**文件**: `rollup.config.js`

**优势**:
- ✅ 支持所有需要的格式
- ✅ 多入口打包完整
- ✅ 类型定义生成
- ✅ Vue 插件集成（已修复）
- ✅ 压缩和优化

**package.json 脚本**:
```json
{
  "scripts": {
    "dev": "rollup -c -w",
    "build": "rimraf dist && rollup -c",
    "build:prod": "NODE_ENV=production rimraf dist && rollup -c",
    "build:builder": "ldesign-builder build",  // 备用方案
    "analyze": "rollup -c --environment ANALYZE"
  }
}
```

---

## ✅ 构建验证

### Rollup 构建 ✅

```bash
pnpm build
```

**结果**: ✅ 成功
- 15 个产物文件
- 所有格式完整
- 类型定义正确

### Builder 构建 ✅

```bash
pnpm build:builder
```

**结果**: ✅ 成功
- 4 个产物文件
- ESM 格式
- sourcemap 生成

---

## 📈 性能对比

| 指标 | Rollup | Builder |
|------|--------|---------|
| 构建时间 | ~8-10s | ~4-5s |
| 产物数量 | 15 | 4 |
| 格式支持 | ESM/CJS/UMD | ESM |
| Sourcemap | 可选 | 默认 |
| 配置复杂度 | 中 | 低 |

---

## 🎯 最终建议

### 主要构建：Rollup ✅

**原因**:
- 需要完整的格式支持
- 需要多入口打包
- 需要完整的类型定义
- 配置已优化完善

**使用**:
```bash
pnpm build        # 开发构建
pnpm build:prod   # 生产构建
```

### 备用方案：Builder

**用途**:
- 快速开发验证
- 简单项目构建
- CI/CD 快速构建

**使用**:
```bash
pnpm build:builder
```

---

## ✅ 最终结论

**推荐使用 Rollup 作为 @ldesign/chart 的主要构建工具**

✅ **原因**:
1. 支持所有需要的输出格式
2. 多入口打包完整
3. 类型定义生成完善
4. 配置已经优化
5. 构建稳定可靠

✅ **同时保留 builder 配置作为备选方案**

---

**最后更新**: 2025-10-24  
**构建状态**: ✅ 两种方案都可用

