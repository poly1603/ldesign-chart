/**
 * 折线图类 - 完整独立实现，可直接使用
 * 支持 Canvas 和 SVG 双模式渲染
 * 
 * @example
 * ```ts
 * const chart = new LineChart('#container', {
 *   renderer: 'svg', // 或 'canvas'（默认）
 *   xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
 *   series: [
 *     { name: 'Sales', data: [150, 230, 224, 218, 135] },
 *     { name: 'Profit', data: [80, 120, 160, 140, 180], smooth: true },
 *   ],
 * })
 * ```
 */

// 导入动画工具（可复用的动画模块）
import type { AnimationConfig } from '../animation/chartAnimation'
// 导入渲染器
import type { IRenderer } from '../renderer/interface'
import { createRenderer } from '../renderer/createRenderer'

// 重新导出动画类型供外部使用
export type { AnimationConfig, EntryAnimationType, UpdateAnimationType } from '../animation/chartAnimation'

// ============== 类型定义 ==============

export interface LineSeriesData {
  name?: string
  data: (number | null)[]
  color?: string
  smooth?: boolean
  step?: false | 'start' | 'middle' | 'end'
  areaStyle?: boolean | { opacity?: number; color?: string }
  lineStyle?: { width?: number; type?: 'solid' | 'dashed' | 'dotted'; color?: string }
  symbol?: 'circle' | 'rect' | 'triangle' | 'diamond' | 'none'
  symbolSize?: number
  showSymbol?: boolean
  stack?: string
  connectNulls?: boolean
}

export interface LineChartOptions {
  width?: number
  height?: number
  theme?: 'light' | 'dark'
  /** 渲染模式：canvas 或 svg */
  renderer?: 'canvas' | 'svg'
  padding?: { top?: number; right?: number; bottom?: number; left?: number }
  xAxis?: {
    data?: string[]
    name?: string
    show?: boolean
    /** 标签显示间隔，'auto' 自动计算，数字表示每隔几个显示 */
    interval?: number | 'auto'
    /** 标签旋转角度 */
    rotate?: number
    /** 标签格式化 */
    formatter?: (value: string, index: number) => string
  }
  yAxis?: { name?: string; min?: number | 'auto'; max?: number | 'auto'; show?: boolean }
  series?: LineSeriesData[]
  legend?: { show?: boolean; position?: 'top' | 'bottom' }
  tooltip?: { show?: boolean }
  grid?: { show?: boolean }
  /** 动画配置，true/false 或详细配置对象 */
  animation?: boolean | AnimationConfig
  /** 标记线配置 */
  markLine?: {
    data: Array<{ type: 'average' | 'min' | 'max' } | { yAxis: number; name?: string; color?: string }>
  }
}

// 系列颜色
const SERIES_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#3b82f6',
]

// ============== 工具函数 ==============

function getThemeColors(theme: 'light' | 'dark') {
  const isDark = theme === 'dark'
  return {
    text: isDark ? '#e2e8f0' : '#1e293b',           // legend 文字颜色 - 浅色模式用深色
    textSecondary: isDark ? '#94a3b8' : '#334155',  // 坐标轴文字颜色 - 浅色模式用更深的颜色
    grid: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(0, 0, 0, 0.06)',  // 网格线 - 浅色模式极淡
    background: isDark ? '#1e293b' : '#ffffff',
    tooltipBg: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
  }
}

// ============== LineChart 类 ==============

export class LineChart {
  private container: HTMLElement
  private renderer: IRenderer
  private options: Required<Pick<LineChartOptions, 'width' | 'height' | 'theme'>> & LineChartOptions
  private chartRect: { x: number; y: number; width: number; height: number }
  private hoverIndex = -1
  private enabledSeries: Set<string> = new Set()
  private tooltipEl: HTMLDivElement | null = null
  private disposed = false

  // 动画相关
  private animationProgress = 1
  private animationRafId: number | null = null
  private animationStartTime = 0
  private previousData: (number | null)[][] = []
  private updateAnimationProgress = 1
  private isUpdating = false

  /** 获取 Canvas 2D 上下文（兼容现有代码） */
  private get ctx(): CanvasRenderingContext2D {
    const ctx = this.renderer.getContext2D()
    if (!ctx) {
      throw new Error('Canvas context not available in SVG mode')
    }
    return ctx
  }

  /** 获取 canvas 元素 */
  private get canvas(): HTMLCanvasElement {
    const el = this.renderer.getElement()
    if (el instanceof HTMLCanvasElement) {
      return el
    }
    throw new Error('Canvas element not available in SVG mode')
  }

