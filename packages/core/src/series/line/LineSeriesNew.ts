/**
 * 折线图系列 - 使用新的 SeriesBase 架构
 * 支持注册系统，可按需加载
 */

import type { IRenderer, Point, LineStyle, GradientDef } from '../../renderer/interface'
import { SeriesBase, BaseSeriesOption, defineSeries } from '../SeriesBase'
import { getEasing } from '../../core/animation'

// ============== 类型定义 ==============

/**
 * 折线图配置
 */
export interface LineSeriesNewOption extends BaseSeriesOption {
  type: 'line'
  /** 数据数组 */
  data: (number | null)[]
  /** 是否平滑曲线 */
  smooth?: boolean | number
  /** 是否显示数据点 */
  showSymbol?: boolean
  /** 数据点符号 */
  symbol?: 'circle' | 'rect' | 'triangle' | 'diamond' | 'none'
  /** 数据点大小 */
  symbolSize?: number
  /** 是否连接空值 */
  connectNulls?: boolean
  /** 阶梯线类型 */
  step?: false | 'start' | 'middle' | 'end'
  /** 线条样式 */
  lineStyle?: {
    width?: number
    type?: 'solid' | 'dashed' | 'dotted'
    color?: string
    opacity?: number
  }
  /** 区域填充样式 */
  areaStyle?: {
    color?: string | GradientDef
    opacity?: number
  } | boolean
  /** 堆叠组名 */
  stack?: string
}

// ============== 常量 ==============

const DEFAULT_LINE_WIDTH = 2
const DEFAULT_SYMBOL_SIZE = 6

// ============== 折线图系列 ==============

/**
 * 折线图系列类
 */
@defineSeries<LineSeriesNewOption>('line')
export class LineSeriesNew extends SeriesBase<LineSeriesNewOption> {
  readonly type = 'line'

  // 静态属性用于注册
  static readonly seriesType = 'line'

  /**
   * 渲染折线图
   */
  render(renderer: IRenderer, animationProgress: number): void {
    if (!this.xScale || !this.yScale || !this.coordinate) {
      return
    }

    const points = this.calculatePoints()
    if (points.length < 2) return

    const { areaStyle, step } = this.option

    // 应用动画
    const animatedPoints = this.applyAnimation(points, animationProgress)

    // 绘制区域填充
    if (areaStyle) {
      this.renderArea(renderer, animatedPoints, animationProgress)
    }

    // 绘制线条
    this.renderLine(renderer, animatedPoints, step)

    // 绘制数据点
    if (this.option.showSymbol !== false) {
      this.renderSymbols(renderer, animatedPoints, animationProgress)
    }
  }

  // ============== 私有方法 ==============

  /**
   * 计算数据点坐标
   */
  private calculatePoints(): Array<{ x: number; y: number; value: number | null; index: number }> {
    const points: Array<{ x: number; y: number; value: number | null; index: number }> = []
    const data = this.option.data || []

    for (let i = 0; i < data.length; i++) {
      const value = data[i] ?? null

      if (value === null && !this.option.connectNulls) {
        points.push({ x: 0, y: 0, value: null, index: i })
        continue
      }

      const point = this.dataToPoint(i, value === null ? 0 : value)
      if (point) {
        points.push({ x: point.x, y: point.y, value, index: i })
      }
    }

    return points
  }

  /**
   * 应用动画
   */
  private applyAnimation(
    points: Array<{ x: number; y: number; value: number | null; index: number }>,
    progress: number
  ): Array<{ x: number; y: number; value: number | null; index: number }> {
    if (progress >= 1) return points

    const easing = getEasing('easeOutCubic')
    const easedProgress = easing(progress)

    // expand 动画：从左到右展开
    const visibleCount = Math.ceil(points.length * easedProgress)

    return points.slice(0, visibleCount).map((p, i) => {
      // 最后一个点做插值
      if (i === visibleCount - 1 && visibleCount < points.length) {
        const nextPoint = points[visibleCount]
        if (nextPoint && nextPoint.value !== null && p.value !== null) {
          const t = (points.length * easedProgress) % 1
          return {
            ...p,
            x: p.x + (nextPoint.x - p.x) * t,
            y: p.y + (nextPoint.y - p.y) * t,
          }
        }
      }
      return p
    })
  }

