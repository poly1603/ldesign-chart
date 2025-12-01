/**
 * 核心类型定义
 */

/**
 * 图表配置选项
 */
export interface ChartOption {
  /** 标题配置 */
  title?: TitleOption
  /** X轴配置 */
  xAxis?: AxisOption | AxisOption[]
  /** Y轴配置 */
  yAxis?: AxisOption | AxisOption[]
  /** 系列数据 */
  series?: SeriesOption[]
  /** 图例配置 */
  legend?: LegendOption
  /** 提示框配置 */
  tooltip?: TooltipOption
  /** 网格配置 */
  grid?: GridOption
  /** 主题 */
  theme?: string
  /** 渲染器类型 */
  renderer?: 'canvas' | 'svg' | 'webgl'
  /** 动画配置 */
  animation?: AnimationOption | boolean
}

/**
 * 图表初始化选项
 */
export interface ChartInitOptions {
  /** 渲染器类型 */
  renderer?: 'canvas' | 'svg' | 'webgl'
  /** 宽度 */
  width?: number
  /** 高度 */
  height?: number
  /** 设备像素比 */
  devicePixelRatio?: number
  /** 主题 */
  theme?: string
  /** 调试模式 */
  debug?: boolean
}

/**
 * 标题配置
 */
export interface TitleOption {
  /** 标题文本 */
  text?: string
  /** 副标题文本 */
  subtext?: string
  /** 位置 */
  left?: number | string
  top?: number | string
  /** 文本样式 */
  textStyle?: TextStyle
}

/**
 * 坐标轴配置
 */
export interface AxisOption {
  /** 坐标轴类型 */
  type?: 'category' | 'value' | 'time' | 'log'
  /** 坐标轴数据 */
  data?: unknown[]
  /** 坐标轴名称 */
  name?: string
  /** 最小值 */
  min?: number | string
  /** 最大值 */
  max?: number | string
  /** 是否显示 */
  show?: boolean
  /** 轴线配置 */
  axisLine?: AxisLineOption
  /** 刻度配置 */
  axisTick?: AxisTickOption
  /** 标签配置 */
  axisLabel?: AxisLabelOption
}

/**
 * 系列配置基础接口
 */
export interface SeriesOption {
  /** 系列类型 */
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'area' | 'radar' | string
  /** 系列名称 */
  name?: string
  /** 数据 */
  data: unknown[]
  /** 样式配置 */
  itemStyle?: ItemStyle
  /** 标签配置 */
  label?: LabelOption
  /** 动画配置 */
  animation?: AnimationOption | boolean
}

/**
 * 图例配置
 */
export interface LegendOption {
  /** 是否显示 */
  show?: boolean
  /** 位置 */
  left?: number | string
  top?: number | string
  /** 布局方向 */
  orient?: 'horizontal' | 'vertical'
  /** 数据 */
  data?: string[]
}

/**
 * 提示框配置
 */
export interface TooltipOption {
  /** 是否显示 */
  show?: boolean
  /** 触发类型 */
  trigger?: 'item' | 'axis' | 'none'
  /** 格式化函数 */
  formatter?: string | ((params: unknown) => string)
}

/**
 * 网格配置
 */
export interface GridOption {
  /** 距离容器左侧距离 */
  left?: number | string
  /** 距离容器右侧距离 */
  right?: number | string
  /** 距离容器顶部距离 */
  top?: number | string
  /** 距离容器底部距离 */
  bottom?: number | string
  /** 是否包含坐标轴刻度标签 */
  containLabel?: boolean
}

/**
 * 动画配置
 */
export interface AnimationOption {
  /** 是否开启动画 */
  enabled?: boolean
  /** 动画时长 */
  duration?: number
  /** 缓动函数 */
  easing?: string
  /** 延迟 */
  delay?: number
}

/**
 * 文本样式
 */
export interface TextStyle {
  color?: string
  fontSize?: number
  fontWeight?: string | number
  fontFamily?: string
}

/**
 * 轴线配置
 */
export interface AxisLineOption {
  show?: boolean
  lineStyle?: LineStyle
}

/**
 * 刻度配置
 */
export interface AxisTickOption {
  show?: boolean
  length?: number
}

/**
 * 轴标签配置
 */
export interface AxisLabelOption {
  show?: boolean
  formatter?: string | ((value: unknown) => string)
  textStyle?: TextStyle
}

/**
 * 图形样式
 */
export interface ItemStyle {
  color?: string | string[]
  borderColor?: string
  borderWidth?: number
  opacity?: number
}

/**
 * 标签配置
 */
export interface LabelOption {
  show?: boolean
  position?: string
  formatter?: string | ((params: unknown) => string)
  textStyle?: TextStyle
}

/**
 * 线条样式
 */
export interface LineStyle {
  color?: string
  width?: number
  type?: 'solid' | 'dashed' | 'dotted'
}

/**
 * 矩形
 */
export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * 点
 */
export interface Point {
  x: number
  y: number
}

/**
 * 尺寸
 */
export interface Size {
  width: number
  height: number
}