/**
 * 柱状图系列 - 使用新的 SeriesBase 架构
 * 支持注册系统，可按需加载
 */

import type { IRenderer } from '../../renderer/interface'
import { SeriesBase, BaseSeriesOption, defineSeries } from '../SeriesBase'
import { getEasing } from '../../core/animation'

// ============== 类型定义 ==============

/**
 * 柱状图配置
 */
export interface BarSeriesNewOption extends BaseSeriesOption {
  type: 'bar'
  /** 数据数组 */
  data: (number | null)[]
  /** 柱子宽度 */
  barWidth?: number | string
  /** 柱子最大宽度 */
  barMaxWidth?: number
  /** 柱子最小宽度 */
  barMinWidth?: number
  /** 柱子间距比例 */
  barGap?: number | string
  /** 类目间距比例 */
  barCategoryGap?: number | string
  /** 圆角半径 */
  borderRadius?: number | [number, number, number, number]
  /** 堆叠组名 */
  stack?: string
  /** 是否横向 */
  horizontal?: boolean
  /** 背景柱 */
  showBackground?: boolean
  /** 背景样式 */
  backgroundStyle?: {
    color?: string
    opacity?: number
  }
  /** 系列在组中的索引 */
  barSeriesIndex?: number
  /** 组内总系列数 */
  barSeriesCount?: number
}

// ============== 常量 ==============

const DEFAULT_BAR_GAP = 0.2
const DEFAULT_BORDER_RADIUS = 4

// ============== 柱状图系列 ==============

/**
 * 柱状图系列类
 */
@defineSeries<BarSeriesNewOption>('bar')
export class BarSeriesNew extends SeriesBase<BarSeriesNewOption> {
  readonly type = 'bar'

  static readonly seriesType = 'bar'

  /**
   * 渲染柱状图
   */
  render(renderer: IRenderer, animationProgress: number): void {
    if (!this.xScale || !this.yScale || !this.coordinate) {
      return
    }

    const bars = this.calculateBars()

    for (const bar of bars) {
      if (bar.value === null) continue

      // 绘制背景
      if (this.option.showBackground) {
        this.renderBackground(renderer, bar)
      }

      // 绘制柱子
      this.renderBar(renderer, bar, animationProgress)

      // 绘制标签
      if (this.option.label?.show) {
        this.renderLabel(renderer, bar, animationProgress)
      }
    }
  }

  // ============== 私有方法 ==============

  /**
   * 计算柱子位置和尺寸
   */
  private calculateBars(): Array<{
    x: number
    y: number
    width: number
    height: number
    value: number | null
    index: number
    targetY: number
    targetHeight: number
  }> {
    const bars: Array<{
      x: number
      y: number
      width: number
      height: number
      value: number | null
      index: number
      targetY: number
      targetHeight: number
    }> = []

    const data = this.option.data || []
    if (data.length === 0) return bars

    const { horizontal } = this.option
    const barWidth = this.calculateBarWidth(data.length)
    const barSeriesIndex = this.option.barSeriesIndex ?? 0
    const barSeriesCount = this.option.barSeriesCount ?? 1

    // 计算每个柱子在组内的偏移
    const groupWidth = barWidth * barSeriesCount
    const barOffset = barSeriesIndex * barWidth - groupWidth / 2 + barWidth / 2

    for (let i = 0; i < data.length; i++) {
      const value = data[i]
      if (value === null) {
        bars.push({
          x: 0, y: 0, width: 0, height: 0,
          value: null, index: i, targetY: 0, targetHeight: 0,
        })
        continue
      }

      // 获取数据点和基线的屏幕坐标
      const dataPoint = this.dataToPoint(i, value ?? 0)
      const basePoint = this.dataToPoint(i, 0)

      if (!dataPoint || !basePoint) continue

      if (horizontal) {
        // 横向柱状图
        const x = Math.min(dataPoint.x, basePoint.x)
        const targetWidth = Math.abs(dataPoint.x - basePoint.x)
        const y = dataPoint.y - barWidth / 2 + barOffset

        bars.push({
          x,
          y,
          width: targetWidth,
          height: barWidth,
          value: value ?? null,
          index: i,
          targetY: y,
          targetHeight: barWidth,
        })
      } else {
        // 纵向柱状图
        const y = Math.min(dataPoint.y, basePoint.y)
        const targetHeight = Math.abs(dataPoint.y - basePoint.y)
        const x = dataPoint.x - barWidth / 2 + barOffset

        bars.push({
          x,
          y,
          width: barWidth,
          height: targetHeight,
          value: value ?? null,
          index: i,
          targetY: y,
          targetHeight,
        })
      }
    }

    return bars
  }

