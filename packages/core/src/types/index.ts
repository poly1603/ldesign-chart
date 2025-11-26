/**
 * LChart 核心类型定义
 * @module @aspect/lchart-core/types
 */

// ==================== 基础类型 ====================

/** 点坐标 */
export interface Point {
  x: number
  y: number
}

/** 矩形区域 */
export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

/** 内边距 */
export interface Padding {
  top: number
  right: number
  bottom: number
  left: number
}

/** 尺寸 */
export interface Size {
  width: number
  height: number
}

/** 颜色类型 */
export type Color = string | CanvasGradient | CanvasPattern

/** 渐变类型 */
export interface GradientStop {
  offset: number
  color: string
}

export interface LinearGradient {
  type: 'linear'
  x1: number
  y1: number
  x2: number
  y2: number
  stops: GradientStop[]
}

export interface RadialGradient {
  type: 'radial'
  cx: number
  cy: number
  r: number
  stops: GradientStop[]
}

export type Gradient = LinearGradient | RadialGradient

// ==================== 数据类型 ====================

/** 数据点 */
export interface DataPoint {
  /** x 轴值 */
  x: number | string | Date
  /** y 轴值 */
  y: number
  /** 附加数据 */
  extra?: Record<string, unknown>
}

/** 数据集 */
export interface DataSet {
  /** 数据集名称 */
  name?: string
  /** 数据点列表 */
  data: DataPoint[] | number[]
  /** 样式配置 */
  style?: SeriesStyle
}

/** 简化的数据格式 */
export interface SimpleData {
  /** 分类标签 */
  labels?: (string | number)[]
  /** 数据集列表 */
  datasets: DataSet[]
}

// ==================== 样式类型 ====================

/** 线条样式 */
export interface LineStyle {
  /** 线条颜色 */
  color?: Color
  /** 线条宽度 */
  width?: number
  /** 线条类型 */
  type?: 'solid' | 'dashed' | 'dotted'
  /** 虚线配置 */
  dashArray?: number[]
  /** 线帽样式 */
  cap?: CanvasLineCap
  /** 线段连接样式 */
  join?: CanvasLineJoin
  /** 透明度 */
  opacity?: number
}

/** 填充样式 */
export interface FillStyle {
  /** 填充颜色 */
  color?: Color
  /** 渐变 */
  gradient?: Gradient
  /** 透明度 */
  opacity?: number
}

/** 文本样式 */
export interface TextStyle {
  /** 字体颜色 */
  color?: string
  /** 字体大小 */
  fontSize?: number
  /** 字体粗细 */
  fontWeight?: 'normal' | 'bold' | number
  /** 字体家族 */
  fontFamily?: string
  /** 文本对齐 */
  align?: CanvasTextAlign
  /** 基线对齐 */
  baseline?: CanvasTextBaseline
  /** 透明度 */
  opacity?: number
}

/** 系列样式 */
export interface SeriesStyle {
  /** 线条样式 */
  line?: LineStyle
  /** 填充样式 */
  fill?: FillStyle
  /** 数据点样式 */
  point?: PointStyle
}

/** 数据点样式 */
export interface PointStyle {
  /** 是否显示 */
  show?: boolean
  /** 形状 */
  shape?: 'circle' | 'rect' | 'triangle' | 'diamond'
  /** 大小 */
  size?: number
  /** 填充颜色 */
  fill?: Color
  /** 边框颜色 */
  stroke?: Color
  /** 边框宽度 */
  strokeWidth?: number
}

// ==================== 组件配置 ====================

/** 标题配置 */
export interface TitleOptions {
  /** 是否显示 */
  show?: boolean
  /** 标题文本 */
  text?: string
  /** 副标题 */
  subtext?: string
  /** 位置 */
  position?: 'top' | 'bottom' | 'left' | 'right'
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 文本样式 */
  textStyle?: TextStyle
  /** 副标题样式 */
  subtextStyle?: TextStyle
  /** 内边距 */
  padding?: number | number[]
}

