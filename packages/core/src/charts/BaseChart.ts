/**
 * 图表基类 - 提供统一的渲染抽象层
 * 所有图表都应该继承此类，通过 IRenderer 接口进行绑图
 * 这样无论使用 Canvas 还是 SVG 渲染器，代码都只需写一次
 */

import type { IRenderer, GradientDef } from '../renderer/interface'
import { createRenderer } from '../renderer/createRenderer'
import type { AnimationConfig } from '../animation/chartAnimation'

// ============== 类型定义 ==============

export interface BaseChartOptions {
  width?: number
  height?: number
  theme?: 'light' | 'dark'
  renderer?: 'canvas' | 'svg'
  padding?: { top?: number; right?: number; bottom?: number; left?: number }
  animation?: boolean | AnimationConfig
}

export interface ChartRect {
  x: number
  y: number
  width: number
  height: number
}

// ============== 主题颜色 ==============

export const SERIES_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#3b82f6',
]

export function getThemeColors(theme: 'light' | 'dark' = 'dark') {
  const isDark = theme === 'dark'
  return {
    text: isDark ? '#e2e8f0' : '#1e293b',
    textSecondary: isDark ? '#94a3b8' : '#334155',
    grid: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(0, 0, 0, 0.06)',
    background: isDark ? '#1e293b' : '#ffffff',
    tooltipBg: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
  }
}

// ============== 缓动函数 ==============

export const Easings = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  easeOutQuint: (t: number) => 1 - Math.pow(1 - t, 5),
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  // 平滑步进 - 最适合图表动画，曲线非常平滑
  smoothStep: (t: number) => t * t * (3 - 2 * t),
  smootherStep: (t: number) => t * t * t * (t * (t * 6 - 15) + 10),
  easeOutElastic: (t: number) => {
    if (t === 0 || t === 1) return t
    const c4 = (2 * Math.PI) / 3
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  },
}

// ============== 基类 ==============

export abstract class BaseChart<T extends BaseChartOptions = BaseChartOptions> {
  protected container: HTMLElement
  protected renderer: IRenderer
  protected options: T
  protected chartRect: ChartRect
  protected disposed = false

  // 动画相关
  protected animationProgress = 1
  protected animationRafId: number | null = null
  protected animationStartTime = 0
  protected isUpdating = false

  constructor(container: string | HTMLElement, options: T) {
    // 获取容器
    const el = typeof container === 'string' ? document.querySelector(container) : container
    if (!el || !(el instanceof HTMLElement)) {
      throw new Error('Container not found')
    }
    this.container = el
    this.options = options

    // 初始化配置
    const width = options.width || this.container.clientWidth || 400
    const height = options.height || this.container.clientHeight || 280
    const padding = this.getPadding()

      // 设置尺寸
      ; (this.options as any).width = width
      ; (this.options as any).height = height

    // 计算绑图区域
    this.chartRect = {
      x: padding.left,
      y: padding.top,
      width: width - padding.left - padding.right,
      height: height - padding.top - padding.bottom,
    }

    // 创建渲染器
    this.container.innerHTML = ''
    const rendererType = options.renderer || 'canvas'
    this.renderer = createRenderer(rendererType)
    this.renderer.init(this.container, width, height)
  }

  // ============== 抽象方法（子类必须实现）==============

  /** 获取默认 padding */
  protected abstract getPadding(): { top: number; right: number; bottom: number; left: number }

  /** 执行实际的绑图逻辑 */
  protected abstract paint(): void

  // ============== 公共方法 ==============

  /** 渲染图表 */
  render(): void {
    if (this.disposed) return
    this.renderer.clear()
    this.paint()
  }

  /** 销毁图表 */
  dispose(): void {
    this.disposed = true
    if (this.animationRafId) {
      cancelAnimationFrame(this.animationRafId)
    }
    this.renderer.dispose()
  }

  /** 调整大小 */
  resize(width?: number, height?: number): void {
    const w = width || this.container.clientWidth
    const h = height || this.container.clientHeight
    const padding = this.getPadding()

      ; (this.options as any).width = w
      ; (this.options as any).height = h

    this.chartRect = {
      x: padding.left,
      y: padding.top,
      width: w - padding.left - padding.right,
      height: h - padding.top - padding.bottom,
    }

    this.renderer.resize(w, h)
    this.render()
  }

  // ============== 动画方法 ==============

