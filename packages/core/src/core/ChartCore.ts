/**
 * ChartCore - 重构后的核心图表类
 * 
 * 特性：
 * - 使用注册系统，支持按需加载
 * - 统一的动画系统
 * - 统一的主题系统
 * - 模块化的 Series 渲染
 * 
 * @example
 * ```ts
 * import { ChartCore, use } from '@ldesign/chart-core'
 * import { LineSeriesNew, BarSeriesNew } from '@ldesign/chart-core/presets/basic'
 * 
 * // 注册需要的图表类型
 * use([LineSeriesNew, BarSeriesNew])
 * 
 * // 创建图表
 * const chart = new ChartCore('#container', {
 *   theme: 'dark',
 *   xAxis: { data: ['Mon', 'Tue', 'Wed'] },
 *   series: [
 *     { type: 'bar', data: [120, 200, 150] },
 *     { type: 'line', data: [100, 180, 130] },
 *   ],
 * })
 * ```
 */

import type { IRenderer } from '../renderer/interface'
import type { Theme } from '../theme/interface'
import type { ISeriesInstance, SeriesConstructorParams } from './registry'
import { createRenderer } from '../renderer/createRenderer'
import { EventEmitter } from '../event/EventEmitter'
import { LinearScale } from '../scale'
import { CartesianCoordinate } from '../coordinate'
import { createSeriesInstance, hasSeriesType } from './registry'
import {
  getTheme,
  getThemeColors,
  detectSystemTheme,
  getSeriesColor,
  type ThemeColors,
} from './theme'
import {
  resolveAnimationConfig,
  getEasing,
  type ChartAnimationConfig,
} from './animation'

// ============== 类型定义 ==============

/**
 * 图表区域
 */
export interface ChartRect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * 边距配置
 */
export interface Padding {
  top: number
  right: number
  bottom: number
  left: number
}

/**
 * 坐标轴配置
 */
export interface AxisConfig {
  /** 类目数据 */
  data?: string[]
  /** 轴名称 */
  name?: string
  /** 是否显示 */
  show?: boolean
  /** 轴反转 */
  inverse?: boolean
  /** 最小值 */
  min?: number | 'auto'
  /** 最大值 */
  max?: number | 'auto'
  /** 位置 */
  position?: 'top' | 'bottom' | 'left' | 'right'
}

/**
 * 系列配置
 */
export interface SeriesConfig {
  type: string
  name?: string
  data?: unknown[]
  color?: string
  [key: string]: unknown
}

/**
 * 图表配置
 */
export interface ChartCoreOptions {
  /** 宽度 */
  width?: number
  /** 高度 */
  height?: number
  /** 主题 */
  theme?: string | Theme
  /** 渲染器类型 */
  renderer?: 'canvas' | 'svg'
  /** 边距 */
  padding?: Partial<Padding>
  /** 动画配置 */
  animation?: boolean | Partial<ChartAnimationConfig>
  /** X 轴配置 */
  xAxis?: AxisConfig | AxisConfig[]
  /** Y 轴配置 */
  yAxis?: AxisConfig | AxisConfig[]
  /** 系列配置 */
  series?: SeriesConfig[]
  /** 是否横向 */
  horizontal?: boolean
  /** 网格 */
  grid?: { show?: boolean }
  /** 图例 */
  legend?: { show?: boolean; position?: 'top' | 'bottom' }
  /** 提示框 */
  tooltip?: { show?: boolean }
}

// ============== 常量 ==============

const DEFAULT_PADDING: Padding = {
  top: 40,
  right: 20,
  bottom: 40,
  left: 50,
}

const DEFAULT_WIDTH = 400
const DEFAULT_HEIGHT = 280

// ============== ChartCore 类 ==============

export class ChartCore extends EventEmitter {
  // 基础属性
  protected container: HTMLElement
  protected renderer: IRenderer
  protected options: ChartCoreOptions
  protected theme: Theme
  protected themeColors: ThemeColors

  // 尺寸
  protected width: number
  protected height: number
  protected padding: Padding
  protected chartRect: ChartRect

  // 系列实例
  protected seriesInstances: ISeriesInstance[] = []

  // 动画
  protected animationConfig: ChartAnimationConfig
  protected animationProgress = 1
  protected animationRafId: number | null = null
  protected animationStartTime = 0

