/**
 * @ldesign/chart-core
 * 核心图表库入口文件
 * 
 * 推荐使用方式（参考 ECharts）：
 * ```ts
 * import { Chart } from '@ldesign/chart-core'
 * 
 * const chart = new Chart('#container', {
 *   xAxis: { data: ['Mon', 'Tue', 'Wed'] },
 *   series: [
 *     { type: 'bar', name: '销量', data: [120, 200, 150] },
 *     { type: 'line', name: '增长率', data: [10, 15, 12] },
 *   ],
 * })
 * ```
 */

// ============== 核心图表类（推荐使用）==============
export { Chart } from './charts'
export type { ChartOptions, SeriesData, SeriesType, XAxisConfig, YAxisConfig, LineStyle as ChartLineStyle, AreaStyle } from './charts'

// ============== 基础类 ==============
export { BaseChart } from './charts'
export type { BaseChartOptions } from './charts'

// ============== 饼图（推荐使用）==============
export { PieChart } from './charts'
export type { PieChartOptions, PieDataItem as PieChartDataItem, PieLabelLineOptions } from './charts'

// 导出事件系统
export { EventEmitter } from './event/EventEmitter'

// 导出比例尺系统
export { LinearScale, BandScale, TimeScale, LogScale } from './scale'
export type { IScale, ContinuousScaleOptions, BandScaleOptions, TimeScaleOptions, LogScaleOptions } from './scale'

// 导出坐标系统
export { CartesianCoordinate, PolarCoordinate, CalendarCoordinate } from './coordinate'
export type { ICoordinate, CoordinateType, CartesianCoordinateOptions, PolarCoordinateOptions, CalendarCoordinateOptions } from './coordinate'

// 导出组件系统
export { Axis, Legend, Title, Tooltip, DataZoom } from './component'
export type {
  IComponent,
  ComponentType,
  ComponentOptions,
  AxisOrientation,
  AxisComponentOptions,
  LegendComponentOptions,
  LegendItem,
  LegendOrient,
  LegendPosition,
  TitleComponentOptions,
  TitleAlign,
  TooltipComponentOptions,
  TooltipDataItem,
  TooltipTrigger,
  TooltipPosition,
  DataZoomComponentOptions,
  DataZoomEvent,
  DataZoomType,
} from './component'

// 导出系列系统
export {
  Series,
  LineSeries,
  BarSeries,
  ScatterSeries,
  AreaSeries,
  PieSeries,
  RadarSeries,
  GaugeSeries,
  FunnelSeries,
  RingProgressSeries,
  MixedSeries,
  CandlestickSeries,
  HeatmapSeries,
  GraphSeries,
  TreeSeries,
  SankeySeries,
  PictorialBarSeries,
} from './series'
export type {
  BarSeriesOption,
  ScatterSeriesOption,
  ScatterDataItem,
  AreaSeriesOption,
  PieSeriesOption,
  PieDataItem,
  RadarSeriesOption,
  RadarDataItem,
  RadarIndicator,
  GaugeSeriesOption,
  GaugeDataItem,
  FunnelSeriesOption,
  FunnelDataItem,
  RingProgressSeriesOption,
  RingProgressDataItem,
  MixedSeriesOption,
  MixedSeriesDataItem,
  CandlestickSeriesOption,
  CandlestickDataItem,
  HeatmapSeriesOption,
  HeatmapDataItem,
  GraphSeriesOption,
  GraphNode,
  GraphLink,
  GraphCategory,
  TreeSeriesOption,
  TreeNode,
  SankeySeriesOption,
  SankeyNode,
  SankeyLink,
  PictorialBarSeriesOption,
  PictorialBarDataItem,
} from './series'

// 导出渲染器
export { CanvasRenderer } from './renderer/CanvasRenderer'
export { SVGRenderer } from './renderer/SVGRenderer'
export { createRenderer, initRenderer } from './renderer/createRenderer'
export type { RendererType } from './renderer/createRenderer'
export type {
  IRenderer,
  IRendererFactory,
  PathData,
  PathCommand,
  PathStyle,
  RectStyle,
  Circle,
  CircleStyle,
  Text,
  TextStyle,
  Rect as RendererRect,
  Point as RendererPoint,
  LineStyle as RendererLineStyle,
  GradientDef,
  ArcStyle,
  SectorStyle,
  PolygonStyle,
} from './renderer/interface'

// 导出主题系统
export { ThemeManager, defaultTheme, darkTheme } from './theme'
export type {
  Theme,
  IThemeManager,
  ColorTheme,
  ComponentTheme,
  SeriesTheme,
} from './theme'

// 导出动画系统
export {
  Animation,
  PropertyAnimation,
  AnimationManager,
  KeyframeAnimation,
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  easeInQuint,
  easeOutQuint,
  easeInOutQuint,
  easeInSine,
  easeOutSine,
  easeInOutSine,
  easeInExpo,
  easeOutExpo,
  easeInOutExpo,
  easeInCirc,
  easeOutCirc,
  easeInOutCirc,
  easeInBack,
  easeOutBack,
  easeInOutBack,
  easeInElastic,
  easeOutElastic,
  easeInOutElastic,
  easeInBounce,
  easeOutBounce,
  easeInOutBounce,
  easingFunctions,
  getEasingFunction,
  ChartAnimator,
} from './animation'
export type {
  IAnimation,
  IAnimationManager,
  AnimationOptions,
  PropertyAnimationOptions,
  KeyframeAnimationOptions,
  MultiKeyframeAnimationOptions,
  Keyframe,
  MultiKeyframe,
  EasingFunction,
  AnimationState,
  SeriesAnimationOptions,
  AnimationProgress,
  ChartAnimationType,
} from './animation'

// 导出类型定义
export type {
  ChartOption,
  ChartInitOptions,
  TitleOption,
  AxisOption,
  SeriesOption,
  LegendOption,
  TooltipOption,
  GridOption,
  AnimationOption,
  TextStyle as CoreTextStyle,
  AxisLineOption,
  AxisTickOption,
  AxisLabelOption,
  ItemStyle,
  LabelOption,
  LineStyle,
  Rect,
  Point,
  Size,
} from './types'

// 导出交互系统
export { InteractionManager } from './interaction'
export type {
  InteractionEventType,
  DataItemPosition,
  InteractionEvent,
  HighlightOptions,
  AxisPointerType,
  AxisPointerConfig,
} from './interaction'

// 导出工具函数
export {
  isObject,
  isArray,
  isString,
  isNumber,
  isFunction,
  merge,
  clone,
  throttle,
  debounce,
  generateId,
  clamp,
  lerp,
  getElementSize,
  formatNumber,
  parseColor,
} from './util'