  constructor(container: string | HTMLElement, options: LineChartOptions = {}) {
    // 获取容器
    const el = typeof container === 'string' ? document.querySelector(container) : container
    if (!el || !(el instanceof HTMLElement)) {
      throw new Error('Container not found')
    }
    this.container = el

    // 合并默认配置
    const padding = {
      top: options.padding?.top ?? 40,
      right: options.padding?.right ?? 20,
      bottom: options.padding?.bottom ?? 40,
      left: options.padding?.left ?? 50,
    }

    const width = options.width || this.container.clientWidth || 400
    const height = options.height || this.container.clientHeight || 280

    // 自动检测当前主题（从 document 的 data-theme 属性）
    const detectedTheme = (typeof document !== 'undefined'
      ? document.documentElement.getAttribute('data-theme') as 'light' | 'dark'
      : null) || 'dark'

    this.options = {
      width,
      height,
      theme: options.theme || detectedTheme,
      animation: options.animation ?? true,
      padding,
      xAxis: options.xAxis || { data: [] },
      yAxis: options.yAxis || {},
      series: options.series || [],
      legend: options.legend ?? { show: true, position: 'top' },
      tooltip: options.tooltip ?? { show: true },
      grid: options.grid ?? { show: true },
    }

    // 启用所有系列
    this.enabledSeries = new Set(this.options.series?.map(s => s.name || '') || [])

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

    // 绑定事件
    this.bindEvents()

    // 保存初始数据用于动画
    this.previousData = (this.options.series || []).map(s => [...s.data])

    // 启动入场动画或直接渲染
    if (this.getAnimationConfig().enabled) {
      this.startEntryAnimation()
    } else {
      this.render()
    }
  }

  /**
   * 获取动画配置
   */
  private getAnimationConfig(): Required<AnimationConfig> {
    const anim = this.options.animation
    const defaults: Required<AnimationConfig> = {
      enabled: true,
      entryType: 'drawLine',  // 折线图默认：从左到右绘制
      updateType: 'morph',
      entryDuration: 1000,
      updateDuration: 400,
      entryDelay: 0,
      easing: 'easeOutQuart',
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

  /**
   * 缓动函数
   */
  private easeOutQuart(t: number): number {
    return 1 - Math.pow(1 - t, 4)
  }

  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3)
  }

  private easeOutElastic(t: number): number {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  }

  private easeOutBounce(t: number): number {
    const n1 = 7.5625, d1 = 2.75
    if (t < 1 / d1) return n1 * t * t
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
    return n1 * (t -= 2.625 / d1) * t + 0.984375
  }

  private getEasing(name: string): (t: number) => number {
    const easings: Record<string, (t: number) => number> = {
      linear: t => t,
      easeOutQuart: this.easeOutQuart,
      easeOutCubic: this.easeOutCubic,
      easeOutElastic: this.easeOutElastic,
      easeOutBounce: this.easeOutBounce,
    }
    return easings[name] || this.easeOutQuart
  }