  // 状态
  protected disposed = false
  protected resizeObserver: ResizeObserver | null = null

  constructor(container: string | HTMLElement, options: ChartCoreOptions = {}) {
    super()

    // 解析容器
    const el = typeof container === 'string'
      ? document.querySelector(container)
      : container
    if (!el || !(el instanceof HTMLElement)) {
      throw new Error(`Container not found: ${container}`)
    }
    this.container = el
    this.options = options

    // 初始化主题
    const themeName = typeof options.theme === 'string'
      ? options.theme
      : options.theme?.name ?? detectSystemTheme()
    this.theme = typeof options.theme === 'object'
      ? options.theme
      : getTheme(themeName)
    this.themeColors = getThemeColors(this.theme)

    // 初始化尺寸
    this.width = options.width ?? this.container.clientWidth ?? DEFAULT_WIDTH
    this.height = options.height ?? this.container.clientHeight ?? DEFAULT_HEIGHT
    this.padding = { ...DEFAULT_PADDING, ...options.padding }
    this.chartRect = this.calculateChartRect()

    // 初始化动画配置
    this.animationConfig = resolveAnimationConfig(options.animation)

    // 创建渲染器
    this.container.innerHTML = ''
    this.renderer = createRenderer(options.renderer ?? 'canvas')
    this.renderer.init(this.container, this.width, this.height)

    // 初始化系列
    this.initSeries()

    // 设置自动调整大小
    this.setupResizeObserver()

    // 开始渲染
    requestAnimationFrame(() => {
      if (this.disposed) return
      this.startEntryAnimation()
    })
  }

  // ============== 公共方法 ==============

  /**
   * 设置配置
   */
  setOption(options: Partial<ChartCoreOptions>): void {
    if (this.disposed) return

    this.options = { ...this.options, ...options }

    // 更新主题
    if (options.theme !== undefined) {
      const themeName = typeof options.theme === 'string'
        ? options.theme
        : options.theme?.name ?? 'light'
      this.theme = typeof options.theme === 'object'
        ? options.theme
        : getTheme(themeName)
      this.themeColors = getThemeColors(this.theme)
    }

    // 重新初始化系列
    if (options.series) {
      this.disposeSeries()
      this.initSeries()
    }

    this.render()
  }

  /**
   * 获取配置
   */
  getOption(): ChartCoreOptions {
    return { ...this.options }
  }

  /**
   * 调整大小
   */
  resize(width?: number, height?: number): void {
    if (this.disposed) return

    this.width = width ?? this.container.clientWidth ?? this.width
    this.height = height ?? this.container.clientHeight ?? this.height
    this.chartRect = this.calculateChartRect()

    this.renderer.resize(this.width, this.height)
    this.updateSeriesLayout()
    this.render()

    this.emit('resize', { width: this.width, height: this.height })
  }

  /**
   * 渲染
   */
  render(): void {
    if (this.disposed) return

    this.renderer.clear()
    this.paint()
  }

  /**
   * 销毁
   */
  dispose(): void {
    if (this.disposed) return

    this.disposed = true

    // 停止动画
    if (this.animationRafId !== null) {
      cancelAnimationFrame(this.animationRafId)
      this.animationRafId = null
    }

    // 移除 resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }

    // 销毁系列
    this.disposeSeries()

    // 销毁渲染器
    this.renderer.dispose()

    // 清除事件
    this.removeAllListeners()

    this.emit('disposed')
  }

  /**
   * 获取宽度
   */
  getWidth(): number {
    return this.width
  }

  /**
   * 获取高度
   */
  getHeight(): number {
    return this.height
  }

  /**
   * 是否已销毁
   */
  isDisposed(): boolean {
    return this.disposed
  }

  // ============== 保护方法 ==============

  /**
   * 计算图表区域
   */
  protected calculateChartRect(): ChartRect {
    return {
      x: this.padding.left,
      y: this.padding.top,
      width: this.width - this.padding.left - this.padding.right,
      height: this.height - this.padding.top - this.padding.bottom,
    }
  }

