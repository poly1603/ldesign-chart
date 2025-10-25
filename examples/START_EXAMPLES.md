# 启动示例项目指南

## Vue 示例启动

### 方法 1：使用 pnpm（推荐）
```bash
cd libraries/chart/examples/vue-example
pnpm dev
```

### 方法 2：使用 npm
```bash
cd libraries/chart/examples/vue-example
npm run dev
```

### 方法 3：直接使用 vite
```bash
cd libraries/chart/examples/vue-example
npx vite
```

访问地址：`http://localhost:9000`

## React 示例启动

### 方法 1：使用 pnpm（推荐）
```bash
cd libraries/chart/examples/react-example
pnpm dev
```

### 方法 2：使用 npm
```bash
cd libraries/chart/examples/react-example
npm run dev
```

### 方法 3：直接使用 vite
```bash
cd libraries/chart/examples/react-example
npx vite
```

访问地址：`http://localhost:5173`

## 注意事项

1. **确保已构建父包**
   ```bash
   cd libraries/chart
   pnpm build
   ```

2. **确保依赖已安装**
   ```bash
   cd libraries/chart/examples/vue-example
   pnpm install
   ```

3. **检查端口占用**
   - Vue 示例默认端口：9000
   - React 示例默认端口：5173
   - 如果端口被占用，Vite 会自动使用下一个可用端口

## 功能验证清单

### Vue 示例应显示：
- ✅ 折线图、柱状图、饼图
- ✅ 多系列折线图、散点图、雷达图
- ✅ 大数据虚拟渲染示例
- ✅ 主题切换按钮
- ✅ 字体大小调整按钮
- ✅ 性能统计面板

### React 示例应显示：
- ✅ 所有 Vue 示例的图表
- ✅ 瀑布图
- ✅ 仪表盘
- ✅ 热力图
- ✅ K线图
- ✅ 混合图表
- ✅ 实时数据更新

## 故障排除

### 问题1：模块未找到
**解决方案**：重新构建父包
```bash
cd libraries/chart
pnpm build
```

### 问题2：端口被占用
**解决方案**：使用不同的端口
```bash
npx vite --port 9001
```

### 问题3：依赖缺失
**解决方案**：重新安装
```bash
cd libraries/chart/examples/vue-example
rm -rf node_modules
pnpm install
```