/** 图例配置 */
export interface LegendOptions {
  /** 是否显示 */
  show?: boolean
  /** 位置 */
  position?: 'top' | 'bottom' | 'left' | 'right'
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 方向 */
  orient?: 'horizontal' | 'vertical'
  /** 图例数据 */
  data?: string[]
  /** 图标形状 */
  icon?: 'circle' | 'rect' | 'line'
  /** 图标大小 */
  itemWidth?: number
  itemHeight?: number
  /** 间距 */
  itemGap?: number
  /** 文本样式 */
  textStyle?: TextStyle
  /** 内边距 */
  padding?: number | number[]
}

/** 坐标轴配置 */
export interface AxisOptions {
  /** 是否显示 */
  show?: boolean
  /** 轴类型 */
  type?: 'value' | 'category' | 'time' | 'log'
  /** 轴名称 */
  name?: string
  /** 名称位置 */
  nameLocation?: 'start' | 'middle' | 'end'
  /** 名称样式 */
  nameTextStyle?: TextStyle
  /** 最小值 */
  min?: number | 'auto'
  /** 最大值 */
  max?: number | 'auto'
  /** 分割段数 */
  splitNumber?: number
  /** 轴线配置 */
  axisLine?: {
    show?: boolean
    style?: LineStyle
  }
  /** 刻度配置 */
  axisTick?: {
    show?: boolean
    length?: number
    style?: LineStyle
  }
  /** 标签配置 */
  axisLabel?: {
    show?: boolean
    rotate?: number
    formatter?: string | ((value: unknown, index: number) => string)
    style?: TextStyle
  }
  /** 分割线配置 */
  splitLine?: {
    show?: boolean
    style?: LineStyle
  }
  /** 分类数据 */
  data?: (string | number)[]
}

/** 网格配置 */
export interface GridOptions {
  /** 是否显示 */
  show?: boolean
  /** 位置 */
  left?: number | string
  right?: number | string
  top?: number | string
  bottom?: number | string
  /** 宽度 */
  width?: number | string
  /** 高度 */
  height?: number | string
  /** 是否包含标签 */
  containLabel?: boolean
  /** 背景色 */
  backgroundColor?: Color
  /** 边框颜色 */
  borderColor?: Color
  /** 边框宽度 */
  borderWidth?: number
}

/** 提示框配置 */
export interface TooltipOptions {
  /** 是否显示 */
  show?: boolean
  /** 触发方式 */
  trigger?: 'item' | 'axis' | 'none'
  /** 触发条件 */
  triggerOn?: 'mousemove' | 'click' | 'none'
  /** 格式化函数 */
  formatter?: string | ((params: TooltipParams) => string)
  /** 背景色 */
  backgroundColor?: Color
  /** 边框颜色 */
  borderColor?: Color
  /** 边框宽度 */
  borderWidth?: number
  /** 内边距 */
  padding?: number | number[]
  /** 文本样式 */
  textStyle?: TextStyle
  /** 是否跟随鼠标 */
  followPointer?: boolean
}

/** 提示框参数 */
export interface TooltipParams {
  /** 系列名称 */
  seriesName?: string
  /** 数据名称 */
  name?: string
  /** 数据值 */
  value?: number | number[]
  /** 数据索引 */
  dataIndex?: number
  /** 系列索引 */
  seriesIndex?: number
  /** 颜色 */
  color?: Color
  /** 原始数据 */
  data?: DataPoint
}

// ==================== 系列配置 ====================

/** 基础系列配置 */
export interface BaseSeriesOptions {
  /** 系列类型 */
  type: string
  /** 系列名称 */
  name?: string
  /** 数据 */
  data?: DataPoint[] | number[]
  /** 样式 */
  style?: SeriesStyle
  /** 动画配置 */
  animation?: AnimationOptions
  /** 是否显示 */
  show?: boolean
}