  /**
   * 计算柱子宽度
   */
  private calculateBarWidth(dataLength: number): number {
    if (typeof this.option.barWidth === 'number') {
      return this.option.barWidth
    }

    const { horizontal } = this.option
    const totalSize = horizontal ? this.chartRect.height : this.chartRect.width
    const categoryWidth = totalSize / Math.max(dataLength, 1)

    // 默认占类目宽度的 60%
    const gap = typeof this.option.barGap === 'number'
      ? this.option.barGap
      : DEFAULT_BAR_GAP

    let width = categoryWidth * (1 - gap)

    // 应用最大/最小宽度限制
    if (this.option.barMaxWidth && width > this.option.barMaxWidth) {
      width = this.option.barMaxWidth
    }
    if (this.option.barMinWidth && width < this.option.barMinWidth) {
      width = this.option.barMinWidth
    }

    return width
  }

  /**
   * 渲染单个柱子
   */
  private renderBar(
    renderer: IRenderer,
    bar: { x: number; y: number; width: number; height: number; value: number | null },
    progress: number
  ): void {
    if (bar.value === null) return

    const { horizontal } = this.option
    const easing = getEasing('easeOutCubic')
    const easedProgress = easing(progress)

    // 计算动画后的尺寸
    let animatedHeight = bar.height
    let animatedWidth = bar.width
    let animatedY = bar.y
    let animatedX = bar.x

    if (horizontal) {
      animatedWidth = bar.width * easedProgress
      if (bar.value! < 0) {
        animatedX = bar.x + bar.width - animatedWidth
      }
    } else {
      animatedHeight = bar.height * easedProgress
      if (bar.value! >= 0) {
        animatedY = bar.y + bar.height - animatedHeight
      }
    }

    // 处理圆角
    const borderRadius = this.getBorderRadius(bar.value!)

    renderer.drawRect(
      { x: animatedX, y: animatedY, width: animatedWidth, height: animatedHeight },
      {
        fill: this.seriesColor,
        opacity: 0.9,
        radius: borderRadius,
      }
    )
  }

  /**
   * 渲染背景
   */
  private renderBackground(
    renderer: IRenderer,
    bar: { x: number; y: number; width: number; height: number }
  ): void {
    const bgStyle = this.option.backgroundStyle || {}
    const bgColor = bgStyle.color || '#f5f5f5'
    const bgOpacity = bgStyle.opacity ?? 0.3

    renderer.drawRect(
      { x: bar.x, y: this.chartRect.y, width: bar.width, height: this.chartRect.height },
      {
        fill: bgColor,
        opacity: bgOpacity,
      }
    )
  }

  /**
   * 渲染标签
   */
  private renderLabel(
    renderer: IRenderer,
    bar: { x: number; y: number; width: number; height: number; value: number | null },
    progress: number
  ): void {
    if (bar.value === null || progress < 0.5) return

    const label = this.option.label!
    const text = typeof label.formatter === 'function'
      ? label.formatter({ value: bar.value })
      : String(bar.value)

    const x = bar.x + bar.width / 2
    let y = bar.y - 5
    let textBaseline: 'top' | 'middle' | 'bottom' = 'bottom'

    if (label.position === 'inside') {
      y = bar.y + bar.height / 2
      textBaseline = 'middle'
    } else if (label.position === 'bottom') {
      y = bar.y + bar.height + 15
      textBaseline = 'top'
    }

    renderer.drawText(
      { x, y, text },
      {
        fill: label.color || '#333',
        fontSize: label.fontSize || 12,
        textAlign: 'center',
        textBaseline,
        opacity: (progress - 0.5) * 2,
      }
    )
  }

  /**
   * 获取圆角半径
   */
  private getBorderRadius(value: number): number {
    const radius = this.option.borderRadius ?? DEFAULT_BORDER_RADIUS

    if (typeof radius === 'number') {
      // 正值顶部圆角，负值底部圆角
      return value >= 0 ? radius : 0
    }

    // 数组格式的圆角暂时取第一个值
    return radius[0] ?? 0
  }
}

// 导出用于按需加载
export default BarSeriesNew
