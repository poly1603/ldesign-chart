# @ldesign/chart 双引擎架构实施进度

**开始时间**: 2025-10-24  
**当前状态**: 🚧 进行中  
**完成度**: 60%

---

## ✅ 已完成任务

### 阶段1：修复和验证现有实现 (100%)

- ✅ 修复 rollup 构建配置
  - 添加 Vue 插件支持
  - 添加 PostCSS 处理
  - 调整 Vue 适配器为源码导出（由用户项目编译）
  - 成功构建核心库、React 和 Lit 适配器
  
- ✅ package.json 配置更新
  - 添加 `type: "module"`
  - 更新 exports 配置
  - 将 src 目录添加到 files 字段

- ✅ 验证构建成功
  - 核心库构建成功
  - React 适配器构建成功
  - Lit 适配器构建成功
  - Vue 适配器通过源码导出

### 阶段2：设计引擎抽象层 (100%)

- ✅ 创建引擎接口定义 (`src/engines/base/engine-interface.ts`)
  - `ChartEngine` 接口
  - `EngineInstance` 接口
  - `ConfigAdapter` 接口
  - `ChartFeature` 枚举
  - `UniversalChartConfig` 通用配置类型
  
- ✅ 创建配置适配器基类 (`src/engines/base/config-adapter.ts`)
  - `BaseConfigAdapter` 抽象类
  - 提供通用配置提取方法
  - 实现配置合并逻辑
  - 支持暗黑模式和字体大小应用

- ✅ 创建引擎管理器 (`src/engines/engine-manager.ts`)
  - `EngineManager` 类
  - 引擎注册和选择机制
  - 支持策略模式选择引擎
  - 特性检测和智能选择

### 阶段3：集成 ECharts 引擎 (100%)

- ✅ ECharts 引擎实现 (`src/engines/echarts/echarts-engine.ts`)
  - 实现 `ChartEngine` 接口
  - 包装 ECharts 实例
  - 支持特性检测
  - 异步初始化

- ✅ ECharts 配置适配器 (`src/engines/echarts/echarts-adapter.ts`)
  - 继承 `BaseConfigAdapter`
  - 实现通用配置到 ECharts 配置的转换
  - 集成现有数据解析器和图表生成器

- ✅ 导出配置
  - 创建模块导出文件
  - 更新主入口文件

---

## 🚧 进行中任务

### 阶段4：集成 VChart 引擎 (10%)

- ✅ 添加 VChart 依赖到 package.json
  - peerDependencies: `@visactor/vchart: ^1.0.0`
  - 设置为可选依赖

- ⏳ VChart 引擎实现 (`src/engines/vchart/vchart-engine.ts`)
  - 待实现

- ⏳ VChart 配置适配器 (`src/engines/vchart/vchart-adapter.ts`)
  - 待实现

- ⏳ VChart 特定图表类型生成器
  - 3D 图表
  - 旭日图
  - 树图
  - 桑基图
  - 水球图
  - 词云图

---

## 📋 待办任务

### 阶段5：小程序支持 (0%)

- ⏳ 微信小程序适配器
- ⏳ 支付宝小程序适配器
- ⏳ Taro 跨平台适配器

### 阶段6：框架适配器更新 (0%)

- ⏳ 更新 Vue 适配器支持引擎选择
- ⏳ 更新 React 适配器支持引擎选择
- ⏳ 更新 Lit 适配器支持引擎选择

### 阶段7：示例和文档 (0%)

- ⏳ ECharts vs VChart 对比示例
- ⏳ 小程序示例（微信/支付宝）
- ⏳ 3D 图表示例
- ⏳ 引擎选择指南
- ⏳ API 文档更新
- ⏳ 小程序开发指南

### 阶段8：测试和优化 (0%)

- ⏳ 单元测试
- ⏳ 集成测试
- ⏳ 性能基准测试
- ⏳ 打包体积优化

---

## 📊 技术架构

### 文件结构

```
src/
├── engines/
│   ├── base/
│   │   ├── engine-interface.ts  ✅ 引擎接口定义
│   │   ├── config-adapter.ts    ✅ 配置适配器基类
│   │   └── index.ts             ✅ 导出
│   ├── echarts/
│   │   ├── echarts-engine.ts    ✅ ECharts 引擎实现
│   │   ├── echarts-adapter.ts   ✅ ECharts 配置适配器
│   │   └── index.ts             ✅ 导出
│   ├── vchart/
│   │   ├── vchart-engine.ts     ⏳ VChart 引擎实现
│   │   ├── vchart-adapter.ts    ⏳ VChart 配置适配器
│   │   ├── vchart-loader.ts     ⏳ VChart 动态加载器
│   │   └── index.ts             ⏳ 导出
│   ├── engine-manager.ts        ✅ 引擎管理器
│   └── index.ts                 ✅ 总导出
├── core/
│   └── chart.ts                 ⏳ 需重构使用引擎抽象
└── ... (其他现有文件)
```

### 核心概念

1. **引擎抽象** (`ChartEngine`):
   - 统一的引擎接口
   - 支持多种图表引擎（ECharts, VChart）
   - 特性检测机制

2. **配置适配器** (`ConfigAdapter`):
   - 通用配置 → 引擎特定配置
   - 可逆转换（可选）
   - 继承基类减少重复代码

3. **引擎管理器** (`EngineManager`):
   - 引擎注册和管理
   - 智能引擎选择
   - 策略模式支持

4. **特性检测** (`ChartFeature`):
   - 小程序支持
   - Web Worker
   - 虚拟渲染
   - 3D 图表
   - 数据故事模式
   - SSR

---

## 🎯 下一步行动

1. **完成 VChart 引擎实现** (优先级：高)
   - 实现 `VChartEngine` 类
   - 实现 `VChartConfigAdapter` 类
   - 创建 VChart 加载器

2. **重构核心 Chart 类** (优先级：高)
   - 使用引擎抽象层
   - 支持引擎选择
   - 保持向后兼容

3. **添加小程序支持** (优先级：中)
   - 微信小程序适配
   - 支付宝小程序适配

4. **创建示例和文档** (优先级：中)
   - 双引擎对比示例
   - 使用文档
   - 迁移指南

---

## 🔥 关键成就

1. ✅ **成功修复构建系统**
   - 解决 Vue SFC 编译问题
   - 优化构建配置

2. ✅ **设计完整的引擎抽象层**
   - 灵活的接口设计
   - 支持多引擎扩展

3. ✅ **实现 ECharts 引擎**
   - 完整的引擎包装
   - 配置适配器

4. ✅ **引擎管理系统**
   - 智能选择机制
   - 特性检测

---

## 📝 注意事项

1. **向后兼容性**
   - 现有 ECharts 用法保持不变
   - 新增引擎选择为可选功能

2. **按需加载**
   - VChart 为可选依赖
   - 只在使用时加载

3. **性能影响**
   - 抽象层开销最小化
   - 保持现有性能优化

4. **文档完整性**
   - 提供清晰的迁移路径
   - 详细的引擎选择指南

---

**最后更新**: 2025-10-24