/** 折线图系列配置 */
export interface LineSeriesOptions extends BaseSeriesOptions {
  type: 'line'
  /** 是否平滑曲线 */
  smooth?: boolean | number
  /** 是否填充区域 */
  areaStyle?: FillStyle
  /** 是否显示数据点 */
  showSymbol?: boolean
  /** 数据点样式 */
  symbol?: 'circle' | 'rect' | 'triangle' | 'diamond' | 'none'
  /** 数据点大小 */
  symbolSize?: number
  /** 是否阶梯线 */
  step?: 'start' | 'middle' | 'end' | false
  /** 连接空值 */
  connectNulls?: boolean
}

/** 柱状图系列配置 */
export interface BarSeriesOptions extends BaseSeriesOptions {
  type: 'bar'
  /** 柱宽度 */
  barWidth?: number | string
  /** 柱最大宽度 */
  barMaxWidth?: number | string
  /** 柱最小宽度 */
  barMinWidth?: number | string
  /** 柱间距 */
  barGap?: string
  /** 类目间距 */
  barCategoryGap?: string
  /** 堆叠组 */
  stack?: string
  /** 圆角 */
  borderRadius?: number | number[]
}

/** 饼图系列配置 */
export interface PieSeriesOptions extends BaseSeriesOptions {
  type: 'pie'
  /** 圆心位置 */
  center?: [string | number, string | number]
  /** 半径 */
  radius?: number | string | [number | string, number | string]
  /** 起始角度 */
  startAngle?: number
  /** 结束角度 */
  endAngle?: number
  /** 是否顺时针 */
  clockwise?: boolean
  /** 是否玫瑰图 */
  roseType?: 'radius' | 'area' | false
  /** 标签配置 */
  label?: {
    show?: boolean
    position?: 'inside' | 'outside' | 'center'
    formatter?: string | ((params: TooltipParams) => string)
    style?: TextStyle
  }
  /** 标签引导线 */
  labelLine?: {
    show?: boolean
    length?: number
    length2?: number
    style?: LineStyle
  }
}

/** 散点图系列配置 */
export interface ScatterSeriesOptions extends BaseSeriesOptions {
  type: 'scatter'
  /** 数据点形状 */
  symbol?: 'circle' | 'rect' | 'triangle' | 'diamond'
  /** 数据点大小 */
  symbolSize?: number | ((data: DataPoint) => number)
  /** 透明度 */
  opacity?: number
}

/** 面积图系列配置 */
export interface AreaSeriesOptions extends Omit<LineSeriesOptions, 'type'> {
  type: 'area'
}

/** 系列配置联合类型 */
export type SeriesOptions =
  | LineSeriesOptions
  | BarSeriesOptions
  | PieSeriesOptions
  | ScatterSeriesOptions
  | AreaSeriesOptions

// ==================== 动画配置 ====================

/** 动画配置 */
export interface AnimationOptions {
  /** 是否开启动画 */
  enabled?: boolean
  /** 动画时长 */
  duration?: number
  /** 缓动函数 */
  easing?: EasingType
  /** 延迟 */
  delay?: number | ((index: number) => number)
  /** 更新动画时长 */
  updateDuration?: number
  /** 更新动画缓动 */
  updateEasing?: EasingType
}

/** 缓动函数类型 */
export type EasingType =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInElastic'
  | 'easeOutElastic'
  | 'easeInOutElastic'
  | 'easeInBounce'
  | 'easeOutBounce'
  | 'easeInOutBounce'

// ==================== 主题配置 ====================

/** 主题配置 */
export interface ThemeOptions {
  /** 主题名称 */
  name?: string
  /** 调色板 */
  colors?: string[]
  /** 背景色 */
  backgroundColor?: Color
  /** 文本颜色 */
  textColor?: string
  /** 坐标轴颜色 */
  axisColor?: string
  /** 分割线颜色 */
  splitLineColor?: string
  /** 提示框样式 */
  tooltip?: Partial<TooltipOptions>
  /** 标题样式 */
  title?: Partial<TitleOptions>
  /** 图例样式 */
  legend?: Partial<LegendOptions>
}

// ==================== 图表配置 ====================

