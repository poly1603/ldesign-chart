/**
 * 系列基类 - 支持注册系统的新版本
 * 所有系列类型都应该继承此类
 */

import type { IRenderer, Point } from '../renderer/interface'
import type { ICoordinate } from '../coordinate/interface'
import type { IScale } from '../scale/interface'
import type { Theme } from '../theme/interface'
import type {
  RegisterableSeries,
  ISeriesInstance,
  SeriesConstructorParams,
  SeriesOptionBase
} from '../core/registry'
import { EventEmitter } from '../event/EventEmitter'
import { getSeriesColor } from '../core/theme'

// ============== 类型定义 ==============

/**
 * 系列基础配置
 */
export interface BaseSeriesOption extends SeriesOptionBase {
  /** 系列名称 */
  name?: string
  /** 是否显示 */
  show?: boolean
  /** 颜色 */
  color?: string
  /** 系列索引（用于获取默认颜色） */
  seriesIndex?: number
  /** 不透明度 */
  opacity?: number
  /** 标签配置 */
  label?: {
    show?: boolean
    position?: 'top' | 'bottom' | 'left' | 'right' | 'inside' | 'outside'
    formatter?: string | ((params: unknown) => string)
    color?: string
    fontSize?: number
  }
  /** 高亮配置 */
  emphasis?: {
    disabled?: boolean
    scale?: boolean | number
    focus?: 'none' | 'self' | 'series'
  }
  /** 动画配置 */
  animation?: boolean | {
    enabled?: boolean
    duration?: number
    delay?: number
    easing?: string
  }
}

/**
 * 数据范围
 */