  /**
   * 启动入场动画
   */
  private startEntryAnimation(): void {
    const config = this.getAnimationConfig()
    this.animationProgress = 0
    this.animationStartTime = performance.now()
    this.isUpdating = false

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
      }
    }

    this.animationRafId = requestAnimationFrame(animate)
  }

  /**
   * 启动更新动画
   */
  private startUpdateAnimation(oldData: (number | null)[][]): void {
    const config = this.getAnimationConfig()
    if (!config.enabled || config.updateType === 'none') {
      this.render()
      return
    }

    this.previousData = oldData
    this.updateAnimationProgress = 0
    this.animationStartTime = performance.now()
    this.isUpdating = true

    const animate = (currentTime: number) => {
      if (this.disposed) return

      const elapsed = currentTime - this.animationStartTime
      const rawProgress = Math.min(elapsed / config.updateDuration, 1)
      const easing = this.getEasing(config.easing)
      this.updateAnimationProgress = easing(rawProgress)

      this.render()

      if (rawProgress < 1) {
        this.animationRafId = requestAnimationFrame(animate)
      } else {
        this.updateAnimationProgress = 1
        this.isUpdating = false
        this.previousData = (this.options.series || []).map(s => [...s.data])
        this.animationRafId = null
      }
    }

    this.animationRafId = requestAnimationFrame(animate)
  }

  // ============== 公共方法 ==============

  /** 设置数据（带更新动画） */
  setData(series: LineSeriesData[]): void {
    const oldData = (this.options.series || []).map(s => [...s.data])
    this.options.series = series
    this.enabledSeries = new Set(series.map(s => s.name || ''))
    this.startUpdateAnimation(oldData)
  }

  /** 设置 X 轴数据 */
  setXAxisData(data: string[]): void {
    if (this.options.xAxis) {
      this.options.xAxis.data = data
    }
    this.render()
  }

  /** 更新配置 */
  setOption(options: Partial<LineChartOptions>): void {
    Object.assign(this.options, options)
    if (options.series) {
      this.enabledSeries = new Set(options.series.map(s => s.name || ''))
    }
    this.render()
  }

  /** 调整大小 */
  resize(width?: number, height?: number): void {
    width = width || this.container.clientWidth
    height = height || this.container.clientHeight

    this.options.width = width
    this.options.height = height

    const padding = this.options.padding!
    this.chartRect = {
      x: padding.left!,
      y: padding.top!,
      width: width - padding.left! - padding.right!,
      height: height - padding.top! - padding.bottom!,
    }

    this.renderer.resize(width, height)

    this.render()
  }

  /** 刷新（用于主题切换） */
  refresh(): void {
    this.render()
  }

  /** 设置主题 */
  setTheme(theme: 'light' | 'dark'): void {
    this.options.theme = theme
    this.render()
  }

  /** 销毁 */
  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    // 取消动画
    if (this.animationRafId !== null) {
      cancelAnimationFrame(this.animationRafId)
      this.animationRafId = null
    }
    this.hideTooltip()
    if (this.tooltipEl) {
      this.tooltipEl.remove()
      this.tooltipEl = null
    }
    this.renderer.dispose()
  }

  // ============== 私有方法 ==============

  private get colors() {
    return getThemeColors(this.options.theme)
  }

  private getSeriesColor(index: number, series: LineSeriesData): string {
    return series.color ?? series.lineStyle?.color ?? SERIES_COLORS[index % SERIES_COLORS.length]!
  }

  private getYRange(): { min: number; max: number } {
    const series = this.options.series || []
    const enabledData = series
      .filter(s => this.enabledSeries.has(s.name || ''))
      .flatMap(s => s.data.filter((v): v is number => v !== null))

    if (!enabledData.length) return { min: 0, max: 100 }

    let min = Math.min(...enabledData)
    let max = Math.max(...enabledData)

    // 添加边距
    const range = max - min || 1
    max = max + range * 0.1
    if (min > 0) min = 0
    else min = min - range * 0.1

    return { min, max }
  }

  private bindEvents(): void {
    const el = this.renderer.getElement()
    el.addEventListener('mousemove', this.onMouseMove.bind(this) as EventListener)
    el.addEventListener('mouseleave', this.onMouseLeave.bind(this) as EventListener)
    el.addEventListener('click', this.onClick.bind(this) as EventListener)
  }

  private getMousePos(e: MouseEvent): { x: number; y: number } {
    const el = this.renderer.getElement()
    const rect = el.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (this.options.width / rect.width),
      y: (e.clientY - rect.top) * (this.options.height / rect.height),
    }
  }

  private onMouseMove(e: MouseEvent): void {
    const pos = this.getMousePos(e)
    const labels = this.options.xAxis?.data || []
    const xStep = this.chartRect.width / Math.max(labels.length - 1, 1)
    const idx = Math.round((pos.x - this.chartRect.x) / xStep)

    if (idx >= 0 && idx < labels.length &&
      pos.x >= this.chartRect.x && pos.x <= this.chartRect.x + this.chartRect.width &&
      pos.y >= this.chartRect.y && pos.y <= this.chartRect.y + this.chartRect.height) {
      if (idx !== this.hoverIndex) {
        this.hoverIndex = idx
        this.render()
      }
      if (this.options.tooltip?.show !== false) {
        this.showTooltip(e.clientX, e.clientY, idx, labels[idx] || '')
      }
    } else {
      if (this.hoverIndex !== -1) {
        this.hoverIndex = -1
        this.render()
      }
      this.hideTooltip()
    }
  }

  private onMouseLeave(): void {
    this.hoverIndex = -1
    this.render()
    this.hideTooltip()
  }

  private onClick(e: MouseEvent): void {
    const pos = this.getMousePos(e)
    // 简单的图例点击检测
    if (pos.y < 30 && this.options.legend?.show !== false) {
      const series = this.options.series || []
      this.ctx.font = '12px Inter, sans-serif'
      let totalWidth = 0
      series.forEach((s, i) => {
        totalWidth += this.ctx.measureText(s.name || `系列${i + 1}`).width + 24 + (i < series.length - 1 ? 16 : 0)
      })

      let x = (this.options.width - totalWidth) / 2
      for (let i = 0; i < series.length; i++) {
        const s = series[i]!
        const name = s.name || `系列${i + 1}`
        const itemWidth = this.ctx.measureText(name).width + 24
        if (pos.x >= x && pos.x <= x + itemWidth) {
          if (this.enabledSeries.has(name)) {
            this.enabledSeries.delete(name)
          } else {
            this.enabledSeries.add(name)
          }
          this.render()
          return
        }
        x += itemWidth + 16
      }
    }
  }

  // ============== Tooltip ==============

  private showTooltip(x: number, y: number, idx: number, label: string): void {
    if (!this.tooltipEl) {
      this.tooltipEl = document.createElement('div')
      this.tooltipEl.className = 'lchart-tooltip'
      this.tooltipEl.style.cssText = `
        position: fixed; z-index: 9999; pointer-events: none;
        padding: 12px 16px; border-radius: 8px; font-size: 13px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2); transition: opacity 0.15s;
        font-family: Inter, -apple-system, sans-serif;
      `
      document.body.appendChild(this.tooltipEl)
    }

    const colors = this.colors
    this.tooltipEl.style.background = colors.tooltipBg
    this.tooltipEl.style.color = colors.text
    this.tooltipEl.style.border = `1px solid ${colors.grid}`

    const series = this.options.series || []
    const items = series
      .filter(s => this.enabledSeries.has(s.name || ''))
      .map((s, i) => {
        const color = this.getSeriesColor(i, s)
        const value = s.data[idx]
        const name = s.name || `系列${i + 1}`
        return `<div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
          <span style="width:8px;height:8px;border-radius:50%;background:${color}"></span>
          <span>${name}</span>
          <span style="margin-left:auto;font-weight:600">${value ?? '-'}</span>
        </div>`
      }).join('')

    this.tooltipEl.innerHTML = `<div style="font-weight:600;margin-bottom:4px">${label}</div>${items}`
    this.tooltipEl.style.opacity = '1'
    this.tooltipEl.style.left = `${Math.min(x + 12, window.innerWidth - 180)}px`
    this.tooltipEl.style.top = `${Math.min(y + 12, window.innerHeight - 150)}px`
  }

  private hideTooltip(): void {
    if (this.tooltipEl) {
      this.tooltipEl.style.opacity = '0'
    }
  }

  // ============== 渲染 ==============

  render(): void {
    const { options, renderer } = this

    // 清空画布
    renderer.clear()

    if (!options.series?.length) return

    // SVG 模式使用渲染器接口
    if (renderer.getType() === 'svg') {
      this.renderWithRenderer()
      return
    }

    // Canvas 模式使用原有逻辑
    const ctx = renderer.getContext2D()
    if (!ctx) return

    // 绘制图例
    if (options.legend?.show !== false) {
      this.drawLegend()
    }

    // 绘制网格
    if (options.grid?.show !== false) {
      this.drawGrid()
    }

    // 绘制坐标轴
    this.drawAxes()

    // 绘制悬停参考线
    if (this.hoverIndex >= 0) {
      this.drawHoverLine()
    }

    // 绘制数据
    this.drawSeries()

    // 绘制标记线
    if (options.markLine?.data?.length) {
      this.drawMarkLines()
    }
  }

  /** SVG 渲染模式 */
  private renderWithRenderer(): void {
    const { options, renderer, chartRect, colors } = this
    const series = options.series || []
    const labels = options.xAxis?.data || []
    const { min, max } = this.getYRange()

    // 绘制背景
    renderer.drawRect(
      { x: 0, y: 0, width: options.width, height: options.height },
      { fill: colors.background }
    )

    // 绘制网格
    if (options.grid?.show !== false) {
      const yTicks = 5
      for (let i = 0; i <= yTicks; i++) {
        const y = chartRect.y + (i / yTicks) * chartRect.height
        renderer.drawLine(
          [{ x: chartRect.x, y }, { x: chartRect.x + chartRect.width, y }],
          { stroke: colors.grid, lineWidth: 1 }
        )
      }
    }

    // 绘制 X 轴标签
    const xStep = chartRect.width / Math.max(labels.length - 1, 1)
    labels.forEach((label, i) => {
      const x = chartRect.x + i * xStep
      renderer.drawText(
        { x, y: chartRect.y + chartRect.height + 20, text: label },
        { fill: colors.textSecondary, fontSize: 11, textAlign: 'center' }
      )
    })

    // 绘制 Y 轴标签
    const yTicks = 5
    for (let i = 0; i <= yTicks; i++) {
      const value = min + (max - min) * (1 - i / yTicks)
      const y = chartRect.y + (i / yTicks) * chartRect.height
      renderer.drawText(
        { x: chartRect.x - 8, y, text: this.formatNumber(value) },
        { fill: colors.textSecondary, fontSize: 11, textAlign: 'right', textBaseline: 'middle' }
      )
    }

    // 绘制数据线
    series.forEach((s, seriesIndex) => {
      if (!this.enabledSeries.has(s.name || '')) return
      const color = this.getSeriesColor(seriesIndex, s)
      const points: Array<{ x: number; y: number }> = []

      s.data.forEach((value, i) => {
        if (value === null) return
        const x = chartRect.x + i * xStep
        const y = chartRect.y + chartRect.height - ((value - min) / (max - min)) * chartRect.height
        points.push({ x, y })
      })

      if (points.length < 2) return

      // 绘制面积
      if (s.areaStyle) {
        const opacity = typeof s.areaStyle === 'object' ? s.areaStyle.opacity ?? 0.3 : 0.3
        renderer.drawArea(
          points,
          chartRect.y + chartRect.height,
          {
            type: 'linear',
            x1: 0, y1: chartRect.y,
            x2: 0, y2: chartRect.y + chartRect.height,
            stops: [
              { offset: 0, color: color.replace(')', `, ${opacity})`.replace('rgb', 'rgba')) },
              { offset: 1, color: color.replace(')', ', 0.05)').replace('rgb', 'rgba') },
            ]
          },
          s.smooth
        )
      }

      // 绘制线条
      const lineDash = s.lineStyle?.type === 'dashed' ? [6, 4] : s.lineStyle?.type === 'dotted' ? [2, 2] : undefined
      renderer.drawLine(points, {
        stroke: color,
        lineWidth: s.lineStyle?.width ?? 2,
        lineDash,
      }, s.smooth)

      // 绘制数据点
      if (s.showSymbol !== false) {
        points.forEach((p) => {
          renderer.drawCircle(
            { x: p.x, y: p.y, radius: s.symbolSize ?? 4 },
            { fill: colors.background, stroke: color, lineWidth: 2 }
          )
        })
      }
    })

    // 绘制图例
    if (options.legend?.show !== false) {
      let legendX = options.width / 2 - (series.length * 80) / 2
      series.forEach((s, i) => {
        const color = this.getSeriesColor(i, s)
        const enabled = this.enabledSeries.has(s.name || '')
        renderer.drawRect(
          { x: legendX, y: 12, width: 16, height: 3 },
          { fill: enabled ? color : colors.textSecondary }
        )
        renderer.drawText(
          { x: legendX + 22, y: 15, text: s.name || `系列${i + 1}` },
          { fill: enabled ? colors.text : colors.textSecondary, fontSize: 12, textBaseline: 'middle' }
        )
        legendX += 80
      })
    }
  }

  private drawMarkLines(): void {
    const { ctx, chartRect, options } = this
    const { min, max } = this.getYRange()
    const series = options.series || []
    const markData = options.markLine?.data || []

    const allData = series
      .filter(s => this.enabledSeries.has(s.name || ''))
      .flatMap(s => s.data.filter((v): v is number => v !== null))
    if (!allData.length) return

    const avg = allData.reduce((a, b) => a + b, 0) / allData.length
    const minVal = Math.min(...allData)
    const maxVal = Math.max(...allData)

    markData.forEach(mark => {
      let yValue: number, label: string, color: string
      if ('type' in mark) {
        if (mark.type === 'average') { yValue = avg; label = `平均: ${this.formatNumber(avg)}`; color = '#f59e0b' }
        else if (mark.type === 'max') { yValue = maxVal; label = `最大: ${this.formatNumber(maxVal)}`; color = '#ef4444' }
        else { yValue = minVal; label = `最小: ${this.formatNumber(minVal)}`; color = '#10b981' }
      } else {
        yValue = mark.yAxis; label = mark.name || this.formatNumber(yValue); color = mark.color || '#ef4444'
      }

      const y = chartRect.y + chartRect.height - ((yValue - min) / (max - min)) * chartRect.height
      ctx.beginPath()
      ctx.moveTo(chartRect.x, y)
      ctx.lineTo(chartRect.x + chartRect.width, y)
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.setLineDash([6, 4])
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = color
      ctx.font = '10px Inter, sans-serif'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'bottom'
      ctx.fillText(label, chartRect.x + chartRect.width, y - 2)
    })
  }

  private drawLegend(): void {
    const { ctx, options } = this
    const colors = this.colors
    const series = options.series || []
    const fontSize = 12
    const dotSize = 8

    ctx.font = `${fontSize}px Inter, sans-serif`

    let totalWidth = 0
    series.forEach((s, i) => {
      const name = s.name || `系列${i + 1}`
      totalWidth += ctx.measureText(name).width + dotSize + 8 + (i < series.length - 1 ? 16 : 0)
    })

    let x = (options.width - totalWidth) / 2
    const y = 15

    series.forEach((s, i) => {
      const name = s.name || `系列${i + 1}`
      const isEnabled = this.enabledSeries.has(name)
      const color = this.getSeriesColor(i, s)

      ctx.beginPath()
      ctx.arc(x + dotSize / 2, y, dotSize / 2, 0, Math.PI * 2)
      ctx.fillStyle = isEnabled ? color : '#64748b'
      ctx.globalAlpha = isEnabled ? 1 : 0.4
      ctx.fill()

      ctx.fillStyle = colors.text
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(name, x + dotSize + 6, y)
      ctx.globalAlpha = 1

      x += ctx.measureText(name).width + dotSize + 8 + 16
    })
  }

  private drawGrid(): void {
    const { ctx, chartRect } = this
    const colors = this.colors
    const labels = this.options.xAxis?.data || []
    const xCount = Math.max(labels.length, 1)
    const yCount = 5

    ctx.strokeStyle = colors.grid
    ctx.lineWidth = 0.5  // 更细的网格线

    // 横线
    for (let i = 0; i <= yCount; i++) {
      const y = chartRect.y + (chartRect.height / yCount) * i
      ctx.beginPath()
      ctx.moveTo(chartRect.x, y)
      ctx.lineTo(chartRect.x + chartRect.width, y)
      ctx.stroke()
    }

    // 竖线 - 大数据量时减少竖线数量
    const maxVerticalLines = 10
    const verticalInterval = Math.max(1, Math.ceil(xCount / maxVerticalLines))
    const xStep = chartRect.width / Math.max(xCount - 1, 1)
    for (let i = 0; i < xCount; i += verticalInterval) {
      const x = chartRect.x + xStep * i
      ctx.beginPath()
      ctx.moveTo(x, chartRect.y)
      ctx.lineTo(x, chartRect.y + chartRect.height)
      ctx.stroke()
    }
  }

  private drawAxes(): void {
    const { ctx, chartRect, options } = this
    const colors = this.colors
    const { min, max } = this.getYRange()
    const labels = options.xAxis?.data || []

    ctx.fillStyle = colors.textSecondary
    ctx.font = '11px Inter, sans-serif'

    // X 轴标签 - 自动采样
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const xStep = chartRect.width / Math.max(labels.length - 1, 1)

    // 计算标签间隔
    const configInterval = options.xAxis?.interval
    let labelInterval: number
    if (configInterval === 'auto' || configInterval === undefined) {
      const maxLabels = Math.floor(chartRect.width / 50)
      labelInterval = Math.max(1, Math.ceil(labels.length / maxLabels))
    } else {
      labelInterval = configInterval
    }

    const rotate = options.xAxis?.rotate ?? 0
    const formatter = options.xAxis?.formatter

    labels.forEach((label, i) => {
      if (i % labelInterval !== 0 && i !== labels.length - 1) return

      const x = chartRect.x + xStep * i
      const y = chartRect.y + chartRect.height + 8
      const displayLabel = formatter ? formatter(label, i) : label

      if (rotate !== 0) {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate((rotate * Math.PI) / 180)
        ctx.textAlign = rotate > 0 ? 'left' : 'right'
        ctx.fillText(displayLabel, 0, 0)
        ctx.restore()
      } else {
        ctx.fillText(displayLabel, x, y)
      }
    })

    // Y 轴标签
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    const yCount = 5
    for (let i = 0; i <= yCount; i++) {
      const value = min + (max - min) * (i / yCount)
      const y = chartRect.y + chartRect.height - (chartRect.height / yCount) * i
      ctx.fillText(this.formatNumber(value), chartRect.x - 8, y)
    }
  }

  private formatNumber(num: number): string {
    if (Math.abs(num) >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (Math.abs(num) >= 1000) return (num / 1000).toFixed(1) + 'K'
    if (Number.isInteger(num)) return String(num)
    return num.toFixed(1)
  }

  private drawHoverLine(): void {
    const { ctx, chartRect, options } = this
    const colors = this.colors
    const labels = options.xAxis?.data || []
    const xStep = chartRect.width / Math.max(labels.length - 1, 1)
    const x = chartRect.x + xStep * this.hoverIndex

    ctx.beginPath()
    ctx.moveTo(x, chartRect.y)
    ctx.lineTo(x, chartRect.y + chartRect.height)
    ctx.strokeStyle = colors.grid
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.stroke()
    ctx.setLineDash([])
  }

  private drawSeries(): void {
    const { chartRect, options } = this
    const { min, max } = this.getYRange()
    const labels = options.xAxis?.data || []
    const xStep = chartRect.width / Math.max(labels.length - 1, 1)
    const series = options.series || []

    series.forEach((s, si) => {
      if (!this.enabledSeries.has(s.name || '')) return

      const color = this.getSeriesColor(si, s)
      const lineWidth = s.lineStyle?.width ?? 2
      const showSymbol = s.showSymbol !== false
      const symbolSize = s.symbolSize ?? 4

      // 计算点坐标
      const baseY = chartRect.y + chartRect.height
      const config = this.getAnimationConfig()
      const points: { x: number; y: number; value: number | null }[] = s.data.map((v, i) => {
        const targetY = v !== null ? chartRect.y + chartRect.height - ((v - min) / (max - min)) * chartRect.height : NaN
        let y = targetY

        // 入场动画效果
        if (this.animationProgress < 1 && !this.isUpdating && v !== null) {
          switch (config.entryType) {
            case 'grow':
              // 从底部生长
              y = baseY - (baseY - targetY) * this.animationProgress
              break
            case 'drawLine':
              // 从左到右绘制 - 在 drawLine 方法中处理
              break
            case 'fadeIn':
              // 淡入 - 在绘制时通过 opacity 处理
              break
            default:
              break
          }
        }

        // 更新动画：从旧值过渡到新值
        if (this.isUpdating && v !== null) {
          const oldValue = this.previousData[si]?.[i] ?? v
          const oldY = oldValue !== null ? chartRect.y + chartRect.height - ((oldValue - min) / (max - min)) * chartRect.height : targetY
          y = oldY + (targetY - oldY) * this.updateAnimationProgress
        }

        return { x: chartRect.x + xStep * i, y, value: v }
      })

      // 计算动画裁剪进度（用于 drawLine 动画）
      const clipProgress = config.entryType === 'drawLine' && this.animationProgress < 1 && !this.isUpdating
        ? this.animationProgress
        : 1

      // 绘制面积
      if (s.areaStyle) {
        this.drawArea(points, color, s, clipProgress)
      }

      // 绘制线条
      this.drawLineWithClip(points, color, lineWidth, s, clipProgress)

      // 绘制数据点
      if (showSymbol) {
        this.drawSymbols(points, color, s.symbol || 'circle', symbolSize, clipProgress)
      }
    })
  }

  private drawLineWithClip(points: { x: number; y: number; value: number | null }[], color: string, lineWidth: number, series: LineSeriesData, clipProgress: number = 1): void {
    const { ctx, chartRect } = this

    // 设置裁剪区域实现从左到右绘制动画
    if (clipProgress < 1) {
      ctx.save()
      ctx.beginPath()
      ctx.rect(chartRect.x, chartRect.y, chartRect.width * clipProgress, chartRect.height)
      ctx.clip()
    }

    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const lineStyle = series.lineStyle?.type || 'solid'
    ctx.setLineDash(lineStyle === 'dashed' ? [8, 4] : lineStyle === 'dotted' ? [2, 4] : [])

    ctx.beginPath()
    let started = false

    for (let i = 0; i < points.length; i++) {
      const p = points[i]!
      if (p.value === null) {
        if (!series.connectNulls) started = false
        continue
      }

      if (!started) {
        ctx.moveTo(p.x, p.y)
        started = true
        continue
      }

      if (series.smooth) {
        // 平滑曲线
        this.drawSmoothSegment(points, i)
      } else if (series.step) {
        // 阶梯线
        const prev = points[i - 1]!
        if (series.step === 'start') {
          ctx.lineTo(p.x, prev.y)
          ctx.lineTo(p.x, p.y)
        } else if (series.step === 'end') {
          ctx.lineTo(prev.x, p.y)
          ctx.lineTo(p.x, p.y)
        } else {
          const midX = (prev.x + p.x) / 2
          ctx.lineTo(midX, prev.y)
          ctx.lineTo(midX, p.y)
          ctx.lineTo(p.x, p.y)
        }
      } else {
        ctx.lineTo(p.x, p.y)
      }
    }

    ctx.stroke()
    ctx.setLineDash([])

    if (clipProgress < 1) {
      ctx.restore()
    }
  }

  private drawSmoothSegment(points: { x: number; y: number }[], i: number): void {
    const { ctx } = this
    const tension = 0.3

    const p0 = points[Math.max(0, i - 2)]!
    const p1 = points[i - 1]!
    const p2 = points[i]!
    const p3 = points[Math.min(points.length - 1, i + 1)]!

    if (!p1 || !p2 || isNaN(p1.y) || isNaN(p2.y)) return

    const cp1x = p1.x + (p2.x - p0.x) * tension
    const cp1y = p1.y + (p2.y - p0.y) * tension
    const cp2x = p2.x - (p3.x - p1.x) * tension
    const cp2y = p2.y - (p3.y - p1.y) * tension

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y)
  }

  private drawArea(points: { x: number; y: number; value: number | null }[], color: string, series: LineSeriesData, clipProgress: number = 1): void {
    const { ctx, chartRect } = this
    const baseY = chartRect.y + chartRect.height

    // 设置裁剪区域实现从左到右动画
    if (clipProgress < 1) {
      ctx.save()
      ctx.beginPath()
      ctx.rect(chartRect.x, chartRect.y, chartRect.width * clipProgress, chartRect.height)
      ctx.clip()
    }

    // 解析颜色并创建更柔和的渐变
    const opacity = typeof series.areaStyle === 'object' ? (series.areaStyle.opacity ?? 0.25) : 0.25
    const rgb = this.hexToRgb(color)

    const gradient = ctx.createLinearGradient(0, chartRect.y, 0, baseY)
    gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`)
    gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity * 0.5})`)
    gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`)

    ctx.fillStyle = gradient
    ctx.globalAlpha = 1
    ctx.beginPath()

    let started = false
    let lastValidX = 0

    for (let i = 0; i < points.length; i++) {
      const p = points[i]!
      if (p.value === null) continue

      if (!started) {
        ctx.moveTo(p.x, baseY)
        ctx.lineTo(p.x, p.y)
        started = true
      } else {
        if (series.smooth) {
          this.drawSmoothSegment(points, i)
        } else {
          ctx.lineTo(p.x, p.y)
        }
      }
      lastValidX = p.x
    }

    ctx.lineTo(lastValidX, baseY)
    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = 1

    if (clipProgress < 1) {
      ctx.restore()
    }
  }

  private drawSymbols(points: { x: number; y: number; value: number | null }[], color: string, symbol: string, size: number, clipProgress: number = 1): void {
    if (symbol === 'none') return

    const { ctx, chartRect } = this
    const clipX = chartRect.x + chartRect.width * clipProgress

    points.forEach((p, i) => {
      if (p.value === null) return
      // 裁剪动画：只绘制在裁剪区域内的点
      if (clipProgress < 1 && p.x > clipX) return

      const isHover = i === this.hoverIndex
      const r = isHover ? size + 2 : size

      ctx.fillStyle = color
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2

      ctx.beginPath()
      switch (symbol) {
        case 'rect':
          ctx.rect(p.x - r, p.y - r, r * 2, r * 2)
          break
        case 'diamond':
          ctx.moveTo(p.x, p.y - r)
          ctx.lineTo(p.x + r, p.y)
          ctx.lineTo(p.x, p.y + r)
          ctx.lineTo(p.x - r, p.y)
          ctx.closePath()
          break
        case 'triangle':
          ctx.moveTo(p.x, p.y - r)
          ctx.lineTo(p.x + r, p.y + r)
          ctx.lineTo(p.x - r, p.y + r)
          ctx.closePath()
          break
        default: // circle
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      }
      ctx.fill()
      if (isHover) ctx.stroke()
    })
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1]!, 16),
      g: parseInt(result[2]!, 16),
      b: parseInt(result[3]!, 16)
    } : { r: 99, g: 102, b: 241 }  // fallback to primary color
  }
}
