/**
 * 统一图表类 - 参考 ECharts 设计理念
 * 
 * 核心概念：
 * - 一个 Chart 实例可以包含多种系列类型
 * - 通过 series[].type 指定每个系列的图表类型
 * - 支持坐标轴翻转（横向柱状图等）
 * 
 * @example
 * ```ts
 * const chart = new Chart('#container', {
 *   xAxis: { data: ['Mon', 'Tue', 'Wed'] },
 *   yAxis: {},
 *   series: [
 *     { type: 'bar', name: '销量', data: [120, 200, 150] },
 *     { type: 'line', name: '增长率', data: [10, 15, 12] },
 *   ],
 * })
 * ```
 */

import { BaseChart, SERIES_COLORS } from './BaseChart'
import type { BaseChartOptions } from './BaseChart'

// ============== 类型定义 ==============

/** 系列类型 */
export type SeriesType = 'line' | 'bar' | 'scatter' | 'pie' | 'candlestick' | 'radar' | 'heatmap' | 'graph' | 'tree' | 'sunburst' | 'sankey' | 'funnel' | 'gauge' | 'wordcloud'

/** 动画类型 */
export type AnimationType =
  | 'none'      // 无动画
  | 'rise'      // 从下往上升起（默认）
  | 'expand'    // 从左到右展开（揭示效果）
  | 'grow'      // 点依次出现（生长效果）
  | 'fade'      // 淡入
  | 'wave'      // 波浪动画 - 数据点依次弹起（折线图专用）
  | 'draw'      // 绘制动画 - 线条渐进绘制（折线图专用）
  | 'cascade'   // 级联动画 - 柱子依次升起（柱状图专用）
  | 'elasticIn' // 弹性进入 - 带回弹效果（柱状图专用）
  | 'none'      // 无动画

/** 线条样式 */
export interface LineStyle {
  width?: number
  type?: 'solid' | 'dashed' | 'dotted'
  color?: string
}

/** 区域样式 */
export interface AreaStyle {
  opacity?: number
  color?: string
}

/** 散点图数据点 */
export type ScatterDataPoint = [number, number] | { x: number; y: number; value?: number }

/** 饼图数据点 */
export interface PieDataItem {
  name: string
  value: number
  color?: string
  selected?: boolean
  /** 禁用悬停高亮效果 */
  noHover?: boolean
}

/** 饼图动画类型 */
export type PieAnimationType =
  | 'expand'   // 扇形展开（默认）
  | 'scale'    // 整体缩放
  | 'fade'     // 淡入
  | 'bounce'   // 回弹缩放
  | 'spin'     // 旋转进入
  | 'cascade'  // 扇形依次展开
  | 'fan'      // 扇形依次弹出（带弹性）
  | 'none'     // 无动画

/** 散点图动画类型 */
export type ScatterAnimationType =
  | 'scale'    // 缩放出现（默认）
  | 'fade'     // 淡入
  | 'rise'     // 从下方升起
  | 'ripple'   // 涟漪效果
  | 'cascade'  // 级联出现
  | 'none'     // 无动画

/** 散点形状 */
export type SymbolType = 'circle' | 'rect' | 'triangle' | 'diamond' | 'pin' | 'arrow'

/** K线图数据点 [open, close, low, high] 或 { open, close, low, high, volume? } */
export type CandlestickDataPoint =
  | [number, number, number, number]  // [open, close, low, high]
  | { open: number; close: number; low: number; high: number; volume?: number }

/** K线图动画类型 */
export type CandlestickAnimationType =
  | 'grow'      // 蜡烛从中间向上下生长（默认）
  | 'rise'      // 从底部升起
  | 'fade'      // 淡入
  | 'cascade'   // 从左到右依次出现
  | 'none'      // 无动画

/** 雷达图动画类型 */
export type RadarAnimationType =
  | 'scale'     // 从中心缩放展开（默认）
  | 'rotate'    // 旋转展开
  | 'fade'      // 淡入
  | 'unfold'    // 各顶点依次展开
  | 'none'      // 无动画

/** 雷达图指示器（维度）配置 */
export interface RadarIndicator {
  /** 指示器名称 */
  name: string
  /** 最大值，默认自动计算 */
  max?: number
  /** 最小值，默认 0 */
  min?: number
  /** 指示器颜色 */
  color?: string
}

/** 热力图动画类型 */
export type HeatmapAnimationType =
  | 'fade'      // 整体淡入（默认）
  | 'scale'     // 单元格缩放出现
  | 'wave'      // 波浪式出现
  | 'cascade'   // 从左上角依次出现
  | 'none'      // 无动画

/** 热力图渲染模式 */
export type HeatmapRenderMode =
  | 'cell'      // 单元格模式（默认）
  | 'smooth'    // 平滑插值模式
  | 'contour'   // 等高线模式

/** 热力图数据项 [x索引, y索引, 值] 或 { x, y, value } */
export type HeatmapDataItem = [number, number, number] | { x: number; y: number; value: number }

/** 关系图动画类型 */
export type GraphAnimationType =
  | 'fade'      // 淡入（默认）
  | 'scale'     // 缩放出现
  | 'expand'    // 从中心扩展
  | 'none'      // 无动画

/** 关系图布局类型 */
export type GraphLayout = 'force' | 'circular' | 'grid'

/** 关系图节点 */
export interface GraphNode {
  id: string
  name: string
  x?: number
  y?: number
  value?: number
  category?: number
  symbolSize?: number
  itemStyle?: { color?: string }
}

/** 关系图边 */
export interface GraphLink {
  source: string
  target: string
  value?: number
  lineStyle?: { color?: string; width?: number; curveness?: number }
}

/** 关系图分类 */
export interface GraphCategory {
  name: string
  itemStyle?: { color?: string }
}

/** 关系图数据 */
export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
  categories?: GraphCategory[]
}

/** 树图布局方向 */
export type TreeLayout = 'TB' | 'BT' | 'LR' | 'RL' | 'radial'

/** 树图边类型 */
export type TreeEdgeShape = 'curve' | 'polyline' | 'step'

/** 树图动画类型 */
export type TreeAnimationType =
  | 'fade'      // 淡入（默认）
  | 'expand'    // 逐层展开
  | 'grow'      // 从根节点生长
  | 'none'      // 无动画

/** 树图节点 */
export interface TreeNode {
  name: string
  value?: number
  children?: TreeNode[]
  collapsed?: boolean
  itemStyle?: { color?: string; borderColor?: string }
  label?: { show?: boolean; position?: string; color?: string; fontSize?: number }
}

/** 树图数据 */
export interface TreeData {
  root: TreeNode
}

/** 旭日图动画类型 */
export type SunburstAnimationType =
  | 'expand'    // 扇形展开（默认）
  | 'scale'     // 从中心缩放
  | 'fade'      // 淡入
  | 'rotate'    // 旋转展开
  | 'none'      // 无动画

/** 旭日图节点 */
export interface SunburstNode {
  /** 节点名称 */
  name: string
  /** 节点值（叶子节点必须，非叶子节点可选，会自动计算） */
  value?: number
  /** 子节点 */
  children?: SunburstNode[]
  /** 节点颜色 */
  itemStyle?: { color?: string; borderColor?: string; borderWidth?: number }
  /** 标签配置 */
  label?: { show?: boolean; rotate?: 'radial' | 'tangential' | number; color?: string; fontSize?: number }
}

/** 旭日图数据 */
export interface SunburstData {
  /** 根节点（可以是单个或多个顶级节点） */
  children: SunburstNode[]
}

/** 桑基图动画类型 */
export type SankeyAnimationType =
  | 'flow'      // 流动动画（默认）
  | 'fade'      // 淡入
  | 'grow'      // 生长动画
  | 'none'      // 无动画

/** 桑基图节点 */
export interface SankeyNode {
  /** 节点名称（唯一标识） */
  name: string
  /** 节点颜色 */
  itemStyle?: { color?: string; borderColor?: string; borderWidth?: number }
  /** 节点深度（可选，自动计算） */
  depth?: number
}

/** 桑基图连接 */
export interface SankeyLink {
  /** 源节点名称 */
  source: string
  /** 目标节点名称 */
  target: string
  /** 流量值 */
  value: number
  /** 连接线颜色 */
  lineStyle?: { color?: string; opacity?: number }
}

/** 桑基图数据 */
export interface SankeyData {
  /** 节点列表 */
  nodes: SankeyNode[]
  /** 连接列表 */
  links: SankeyLink[]
}

/** 漏斗图动画类型 */
export type FunnelAnimationType =
  | 'drop'      // 从上到下依次落下（默认）
  | 'scale'     // 从中心缩放
  | 'fade'      // 淡入
  | 'slide'     // 从一侧滑入
  | 'none'      // 无动画

/** 漏斗图数据项 */
export interface FunnelDataItem {
  /** 名称 */
  name: string
  /** 值 */
  value: number
  /** 颜色 */
  itemStyle?: { color?: string; borderColor?: string; borderWidth?: number }
}

/** 仪表盘动画类型 */
export type GaugeAnimationType =
  | 'sweep'     // 指针扫过（默认）
  | 'grow'      // 数值增长
  | 'fade'      // 淡入
  | 'bounce'    // 弹性效果
  | 'none'      // 无动画

/** 仪表盘指针样式 */
export type GaugePointerStyle = 'default' | 'arrow' | 'triangle' | 'rect' | 'circle'

/** 仪表盘进度条颜色段 */
export interface GaugeAxisLineColor {
  offset: number  // 0-1 的位置
  color: string   // 颜色
}

/** 仪表盘分割线配置 */
export interface GaugeSplitLine {
  show?: boolean
  length?: number
  lineStyle?: { color?: string; width?: number }
}

/** 仪表盘刻度配置 */
export interface GaugeAxisTick {
  show?: boolean
  splitNumber?: number
  length?: number
  lineStyle?: { color?: string; width?: number }
}

/** 仪表盘数据项 */
export interface GaugeDataItem {
  /** 数值 */
  value: number
  /** 名称（显示在数值下方）*/
  name?: string
  /** 自定义颜色 */
  itemStyle?: { color?: string }
}

/** 词云形状类型 */
export type WordCloudShape = 'circle' | 'rect' | 'diamond' | 'triangle' | 'star' | 'heart'

/** 词云数据项 */
export interface WordCloudDataItem {
  /** 词语文本 */
  name: string
  /** 权重值（决定字体大小）*/
  value: number
  /** 自定义颜色 */
  color?: string
  /** 自定义字体 */
  fontFamily?: string
  /** 自定义字重 */
  fontWeight?: string | number
}

/** 通用系列数据 */
export interface SeriesData {
  type: SeriesType
  name?: string
  /** 数据数组：折线/柱状图用 number[], 散点图用 [x,y][], 饼图用 PieDataItem[], K线图用 CandlestickDataPoint[], 热力图用 HeatmapDataItem[] */
  data: (number | null)[] | ScatterDataPoint[] | PieDataItem[] | CandlestickDataPoint[] | HeatmapDataItem[]
  color?: string

  // 折线图特有
  smooth?: boolean
  step?: false | 'start' | 'middle' | 'end'
  areaStyle?: boolean | AreaStyle
  lineStyle?: LineStyle
  symbol?: SymbolType | 'none'
  symbolSize?: number
  showSymbol?: boolean
  connectNulls?: boolean
  /** 动画类型（覆盖全局设置） */
  animationType?: AnimationType

  // 柱状图特有
  stack?: string
  barWidth?: number | string
  barGap?: string
  borderRadius?: number

  // 饼图特有
  /** 饼图半径 [内半径, 外半径]，值为 0-1 的比例 */
  radius?: number | [number, number]
  /** 南丁格尔玫瑰图 */
  roseType?: boolean | 'radius' | 'area'
  /** 饼图动画类型 */
  pieAnimationType?: PieAnimationType
  /** 散点图动画类型 */
  scatterAnimationType?: ScatterAnimationType
  /** 起始角度（弧度），默认 -Math.PI/2 (12点钟方向) */
  startAngle?: number
  /** 扇形总角度（弧度），默认 Math.PI*2 (完整圆)，设为 Math.PI 为半圆 */
  sweepAngle?: number
  /** 扇形间隙角度（弧度），默认 0 */
  padAngle?: number
  /** 扇形圆角半径 */
  cornerRadius?: number
  /** 标签配置 */
  label?: { show?: boolean; position?: 'inside' | 'outside' }

  // K线图特有
  /** K线图动画类型 */
  candlestickAnimationType?: CandlestickAnimationType
  /** 上涨颜色（阳线），默认 #ec0000 */
  upColor?: string
  /** 下跌颜色（阴线），默认 #00da3c */
  downColor?: string
  /** 是否显示最高最低价标签 */
  showMinMax?: boolean
  /** 蜡烛宽度 */
  candleWidth?: number | string

  // 雷达图特有
  /** 雷达图动画类型 */
  radarAnimationType?: RadarAnimationType
  /** 区域填充样式 */
  areaColor?: string
  /** 区域填充透明度 */
  areaOpacity?: number
  /** 是否显示数据点 */
  showDataPoints?: boolean

  // 热力图特有
  /** 热力图动画类型 */
  heatmapAnimationType?: HeatmapAnimationType
  /** 热力图渲染模式: cell(单元格), smooth(平滑插值), contour(等高线) */
  heatmapRenderMode?: HeatmapRenderMode
  /** 热力图颜色范围 [低值颜色, 高值颜色] */
  colorRange?: [string, string]
  /** 单元格圆角 */
  cellBorderRadius?: number
  /** 单元格间距 */
  cellGap?: number
  /** 是否显示标签 */
  showLabel?: boolean
  /** 等高线层数（仅contour模式） */
  contourLevels?: number

  // 关系图特有
  /** 关系图数据 */
  graphData?: GraphData
  /** 关系图布局 */
  graphLayout?: GraphLayout
  /** 关系图动画类型 */
  graphAnimationType?: GraphAnimationType
  /** 节点大小 */
  nodeSize?: number
  /** 边宽度 */
  edgeWidth?: number
  /** 是否显示节点标签 */
  showNodeLabel?: boolean
  /** 是否显示箭头 */
  showArrow?: boolean

  // 树图特有
  /** 树图数据 */
  treeData?: TreeData
  /** 树图布局方向 */
  treeLayout?: TreeLayout
  /** 树图边类型 */
  treeEdgeShape?: TreeEdgeShape
  /** 树图动画类型 */
  treeAnimationType?: TreeAnimationType
  /** 节点水平间距 */
  nodeGapH?: number
  /** 节点垂直间距 */
  nodeGapV?: number

  // 旭日图特有
  /** 旭日图数据 */
  sunburstData?: SunburstData
  /** 旭日图动画类型 */
  sunburstAnimationType?: SunburstAnimationType
  /** 旭日图内半径（0-1的比例或像素值） */
  sunburstInnerRadius?: number
  /** 旭日图外半径（0-1的比例或像素值） */
  sunburstOuterRadius?: number
  /** 是否显示标签 */
  sunburstShowLabel?: boolean
  /** 标签旋转模式: radial（沿半径方向）, tangential（切线方向）*/
  sunburstLabelRotate?: 'radial' | 'tangential' | number
  /** 层级间隙 */
  sunburstLevelGap?: number
  /** 扇形圆角 */
  sunburstCornerRadius?: number
  /** 起始角度（弧度） */
  sunburstStartAngle?: number
  /** 排序方式: null不排序, 'desc'降序, 'asc'升序 */
  sunburstSort?: null | 'desc' | 'asc'

  // 桑基图特有
  /** 桑基图数据 */
  sankeyData?: SankeyData
  /** 桑基图动画类型 */
  sankeyAnimationType?: SankeyAnimationType
  /** 节点宽度 */
  sankeyNodeWidth?: number
  /** 节点间距 */
  sankeyNodeGap?: number
  /** 节点对齐方式 */
  sankeyNodeAlign?: 'left' | 'right' | 'justify'
  /** 是否显示标签 */
  sankeyShowLabel?: boolean
  /** 标签位置 */
  sankeyLabelPosition?: 'left' | 'right' | 'inside'
  /** 布局方向 */
  sankeyOrient?: 'horizontal' | 'vertical'
  /** 连接线曲率 (0-1) */
  sankeyCurveness?: number

  // 漏斗图特有
  /** 漏斗图数据 */
  funnelData?: FunnelDataItem[]
  /** 漏斗图动画类型 */
  funnelAnimationType?: FunnelAnimationType
  /** 漏斗排序: ascending（升序，小在上）, descending（降序，大在上）, none（按数据顺序）*/
  funnelSort?: 'ascending' | 'descending' | 'none'
  /** 漏斗对齐: left, center, right */
  funnelAlign?: 'left' | 'center' | 'right'
  /** 漏斗间隙 */
  funnelGap?: number
  /** 最小尺寸百分比（0-100）*/
  funnelMinSize?: number
  /** 最大尺寸百分比（0-100）*/
  funnelMaxSize?: number
  /** 是否显示标签 */
  funnelShowLabel?: boolean
  /** 标签位置 */
  funnelLabelPosition?: 'left' | 'right' | 'inside' | 'outside'
  /** 漏斗方向: vertical（垂直）, horizontal（水平） */
  funnelOrient?: 'vertical' | 'horizontal'

  // 仪表盘特有
  /** 仪表盘数据 */
  gaugeData?: GaugeDataItem[]
  /** 仪表盘动画类型 */
  gaugeAnimationType?: GaugeAnimationType
  /** 最小值，默认 0 */
  gaugeMin?: number
  /** 最大值，默认 100 */
  gaugeMax?: number
  /** 起始角度（度），默认 225（左下角）*/
  gaugeStartAngle?: number
  /** 结束角度（度），默认 -45（右下角）*/
  gaugeEndAngle?: number
  /** 是否顺时针，默认 true */
  gaugeClockwise?: boolean
  /** 分割段数，默认 10 */
  gaugeSplitNumber?: number
  /** 仪表盘半径，默认 0.75（相对容器）*/
  gaugeRadius?: number
  /** 进度条宽度，默认 20 */
  gaugeAxisLineWidth?: number
  /** 进度条颜色（渐变色段）*/
  gaugeAxisLineColors?: GaugeAxisLineColor[]
  /** 是否显示渐变色轨道，默认 true */
  gaugeShowGradient?: boolean
  /** 是否显示进度条，默认 true */
  gaugeShowProgress?: boolean
  /** 进度条颜色 */
  gaugeProgressColor?: string
  /** 进度条宽度 */
  gaugeProgressWidth?: number
  /** 分割线配置 */
  gaugeSplitLine?: GaugeSplitLine
  /** 刻度配置 */
  gaugeAxisTick?: GaugeAxisTick
  /** 是否显示刻度标签，默认 true */
  gaugeShowAxisLabel?: boolean
  /** 刻度标签距离 */
  gaugeAxisLabelDistance?: number
  /** 指针样式 */
  gaugePointerStyle?: GaugePointerStyle
  /** 指针长度（相对半径），默认 0.6 */
  gaugePointerLength?: number
  /** 指针宽度，默认 6 */
  gaugePointerWidth?: number
  /** 指针颜色 */
  gaugePointerColor?: string
  /** 指针颜色跟随轨道渐变色，默认 false */
  gaugePointerAutoColor?: boolean
  /** 是否显示指针，默认 true */
  gaugeShowPointer?: boolean
  /** 中心圆大小，默认 10 */
  gaugeCenterSize?: number
  /** 是否显示数值，默认 true */
  gaugeShowDetail?: boolean
  /** 数值字体大小，默认 30 */
  gaugeDetailFontSize?: number
  /** 数值偏移 [x, y] */
  gaugeDetailOffset?: [number, number]
  /** 数值格式化 */
  gaugeDetailFormatter?: string | ((value: number) => string)
  /** 是否显示标题（数据名称），默认 true */
  gaugeShowTitle?: boolean
  /** 标题偏移 [x, y] */
  gaugeTitleOffset?: [number, number]

  // ============== 词云配置 ==============
  /** 词云数据 */
  wordCloudData?: WordCloudDataItem[]
  /** 词云形状，默认 'circle' */
  wordCloudShape?: WordCloudShape
  /** 最小字体大小，默认 12 */
  wordCloudMinFontSize?: number
  /** 最大字体大小，默认 60 */
  wordCloudMaxFontSize?: number
  /** 文字间距，默认 2 */
  wordCloudGridSize?: number
  /** 文字旋转角度范围 [min, max]，默认 [-90, 90] */
  wordCloudRotationRange?: [number, number]
  /** 旋转步长，默认 45 */
  wordCloudRotationStep?: number
  /** 是否随机颜色，默认 true */
  wordCloudRandomColor?: boolean
  /** 自定义颜色列表 */
  wordCloudColors?: string[]
  /** 字体，默认 'sans-serif' */
  wordCloudFontFamily?: string
  /** 字重，默认 'normal' */
  wordCloudFontWeight?: string | number
  /** 是否绘制形状边框，默认 false */
  wordCloudDrawMask?: boolean
  /** 形状边框颜色 */
  wordCloudMaskColor?: string

  // 多轴支持
  yAxisIndex?: number
  xAxisIndex?: number
}

/** X轴配置 */
export interface XAxisConfig {
  data?: string[]
  name?: string
  show?: boolean
  /** 轴反转 */
  inverse?: boolean
  /** 轴位置：bottom（默认）或 top */
  position?: 'bottom' | 'top'
  /** 标签显示间隔 */
  interval?: number | 'auto'
  /** 标签旋转角度 */
  rotate?: number
  /** 标签格式化 */
  formatter?: (value: string, index: number) => string
}

/** Y轴配置 */
export interface YAxisConfig {
  name?: string
  min?: number | 'auto'
  max?: number | 'auto'
  show?: boolean
  /** 轴反转 */
  inverse?: boolean
  /** 轴位置：left（默认）或 right */
  position?: 'left' | 'right'
}

/** 数据区域缩放配置 */
export interface DataZoomConfig {
  /** 是否显示，默认 false */
  show?: boolean
  /** 类型：slider（滑动条）或 inside（内置，鼠标滚轮/拖拽） */
  type?: 'slider' | 'inside'
  /** 起始百分比 0-100，默认 0 */
  start?: number
  /** 结束百分比 0-100，默认 100 */
  end?: number
  /** 高度（仅 slider 类型），默认 30 */
  height?: number
  /** 背景色 */
  backgroundColor?: string
  /** 选中区域颜色 */
  fillerColor?: string
  /** 边框颜色 */
  borderColor?: string
  /** 手柄样式 */
  handleStyle?: { color?: string; borderColor?: string }
}

/** 雷达图坐标系配置 */
export interface RadarConfig {
  /** 雷达图指示器配置 */
  indicator: RadarIndicator[]
  /** 中心位置 [x, y]，支持百分比或像素 */
  center?: [string | number, string | number]
  /** 半径，支持百分比或像素 */
  radius?: string | number
  /** 起始角度（度数），默认 90（12点钟方向） */
  startAngle?: number
  /** 雷达图形状：polygon（多边形）或 circle（圆形） */
  shape?: 'polygon' | 'circle'
  /** 分割段数，默认 5 */
  splitNumber?: number
  /** 是否显示轴线 */
  axisLine?: { show?: boolean; lineStyle?: { color?: string; width?: number } }
  /** 是否显示分隔线 */
  splitLine?: { show?: boolean; lineStyle?: { color?: string; width?: number } }
  /** 是否显示分隔区域 */
  splitArea?: { show?: boolean; areaStyle?: { color?: string[] } }
  /** 是否显示指示器名称 */
  axisName?: { show?: boolean; color?: string; fontSize?: number }
}

/** 图表配置 */
export interface ChartOptions extends BaseChartOptions {
  /** X轴配置，支持多个 */
  xAxis?: XAxisConfig | XAxisConfig[]
  /** Y轴配置，支持多个 */
  yAxis?: YAxisConfig | YAxisConfig[]
  /** 系列数据 */
  series?: SeriesData[]
  /** 图例配置 */
  legend?: { show?: boolean; position?: 'top' | 'bottom' }
  /** 提示框配置 */
  tooltip?: { show?: boolean }
  /** 网格配置 */
  grid?: { show?: boolean }
  /** 坐标系翻转：交换 X/Y 轴（用于横向图表），X轴显示值，Y轴显示类目 */
  horizontal?: boolean
  /** 全局动画类型（可被系列配置覆盖） */
  animationType?: AnimationType
  /** 数据区域缩放配置 */
  dataZoom?: DataZoomConfig
  /** 雷达图坐标系配置 */
  radar?: RadarConfig
}

// ============== 辅助函数 ==============

/** 从数据中提取数值（用于折线图/柱状图） */
function getNumericValue(value: number | null | ScatterDataPoint | PieDataItem | CandlestickDataPoint): number | null {
  if (value === null) return null
  if (typeof value === 'number') return value
  // 对于 K线图数组数据 [open, close, low, high]，返回 close 价格
  if (Array.isArray(value) && value.length === 4) return value[1]
  // 对于散点图数据，返回 y 值
  if (Array.isArray(value)) return value[1]
  // 对于饼图数据，返回 value
  if ('value' in value && 'name' in value) return (value as PieDataItem).value
  // 对于 K线图对象数据，返回 close 价格
  if ('open' in value && 'close' in value) return (value as { open: number; close: number }).close
  return (value as { y: number }).y
}

// ============== Chart 类 ==============

export class Chart extends BaseChart<ChartOptions> {
  private hoverIndex = -1
  private hoverSeriesIndex = -1  // 用于嵌套饼图
  private hoverOffsets: Map<string, number> = new Map()  // 存储每个扇形的当前偏移量
  private hoverAnimationFrame: number | null = null
  private enabledSeries: Set<string> = new Set()
  private tooltipEl: HTMLDivElement | null = null

  // DataZoom 状态
  private dataZoomStart = 0      // 起始百分比 0-100
  private dataZoomEnd = 100      // 结束百分比 0-100
  private dataZoomDragging: 'left' | 'right' | 'middle' | null = null
  private dataZoomDragStartX = 0
  private dataZoomDragStartValues = { start: 0, end: 100 }

  // 关系图状态
  private graphNodePositions: Map<string, { x: number; y: number; node: GraphNode }> = new Map()
  private hoverGraphNode: string | null = null

  // 树图状态
  private treeNodePositions: Map<string, { x: number; y: number; node: TreeNode; depth: number }> = new Map()
  private hoverTreeNode: string | null = null

  // 旭日图状态
  private sunburstSectorPositions: Map<string, {
    node: SunburstNode; depth: number; startAngle: number; endAngle: number;
    innerRadius: number; outerRadius: number; centerX: number; centerY: number;
    value: number; color: string;
  }> = new Map()
  private hoverSunburstSector: string | null = null

  // 桑基图状态
  private sankeyNodePositions: Map<string, {
    node: SankeyNode; x: number; y: number; width: number; height: number;
    inValue: number; outValue: number; color: string;
  }> = new Map()
  private sankeyLinkPositions: Map<string, {
    link: SankeyLink; sourceNode: string; targetNode: string;
    sourceY: number; targetY: number; thickness: number; color: string;
  }> = new Map()
  private hoverSankeyNode: string | null = null
  private hoverSankeyLink: string | null = null

  // 漏斗图状态
  private funnelItemPositions: Map<string, {
    item: FunnelDataItem; index: number;
    x: number; y: number; topWidth: number; bottomWidth: number; height: number;
    color: string;
  }> = new Map()
  private hoverFunnelItem: string | null = null

  constructor(container: string | HTMLElement, options: ChartOptions = {}) {
    // 自动检测主题
    const detectedTheme = (typeof document !== 'undefined'
      ? document.documentElement.getAttribute('data-theme') as 'light' | 'dark'
      : null) || 'dark'

    const defaultOptions: ChartOptions = {
      ...options,
      theme: options.theme || detectedTheme,
      xAxis: options.xAxis || { data: [] },
      yAxis: options.yAxis || [{}],
      series: options.series || [],
      legend: options.legend ?? { show: true },
      tooltip: options.tooltip ?? { show: true },
      grid: options.grid ?? { show: true },
    }

    super(container, defaultOptions)

    // 启用所有系列
    this.enabledSeries = new Set(this.options.series?.map(s => s.name || '') || [])

    // 初始化 DataZoom
    if (defaultOptions.dataZoom) {
      this.dataZoomStart = defaultOptions.dataZoom.start ?? 0
      this.dataZoomEnd = defaultOptions.dataZoom.end ?? 100
    }

    // 绑定事件
    this.bindEvents()

    // 延迟渲染，等待 DOM 完全就绪（避免刷新时抖动）
    requestAnimationFrame(() => {
      if (this.disposed) return

      // 检查并更新尺寸（确保容器已有正确尺寸）
      const actualWidth = this.container.clientWidth
      const actualHeight = this.container.clientHeight
      if (actualWidth > 0 && actualHeight > 0) {
        if (actualWidth !== this.width || actualHeight !== this.height) {
          // 直接设置尺寸并重新初始化
          ; (this.options as any).width = actualWidth
            ; (this.options as any).height = actualHeight
          const padding = this.getPadding()
          this.chartRect = {
            x: padding.left,
            y: padding.top,
            width: actualWidth - padding.left - padding.right,
            height: actualHeight - padding.top - padding.bottom,
          }
          this.renderer.resize(actualWidth, actualHeight)
        }
      }

      // 启动动画
      if (this.getAnimationConfig().enabled) {
        this.startEntryAnimation()
      } else {
        this.render()
      }
    })
  }

  // ============== 抽象方法实现 ==============

  protected getPadding(): { top: number; right: number; bottom: number; left: number } {
    const p = this.options.padding || {}
    const { horizontal, xAxis } = this.options

    // 水平模式下，Y轴显示类目标签，需要更大的左边距
    let defaultLeft = 50
    if (horizontal) {
      // 根据标签长度动态计算左边距
      const labels = Array.isArray(xAxis) ? xAxis[0]?.data : xAxis?.data
      if (labels && labels.length > 0) {
        const maxLabelLength = Math.max(...labels.map(l => l.length))
        // 每个字符约8px，加上一些边距
        defaultLeft = Math.max(60, Math.min(120, maxLabelLength * 8 + 20))
      } else {
        defaultLeft = 80
      }
    }

    // DataZoom 占用底部空间
    const dataZoomHeight = this.options.dataZoom?.show ? (this.options.dataZoom.height ?? 30) + 10 : 0

    return {
      top: p.top ?? 40,
      right: p.right ?? 20,
      bottom: (p.bottom ?? 40) + dataZoomHeight,
      left: p.left ?? defaultLeft,
    }
  }

  protected paint(): void {
    this.renderChart()
  }

  // ============== 公共方法 ==============

  setOption(options: Partial<ChartOptions>): void {
    this.options = { ...this.options, ...options }
    if (options.series) {
      this.enabledSeries = new Set(options.series.map(s => s.name || ''))
    }
    this.render()
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.options.theme = theme
    this.render()
  }

  override resize(): void {
    super.resize()
  }

  refresh(): void {
    this.render()
  }

  dispose(): void {
    if (this.tooltipEl?.parentNode) {
      this.tooltipEl.parentNode.removeChild(this.tooltipEl)
    }
    super.dispose()
  }