  /**
   * 初始化系列
   */
  protected initSeries(): void {
    const { series = [], xAxis } = this.options

    // 创建比例尺和坐标系
    const xAxisConfig = Array.isArray(xAxis) ? xAxis[0] : xAxis

    // 计算数据范围
    const { yMin, yMax } = this.calculateDataRange(series)

    // 创建比例尺
    const xScale = new LinearScale({
      domain: [0, Math.max((xAxisConfig?.data?.length ?? 1) - 1, 0)],
      range: [this.chartRect.x, this.chartRect.x + this.chartRect.width],
    })

    const yScale = new LinearScale({
      domain: [yMin, yMax],
      range: [this.chartRect.y + this.chartRect.height, this.chartRect.y],
    })

    // 创建坐标系
    const coordinate = new CartesianCoordinate({
      rect: {
        x: this.chartRect.x,
        y: this.chartRect.y,
        width: this.chartRect.width,
        height: this.chartRect.height,
      },
    })

    // 创建系列实例
    series.forEach((seriesConfig, index) => {
      if (!hasSeriesType(seriesConfig.type)) {
        console.warn(
          `Series type "${seriesConfig.type}" is not registered. ` +
          `Use \`use()\` to register it first.`
        )
        return
      }

      const params: SeriesConstructorParams = {
        option: {
          ...seriesConfig,
          seriesIndex: index,
          color: seriesConfig.color ?? getSeriesColor(this.theme, index),
        },
        xScale,
        yScale,
        coordinate,
        theme: this.theme,
        chartWidth: this.width,
        chartHeight: this.height,
        chartRect: this.chartRect,
      }

      const instance = createSeriesInstance(seriesConfig.type, params)
      if (instance) {
        this.seriesInstances.push(instance)
      }
    })
  }

  /**
   * 计算数据范围
   */
  protected calculateDataRange(series: SeriesConfig[]): { yMin: number; yMax: number } {
    let yMin = Infinity
    let yMax = -Infinity

    for (const s of series) {
      const data = s.data as (number | null)[] | undefined
      if (!data) continue

      for (const value of data) {
        if (typeof value === 'number') {
          yMin = Math.min(yMin, value)
          yMax = Math.max(yMax, value)
        }
      }
    }

    // 处理边界情况
    if (!isFinite(yMin)) yMin = 0
    if (!isFinite(yMax)) yMax = 100

    // 确保包含 0
    if (yMin > 0) yMin = 0
    if (yMax < 0) yMax = 0

    // 添加边距
    const padding = (yMax - yMin) * 0.1 || 10
    yMax = Math.ceil((yMax + padding) / 10) * 10
    if (yMin < 0) {
      yMin = Math.floor((yMin - padding) / 10) * 10
    }

    return { yMin, yMax }
  }

  /**
   * 更新系列布局
   */
  protected updateSeriesLayout(): void {
    for (const instance of this.seriesInstances) {
      if ('updateChartRect' in instance && typeof instance.updateChartRect === 'function') {
        (instance as { updateChartRect: (rect: ChartRect) => void }).updateChartRect(this.chartRect)
      }
    }
  }

  /**
   * 销毁系列
   */
  protected disposeSeries(): void {
    for (const instance of this.seriesInstances) {
      instance.dispose()
    }
    this.seriesInstances = []
  }

  /**
   * 绑图
   */
  protected paint(): void {
    // 绘制背景
    this.drawBackground()

    // 绘制网格
    if (this.options.grid?.show !== false) {
      this.drawGrid()
    }

    // 绘制坐标轴
    this.drawAxes()

    // 绘制系列
    for (const instance of this.seriesInstances) {
      instance.render(this.renderer, this.animationProgress)
    }

    // 绘制图例
    if (this.options.legend?.show !== false) {
      this.drawLegend()
    }
  }

  /**
   * 绘制背景
   */
  protected drawBackground(): void {
    this.renderer.drawRect(
      { x: 0, y: 0, width: this.width, height: this.height },
      { fill: this.themeColors.background }
    )
  }

  /**
   * 绘制网格
   */
  protected drawGrid(ticks = 5): void {
    const { chartRect, themeColors, renderer } = this

    for (let i = 0; i <= ticks; i++) {
      const y = chartRect.y + (i / ticks) * chartRect.height
      renderer.drawLine(
        [{ x: chartRect.x, y }, { x: chartRect.x + chartRect.width, y }],
        { stroke: themeColors.grid, lineWidth: 1 }
      )
    }
  }