export interface DataExtent {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

/**
 * 渲染上下文
 */
export interface RenderContext {
  renderer: IRenderer
  animationProgress: number
  chartRect: { x: number; y: number; width: number; height: number }
  theme: Theme
  hoverIndex?: number
  selectedIndices?: number[]
}

// ============== 系列基类 ==============

/**
 * 系列基类
 */
export abstract class SeriesBase<T extends BaseSeriesOption = BaseSeriesOption>
  extends EventEmitter
  implements ISeriesInstance {

  /** 系列类型（子类必须定义静态属性 seriesType） */
  abstract readonly type: string

  /** 配置 */
  protected option: T

  /** 坐标系 */
  protected coordinate: ICoordinate | null = null

  /** X 比例尺 */
  protected xScale: IScale | null = null

  /** Y 比例尺 */
  protected yScale: IScale | null = null

  /** 主题 */
  protected theme: Theme | null = null

  /** 图表区域 */
  protected chartRect: { x: number; y: number; width: number; height: number }

  /** 图表尺寸 */
  protected chartWidth: number
  protected chartHeight: number

  /** 数据 */
  protected data: unknown[] = []

  /** 系列颜色 */
  protected seriesColor: string = '#6366f1'

  /** 是否已销毁 */
  protected disposed = false

  constructor(params: SeriesConstructorParams) {
    super()

    this.option = params.option as T
    this.data = params.option.data ?? []
    this.xScale = params.xScale ?? null
    this.yScale = params.yScale ?? null
    this.coordinate = params.coordinate ?? null
    this.theme = params.theme ?? null
    this.chartWidth = params.chartWidth
    this.chartHeight = params.chartHeight
    this.chartRect = params.chartRect

    // 计算系列颜色
    this.updateSeriesColor()
  }

  // ============== 抽象方法 ==============

  /**
   * 渲染系列（子类必须实现）
   */
  abstract render(renderer: IRenderer, animationProgress: number): void

  // ============== 公共方法 ==============

  /**
   * 更新配置
   */
  updateOption(option: Partial<T>): void {
    this.option = { ...this.option, ...option }
    if (option.data !== undefined) {
      this.data = option.data as unknown[]
    }
    this.updateSeriesColor()
  }

  /**
   * 更新比例尺
   */
  updateScales(xScale: IScale, yScale: IScale): void {
    this.xScale = xScale
    this.yScale = yScale
  }

  /**
   * 更新坐标系
   */
  updateCoordinate(coordinate: ICoordinate): void {
    this.coordinate = coordinate
  }

  /**
   * 更新图表区域
   */
  updateChartRect(rect: { x: number; y: number; width: number; height: number }): void {
    this.chartRect = rect
  }

  /**
   * 更新主题
   */
  updateTheme(theme: Theme): void {
    this.theme = theme
    this.updateSeriesColor()
  }

  /**
   * 获取数据范围
   */
  getDataExtent(): DataExtent {
    const extent: DataExtent = {
      xMin: Infinity,
      xMax: -Infinity,
      yMin: Infinity,
      yMax: -Infinity,
    }

    // 默认实现，子类可以覆盖
    this.data.forEach((item, index) => {
      if (typeof item === 'number') {
        extent.xMin = Math.min(extent.xMin, index)
        extent.xMax = Math.max(extent.xMax, index)
        extent.yMin = Math.min(extent.yMin, item)
        extent.yMax = Math.max(extent.yMax, item)
      }
    })

    // 处理边界情况
    if (!isFinite(extent.xMin)) extent.xMin = 0
    if (!isFinite(extent.xMax)) extent.xMax = 0
    if (!isFinite(extent.yMin)) extent.yMin = 0
    if (!isFinite(extent.yMax)) extent.yMax = 100

    return extent
  }

  /**
   * 获取配置
   */
  getOption(): T {
    return { ...this.option }
  }

  /**
   * 获取数据
   */
  getData(): unknown[] {
    return [...this.data]
  }

  /**
   * 设置数据
   */
  setData(data: unknown[]): void {
    this.data = data
    this.option.data = data
  }

  /**
   * 获取系列名称
   */
  getName(): string {
    return this.option.name ?? ''
  }

  /**
   * 获取系列颜色
   */
  getColor(): string {
    return this.seriesColor
  }

  /**
   * 处理交互事件
   */
  handleEvent(type: string, event: MouseEvent, point: { x: number; y: number }): void {
    // 默认空实现，子类可以覆盖
    this.emit(type, { event, point })
  }

  /**
   * 销毁
   */
  dispose(): void {
    if (this.disposed) return

    this.disposed = true
    this.removeAllListeners()
    this.data = []
    this.coordinate = null
    this.xScale = null
    this.yScale = null
  }

  // ============== 保护方法 ==============

  /**
   * 更新系列颜色
   */
  protected updateSeriesColor(): void {
    if (this.option.color) {
      this.seriesColor = this.option.color
    } else if (this.theme) {
      const index = this.option.seriesIndex ?? 0
      this.seriesColor = getSeriesColor(this.theme, index)
    }
  }

  /**
   * 数据坐标转屏幕坐标
   */
  protected dataToPoint(dataX: number, dataY: number): Point | null {
    if (!this.coordinate || !this.xScale || !this.yScale) {
      return null
    }

    const x = this.xScale.map(dataX)
    const y = this.yScale.map(dataY)
    return this.coordinate.dataToPoint([x, y])
  }

  /**
   * 获取数值（支持各种数据格式）
   */
  protected getNumericValue(value: unknown): number | null {
    if (value === null || value === undefined) return null
    if (typeof value === 'number') return value
    if (Array.isArray(value) && typeof value[1] === 'number') return value[1]
    if (typeof value === 'object' && 'value' in value) {
      return typeof (value as { value: unknown }).value === 'number'
        ? (value as { value: number }).value
        : null
    }
    return null
  }

  /**
   * 应用透明度
   */
  protected colorWithOpacity(color: string, opacity: number): string {
    if (opacity >= 1) return color
    if (opacity <= 0) return 'transparent'

    if (color.startsWith('rgba')) {
      return color.replace(/[\d.]+\)$/, `${opacity})`)
    }
    if (color.startsWith('rgb(')) {
      return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`)
    }
    if (color.startsWith('#')) {
      let hex = color.slice(1)
      if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('')
      }
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      return `rgba(${r}, ${g}, ${b}, ${opacity})`
    }
    return color
  }
}

/**
 * 创建可注册的系列类装饰器函数
 * 用于标记系列类型
 */
export function defineSeries<T extends BaseSeriesOption>(seriesType: string) {
  return function <C extends new (params: SeriesConstructorParams) => SeriesBase<T>>(
    constructor: C
  ): C & RegisterableSeries {
    return Object.assign(constructor, { seriesType }) as C & RegisterableSeries
  }
}