  // ============== 渲染逻辑 ==============

  private renderChart(): void {
    const { options } = this
    const { horizontal } = options

    let enabledSeries = (options.series || []).filter(s => this.enabledSeries.has(s.name || ''))

    // 按类型分组系列
    const barSeries = enabledSeries.filter(s => s.type === 'bar')
    const lineSeries = enabledSeries.filter(s => s.type === 'line')
    const scatterSeries = enabledSeries.filter(s => s.type === 'scatter')
    const pieSeries = enabledSeries.filter(s => s.type === 'pie')
    const candlestickSeries = enabledSeries.filter(s => s.type === 'candlestick')
    const radarSeries = enabledSeries.filter(s => s.type === 'radar')
    const heatmapSeries = enabledSeries.filter(s => s.type === 'heatmap')
    const graphSeries = enabledSeries.filter(s => s.type === 'graph')
    const treeSeries = enabledSeries.filter(s => s.type === 'tree')
    const sunburstSeries = enabledSeries.filter(s => s.type === 'sunburst')
    const sankeySeries = enabledSeries.filter(s => s.type === 'sankey')
    const funnelSeries = enabledSeries.filter(s => s.type === 'funnel')
    const gaugeSeries = enabledSeries.filter(s => s.type === 'gauge')
    const wordCloudSeries = enabledSeries.filter(s => s.type === 'wordcloud')

    // 判断是否只有特殊图表（不需要标准坐标轴和网格）
    const specialChartCount = pieSeries.length + radarSeries.length + heatmapSeries.length + graphSeries.length + treeSeries.length + sunburstSeries.length + sankeySeries.length + funnelSeries.length + gaugeSeries.length + wordCloudSeries.length
    const standardChartCount = barSeries.length + lineSeries.length + scatterSeries.length + candlestickSeries.length
    const isPieOnly = pieSeries.length > 0 && standardChartCount === 0 && specialChartCount === pieSeries.length
    const isRadarOnly = radarSeries.length > 0 && standardChartCount === 0 && specialChartCount === radarSeries.length
    const isHeatmapOnly = heatmapSeries.length > 0 && standardChartCount === 0 && specialChartCount === heatmapSeries.length
    const isGraphOnly = graphSeries.length > 0 && standardChartCount === 0 && specialChartCount === graphSeries.length
    const isTreeOnly = treeSeries.length > 0 && standardChartCount === 0 && specialChartCount === treeSeries.length
    const isSunburstOnly = sunburstSeries.length > 0 && standardChartCount === 0 && specialChartCount === sunburstSeries.length
    const isSankeyOnly = sankeySeries.length > 0 && standardChartCount === 0 && specialChartCount === sankeySeries.length
    const isFunnelOnly = funnelSeries.length > 0 && standardChartCount === 0 && specialChartCount === funnelSeries.length
    const isGaugeOnly = gaugeSeries.length > 0 && standardChartCount === 0 && specialChartCount === gaugeSeries.length
    const isWordCloudOnly = wordCloudSeries.length > 0 && standardChartCount === 0 && specialChartCount === wordCloudSeries.length

    // 绘制背景
    this.drawBackground()

    if (isPieOnly) {
      // 纯饼图模式：只绘制饼图
      this.drawPieSeries(pieSeries)
    } else if (isRadarOnly) {
      // 纯雷达图模式：只绘制雷达图
      this.drawRadarSeries(radarSeries)
    } else if (isHeatmapOnly) {
      // 纯热力图模式
      this.drawHeatmapSeries(heatmapSeries)
    } else if (isGraphOnly) {
      // 纯关系图模式
      this.drawGraphSeries(graphSeries)
    } else if (isTreeOnly) {
      // 纯树图模式
      this.drawTreeSeries(treeSeries)
    } else if (isSunburstOnly) {
      // 纯旭日图模式
      this.drawSunburstSeries(sunburstSeries)
    } else if (isSankeyOnly) {
      // 纯桑基图模式
      this.drawSankeySeries(sankeySeries)
    } else if (isFunnelOnly) {
      // 纯漏斗图模式
      this.drawFunnelSeries(funnelSeries)
    } else if (isGaugeOnly) {
      // 纯仪表盘模式
      this.drawGaugeSeries(gaugeSeries)
    } else if (isWordCloudOnly) {
      // 纯词云模式
      this.drawWordCloudSeries(wordCloudSeries)
    } else {
      // 获取轴配置
      const xAxisConfig = this.getAxisConfig(options.xAxis, 0)
      const yAxisConfigs = this.getAxisConfigs(options.yAxis)
      let labels = xAxisConfig.data || []

      // DataZoom 数据过滤
      const hasDataZoom = options.dataZoom?.show
      let zoomedSeries = enabledSeries
      let zoomedLabels = labels

      if (hasDataZoom && labels.length > 0) {
        const totalLen = labels.length
        const startIdx = Math.floor(totalLen * this.dataZoomStart / 100)
        const endIdx = Math.ceil(totalLen * this.dataZoomEnd / 100)

        zoomedLabels = labels.slice(startIdx, endIdx)
        zoomedSeries = enabledSeries.map(s => ({
          ...s,
          data: (s.data as any[]).slice(startIdx, endIdx)
        }))
      }

      // 计算 Y 轴范围（使用缩放后的数据）
      const yRanges = this.calculateYRanges(zoomedSeries, yAxisConfigs)

      // 绘制网格
      if (options.grid?.show !== false) {
        this.drawGrid(5)
      }

      // 绘制坐标轴（使用缩放后的标签）
      this.drawXAxis(zoomedLabels, xAxisConfig, yRanges, horizontal)
      this.drawYAxis(yRanges, yAxisConfigs, zoomedLabels, horizontal)

      // 过滤缩放后的系列数据
      const zoomedBar = zoomedSeries.filter(s => s.type === 'bar')
      const zoomedLine = zoomedSeries.filter(s => s.type === 'line')
      const zoomedScatter = zoomedSeries.filter(s => s.type === 'scatter')
      const zoomedCandlestick = zoomedSeries.filter(s => s.type === 'candlestick')

      // 绘制各类型系列（使用缩放后的数据）
      if (zoomedCandlestick.length > 0) {
        this.drawCandlestickSeries(zoomedCandlestick, yRanges, zoomedLabels)
      }
      if (zoomedBar.length > 0) {
        this.drawBarSeries(zoomedBar, yRanges, zoomedLabels, horizontal)
      }
      if (zoomedLine.length > 0) {
        this.drawLineSeries(zoomedLine, yRanges, zoomedLabels, horizontal)
      }
      if (zoomedScatter.length > 0) {
        this.drawScatterSeries(zoomedScatter, yRanges, zoomedLabels)
      }

      // 绘制悬停参考线
      this.drawHoverLine(zoomedLabels)

      // 绘制 DataZoom 滑块
      if (hasDataZoom) {
        this.drawDataZoom(labels, enabledSeries)
      }
    }

    // 绘制图例（饼图、雷达图、热力图有自己的图例绘制逻辑）
    if (options.legend?.show !== false && !isPieOnly && !isRadarOnly && !isHeatmapOnly) {
      this.drawLegend()
    }
  }

  // ============== 坐标轴方法 ==============

  private getAxisConfig(axis: XAxisConfig | XAxisConfig[] | undefined, index: number): XAxisConfig {
    if (Array.isArray(axis)) {
      return axis[index] || {}
    }
    return axis || {}
  }

  private getAxisConfigs(axis: YAxisConfig | YAxisConfig[] | undefined): YAxisConfig[] {
    if (Array.isArray(axis)) {
      return axis
    }
    return axis ? [axis] : [{}]
  }

  private calculateYRanges(series: SeriesData[], yAxisConfigs: YAxisConfig[]): { min: number; max: number }[] {
    const ranges: { min: number; max: number }[] = yAxisConfigs.map(() => ({
      min: Infinity,
      max: -Infinity,
    }))

    // 计算堆叠累计值
    const stackTotals: Map<string, number[]> = new Map()

    series.forEach(s => {
      const yAxisIndex = s.yAxisIndex || 0
      const range = ranges[yAxisIndex]
      if (!range) return

      if (s.stack) {
        // 堆叠系列：累加值
        if (!stackTotals.has(s.stack)) {
          stackTotals.set(s.stack, [])
        }
        const totals = stackTotals.get(s.stack)!

        s.data.forEach((v, i) => {
          const numValue = getNumericValue(v)
          if (numValue !== null) {
            totals[i] = (totals[i] || 0) + numValue
            range.max = Math.max(range.max, totals[i]!)
            range.min = Math.min(range.min, 0) // 堆叠图从0开始
          }
        })
      } else {
        // 非堆叠系列：使用原始值
        s.data.forEach(v => {
          const numValue = getNumericValue(v)
          if (numValue !== null) {
            range.min = Math.min(range.min, numValue)
            range.max = Math.max(range.max, numValue)
          }
        })
      }
    })

    // 处理边界情况
    ranges.forEach((range) => {
      if (!isFinite(range.min)) range.min = 0
      if (!isFinite(range.max)) range.max = 100

      // 确保范围包含0
      if (range.min > 0) range.min = 0
      if (range.max < 0) range.max = 0

      // 添加边距
      const padding = (range.max - range.min) * 0.1 || 10

      // 处理最大值
      if (range.max > 0) {
        range.max = Math.ceil((range.max + padding) / 10) * 10
      }

      // 处理最小值
      if (range.min < 0) {
        range.min = Math.floor((range.min - padding) / 10) * 10
      }
    })

    return ranges
  }

  private drawXAxis(
    labels: string[],
    config: XAxisConfig,
    yRanges: { min: number; max: number }[],
    horizontal?: boolean
  ): void {
    const { renderer, chartRect, colors } = this
    const { inverse, interval } = config

    if (horizontal) {
      // 水平模式：X轴显示数值（底部）
      const yTicks = 5
      const range = yRanges[0] || { min: 0, max: 100 }

      for (let i = 0; i <= yTicks; i++) {
        const tickIndex = inverse ? (yTicks - i) : i
        const value = range.min + (range.max - range.min) * (tickIndex / yTicks)
        const x = chartRect.x + (i / yTicks) * chartRect.width
        const y = chartRect.y + chartRect.height + 20

        renderer.drawText(
          { x, y, text: Math.round(value).toString() },
          { fill: colors.textSecondary, fontSize: 11, textAlign: 'center' }
        )
      }
      return
    }

    // 垂直模式（默认）：X轴显示类目
    const barGroupWidth = chartRect.width / Math.max(labels.length, 1)

    // 计算标签间隔，避免重叠
    let labelInterval = 1
    if (typeof interval === 'number') {
      labelInterval = interval
    } else {
      // 自动计算：根据标签实际宽度和可用空间
      const maxLabelLen = Math.max(...labels.map(l => l.length))
      const estimatedLabelWidth = Math.max(maxLabelLen * 8, 50) // 每字符约8px
      const availablePerLabel = chartRect.width / labels.length

      if (availablePerLabel < estimatedLabelWidth) {
        labelInterval = Math.ceil(estimatedLabelWidth / availablePerLabel)
      }

      // 数据量大时强制更大间隔
      if (labels.length > 20 && labelInterval < 2) labelInterval = 2
      if (labels.length > 40 && labelInterval < 3) labelInterval = 3
    }

    const displayLabels = inverse ? [...labels].reverse() : labels

    displayLabels.forEach((label, i) => {
      // 只显示间隔的标签
      if (i % labelInterval !== 0) return

      const x = chartRect.x + barGroupWidth * i + barGroupWidth / 2
      const y = chartRect.y + chartRect.height + 20

      renderer.drawText(
        { x, y, text: label },
        { fill: colors.textSecondary, fontSize: 11, textAlign: 'center' }
      )
    })
  }

  private drawYAxis(
    yRanges: { min: number; max: number }[],
    configs: YAxisConfig[],
    labels: string[],
    horizontal?: boolean
  ): void {
    const { renderer, chartRect, colors } = this

    if (horizontal) {
      // 水平模式：Y轴显示类目（左侧）
      const barGroupWidth = chartRect.height / Math.max(labels.length, 1)
      const config = configs[0] || {}
      const inverse = config.inverse

      const displayLabels = inverse ? [...labels].reverse() : labels

      displayLabels.forEach((label, i) => {
        const x = chartRect.x - 8
        const y = chartRect.y + barGroupWidth * i + barGroupWidth / 2

        renderer.drawText(
          { x, y, text: label },
          { fill: colors.textSecondary, fontSize: 11, textAlign: 'right', textBaseline: 'middle' }
        )
      })
      return
    }

    // 垂直模式（默认）：Y轴显示数值
    const yTicks = 5

    configs.forEach((config, axisIndex) => {
      const range = yRanges[axisIndex]
      if (!range) return

      const isRight = config.position === 'right' || axisIndex > 0
      const { inverse } = config

      for (let i = 0; i <= yTicks; i++) {
        const tickIndex = inverse ? (yTicks - i) : i
        const value = range.min + (range.max - range.min) * (1 - tickIndex / yTicks)
        const y = chartRect.y + (i / yTicks) * chartRect.height

        const x = isRight ? chartRect.x + chartRect.width + 8 : chartRect.x - 8
        const textAlign = isRight ? 'left' : 'right'

        renderer.drawText(
          { x, y, text: Math.round(value).toString() },
          { fill: colors.textSecondary, fontSize: 11, textAlign: textAlign as 'left' | 'right' }
        )
      }
    })
  }

  // ============== 系列绑制方法 ==============

  private drawBarSeries(
    series: SeriesData[],
    yRanges: { min: number; max: number }[],
    labels: string[],
    horizontal?: boolean
  ): void {
    const { renderer, chartRect, animationProgress, options } = this
    const globalAnimationType = options.animationType || 'rise'

    if (horizontal) {
      this.drawHorizontalBars(series, yRanges, labels)
      return
    }

    const totalBars = labels.length
    const barGroupWidth = chartRect.width / Math.max(totalBars, 1)

    // 分离堆叠和非堆叠系列
    const stackGroups = new Map<string, SeriesData[]>()
    const nonStackSeries: SeriesData[] = []

    series.forEach(s => {
      if (s.stack) {
        if (!stackGroups.has(s.stack)) stackGroups.set(s.stack, [])
        stackGroups.get(s.stack)!.push(s)
      } else {
        nonStackSeries.push(s)
      }
    })

    // 计算柱子宽度：非堆叠系列 + 堆叠组数
    const totalBarGroups = nonStackSeries.length + stackGroups.size
    const barWidth = totalBarGroups > 0 ? (barGroupWidth * 0.7) / totalBarGroups : barGroupWidth * 0.7
    const totalBarsWidth = barWidth * totalBarGroups
    const startOffset = (barGroupWidth - totalBarsWidth) / 2

    // 获取 Y 轴范围和零点位置
    const yRange = yRanges[0] || { min: 0, max: 100 }
    const zeroY = chartRect.y + chartRect.height -
      ((0 - yRange.min) / (yRange.max - yRange.min)) * chartRect.height

    // 绘制非堆叠系列
    nonStackSeries.forEach((s, seriesIndex) => {
      const color = s.color || SERIES_COLORS[series.indexOf(s) % SERIES_COLORS.length]
      const radius = s.borderRadius ?? 4
      const animationType = s.animationType || globalAnimationType

      s.data.forEach((value, dataIndex) => {
        const numValue = getNumericValue(value)
        if (numValue === null) return

        const x = chartRect.x + barGroupWidth * dataIndex + startOffset + barWidth * seriesIndex
        const isHovered = this.hoverIndex === dataIndex

        // 计算柱子高度和位置（支持负值）
        const normalizedValue = (numValue - yRange.min) / (yRange.max - yRange.min)
        const barY = chartRect.y + chartRect.height - normalizedValue * chartRect.height
        const targetHeight = Math.abs(barY - zeroY)

        // 应用动画
        const { height: barHeight, opacity } = this.applyBarAnimation(
          targetHeight, animationType, animationProgress, dataIndex, totalBars, isHovered
        )

        if (barHeight > 0) {
          const y = numValue >= 0 ? zeroY - barHeight : zeroY
          renderer.drawRect(
            { x, y, width: barWidth - 2, height: barHeight },
            { fill: color, opacity, radius: numValue >= 0 ? radius : 0 }
          )
        }
      })
    })

    // 绘制堆叠系列
    let stackIndex = nonStackSeries.length
    stackGroups.forEach((stackSeries) => {
      // 正值和负值分别累加
      const positiveStack = new Array(totalBars).fill(0)
      const negativeStack = new Array(totalBars).fill(0)
      const totalStackLayers = stackSeries.length

      stackSeries.forEach((s, sIdx) => {
        const color = s.color || SERIES_COLORS[series.indexOf(s) % SERIES_COLORS.length]
        const radius = s.borderRadius ?? 4
        const animationType = s.animationType || globalAnimationType

        s.data.forEach((value, dataIndex) => {
          const numValue = getNumericValue(value)
          if (numValue === null) return

          const x = chartRect.x + barGroupWidth * dataIndex + startOffset + barWidth * stackIndex
          const isHovered = this.hoverIndex === dataIndex

          // 计算堆叠位置
          let baseValue: number, targetValue: number
          if (numValue >= 0) {
            baseValue = positiveStack[dataIndex]!
            targetValue = baseValue + numValue
            positiveStack[dataIndex] = targetValue
          } else {
            baseValue = negativeStack[dataIndex]!
            targetValue = baseValue + numValue
            negativeStack[dataIndex] = targetValue
          }

          const baseY = chartRect.y + chartRect.height -
            ((baseValue - yRange.min) / (yRange.max - yRange.min)) * chartRect.height
          const targetY = chartRect.y + chartRect.height -
            ((targetValue - yRange.min) / (yRange.max - yRange.min)) * chartRect.height
          const targetHeight = Math.abs(targetY - baseY)

          // 堆叠动画：每层依次出现
          const { height: barHeight, opacity } = this.applyStackedBarAnimation(
            targetHeight, animationType, animationProgress, dataIndex, totalBars,
            sIdx, totalStackLayers, isHovered
          )

          if (barHeight > 0) {
            const y = numValue >= 0 ? baseY - barHeight : baseY
            // 只有最上层的堆叠才有圆角
            const isTop = sIdx === stackSeries.length - 1
            renderer.drawRect(
              { x, y, width: barWidth - 2, height: barHeight },
              { fill: color, opacity, radius: isTop ? radius : 0 }
            )
          }
        })
      })
      stackIndex++
    })
  }

  // 柱状图动画计算辅助方法
  private applyBarAnimation(
    targetHeight: number,
    animationType: AnimationType,
    progress: number,
    dataIndex: number,
    totalBars: number,
    isHovered: boolean
  ): { height: number; opacity: number } {
    let height = targetHeight
    let opacity = isHovered ? 1 : 0.85

    // 使用缓动函数使动画更流畅
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

    // 弹性缓动函数
    const easeOutElastic = (t: number) => {
      if (t === 0 || t === 1) return t
      const c4 = (2 * Math.PI) / 3
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
    }

    // 回弹缓动
    const easeOutBounce = (t: number) => {
      const n1 = 7.5625, d1 = 2.75
      if (t < 1 / d1) return n1 * t * t
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
      return n1 * (t -= 2.625 / d1) * t + 0.984375
    }

    switch (animationType) {
      case 'rise':
        // 整体同时从底部升起
        height = targetHeight * easeOutCubic(progress)
        break
      case 'expand':
        // 从中间向两边展开（宽度动画，但这里用高度模拟视觉效果）
        // 中间的柱子先出现，两边的后出现
        const centerIndex = (totalBars - 1) / 2
        const distanceFromCenter = Math.abs(dataIndex - centerIndex) / centerIndex
        const expandDelay = distanceFromCenter * 0.5
        const expandProgress = Math.max(0, Math.min(1, (progress - expandDelay) / (1 - expandDelay)))
        height = targetHeight * easeOutQuart(expandProgress)
        if (expandProgress <= 0) opacity = 0
        break
      case 'grow':
        // 从小到大生长，带轻微回弹
        const growProgress = easeOutBounce(progress)
        height = targetHeight * growProgress
        break
      case 'cascade':
        // 级联瀑布：柱子像多米诺骨牌一样快速依次倒下（升起）
        const cascadeDelay = (dataIndex / totalBars) * 0.85
        const cascadeDuration = 0.2  // 每个柱子升起很快
        const cascadeProgress = Math.max(0, Math.min(1, (progress - cascadeDelay) / cascadeDuration))
        height = targetHeight * easeOutQuart(cascadeProgress)
        if (cascadeProgress <= 0) opacity = 0
        break
      case 'elasticIn':
        // 弹性动画：柱子超过目标高度后回弹
        const elasticDelay = (dataIndex / totalBars) * 0.4
        const elasticDuration = 0.7
        const elasticProgress = Math.max(0, Math.min(1, (progress - elasticDelay) / elasticDuration))
        height = targetHeight * easeOutElastic(elasticProgress)
        if (elasticProgress <= 0) opacity = 0
        break
      case 'fade':
        // 淡入：高度直接到位，透明度渐变
        height = targetHeight
        opacity = (isHovered ? 1 : 0.85) * easeOutCubic(progress)
        break
      case 'none':
        height = targetHeight
        break
    }

    return { height, opacity }
  }

  // 堆叠柱状图动画：每层依次出现
  private applyStackedBarAnimation(
    targetHeight: number,
    animationType: AnimationType,
    progress: number,
    dataIndex: number,
    totalBars: number,
    stackLayerIndex: number,
    totalStackLayers: number,
    isHovered: boolean
  ): { height: number; opacity: number } {
    let height = targetHeight
    let opacity = isHovered ? 1 : 0.85

    // 缓动函数
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

    // 堆叠动画：每层依次出现
    // 每层占用的动画时间段
    const layerDuration = 1 / totalStackLayers
    const layerStart = stackLayerIndex * layerDuration * 0.7 // 0.7 让层之间有重叠
    const layerEnd = layerStart + layerDuration + 0.3 // 延长结束时间让动画更平滑

    // 计算当前层的进度
    const layerProgress = Math.max(0, Math.min(1, (progress - layerStart) / (layerEnd - layerStart)))

    // 弹性缓动函数
    const easeOutElastic = (t: number) => {
      if (t === 0 || t === 1) return t
      const c4 = (2 * Math.PI) / 3
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
    }

    // 回弹缓动
    const easeOutBounce = (t: number) => {
      const n1 = 7.5625, d1 = 2.75
      if (t < 1 / d1) return n1 * t * t
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
      return n1 * (t -= 2.625 / d1) * t + 0.984375
    }

    switch (animationType) {
      case 'rise':
        // 从底部升起，每层依次
        height = targetHeight * easeOutCubic(layerProgress)
        break
      case 'expand':
        // 从中间向两边展开
        const centerIndex = (totalBars - 1) / 2
        const distanceFromCenter = Math.abs(dataIndex - centerIndex) / Math.max(centerIndex, 1)
        const expandDelay = distanceFromCenter * 0.4
        const expandProgress = Math.max(0, Math.min(1, (layerProgress - expandDelay) / (1 - expandDelay)))
        height = targetHeight * easeOutQuart(expandProgress)
        if (expandProgress <= 0) opacity = 0
        break
      case 'grow':
        // 带回弹的生长
        height = targetHeight * easeOutBounce(layerProgress)
        break
      case 'cascade':
        // 级联瀑布
        const cascadeDelay = (dataIndex / totalBars) * 0.7
        const cascadeDuration = 0.25
        const cascadeProgress = Math.max(0, Math.min(1, (layerProgress - cascadeDelay) / cascadeDuration))
        height = targetHeight * easeOutQuart(cascadeProgress)
        if (cascadeProgress <= 0) opacity = 0
        break
      case 'elasticIn':
        // 弹性动画
        const elasticDelay = (dataIndex / totalBars) * 0.3
        const elasticDuration = 0.8
        const elasticProgress = Math.max(0, Math.min(1, (layerProgress - elasticDelay) / elasticDuration))
        height = targetHeight * easeOutElastic(elasticProgress)
        if (elasticProgress <= 0) opacity = 0
        break
      case 'fade':
        // 淡入效果
        height = targetHeight
        opacity = (isHovered ? 1 : 0.85) * easeOutCubic(layerProgress)
        break
      case 'none':
        height = targetHeight
        break
    }

    return { height, opacity }
  }

  private drawHorizontalBars(
    series: SeriesData[],
    yRanges: { min: number; max: number }[],
    labels: string[]
  ): void {
    const { renderer, chartRect, animationProgress, options } = this
    const globalAnimationType = options.animationType || 'rise'

    const totalBars = labels.length
    const barGroupHeight = chartRect.height / Math.max(totalBars, 1)

    // 分离堆叠和非堆叠系列
    const stackGroups = new Map<string, SeriesData[]>()
    const nonStackSeries: SeriesData[] = []

    series.forEach(s => {
      if (s.stack) {
        if (!stackGroups.has(s.stack)) stackGroups.set(s.stack, [])
        stackGroups.get(s.stack)!.push(s)
      } else {
        nonStackSeries.push(s)
      }
    })

    // 计算柱子高度
    const totalBarGroups = nonStackSeries.length + stackGroups.size
    const barHeight = totalBarGroups > 0 ? (barGroupHeight * 0.7) / totalBarGroups : barGroupHeight * 0.7
    const totalBarsHeight = barHeight * totalBarGroups
    const startOffset = (barGroupHeight - totalBarsHeight) / 2

    // 获取 X 轴范围和零点位置
    const xRange = yRanges[0] || { min: 0, max: 100 }
    const zeroX = chartRect.x + ((0 - xRange.min) / (xRange.max - xRange.min)) * chartRect.width

    // 缓动函数
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

    // 应用水平柱状图动画
    const applyHorizontalAnimation = (
      targetWidth: number, animationType: AnimationType, dataIndex: number, isHovered: boolean
    ): { width: number; opacity: number } => {
      let width = targetWidth
      let opacity = isHovered ? 1 : 0.85

      switch (animationType) {
        case 'rise':
          width = targetWidth * easeOutCubic(animationProgress)
          break
        case 'expand':
          const expandDelay = dataIndex / (totalBars + 2)
          const expandDuration = 1 - expandDelay
          const expandProgress = Math.max(0, Math.min(1, (animationProgress - expandDelay) / expandDuration))
          width = targetWidth * easeOutQuart(expandProgress)
          break
        case 'grow':
          const growDelay = (dataIndex / totalBars) * 0.6
          const growDuration = 1 - growDelay
          const growProgress = Math.max(0, Math.min(1, (animationProgress - growDelay) / growDuration))
          width = targetWidth * easeOutCubic(growProgress)
          break
        case 'fade':
          width = targetWidth
          opacity = (isHovered ? 1 : 0.85) * easeOutCubic(animationProgress)
          break
        case 'none':
          width = targetWidth
          break
      }
      return { width, opacity }
    }

    // 绘制非堆叠系列
    nonStackSeries.forEach((s, seriesIndex) => {
      const color = s.color || SERIES_COLORS[series.indexOf(s) % SERIES_COLORS.length]
      const radius = s.borderRadius ?? 4
      const animationType = s.animationType || globalAnimationType

      s.data.forEach((value, dataIndex) => {
        const numValue = getNumericValue(value)
        if (numValue === null) return

        const y = chartRect.y + barGroupHeight * dataIndex + startOffset + barHeight * seriesIndex
        const isHovered = this.hoverIndex === dataIndex

        // 计算柱子宽度和位置（支持负值）
        const normalizedValue = (numValue - xRange.min) / (xRange.max - xRange.min)
        const barX = chartRect.x + normalizedValue * chartRect.width
        const targetWidth = Math.abs(barX - zeroX)

        const { width: barWidth, opacity } = applyHorizontalAnimation(
          targetWidth, animationType, dataIndex, isHovered
        )

        if (barWidth > 0) {
          const x = numValue >= 0 ? zeroX : zeroX - barWidth
          renderer.drawRect(
            { x, y, width: barWidth, height: barHeight - 2 },
            { fill: color, opacity, radius: numValue >= 0 ? radius : 0 }
          )
        }
      })
    })

    // 绘制堆叠系列
    let stackIndex = nonStackSeries.length
    stackGroups.forEach((stackSeries) => {
      const positiveStack = new Array(totalBars).fill(0)
      const negativeStack = new Array(totalBars).fill(0)

      stackSeries.forEach((s, sIdx) => {
        const color = s.color || SERIES_COLORS[series.indexOf(s) % SERIES_COLORS.length]
        const radius = s.borderRadius ?? 4
        const animationType = s.animationType || globalAnimationType

        s.data.forEach((value, dataIndex) => {
          const numValue = getNumericValue(value)
          if (numValue === null) return

          const y = chartRect.y + barGroupHeight * dataIndex + startOffset + barHeight * stackIndex
          const isHovered = this.hoverIndex === dataIndex

          // 计算堆叠位置
          let baseValue: number, targetValue: number
          if (numValue >= 0) {
            baseValue = positiveStack[dataIndex]!
            targetValue = baseValue + numValue
            positiveStack[dataIndex] = targetValue
          } else {
            baseValue = negativeStack[dataIndex]!
            targetValue = baseValue + numValue
            negativeStack[dataIndex] = targetValue
          }

          const baseX = chartRect.x + ((baseValue - xRange.min) / (xRange.max - xRange.min)) * chartRect.width
          const targetX = chartRect.x + ((targetValue - xRange.min) / (xRange.max - xRange.min)) * chartRect.width
          const targetWidth = Math.abs(targetX - baseX)

          const { width: barWidth, opacity } = applyHorizontalAnimation(
            targetWidth, animationType, dataIndex, isHovered
          )

          if (barWidth > 0) {
            const x = numValue >= 0 ? baseX : baseX - barWidth
            const isLast = sIdx === stackSeries.length - 1
            renderer.drawRect(
              { x, y, width: barWidth, height: barHeight - 2 },
              { fill: color, opacity, radius: isLast ? radius : 0 }
            )
          }
        })
      })
      stackIndex++
    })
  }