  /**
   * 绘制坐标轴
   */
  protected drawAxes(): void {
    const { chartRect, themeColors, renderer, options } = this
    const xAxisConfig = Array.isArray(options.xAxis) ? options.xAxis[0] : options.xAxis
    const labels = xAxisConfig?.data ?? []

    // X 轴标签
    if (labels.length > 0) {
      const step = chartRect.width / Math.max(labels.length - 1, 1)
      labels.forEach((label, i) => {
        const x = chartRect.x + i * step
        renderer.drawText(
          { x, y: chartRect.y + chartRect.height + 20, text: label },
          {
            fill: themeColors.textSecondary,
            fontSize: 11,
            textAlign: i === 0 ? 'left' : i === labels.length - 1 ? 'right' : 'center',
          }
        )
      })
    }

    // Y 轴标签
    const { yMin, yMax } = this.calculateDataRange(options.series ?? [])
    const yTicks = 5
    for (let i = 0; i <= yTicks; i++) {
      const value = yMin + (yMax - yMin) * (1 - i / yTicks)
      const y = chartRect.y + (i / yTicks) * chartRect.height
      renderer.drawText(
        { x: chartRect.x - 8, y, text: this.formatNumber(value) },
        { fill: themeColors.textSecondary, fontSize: 11, textAlign: 'right', textBaseline: 'middle' }
      )
    }
  }

  /**
   * 绘制图例
   */
  protected drawLegend(): void {
    const { renderer, themeColors, options, width } = this
    const series = options.series ?? []

    if (series.length === 0) return

    const legendY = 15
    const itemWidth = 60
    const startX = (width - series.length * itemWidth) / 2

    series.forEach((s, i) => {
      const x = startX + i * itemWidth
      const color = s.color ?? getSeriesColor(this.theme, i)

      // 图例图标
      renderer.drawRect(
        { x, y: legendY - 5, width: 16, height: 10 },
        { fill: color, radius: 2 }
      )

      // 图例文字
      renderer.drawText(
        { x: x + 20, y: legendY, text: s.name ?? `Series ${i + 1}` },
        { fill: themeColors.textSecondary, fontSize: 11, textAlign: 'left', textBaseline: 'middle' }
      )
    })
  }

  /**
   * 格式化数字
   */
  protected formatNumber(value: number): string {
    if (Math.abs(value) >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M'
    }
    if (Math.abs(value) >= 1000) {
      return (value / 1000).toFixed(1) + 'K'
    }
    return value % 1 === 0 ? String(value) : value.toFixed(1)
  }

  // ============== 动画方法 ==============

  /**
   * 开始入场动画
   */
  protected startEntryAnimation(): void {
    if (!this.animationConfig.enabled) {
      this.animationProgress = 1
      this.render()
      return
    }

    this.animationProgress = 0
    this.animationStartTime = performance.now()
    this.animateFrame()
  }

  /**
   * 动画帧
   */
  protected animateFrame = (): void => {
    if (this.disposed) return

    const { entryDuration, entryDelay, easing } = this.animationConfig
    const elapsed = performance.now() - this.animationStartTime - entryDelay

    if (elapsed < 0) {
      this.animationRafId = requestAnimationFrame(this.animateFrame)
      return
    }

    const rawProgress = Math.min(elapsed / entryDuration, 1)
    const easingFn = getEasing(easing)
    this.animationProgress = easingFn(rawProgress)

    this.render()

    if (rawProgress < 1) {
      this.animationRafId = requestAnimationFrame(this.animateFrame)
    } else {
      this.animationProgress = 1
      this.animationRafId = null
      this.emit('animationEnd')
    }
  }

  // ============== Resize Observer ==============

  /**
   * 设置 resize observer
   */
  protected setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', this.handleResize)
      return
    }

    this.resizeObserver = new ResizeObserver(this.handleResize)
    this.resizeObserver.observe(this.container)
  }

  /**
   * 处理 resize
   */
  protected handleResize = (): void => {
    if (this.disposed) return

    // 防抖
    if (this.animationRafId !== null) return

    this.animationRafId = requestAnimationFrame(() => {
      this.animationRafId = null
      this.resize()
    })
  }
}

export default ChartCore
