
# @ldesign/chart 完善和优化方案

**制定时间**: 2025-12-01  
**目标**: 打造一个全面覆盖常用图表类型、高性能、易用的现代化图表库

---

## 📋 目录

1. [当前状态分析](#当前状态分析)
2. [图表类型完善计划](#图表类型完善计划)
3. [性能优化方案](#性能优化方案)
4. [易用性提升策略](#易用性提升策略)
5. [架构优化建议](#架构优化建议)
6. [实施路线图](#实施路线图)
7. [技术规格说明](#技术规格说明)

---

## 当前状态分析

### ✅ 已有优势

#### 1. **架构设计优秀**
- 清晰的分层架构（渲染层 → 核心层 → 框架适配层）
- 良好的接口抽象（IRenderer, IScale, IComponent）
- 支持多渲染引擎（预留 Canvas/SVG/WebGL）
- 完整的 TypeScript 类型系统

#### 2. **基础功能扎实**
- ✅ 完整的渲染器系统（Canvas 已实现）
- ✅ 比例尺系统（LinearScale, BandScale）
- ✅ 坐标系统（CartesianCoordinate）
- ✅ 事件系统（EventEmitter）
- ✅ 主题系统（default, dark）
- ✅ 动画系统（30+ 缓动函数）
- ✅ 4种图表类型（Line, Bar, Scatter, Area）
- ✅ 4个核心组件（Axis, Legend, Title, Tooltip）

#### 3. **代码质量高**
- TypeScript 严格模式
- 完善的 JSDoc 注释
- 统一的代码风格
- 良好的错误处理

#### 4. **文档完善**
- 详细的架构设计文档
- 技术实现细节文档
- 开发指南和快速开始

### 🔍 待改进之处

#### 1. **图表类型不足**
- ❌ 仅有 4 种基础图表（需要扩展到 20+ 种）
- ❌ 缺少饼图、雷达图等常用类型
- ❌ 缺少统计图表（箱线图、热力图等）
- ❌ 缺少关系图表（树图、桑基图等）
- ❌ 缺少地理图表

#### 2. **性能优化空间**
- ⚠️ 缺少大数据量优化（数据抽样、虚拟化）
- ⚠️ 缺少渲染优化（脏检查、分层渲染）
- ⚠️ 缺少 WebGL 渲染器（百万级数据支持）
- ⚠️ 缺少 Web Worker 数据处理

#### 3. **易用性待提升**
- ⚠️ API 相对底层，需要手动组装
- ⚠️ 缺少预设配置模板
- ⚠️ 缺少响应式配置（配置式图表）
- ⚠️ 框架集成不完善（Vue/React 适配器）

#### 4. **功能缺失**
- ❌ 缺少数据转换器（dataset 支持）
- ❌ 缺少插件系统
- ❌ 缺少导出功能（PNG, SVG, PDF）
- ❌ 缺少数据标签（dataLabel）
- ❌ 缺少缩放和平移（dataZoom）
- ❌ 缺少多坐标系支持

---

## 图表类型完善计划

### 🎯 目标：支持 25+ 种图表类型

### Phase 1: 基础图表扩展 (6种)

#### 1.1 饼图 (PieSeries)
```typescript
interface PieSeriesOption {
  type: 'pie'
  data: Array<{ name: string; value: number }>
  radius: [string | number, string | number] // 内外半径
  roseType?: 'radius' | 'area' // 南丁格尔图
  startAngle?: number
  endAngle?: number
  label?: {
    show: boolean
    position: 'outside' | 'inside' | 'center'
    formatter?: string | Function
  }
  labelLine?: {
    show: boolean
    length?: number
    length2?: number
  }
}
```

**功能特性**:
- 标准饼图
- 环形图（donut）
- 南丁格尔图（玫瑰图）
- 扇区高亮和选中
- 标签引导线
- 百分比自动计算

#### 1.2 雷达图 (RadarSeries)
```typescript
interface RadarSeriesOption {
  type: 'radar'
  data: number[][] // 多维数据
  indicator: Array<{
    name: string
    max: number
    min?: number
  }>
  shape?: 'polygon' | 'circle'
  splitNumber?: number
  areaStyle?: AreaStyle
}
```

**功能特性**:
- 多边形/圆形雷达图
- 多系列对比
- 面积填充
- 自定义轴范围

#### 1.3 漏斗图 (FunnelSeries)
```typescript
interface FunnelSeriesOption {
  type: 'funnel'
  data: Array<{ name: string; value: number }>
  sort?: 'ascending' | 'descending' | 'none'
  gap?: number
  funnelAlign?: 'left' | 'center' | 'right'
  minSize?: string | number
  maxSize?: string | number
}
```

**功能特性**:
- 标准漏斗图
- 金字塔图（倒漏斗）
- 左对齐/右对齐/居中
- 转化率计算

#### 1.4 仪表盘 (GaugeSeries)
```typescript
interface GaugeSeriesOption {
  type: 'gauge'
  data: Array<{ name: string; value: number }>
  min?: number
  max?: number
  splitNumber?: number
  startAngle?: number
  endAngle?: number
  axisLine?: {
    lineStyle: {
      width: number
      color: Array<[number, string]> // 分段颜色
    }
  }
  pointer?: {
    length: string | number
    width: number
  }
  detail?: {
    formatter: string | Function
  }
}
```

**功能特性**:
- 标准仪表盘
- 多指针
- 分段颜色
- 进度条模式

#### 1.5 K线图 (CandlestickSeries)
```typescript
interface CandlestickSeriesOption {
  type: 'candlestick'
  data: Array<[open: number, close: number, low: number, high: number]>
  itemStyle?: {
    color: string // 阳线颜色
    color0: string // 阴线颜色
    borderColor: string
    borderColor0: string
  }
  barWidth?: number | string
}
```

**功能特性**:
- 标准 K线图
- 阳线/阴线区分
- 成交量关联
- MA 均线叠加

#### 1.6 箱线图 (BoxplotSeries)
```typescript
interface BoxplotSeriesOption {
  type: 'boxplot'
  data: Array<[min, Q1, median, Q3, max]>
  boxWidth?: [number, number]
  itemStyle?: {
    color?: string
    borderColor?: string
  }
  outliers?: number[][] // 异常值
}
```

**功能特性**:
- 标准箱线图
- 异常值标记
- 多系列对比
- 垂直/水平布局

### Phase 2: 统计图表 (5种)

#### 2.1 热力图 (HeatmapSeries)
```typescript
interface HeatmapSeriesOption {
  type: 'heatmap'
  data: Array<[x: number, y: number, value: number]>
  visualMap: {
    min: number
    max: number
    calculable?: boolean
    inRange: {
      color: string[]
    }
  }
}
```

#### 2.2 散点矩阵图 (ScatterMatrixSeries)
- 多维数据可视化
- 相关性分析

#### 2.3 平行坐标系 (ParallelSeries)
- 高维数据展示
- 数据筛选

#### 2.4 词云图 (WordCloudSeries)
- 文本数据可视化
- 自定义形状

#### 2.5 日历图 (CalendarSeries)
- 时间序列数据
- 日/周/月视图

### Phase 3: 关系图表 (6种)

#### 3.1 关系图 (GraphSeries)
```typescript
interface GraphSeriesOption {
  type: 'graph'
  nodes: Array<{ id: string; name: string; value?: number }>
  links: Array<{ source: string; target: string; value?: number }>
  layout: 'force' | 'circular' | 'none'
  force?: {
    repulsion?: number
    gravity?: number
    edgeLength?: number
  }
}
```

#### 3.2 树图 (TreeSeries)
- 层次结构可视化
- 折叠/展开

#### 3.3 矩形树图 (TreemapSeries)
- 层次数据面积展示
- Squarify 算法

#### 3.4 旭日图 (SunburstSeries)
- 层次数据径向展示
- 交互式钻取

#### 3.5 桑基图 (SankeySeries)
- 流量关系可视化
- 能量流转

#### 3.6 和弦图 (ChordSeries)
- 关系矩阵可视化
- 双向关系

### Phase 4: 地理图表 (4种)

#### 4.1 地图 (MapSeries)
```typescript
interface MapSeriesOption {
  type: 'map'
  map: string // 地图名称
  data: Array<{ name: string; value: number }>
  roam?: boolean // 缩放和平移
  itemStyle?: MapItemStyle
}
```

#### 4.2 散点地图 (ScatterGeoSeries)
- 地理坐标散点
- 气泡图模式

#### 4.3 线路图 (LinesGeoSeries)
- 轨迹线
- 迁徙图

#### 4.4 热力地图 (HeatmapGeoSeries)
- 地理热力分布
- 等值线

### Phase 5: 特殊图表 (4种)

#### 5.1 象形柱图 (PictorialBarSeries)
- 自定义形状柱图
- SVG Path 支持

#### 5.2 水球图 (LiquidFillSeries)
- 百分比可视化
- 波浪动画

#### 5.3 3D 图表系列
- 3D 柱状图
- 3D 散点图
- 3D 曲面图

#### 5.4 自定义系列 (CustomSeries)
- 完全自定义渲染
- 渲染回调函数

### 📊 图表类型汇总

| 类别 | 图表类型 | 数量 | 优先级 |
|------|---------|------|--------|
| 基础图表 | Line, Bar, Scatter, Area, Pie, Radar | 6 | P0 |
| 统计图表 | Funnel, Gauge, Candlestick, Boxplot, Heatmap | 5 | P1 |
| 高级统计 | ScatterMatrix, Parallel, WordCloud, Calendar | 4 | P2 |
| 关系图表 | Graph, Tree, Treemap, Sunburst, Sankey, Chord | 6 | P1 |
| 地理图表 | Map, ScatterGeo, LinesGeo, HeatmapGeo | 4 | P2 |
| 特殊图表 | PictorialBar, LiquidFill, 3D Charts, Custom | 4 | P3 |
| **总计** | | **29** | |

---

## 性能优化方案

### 🚀 目标：支持百万级数据流畅渲染

### 1. 渲染优化

#### 1.1 脏检查机制
```typescript
class DirtyCheckManager {
  private dirtyFlags = new Set<string>()
  
  markDirty(key: string): void {
    this.dirtyFlags.add(key)
  }
  
  isDirty(key: string): boolean {
    return this.dirtyFlags.has(key)
  }
  
  clearDirty(): void {
    this.dirtyFlags.clear()
  }
}
```

**优化效果**:
- 仅更新变化部分
- 减少不必要的重绘
- 性能提升 50-70%

#### 1.2 分层渲染
```typescript
enum RenderLayer {
  BACKGROUND = 0,  // 背景层（网格、坐标轴）
  DATA = 1,        // 数据层（图表系列）
  OVERLAY = 2,     // 覆盖层（Tooltip、标注）
}

class LayeredRenderer {
  private layers = new Map<RenderLayer, HTMLCanvasElement>()
  
  renderLayer(layer: RenderLayer): void {
    // 仅渲染指定层
  }
}
```

**优化效果**:
- 静态内容缓存