  private drawLineSeries(
    series: SeriesData[],
    yRanges: { min: number; max: number }[],
    labels: string[],
    horizontal?: boolean
  ): void {
    const { renderer, chartRect, animationProgress, colors, options } = this
    const globalAnimationType = options.animationType || 'rise'
    const barGroupWidth = horizontal
      ? chartRect.height / Math.max(labels.length, 1)
      : chartRect.width / Math.max(labels.length, 1)
    const baseY = chartRect.y + chartRect.height // 底部基线
    const baseX = chartRect.x // 左侧基线（水平模式用）

    // 缓动函数使动画更流畅
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const easedProgress = easeOutCubic(animationProgress)

    // 计算堆叠数据：按 stack 属性分组
    const stackGroups: Map<string, { seriesIndex: number; data: number[] }[]> = new Map()
    const stackedValues: Map<string, number[]> = new Map()

    series.forEach((s, seriesIndex) => {
      if (s.stack) {
        if (!stackGroups.has(s.stack)) {
          stackGroups.set(s.stack, [])
          stackedValues.set(s.stack, new Array(labels.length).fill(0))
        }
        stackGroups.get(s.stack)!.push({
          seriesIndex,
          data: s.data.map(v => getNumericValue(v) || 0)
        })
      }
    })

    // 存储每个系列的目标点位置和动画后的点位置
    const seriesPointsMap: Map<number, { x: number; y: number }[]> = new Map()
    const seriesTargetPointsMap: Map<number, { x: number; y: number }[]> = new Map()

    series.forEach((s, seriesIndex) => {
      const yRange = yRanges[s.yAxisIndex || 0] || yRanges[0]!
      const animationType = s.animationType || globalAnimationType

      // 计算所有目标点位置（考虑堆叠）
      const targetPoints: { x: number; y: number }[] = []
      const animatedPoints: { x: number; y: number }[] = []

      s.data.forEach((value, dataIndex) => {
        const numValue = getNumericValue(value)
        if (numValue === null) return

        let actualValue = numValue

        // 如果有堆叠，累加之前的值
        if (s.stack && stackedValues.has(s.stack)) {
          const stackedArr = stackedValues.get(s.stack)!
          actualValue = stackedArr[dataIndex]! + numValue
          stackedArr[dataIndex] = actualValue
        }

        const normalizedValue = (actualValue - yRange.min) / (yRange.max - yRange.min)

        let targetX: number, targetY: number
        if (horizontal) {
          // 水平模式：Y轴显示类目，X轴显示值
          targetX = chartRect.x + chartRect.width * normalizedValue
          targetY = chartRect.y + barGroupWidth * dataIndex + barGroupWidth / 2
        } else {
          // 垂直模式（默认）
          targetX = chartRect.x + barGroupWidth * dataIndex + barGroupWidth / 2
          targetY = chartRect.y + chartRect.height - chartRect.height * normalizedValue
        }
        targetPoints.push({ x: targetX, y: targetY })

        // 根据动画类型计算动画后的点位置
        let animatedX = targetX
        let animatedY = targetY

        switch (animationType) {
          case 'rise':
            // 从底部/左侧升起，使用缓动
            if (horizontal) {
              animatedX = baseX + (targetX - baseX) * easedProgress
            } else {
              animatedY = baseY + (targetY - baseY) * easedProgress
            }
            break
          case 'expand':
            // 展开效果：点位置不变，通过裁剪实现
            break
          case 'grow':
            // 生长效果：根据进度决定显示哪些点
            break
          case 'fade':
            // 淡入效果：点位置不变
            break
          case 'wave':
            // 波浪动画：数据点依次弹起，带有弹性效果
            {
              const pointDelay = dataIndex / Math.max(s.data.length - 1, 1)
              const pointProgress = Math.max(0, (animationProgress - pointDelay * 0.6) / (1 - pointDelay * 0.6))
              // 弹性缓动
              const bounceEase = (t: number) => {
                if (t < 0) return 0
                if (t > 1) return 1
                const c4 = (2 * Math.PI) / 3
                return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
              }
              const easedPoint = bounceEase(pointProgress)
              if (horizontal) {
                animatedX = baseX + (targetX - baseX) * easedPoint
              } else {
                animatedY = baseY + (targetY - baseY) * easedPoint
              }
            }
            break
          case 'draw':
            // 绘制动画：线条从左到右渐进绘制，点位置不变
            break
          case 'none':
            // 无动画：点位置不变
            break
        }

        animatedPoints.push({ x: animatedX, y: animatedY })
      })

      if (targetPoints.length === 0) return

      seriesTargetPointsMap.set(seriesIndex, targetPoints)
      seriesPointsMap.set(seriesIndex, animatedPoints)
    })

    // 绘制区域填充（从后往前绘制，确保正确的层叠顺序）
    const reversedSeries = [...series].reverse()
    reversedSeries.forEach((s, reversedIndex) => {
      const seriesIndex = series.length - 1 - reversedIndex
      const animationType = s.animationType || globalAnimationType
      const points = seriesPointsMap.get(seriesIndex)
      const targetPoints = seriesTargetPointsMap.get(seriesIndex)
      if (!points || points.length < 2 || !s.areaStyle) return

      const color = s.color || SERIES_COLORS[seriesIndex % SERIES_COLORS.length]

      // 根据动画类型计算透明度（使用缓动）
      let opacityMultiplier = 1
      if (animationType === 'fade') {
        opacityMultiplier = easedProgress
      } else if (animationType !== 'none') {
        opacityMultiplier = easedProgress
      }
      const opacity = (typeof s.areaStyle === 'object' ? (s.areaStyle.opacity || 0.3) : 0.3) * opacityMultiplier

      // 根据动画类型选择要绘制的点
      let drawPoints = points
      if (animationType === 'expand' && targetPoints) {
        // 展开效果：使用目标点，通过裁剪实现
        drawPoints = targetPoints
      } else if (animationType === 'grow' && targetPoints) {
        // 生长效果：只绘制部分点（使用缓动）
        const visibleCount = Math.ceil(targetPoints.length * easedProgress)
        drawPoints = targetPoints.slice(0, Math.max(2, visibleCount))
      }

      // 找到同一 stack 组中的前一个系列
      let bottomPoints: { x: number; y: number }[] | null = null
      if (s.stack) {
        for (let i = seriesIndex - 1; i >= 0; i--) {
          if (series[i]?.stack === s.stack) {
            bottomPoints = seriesPointsMap.get(i) || null
            break
          }
        }
      }

      // 使用正确的绘制方法
      const r = renderer as any

      // 展开动画：先设置裁剪区域
      if (animationType === 'expand') {
        renderer.save()
        const clipWidth = horizontal
          ? chartRect.height * animationProgress
          : chartRect.width * animationProgress
        const clipHeight = horizontal
          ? chartRect.width
          : chartRect.height
        if (horizontal) {
          renderer.clip({ x: chartRect.x, y: chartRect.y, width: chartRect.width, height: clipWidth })
        } else {
          renderer.clip({ x: chartRect.x, y: chartRect.y, width: clipWidth, height: clipHeight })
        }
      }

      const drawBaseY = horizontal ? chartRect.x : baseY

      if (bottomPoints && bottomPoints.length > 0) {
        r.drawStackedArea(drawPoints, bottomPoints, { fill: color, opacity }, s.smooth)
      } else {
        r.drawArea(drawPoints, drawBaseY, color, s.smooth, opacity)
      }

      if (animationType === 'expand') {
        renderer.restore()
      }
    })

    // 绘制线条和数据点
    series.forEach((s, seriesIndex) => {
      const animationType = s.animationType || globalAnimationType
      const points = seriesPointsMap.get(seriesIndex)
      const targetPoints = seriesTargetPointsMap.get(seriesIndex)
      if (!points || points.length < 2) return

      const color = s.color || SERIES_COLORS[seriesIndex % SERIES_COLORS.length]

      // 根据动画类型计算线条透明度（使用缓动）
      let lineOpacity = 1
      if (animationType === 'fade') {
        lineOpacity = easedProgress
      } else if (animationType === 'rise') {
        lineOpacity = 0.3 + 0.7 * easedProgress
      } else if (animationType !== 'none') {
        lineOpacity = 0.3 + 0.7 * easedProgress
      }

      // 根据动画类型选择要绘制的点
      let drawPoints = points
      if (animationType === 'expand' && targetPoints) {
        drawPoints = targetPoints
      } else if (animationType === 'grow' && targetPoints) {
        // 生长动画：点一个个出现（阶梯式）
        const visibleCount = Math.ceil(targetPoints.length * easedProgress)
        drawPoints = targetPoints.slice(0, Math.max(2, visibleCount))
      } else if (animationType === 'draw' && targetPoints) {
        // 绘制动画：平滑绘制，支持绘制到两点之间的位置
        const progress = easedProgress * (targetPoints.length - 1)
        const fullPoints = Math.floor(progress)
        const partialProgress = progress - fullPoints

        // 获取完整的点
        drawPoints = targetPoints.slice(0, fullPoints + 1)

        // 如果还有下一个点，插值计算当前绘制位置
        if (fullPoints < targetPoints.length - 1 && partialProgress > 0) {
          const currentPoint = targetPoints[fullPoints]!
          const nextPoint = targetPoints[fullPoints + 1]!
          const interpolatedPoint = {
            x: currentPoint.x + (nextPoint.x - currentPoint.x) * partialProgress,
            y: currentPoint.y + (nextPoint.y - currentPoint.y) * partialProgress
          }
          drawPoints = [...drawPoints, interpolatedPoint]
        }
      } else if (animationType === 'wave') {
        // 波浪动画：使用动画后的点位置
        drawPoints = points
      }

      // 绘制线条
      const lineDash = s.lineStyle?.type === 'dashed' ? [6, 4] :
        s.lineStyle?.type === 'dotted' ? [2, 2] : undefined

      // 展开动画：先设置裁剪区域
      if (animationType === 'expand') {
        renderer.save()
        const clipWidth = horizontal
          ? chartRect.height * animationProgress
          : chartRect.width * animationProgress
        if (horizontal) {
          renderer.clip({ x: chartRect.x, y: chartRect.y, width: chartRect.width, height: clipWidth })
        } else {
          renderer.clip({ x: chartRect.x, y: chartRect.y, width: clipWidth, height: chartRect.height })
        }
      }

      renderer.drawLine(drawPoints, {
        stroke: color,
        lineWidth: s.lineStyle?.width || 2,
        lineDash,
        opacity: lineOpacity,
      }, s.smooth)

      // draw 动画：绘制"笔尖"发光效果
      if (animationType === 'draw' && drawPoints.length > 0 && animationProgress < 1) {
        const tipPoint = drawPoints[drawPoints.length - 1]!
        // 发光圈
        renderer.drawCircle(
          { x: tipPoint.x, y: tipPoint.y, radius: 8 },
          { fill: color, opacity: 0.3 }
        )
        renderer.drawCircle(
          { x: tipPoint.x, y: tipPoint.y, radius: 4 },
          { fill: color, opacity: 0.8 }
        )
      }

      if (animationType === 'expand') {
        renderer.restore()
      }

      // 绘制数据点
      if (s.showSymbol !== false) {
        let symbolOpacity = 1
        let symbolScale = 1

        if (animationType === 'rise' || animationType === 'expand') {
          // 延迟出现
          if (animationProgress > 0.5) {
            symbolOpacity = (animationProgress - 0.5) * 2
            symbolScale = symbolOpacity
          } else {
            symbolOpacity = 0
          }
        } else if (animationType === 'fade') {
          symbolOpacity = animationProgress
          symbolScale = 1
        } else if (animationType === 'grow' || animationType === 'draw') {
          symbolScale = 1
        } else if (animationType === 'wave') {
          // 波浪动画：数据点跟随弹起
          symbolOpacity = 1
          symbolScale = 1
        }

        if (symbolOpacity > 0) {
          const pointsToDraw = (animationType === 'grow' || animationType === 'draw') ? drawPoints : points
          const symbolType = s.symbol || 'circle'

          // symbol: 'none' 或 showSymbol: false 不绘制数据点
          if (symbolType === 'none') return

          pointsToDraw.forEach((point, idx) => {
            // grow/draw 动画：点依次出现
            if ((animationType === 'grow' || animationType === 'draw') && targetPoints) {
              const pointProgress = (idx / targetPoints.length)
              if (pointProgress > animationProgress) return
            }

            // wave 动画：点依次弹起时显示
            if (animationType === 'wave' && targetPoints) {
              const pointDelay = idx / Math.max(targetPoints.length - 1, 1)
              const pointProgress = Math.max(0, (animationProgress - pointDelay * 0.6) / (1 - pointDelay * 0.6))
              if (pointProgress < 0.1) return // 还没开始弹起的点不显示
            }

            const size = (s.symbolSize || 4) * symbolScale
            if (size > 0.5) {
              // 根据 symbol 类型绘制不同形状
              if (symbolType === 'rect') {
                renderer.drawRect(
                  { x: point.x - size, y: point.y - size, width: size * 2, height: size * 2 },
                  { fill: color, stroke: colors.background, lineWidth: 1, opacity: symbolOpacity }
                )
              } else if (symbolType === 'triangle') {
                const h = size * 1.8
                renderer.drawPolygon([
                  { x: point.x, y: point.y - h / 2 },
                  { x: point.x - size, y: point.y + h / 2 },
                  { x: point.x + size, y: point.y + h / 2 }
                ], { fill: color, opacity: symbolOpacity })
              } else if (symbolType === 'diamond') {
                renderer.drawPolygon([
                  { x: point.x, y: point.y - size * 1.2 },
                  { x: point.x + size, y: point.y },
                  { x: point.x, y: point.y + size * 1.2 },
                  { x: point.x - size, y: point.y }
                ], { fill: color, opacity: symbolOpacity })
              } else {
                // 默认圆形 - 实心填充
                renderer.drawCircle(
                  { x: point.x, y: point.y, radius: size },
                  { fill: color, stroke: colors.background, lineWidth: 2, opacity: symbolOpacity }
                )
              }
            }
          })
        }
      }
    })
  }

  private drawScatterSeries(
    series: SeriesData[],
    yRanges: { min: number; max: number }[],
    labels: string[]
  ): void {
    const { renderer, chartRect, colors, animationProgress } = this
    const barGroupWidth = chartRect.width / Math.max(labels.length, 1)

    // 缓动函数
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const easeOutBack = (t: number) => {
      const c1 = 1.70158
      const c3 = c1 + 1
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
    }
    const easeOutElastic = (t: number) => {
      if (t === 0 || t === 1) return t
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1
    }

    series.forEach((s, seriesIndex) => {
      const color = s.color || SERIES_COLORS[seriesIndex % SERIES_COLORS.length]
      const yRange = yRanges[s.yAxisIndex || 0] || yRanges[0]!
      const baseRadius = s.symbolSize || 8
      const symbol: SymbolType = (s.symbol as SymbolType) || 'circle'
      const animType = s.scatterAnimationType || 'scale'

      s.data.forEach((value, dataIndex) => {
        const numValue = getNumericValue(value)
        if (numValue === null) return

        const x = chartRect.x + barGroupWidth * dataIndex + barGroupWidth / 2
        const normalizedValue = (numValue - yRange.min) / (yRange.max - yRange.min)
        const targetY = chartRect.y + chartRect.height - chartRect.height * normalizedValue

        // 根据动画类型计算进度
        const delay = animType === 'cascade' ? dataIndex / (s.data.length + 3) : dataIndex / (s.data.length + 8)
        const progress = Math.max(0, Math.min(1, (animationProgress - delay) / (1 - delay * 0.5)))

        let y = targetY
        let scale = 1
        let opacity = 1

        switch (animType) {
          case 'scale':
            scale = easeOutBack(progress)
            opacity = easeOutCubic(progress)
            break
          case 'fade':
            opacity = easeOutCubic(progress)
            break
          case 'rise':
            y = chartRect.y + chartRect.height - (chartRect.y + chartRect.height - targetY) * easeOutBack(progress)
            opacity = easeOutCubic(progress)
            break
          case 'ripple':
            scale = easeOutElastic(progress)
            opacity = easeOutCubic(progress)
            break
          case 'cascade':
            scale = easeOutBack(progress)
            opacity = progress > 0 ? 1 : 0
            break
          case 'none':
            break
        }

        const radius = baseRadius * scale

        // Hover 效果（平滑过渡）
        const isHover = dataIndex === this.hoverIndex
        const hoverKey = `scatter-${seriesIndex}-${dataIndex}`
        const targetScale = isHover ? 1.4 : 1
        const currentScale = this.hoverOffsets.get(hoverKey) ?? 1
        const scaleDiff = targetScale - currentScale
        const newScale = Math.abs(scaleDiff) < 0.02 ? targetScale : currentScale + scaleDiff * 0.1
        this.hoverOffsets.set(hoverKey, newScale)

        if (Math.abs(scaleDiff) > 0.02) {
          this.scheduleHoverAnimation()
        }

        const finalRadius = radius * newScale
        const fillColor = isHover && color ? this.lightenColor(color) : color

        if (radius > 0.5 && opacity > 0) {
          this.drawSymbol(renderer, x, y, finalRadius, symbol, fillColor, colors.background, opacity)
        }
      })
    })
  }

  // ============== DataZoom 绑制 ==============

  private drawDataZoom(labels: string[], series: SeriesData[]): void {
    const { renderer, chartRect, colors, options, height } = this
    const config = options.dataZoom
    if (!config?.show) return

    const zoomHeight = config.height ?? 30
    const padding = this.getPadding()

    // DataZoom 区域位置（在图表下方）
    const zoomRect = {
      x: chartRect.x,
      y: height - padding.bottom + 45,
      width: chartRect.width,
      height: zoomHeight
    }

    // 背景
    const bgColor = config.backgroundColor || (colors.background === '#ffffff' ? '#f5f5f5' : '#2a2a2a')
    renderer.drawRect(zoomRect, { fill: bgColor, stroke: colors.grid, lineWidth: 1 })

    // 绘制缩略数据预览（小型折线图）
    if (series.length > 0 && labels.length > 0) {
      const firstSeries = series.find(s => s.type === 'line' || s.type === 'bar' || s.type === 'candlestick')
      if (firstSeries) {
        const data = firstSeries.data as any[]
        const values = data.map((d) => {
          if (d === null) return null
          if (typeof d === 'number') return d
          if (Array.isArray(d) && d.length === 4) return d[1]
          if (Array.isArray(d) && d.length === 2) return d[1]
          return d.value ?? d.close ?? d.y ?? 0
        }).filter(v => v !== null) as number[]

        if (values.length > 1) {
          const minVal = Math.min(...values)
          const maxVal = Math.max(...values)
          const range = maxVal - minVal || 1

          // 绘制预览线段
          const points: { x: number; y: number }[] = values.map((v, i) => ({
            x: zoomRect.x + (i / (values.length - 1)) * zoomRect.width,
            y: zoomRect.y + zoomRect.height - ((v - minVal) / range) * (zoomRect.height - 4) - 2
          }))

          renderer.drawLine(points, { stroke: colors.textSecondary, lineWidth: 1 })
        }
      }
    }

    // 选中区域
    const fillerColor = config.fillerColor || (colors.background === '#ffffff' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.3)')
    const startX = zoomRect.x + (this.dataZoomStart / 100) * zoomRect.width
    const endX = zoomRect.x + (this.dataZoomEnd / 100) * zoomRect.width
    const selectedWidth = endX - startX

    renderer.drawRect(
      { x: startX, y: zoomRect.y, width: selectedWidth, height: zoomRect.height },
      { fill: fillerColor }
    )

    // 边框线
    const borderColor = config.borderColor || '#3b82f6'
    renderer.drawRect(
      { x: startX, y: zoomRect.y, width: selectedWidth, height: zoomRect.height },
      { fill: 'transparent', stroke: borderColor, lineWidth: 1 }
    )

    // 左右手柄
    const handleColor = config.handleStyle?.color || '#3b82f6'
    const handleWidth = 8
    const handleHeight = zoomRect.height - 4

    // 左手柄
    renderer.drawRect(
      { x: startX - handleWidth / 2, y: zoomRect.y + 2, width: handleWidth, height: handleHeight },
      { fill: handleColor, stroke: '#fff', lineWidth: 1 }
    )

    // 右手柄
    renderer.drawRect(
      { x: endX - handleWidth / 2, y: zoomRect.y + 2, width: handleWidth, height: handleHeight },
      { fill: handleColor, stroke: '#fff', lineWidth: 1 }
    )
  }

  // 获取 DataZoom 区域
  private getDataZoomRect(): { x: number; y: number; width: number; height: number } | null {
    const { options, chartRect, height } = this
    const config = options.dataZoom
    if (!config?.show) return null

    const zoomHeight = config.height ?? 30
    const padding = this.getPadding()

    return {
      x: chartRect.x,
      y: height - padding.bottom + 45,
      width: chartRect.width,
      height: zoomHeight
    }
  }

  // 处理 DataZoom 鼠标事件
  private handleDataZoomMouseDown(e: MouseEvent): boolean {
    const zoomRect = this.getDataZoomRect()
    if (!zoomRect) return false

    const rect = this.container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 检查是否在 DataZoom 区域内
    if (y < zoomRect.y || y > zoomRect.y + zoomRect.height) return false
    if (x < zoomRect.x || x > zoomRect.x + zoomRect.width) return false

    const startX = zoomRect.x + (this.dataZoomStart / 100) * zoomRect.width
    const endX = zoomRect.x + (this.dataZoomEnd / 100) * zoomRect.width
    const handleWidth = 12

    this.dataZoomDragStartX = x
    this.dataZoomDragStartValues = { start: this.dataZoomStart, end: this.dataZoomEnd }

    // 判断拖拽类型
    if (Math.abs(x - startX) < handleWidth) {
      this.dataZoomDragging = 'left'
    } else if (Math.abs(x - endX) < handleWidth) {
      this.dataZoomDragging = 'right'
    } else if (x > startX && x < endX) {
      this.dataZoomDragging = 'middle'
    } else {
      return false
    }

    return true
  }

  private handleDataZoomMouseMove(e: MouseEvent): void {
    if (!this.dataZoomDragging) return

    const zoomRect = this.getDataZoomRect()
    if (!zoomRect) return

    const rect = this.container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const deltaX = x - this.dataZoomDragStartX
    const deltaPercent = (deltaX / zoomRect.width) * 100

    const { start: origStart, end: origEnd } = this.dataZoomDragStartValues
    let newStart = this.dataZoomStart
    let newEnd = this.dataZoomEnd

    switch (this.dataZoomDragging) {
      case 'left':
        newStart = Math.max(0, Math.min(origEnd - 5, origStart + deltaPercent))
        break
      case 'right':
        newEnd = Math.min(100, Math.max(origStart + 5, origEnd + deltaPercent))
        break
      case 'middle':
        const range = origEnd - origStart
        newStart = Math.max(0, Math.min(100 - range, origStart + deltaPercent))
        newEnd = newStart + range
        break
    }

    if (newStart !== this.dataZoomStart || newEnd !== this.dataZoomEnd) {
      this.dataZoomStart = newStart
      this.dataZoomEnd = newEnd
      this.render()
    }
  }

  private handleDataZoomMouseUp(): void {
    this.dataZoomDragging = null
  }

  // 绘制不同形状的散点（支持 Canvas 和 SVG）
  private drawSymbol(
    renderer: any, x: number, y: number, size: number,
    symbol: SymbolType, fill: string | undefined, stroke: string, opacity: number
  ): void {
    const fillColor = fill || '#999'
    const style = { fill: fillColor, stroke, lineWidth: 2, opacity }

    switch (symbol) {
      case 'circle':
        renderer.drawCircle({ x, y, radius: size }, style)
        break
      case 'rect':
        renderer.drawRect({ x: x - size, y: y - size, width: size * 2, height: size * 2 }, style)
        break
      case 'diamond':
        renderer.drawPolygon([
          { x, y: y - size * 1.2 },
          { x: x + size, y },
          { x, y: y + size * 1.2 },
          { x: x - size, y }
        ], style)
        break
      case 'triangle':
        renderer.drawPolygon([
          { x, y: y - size * 1.1 },
          { x: x + size, y: y + size * 0.8 },
          { x: x - size, y: y + size * 0.8 }
        ], style)
        break
      case 'pin':
        // 绘制圆形头部
        renderer.drawCircle({ x, y: y - size * 0.5, radius: size * 0.7 }, style)
        // 绘制三角形尾部
        renderer.drawPolygon([
          { x, y: y + size * 0.2 },
          { x: x - size * 0.4, y: y + size },
          { x: x + size * 0.4, y: y + size }
        ], style)
        break
      case 'arrow':
        renderer.drawPolygon([
          { x, y: y - size * 1.2 },
          { x: x + size * 0.7, y: y + size * 0.3 },
          { x, y: y - size * 0.2 },
          { x: x - size * 0.7, y: y + size * 0.3 }
        ], style)
        break
    }
  }

  // ============== K线图绑制 ==============

  private drawCandlestickSeries(
    series: SeriesData[],
    yRanges: { min: number; max: number }[],
    labels: string[]
  ): void {
    const { renderer, chartRect, animationProgress } = this
    const candleGroupWidth = chartRect.width / Math.max(labels.length, 1)

    // 缓动函数
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const easeOutBack = (t: number) => {
      const c1 = 1.70158
      const c3 = c1 + 1
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
    }

    series.forEach((s) => {
      const yRange = yRanges[s.yAxisIndex || 0] || yRanges[0]!
      const animType = s.candlestickAnimationType || 'grow'
      const upColor = s.upColor || '#ec0000'     // 上涨颜色（红色）
      const downColor = s.downColor || '#00da3c' // 下跌颜色（绿色）

      // 计算蜡烛宽度
      let candleWidth: number
      if (typeof s.candleWidth === 'number') {
        candleWidth = s.candleWidth
      } else if (typeof s.candleWidth === 'string' && s.candleWidth.endsWith('%')) {
        candleWidth = candleGroupWidth * parseFloat(s.candleWidth) / 100
      } else {
        candleWidth = Math.min(candleGroupWidth * 0.6, 20)  // 默认60%宽度，最大20px
      }

      const data = s.data as CandlestickDataPoint[]

      data.forEach((item, dataIndex) => {
        if (!item) return

        // 解析数据
        let open: number, close: number, low: number, high: number
        if (Array.isArray(item)) {
          [open, close, low, high] = item
        } else {
          open = item.open
          close = item.close
          low = item.low
          high = item.high
        }

        const isUp = close >= open
        const color = isUp ? upColor : downColor

        // 计算位置
        const x = chartRect.x + candleGroupWidth * dataIndex + candleGroupWidth / 2

        // 计算Y坐标
        const normalizeY = (value: number) => {
          const normalized = (value - yRange.min) / (yRange.max - yRange.min)
          return chartRect.y + chartRect.height - chartRect.height * normalized
        }

        const yOpen = normalizeY(open)
        const yClose = normalizeY(close)
        const yLow = normalizeY(low)
        const yHigh = normalizeY(high)

        // 蜡烛体的顶部和底部
        const bodyTop = Math.min(yOpen, yClose)
        const bodyBottom = Math.max(yOpen, yClose)
        const bodyHeight = Math.max(bodyBottom - bodyTop, 1)  // 至少1px

        // 计算动画进度
        let progress = animationProgress
        let opacity = 1

        switch (animType) {
          case 'cascade': {
            // 级联动画：从左到右依次出现
            const delay = dataIndex / data.length * 0.6
            progress = Math.max(0, Math.min(1, (animationProgress - delay) / 0.4))
            progress = easeOutCubic(progress)
            opacity = progress
            break
          }
          case 'fade': {
            // 淡入动画
            opacity = easeOutCubic(animationProgress)
            break
          }
          case 'rise': {
            // 从底部升起
            progress = easeOutCubic(animationProgress)
            break
          }
          case 'grow':
          default: {
            // 从中心向上下生长
            progress = easeOutBack(animationProgress)
            break
          }
        }

        if (opacity <= 0) return

        // 根据动画类型计算实际绘制位置
        let drawBodyTop = bodyTop
        let drawBodyHeight = bodyHeight
        let drawYHigh = yHigh
        let drawYLow = yLow

        if (animType === 'grow') {
          // 从中心向上下生长
          const centerY = (bodyTop + bodyBottom) / 2
          drawBodyTop = centerY - (bodyHeight / 2) * progress
          drawBodyHeight = bodyHeight * progress

          const wickCenter = (yHigh + yLow) / 2
          drawYHigh = wickCenter - (wickCenter - yHigh) * progress
          drawYLow = wickCenter + (yLow - wickCenter) * progress
        } else if (animType === 'rise') {
          // 从底部升起
          const baseY = chartRect.y + chartRect.height
          drawBodyTop = baseY - (baseY - bodyTop) * progress
          drawYHigh = baseY - (baseY - yHigh) * progress
          drawYLow = baseY - (baseY - yLow) * progress
          drawBodyHeight = bodyHeight * progress
        }

        // 绘制上下影线（芯线）
        const wickWidth = 1
        const wickX = x - wickWidth / 2

        // 上影线
        if (drawYHigh < drawBodyTop) {
          renderer.drawRect(
            { x: wickX, y: drawYHigh, width: wickWidth, height: drawBodyTop - drawYHigh },
            { fill: color, opacity }
          )
        }

        // 下影线
        const drawBodyBottom = drawBodyTop + drawBodyHeight
        if (drawYLow > drawBodyBottom) {
          renderer.drawRect(
            { x: wickX, y: drawBodyBottom, width: wickWidth, height: drawYLow - drawBodyBottom },
            { fill: color, opacity }
          )
        }

        // 绘制蜡烛体
        const isHover = this.hoverIndex === dataIndex
        const hoverScale = isHover ? 1.1 : 1
        const finalCandleWidth = candleWidth * hoverScale
        const finalBodyX = x - finalCandleWidth / 2

        if (isUp) {
          // 阳线（上涨）：实心
          renderer.drawRect(
            { x: finalBodyX, y: drawBodyTop, width: finalCandleWidth, height: Math.max(drawBodyHeight, 1) },
            { fill: color, stroke: color, lineWidth: 1, opacity }
          )
        } else {
          // 阴线（下跌）：实心
          renderer.drawRect(
            { x: finalBodyX, y: drawBodyTop, width: finalCandleWidth, height: Math.max(drawBodyHeight, 1) },
            { fill: color, opacity }
          )
        }
      })
    })
  }

  // ============== 饼图绑制 ==============

