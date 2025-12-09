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
      entryDuration: 800,     // 缩短动画时长，更流畅
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

  /** 平滑步进 - 最适合图表绘制动画 */
  private smoothStep(t: number): number {
    return t * t * (3 - 2 * t)
  }

  /** 更平滑的步进 */
  private smootherStep(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  private getEasing(name: string): (t: number) => number {
    const easings: Record<string, (t: number) => number> = {
      linear: t => t,
      easeOutQuart: this.easeOutQuart,
      easeOutCubic: this.easeOutCubic,
      easeOutElastic: this.easeOutElastic,
      easeOutBounce: this.easeOutBounce,
      smoothStep: this.smoothStep,
      smootherStep: this.smootherStep,
      easeInOutCubic: this.easeInOutCubic,
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

  /**
   * 将颜色转换为带透明度的 rgba 格式
   */
  private colorWithOpacity(color: string, opacity: number): string {
    // 如果已经是 rgba 格式
    if (color.startsWith('rgba')) {
      return color.replace(/[\d.]+\)$/, `${opacity})`)
    }

    // 如果是 rgb 格式
    if (color.startsWith('rgb(')) {
      return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`)
    }

    // 如果是 hex 格式
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

    // 其他情况，尝试使用 CSS 颜色
    return color
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
      let totalWidth = 0
      series.forEach((s, i) => {
        totalWidth += this.renderer.measureText(s.name || `系列${i + 1}`, 12) + 24 + (i < series.length - 1 ? 16 : 0)
      })

      let x = (this.options.width - totalWidth) / 2
      for (let i = 0; i < series.length; i++) {
        const s = series[i]!
        const name = s.name || `系列${i + 1}`
        const itemWidth = this.renderer.measureText(name, 12) + 24
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

    // 统一使用渲染器接口进行渲染
    this.renderWithRenderer()
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
      // 第一个标签左对齐，最后一个标签右对齐，中间标签居中对齐
      const textAlign = i === 0 ? 'left' : i === labels.length - 1 ? 'right' : 'center'
      renderer.drawText(
        { x, y: chartRect.y + chartRect.height + 20, text: label },
        { fill: colors.textSecondary, fontSize: 11, textAlign: textAlign as 'left' | 'center' | 'right' }
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

    // 获取动画配置和进度
    const config = this.getAnimationConfig()
    const animProgress = this.animationProgress
    const baseY = chartRect.y + chartRect.height

    // 绘制数据线
    series.forEach((s, seriesIndex) => {
      if (!this.enabledSeries.has(s.name || '')) return
      const color = this.getSeriesColor(seriesIndex, s)
      const points: Array<{ x: number; y: number }> = []

      s.data.forEach((value, i) => {
        if (value === null) return
        const x = chartRect.x + i * xStep
        let targetY = chartRect.y + chartRect.height - ((value - min) / (max - min)) * chartRect.height

        // 应用动画效果 - grow 动画
        if (animProgress < 1 && !this.isUpdating && config.entryType === 'grow') {
          targetY = baseY - (baseY - targetY) * animProgress
        }

        points.push({ x, y: targetY })
      })

      if (points.length < 2) return

      // 计算动画裁剪进度（用于 drawLine 动画）
      const isDrawLineAnim = config.entryType === 'drawLine' && animProgress < 1 && !this.isUpdating

      // 如果是 drawLine 动画，使用插值计算可见点
      let visiblePoints = points
      if (isDrawLineAnim && points.length > 1) {
        const totalLength = points.length - 1
        const visibleLength = totalLength * animProgress
        const fullPointCount = Math.floor(visibleLength)
        const partialProgress = visibleLength - fullPointCount

        // 包含完整的点
        visiblePoints = points.slice(0, fullPointCount + 1)

        // 如果有部分进度，添加插值点实现平滑过渡
        if (partialProgress > 0 && fullPointCount < totalLength) {
          const p1 = points[fullPointCount]!
          const p2 = points[fullPointCount + 1]!
          visiblePoints.push({
            x: p1.x + (p2.x - p1.x) * partialProgress,
            y: p1.y + (p2.y - p1.y) * partialProgress,
          })
        }
      }

      // 绘制面积 - 使用正确的颜色格式
      if (s.areaStyle) {
        const opacity = typeof s.areaStyle === 'object' ? s.areaStyle.opacity ?? 0.3 : 0.3
        renderer.drawArea(
          visiblePoints,
          chartRect.y + chartRect.height,
          {
            type: 'linear',
            x1: 0, y1: chartRect.y,
            x2: 0, y2: chartRect.y + chartRect.height,
            stops: [
              { offset: 0, color: this.colorWithOpacity(color, opacity) },
              { offset: 1, color: this.colorWithOpacity(color, 0.05) },
            ]
          },
          s.smooth
        )
      }

      // 绘制线条
      const lineDash = s.lineStyle?.type === 'dashed' ? [6, 4] : s.lineStyle?.type === 'dotted' ? [2, 2] : undefined
      renderer.drawLine(visiblePoints, {
        stroke: color,
        lineWidth: s.lineStyle?.width ?? 2,
        lineDash,
      }, s.smooth)

      // 绘制数据点 - 使用填充圆点，与 Canvas 模式一致
      if (s.showSymbol !== false) {
        visiblePoints.forEach((p) => {
          renderer.drawCircle(
            { x: p.x, y: p.y, radius: s.symbolSize ?? 4 },
            { fill: color, stroke: color, lineWidth: 0 }
          )
        })
      }
    })

    // 绘制悬停参考线
    if (this.hoverIndex >= 0) {
      const hoverX = chartRect.x + xStep * this.hoverIndex
      renderer.drawLine(
        [{ x: hoverX, y: chartRect.y }, { x: hoverX, y: chartRect.y + chartRect.height }],
        { stroke: colors.grid, lineWidth: 1, lineDash: [4, 4] }
      )
    }

    // 绘制标记线
    if (options.markLine?.data?.length) {
      const allData = series
        .filter(s => this.enabledSeries.has(s.name || ''))
        .flatMap(s => s.data.filter((v): v is number => v !== null))

      if (allData.length) {
        const avg = allData.reduce((a, b) => a + b, 0) / allData.length
        const minVal = Math.min(...allData)
        const maxVal = Math.max(...allData)

        options.markLine.data.forEach(mark => {
          let yValue: number, label: string, markColor: string
          if ('type' in mark) {
            if (mark.type === 'average') { yValue = avg; label = `平均: ${this.formatNumber(avg)}`; markColor = '#f59e0b' }
            else if (mark.type === 'max') { yValue = maxVal; label = `最大: ${this.formatNumber(maxVal)}`; markColor = '#ef4444' }
            else { yValue = minVal; label = `最小: ${this.formatNumber(minVal)}`; markColor = '#10b981' }
          } else {
            yValue = mark.yAxis; label = mark.name || this.formatNumber(yValue); markColor = mark.color || '#ef4444'
          }

          const markY = chartRect.y + chartRect.height - ((yValue - min) / (max - min)) * chartRect.height
          renderer.drawLine(
            [{ x: chartRect.x, y: markY }, { x: chartRect.x + chartRect.width, y: markY }],
            { stroke: markColor, lineWidth: 1, lineDash: [6, 4] }
          )
          renderer.drawText(
            { x: chartRect.x + chartRect.width, y: markY - 2, text: label },
            { fill: markColor, fontSize: 10, textAlign: 'right', textBaseline: 'bottom' }
          )
        })
      }
    }

    // 绘制图例 - 使用圆形图例
    if (options.legend?.show !== false) {
      const dotSize = 8
      // 计算图例总宽度
      let totalWidth = 0
      series.forEach((s, i) => {
        const name = s.name || `系列${i + 1}`
        const textWidth = renderer.measureText(name, 12)
        totalWidth += textWidth + dotSize + 8 + (i < series.length - 1 ? 16 : 0)
      })

      let legendX = (options.width - totalWidth) / 2
      const legendY = 15

      series.forEach((s, i) => {
        const color = this.getSeriesColor(i, s)
        const enabled = this.enabledSeries.has(s.name || '')
        const name = s.name || `系列${i + 1}`

        // 绘制圆形图例
        renderer.drawCircle(
          { x: legendX + dotSize / 2, y: legendY, radius: dotSize / 2 },
          { fill: enabled ? color : colors.textSecondary, opacity: enabled ? 1 : 0.4 }
        )

        // 绘制图例文本
        renderer.drawText(
          { x: legendX + dotSize + 6, y: legendY, text: name },
          { fill: enabled ? colors.text : colors.textSecondary, fontSize: 12, textBaseline: 'middle', textAlign: 'left' }
        )

        const textWidth = renderer.measureText(name, 12)
        legendX += textWidth + dotSize + 8 + 16
      })
    }
  }

  private formatNumber(num: number): string {
    if (Math.abs(num) >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (Math.abs(num) >= 1000) return (num / 1000).toFixed(1) + 'K'
    if (Number.isInteger(num)) return String(num)
    return num.toFixed(1)
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