  protected getAnimationConfig(): Required<AnimationConfig> {
    const anim = this.options.animation
    const defaults: Required<AnimationConfig> = {
      enabled: true,
      entryType: 'grow',
      updateType: 'morph',
      entryDuration: 600,     // 更短的动画时长，更流畅
      updateDuration: 300,
      entryDelay: 0,
      easing: 'easeOutCubic', // 使用更自然的缓动
      stagger: false,
      staggerDelay: 30,
    }

    if (typeof anim === 'boolean') {
      return { ...defaults, enabled: anim }
    }
    if (typeof anim === 'object') {
      return { ...defaults, ...anim }
    }
    return defaults
  }

  protected getEasing(name: string): (t: number) => number {
    return (Easings as any)[name] || Easings.easeOutQuart
  }

  protected startAnimation(onComplete?: () => void): void {
    const config = this.getAnimationConfig()
    if (!config.enabled) {
      this.animationProgress = 1
      this.render()
      onComplete?.()
      return
    }

    this.animationProgress = 0
    this.animationStartTime = performance.now()

    const animate = (currentTime: number) => {
      if (this.disposed) return

      const elapsed = currentTime - this.animationStartTime - config.entryDelay
      if (elapsed < 0) {
        this.animationRafId = requestAnimationFrame(animate)
        return
      }

      const rawProgress = Math.min(elapsed / config.entryDuration, 1)
      const easing = this.getEasing(config.easing)
      this.animationProgress = easing(rawProgress)

      this.render()

      if (rawProgress < 1) {
        this.animationRafId = requestAnimationFrame(animate)
      } else {
        this.animationProgress = 1
        this.animationRafId = null
        onComplete?.()
      }
    }

    this.animationRafId = requestAnimationFrame(animate)
  }

  // ============== 绘图辅助方法 ==============

  protected get colors() {
    return getThemeColors(this.options.theme)
  }

  protected get width(): number {
    return (this.options as any).width || 400
  }

  protected get height(): number {
    return (this.options as any).height || 280
  }

  /** 将颜色转换为带透明度的 rgba 格式 */
  protected colorWithOpacity(color: string, opacity: number): string {
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

  /** 格式化数字 */
  protected formatNumber(value: number): string {
    if (Math.abs(value) >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M'
    }
    if (Math.abs(value) >= 1000) {
      return (value / 1000).toFixed(1) + 'K'
    }
    return value % 1 === 0 ? String(value) : value.toFixed(1)
  }

  /** 创建线性渐变定义 */
  protected createLinearGradient(
    x1: number, y1: number, x2: number, y2: number,
    stops: Array<{ offset: number; color: string }>
  ): GradientDef {
    return { type: 'linear', x1, y1, x2, y2, stops }
  }

  /** 获取系列颜色 */
  protected getSeriesColor(index: number, customColor?: string): string {
    return customColor ?? SERIES_COLORS[index % SERIES_COLORS.length]!
  }

  // ============== 通用绑图方法 ==============

  /** 绘制背景 */
  protected drawBackground(): void {
    this.renderer.drawRect(
      { x: 0, y: 0, width: this.width, height: this.height },
      { fill: this.colors.background }
    )
  }

  /** 绘制网格线 */
  protected drawGrid(yTicks = 5): void {
    const { chartRect, colors, renderer } = this
    for (let i = 0; i <= yTicks; i++) {
      const y = chartRect.y + (i / yTicks) * chartRect.height
      renderer.drawLine(
        [{ x: chartRect.x, y }, { x: chartRect.x + chartRect.width, y }],
        { stroke: colors.grid, lineWidth: 1 }
      )
    }
  }

  /** 绘制 X 轴标签 */
  protected drawXAxisLabels(labels: string[]): void {
    const { chartRect, colors, renderer } = this
    const xStep = chartRect.width / Math.max(labels.length - 1, 1)

    labels.forEach((label, i) => {
      const x = chartRect.x + i * xStep
      const textAlign = i === 0 ? 'left' : i === labels.length - 1 ? 'right' : 'center'
      renderer.drawText(
        { x, y: chartRect.y + chartRect.height + 20, text: label },
        { fill: colors.textSecondary, fontSize: 11, textAlign: textAlign as 'left' | 'center' | 'right' }
      )
    })
  }

  /** 绘制 Y 轴标签 */
  protected drawYAxisLabels(min: number, max: number, ticks = 5): void {
    const { chartRect, colors, renderer } = this

    for (let i = 0; i <= ticks; i++) {
      const value = min + (max - min) * (1 - i / ticks)
      const y = chartRect.y + (i / ticks) * chartRect.height
      renderer.drawText(
        { x: chartRect.x - 8, y, text: this.formatNumber(value) },
        { fill: colors.textSecondary, fontSize: 11, textAlign: 'right', textBaseline: 'middle' }
      )
    }
  }
}