  private drawPieSeries(series: SeriesData[]): void {
    const { renderer, animationProgress, options, width, height } = this

    // 缓动函数
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const easeOutBounce = (t: number) => {
      const n1 = 7.5625, d1 = 2.75
      if (t < 1 / d1) return n1 * t * t
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
      return n1 * (t -= 2.625 / d1) * t + 0.984375
    }

    series.forEach((s, seriesIndex) => {
      const pieData = s.data as PieDataItem[]
      if (!pieData || pieData.length === 0) return

      // 计算饼图中心和半径 - 根据是否显示标签动态调整
      const showLabel = s.label?.show !== false

      // 动态计算标签空间：有标签时预留空间，无标签时最小化边距
      const basePadding = 15  // 基础边距
      const labelSpace = showLabel ? Math.min(width, height) * 0.18 : 0  // 标签空间为尺寸的18%

      const labelPadding = {
        left: basePadding + labelSpace,
        right: basePadding + labelSpace,
        top: basePadding,
        bottom: basePadding
      }

      const availableWidth = width - labelPadding.left - labelPadding.right
      const availableHeight = height - labelPadding.top - labelPadding.bottom

      // 起始角度和总角度
      const baseStartAngle = s.startAngle ?? -Math.PI / 2
      const sweepAngle = s.sweepAngle ?? Math.PI * 2  // 默认完整圆，Math.PI 为半圆

      // 智能居中：根据扇形范围计算最佳中心点
      let centerX = width / 2
      let centerY = height / 2

      // 对于非完整圆，计算扇形的边界来居中
      if (sweepAngle < Math.PI * 2 - 0.01) {
        const endAngle = baseStartAngle + sweepAngle
        const midAngle = baseStartAngle + sweepAngle / 2

        // 计算扇形在各方向的最大延伸
        const angles = [baseStartAngle, endAngle, midAngle]
        // 添加关键角度点（0, π/2, π, 3π/2）如果在范围内
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
          if ((a >= baseStartAngle && a <= endAngle) ||
            (a + Math.PI * 2 >= baseStartAngle && a + Math.PI * 2 <= endAngle)) {
            angles.push(a)
          }
        }

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
        angles.forEach(a => {
          const x = Math.cos(a)
          const y = Math.sin(a)
          minX = Math.min(minX, x)
          maxX = Math.max(maxX, x)
          minY = Math.min(minY, y)
          maxY = Math.max(maxY, y)
        })
        // 包含圆心
        minX = Math.min(minX, 0)
        maxX = Math.max(maxX, 0)
        minY = Math.min(minY, 0)
        maxY = Math.max(maxY, 0)

        // 根据扇形边界调整中心点
        const rangeX = maxX - minX
        const rangeY = maxY - minY
        const offsetX = -(minX + maxX) / 2
        const offsetY = -(minY + maxY) / 2

        // 计算适合扇形的最大半径
        const scaleX = rangeX > 0 ? availableWidth / rangeX : availableWidth
        const scaleY = rangeY > 0 ? availableHeight / rangeY : availableHeight
        const maxRadius = Math.min(scaleX, scaleY) / 2 * 0.92

        centerX = width / 2 + offsetX * maxRadius
        centerY = height / 2 + offsetY * maxRadius
      }

      // 计算最大半径
      const maxRadius = sweepAngle < Math.PI * 2 - 0.01
        ? Math.min(availableWidth, availableHeight) / 2 * 0.85  // 非完整圆稍小一点
        : Math.min(availableWidth / 2, availableHeight / 2) * 0.95

      // 解析半径配置 - 支持嵌套环形图
      let innerRadius = 0
      let outerRadius = maxRadius
      if (s.radius !== undefined) {
        if (Array.isArray(s.radius)) {
          innerRadius = s.radius[0] * maxRadius
          outerRadius = s.radius[1] * maxRadius
        } else {
          outerRadius = s.radius * maxRadius
        }
      }

      // 缝隙角度（弧度）
      const padAngle = s.padAngle ?? 0
      // 圆角半径
      const cornerRadius = s.cornerRadius ?? 0

      // 计算总值
      const total = pieData.reduce((sum, item) => sum + item.value, 0)
      if (total === 0) return

      // 动画类型
      const pieAnimationType = s.pieAnimationType || 'expand'
      const easedProgress = easeOutCubic(animationProgress)

      let startAngle = baseStartAngle

      // 获取当前系列在所有系列中的索引
      const allSeriesIndex = (this.options.series || []).indexOf(s)

      pieData.forEach((item, i) => {
        // 计算扇形角度，减去缝隙
        const fullSliceAngle = (item.value / total) * sweepAngle - padAngle
        // 只有当 seriesIndex 和 dataIndex 都匹配，且没有 noHover 时才高亮
        const isHover = i === this.hoverIndex && allSeriesIndex === this.hoverSeriesIndex && !item.noHover
        const color = item.color || s.color || SERIES_COLORS[(seriesIndex * pieData.length + i) % SERIES_COLORS.length]

        // 根据动画类型计算参数
        let sliceAngle = fullSliceAngle
        let opacity = 1
        let radiusScale = 1

        // 弹性缓动函数
        const easeOutElastic = (t: number) => {
          if (t === 0 || t === 1) return t
          const c4 = (2 * Math.PI) / 3
          return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
        }

        // 计算每个扇形的延迟（用于级联动画）
        const sliceDelay = i / pieData.length
        const sliceProgress = Math.max(0, Math.min(1, (animationProgress - sliceDelay * 0.6) / (1 - sliceDelay * 0.6)))
        const easedSliceProgress = easeOutCubic(sliceProgress)

        switch (pieAnimationType) {
          case 'expand':
            // 整体扇形展开
            sliceAngle = fullSliceAngle * easedProgress
            break
          case 'scale':
            // 整体缩放
            sliceAngle = fullSliceAngle
            radiusScale = easedProgress
            break
          case 'fade':
            // 淡入
            sliceAngle = fullSliceAngle
            opacity = easedProgress
            break
          case 'bounce':
            // 回弹缩放
            sliceAngle = fullSliceAngle
            radiusScale = easeOutBounce(animationProgress)
            break
          case 'spin':
            // 旋转进入：所有扇形一起旋转，同时展开
            sliceAngle = fullSliceAngle * easedProgress
            // startAngle 会在后面被修改以实现旋转效果
            break
          case 'cascade':
            // 扇形依次展开：每个扇形依次从0度展开到目标角度
            sliceAngle = fullSliceAngle * easedSliceProgress
            if (sliceProgress <= 0) opacity = 0
            break
          case 'fan':
            // 扇形依次弹出：每个扇形依次从中心弹出，带弹性效果
            sliceAngle = fullSliceAngle
            radiusScale = easeOutElastic(sliceProgress)
            if (sliceProgress <= 0) opacity = 0
            break
          case 'none':
            sliceAngle = fullSliceAngle
            break
        }

        // spin 动画：添加旋转偏移
        let animatedStartAngle = startAngle
        if (pieAnimationType === 'spin') {
          // 从 -360度 旋转到 0度
          const rotationOffset = (1 - easedProgress) * Math.PI * 2
          animatedStartAngle = startAngle - rotationOffset
        }

        const endAngle = animatedStartAngle + sliceAngle

        // 悬停时扇形外移（带平滑动画效果）
        const sliceKey = `${allSeriesIndex}-${i}`
        const targetOffset = isHover ? 10 : 0
        const currentOffset = this.hoverOffsets.get(sliceKey) ?? 0

        // 平滑过渡到目标偏移
        const offsetDiff = targetOffset - currentOffset
        const newOffset = Math.abs(offsetDiff) < 0.5
          ? targetOffset
          : currentOffset + offsetDiff * 0.15  // 缓动系数，越小越慢
        this.hoverOffsets.set(sliceKey, newOffset)

        // 如果还在动画中，请求下一帧
        if (Math.abs(offsetDiff) > 0.5) {
          this.scheduleHoverAnimation()
        }

        let cx = centerX, cy = centerY
        const midAngleForOffset = startAngle + fullSliceAngle / 2
        cx += Math.cos(midAngleForOffset) * newOffset
        cy += Math.sin(midAngleForOffset) * newOffset

        // 南丁格尔玫瑰图
        let finalOuterRadius = outerRadius * radiusScale
        let finalInnerRadius = innerRadius * radiusScale
        if (s.roseType) {
          const maxVal = Math.max(...pieData.map(d => d.value))
          finalOuterRadius = (innerRadius + (outerRadius - innerRadius) * (item.value / maxVal)) * radiusScale
        }

        // 绘制扇形
        const fillColor = isHover && color ? this.lightenColor(color) : color

        // 使用圆角绘制（需要有内径形成环形）
        if (cornerRadius > 0 && finalInnerRadius > 0) {
          this.drawRoundedSector(
            renderer, cx, cy, finalInnerRadius, finalOuterRadius,
            animatedStartAngle, endAngle, cornerRadius, fillColor || '#999', opacity
          )
        } else {
          renderer.drawSector(
            cx, cy,
            finalInnerRadius,
            finalOuterRadius,
            animatedStartAngle,
            endAngle,
            { fill: fillColor, opacity }
          )
        }

        // 标签和引导线（带动画效果，hover 时跟随扇形移动）
        if (s.label?.show !== false && animationProgress > 0.6) {
          // 标签动画进度（从0.6开始到1结束）
          const labelProgress = Math.min(1, (animationProgress - 0.6) / 0.4)
          const labelOpacity = easeOutCubic(labelProgress)

          // 使用当前扇形的中心角度
          const midAngle = startAngle + fullSliceAngle / 2
          const percent = ((item.value / total) * 100).toFixed(1)
          const labelText = `${item.name}: ${percent}%`

          // 玫瑰图使用实际的外半径，普通饼图使用固定外半径
          const actualOuterRadius = s.roseType ? finalOuterRadius : outerRadius

          // 标签中心点跟随 hover 偏移
          const labelCenterX = cx
          const labelCenterY = cy

          if (s.label?.position === 'inside') {
            const labelRadius = actualOuterRadius * 0.6
            const lx = labelCenterX + Math.cos(midAngle) * labelRadius
            const ly = labelCenterY + Math.sin(midAngle) * labelRadius
            renderer.drawText(
              { x: lx, y: ly, text: item.name },
              { fill: '#fff', fontSize: 11, textAlign: 'center', textBaseline: 'middle', opacity: labelOpacity }
            )
          } else {
            // 外部标签 + 引导线（跟随 hover 偏移）
            // 引导线长度根据饼图大小动态调整
            const direction = Math.cos(midAngle) >= 0 ? 1 : -1
            const length1 = Math.max(8, actualOuterRadius * 0.08)  // 第一段：斜向外
            const length2 = Math.max(12, actualOuterRadius * 0.12) // 第二段：水平

            // 引导线起点（扇形边缘，跟随偏移）
            const lineStartX = labelCenterX + Math.cos(midAngle) * actualOuterRadius
            const lineStartY = labelCenterY + Math.sin(midAngle) * actualOuterRadius

            // 引导线中点（带动画，跟随偏移）
            const animatedLength1 = length1 * labelProgress
            const lineMidX = labelCenterX + Math.cos(midAngle) * (actualOuterRadius + animatedLength1)
            const lineMidY = labelCenterY + Math.sin(midAngle) * (actualOuterRadius + animatedLength1)

            // 引导线终点（水平延伸，带动画）
            const animatedLength2 = length2 * labelProgress
            const lineEndX = lineMidX + direction * animatedLength2
            const lineEndY = lineMidY

            // 绘制引导线
            const lineColor = options.theme === 'dark' ? '#94a3b8' : '#64748b'
            renderer.drawLine(
              [
                { x: lineStartX, y: lineStartY },
                { x: lineMidX, y: lineMidY },
                { x: lineEndX, y: lineEndY },
              ],
              { stroke: lineColor, lineWidth: 1, opacity: labelOpacity }
            )

            // 绘制标签文本（动画完成后显示）
            if (labelProgress > 0.5) {
              const textOpacity = (labelProgress - 0.5) * 2
              renderer.drawText(
                { x: lineEndX + direction * 4, y: lineEndY, text: labelText },
                {
                  fill: options.theme === 'dark' ? '#e2e8f0' : '#1e293b',
                  fontSize: 11,
                  textAlign: direction > 0 ? 'left' : 'right',
                  textBaseline: 'middle',
                  opacity: textOpacity
                }
              )
            }
          }
        }

        // 更新起始角度（包含缝隙）
        startAngle += fullSliceAngle + padAngle
      })
    })
  }

  // ============== 雷达图绑制 ==============

  // 存储雷达图状态用于hover检测
  private radarState: {
    centerX: number
    centerY: number
    radius: number
    startAngle: number
    angleStep: number
    indicators: any[]
    series: SeriesData[]
    dataPoints: { seriesIndex: number; pointIndex: number; x: number; y: number; value: number }[]
  } | null = null

  private drawRadarSeries(series: SeriesData[]): void {
    const { renderer, animationProgress, options, width, height, colors } = this
    const radarConfig = options.radar
    if (!radarConfig?.indicator || radarConfig.indicator.length === 0) return

    // 缓动函数
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const easeOutBack = (t: number) => {
      const c1 = 1.70158
      const c3 = c1 + 1
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
    }

    const indicators = radarConfig.indicator
    const indicatorCount = indicators.length

    // 计算中心点和半径 - 考虑图例和标签空间
    const legendHeight = 35  // 图例区域高度
    const labelPadding = 25  // 指标标签外延距离
    let centerX = width / 2
    let centerY = legendHeight + (height - legendHeight) / 2  // 中心点在图例下方区域的中间
    let radius = Math.min(width - labelPadding * 2, height - legendHeight - labelPadding * 2) / 2 * 0.88

    if (radarConfig.center) {
      const [cx, cy] = radarConfig.center
      centerX = typeof cx === 'string' ? width * parseFloat(cx) / 100 : cx
      centerY = typeof cy === 'string' ? height * parseFloat(cy) / 100 : cy
    }
    if (radarConfig.radius) {
      const r = radarConfig.radius
      radius = typeof r === 'string' ? Math.min(width, height) / 2 * parseFloat(r) / 100 : r
    }

    // 起始角度（默认 90 度，即 12 点钟方向）
    const startAngle = ((radarConfig.startAngle ?? 90) - 90) * Math.PI / 180
    const shape = radarConfig.shape ?? 'polygon'
    const splitNumber = radarConfig.splitNumber ?? 5

    // 计算每个指示器的角度
    const angleStep = (Math.PI * 2) / indicatorCount

    // 存储状态用于hover检测
    this.radarState = {
      centerX, centerY, radius, startAngle, angleStep, indicators, series,
      dataPoints: []
    }

    // 绘制分隔区域
    if (radarConfig.splitArea?.show !== false) {
      const areaColors = radarConfig.splitArea?.areaStyle?.color ||
        (colors.background === '#ffffff'
          ? ['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.05)']
          : ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.05)'])

      for (let i = splitNumber; i > 0; i--) {
        const layerRadius = radius * (i / splitNumber)
        const fillColor = areaColors[(splitNumber - i) % areaColors.length]

        if (shape === 'circle') {
          renderer.drawCircle(
            { x: centerX, y: centerY, radius: layerRadius },
            { fill: fillColor, stroke: 'transparent' }
          )
        } else {
          const points: { x: number; y: number }[] = []
          for (let j = 0; j < indicatorCount; j++) {
            const angle = startAngle + j * angleStep
            points.push({
              x: centerX + Math.cos(angle) * layerRadius,
              y: centerY + Math.sin(angle) * layerRadius
            })
          }
          renderer.drawPolygon(points, { fill: fillColor })
        }
      }
    }

    // 绘制分隔线
    if (radarConfig.splitLine?.show !== false) {
      const lineColor = radarConfig.splitLine?.lineStyle?.color || colors.grid
      const lineWidth = radarConfig.splitLine?.lineStyle?.width || 1

      for (let i = 1; i <= splitNumber; i++) {
        const layerRadius = radius * (i / splitNumber)

        if (shape === 'circle') {
          renderer.drawCircle(
            { x: centerX, y: centerY, radius: layerRadius },
            { fill: 'transparent', stroke: lineColor, lineWidth }
          )
        } else {
          const points: { x: number; y: number }[] = []
          for (let j = 0; j < indicatorCount; j++) {
            const angle = startAngle + j * angleStep
            points.push({
              x: centerX + Math.cos(angle) * layerRadius,
              y: centerY + Math.sin(angle) * layerRadius
            })
          }
          points.push(points[0]!) // 闭合
          renderer.drawLine(points, { stroke: lineColor, lineWidth })
        }
      }
    }

    // 绘制轴线
    if (radarConfig.axisLine?.show !== false) {
      const lineColor = radarConfig.axisLine?.lineStyle?.color || colors.grid
      const lineWidth = radarConfig.axisLine?.lineStyle?.width || 1

      for (let i = 0; i < indicatorCount; i++) {
        const angle = startAngle + i * angleStep
        const endX = centerX + Math.cos(angle) * radius
        const endY = centerY + Math.sin(angle) * radius

        renderer.drawLine(
          [{ x: centerX, y: centerY }, { x: endX, y: endY }],
          { stroke: lineColor, lineWidth }
        )
      }
    }

    // 绘制指示器名称
    if (radarConfig.axisName?.show !== false) {
      const nameColor = radarConfig.axisName?.color || colors.textSecondary  // 使用次要颜色，更柔和
      const fontSize = radarConfig.axisName?.fontSize || 10  // 默认字号减小

      indicators.forEach((indicator, i) => {
        const angle = startAngle + i * angleStep
        const labelRadius = radius + 10  // 减小标签距离
        const x = centerX + Math.cos(angle) * labelRadius
        const y = centerY + Math.sin(angle) * labelRadius

        // 根据角度调整文本对齐
        let textAlign: 'left' | 'center' | 'right' = 'center'
        if (Math.abs(Math.cos(angle)) > 0.1) {
          textAlign = Math.cos(angle) > 0 ? 'left' : 'right'
        }

        renderer.drawText(
          { x, y, text: indicator.name },
          { fill: nameColor, fontSize, textAlign, textBaseline: 'middle' }
        )
      })
    }

    // 绘制数据系列
    series.forEach((s, seriesIndex) => {
      const data = s.data as number[]
      if (!data || data.length === 0) return

      const color = s.color || SERIES_COLORS[seriesIndex % SERIES_COLORS.length]
      const animType = s.radarAnimationType || 'scale'
      const areaOpacity = s.areaOpacity ?? 0.3
      const showDataPoints = s.showDataPoints !== false

      // 计算动画进度
      const easedProgress = animType === 'scale' ? easeOutBack(animationProgress) : easeOutCubic(animationProgress)

      // 计算数据点位置
      const points: { x: number; y: number }[] = []

      data.forEach((value, i) => {
        if (i >= indicatorCount) return

        const indicator = indicators[i]!
        const max = indicator.max ?? Math.max(...(data as number[]))
        const min = indicator.min ?? 0
        const normalizedValue = (value - min) / (max - min)

        const angle = startAngle + i * angleStep
        let pointRadius = radius * normalizedValue

        // 应用动画
        switch (animType) {
          case 'scale':
            pointRadius *= easedProgress
            break
          case 'rotate':
            // 旋转动画：角度随进度变化
            const rotateAngle = angle - (1 - easedProgress) * Math.PI * 2
            points.push({
              x: centerX + Math.cos(rotateAngle) * pointRadius,
              y: centerY + Math.sin(rotateAngle) * pointRadius
            })
            return
          case 'unfold':
            // 依次展开
            const pointDelay = i / indicatorCount
            const pointProgress = Math.max(0, Math.min(1, (animationProgress - pointDelay * 0.5) / (1 - pointDelay * 0.5)))
            pointRadius *= easeOutCubic(pointProgress)
            break
          case 'fade':
            // 淡入（半径不变，透明度在下面处理）
            break
        }

        points.push({
          x: centerX + Math.cos(angle) * pointRadius,
          y: centerY + Math.sin(angle) * pointRadius
        })
      })

      if (points.length === 0) return

      // 存储数据点位置用于hover检测
      const seriesData = s.data as number[]
      points.forEach((point, i) => {
        if (this.radarState) {
          this.radarState.dataPoints.push({
            seriesIndex,
            pointIndex: i,
            x: point.x,
            y: point.y,
            value: seriesData[i] ?? 0
          })
        }
      })

      // 计算透明度
      let opacity = 1
      if (animType === 'fade') {
        opacity = easedProgress
      }

      // 检查是否有hover的系列
      const isHoverSeries = this.hoverSeriesIndex === seriesIndex

      // 绘制填充区域
      if (areaOpacity > 0) {
        renderer.drawPolygon(points, {
          fill: s.areaColor || color,
          opacity: (isHoverSeries ? areaOpacity * 1.5 : areaOpacity) * opacity
        })
      }

      // 绘制边框线
      const linePoints = [...points, points[0]!] // 闭合
      renderer.drawLine(linePoints, {
        stroke: color,
        lineWidth: isHoverSeries ? 3 : 2,
        opacity
      })

      // 绘制数据点
      if (showDataPoints) {
        points.forEach((point, i) => {
          const isHoverPoint = isHoverSeries && this.hoverIndex === i
          const pointRadius = isHoverPoint ? 6 : 4
          const pointColor = isHoverPoint ? this.lightenColor(color || '#999') : color

          renderer.drawCircle(
            { x: point.x, y: point.y, radius: pointRadius },
            { fill: pointColor, stroke: colors.background, lineWidth: 2, opacity }
          )
        })
      }
    })

    // 绘制图例
    this.drawRadarLegend(series)
  }

  private drawRadarLegend(series: SeriesData[]): void {
    const { renderer, colors, width } = this
    const legendY = 16
    const fontSize = 11  // 减小字号

    // 先计算总宽度以便居中
    let totalWidth = 0
    const legendItems: { name: string; color: string; width: number }[] = []

    series.forEach((s, i) => {
      const color = s.color || SERIES_COLORS[i % SERIES_COLORS.length]
      const name = s.name || `系列${i + 1}`
      const textWidth = renderer.measureText(name, fontSize)
      const itemWidth = 16 + textWidth + 14 // 圆点 + 文字 + 间距（更紧凑）
      legendItems.push({ name, color: color || '#999', width: itemWidth })
      totalWidth += itemWidth
    })

    // 居中起始位置
    let legendX = (width - totalWidth) / 2

    legendItems.forEach((item) => {
      const isEnabled = this.enabledSeries.has(item.name)
      const disabledColor = colors.textSecondary

      // 绘制图例标记（小圆点）
      renderer.drawCircle(
        { x: legendX + 5, y: legendY, radius: 4 },
        { fill: isEnabled ? item.color : disabledColor }
      )

      // 绘制图例文字
      renderer.drawText(
        { x: legendX + 13, y: legendY + 3, text: item.name },
        { fill: isEnabled ? colors.text : disabledColor, fontSize }
      )

      legendX += item.width
    })
  }

  // ============== 热力图绑制 ==============

  private drawHeatmapSeries(series: SeriesData[]): void {
    const { renderer, animationProgress, options, width, height, colors } = this
    const xAxisConfig = this.getAxisConfig(options.xAxis, 0)
    const yAxisConfig = this.getAxisConfig(options.yAxis as any, 0)

    const xLabels = xAxisConfig.data || []
    const yLabels = yAxisConfig.data || []

    if (xLabels.length === 0 || yLabels.length === 0) return

    // 缓动函数
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    // 计算绘图区域（留出标签空间）
    const padding = { top: 40, right: 20, bottom: 40, left: 50 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    const cellWidth = chartWidth / xLabels.length
    const cellHeight = chartHeight / yLabels.length

    // 绘制 X 轴标签
    xLabels.forEach((label, i) => {
      const x = padding.left + i * cellWidth + cellWidth / 2
      const y = height - padding.bottom + 20
      renderer.drawText(
        { x, y, text: label },
        { fill: colors.textSecondary, fontSize: 10, textAlign: 'center' }
      )
    })

    // 绘制 Y 轴标签
    yLabels.forEach((label, i) => {
      const x = padding.left - 8
      const y = padding.top + i * cellHeight + cellHeight / 2
      renderer.drawText(
        { x, y, text: label },
        { fill: colors.textSecondary, fontSize: 10, textAlign: 'right', textBaseline: 'middle' }
      )
    })

    // 绘制热力图数据
    series.forEach((s) => {
      const data = s.data as HeatmapDataItem[]
      if (!data || data.length === 0) return

      const renderMode = s.heatmapRenderMode || 'cell'
      const animType = s.heatmapAnimationType || 'fade'
      const colorRange = s.colorRange || ['#313695', '#d73027']  // 蓝到红
      const cellGap = s.cellGap ?? 1
      const showLabel = s.showLabel ?? false
      const contourLevels = s.contourLevels ?? 10

      // 计算数据范围
      let minVal = Infinity, maxVal = -Infinity
      data.forEach(item => {
        const value = Array.isArray(item) ? item[2] : item.value
        minVal = Math.min(minVal, value)
        maxVal = Math.max(maxVal, value)
      })

      // 构建数据网格
      const gridData: number[][] = []
      for (let yi = 0; yi < yLabels.length; yi++) {
        gridData[yi] = new Array(xLabels.length).fill(0)
      }
      data.forEach(item => {
        const xIdx = Array.isArray(item) ? item[0] : item.x
        const yIdx = Array.isArray(item) ? item[1] : item.y
        const value = Array.isArray(item) ? item[2] : item.value
        if (yIdx < yLabels.length && xIdx < xLabels.length) {
          gridData[yIdx]![xIdx] = value
        }
      })

      const easedProgress = easeOutCubic(animationProgress)
      const globalOpacity = animType === 'fade' ? easedProgress : 1

      // 检查是否为 Canvas 模式（smooth/contour 仅支持 Canvas）
      const ctx = (renderer as any).ctx as CanvasRenderingContext2D | undefined
      const canUsePixelMode = ctx && (renderMode === 'smooth' || renderMode === 'contour')

      if (canUsePixelMode) {
        // 平滑/等高线模式：逐像素绘制（仅 Canvas）
        this.drawSmoothHeatmap(
          ctx, padding, chartWidth, chartHeight,
          gridData, xLabels.length, yLabels.length,
          minVal, maxVal, colorRange,
          renderMode === 'contour' ? contourLevels : 0,
          globalOpacity
        )
      } else if ((renderMode === 'smooth' || renderMode === 'contour') && !ctx) {
        // SVG 模式下的平滑/等高线：使用插值生成更多单元格
        const resolution = 3  // 每个原始单元格细分为 3x3
        const subCellWidth = cellWidth / resolution
        const subCellHeight = cellHeight / resolution

        // 双线性插值获取值
        const getValue = (fx: number, fy: number): number => {
          const x0 = Math.floor(fx)
          const y0 = Math.floor(fy)
          const x1 = Math.min(x0 + 1, xLabels.length - 1)
          const y1 = Math.min(y0 + 1, yLabels.length - 1)
          const tx = fx - x0
          const ty = fy - y0
          const v00 = gridData[y0]?.[x0] ?? 0
          const v10 = gridData[y0]?.[x1] ?? 0
          const v01 = gridData[y1]?.[x0] ?? 0
          const v11 = gridData[y1]?.[x1] ?? 0
          const v0 = v00 * (1 - tx) + v10 * tx
          const v1 = v01 * (1 - tx) + v11 * tx
          return v0 * (1 - ty) + v1 * ty
        }

        for (let yi = 0; yi < yLabels.length * resolution; yi++) {
          for (let xi = 0; xi < xLabels.length * resolution; xi++) {
            const fx = xi / resolution
            const fy = yi / resolution
            const value = getValue(fx, fy)
            let ratio = maxVal === minVal ? 0.5 : (value - minVal) / (maxVal - minVal)
            ratio = Math.max(0, Math.min(1, ratio))

            // 等高线模式：量化颜色
            if (renderMode === 'contour' && contourLevels > 0) {
              ratio = Math.floor(ratio * contourLevels) / contourLevels
            }

            const cellColor = this.interpolateColor(colorRange[0], colorRange[1], ratio)
            const x = padding.left + xi * subCellWidth
            const y = padding.top + yi * subCellHeight

            renderer.drawRect(
              { x, y, width: subCellWidth + 0.5, height: subCellHeight + 0.5 },
              { fill: cellColor, opacity: globalOpacity }
            )
          }
        }
      } else {
        // 单元格模式
        data.forEach((item) => {
          const xIdx = Array.isArray(item) ? item[0] : item.x
          const yIdx = Array.isArray(item) ? item[1] : item.y
          const value = Array.isArray(item) ? item[2] : item.value

          if (xIdx >= xLabels.length || yIdx >= yLabels.length) return

          const x = padding.left + xIdx * cellWidth + cellGap / 2
          const y = padding.top + yIdx * cellHeight + cellGap / 2
          const w = cellWidth - cellGap
          const h = cellHeight - cellGap

          const ratio = maxVal === minVal ? 0.5 : (value - minVal) / (maxVal - minVal)
          const cellColor = this.interpolateColor(colorRange[0], colorRange[1], ratio)

          let opacity = 1
          let scale = 1

          switch (animType) {
            case 'fade':
              opacity = easedProgress
              break
            case 'scale':
              scale = easedProgress
              break
            case 'wave':
              const wave = Math.sin((xIdx + yIdx) * 0.5 - animationProgress * Math.PI * 2)
              opacity = 0.3 + 0.7 * Math.max(0, (easedProgress - 0.3 + wave * 0.3))
              break
            case 'cascade':
              const delay = (xIdx + yIdx) / (xLabels.length + yLabels.length)
              opacity = Math.max(0, Math.min(1, (animationProgress - delay * 0.5) / 0.5))
              break
          }

          const actualW = w * scale
          const actualH = h * scale
          const offsetX = (w - actualW) / 2
          const offsetY = (h - actualH) / 2

          renderer.drawRect(
            { x: x + offsetX, y: y + offsetY, width: actualW, height: actualH },
            { fill: cellColor, opacity }
          )

          if (showLabel && opacity > 0.5) {
            const textColor = ratio > 0.5 ? '#fff' : colors.text
            renderer.drawText(
              { x: x + w / 2, y: y + h / 2 + 3, text: String(value) },
              { fill: textColor, fontSize: 10, textAlign: 'center', opacity }
            )
          }
        })
      }
    })

    // 绘制颜色图例
    this.drawHeatmapLegend(series)
  }

  // 绘制平滑/等高线热力图（仅 Canvas 模式）
  private drawSmoothHeatmap(
    ctx: CanvasRenderingContext2D,
    padding: { top: number; right: number; bottom: number; left: number },
    chartWidth: number, chartHeight: number,
    gridData: number[][], xCount: number, yCount: number,
    minVal: number, maxVal: number,
    colorRange: [string, string],
    contourLevels: number,
    opacity: number
  ): void {
    // 创建 ImageData
    const imgWidth = Math.floor(chartWidth)
    const imgHeight = Math.floor(chartHeight)
    if (imgWidth <= 0 || imgHeight <= 0) return

    const imageData = ctx.createImageData(imgWidth, imgHeight)
    const pixels = imageData.data

    // 解析颜色
    const hex2rgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? [
        parseInt(result[1]!, 16),
        parseInt(result[2]!, 16),
        parseInt(result[3]!, 16)
      ] : [0, 0, 0]
    }
    const c1 = hex2rgb(colorRange[0])
    const c2 = hex2rgb(colorRange[1])

    // 双线性插值获取值
    const getValue = (fx: number, fy: number): number => {
      const x0 = Math.floor(fx)
      const y0 = Math.floor(fy)
      const x1 = Math.min(x0 + 1, xCount - 1)
      const y1 = Math.min(y0 + 1, yCount - 1)

      const tx = fx - x0
      const ty = fy - y0

      const v00 = gridData[y0]?.[x0] ?? 0
      const v10 = gridData[y0]?.[x1] ?? 0
      const v01 = gridData[y1]?.[x0] ?? 0
      const v11 = gridData[y1]?.[x1] ?? 0

      // 双线性插值
      const v0 = v00 * (1 - tx) + v10 * tx
      const v1 = v01 * (1 - tx) + v11 * tx
      return v0 * (1 - ty) + v1 * ty
    }

    // 逐像素绘制
    for (let py = 0; py < imgHeight; py++) {
      for (let px = 0; px < imgWidth; px++) {
        // 映射到数据坐标
        const fx = (px / imgWidth) * (xCount - 1)
        const fy = (py / imgHeight) * (yCount - 1)

        let value = getValue(fx, fy)
        let ratio = maxVal === minVal ? 0.5 : (value - minVal) / (maxVal - minVal)
        ratio = Math.max(0, Math.min(1, ratio))

        // 等高线模式：量化颜色
        if (contourLevels > 0) {
          ratio = Math.floor(ratio * contourLevels) / contourLevels
        }

        // 计算颜色
        const r = Math.round(c1[0]! + (c2[0]! - c1[0]!) * ratio)
        const g = Math.round(c1[1]! + (c2[1]! - c1[1]!) * ratio)
        const b = Math.round(c1[2]! + (c2[2]! - c1[2]!) * ratio)

        const idx = (py * imgWidth + px) * 4
        pixels[idx] = r
        pixels[idx + 1] = g
        pixels[idx + 2] = b
        pixels[idx + 3] = Math.round(255 * opacity)
      }
    }

    // 绘制到 canvas
    ctx.putImageData(imageData, padding.left, padding.top)
  }

  // 颜色插值
  private interpolateColor(color1: string, color2: string, ratio: number): string {
    const hex2rgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1]!, 16),
        g: parseInt(result[2]!, 16),
        b: parseInt(result[3]!, 16)
      } : { r: 0, g: 0, b: 0 }
    }

    const c1 = hex2rgb(color1)
    const c2 = hex2rgb(color2)

    const r = Math.round(c1.r + (c2.r - c1.r) * ratio)
    const g = Math.round(c1.g + (c2.g - c1.g) * ratio)
    const b = Math.round(c1.b + (c2.b - c1.b) * ratio)

    return `rgb(${r},${g},${b})`
  }

  private drawHeatmapLegend(series: SeriesData[]): void {
    const { renderer, colors, width } = this
    const s = series[0]
    if (!s) return

    const colorRange = s.colorRange || ['#313695', '#d73027']

    // 绘制渐变色条
    const legendWidth = 100
    const legendHeight = 10
    const legendX = width - legendWidth - 20
    const legendY = 12

    // 绘制渐变（用多个小矩形模拟）
    const steps = 20
    const stepWidth = legendWidth / steps
    for (let i = 0; i < steps; i++) {
      const ratio = i / (steps - 1)
      const color = this.interpolateColor(colorRange[0], colorRange[1], ratio)
      renderer.drawRect(
        { x: legendX + i * stepWidth, y: legendY, width: stepWidth + 1, height: legendHeight },
        { fill: color }
      )
    }

    // 绘制边框
    renderer.drawRect(
      { x: legendX, y: legendY, width: legendWidth, height: legendHeight },
      { stroke: colors.grid, lineWidth: 1 }
    )

    // 绘制标签
    renderer.drawText(
      { x: legendX - 5, y: legendY + 8, text: '低' },
      { fill: colors.textSecondary, fontSize: 9, textAlign: 'right' }
    )
    renderer.drawText(
      { x: legendX + legendWidth + 5, y: legendY + 8, text: '高' },
      { fill: colors.textSecondary, fontSize: 9, textAlign: 'left' }
    )
  }

  // 绘制带圆角的扇形（四角小圆角）- 支持 Canvas 和 SVG
  private drawRoundedSector(
    renderer: any,
    cx: number, cy: number,
    innerRadius: number, outerRadius: number,
    startAngle: number, endAngle: number,
    cornerRadius: number,
    fill: string, opacity: number
  ): void {
    if (innerRadius <= 0) {
      renderer.drawSector(cx, cy, innerRadius, outerRadius, startAngle, endAngle, { fill, opacity })
      return
    }

    const thickness = outerRadius - innerRadius
    const angleSpan = endAngle - startAngle

    // 根据扇形大小动态调整圆角
    const maxCornerByThickness = thickness / 3
    const maxCornerByAngle = (angleSpan * innerRadius) / 4
    const r = Math.min(cornerRadius, maxCornerByThickness, maxCornerByAngle)

    // 圆角太小时回退到普通扇形
    if (r < 1) {
      renderer.drawSector(cx, cy, innerRadius, outerRadius, startAngle, endAngle, { fill, opacity })
      return
    }

    // 尝试使用 Canvas ctx
    const ctx = renderer.ctx
    if (ctx) {
      // Canvas 模式：使用 arcTo 绘制圆角
      ctx.save()
      ctx.globalAlpha = opacity
      ctx.fillStyle = fill
      ctx.beginPath()

      const outerStartAngle = startAngle + r / outerRadius
      const outerEndAngle = endAngle - r / outerRadius
      const innerStartAngle = startAngle + r / innerRadius
      const innerEndAngle = endAngle - r / innerRadius

      ctx.moveTo(
        cx + Math.cos(outerStartAngle) * outerRadius,
        cy + Math.sin(outerStartAngle) * outerRadius
      )
      ctx.arc(cx, cy, outerRadius, outerStartAngle, outerEndAngle, false)
      ctx.arcTo(
        cx + Math.cos(endAngle) * outerRadius,
        cy + Math.sin(endAngle) * outerRadius,
        cx + Math.cos(endAngle) * innerRadius,
        cy + Math.sin(endAngle) * innerRadius,
        r
      )
      ctx.arcTo(
        cx + Math.cos(endAngle) * innerRadius,
        cy + Math.sin(endAngle) * innerRadius,
        cx + Math.cos(innerEndAngle) * innerRadius,
        cy + Math.sin(innerEndAngle) * innerRadius,
        r
      )
      ctx.arc(cx, cy, innerRadius, innerEndAngle, innerStartAngle, true)
      ctx.arcTo(
        cx + Math.cos(startAngle) * innerRadius,
        cy + Math.sin(startAngle) * innerRadius,
        cx + Math.cos(startAngle) * outerRadius,
        cy + Math.sin(startAngle) * outerRadius,
        r
      )
      ctx.arcTo(
        cx + Math.cos(startAngle) * outerRadius,
        cy + Math.sin(startAngle) * outerRadius,
        cx + Math.cos(outerStartAngle) * outerRadius,
        cy + Math.sin(outerStartAngle) * outerRadius,
        r
      )
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    } else {
      // SVG 模式：使用 drawPath 绘制带圆角的扇形
      const outerStartAngle = startAngle + r / outerRadius
      const outerEndAngle = endAngle - r / outerRadius
      const innerStartAngle = startAngle + r / innerRadius
      const innerEndAngle = endAngle - r / innerRadius

      // 判断是否为大弧
      const outerArcLarge = (outerEndAngle - outerStartAngle) > Math.PI
      const innerArcLarge = (innerEndAngle - innerStartAngle) > Math.PI

      const commands: any[] = [
        // 移动到外弧起点
        {
          type: 'M',
          x: cx + Math.cos(outerStartAngle) * outerRadius,
          y: cy + Math.sin(outerStartAngle) * outerRadius
        },
        // 外弧
        {
          type: 'A',
          rx: outerRadius, ry: outerRadius,
          rotation: 0, large: outerArcLarge, sweep: true,
          x: cx + Math.cos(outerEndAngle) * outerRadius,
          y: cy + Math.sin(outerEndAngle) * outerRadius
        },
        // 右上圆角 (用二次贝塞尔曲线)
        {
          type: 'Q',
          x1: cx + Math.cos(endAngle) * outerRadius,
          y1: cy + Math.sin(endAngle) * outerRadius,
          x: cx + Math.cos(endAngle) * (outerRadius - r),
          y: cy + Math.sin(endAngle) * (outerRadius - r)
        },
        // 连接到内弧终点
        {
          type: 'L',
          x: cx + Math.cos(endAngle) * (innerRadius + r),
          y: cy + Math.sin(endAngle) * (innerRadius + r)
        },
        // 右下圆角
        {
          type: 'Q',
          x1: cx + Math.cos(endAngle) * innerRadius,
          y1: cy + Math.sin(endAngle) * innerRadius,
          x: cx + Math.cos(innerEndAngle) * innerRadius,
          y: cy + Math.sin(innerEndAngle) * innerRadius
        },
        // 内弧（逆向）
        {
          type: 'A',
          rx: innerRadius, ry: innerRadius,
          rotation: 0, large: innerArcLarge, sweep: false,
          x: cx + Math.cos(innerStartAngle) * innerRadius,
          y: cy + Math.sin(innerStartAngle) * innerRadius
        },
        // 左下圆角
        {
          type: 'Q',
          x1: cx + Math.cos(startAngle) * innerRadius,
          y1: cy + Math.sin(startAngle) * innerRadius,
          x: cx + Math.cos(startAngle) * (innerRadius + r),
          y: cy + Math.sin(startAngle) * (innerRadius + r)
        },
        // 连接到外弧起点
        {
          type: 'L',
          x: cx + Math.cos(startAngle) * (outerRadius - r),
          y: cy + Math.sin(startAngle) * (outerRadius - r)
        },
        // 左上圆角
        {
          type: 'Q',
          x1: cx + Math.cos(startAngle) * outerRadius,
          y1: cy + Math.sin(startAngle) * outerRadius,
          x: cx + Math.cos(outerStartAngle) * outerRadius,
          y: cy + Math.sin(outerStartAngle) * outerRadius
        },
        { type: 'Z' }
      ]

      renderer.drawPath({ commands }, { fill, opacity })
    }
  }

  private lightenColor(hex: string): string {
    if (!hex.startsWith('#')) return hex
    const num = parseInt(hex.slice(1), 16)
    const r = Math.min(255, (num >> 16) + 40)
    const g = Math.min(255, ((num >> 8) & 0xff) + 40)
    const b = Math.min(255, (num & 0xff) + 40)
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }

  private darkenColor(hex: string): string {
    if (!hex.startsWith('#')) return hex
    const num = parseInt(hex.slice(1), 16)
    const r = Math.max(0, (num >> 16) - 30)
    const g = Math.max(0, ((num >> 8) & 0xff) - 30)
    const b = Math.max(0, (num & 0xff) - 30)
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }

  // 调度 hover 动画
  private scheduleHoverAnimation(): void {
    if (this.hoverAnimationFrame) return;
    this.hoverAnimationFrame = requestAnimationFrame(() => {
      this.hoverAnimationFrame = null;
      this.render();
    });
  }

  // ============== 辅助绑制方法 ==============

  private drawHoverLine(labels: string[]): void {
    if (this.hoverIndex < 0) return

    const { chartRect, options, renderer } = this
    const { horizontal } = options
    const series = options.series || []

    // 检测图表类型
    const hasBarSeries = series.some(s => s.type === 'bar')
    const hasLineSeries = series.some(s => s.type === 'line')

    // 背景色（用于柱状图）
    const hoverBgColor = options.theme === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.04)'

    // 指示线颜色（用于折线图）
    const hoverLineColor = options.theme === 'dark'
      ? 'rgba(255, 255, 255, 0.3)'
      : 'rgba(0, 0, 0, 0.2)'

    if (horizontal) {
      const barGroupHeight = chartRect.height / Math.max(labels.length, 1)
      const hoverY = chartRect.y + barGroupHeight * this.hoverIndex + barGroupHeight / 2

      // 柱状图：绘制背景
      if (hasBarSeries) {
        renderer.drawRect(
          { x: chartRect.x, y: chartRect.y + barGroupHeight * this.hoverIndex, width: chartRect.width, height: barGroupHeight },
          { fill: hoverBgColor }
        )
      }

      // 折线图：绘制水平指示线
      if (hasLineSeries) {
        renderer.drawLine(
          [{ x: chartRect.x, y: hoverY }, { x: chartRect.x + chartRect.width, y: hoverY }],
          { stroke: hoverLineColor, lineWidth: 1, lineDash: [4, 4] }
        )
      }
    } else {
      const barGroupWidth = chartRect.width / Math.max(labels.length, 1)
      const hoverX = chartRect.x + barGroupWidth * this.hoverIndex + barGroupWidth / 2

      // 柱状图：绘制背景
      if (hasBarSeries) {
        renderer.drawRect(
          { x: chartRect.x + barGroupWidth * this.hoverIndex, y: chartRect.y, width: barGroupWidth, height: chartRect.height },
          { fill: hoverBgColor }
        )
      }

      // 折线图：绘制垂直指示线
      if (hasLineSeries) {
        renderer.drawLine(
          [{ x: hoverX, y: chartRect.y }, { x: hoverX, y: chartRect.y + chartRect.height }],
          { stroke: hoverLineColor, lineWidth: 1, lineDash: [4, 4] }
        )
      }
    }
  }

  private drawLegend(): void {
    const { renderer, chartRect, colors, options } = this
    const series = options.series || []
    const disabledColor = colors.textSecondary

    const legendY = chartRect.y - 25
    let legendX = chartRect.x

    series.forEach((s, i) => {
      const color = s.color || SERIES_COLORS[i % SERIES_COLORS.length]
      const name = s.name || `系列${i + 1}`
      const isEnabled = this.enabledSeries.has(name)

      // 绘制图例图标
      if (s.type === 'bar') {
        renderer.drawRect(
          { x: legendX, y: legendY - 5, width: 14, height: 10 },
          { fill: isEnabled ? color : disabledColor }
        )
      } else if (s.type === 'scatter') {
        renderer.drawCircle(
          { x: legendX + 7, y: legendY, radius: 5 },
          { fill: isEnabled ? color : disabledColor }
        )
      } else {
        // line
        renderer.drawLine(
          [{ x: legendX, y: legendY }, { x: legendX + 14, y: legendY }],
          { stroke: isEnabled ? color : disabledColor, lineWidth: 2 }
        )
        renderer.drawCircle(
          { x: legendX + 7, y: legendY, radius: 3 },
          { fill: isEnabled ? color : disabledColor }
        )
      }

      // 绘制图例文字
      renderer.drawText(
        { x: legendX + 18, y: legendY + 4, text: name },
        { fill: isEnabled ? colors.text : disabledColor, fontSize: 12 }
      )

      legendX += renderer.measureText(name, 12) + 35
    })
  }

  // ============== 事件处理 ==============

  private bindEvents(): void {
    const container = this.container
    if (!container) return

    container.addEventListener('mousemove', this.handleMouseMove.bind(this))
    container.addEventListener('mouseleave', this.handleMouseLeave.bind(this))
    container.addEventListener('click', this.handleClick.bind(this))

    // DataZoom 拖拽事件
    container.addEventListener('mousedown', (e: MouseEvent) => {
      if (this.handleDataZoomMouseDown(e)) {
        e.preventDefault()
      }
    })

    document.addEventListener('mousemove', (e: MouseEvent) => {
      this.handleDataZoomMouseMove(e)
    })

    document.addEventListener('mouseup', () => {
      this.handleDataZoomMouseUp()
    })
  }

  private handleMouseMove(e: MouseEvent): void {
    const rect = this.container?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 检查是否有饼图系列
    const pieSeries = (this.options.series || []).filter(s => s.type === 'pie')
    if (pieSeries.length > 0) {
      this.handlePieMouseMove(x, y, e)
      return
    }

    // 检查是否有雷达图系列
    const radarSeries = (this.options.series || []).filter(s => s.type === 'radar')
    if (radarSeries.length > 0) {
      this.handleRadarMouseMove(x, y, e)
      return
    }

    // 检查是否有关系图系列
    const graphSeries = (this.options.series || []).filter(s => s.type === 'graph')
    if (graphSeries.length > 0) {
      this.handleGraphMouseMove(x, y, e)
      return
    }

    // 检查是否有树图系列
    const treeSeries = (this.options.series || []).filter(s => s.type === 'tree')
    if (treeSeries.length > 0) {
      this.handleTreeMouseMove(x, y, e)
      return
    }

    // 检查是否有旭日图系列
    const sunburstSeries = (this.options.series || []).filter(s => s.type === 'sunburst')
    if (sunburstSeries.length > 0) {
      this.handleSunburstMouseMove(x, y, e)
      return
    }

    // 检查是否有桑基图系列
    const sankeySeries = (this.options.series || []).filter(s => s.type === 'sankey')
    if (sankeySeries.length > 0) {
      this.handleSankeyMouseMove(x, y, e)
      return
    }

    // 检查是否有漏斗图系列
    const funnelSeries = (this.options.series || []).filter(s => s.type === 'funnel')
    if (funnelSeries.length > 0) {
      this.handleFunnelMouseMove(x, y, e)
      return
    }

    const xAxisConfig = this.getAxisConfig(this.options.xAxis, 0)
    const labels = xAxisConfig.data || []
    const { horizontal } = this.options

    let newIndex: number
    if (horizontal) {
      const barGroupHeight = this.chartRect.height / Math.max(labels.length, 1)
      newIndex = Math.floor((y - this.chartRect.y) / barGroupHeight)
    } else {
      const barGroupWidth = this.chartRect.width / Math.max(labels.length, 1)
      newIndex = Math.floor((x - this.chartRect.x) / barGroupWidth)
    }

    // 检查是否在有效数据范围内
    const isInRange = newIndex >= 0 && newIndex < labels.length
    const isInChartArea = x >= this.chartRect.x && x <= this.chartRect.x + this.chartRect.width &&
      y >= this.chartRect.y && y <= this.chartRect.y + this.chartRect.height

    if (isInRange && isInChartArea) {
      if (newIndex !== this.hoverIndex) {
        this.hoverIndex = newIndex
        this.render()
        this.showTooltip(e, newIndex)
      }
    } else {
      // 鼠标移出数据区域，立即隐藏tooltip
      if (this.hoverIndex !== -1) {
        this.hoverIndex = -1
        this.hideTooltip()
        this.render()
      }
    }
  }

  private handlePieMouseMove(x: number, y: number, e: MouseEvent): void {
    const allSeries = this.options.series || []
    const pieSeries = allSeries.filter(s => s.type === 'pie')
    if (pieSeries.length === 0) return

    // 计算中心点（简化版本，使用画布中心）
    const centerX = this.width / 2
    const centerY = this.height / 2
    const basePadding = 15
    const maxRadius = Math.min(this.width, this.height) / 2 * 0.95 - basePadding

    // 计算鼠标相对于圆心的位置
    const dx = x - centerX
    const dy = y - centerY
    const dist = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx)

    // 从外到内检查每个饼图系列（外层优先）
    // 按外半径从大到小排序
    const sortedSeries = pieSeries.map((s) => {
      let outerR = maxRadius
      if (s.radius !== undefined) {
        outerR = Array.isArray(s.radius) ? s.radius[1] * maxRadius : s.radius * maxRadius
      }
      return { series: s, originalIndex: allSeries.indexOf(s), outerRadius: outerR }
    }).sort((a, b) => b.outerRadius - a.outerRadius)

    let foundSeriesIdx = -1
    let foundDataIdx = -1
    let foundItem: PieDataItem | null = null
    let foundTotal = 0

    for (const { series: s, originalIndex } of sortedSeries) {
      const pieData = s.data as PieDataItem[]
      if (!pieData || pieData.length === 0) continue

      let outerRadius = maxRadius
      let innerRadius = 0
      if (s.radius !== undefined) {
        if (Array.isArray(s.radius)) {
          innerRadius = s.radius[0] * maxRadius
          outerRadius = s.radius[1] * maxRadius
        } else {
          outerRadius = s.radius * maxRadius
        }
      }

      // 检查是否在这个环的范围内
      if (dist < innerRadius || dist > outerRadius) continue

      // 计算总值和起始角度
      const total = pieData.reduce((sum, item) => sum + item.value, 0)
      const baseStartAngle = s.startAngle ?? -Math.PI / 2
      const sweepAngle = s.sweepAngle ?? Math.PI * 2
      const padAngle = s.padAngle ?? 0

      // 将角度调整到正确范围
      let checkAngle = angle
      if (checkAngle < baseStartAngle) checkAngle += Math.PI * 2

      // 找到鼠标所在的扇形
      let startAngle = baseStartAngle
      for (let i = 0; i < pieData.length; i++) {
        const item = pieData[i]!
        const sliceAngle = (item.value / total) * sweepAngle - padAngle
        const endAngle = startAngle + sliceAngle

        let testAngle = checkAngle
        if (testAngle < startAngle) testAngle += Math.PI * 2

        if (testAngle >= startAngle && testAngle < endAngle) {
          // 跳过 noHover 的项
          if (!item.noHover) {
            foundSeriesIdx = originalIndex
            foundDataIdx = i
            foundItem = item
            foundTotal = total
          }
          break
        }
        startAngle += sliceAngle + padAngle
      }

      if (foundDataIdx >= 0) break  // 找到了就停止
    }

    // 更新状态
    if (foundSeriesIdx !== this.hoverSeriesIndex || foundDataIdx !== this.hoverIndex) {
      this.hoverSeriesIndex = foundSeriesIdx
      this.hoverIndex = foundDataIdx
      this.render()
      if (foundItem) {
        this.showPieTooltip(e, foundItem, foundTotal)
      } else {
        this.hideTooltip()
      }
    }
  }

  private showPieTooltip(e: MouseEvent, item: PieDataItem, total: number): void {
    if (this.options.tooltip?.show === false) return

    if (!this.tooltipEl) {
      this.tooltipEl = document.createElement('div')
      this.tooltipEl.style.cssText = `
        position: fixed; padding: 8px 12px; border-radius: 6px; font-size: 12px;
        pointer-events: none; z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        background: ${this.colors.tooltipBg}; color: ${this.colors.text};
      `
      document.body.appendChild(this.tooltipEl)
    }

    const percent = ((item.value / total) * 100).toFixed(1)
    this.tooltipEl.innerHTML = `
      <div style="font-weight:bold;margin-bottom:4px">${item.name}</div>
      <div>数值: ${item.value}</div>
      <div>占比: ${percent}%</div>
    `
    this.tooltipEl.style.left = `${e.clientX + 10}px`
    this.tooltipEl.style.top = `${e.clientY + 10}px`
    this.tooltipEl.style.display = 'block'
  }

  private handleRadarMouseMove(x: number, y: number, e: MouseEvent): void {
    if (!this.radarState) return

    const { dataPoints, indicators, series } = this.radarState

    // 查找最近的数据点
    let closestPoint: typeof dataPoints[0] | null = null
    let minDist = 20 // 最大检测距离

    for (const point of dataPoints) {
      const dist = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2))
      if (dist < minDist) {
        minDist = dist
        closestPoint = point
      }
    }

    if (closestPoint) {
      const { seriesIndex, pointIndex, value } = closestPoint

      if (seriesIndex !== this.hoverSeriesIndex || pointIndex !== this.hoverIndex) {
        this.hoverSeriesIndex = seriesIndex
        this.hoverIndex = pointIndex
        this.render()

        // 显示 tooltip
        const s = series[seriesIndex]
        const indicator = indicators[pointIndex]
        if (s && indicator) {
          this.showRadarTooltip(e, s.name || `系列${seriesIndex + 1}`, indicator.name, value, indicator.max)
        }
      }
    } else {
      if (this.hoverSeriesIndex !== -1 || this.hoverIndex !== -1) {
        this.hoverSeriesIndex = -1
        this.hoverIndex = -1
        this.hideTooltip()
        this.render()
      }
    }
  }

  private showRadarTooltip(e: MouseEvent, seriesName: string, indicatorName: string, value: number, max?: number): void {
    if (this.options.tooltip?.show === false) return

    if (!this.tooltipEl) {
      this.tooltipEl = document.createElement('div')
      this.tooltipEl.style.cssText = `
        position: fixed; padding: 8px 12px; border-radius: 6px; font-size: 12px;
        pointer-events: none; z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        background: ${this.colors.tooltipBg}; color: ${this.colors.text};
      `
      document.body.appendChild(this.tooltipEl)
    }

    const percent = max ? ((value / max) * 100).toFixed(1) : '-'
    this.tooltipEl.innerHTML = `
      <div style="font-weight:bold;margin-bottom:4px">${seriesName}</div>
      <div>${indicatorName}: ${value}</div>
      ${max ? `<div>占比: ${percent}%</div>` : ''}
    `
    this.tooltipEl.style.left = `${e.clientX + 10}px`
    this.tooltipEl.style.top = `${e.clientY + 10}px`
    this.tooltipEl.style.display = 'block'
  }

  private handleMouseLeave(): void {
    this.hoverIndex = -1
    this.hoverSeriesIndex = -1
    this.hideTooltip()
    this.render()
  }

  private handleClick(e: MouseEvent): void {
    const rect = this.container?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 检测图例点击
    const series = this.options.series || []
    const legendY = this.chartRect.y - 25
    let legendX = this.chartRect.x

    for (let i = 0; i < series.length; i++) {
      const s = series[i]!
      const name = s.name || `系列${i + 1}`
      const textWidth = this.renderer.measureText(name, 12)
      const itemWidth = textWidth + 35

      if (x >= legendX && x <= legendX + itemWidth && y >= legendY - 10 && y <= legendY + 10) {
        if (this.enabledSeries.has(name)) {
          this.enabledSeries.delete(name)
        } else {
          this.enabledSeries.add(name)
        }
        this.render()
        return
      }

      legendX += itemWidth
    }
  }

  // ============== 提示框 ==============

  private showTooltip(e: MouseEvent, index: number): void {
    if (this.options.tooltip?.show === false) return

    if (!this.tooltipEl) {
      this.tooltipEl = document.createElement('div')
      this.tooltipEl.style.cssText = `
        position: fixed; padding: 8px 12px; border-radius: 6px; font-size: 12px;
        pointer-events: none; z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        background: ${this.colors.tooltipBg}; color: ${this.colors.text};
      `
      document.body.appendChild(this.tooltipEl)
    }

    const xAxisConfig = this.getAxisConfig(this.options.xAxis, 0)
    const labels = xAxisConfig.data || []
    const label = labels[index] || ''
    const series = this.options.series || []

    let html = `<div style="font-weight:bold;margin-bottom:4px">${label}</div>`
    series.forEach((s, i) => {
      if (!this.enabledSeries.has(s.name || '')) return
      const color = s.color || SERIES_COLORS[i % SERIES_COLORS.length]
      const value = s.data[index]
      if (value !== null && value !== undefined) {
        html += `<div style="display:flex;align-items:center;gap:6px">
          <span style="width:8px;height:8px;border-radius:50%;background:${color}"></span>
          <span>${s.name || '系列' + (i + 1)}: ${value}</span>
        </div>`
      }
    })

    this.tooltipEl.innerHTML = html
    this.tooltipEl.style.left = `${e.clientX + 10}px`
    this.tooltipEl.style.top = `${e.clientY + 10}px`
    this.tooltipEl.style.display = 'block'
  }

  private hideTooltip(): void {
    if (this.tooltipEl) {
      this.tooltipEl.style.display = 'none'
    }
  }

  // ============== 动画方法 ==============

  private startEntryAnimation(): void {
    this.startAnimation()
  }

  // ============== 关系图绑制 ==============

  private drawGraphSeries(series: SeriesData[]): void {
    const { renderer, animationProgress, width, height, colors } = this

    // 缓动函数
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const easeOutBack = (t: number) => {
      const c1 = 1.70158
      const c3 = c1 + 1
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
    }

    // 计算绘图区域 - 减小边距以充分利用空间
    const hasCategories = series.some(s => s.graphData?.categories && s.graphData.categories.length > 0)
    const padding = { top: hasCategories ? 32 : 15, right: 15, bottom: 25, left: 15 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom
    const centerX = padding.left + chartWidth / 2
    const centerY = padding.top + chartHeight / 2

    series.forEach((s) => {
      const graphData = s.graphData
      if (!graphData || !graphData.nodes || graphData.nodes.length === 0) return

      const animType = s.graphAnimationType || 'fade'
      const layout = s.graphLayout || 'force'
      const nodeSize = s.nodeSize ?? 20
      const edgeWidth = s.edgeWidth ?? 1
      const showNodeLabel = s.showNodeLabel ?? true
      const showArrow = s.showArrow ?? false
      const categories = graphData.categories || []

      const nodes = graphData.nodes
      const links = graphData.links

      // 计算最大节点尺寸
      const maxNodeSize = Math.max(...nodes.map(n => n.symbolSize || nodeSize))
      const labelSpace = showNodeLabel ? 16 : 0

      // 计算节点位置
      const nodePositions: Map<string, { x: number; y: number }> = new Map()

      if (layout === 'circular') {
        // 环形布局 - 充分利用空间
        const radius = Math.min(chartWidth, chartHeight) / 2 - maxNodeSize / 2 - labelSpace
        nodes.forEach((node, i) => {
          const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2
          nodePositions.set(node.id, {
            x: node.x ?? (centerX + Math.cos(angle) * radius),
            y: node.y ?? (centerY + Math.sin(angle) * radius)
          })
        })
      } else if (layout === 'grid') {
        // 网格布局 - 根据宽高比自适应
        const aspectRatio = chartWidth / chartHeight
        let cols: number, rows: number
        if (aspectRatio > 1.5) {
          cols = Math.ceil(Math.sqrt(nodes.length * aspectRatio))
          rows = Math.ceil(nodes.length / cols)
        } else if (aspectRatio < 0.67) {
          rows = Math.ceil(Math.sqrt(nodes.length / aspectRatio))
          cols = Math.ceil(nodes.length / rows)
        } else {
          cols = Math.ceil(Math.sqrt(nodes.length))
          rows = Math.ceil(nodes.length / cols)
        }

        const usableWidth = chartWidth - maxNodeSize
        const usableHeight = chartHeight - maxNodeSize - labelSpace
        const cellWidth = cols > 1 ? usableWidth / (cols - 1) : 0
        const cellHeight = rows > 1 ? usableHeight / (rows - 1) : 0
        const startX = padding.left + maxNodeSize / 2
        const startY = padding.top + maxNodeSize / 2

        nodes.forEach((node, i) => {
          const col = i % cols
          const row = Math.floor(i / cols)
          const nodesInRow = row === rows - 1 ? nodes.length - row * cols : cols
          let xOffset = 0
          if (nodesInRow < cols && cols > 1) {
            xOffset = (cols - nodesInRow) * cellWidth / 2
          }
          nodePositions.set(node.id, {
            x: node.x ?? (cols === 1 ? centerX : startX + col * cellWidth + xOffset),
            y: node.y ?? (rows === 1 ? centerY : startY + row * cellHeight)
          })
        })
      } else {
        // 力导向布局 - 充分利用空间
        const radiusX = chartWidth / 2 - maxNodeSize / 2 - 5
        const radiusY = chartHeight / 2 - maxNodeSize / 2 - labelSpace - 5

        if (nodes.length <= 1) {
          nodes.forEach((node) => {
            nodePositions.set(node.id, { x: node.x ?? centerX, y: node.y ?? centerY })
          })
        } else if (nodes.length <= 8) {
          // 少量节点：环形分布
          nodes.forEach((node, i) => {
            if (node.x !== undefined && node.y !== undefined) {
              nodePositions.set(node.id, { x: node.x, y: node.y })
            } else {
              const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2
              nodePositions.set(node.id, {
                x: centerX + Math.cos(angle) * radiusX * 0.9,
                y: centerY + Math.sin(angle) * radiusY * 0.9
              })
            }
          })
        } else {
          // 多节点：向日葵螺旋分布
          const phi = (1 + Math.sqrt(5)) / 2
          nodes.forEach((node, i) => {
            if (node.x !== undefined && node.y !== undefined) {
              nodePositions.set(node.id, { x: node.x, y: node.y })
            } else {
              const theta = 2 * Math.PI * i / (phi * phi)
              const normalizedDist = Math.sqrt((i + 1) / nodes.length)
              nodePositions.set(node.id, {
                x: centerX + Math.cos(theta) * radiusX * normalizedDist * 0.95,
                y: centerY + Math.sin(theta) * radiusY * normalizedDist * 0.95
              })
            }
          })
        }
      }

      // 计算动画进度
      const easedProgress = easeOutCubic(animationProgress)

      // 预计算节点颜色映射
      const nodeColorMap: Map<string, string> = new Map()
      nodes.forEach((node, i) => {
        let nodeColor = node.itemStyle?.color
        if (!nodeColor && node.category !== undefined && categories[node.category]) {
          nodeColor = categories[node.category]!.itemStyle?.color
        }
        if (!nodeColor) {
          nodeColor = SERIES_COLORS[i % SERIES_COLORS.length]
        }
        nodeColorMap.set(node.id, nodeColor || '#999')
      })

      // 绘制边
      links.forEach((link) => {
        const sourcePos = nodePositions.get(link.source)
        const targetPos = nodePositions.get(link.target)
        if (!sourcePos || !targetPos) return

        const sourceColor = nodeColorMap.get(link.source) || '#999'
        const defaultEdgeColor = this.fadeColor(sourceColor, 0.3)
        const lineColor = link.lineStyle?.color || defaultEdgeColor
        const lineWidth = link.lineStyle?.width || Math.max(edgeWidth, 1.5)
        const curveness = link.lineStyle?.curveness ?? 0

        let opacity = animType === 'fade' || animType === 'expand' ? easedProgress : 1
        const isHoverLink = this.hoverGraphNode === link.source || this.hoverGraphNode === link.target
        const linkOpacity = isHoverLink ? opacity : opacity * 0.6

        if (curveness === 0) {
          renderer.drawLine(
            [{ x: sourcePos.x, y: sourcePos.y }, { x: targetPos.x, y: targetPos.y }],
            { stroke: lineColor, lineWidth: isHoverLink ? lineWidth * 1.5 : lineWidth, opacity: linkOpacity }
          )
        } else {
          const midX = (sourcePos.x + targetPos.x) / 2
          const midY = (sourcePos.y + targetPos.y) / 2
          const dx = targetPos.x - sourcePos.x
          const dy = targetPos.y - sourcePos.y
          const ctrlX = midX - dy * curveness
          const ctrlY = midY + dx * curveness

          renderer.drawPath(
            {
              commands: [
                { type: 'M', x: sourcePos.x, y: sourcePos.y },
                { type: 'Q', x1: ctrlX, y1: ctrlY, x: targetPos.x, y: targetPos.y }
              ]
            },
            { stroke: lineColor, lineWidth: isHoverLink ? lineWidth * 1.5 : lineWidth, fill: 'none', opacity: linkOpacity }
          )
        }

        // 绘制箭头
        if (showArrow) {
          const angle = Math.atan2(targetPos.y - sourcePos.y, targetPos.x - sourcePos.x)
          const arrowSize = isHoverLink ? 10 : 8
          const targetNode = nodes.find(n => n.id === link.target)
          const targetRadius = (targetNode?.symbolSize || nodeSize) / 2
          const arrowX = targetPos.x - Math.cos(angle) * (targetRadius + 2)
          const arrowY = targetPos.y - Math.sin(angle) * (targetRadius + 2)

          renderer.drawPath(
            {
              commands: [
                { type: 'M', x: arrowX, y: arrowY },
                { type: 'L', x: arrowX - Math.cos(angle - Math.PI / 6) * arrowSize, y: arrowY - Math.sin(angle - Math.PI / 6) * arrowSize },
                { type: 'L', x: arrowX - Math.cos(angle + Math.PI / 6) * arrowSize, y: arrowY - Math.sin(angle + Math.PI / 6) * arrowSize },
                { type: 'Z' }
              ]
            },
            { fill: lineColor, opacity: linkOpacity }
          )
        }
      })

      // 存储节点位置用于 hover 检测
      this.graphNodePositions.clear()
      nodes.forEach((node) => {
        const pos = nodePositions.get(node.id)
        if (pos) {
          this.graphNodePositions.set(node.id, { ...pos, node })
        }
      })

      // 绘制节点
      nodes.forEach((node, i) => {
        const pos = nodePositions.get(node.id)
        if (!pos) return

        const size = node.symbolSize || nodeSize
        let nodeColor = node.itemStyle?.color
        if (!nodeColor && node.category !== undefined && categories[node.category]) {
          nodeColor = categories[node.category]!.itemStyle?.color
        }
        if (!nodeColor) {
          nodeColor = SERIES_COLORS[i % SERIES_COLORS.length]
        }

        let opacity = 1
        let scale = 1
        const isHovered = this.hoverGraphNode === node.id

        switch (animType) {
          case 'fade': opacity = easedProgress; break
          case 'scale': scale = easeOutBack(animationProgress); break
          case 'expand':
            const dist = Math.sqrt(Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2))
            const maxDist = Math.sqrt(Math.pow(chartWidth / 2, 2) + Math.pow(chartHeight / 2, 2))
            const delay = dist / maxDist * 0.5
            opacity = Math.max(0, Math.min(1, (animationProgress - delay) / 0.5))
            scale = opacity
            break
        }

        if (isHovered) scale *= 1.2
        const actualSize = size * scale

        renderer.drawCircle(
          { x: pos.x, y: pos.y, radius: actualSize / 2 },
          {
            fill: isHovered ? this.lightenColor(nodeColor || '#999') : nodeColor,
            opacity,
            stroke: isHovered ? nodeColor : colors.background,
            lineWidth: isHovered ? 3 : 2
          }
        )

        if (showNodeLabel && opacity > 0.3) {
          renderer.drawText(
            { x: pos.x, y: pos.y + actualSize / 2 + 12, text: node.name },
            { fill: colors.text, fontSize: isHovered ? 11 : 10, textAlign: 'center', opacity, fontWeight: isHovered ? 'bold' : undefined }
          )
        }
      })
    })

    // 绘制分类图例
    this.drawGraphLegend(series)
  }

  private drawGraphLegend(series: SeriesData[]): void {
    const { renderer, colors, width } = this
    const s = series[0]
    if (!s || !s.graphData?.categories || s.graphData.categories.length === 0) return

    const categories = s.graphData.categories
    const legendY = 16
    const fontSize = 11

    let totalWidth = 0
    const legendItems: { name: string; color: string; width: number }[] = []

    categories.forEach((cat, i) => {
      const color = cat.itemStyle?.color || SERIES_COLORS[i % SERIES_COLORS.length]
      const textWidth = renderer.measureText(cat.name, fontSize)
      const itemWidth = 16 + textWidth + 14
      legendItems.push({ name: cat.name, color: color || '#999', width: itemWidth })
      totalWidth += itemWidth
    })

    let legendX = (width - totalWidth) / 2

    legendItems.forEach((item) => {
      renderer.drawCircle({ x: legendX + 5, y: legendY, radius: 4 }, { fill: item.color })
      renderer.drawText({ x: legendX + 13, y: legendY + 3, text: item.name }, { fill: colors.text, fontSize })
      legendX += item.width
    })
  }

  private handleGraphMouseMove(x: number, y: number, e: MouseEvent): void {
    let hoveredNode: string | null = null
    const graphSeries = (this.options.series || []).find(s => s.type === 'graph')

    for (const [nodeId, nodeData] of this.graphNodePositions) {
      const size = nodeData.node.symbolSize || (graphSeries?.nodeSize ?? 20)
      const dist = Math.sqrt(Math.pow(x - nodeData.x, 2) + Math.pow(y - nodeData.y, 2))

      if (dist <= size / 2 + 5) {
        hoveredNode = nodeId
        break
      }
    }

    if (hoveredNode !== this.hoverGraphNode) {
      this.hoverGraphNode = hoveredNode
      this.render()

      if (hoveredNode) {
        const nodeData = this.graphNodePositions.get(hoveredNode)
        if (nodeData) {
          this.showGraphTooltip(e, nodeData.node)
        }
      } else {
        this.hideTooltip()
      }
    }
  }

  private showGraphTooltip(e: MouseEvent, node: GraphNode): void {
    if (!this.tooltipEl) {
      this.tooltipEl = document.createElement('div')
      this.tooltipEl.className = 'chart-tooltip'
      document.body.appendChild(this.tooltipEl)
    }

    this.tooltipEl.style.cssText = `
      position: fixed; padding: 8px 12px; background: ${this.colors.tooltipBg}; color: ${this.colors.text};
      border-radius: 6px; font-size: 12px; pointer-events: none; z-index: 9999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15); max-width: 200px; line-height: 1.5;
    `

    let content = `<div style="font-weight:bold;margin-bottom:4px;">${node.name}</div>`
    if (node.value !== undefined) content += `<div>值: ${node.value}</div>`

    const graphSeries = (this.options.series || []).find(s => s.type === 'graph')
    if (graphSeries?.graphData?.categories && node.category !== undefined) {
      const category = graphSeries.graphData.categories[node.category]
      if (category) content += `<div>分类: ${category.name}</div>`
    }

    if (graphSeries?.graphData?.links) {
      const linkCount = graphSeries.graphData.links.filter(l => l.source === node.id || l.target === node.id).length
      content += `<div>连接: ${linkCount}</div>`
    }

    this.tooltipEl.innerHTML = content
    this.tooltipEl.style.display = 'block'

    const tooltipRect = this.tooltipEl.getBoundingClientRect()
    let left = e.clientX + 15
    let top = e.clientY - tooltipRect.height / 2

    if (left + tooltipRect.width > window.innerWidth) left = e.clientX - tooltipRect.width - 15
    if (top < 0) top = 5
    if (top + tooltipRect.height > window.innerHeight) top = window.innerHeight - tooltipRect.height - 5

    this.tooltipEl.style.left = `${left}px`
    this.tooltipEl.style.top = `${top}px`
  }

  private fadeColor(hex: string, alpha: number): string {
    if (!hex.startsWith('#')) return hex
    const num = parseInt(hex.slice(1), 16)
    const r = (num >> 16) & 0xff
    const g = (num >> 8) & 0xff
    const b = num & 0xff
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // ============== 树图绑制 ==============

  private drawTreeSeries(series: SeriesData[]): void {
    const { renderer, animationProgress, width, height, colors } = this

    // 缓动函数
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    // 计算绘图区域 - 增大边距避免超出
    const padding = { top: 40, right: 50, bottom: 40, left: 50 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // 清空节点位置缓存
    this.treeNodePositions.clear()

    series.forEach((s) => {
      const treeData = s.treeData
      if (!treeData || !treeData.root) return

      const layout = s.treeLayout || 'TB'
      const edgeShape = s.treeEdgeShape || 'curve'
      const animType = s.treeAnimationType || 'fade'
      const nodeSize = s.nodeSize ?? 10
      const showLabel = s.showNodeLabel ?? true

      // 计算树的层级信息
      interface LayoutNode {
        node: TreeNode
        x: number
        y: number
        leafIdx: number  // 叶子索引（用于布局计算）
        depth: number
        children: LayoutNode[]
        parent?: LayoutNode
        id: string
      }

      // 生成唯一 ID
      let nodeIdCounter = 0
      const generateId = () => `tree-node-${nodeIdCounter++}`

      // 遍历树计算深度和节点数量
      const countNodes = (node: TreeNode): { maxDepth: number; leafCount: number; totalCount: number } => {
        if (!node.children || node.children.length === 0) {
          return { maxDepth: 0, leafCount: 1, totalCount: 1 }
        }
        let maxDepth = 0
        let leafCount = 0
        let totalCount = 1
        for (const child of node.children) {
          const result = countNodes(child)
          maxDepth = Math.max(maxDepth, result.maxDepth + 1)
          leafCount += result.leafCount
          totalCount += result.totalCount
        }
        return { maxDepth, leafCount, totalCount }
      }

      const { maxDepth, leafCount } = countNodes(treeData.root)

      // 构建布局树
      const layoutTree = (node: TreeNode, depth: number, parent?: LayoutNode): LayoutNode => {
        const layoutNode: LayoutNode = {
          node,
          x: 0,
          y: 0,
          leafIdx: 0,
          depth,
          children: [],
          parent,
          id: generateId()
        }

        if (node.children && node.children.length > 0) {
          layoutNode.children = node.children.map(child => layoutTree(child, depth + 1, layoutNode))
        }

        return layoutNode
      }

      const root = layoutTree(treeData.root, 0)

      // 计算实际坐标
      const isHorizontal = layout === 'LR' || layout === 'RL'
      const isReversed = layout === 'BT' || layout === 'RL'
      const isRadial = layout === 'radial'

      // 计算标签需要的额外空间
      const labelPadding = showLabel ? 25 : 10

      if (isRadial) {
        // 径向布局：递归分配角度范围
        const centerX = padding.left + chartWidth / 2
        const centerY = padding.top + chartHeight / 2
        const maxRadius = Math.min(chartWidth, chartHeight) / 2 - nodeSize - labelPadding

        const assignRadialPositions = (node: LayoutNode, startAngle: number, endAngle: number) => {
          const angle = (startAngle + endAngle) / 2
          if (node.depth === 0) {
            node.x = centerX
            node.y = centerY
          } else {
            const radius = (node.depth / Math.max(maxDepth, 1)) * maxRadius
            node.x = centerX + Math.cos(angle) * radius
            node.y = centerY + Math.sin(angle) * radius
          }

          if (node.children.length > 0) {
            const childAngleStep = (endAngle - startAngle) / node.children.length
            node.children.forEach((child, i) => {
              assignRadialPositions(child, startAngle + i * childAngleStep, startAngle + (i + 1) * childAngleStep)
            })
          }
        }
        assignRadialPositions(root, -Math.PI / 2, Math.PI * 1.5)
      } else {
        // 非径向布局：先计算叶子索引
        let leafIndex = 0
        const assignLeafIndices = (node: LayoutNode) => {
          if (node.children.length === 0) {
            node.leafIdx = leafIndex++
          } else {
            for (const child of node.children) {
              assignLeafIndices(child)
            }
            // 父节点位于子节点中间
            const first = node.children[0]!
            const last = node.children[node.children.length - 1]!
            node.leafIdx = (first.leafIdx + last.leafIdx) / 2
          }
        }
        assignLeafIndices(root)

        // 计算所有节点的实际坐标
        const allNodes: LayoutNode[] = []
        const collectNodes = (node: LayoutNode) => {
          allNodes.push(node)
          node.children.forEach(collectNodes)
        }
        collectNodes(root)

        // 统一计算坐标
        if (isHorizontal) {
          const usableWidth = chartWidth - labelPadding * 2
          const usableHeight = chartHeight - nodeSize
          const levelWidth = maxDepth > 0 ? usableWidth / maxDepth : usableWidth
          const nodeSpacing = leafCount > 1 ? usableHeight / (leafCount - 1) : 0

          for (const node of allNodes) {
            node.x = isReversed
              ? padding.left + usableWidth - node.depth * levelWidth + labelPadding
              : padding.left + node.depth * levelWidth + labelPadding
            node.y = leafCount === 1
              ? padding.top + chartHeight / 2
              : padding.top + node.leafIdx * nodeSpacing + nodeSize / 2
          }
        } else {
          const usableWidth = chartWidth - nodeSize
          const usableHeight = chartHeight - labelPadding * 2
          const levelHeight = maxDepth > 0 ? usableHeight / maxDepth : usableHeight
          const nodeSpacing = leafCount > 1 ? usableWidth / (leafCount - 1) : 0

          for (const node of allNodes) {
            node.x = leafCount === 1
              ? padding.left + chartWidth / 2
              : padding.left + node.leafIdx * nodeSpacing + nodeSize / 2
            node.y = isReversed
              ? padding.top + usableHeight - node.depth * levelHeight + labelPadding
              : padding.top + node.depth * levelHeight + labelPadding
          }
        }
      }

      // 计算动画进度
      const easedProgress = easeOutCubic(animationProgress)

      // 绘制边
      const drawEdges = (node: LayoutNode, depth: number = 0) => {
        for (const child of node.children) {
          let edgeOpacity = 1
          if (animType === 'fade') {
            edgeOpacity = easedProgress
          } else if (animType === 'expand') {
            const progress = Math.max(0, (animationProgress - depth * 0.15) / 0.7)
            edgeOpacity = Math.min(1, progress)
          } else if (animType === 'grow') {
            const totalNodes = maxDepth + 1
            const nodeProgress = Math.max(0, (animationProgress * totalNodes - depth) / 1)
            edgeOpacity = Math.min(1, nodeProgress)
          }

          // Hover 高亮边
          const isHoverEdge = this.hoverTreeNode === node.id || this.hoverTreeNode === child.id
          const baseEdgeColor = this.fadeColor(colors.text, isHoverEdge ? 0.6 : 0.25)
          const lineWidth = isHoverEdge ? 2.5 : 1.5

          if (isRadial) {
            // 径向布局：使用二次曲线或直线
            if (edgeShape === 'curve') {
              renderer.drawPath(
                {
                  commands: [
                    { type: 'M', x: node.x, y: node.y },
                    { type: 'Q', x1: (node.x + child.x) / 2, y1: (node.y + child.y) / 2, x: child.x, y: child.y }
                  ]
                },
                { stroke: baseEdgeColor, lineWidth, fill: 'none', opacity: edgeOpacity }
              )
            } else {
              // polyline 和 step 在径向布局中都用直线
              renderer.drawPath(
                {
                  commands: [
                    { type: 'M', x: node.x, y: node.y },
                    { type: 'L', x: child.x, y: child.y }
                  ]
                },
                { stroke: baseEdgeColor, lineWidth, fill: 'none', opacity: edgeOpacity }
              )
            }
          } else if (edgeShape === 'curve') {
            if (isHorizontal) {
              const midX = (node.x + child.x) / 2
              renderer.drawPath(
                {
                  commands: [
                    { type: 'M', x: node.x, y: node.y },
                    { type: 'C', x1: midX, y1: node.y, x2: midX, y2: child.y, x: child.x, y: child.y }
                  ]
                },
                { stroke: baseEdgeColor, lineWidth, fill: 'none', opacity: edgeOpacity }
              )
            } else {
              const midY = (node.y + child.y) / 2
              renderer.drawPath(
                {
                  commands: [
                    { type: 'M', x: node.x, y: node.y },
                    { type: 'C', x1: node.x, y1: midY, x2: child.x, y2: midY, x: child.x, y: child.y }
                  ]
                },
                { stroke: baseEdgeColor, lineWidth, fill: 'none', opacity: edgeOpacity }
              )
            }
          } else if (edgeShape === 'polyline') {
            if (isHorizontal) {
              const midX = (node.x + child.x) / 2
              renderer.drawPath(
                {
                  commands: [
                    { type: 'M', x: node.x, y: node.y },
                    { type: 'L', x: midX, y: node.y },
                    { type: 'L', x: midX, y: child.y },
                    { type: 'L', x: child.x, y: child.y }
                  ]
                },
                { stroke: baseEdgeColor, lineWidth, fill: 'none', opacity: edgeOpacity }
              )
            } else {
              const midY = (node.y + child.y) / 2
              renderer.drawPath(
                {
                  commands: [
                    { type: 'M', x: node.x, y: node.y },
                    { type: 'L', x: node.x, y: midY },
                    { type: 'L', x: child.x, y: midY },
                    { type: 'L', x: child.x, y: child.y }
                  ]
                },
                { stroke: baseEdgeColor, lineWidth, fill: 'none', opacity: edgeOpacity }
              )
            }
          } else {
            // step 边类型
            if (isHorizontal) {
              renderer.drawPath(
                {
                  commands: [
                    { type: 'M', x: node.x, y: node.y },
                    { type: 'L', x: child.x, y: node.y },
                    { type: 'L', x: child.x, y: child.y }
                  ]
                },
                { stroke: baseEdgeColor, lineWidth, fill: 'none', opacity: edgeOpacity }
              )
            } else {
              renderer.drawPath(
                {
                  commands: [
                    { type: 'M', x: node.x, y: node.y },
                    { type: 'L', x: node.x, y: child.y },
                    { type: 'L', x: child.x, y: child.y }
                  ]
                },
                { stroke: baseEdgeColor, lineWidth, fill: 'none', opacity: edgeOpacity }
              )
            }
          }

          drawEdges(child, depth + 1)
        }
      }
      drawEdges(root)

      // 存储节点位置并绘制节点
      const drawNodes = (node: LayoutNode, depth: number = 0) => {
        let nodeOpacity = 1
        let scale = 1

        if (animType === 'fade') {
          nodeOpacity = easedProgress
        } else if (animType === 'expand') {
          const progress = Math.max(0, (animationProgress - depth * 0.15) / 0.7)
          nodeOpacity = Math.min(1, progress)
          scale = nodeOpacity
        } else if (animType === 'grow') {
          const totalNodes = maxDepth + 1
          const nodeProgress = Math.max(0, (animationProgress * totalNodes - depth) / 1)
          nodeOpacity = Math.min(1, nodeProgress)
          scale = nodeOpacity
        }

        const isHovered = this.hoverTreeNode === node.id
        if (isHovered) scale *= 1.3
        const actualSize = nodeSize * scale
        const nodeColor = node.node.itemStyle?.color || SERIES_COLORS[depth % SERIES_COLORS.length]

        // 存储节点位置用于 hover 检测
        this.treeNodePositions.set(node.id, { x: node.x, y: node.y, node: node.node, depth })

        // 绘制节点圆 - 添加阴影效果
        if (isHovered) {
          renderer.drawCircle(
            { x: node.x, y: node.y, radius: actualSize / 2 + 3 },
            { fill: this.fadeColor(nodeColor || '#999', 0.3), opacity: nodeOpacity }
          )
        }

        renderer.drawCircle(
          { x: node.x, y: node.y, radius: actualSize / 2 },
          {
            fill: isHovered ? this.lightenColor(nodeColor || '#999') : nodeColor,
            opacity: nodeOpacity,
            stroke: isHovered ? nodeColor : colors.background,
            lineWidth: isHovered ? 2.5 : 2
          }
        )

        // 绘制标签
        if (showLabel && nodeOpacity > 0.3) {
          let labelX = node.x
          let labelY = node.y
          let textAlign: 'left' | 'right' | 'center' = 'center'

          if (isRadial) {
            labelY = node.y + actualSize / 2 + 10
          } else if (isHorizontal) {
            if (node.children.length === 0) {
              labelX = layout === 'LR' ? node.x + actualSize / 2 + 5 : node.x - actualSize / 2 - 5
              textAlign = layout === 'LR' ? 'left' : 'right'
            } else {
              labelY = node.y - actualSize / 2 - 5
            }
          } else {
            if (node.children.length === 0) {
              labelY = layout === 'TB' ? node.y + actualSize / 2 + 10 : node.y - actualSize / 2 - 5
            } else {
              labelY = layout === 'TB' ? node.y - actualSize / 2 - 5 : node.y + actualSize / 2 + 10
            }
          }

          renderer.drawText(
            { x: labelX, y: labelY, text: node.node.name },
            {
              fill: isHovered ? (nodeColor || colors.text) : colors.text,
              fontSize: isHovered ? 11 : 10,
              textAlign,
              opacity: nodeOpacity,
              fontWeight: isHovered ? 'bold' : undefined
            }
          )
        }

        for (const child of node.children) {
          drawNodes(child, depth + 1)
        }
      }
      drawNodes(root)
    })
  }

  private handleTreeMouseMove(x: number, y: number, e: MouseEvent): void {
    let hoveredNode: string | null = null
    const treeSeries = (this.options.series || []).find(s => s.type === 'tree')
    const nodeSize = treeSeries?.nodeSize ?? 10

    for (const [nodeId, nodeData] of this.treeNodePositions) {
      const dist = Math.sqrt(Math.pow(x - nodeData.x, 2) + Math.pow(y - nodeData.y, 2))
      if (dist <= nodeSize / 2 + 8) {
        hoveredNode = nodeId
        break
      }
    }

    if (hoveredNode !== this.hoverTreeNode) {
      this.hoverTreeNode = hoveredNode
      this.render()

      if (hoveredNode) {
        const nodeData = this.treeNodePositions.get(hoveredNode)
        if (nodeData) {
          this.showTreeTooltip(e, nodeData.node, nodeData.depth)
        }
      } else {
        this.hideTooltip()
      }
    }
  }

  private showTreeTooltip(e: MouseEvent, node: TreeNode, depth: number): void {
    if (!this.tooltipEl) {
      this.tooltipEl = document.createElement('div')
      this.tooltipEl.className = 'chart-tooltip'
      document.body.appendChild(this.tooltipEl)
    }

    this.tooltipEl.style.cssText = `
      position: fixed; padding: 8px 12px; background: ${this.colors.tooltipBg}; color: ${this.colors.text};
      border-radius: 6px; font-size: 12px; pointer-events: none; z-index: 9999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15); max-width: 200px; line-height: 1.5;
    `

    let content = `<div style="font-weight:bold;margin-bottom:4px;">${node.name}</div>`
    content += `<div>层级: ${depth + 1}</div>`
    if (node.value !== undefined) content += `<div>值: ${node.value}</div>`
    if (node.children && node.children.length > 0) {
      content += `<div>子节点: ${node.children.length}</div>`
    }

    this.tooltipEl.innerHTML = content
    this.tooltipEl.style.display = 'block'

    const tooltipRect = this.tooltipEl.getBoundingClientRect()
    let left = e.clientX + 15
    let top = e.clientY - tooltipRect.height / 2

    if (left + tooltipRect.width > window.innerWidth) left = e.clientX - tooltipRect.width - 15
    if (top < 0) top = 5
    if (top + tooltipRect.height > window.innerHeight) top = window.innerHeight - tooltipRect.height - 5

    this.tooltipEl.style.left = `${left}px`
    this.tooltipEl.style.top = `${top}px`
  }

  // ============== 旭日图绑制 ==============

  private drawSunburstSeries(series: SeriesData[]): void {
    const { renderer, animationProgress, width, height, options } = this
    const colors = this.colors

    // 缓动函数
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const easeOutBack = (t: number) => {
      const c1 = 1.70158
      const c3 = c1 + 1
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
    }

    // 颜色处理：根据深度调整颜色亮度（类似 ECharts）
    const adjustColorByDepth = (baseColor: string, depth: number): string => {
      if (!baseColor.startsWith('#') || depth === 0) return baseColor

      const hex = baseColor.slice(1)
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)

      // 随着深度增加，颜色变浅（混合更多白色）
      const factor = 0.15 * depth // 每层增加15%的亮度
      const newR = Math.min(255, Math.round(r + (255 - r) * factor))
      const newG = Math.min(255, Math.round(g + (255 - g) * factor))
      const newB = Math.min(255, Math.round(b + (255 - b) * factor))

      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
    }

    // 清空之前的扇形位置信息
    this.sunburstSectorPositions.clear()
    let sectorIndex = 0

    series.forEach((s) => {
      const sunburstData = s.sunburstData
      if (!sunburstData || !sunburstData.children || sunburstData.children.length === 0) return

      // 计算旭日图中心和半径
      const padding = 40
      const centerX = width / 2
      const centerY = height / 2
      const maxRadius = Math.min(width, height) / 2 - padding

      // 配置（调整默认值更接近 ECharts）
      const innerRadius = (s.sunburstInnerRadius ?? 0) * maxRadius  // 默认无内半径
      const outerRadius = (s.sunburstOuterRadius ?? 0.9) * maxRadius
      const showLabel = s.sunburstShowLabel !== false
      const labelRotate = s.sunburstLabelRotate ?? 'radial'
      const levelGap = s.sunburstLevelGap ?? 1  // 减小层级间隙
      const cornerRadius = s.sunburstCornerRadius ?? 0
      const startAngle = s.sunburstStartAngle ?? -Math.PI / 2
      const animationType = s.sunburstAnimationType ?? 'expand'
      const sortType = s.sunburstSort ?? null
      const borderWidth = 1  // 边框宽度
      const borderColor = colors.background  // 边框颜色（使用背景色分隔）

      // 计算节点的值（递归计算非叶子节点的值）
      const calculateNodeValue = (node: SunburstNode): number => {
        if (node.value !== undefined) return node.value
        if (!node.children || node.children.length === 0) return 0
        return node.children.reduce((sum, child) => sum + calculateNodeValue(child), 0)
      }

      // 计算最大深度
      const calculateMaxDepth = (nodes: SunburstNode[], depth: number = 0): number => {
        let maxDepth = depth
        for (const node of nodes) {
          if (node.children && node.children.length > 0) {
            maxDepth = Math.max(maxDepth, calculateMaxDepth(node.children, depth + 1))
          }
        }
        return maxDepth
      }

      const maxDepth = calculateMaxDepth(sunburstData.children) + 1
      const radiusPerLevel = (outerRadius - innerRadius) / maxDepth

      // 动画计算
      const easedProgress = easeOutCubic(animationProgress)
      let animatedScale = 1
      let animatedOpacity = 1
      let animatedRotation = 0

      switch (animationType) {
        case 'expand':
          // 扇形从中心展开
          break
        case 'scale':
          animatedScale = easeOutBack(animationProgress)
          break
        case 'fade':
          animatedOpacity = easedProgress
          break
        case 'rotate':
          animatedRotation = (1 - easedProgress) * Math.PI * 2
          break
        case 'none':
          break
      }

      // 递归绘制扇形（传递父节点颜色实现颜色继承）
      const drawNode = (
        node: SunburstNode,
        depth: number,
        nodeStartAngle: number,
        nodeEndAngle: number,
        colorIndex: number,
        parentColor: string | null
      ) => {
        const nodeValue = calculateNodeValue(node)
        if (nodeValue <= 0) return

        // 计算当前层的内外半径（减小间隙）
        const levelInnerRadius = (innerRadius + depth * radiusPerLevel + levelGap / 2) * animatedScale
        const levelOuterRadius = (innerRadius + (depth + 1) * radiusPerLevel - levelGap / 2) * animatedScale

        // 应用动画
        let animatedStartAngle = nodeStartAngle + animatedRotation
        let animatedEndAngle = nodeEndAngle + animatedRotation

        if (animationType === 'expand') {
          const angleRange = nodeEndAngle - nodeStartAngle
          const animatedAngleRange = angleRange * easedProgress
          const midAngle = (nodeStartAngle + nodeEndAngle) / 2
          animatedStartAngle = midAngle - animatedAngleRange / 2 + animatedRotation
          animatedEndAngle = midAngle + animatedAngleRange / 2 + animatedRotation
        }

        // 获取颜色（实现颜色继承：子节点继承父节点颜色并变浅）
        let baseColor: string
        if (node.itemStyle?.color) {
          // 节点自定义颜色
          baseColor = node.itemStyle.color
        } else if (parentColor && depth > 0) {
          // 继承父节点颜色
          baseColor = parentColor
        } else {
          // 顶层节点使用系列颜色
          baseColor = SERIES_COLORS[colorIndex % SERIES_COLORS.length] || '#5470c6'
        }

        // 根据深度调整颜色亮度
        const color = adjustColorByDepth(baseColor, depth)

        // 绘制扇形
        const isHovered = this.hoverSunburstSector === `sector_${sectorIndex}`
        const displayColor = isHovered ? this.lightenColor(color) : color

        if (animatedOpacity > 0 && levelOuterRadius > levelInnerRadius) {
          if (cornerRadius > 0 && levelInnerRadius > 0) {
            this.drawRoundedSector(
              renderer, centerX, centerY,
              levelInnerRadius, levelOuterRadius,
              animatedStartAngle, animatedEndAngle,
              cornerRadius, displayColor, animatedOpacity
            )
          } else {
            // 使用带边框的扇形绘制
            renderer.drawSector(
              centerX, centerY,
              levelInnerRadius, levelOuterRadius,
              animatedStartAngle, animatedEndAngle,
              {
                fill: displayColor,
                opacity: animatedOpacity,
                stroke: isHovered ? color : borderColor,
                lineWidth: isHovered ? 2 : borderWidth
              }
            )
          }

          // 保存扇形位置信息（用于鼠标交互）
          this.sunburstSectorPositions.set(`sector_${sectorIndex}`, {
            node,
            depth,
            startAngle: animatedStartAngle,
            endAngle: animatedEndAngle,
            innerRadius: levelInnerRadius,
            outerRadius: levelOuterRadius,
            centerX,
            centerY,
            value: nodeValue,
            color: baseColor
          })
          sectorIndex++

          // 绘制标签
          if (showLabel && animationProgress > 0.5 && (animatedEndAngle - animatedStartAngle) > 0.1) {
            const labelProgress = Math.min(1, (animationProgress - 0.5) / 0.5)
            const labelOpacity = easeOutCubic(labelProgress) * animatedOpacity
            const midAngle = (animatedStartAngle + animatedEndAngle) / 2
            const labelRadius = (levelInnerRadius + levelOuterRadius) / 2

            const lx = centerX + Math.cos(midAngle) * labelRadius
            const ly = centerY + Math.sin(midAngle) * labelRadius

            // 计算标签旋转角度
            let textRotation = 0
            if (labelRotate === 'radial') {
              textRotation = midAngle + Math.PI / 2
              // 翻转下半部分的文字，使其易读
              if (midAngle > Math.PI / 2 && midAngle < Math.PI * 1.5) {
                textRotation += Math.PI
              }
            } else if (labelRotate === 'tangential') {
              textRotation = midAngle
              if (midAngle > Math.PI / 2 && midAngle < Math.PI * 1.5) {
                textRotation += Math.PI
              }
            } else if (typeof labelRotate === 'number') {
              textRotation = labelRotate * Math.PI / 180
            }

            // 只在角度足够大时显示标签
            const angleRange = animatedEndAngle - animatedStartAngle
            const arcLength = angleRange * labelRadius
            if (angleRange > 0.12 && arcLength > 20) {
              renderer.save()
              renderer.translate(lx, ly)
              renderer.rotate(textRotation)
              renderer.drawText(
                { x: 0, y: 0, text: node.name },
                {
                  fill: options.theme === 'dark' ? '#e2e8f0' : '#1e293b',
                  fontSize: Math.max(9, Math.min(12, arcLength / node.name.length * 0.8)),
                  textAlign: 'center',
                  textBaseline: 'middle',
                  opacity: labelOpacity
                }
              )
              renderer.restore()
            }
          }
        }

        // 递归绘制子节点（传递当前节点的基础颜色给子节点继承）
        if (node.children && node.children.length > 0) {
          // 可选：排序子节点
          let sortedChildren = [...node.children]
          if (sortType === 'desc') {
            sortedChildren.sort((a, b) => calculateNodeValue(b) - calculateNodeValue(a))
          } else if (sortType === 'asc') {
            sortedChildren.sort((a, b) => calculateNodeValue(a) - calculateNodeValue(b))
          }

          let childStartAngle = nodeStartAngle
          const totalChildValue = sortedChildren.reduce((sum, child) => sum + calculateNodeValue(child), 0)

          sortedChildren.forEach((child) => {
            const childValue = calculateNodeValue(child)
            const childAngleRange = (childValue / totalChildValue) * (nodeEndAngle - nodeStartAngle)
            const childEndAngle = childStartAngle + childAngleRange

            // 传递父节点的基础颜色（未经深度调整的颜色）
            drawNode(
              child,
              depth + 1,
              childStartAngle,
              childEndAngle,
              colorIndex,
              baseColor  // 传递基础颜色给子节点继承
            )

            childStartAngle = childEndAngle
          })
        }
      }

      // 计算顶层节点的总值
      const totalValue = sunburstData.children.reduce((sum, node) => sum + calculateNodeValue(node), 0)

      // 可选：排序顶层节点
      let sortedRoots = [...sunburstData.children]
      if (sortType === 'desc') {
        sortedRoots.sort((a, b) => calculateNodeValue(b) - calculateNodeValue(a))
      } else if (sortType === 'asc') {
        sortedRoots.sort((a, b) => calculateNodeValue(a) - calculateNodeValue(b))
      }

      // 绘制顶层节点
      let currentAngle = startAngle
      sortedRoots.forEach((node, index) => {
        const nodeValue = calculateNodeValue(node)
        const angleRange = (nodeValue / totalValue) * Math.PI * 2
        const nodeEndAngle = currentAngle + angleRange

        drawNode(node, 0, currentAngle, nodeEndAngle, index, null)

        currentAngle = nodeEndAngle
      })
    })
  }

  // ============== 旭日图鼠标事件 ==============

  private handleSunburstMouseMove(x: number, y: number, e: MouseEvent): void {
    let hoveredSector: string | null = null

    // 遍历所有扇形，检查鼠标是否在扇形内
    for (const [sectorId, sectorData] of this.sunburstSectorPositions) {
      const { centerX, centerY, innerRadius, outerRadius, startAngle, endAngle } = sectorData

      // 计算鼠标相对于圆心的位置
      const dx = x - centerX
      const dy = y - centerY
      const dist = Math.sqrt(dx * dx + dy * dy)

      // 检查是否在半径范围内
      if (dist < innerRadius || dist > outerRadius) continue

      // 计算角度
      let angle = Math.atan2(dy, dx)
      // 标准化角度到 [-PI, PI]
      while (angle < startAngle) angle += Math.PI * 2
      while (angle > startAngle + Math.PI * 2) angle -= Math.PI * 2

      // 检查是否在角度范围内
      if (angle >= startAngle && angle <= endAngle) {
        hoveredSector = sectorId
        break
      }
    }

    if (hoveredSector !== this.hoverSunburstSector) {
      this.hoverSunburstSector = hoveredSector
      this.render()

      if (hoveredSector) {
        const sectorData = this.sunburstSectorPositions.get(hoveredSector)
        if (sectorData) {
          this.showSunburstTooltip(e, sectorData.node, sectorData.depth, sectorData.value)
        }
      } else {
        this.hideTooltip()
      }
    }
  }

  private showSunburstTooltip(e: MouseEvent, node: SunburstNode, depth: number, value: number): void {
    if (!this.tooltipEl) {
      this.tooltipEl = document.createElement('div')
      this.tooltipEl.className = 'chart-tooltip'
      document.body.appendChild(this.tooltipEl)
    }

    this.tooltipEl.style.cssText = `
      position: fixed; padding: 8px 12px; background: ${this.colors.tooltipBg}; color: ${this.colors.text};
      border-radius: 6px; font-size: 12px; pointer-events: none; z-index: 9999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15); max-width: 200px; line-height: 1.5;
    `

    let content = `<div style="font-weight:bold;margin-bottom:4px;">${node.name}</div>`
    content += `<div>值: ${value}</div>`
    content += `<div>层级: ${depth + 1}</div>`
    if (node.children && node.children.length > 0) {
      content += `<div>子节点: ${node.children.length}</div>`
    }

    this.tooltipEl.innerHTML = content
    this.tooltipEl.style.display = 'block'

    const tooltipRect = this.tooltipEl.getBoundingClientRect()
    let left = e.clientX + 15
    let top = e.clientY - tooltipRect.height / 2

    if (left + tooltipRect.width > window.innerWidth) left = e.clientX - tooltipRect.width - 15
    if (top < 0) top = 5
    if (top + tooltipRect.height > window.innerHeight) top = window.innerHeight - tooltipRect.height - 5

    this.tooltipEl.style.left = `${left}px`
    this.tooltipEl.style.top = `${top}px`
  }

  // ============== 桑基图绑制 ==============

  private drawSankeySeries(series: SeriesData[]): void {
    const { renderer, animationProgress, width, height } = this
    const colors = this.colors

    // 缓动函数
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    // 清空位置信息
    this.sankeyNodePositions.clear()
    this.sankeyLinkPositions.clear()

    series.forEach((s) => {
      const sankeyData = s.sankeyData
      if (!sankeyData || !sankeyData.nodes || !sankeyData.links) return

      const { nodes, links } = sankeyData

      // 配置
      const padding = 40
      const nodeWidth = s.sankeyNodeWidth ?? 20
      const nodeGap = s.sankeyNodeGap ?? 8
      const nodeAlign = s.sankeyNodeAlign ?? 'justify'
      const showLabel = s.sankeyShowLabel !== false
      const labelPosition = s.sankeyLabelPosition ?? 'right'
      // const orient = s.sankeyOrient ?? 'horizontal' // 暂时只支持水平方向
      const curveness = s.sankeyCurveness ?? 0.5
      const animationType = s.sankeyAnimationType ?? 'flow'

      // 动画进度
      const easedProgress = easeOutCubic(animationProgress)

      // 构建节点映射
      const nodeMap = new Map<string, SankeyNode & {
        depth: number; inValue: number; outValue: number;
        x: number; y: number; height: number; color: string;
        inLinks: SankeyLink[]; outLinks: SankeyLink[];
      }>()

      nodes.forEach((node, i) => {
        nodeMap.set(node.name, {
          ...node,
          depth: node.depth ?? -1,
          inValue: 0,
          outValue: 0,
          x: 0,
          y: 0,
          height: 0,
          color: node.itemStyle?.color ?? SERIES_COLORS[i % SERIES_COLORS.length] ?? '#5470c6',
          inLinks: [],
          outLinks: []
        })
      })

      // 计算每个节点的输入/输出值
      links.forEach(link => {
        const source = nodeMap.get(link.source)
        const target = nodeMap.get(link.target)
        if (source && target) {
          source.outValue += link.value
          target.inValue += link.value
          source.outLinks.push(link)
          target.inLinks.push(link)
        }
      })

      // 计算节点深度（拓扑排序）
      const calculateDepths = () => {
        // 找出所有源节点（没有入边的节点）
        const sourceNodes = Array.from(nodeMap.values()).filter(n => n.inValue === 0)
        sourceNodes.forEach(n => { n.depth = 0 })

        let changed = true
        let iteration = 0
        const maxIterations = nodes.length

        while (changed && iteration < maxIterations) {
          changed = false
          iteration++
          links.forEach(link => {
            const source = nodeMap.get(link.source)
            const target = nodeMap.get(link.target)
            if (source && target && source.depth >= 0) {
              const newDepth = source.depth + 1
              if (target.depth < 0 || target.depth < newDepth) {
                target.depth = newDepth
                changed = true
              }
            }
          })
        }

        // 处理未分配深度的节点
        nodeMap.forEach(node => {
          if (node.depth < 0) node.depth = 0
        })
      }

      calculateDepths()

      // 获取最大深度
      const maxDepth = Math.max(...Array.from(nodeMap.values()).map(n => n.depth))

      // 按深度分组节点
      type NodeType = SankeyNode & {
        depth: number; inValue: number; outValue: number;
        x: number; y: number; height: number; color: string;
        inLinks: SankeyLink[]; outLinks: SankeyLink[];
      }
      const depthGroups: NodeType[][] = []
      for (let d = 0; d <= maxDepth; d++) {
        depthGroups[d] = Array.from(nodeMap.values()).filter(n => n.depth === d)
      }

      // 计算布局区域
      const chartWidth = width - padding * 2
      const chartHeight = height - padding * 2

      // 计算每列的 X 位置
      const columnWidth = (chartWidth - nodeWidth) / Math.max(maxDepth, 1)

      // 计算每列节点的 Y 位置
      const layoutNodes = () => {
        depthGroups.forEach((group, depth) => {
          if (group.length === 0) return

          // 计算该列所有节点的总值
          const totalValue = group.reduce((sum, n) => sum + Math.max(n.inValue, n.outValue, 1), 0)
          const availableHeight = chartHeight - (group.length - 1) * nodeGap

          // 分配高度
          let currentY = padding
          group.forEach(node => {
            const nodeValue = Math.max(node.inValue, node.outValue, 1)
            node.height = Math.max(4, (nodeValue / totalValue) * availableHeight)
            node.x = padding + depth * columnWidth
            node.y = currentY
            currentY += node.height + nodeGap
          })

          // 对齐调整
          if (nodeAlign === 'justify' && group.length > 1) {
            const totalHeight = group.reduce((sum, n) => sum + n.height, 0)
            const extraSpace = chartHeight - totalHeight
            const gap = extraSpace / (group.length - 1)
            let y = padding
            group.forEach(node => {
              node.y = y
              y += node.height + gap
            })
          }
        })
      }

      layoutNodes()

      // 计算连接的 Y 位置
      const linkPositions: { link: SankeyLink; sourceY: number; targetY: number; sourceHeight: number; targetHeight: number }[] = []

      nodeMap.forEach(node => {
        // 计算出边的起始 Y 位置
        let outY = node.y
        node.outLinks.forEach(link => {
          const target = nodeMap.get(link.target)
          if (!target) return
          const linkHeight = (link.value / node.outValue) * node.height
          linkPositions.push({
            link,
            sourceY: outY + linkHeight / 2,
            targetY: 0, // 稍后计算
            sourceHeight: linkHeight,
            targetHeight: 0
          })
          outY += linkHeight
        })

        // 计算入边的目标 Y 位置
        let inY = node.y
        node.inLinks.forEach(link => {
          const linkHeight = (link.value / node.inValue) * node.height
          const pos = linkPositions.find(p => p.link === link)
          if (pos) {
            pos.targetY = inY + linkHeight / 2
            pos.targetHeight = linkHeight
          }
          inY += linkHeight
        })
      })

      // 应用动画
      let animatedOpacity = 1
      let flowProgress = 1

      switch (animationType) {
        case 'fade':
          animatedOpacity = easedProgress
          break
        case 'grow':
          flowProgress = easedProgress
          break
        case 'flow':
          flowProgress = easedProgress
          break
        case 'none':
          break
      }

      // 绘制连接线（先绘制，这样节点在上面）
      linkPositions.forEach((pos, linkIndex) => {
        const source = nodeMap.get(pos.link.source)
        const target = nodeMap.get(pos.link.target)
        if (!source || !target) return

        const x1 = source.x + nodeWidth
        const y1 = pos.sourceY
        const x2 = target.x
        const y2 = pos.targetY
        const thickness = Math.min(pos.sourceHeight, pos.targetHeight) * flowProgress

        // 贝塞尔曲线控制点
        const cx = (x2 - x1) * curveness
        const cp1x = x1 + cx
        const cp2x = x2 - cx

        // 计算连接的颜色
        const linkColor = pos.link.lineStyle?.color || source.color
        const linkOpacity = (pos.link.lineStyle?.opacity ?? 0.4) * animatedOpacity

        // 判断是否 hover
        const linkId = `link_${linkIndex}`
        const isHovered = this.hoverSankeyLink === linkId

        if (flowProgress > 0) {
          // 绘制连接带（填充区域）
          const halfThickness = thickness / 2
          const path = `M ${x1} ${y1 - halfThickness} 
            C ${cp1x} ${y1 - halfThickness}, ${cp2x} ${y2 - halfThickness}, ${x2} ${y2 - halfThickness}
            L ${x2} ${y2 + halfThickness}
            C ${cp2x} ${y2 + halfThickness}, ${cp1x} ${y1 + halfThickness}, ${x1} ${y1 + halfThickness}
            Z`

          renderer.drawPath(
            { commands: this.parsePath(path) as any },
            {
              fill: linkColor,
              opacity: isHovered ? linkOpacity * 1.5 : linkOpacity,
              stroke: 'none'
            }
          )

          // 保存连接位置
          this.sankeyLinkPositions.set(linkId, {
            link: pos.link,
            sourceNode: pos.link.source,
            targetNode: pos.link.target,
            sourceY: y1,
            targetY: y2,
            thickness,
            color: linkColor
          })
        }
      })

      // 绘制节点
      nodeMap.forEach((node, nodeName) => {
        const nodeId = `node_${nodeName}`
        const isHovered = this.hoverSankeyNode === nodeId
        const nodeHeight = node.height * flowProgress

        if (nodeHeight > 0) {
          // 绘制节点矩形
          renderer.drawRect(
            { x: node.x, y: node.y, width: nodeWidth, height: nodeHeight },
            {
              fill: isHovered ? this.lightenColor(node.color) : node.color,
              opacity: animatedOpacity,
              stroke: isHovered ? node.color : 'none',
              lineWidth: isHovered ? 2 : 0
            }
          )

          // 保存节点位置
          this.sankeyNodePositions.set(nodeId, {
            node: { name: node.name, itemStyle: node.itemStyle, depth: node.depth },
            x: node.x,
            y: node.y,
            width: nodeWidth,
            height: nodeHeight,
            inValue: node.inValue,
            outValue: node.outValue,
            color: node.color
          })

          // 绘制标签
          if (showLabel && animationProgress > 0.3) {
            const labelOpacity = Math.min(1, (animationProgress - 0.3) / 0.4) * animatedOpacity
            let labelX: number
            let textAlign: CanvasTextAlign = 'left'

            if (labelPosition === 'left') {
              labelX = node.x - 5
              textAlign = 'right'
            } else if (labelPosition === 'inside') {
              labelX = node.x + nodeWidth / 2
              textAlign = 'center'
            } else {
              labelX = node.x + nodeWidth + 5
              textAlign = 'left'
            }

            const labelY = node.y + nodeHeight / 2

            renderer.drawText(
              { x: labelX, y: labelY, text: node.name },
              {
                fill: labelPosition === 'inside' ? '#fff' : colors.text,
                fontSize: 11,
                textAlign,
                textBaseline: 'middle',
                opacity: labelOpacity
              }
            )
          }
        }
      })
    })
  }

  // 解析 SVG 路径字符串为命令数组
  private parsePath(pathString: string): Array<{ type: string; x?: number; y?: number; x1?: number; y1?: number; x2?: number; y2?: number }> {
    const commands: Array<{ type: string; x?: number; y?: number; x1?: number; y1?: number; x2?: number; y2?: number }> = []
    const regex = /([MLHVCSQTAZ])([^MLHVCSQTAZ]*)/gi
    let match

    while ((match = regex.exec(pathString)) !== null) {
      const type = (match[1] ?? 'M').toUpperCase()
      const args = (match[2] ?? '').trim().split(/[\s,]+/).map(parseFloat).filter(n => !isNaN(n))

      switch (type) {
        case 'M':
          commands.push({ type: 'M', x: args[0], y: args[1] })
          break
        case 'L':
          commands.push({ type: 'L', x: args[0], y: args[1] })
          break
        case 'C':
          commands.push({ type: 'C', x1: args[0], y1: args[1], x2: args[2], y2: args[3], x: args[4], y: args[5] })
          break
        case 'Z':
          commands.push({ type: 'Z' })
          break
      }
    }

    return commands
  }

  // ============== 桑基图鼠标事件 ==============

  private handleSankeyMouseMove(x: number, y: number, e: MouseEvent): void {
    let hoveredNode: string | null = null
    let hoveredLink: string | null = null

    // 检查是否悬停在节点上
    for (const [nodeId, nodeData] of this.sankeyNodePositions) {
      if (x >= nodeData.x && x <= nodeData.x + nodeData.width &&
        y >= nodeData.y && y <= nodeData.y + nodeData.height) {
        hoveredNode = nodeId
        break
      }
    }

    // 如果没有悬停在节点上，检查连接
    if (!hoveredNode) {
      for (const [linkId, linkData] of this.sankeyLinkPositions) {
        const sourceNode = this.sankeyNodePositions.get(`node_${linkData.sourceNode}`)
        const targetNode = this.sankeyNodePositions.get(`node_${linkData.targetNode}`)
        if (!sourceNode || !targetNode) continue

        // 简化的碰撞检测：检查是否在连接的边界框内
        const minX = sourceNode.x + sourceNode.width
        const maxX = targetNode.x
        const minY = Math.min(linkData.sourceY, linkData.targetY) - linkData.thickness / 2
        const maxY = Math.max(linkData.sourceY, linkData.targetY) + linkData.thickness / 2

        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
          hoveredLink = linkId
          break
        }
      }
    }

    // 更新状态
    if (hoveredNode !== this.hoverSankeyNode || hoveredLink !== this.hoverSankeyLink) {
      this.hoverSankeyNode = hoveredNode
      this.hoverSankeyLink = hoveredLink
      this.render()

      if (hoveredNode) {
        const nodeData = this.sankeyNodePositions.get(hoveredNode)
        if (nodeData) {
          this.showSankeyTooltip(e, 'node', nodeData.node.name, nodeData.inValue, nodeData.outValue)
        }
      } else if (hoveredLink) {
        const linkData = this.sankeyLinkPositions.get(hoveredLink)
        if (linkData) {
          this.showSankeyTooltip(e, 'link', '', linkData.link.value, 0, linkData.sourceNode, linkData.targetNode)
        }
      } else {
        this.hideTooltip()
      }
    }
  }

  private showSankeyTooltip(e: MouseEvent, type: 'node' | 'link', name: string, value: number, outValue: number, source?: string, target?: string): void {
    if (!this.tooltipEl) {
      this.tooltipEl = document.createElement('div')
      this.tooltipEl.className = 'chart-tooltip'
      document.body.appendChild(this.tooltipEl)
    }

    this.tooltipEl.style.cssText = `
      position: fixed; padding: 8px 12px; background: ${this.colors.tooltipBg}; color: ${this.colors.text};
      border-radius: 6px; font-size: 12px; pointer-events: none; z-index: 9999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15); max-width: 200px; line-height: 1.5;
    `

    let content = ''
    if (type === 'node') {
      content = `<div style="font-weight:bold;margin-bottom:4px;">${name}</div>`
      if (value > 0) content += `<div>流入: ${value}</div>`
      if (outValue > 0) content += `<div>流出: ${outValue}</div>`
    } else {
      content = `<div style="font-weight:bold;margin-bottom:4px;">${source} → ${target}</div>`
      content += `<div>流量: ${value}</div>`
    }

    this.tooltipEl.innerHTML = content
    this.tooltipEl.style.display = 'block'

    const tooltipRect = this.tooltipEl.getBoundingClientRect()
    let left = e.clientX + 15
    let top = e.clientY - tooltipRect.height / 2

    if (left + tooltipRect.width > window.innerWidth) left = e.clientX - tooltipRect.width - 15
    if (top < 0) top = 5
    if (top + tooltipRect.height > window.innerHeight) top = window.innerHeight - tooltipRect.height - 5

    this.tooltipEl.style.left = `${left}px`
    this.tooltipEl.style.top = `${top}px`
  }

  // ============== 漏斗图绑制 ==============

  private drawFunnelSeries(series: SeriesData[]): void {
    const { renderer, animationProgress, width, height } = this
    const colors = this.colors

    // 缓动函数
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const easeOutBounce = (t: number) => {
      if (t < 1 / 2.75) return 7.5625 * t * t
      if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
      if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
    }

    // 清空位置信息
    this.funnelItemPositions.clear()

    series.forEach((s) => {
      const funnelData = s.funnelData
      if (!funnelData || funnelData.length === 0) return

      // 配置
      const padding = 50
      const gap = s.funnelGap ?? 2
      const sort = s.funnelSort ?? 'descending'
      const align = s.funnelAlign ?? 'center'
      const minSize = (s.funnelMinSize ?? 0) / 100
      const maxSize = (s.funnelMaxSize ?? 100) / 100
      const showLabel = s.funnelShowLabel !== false
      const labelPosition = s.funnelLabelPosition ?? 'right'
      const animationType = s.funnelAnimationType ?? 'drop'

      // 排序数据
      let sortedData = [...funnelData]
      if (sort === 'ascending') {
        sortedData.sort((a, b) => a.value - b.value)
      } else if (sort === 'descending') {
        sortedData.sort((a, b) => b.value - a.value)
      }

      // 计算布局
      const chartWidth = width - padding * 2
      const chartHeight = height - padding * 2
      const itemCount = sortedData.length
      const itemHeight = (chartHeight - gap * (itemCount - 1)) / itemCount

      // 计算最大值用于归一化
      const maxValue = Math.max(...sortedData.map(d => d.value))

      // 动画进度
      const easedProgress = easeOutCubic(animationProgress)

      // 绘制每个漏斗项
      sortedData.forEach((item, index) => {
        // 计算宽度比例
        const ratio = item.value / maxValue
        const widthRatio = minSize + ratio * (maxSize - minSize)
        const nextRatio = index < sortedData.length - 1
          ? (sortedData[index + 1]?.value ?? 0) / maxValue
          : widthRatio * 0.6
        const nextWidthRatio = minSize + nextRatio * (maxSize - minSize)

        const topWidth = chartWidth * widthRatio
        const bottomWidth = chartWidth * nextWidthRatio

        // 计算位置
        const y = padding + index * (itemHeight + gap)
        let x: number
        if (align === 'left') {
          x = padding
        } else if (align === 'right') {
          x = padding + chartWidth - topWidth
        } else {
          x = padding + (chartWidth - topWidth) / 2
        }

        // 获取颜色
        const itemColor = item.itemStyle?.color || SERIES_COLORS[index % SERIES_COLORS.length] || '#5470c6'
        const itemId = `funnel_${index}`
        const isHovered = this.hoverFunnelItem === itemId

        // 应用动画
        let animatedY = y
        let animatedOpacity = 1
        let animatedScale = 1

        switch (animationType) {
          case 'drop': {
            const delay = index * 0.1
            const itemProgress = Math.max(0, Math.min(1, (animationProgress - delay) / (1 - delay * itemCount / (itemCount + 1))))
            const bounceProgress = easeOutBounce(itemProgress)
            animatedY = padding + (y - padding) * bounceProgress - (1 - itemProgress) * 50
            animatedOpacity = itemProgress
            break
          }
          case 'scale':
            animatedScale = easedProgress
            break
          case 'fade':
            animatedOpacity = easedProgress
            break
          case 'slide': {
            const delay = index * 0.08
            const itemProgress = Math.max(0, Math.min(1, (animationProgress - delay) / 0.5))
            const slideX = (1 - easeOutCubic(itemProgress)) * chartWidth
            x -= slideX
            animatedOpacity = itemProgress
            break
          }
          case 'none':
            break
        }

        if (animatedOpacity > 0 && animatedScale > 0) {
          // 计算梯形的四个顶点
          const scaledTopWidth = topWidth * animatedScale
          const scaledBottomWidth = bottomWidth * animatedScale
          const scaledHeight = itemHeight * animatedScale

          let leftTopX: number, rightTopX: number, leftBottomX: number, rightBottomX: number
          if (align === 'left') {
            leftTopX = x
            rightTopX = x + scaledTopWidth
            leftBottomX = x
            rightBottomX = x + scaledBottomWidth
          } else if (align === 'right') {
            rightTopX = x + topWidth
            leftTopX = rightTopX - scaledTopWidth
            rightBottomX = x + topWidth - (topWidth - bottomWidth)
            leftBottomX = rightBottomX - scaledBottomWidth
          } else {
            const centerX = x + topWidth / 2
            leftTopX = centerX - scaledTopWidth / 2
            rightTopX = centerX + scaledTopWidth / 2
            leftBottomX = centerX - scaledBottomWidth / 2
            rightBottomX = centerX + scaledBottomWidth / 2
          }

          // 绘制梯形（带边框效果）
          const path = `M ${leftTopX} ${animatedY}
            L ${rightTopX} ${animatedY}
            L ${rightBottomX} ${animatedY + scaledHeight}
            L ${leftBottomX} ${animatedY + scaledHeight}
            Z`

          // 绘制阴影/边框效果
          renderer.drawPath(
            { commands: this.parsePath(path) as any },
            {
              fill: isHovered ? this.lightenColor(itemColor) : itemColor,
              opacity: animatedOpacity,
              stroke: isHovered ? this.darkenColor(itemColor) : 'rgba(255,255,255,0.3)',
              lineWidth: isHovered ? 2 : 1
            }
          )

          // 绘制高光效果（顶部）
          if (!isHovered) {
            const highlightPath = `M ${leftTopX + 2} ${animatedY + 2}
              L ${rightTopX - 2} ${animatedY + 2}
              L ${rightTopX - (rightTopX - rightBottomX) * 0.3 - 2} ${animatedY + scaledHeight * 0.3}
              L ${leftTopX + (leftTopX - leftBottomX) * 0.3 + 2} ${animatedY + scaledHeight * 0.3}
              Z`
            renderer.drawPath(
              { commands: this.parsePath(highlightPath) as any },
              {
                fill: 'rgba(255,255,255,0.15)',
                opacity: animatedOpacity
              }
            )
          }

          // 保存位置信息
          this.funnelItemPositions.set(itemId, {
            item,
            index,
            x: leftTopX,
            y: animatedY,
            topWidth: scaledTopWidth,
            bottomWidth: scaledBottomWidth,
            height: scaledHeight,
            color: itemColor
          })

          // 绘制标签
          if (showLabel && animationProgress > 0.3) {
            const labelOpacity = Math.min(1, (animationProgress - 0.3) / 0.4) * animatedOpacity
            let labelX: number
            let textAlign: CanvasTextAlign = 'left'
            const labelY = animatedY + scaledHeight / 2

            if (labelPosition === 'left') {
              labelX = leftTopX - 10
              textAlign = 'right'
            } else if (labelPosition === 'inside') {
              labelX = (leftTopX + rightTopX) / 2
              textAlign = 'center'
            } else if (labelPosition === 'outside') {
              labelX = rightTopX + 10
              textAlign = 'left'
            } else {
              // right
              labelX = rightTopX + 10
              textAlign = 'left'
            }

            // 绘制名称
            renderer.drawText(
              { x: labelX, y: labelY - 6, text: item.name },
              {
                fill: labelPosition === 'inside' ? '#fff' : colors.text,
                fontSize: 12,
                fontWeight: 'bold',
                textAlign,
                textBaseline: 'middle',
                opacity: labelOpacity
              }
            )

            // 绘制数值
            if (labelPosition !== 'inside') {
              renderer.drawText(
                { x: labelX, y: labelY + 8, text: `${item.value}` },
                {
                  fill: colors.textSecondary,
                  fontSize: 11,
                  textAlign,
                  textBaseline: 'middle',
                  opacity: labelOpacity
                }
              )
            }
          }
        }
      })
    })
  }

  // ============== 漏斗图鼠标事件 ==============

  private handleFunnelMouseMove(x: number, y: number, e: MouseEvent): void {
    let hoveredItem: string | null = null

    // 检查是否悬停在漏斗项上
    for (const [itemId, itemData] of this.funnelItemPositions) {
      // 简化检测：使用边界框
      if (x >= itemData.x && x <= itemData.x + itemData.topWidth &&
        y >= itemData.y && y <= itemData.y + itemData.height) {
        hoveredItem = itemId
        break
      }
    }

    if (hoveredItem !== this.hoverFunnelItem) {
      this.hoverFunnelItem = hoveredItem
      this.render()

      if (hoveredItem) {
        const itemData = this.funnelItemPositions.get(hoveredItem)
        if (itemData) {
          this.showFunnelTooltip(e, itemData.item, itemData.index)
        }
      } else {
        this.hideTooltip()
      }
    }
  }

  private showFunnelTooltip(e: MouseEvent, item: FunnelDataItem, index: number): void {
    if (!this.tooltipEl) {
      this.tooltipEl = document.createElement('div')
      this.tooltipEl.className = 'chart-tooltip'
      document.body.appendChild(this.tooltipEl)
    }

    this.tooltipEl.style.cssText = `
      position: fixed; padding: 8px 12px; background: ${this.colors.tooltipBg}; color: ${this.colors.text};
      border-radius: 6px; font-size: 12px; pointer-events: none; z-index: 9999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15); max-width: 200px; line-height: 1.5;
    `

    let content = `<div style="font-weight:bold;margin-bottom:4px;">${item.name}</div>`
    content += `<div>数值: ${item.value}</div>`
    content += `<div>排名: 第${index + 1}位</div>`

    this.tooltipEl.innerHTML = content
    this.tooltipEl.style.display = 'block'

    const tooltipRect = this.tooltipEl.getBoundingClientRect()
    let left = e.clientX + 15
    let top = e.clientY - tooltipRect.height / 2

    if (left + tooltipRect.width > window.innerWidth) left = e.clientX - tooltipRect.width - 15
    if (top < 0) top = 5
    if (top + tooltipRect.height > window.innerHeight) top = window.innerHeight - tooltipRect.height - 5

    this.tooltipEl.style.left = `${left}px`
    this.tooltipEl.style.top = `${top}px`
  }

  // ============== 仪表盘绑制 ==============

  private drawGaugeSeries(series: SeriesData[]): void {
    const { renderer, animationProgress, width, height } = this
    const colors = this.colors

    // 缓动函数
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const easeOutElastic = (t: number) => {
      if (t === 0 || t === 1) return t
      return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1
    }

    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = Math.min(width, height) / 2 - 20

    series.forEach((s) => {
      const gaugeData = s.gaugeData
      if (!gaugeData || gaugeData.length === 0) return

      // 配置
      const min = s.gaugeMin ?? 0
      const max = s.gaugeMax ?? 100
      const startAngle = ((s.gaugeStartAngle ?? 225) * Math.PI) / 180
      const endAngle = ((s.gaugeEndAngle ?? -45) * Math.PI) / 180
      const clockwise = s.gaugeClockwise !== false
      const splitNumber = s.gaugeSplitNumber ?? 5
      const radius = maxRadius * (s.gaugeRadius ?? 0.75)
      const axisLineWidth = s.gaugeAxisLineWidth ?? 20
      const showGradient = s.gaugeShowGradient !== false
      const showProgress = s.gaugeShowProgress !== false
      const progressWidth = s.gaugeProgressWidth ?? axisLineWidth
      const showPointer = s.gaugeShowPointer !== false
      const pointerAutoColor = s.gaugePointerAutoColor === true
      const pointerLength = s.gaugePointerLength ?? 0.6
      const pointerWidth = s.gaugePointerWidth ?? 6
      const centerSize = s.gaugeCenterSize ?? 8
      const showDetail = s.gaugeShowDetail !== false
      const detailFontSize = s.gaugeDetailFontSize ?? 24
      const detailOffset = s.gaugeDetailOffset ?? [0, 30]
      const showTitle = s.gaugeShowTitle !== false
      const titleOffset = s.gaugeTitleOffset ?? [0, 55]
      const showAxisLabel = s.gaugeShowAxisLabel !== false
      const axisLabelDistance = s.gaugeAxisLabelDistance ?? 12
      const animationType = s.gaugeAnimationType ?? 'sweep'
      const pointerStyle = s.gaugePointerStyle ?? 'default'
      const splitLine = s.gaugeSplitLine ?? { show: true, length: 8, lineStyle: { color: colors.text, width: 1 } }
      const axisTick = s.gaugeAxisTick ?? { show: true, splitNumber: 2, length: 4, lineStyle: { color: colors.textSecondary, width: 1 } }

      // 默认渐变色
      const axisLineColors = s.gaugeAxisLineColors ?? [
        { offset: 0.3, color: '#67e0e3' },
        { offset: 0.7, color: '#37a2da' },
        { offset: 1, color: '#fd666d' }
      ]

      // 计算角度范围
      const angleRange = clockwise ? startAngle - endAngle : endAngle - startAngle
      const valueRange = max - min

      // 根据动画类型计算进度
      let easedProgress = animationProgress
      switch (animationType) {
        case 'sweep':
          easedProgress = easeOutCubic(animationProgress)
          break
        case 'grow':
          easedProgress = easeOutCubic(animationProgress)
          break
        case 'bounce':
          easedProgress = easeOutElastic(animationProgress)
          break
        case 'fade':
          easedProgress = animationProgress
          break
        case 'none':
          easedProgress = 1
          break
      }

      // 绘制背景圆弧（仪表盘轨道）
      const trackRadius = radius - axisLineWidth / 2
      this.drawGaugeArc(centerX, centerY, trackRadius, startAngle, endAngle, clockwise, axisLineWidth, colors.grid, 0.2)

      // 绘制渐变色轨道（可通过 gaugeShowGradient 配置关闭）
      if (showGradient) {
        const gradientSteps = 100
        const innerTrackWidth = axisLineWidth - 6
        for (let i = 0; i < gradientSteps; i++) {
          const ratio = i / gradientSteps
          const nextRatio = (i + 1) / gradientSteps
          const segStartAngle = clockwise
            ? startAngle - angleRange * ratio
            : startAngle + angleRange * ratio
          const segEndAngle = clockwise
            ? startAngle - angleRange * nextRatio
            : startAngle + angleRange * nextRatio

          const color = this.getGradientColor(axisLineColors, ratio)
          this.drawGaugeArcSegment(centerX, centerY, trackRadius, segStartAngle, segEndAngle, innerTrackWidth, color, 0.85 * easedProgress)
        }
      }

      // 绘制分割线和刻度
      for (let i = 0; i <= splitNumber; i++) {
        const ratio = i / splitNumber
        const angle = clockwise
          ? startAngle - angleRange * ratio
          : startAngle + angleRange * ratio

        // 分割线（从轨道内边缘向外绘制）
        if (splitLine.show !== false) {
          const lineLength = splitLine.length ?? 8
          const lineWidth = splitLine.lineStyle?.width ?? 1.5
          const lineColor = splitLine.lineStyle?.color ?? colors.text
          // 轨道内边缘
          const innerEdge = radius - axisLineWidth
          const outerX = centerX + Math.cos(angle) * (innerEdge + lineLength)
          const outerY = centerY - Math.sin(angle) * (innerEdge + lineLength)
          const innerX = centerX + Math.cos(angle) * innerEdge
          const innerY = centerY - Math.sin(angle) * innerEdge

          renderer.drawLine(
            [{ x: innerX, y: innerY }, { x: outerX, y: outerY }],
            { stroke: lineColor, lineWidth, opacity: easedProgress * 0.8 }
          )
        }

        // 刻度标签（在轨道外侧）
        if (showAxisLabel) {
          const labelValue = min + valueRange * ratio
          const labelRadius = radius + axisLabelDistance
          const labelX = centerX + Math.cos(angle) * labelRadius
          const labelY = centerY - Math.sin(angle) * labelRadius
          // 根据数值范围决定是否显示小数
          const labelText = valueRange <= 10
            ? labelValue.toFixed(1)
            : Math.round(labelValue).toString()

          renderer.drawText(
            { x: labelX, y: labelY, text: labelText },
            {
              fill: colors.textSecondary,
              fontSize: 9,
              textAlign: 'center',
              textBaseline: 'middle',
              opacity: easedProgress * 0.85
            }
          )
        }

        // 小刻度（在分割线之间，轨道内侧）
        if (axisTick.show !== false && i < splitNumber) {
          const tickCount = axisTick.splitNumber ?? 4
          const tickLength = axisTick.length ?? 4
          const tickWidth = axisTick.lineStyle?.width ?? 1
          const tickColor = axisTick.lineStyle?.color ?? colors.textSecondary
          const tickInnerEdge = radius - axisLineWidth

          for (let j = 1; j < tickCount; j++) {
            const tickRatio = ratio + (j / tickCount) / splitNumber
            const tickAngle = clockwise
              ? startAngle - angleRange * tickRatio
              : startAngle + angleRange * tickRatio
            const tickOuterX = centerX + Math.cos(tickAngle) * (tickInnerEdge + tickLength)
            const tickOuterY = centerY - Math.sin(tickAngle) * (tickInnerEdge + tickLength)
            const tickInnerX = centerX + Math.cos(tickAngle) * tickInnerEdge
            const tickInnerY = centerY - Math.sin(tickAngle) * tickInnerEdge

            renderer.drawLine(
              [{ x: tickInnerX, y: tickInnerY }, { x: tickOuterX, y: tickOuterY }],
              { stroke: tickColor, lineWidth: tickWidth, opacity: easedProgress * 0.7 }
            )
          }
        }
      }

      // 绘制每个数据项
      gaugeData.forEach((item) => {
        const value = Math.max(min, Math.min(max, item.value))
        // 数值动画：所有动画类型都支持数值从0增长
        const animatedValue = animationType !== 'none'
          ? min + (value - min) * easedProgress
          : value
        const valueRatio = (animatedValue - min) / valueRange
        const targetValueRatio = (value - min) / valueRange
        const valueAngle = clockwise
          ? startAngle - angleRange * valueRatio
          : startAngle + angleRange * valueRatio
        const pointerAngle = animationType === 'sweep'
          ? startAngle - angleRange * targetValueRatio * easedProgress
          : valueAngle

        // 获取当前值对应的渐变色
        const currentGradientColor = this.getGradientColor(axisLineColors, targetValueRatio)

        // 进度条
        if (showProgress) {
          const progressColor = s.gaugeProgressColor || item.itemStyle?.color || currentGradientColor
          const progressEndAngle = animationType === 'sweep'
            ? startAngle - angleRange * targetValueRatio * easedProgress
            : (clockwise ? startAngle - angleRange * valueRatio : startAngle + angleRange * valueRatio)

          this.drawGaugeArc(
            centerX, centerY,
            trackRadius,
            startAngle,
            progressEndAngle,
            clockwise,
            progressWidth,
            progressColor,
            0.9
          )
        }

        // 指针
        if (showPointer) {
          // 指针颜色：支持自动跟随渐变色
          const pointerColor = pointerAutoColor
            ? currentGradientColor
            : (s.gaugePointerColor || item.itemStyle?.color || colors.text)
          const pLen = radius * pointerLength

          switch (pointerStyle) {
            case 'arrow':
            case 'triangle': {
              const tipX = centerX + Math.cos(pointerAngle) * pLen
              const tipY = centerY - Math.sin(pointerAngle) * pLen
              const baseAngle1 = pointerAngle + Math.PI / 2
              const baseAngle2 = pointerAngle - Math.PI / 2
              const baseX1 = centerX + Math.cos(baseAngle1) * pointerWidth
              const baseY1 = centerY - Math.sin(baseAngle1) * pointerWidth
              const baseX2 = centerX + Math.cos(baseAngle2) * pointerWidth
              const baseY2 = centerY - Math.sin(baseAngle2) * pointerWidth

              const path = `M ${tipX} ${tipY} L ${baseX1} ${baseY1} L ${baseX2} ${baseY2} Z`
              renderer.drawPath(
                { commands: this.parsePath(path) as any },
                { fill: pointerColor, opacity: easedProgress }
              )
              break
            }
            case 'rect': {
              const rectLength = pLen
              const rectWidth = pointerWidth
              const tipX = centerX + Math.cos(pointerAngle) * rectLength
              const tipY = centerY - Math.sin(pointerAngle) * rectLength

              renderer.drawLine(
                [{ x: centerX, y: centerY }, { x: tipX, y: tipY }],
                { stroke: pointerColor, lineWidth: rectWidth, opacity: easedProgress }
              )
              break
            }
            case 'circle': {
              const circleX = centerX + Math.cos(pointerAngle) * (pLen * 0.7)
              const circleY = centerY - Math.sin(pointerAngle) * (pLen * 0.7)
              renderer.drawCircle(
                { x: circleX, y: circleY, radius: pointerWidth * 1.5 },
                { fill: pointerColor, opacity: easedProgress }
              )
              break
            }
            default: {
              // default 样式 - 渐细指针
              const tipX = centerX + Math.cos(pointerAngle) * pLen
              const tipY = centerY - Math.sin(pointerAngle) * pLen
              const baseAngle1 = pointerAngle + Math.PI / 2
              const baseAngle2 = pointerAngle - Math.PI / 2
              const baseX1 = centerX + Math.cos(baseAngle1) * (pointerWidth / 2)
              const baseY1 = centerY - Math.sin(baseAngle1) * (pointerWidth / 2)
              const baseX2 = centerX + Math.cos(baseAngle2) * (pointerWidth / 2)
              const baseY2 = centerY - Math.sin(baseAngle2) * (pointerWidth / 2)
              const midLen = pLen * 0.8
              const midX = centerX + Math.cos(pointerAngle) * midLen
              const midY = centerY - Math.sin(pointerAngle) * midLen

              const path = `M ${tipX} ${tipY} L ${midX + Math.cos(baseAngle1) * 2} ${midY - Math.sin(baseAngle1) * 2} L ${baseX1} ${baseY1} L ${baseX2} ${baseY2} L ${midX + Math.cos(baseAngle2) * 2} ${midY - Math.sin(baseAngle2) * 2} Z`
              renderer.drawPath(
                { commands: this.parsePath(path) as any },
                { fill: pointerColor, opacity: easedProgress }
              )
            }
          }
        }

        // 数值显示（所有动画类型都支持数值动画）
        if (showDetail) {
          // 数值动画：显示动画过程中的值
          const displayValue = animationType !== 'none' ? animatedValue : item.value
          // 根据原始值的小数位数格式化
          const decimals = item.value.toString().includes('.')
            ? item.value.toString().split('.')[1]?.length || 0
            : 0
          const formattedNumber = decimals > 0
            ? displayValue.toFixed(decimals)
            : Math.round(displayValue).toString()

          let formattedValue = formattedNumber

          if (s.gaugeDetailFormatter) {
            if (typeof s.gaugeDetailFormatter === 'function') {
              formattedValue = s.gaugeDetailFormatter(displayValue)
            } else {
              formattedValue = s.gaugeDetailFormatter.replace('{value}', formattedNumber)
            }
          }

          // 数值颜色跟随渐变色
          const detailColor = pointerAutoColor
            ? currentGradientColor
            : (item.itemStyle?.color || colors.text)

          renderer.drawText(
            { x: centerX + detailOffset[0], y: centerY + detailOffset[1], text: formattedValue },
            {
              fill: detailColor,
              fontSize: detailFontSize,
              fontWeight: 'bold',
              textAlign: 'center',
              textBaseline: 'middle',
              opacity: easedProgress
            }
          )
        }

        // 标题（名称）
        if (showTitle && item.name) {
          renderer.drawText(
            { x: centerX + titleOffset[0], y: centerY + titleOffset[1], text: item.name },
            {
              fill: colors.textSecondary,
              fontSize: 12,
              textAlign: 'center',
              textBaseline: 'middle',
              opacity: easedProgress * 0.8
            }
          )
        }
      })

      // 中心圆（指针存在时绘制）
      if (showPointer) {
        renderer.drawCircle(
          { x: centerX, y: centerY, radius: centerSize },
          { fill: colors.text, opacity: easedProgress }
        )
        renderer.drawCircle(
          { x: centerX, y: centerY, radius: centerSize - 2 },
          { fill: colors.background, opacity: easedProgress }
        )
      }
    })
  }

  // 绘制仪表盘圆弧（完整弧线）
  private drawGaugeArc(
    cx: number, cy: number, radius: number,
    startAngle: number, endAngle: number,
    clockwise: boolean, lineWidth: number,
    color: string, opacity: number
  ): void {
    const { renderer } = this
    const angleRange = clockwise ? startAngle - endAngle : endAngle - startAngle
    const segments = Math.max(30, Math.ceil(Math.abs(angleRange) * 20))
    const points: { x: number; y: number }[] = []

    for (let i = 0; i <= segments; i++) {
      const ratio = i / segments
      const angle = clockwise
        ? startAngle - angleRange * ratio
        : startAngle + angleRange * ratio
      points.push({
        x: cx + Math.cos(angle) * radius,
        y: cy - Math.sin(angle) * radius
      })
    }

    if (points.length > 1) {
      renderer.drawLine(points, { stroke: color, lineWidth, opacity, lineCap: 'butt' })
    }
  }

  // 绘制仪表盘弧形段（用于渐变）
  private drawGaugeArcSegment(
    cx: number, cy: number, radius: number,
    startAngle: number, endAngle: number,
    lineWidth: number, color: string, opacity: number
  ): void {
    const { renderer } = this
    const points: { x: number; y: number }[] = [
      { x: cx + Math.cos(startAngle) * radius, y: cy - Math.sin(startAngle) * radius },
      { x: cx + Math.cos(endAngle) * radius, y: cy - Math.sin(endAngle) * radius }
    ]
    renderer.drawLine(points, { stroke: color, lineWidth, opacity, lineCap: 'butt' })
  }

  // 获取渐变色
  private getGradientColor(colorStops: GaugeAxisLineColor[], ratio: number): string {
    if (colorStops.length === 0) return '#5470c6'
    if (colorStops.length === 1) return colorStops[0]!.color

    // 找到ratio所在的区间
    let startColor = colorStops[0]!
    let endColor = colorStops[colorStops.length - 1]!

    for (let i = 0; i < colorStops.length - 1; i++) {
      const curr = colorStops[i]!
      const next = colorStops[i + 1]!
      if (ratio >= curr.offset && ratio <= next.offset) {
        startColor = curr
        endColor = next
        break
      }
    }

    // 计算插值比例
    const range = endColor.offset - startColor.offset
    const localRatio = range > 0 ? (ratio - startColor.offset) / range : 0

    // 颜色插值
    return this.gaugeInterpolateColor(startColor.color, endColor.color, localRatio)
  }

  // 仪表盘颜色插值
  private gaugeInterpolateColor(color1: string, color2: string, ratio: number): string {
    const hex1 = color1.replace('#', '')
    const hex2 = color2.replace('#', '')

    const r1 = parseInt(hex1.substring(0, 2), 16)
    const g1 = parseInt(hex1.substring(2, 4), 16)
    const b1 = parseInt(hex1.substring(4, 6), 16)

    const r2 = parseInt(hex2.substring(0, 2), 16)
    const g2 = parseInt(hex2.substring(2, 4), 16)
    const b2 = parseInt(hex2.substring(4, 6), 16)

    const r = Math.round(r1 + (r2 - r1) * ratio)
    const g = Math.round(g1 + (g2 - g1) * ratio)
    const b = Math.round(b1 + (b2 - b1) * ratio)

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  // ============== 词云绑制 ==============

  private drawWordCloudSeries(series: SeriesData[]): void {
    const { renderer, animationProgress, width, height } = this
    const colors = this.colors
    const padding = 20

    // 缓动函数
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    // 可用区域
    const areaWidth = width - padding * 2
    const areaHeight = height - padding * 2
    const centerX = width / 2
    const centerY = height / 2

    series.forEach((s) => {
      const wordData = s.wordCloudData || []
      if (wordData.length === 0) return

      // 配置项
      const shape = s.wordCloudShape ?? 'circle'
      const minFontSize = s.wordCloudMinFontSize ?? 12
      const maxFontSize = s.wordCloudMaxFontSize ?? 60
      const gridSize = s.wordCloudGridSize ?? 2
      const rotationRange = s.wordCloudRotationRange ?? [0, 90]
      const rotationStep = s.wordCloudRotationStep ?? 90
      const randomColor = s.wordCloudRandomColor !== false
      const customColors = s.wordCloudColors ?? SERIES_COLORS
      const fontFamily = s.wordCloudFontFamily ?? 'Microsoft YaHei, sans-serif'
      const fontWeight = s.wordCloudFontWeight ?? 'bold'
      const drawMask = s.wordCloudDrawMask === true
      const maskColor = s.wordCloudMaskColor ?? colors.grid

      // 计算字体大小范围
      const values = wordData.map(d => d.value)
      const minValue = Math.min(...values)
      const maxValue = Math.max(...values)
      const valueRange = maxValue - minValue || 1

      // 按权重排序（大的先放置）
      const sortedData = [...wordData].sort((a, b) => b.value - a.value)

      // 已放置的文字边界框
      const placedBoxes: { minX: number; maxX: number; minY: number; maxY: number }[] = []

      // 生成旋转角度选项
      const rotations: number[] = []
      for (let angle = rotationRange[0]; angle <= rotationRange[1]; angle += rotationStep) {
        rotations.push(angle)
      }
      if (rotations.length === 0) rotations.push(0)

      // 使用固定随机种子保证一致性
      const seededRandom = (seed: number) => {
        const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
        return x - Math.floor(x)
      }

      // 绘制形状遮罩（可选）
      if (drawMask) {
        this.drawWordCloudMask(centerX, centerY, areaWidth, areaHeight, shape, maskColor)
      }

      // 放置每个词
      sortedData.forEach((item, index) => {
        // 计算字体大小（使用平方根让大小差异更明显）
        const normalized = Math.sqrt((item.value - minValue) / valueRange)
        const fontSize = minFontSize + (maxFontSize - minFontSize) * normalized

        // 选择颜色
        let color = item.color
        if (!color) {
          color = randomColor
            ? customColors[index % customColors.length]
            : customColors[0]
        }

        // 选择旋转角度（使用种子随机）
        const rotationIndex = Math.floor(seededRandom(index * 7) * rotations.length)
        const rotation = rotations[rotationIndex]

        // 计算文字宽度和高度（考虑中文和英文）
        const charWidth = /[\u4e00-\u9fa5]/.test(item.name) ? fontSize : fontSize * 0.6
        const textWidth = item.name.length * charWidth
        const textHeight = fontSize * 1.2

        // 根据旋转调整边界框
        const isVertical = rotation !== undefined && Math.abs(rotation) === 90
        const boxW = isVertical ? textHeight : textWidth
        const boxH = isVertical ? textWidth : textHeight

        // 查找放置位置（阿基米德螺旋搜索）
        const position = this.findWordPositionSpiral(
          centerX, centerY, boxW, boxH,
          areaWidth, areaHeight, shape, placedBoxes, gridSize, index
        )

        if (position) {
          // 记录边界框
          placedBoxes.push({
            minX: position.x - boxW / 2 - gridSize,
            maxX: position.x + boxW / 2 + gridSize,
            minY: position.y - boxH / 2 - gridSize,
            maxY: position.y + boxH / 2 + gridSize
          })

          // 动画效果
          const itemProgress = Math.min(1, animationProgress * 1.5 - index / sortedData.length * 0.5)
          if (itemProgress <= 0) return

          const eased = easeOutCubic(Math.max(0, itemProgress))
          const opacity = eased

          // 绘制文字
          const displayFontSize = fontSize * (0.7 + 0.3 * eased)

          // 如果需要垂直显示，将文字逐字竖排
          if (isVertical) {
            const chars = item.name.split('')
            const startY = position.y - (chars.length - 1) * displayFontSize * 0.5
            chars.forEach((char, charIndex) => {
              renderer.drawText(
                { x: position.x, y: startY + charIndex * displayFontSize, text: char },
                {
                  fill: color,
                  fontSize: displayFontSize,
                  fontFamily: item.fontFamily ?? fontFamily,
                  fontWeight: item.fontWeight ?? fontWeight,
                  textAlign: 'center',
                  textBaseline: 'middle',
                  opacity
                }
              )
            })
          } else {
            renderer.drawText(
              { x: position.x, y: position.y, text: item.name },
              {
                fill: color,
                fontSize: displayFontSize,
                fontFamily: item.fontFamily ?? fontFamily,
                fontWeight: item.fontWeight ?? fontWeight,
                textAlign: 'center',
                textBaseline: 'middle',
                opacity
              }
            )
          }
        }
      })
    })
  }

  // 阿基米德螺旋搜索放置位置
  private findWordPositionSpiral(
    centerX: number, centerY: number,
    boxW: number, boxH: number,
    areaWidth: number, areaHeight: number,
    shape: WordCloudShape,
    placedBoxes: { minX: number; maxX: number; minY: number; maxY: number }[],
    gridSize: number,
    seed: number
  ): { x: number; y: number } | null {
    const maxRadius = Math.min(areaWidth, areaHeight) * 0.45
    const spiralB = gridSize * 0.5 // 螺旋参数

    // 从中心开始螺旋搜索
    for (let t = 0; t < 2000; t++) {
      const angle = t * 0.1
      const r = spiralB * angle

      if (r > maxRadius) break

      // 添加一些随机偏移让布局更自然
      const jitter = (Math.sin(seed * 12.9898 + t * 0.1) * 0.5 + 0.5) * gridSize * 2
      const x = centerX + (r + jitter) * Math.cos(angle)
      const y = centerY + (r + jitter) * Math.sin(angle)

      // 检查是否在形状内
      const hw = boxW / 2
      const hh = boxH / 2
      if (!this.isPointInShape(x - hw, y - hh, centerX, centerY, areaWidth, areaHeight, shape)) continue
      if (!this.isPointInShape(x + hw, y - hh, centerX, centerY, areaWidth, areaHeight, shape)) continue
      if (!this.isPointInShape(x - hw, y + hh, centerX, centerY, areaWidth, areaHeight, shape)) continue
      if (!this.isPointInShape(x + hw, y + hh, centerX, centerY, areaWidth, areaHeight, shape)) continue

      // 检查是否与已放置的文字重叠
      const newBox = { minX: x - hw, maxX: x + hw, minY: y - hh, maxY: y + hh }
      let overlap = false
      for (const placed of placedBoxes) {
        if (this.boxesOverlap(newBox, placed, 0)) {
          overlap = true
          break
        }
      }

      if (!overlap) {
        return { x, y }
      }
    }

    return null
  }

  // 检查点是否在形状内
  private isPointInShape(
    x: number, y: number,
    centerX: number, centerY: number,
    width: number, height: number,
    shape: WordCloudShape
  ): boolean {
    const dx = x - centerX
    const dy = y - centerY
    const hw = width / 2
    const hh = height / 2

    switch (shape) {
      case 'rect':
        return Math.abs(dx) <= hw && Math.abs(dy) <= hh

      case 'circle':
        return (dx * dx) / (hw * hw) + (dy * dy) / (hh * hh) <= 1

      case 'diamond':
        return Math.abs(dx) / hw + Math.abs(dy) / hh <= 1

      case 'triangle':
        // 等边三角形（顶点在上）
        const ty = dy + hh * 0.3
        if (ty < -hh * 0.7) return false
        const maxX = hw * (1 - (ty + hh * 0.7) / (hh * 1.4))
        return Math.abs(dx) <= maxX

      case 'star':
        // 五角星（简化判断）
        const angle = Math.atan2(dy, dx)
        const dist = Math.sqrt(dx * dx + dy * dy)
        const starR = hw * (0.4 + 0.3 * Math.abs(Math.cos(angle * 2.5)))
        return dist <= starR

      case 'heart':
        // 心形（简化判断）
        const nx = dx / hw
        const ny = -dy / hh + 0.3
        const heartEq = nx * nx + (ny - Math.sqrt(Math.abs(nx))) ** 2
        return heartEq <= 1

      default:
        return (dx * dx) / (hw * hw) + (dy * dy) / (hh * hh) <= 1
    }
  }

  // 检查两个边界框是否重叠
  private boxesOverlap(
    a: { minX: number; maxX: number; minY: number; maxY: number },
    b: { minX: number; maxX: number; minY: number; maxY: number },
    padding: number
  ): boolean {
    return !(
      a.maxX + padding < b.minX ||
      a.minX - padding > b.maxX ||
      a.maxY + padding < b.minY ||
      a.minY - padding > b.maxY
    )
  }

  // 绘制词云形状遮罩
  private drawWordCloudMask(
    centerX: number, centerY: number,
    width: number, height: number,
    shape: WordCloudShape, color: string
  ): void {
    const { renderer } = this
    const hw = width / 2
    const hh = height / 2

    switch (shape) {
      case 'rect':
        renderer.drawRect(
          { x: centerX - hw, y: centerY - hh, width, height },
          { stroke: color, lineWidth: 1, opacity: 0.3 }
        )
        break

      case 'circle':
        renderer.drawCircle(
          { x: centerX, y: centerY, radius: Math.min(hw, hh) },
          { stroke: color, lineWidth: 1, opacity: 0.3 }
        )
        break

      case 'diamond':
        const diamondPath = `M ${centerX} ${centerY - hh} L ${centerX + hw} ${centerY} L ${centerX} ${centerY + hh} L ${centerX - hw} ${centerY} Z`
        renderer.drawPath(
          { commands: this.parsePath(diamondPath) as any },
          { stroke: color, lineWidth: 1, opacity: 0.3 }
        )
        break

      case 'triangle':
        const trianglePath = `M ${centerX} ${centerY - hh * 0.7} L ${centerX + hw} ${centerY + hh * 0.7} L ${centerX - hw} ${centerY + hh * 0.7} Z`
        renderer.drawPath(
          { commands: this.parsePath(trianglePath) as any },
          { stroke: color, lineWidth: 1, opacity: 0.3 }
        )
        break

      case 'star':
        // 五角星
        const starPoints: string[] = []
        for (let i = 0; i < 10; i++) {
          const angle = (Math.PI / 2) + (i * Math.PI / 5)
          const r = i % 2 === 0 ? hw : hw * 0.4
          const px = centerX + r * Math.cos(angle)
          const py = centerY - r * Math.sin(angle)
          starPoints.push(`${i === 0 ? 'M' : 'L'} ${px} ${py}`)
        }
        starPoints.push('Z')
        renderer.drawPath(
          { commands: this.parsePath(starPoints.join(' ')) as any },
          { stroke: color, lineWidth: 1, opacity: 0.3 }
        )
        break

      case 'heart':
        // 心形（简化）
        const heartPath = `M ${centerX} ${centerY + hh * 0.4} 
          C ${centerX - hw} ${centerY - hh * 0.2} ${centerX - hw * 0.5} ${centerY - hh * 0.8} ${centerX} ${centerY - hh * 0.3}
          C ${centerX + hw * 0.5} ${centerY - hh * 0.8} ${centerX + hw} ${centerY - hh * 0.2} ${centerX} ${centerY + hh * 0.4} Z`
        renderer.drawPath(
          { commands: this.parsePath(heartPath) as any },
          { stroke: color, lineWidth: 1, opacity: 0.3 }
        )
        break
    }
  }
}