  /**
   * 渲染线条
   */
  private renderLine(
    renderer: IRenderer,
    points: Array<{ x: number; y: number; value: number | null; index: number }>,
    step?: false | 'start' | 'middle' | 'end'
  ): void {
    const validPoints = points.filter(p => p.value !== null)
    if (validPoints.length < 2) return

    const lineStyle = this.option.lineStyle || {}
    const style: LineStyle = {
      stroke: lineStyle.color || this.seriesColor,
      lineWidth: lineStyle.width ?? DEFAULT_LINE_WIDTH,
      lineCap: 'round',
      lineJoin: 'round',
      opacity: lineStyle.opacity ?? 1,
    }

    // 处理虚线
    if (lineStyle.type === 'dashed') {
      style.lineDash = [5, 5]
    } else if (lineStyle.type === 'dotted') {
      style.lineDash = [2, 2]
    }

    // 阶梯线处理
    if (step) {
      const stepPoints = this.convertToStepPoints(validPoints, step)
      renderer.drawLine(stepPoints, style, false)
    } else {
      // 普通线条
      const isSmooth = this.option.smooth === true ||
        (typeof this.option.smooth === 'number' && this.option.smooth > 0)
      renderer.drawLine(validPoints, style, isSmooth)
    }
  }

  /**
   * 渲染区域填充
   */
  private renderArea(
    renderer: IRenderer,
    points: Array<{ x: number; y: number; value: number | null; index: number }>,
    progress: number
  ): void {
    const validPoints = points.filter(p => p.value !== null)
    if (validPoints.length < 2) return

    const areaStyle = this.option.areaStyle
    if (!areaStyle) return

    // 获取基线 Y 坐标
    const baseY = this.chartRect.y + this.chartRect.height

    // 确定填充颜色
    let fill: string | GradientDef
    let opacity = 0.3

    if (typeof areaStyle === 'boolean') {
      fill = this.seriesColor
    } else {
      fill = areaStyle.color || this.seriesColor
      opacity = areaStyle.opacity ?? 0.3
    }

    // 应用动画透明度
    opacity *= progress

    const isSmooth = this.option.smooth === true ||
      (typeof this.option.smooth === 'number' && this.option.smooth > 0)

    // 注意：opacity 需要通过修改 fill 颜色来实现
    if (typeof fill === 'string') {
      fill = this.colorWithOpacity(fill, opacity)
    }
    renderer.drawArea(validPoints, baseY, fill, isSmooth)
  }

  /**
   * 渲染数据点符号
   */
  private renderSymbols(
    renderer: IRenderer,
    points: Array<{ x: number; y: number; value: number | null; index: number }>,
    progress: number
  ): void {
    const validPoints = points.filter(p => p.value !== null)
    const symbolSize = this.option.symbolSize ?? DEFAULT_SYMBOL_SIZE
    const symbol = this.option.symbol ?? 'circle'

    if (symbol === 'none') return

    for (const point of validPoints) {
      const size = symbolSize * Math.min(1, progress * 1.5)

      if (symbol === 'circle') {
        renderer.drawCircle(
          { x: point.x, y: point.y, radius: size / 2 },
          {
            fill: '#fff',
            stroke: this.seriesColor,
            lineWidth: 2,
            opacity: progress,
          }
        )
      } else if (symbol === 'rect') {
        renderer.drawRect(
          { x: point.x - size / 2, y: point.y - size / 2, width: size, height: size },
          {
            fill: '#fff',
            stroke: this.seriesColor,
            lineWidth: 2,
            opacity: progress,
          }
        )
      }
      // 其他符号类型可以继续添加
    }
  }

  /**
   * 转换为阶梯线点
   */
  private convertToStepPoints(
    points: Array<{ x: number; y: number }>,
    step: 'start' | 'middle' | 'end'
  ): Point[] {
    const result: Point[] = []

    for (let i = 0; i < points.length; i++) {
      const curr = points[i]!
      const prev = points[i - 1]

      if (i === 0) {
        result.push({ x: curr.x, y: curr.y })
        continue
      }

      if (step === 'start') {
        result.push({ x: curr.x, y: prev!.y })
        result.push({ x: curr.x, y: curr.y })
      } else if (step === 'middle') {
        const midX = (prev!.x + curr.x) / 2
        result.push({ x: midX, y: prev!.y })
        result.push({ x: midX, y: curr.y })
        result.push({ x: curr.x, y: curr.y })
      } else {
        result.push({ x: prev!.x, y: curr.y })
        result.push({ x: curr.x, y: curr.y })
      }
    }

    return result
  }
}

// 导出用于按需加载
export default LineSeriesNew
