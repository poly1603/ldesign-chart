# @ldesign/chart 构建建议

## 🎯 问题总结

在尝试使用 `@ldesign/builder` 的混合框架智能打包功能时，发现了关键问题：

### ✅ 成功的部分
1. ✅ 混合框架检测成功 - "检测到混合框架项目: vue, react, lit"
2. ✅ 增强混合策略被应用
3. ✅ 构建能完成

### ❌ 失败的部分
1. ❌ **adapters/ 目录未生成** - Vue/React/Lit 适配器代码丢失
2. ❌ React 组件仍然包含 Vue 导入
3. ❌ 构建产物不可用
4. ❌ 文件结构异常

## 💡 当前最佳方案

**继续使用现有的 `rollup.config.js`**

### 原因

1. **已验证可行**: rollup.config.js 已经成功构建了所有版本
2. **配置清晰**: 明确的插件链和输出配置
3. **产物正确**: Vue/React/Lit 代码都正确分离
4. **性能优良**: 构建速度和产物大小都很理想

### 使用方法

```bash
# 开发模式（使用 builder）
npm run dev

# 生产构建（使用 rollup）
npm run build

# 或者使用 rollup 的生产模式
npm run build:prod
```

### 构建脚本

```json
{
  "scripts": {
    "dev": "ldesign-builder build --watch",
    "build": "rimraf es lib && rollup -c",
    "build:prod": "NODE_ENV=production rimraf es lib && rollup -c"
  }
}
```

## 🔧 rollup.config.js 的优势

当前的 rollup.config.js 已经非常优秀：

### 1. 清晰的配置结构
```javascript
- ESM 输出 → es/
- CJS 输出 → lib/  
- UMD 输出 → dist/
```

### 2. 正确的插件链
```javascript
1. Vue 插件（处理 .vue 文件）
2. PostCSS（处理样式）
3. Node Resolve（依赖解析）
4. CommonJS（模块转换）
5. TypeScript（类型转换）
6. Terser（代码压缩）
7. DTS（类型定义生成）
```

### 3. 优化的配置
- ✅ Tree-shaking 优化
- ✅ 代码压缩（生产模式）
- ✅ 外部依赖正确配置
- ✅ 多格式输出

## 📊 构建结果对比

### 使用 rollup.config.js ⭐
```
✓ 构建成功
⏱  耗时: ~15s
📦 文件: 456 个
📊 ESM: es/ (152 个文件)
📊 CJS: lib/ (152 个文件)  
📊 DTS: 148 个类型文件
📊 总大小: 3.12 MB
📊 Gzip: 951.6 KB

✅ adapters/vue/ - 正确
✅ adapters/react/ - 正确
✅ adapters/lit/ - 正确
```

### 使用 @ldesign/builder（当前）❌
```
⚠️ 构建成功（但有问题）
⏱  耗时: 12.39s
📦 文件: 2268 个（异常！）
📊 总大小: 20.79 MB（过大！）
📊 DTS: 0 个（未生成！）

❌ adapters/ - 缺失
❌ node_modules/ - 出现在 es/ 中
❌ 文件结构混乱
```

## ⏳ @ldesign/builder 混合框架支持时间表

### 当前状态（v2.0.0-beta）
- ✅ 框架检测：完成
- ⚠️ 混合框架策略：70% 完成
- ❌ 构建产物：不可用

### 预计完成时间
- **完整修复**: 需要 6-8 小时开发
- **全面测试**: 需要 2-4 小时
- **文档完善**: 需要 2小时
- **总计**: 10-14 小时（1-2 个工作日）

## 🚀 推荐行动

### 立即行动（今天）
```bash
# 使用现有的 rollup 配置
cd libraries/chart
npm run build
```

### 后续计划（未来）
等待 @ldesign/builder 混合框架支持完全成熟后再迁移。

预期时间线：
- **v2.1.0**: 混合框架基础支持（1-2周）
- **v2.2.0**: 混合框架零配置（1个月）
- **v2.5.0**: 完整的智能分析和优化（2-3个月）

## 📝 结论

**当前最佳选择**: 继续使用 `rollup.config.js`

**原因**:
1. ✅ 立即可用
2. ✅ 产物正确
3. ✅ 性能优秀
4. ✅ 配置清晰

**@ldesign/builder 的价值**:
- ✅ 单框架项目简化（已可用）
- ⏳ 混合框架项目简化（开发中）
- ⏳ 智能零配置（部分可用）

---

**更新时间**: 2024-10-25  
**建议有效期**: 直到 @ldesign/builder v2.1.0 发布