/** 图表配置项 */
export interface ChartOptions {
  /** 图表类型（简化配置用） */
  type?: 'line' | 'bar' | 'pie' | 'scatter' | 'area'
  /** 简化数据格式 */
  data?: SimpleData
  /** 标题 */
  title?: TitleOptions | string
  /** 图例 */
  legend?: LegendOptions
  /** 提示框 */
  tooltip?: TooltipOptions
  /** X 轴 */
  xAxis?: AxisOptions | AxisOptions[]
  /** Y 轴 */
  yAxis?: AxisOptions | AxisOptions[]
  /** 网格 */
  grid?: GridOptions | GridOptions[]
  /** 系列 */
  series?: SeriesOptions[]
  /** 主题 */
  theme?: string | ThemeOptions
  /** 动画 */
  animation?: AnimationOptions
  /** 响应式配置 */
  responsive?: boolean
  /** 设备像素比 */
  devicePixelRatio?: number
  /** 渲染器类型 */
  renderer?: 'canvas' | 'svg'
  /** 宽度 */
  width?: number | string
  /** 高度 */
  height?: number | string
  /** 背景色 */
  backgroundColor?: Color
}

// ==================== 事件类型 ====================

/** 鼠标事件参数 */
export interface MouseEventParams {
  /** 事件类型 */
  type: string
  /** 组件类型 */
  componentType?: string
  /** 系列类型 */
  seriesType?: string
  /** 系列索引 */
  seriesIndex?: number
  /** 系列名称 */
  seriesName?: string
  /** 数据名称 */
  name?: string
  /** 数据索引 */
  dataIndex?: number
  /** 数据值 */
  value?: number | number[]
  /** 颜色 */
  color?: Color
  /** 原始事件 */
  event?: MouseEvent
  /** 数据点坐标 */
  point?: Point
}

/** 图表事件映射 */
export interface ChartEventMap {
  /** 点击事件 */
  click: MouseEventParams
  /** 双击事件 */
  dblclick: MouseEventParams
  /** 鼠标按下 */
  mousedown: MouseEventParams
  /** 鼠标抬起 */
  mouseup: MouseEventParams
  /** 鼠标移动 */
  mousemove: MouseEventParams
  /** 鼠标移入 */
  mouseover: MouseEventParams
  /** 鼠标移出 */
  mouseout: MouseEventParams
  /** 图例选中改变 */
  legendselectchanged: { name: string; selected: Record<string, boolean> }
  /** 数据区域缩放 */
  datazoom: { start: number; end: number }
  /** 渲染完成 */
  rendered: { elapsedTime: number }
  /** 销毁前 */
  beforeDestroy: void
}

/** 事件处理函数类型 */
export type EventHandler<T> = (params: T) => void

// ==================== 渲染器类型 ====================

/** 渲染器接口 */
export interface IRenderer {
  /** 获取渲染上下文 */
  getContext(): CanvasRenderingContext2D | SVGSVGElement | null
  /** 设置尺寸 */
  setSize(width: number, height: number): void
  /** 清空画布 */
  clear(): void
  /** 渲染 */
  render(): void
  /** 销毁 */
  dispose(): void

  // 基础绑制方法
  drawLine(points: Point[], style?: LineStyle): void
  drawRect(rect: Rect, style?: FillStyle, borderStyle?: LineStyle): void
  drawCircle(center: Point, radius: number, style?: FillStyle, borderStyle?: LineStyle): void
  drawArc(center: Point, radius: number, startAngle: number, endAngle: number, style?: FillStyle, borderStyle?: LineStyle): void
  drawPath(path: string | Path2D, style?: FillStyle, borderStyle?: LineStyle): void
  drawText(text: string, position: Point, style?: TextStyle): void
  drawPolygon(points: Point[], style?: FillStyle, borderStyle?: LineStyle): void

  // 变换方法
  save(): void
  restore(): void
  translate(x: number, y: number): void
  rotate(angle: number): void
  scale(x: number, y: number): void
  setClip(rect: Rect): void
}

/** 渲染器配置 */
export interface RendererOptions {
  /** 设备像素比 */
  devicePixelRatio?: number
  /** 是否抗锯齿 */
  antialias?: boolean
  /** 背景色 */
  backgroundColor?: Color
}
