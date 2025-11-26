/**
 * LChart 核心库入口
 * @module @aspect/lchart-core
 */

// 核心
export { Chart, createChart, EventEmitter } from './core'

// 渲染器
export { BaseRenderer, CanvasRenderer } from './renderers'

// 组件
export { Component, Title, Legend, Axis, Tooltip } from './components'
export type { ComponentOptions, LegendItem, AxisPosition } from './components'

// 系列
export { BaseSeries, LineSeries, BarSeries, PieSeries, ScatterSeries } from './series'
export type { SeriesContext } from './series'

// 动画
export { animate, interpolate, interpolateArray, interpolateColor, easingFunctions, getEasing } from './animation'
export type { AnimationConfig, AnimationInstance, EasingFunction } from './animation'

// 主题
export { defaultTheme, darkTheme, registerTheme, getTheme, getThemeNames } from './theme'

// 工具函数
export * from './utils'

// 类型
export type * from './types'
