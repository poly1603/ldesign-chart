/**
 * @ldesign/chart-core
 * 核心图表库入口文件
 */

// 导出核心类
export { Chart } from './chart/Chart'

// 导出事件系统
export { EventEmitter } from './event/EventEmitter'

// 导出比例尺系统
export { LinearScale, BandScale } from './scale'
export type { IScale, ContinuousScaleOptions, BandScaleOptions, TimeScaleOptions } from './scale'

// 导出坐标系统
export { CartesianCoordinate } from './coordinate'
export type { ICoordinate, CoordinateType, CartesianCoordinateOptions, PolarCoordinateOptions } from './coordinate'

// 导出组件系统
export { Axis, Legend, Title, Tooltip } from './component'
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
  TooltipPosition
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
} from './series'

// 导出渲染器
export { CanvasRenderer } from './renderer/CanvasRenderer'
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