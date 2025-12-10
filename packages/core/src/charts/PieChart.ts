/**
 * PieChart 类 - 继承 BaseChart，使用 IRenderer 接口
 * 支持 Canvas 和 SVG 双模式渲染
 */

import { BaseChart } from './BaseChart'
import type { BaseChartOptions } from './BaseChart'

export interface PieDataItem {
  name: string
  value: number
  color?: string
  /** 是否选中（外移显示）*/
  selected?: boolean
}

/** 标签引导线配置 */
export interface PieLabelLineOptions {
  show?: boolean
  /** 第一段长度 */
  length1?: number
  /** 第二段长度 */
  length2?: number
  color?: string
  width?: number
  type?: 'solid' | 'dashed' | 'dotted'
}

/** 饼图动画类型 */
export type PieAnimationType = 'expand' | 'scale' | 'fade' | 'bounce' | 'none'

export interface PieChartOptions extends BaseChartOptions {
  data?: PieDataItem[]
  radius?: number | [number, number] // 外半径 或 [内半径, 外半径]
  legend?: { show?: boolean; position?: 'top' | 'right' | 'bottom' | 'left' }
  tooltip?: { show?: boolean }
  label?: { show?: boolean; position?: 'inside' | 'outside'; fontSize?: number; color?: string }
  /** 标签引导线配置 */
  labelLine?: PieLabelLineOptions
  roseType?: boolean | 'radius' | 'area' // 南丁格尔玫瑰图
  /** 选中扇形外移距离 */
  selectedOffset?: number
  /** 动画类型 */
  animationType?: PieAnimationType
  /** 起始角度（弧度），默认 -Math.PI/2（12点钟方向） */
  startAngle?: number
}

function getCurrentTheme(): 'light' | 'dark' {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}

export class PieChart extends BaseChart<PieChartOptions> {
  private hoverIndex = -1
  private tooltipEl: HTMLDivElement | null = null
  private centerX: number = 0
  private centerY: number = 0
  private outerRadius: number = 0
  private innerRadius: number = 0
  private pieOptions: PieChartOptions

  constructor(container: string | HTMLElement, options: PieChartOptions = {}) {
    const defaultOptions: PieChartOptions = {
      ...options,
      theme: options.theme || getCurrentTheme(),
      data: options.data || [],
      legend: options.legend ?? { show: true, position: 'right' },
      tooltip: options.tooltip ?? { show: true },
      label: options.label ?? { show: true, position: 'outside', fontSize: 11 },
      labelLine: options.labelLine ?? { show: true, length1: 15, length2: 25, width: 1, type: 'solid' },
      selectedOffset: options.selectedOffset ?? 10,
    }

    super(container, defaultOptions)
    this.pieOptions = defaultOptions

    this.calculateDimensions()
    this.bindEvents()

    // 启动入场动画或直接渲染
    const config = this.getAnimationConfig()
    if (config.enabled) {
      this.startAnimation()
    } else {
      this.render()
    }
  }

  private calculateDimensions(): void {
    const legendSpace = this.pieOptions.legend?.show !== false ? 100 : 0
    const availableWidth = this.width - legendSpace
    const size = Math.min(availableWidth, this.height) * 0.8

    this.centerX = availableWidth / 2
    this.centerY = this.height / 2

    const radius = this.pieOptions.radius
    if (Array.isArray(radius)) {
      this.innerRadius = radius[0] * size / 2
      this.outerRadius = radius[1] * size / 2
    } else {
      this.outerRadius = (radius ?? 0.8) * size / 2
      this.innerRadius = 0
    }
  }

  protected getPadding() {
    return { top: 20, right: 20, bottom: 20, left: 20 }
  }

  protected paint(): void {
    const { renderer, pieOptions: options } = this
    const colors = this.colors
    const data = options.data || []
    const total = this.getTotal()
    const animationType = options.animationType || 'expand'

    if (!data.length || total === 0) return

    // 绘制背景
    this.drawBackground()

    // 缓动函数
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const easeOutBounce = (t: number) => {
      const n1 = 7.5625, d1 = 2.75
      if (t < 1 / d1) return n1 * t * t
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
      return n1 * (t -= 2.625 / d1) * t + 0.984375
    }
    // 应用缓动的进度
    const easedProgress = easeOutCubic(this.animationProgress)

    // 绘制扇形（应用动画进度）
    const baseStartAngle = options.startAngle ?? -Math.PI / 2
    let startAngle = baseStartAngle

    data.forEach((item, i) => {
      const fullSliceAngle = (item.value / total) * Math.PI * 2
      const isHover = i === this.hoverIndex
      const color = this.getSeriesColor(i, item.color)

      // 根据动画类型计算参数
      let sliceAngle = fullSliceAngle
      let opacity = 1
      let radiusScale = 1
      let innerRadiusScale = 1
      let cx = this.centerX, cy = this.centerY

      switch (animationType) {
        case 'expand':
          // 扇形展开动画
          sliceAngle = fullSliceAngle * easedProgress
          break
        case 'scale':
          // 从中心缩放动画
          sliceAngle = fullSliceAngle
          radiusScale = easedProgress
          innerRadiusScale = easedProgress
          break
        case 'fade':
          // 淡入动画
          sliceAngle = fullSliceAngle
          opacity = easedProgress
          break
        case 'bounce':
          // 弹性缩放动画
          sliceAngle = fullSliceAngle
          radiusScale = easeOutBounce(this.animationProgress)
          innerRadiusScale = easeOutBounce(this.animationProgress)
          break
        case 'none':
          sliceAngle = fullSliceAngle
          break
      }

      const endAngle = startAngle + sliceAngle

      // 悬停时扇形外移
      if (isHover) {
        const midAngle = startAngle + sliceAngle / 2
        cx += Math.cos(midAngle) * 8
        cy += Math.sin(midAngle) * 8
      }

      // 南丁格尔玫瑰图
      let radius = this.outerRadius * radiusScale
      let innerRadius = this.innerRadius * innerRadiusScale
      if (options.roseType) {
        const maxVal = Math.max(...data.map(d => d.value))
        radius = (this.innerRadius + (this.outerRadius - this.innerRadius) * (item.value / maxVal)) * radiusScale
      }

      // 使用 drawSector 方法绘制扇形
      renderer.drawSector(
        cx, cy,
        innerRadius,
        radius,
        startAngle,
        endAngle,
        { fill: isHover ? this.lightenColor(color) : color, opacity }
      )

      // 标签和引导线
      if (options.label?.show !== false && this.animationProgress > 0.5) {
        const midAngle = startAngle + sliceAngle / 2
        const percent = ((item.value / total) * 100).toFixed(1)
        const labelText = `${item.name}: ${percent}%`

        if (options.label?.position === 'inside') {
          // 内部标签
          const labelRadius = radius * 0.6
          const lx = this.centerX + Math.cos(midAngle) * labelRadius
          const ly = this.centerY + Math.sin(midAngle) * labelRadius

          renderer.drawText(
            { x: lx, y: ly, text: item.name },
            {
              fill: options.label?.color ?? '#fff',
              fontSize: options.label?.fontSize ?? 11,
              textAlign: 'center',
              textBaseline: 'middle'
            }
          )
        } else {
          // 外部标签 + 引导线
          const labelLine = options.labelLine
          const length1 = labelLine?.length1 ?? 15
          const length2 = labelLine?.length2 ?? 25
          const direction = Math.cos(midAngle) >= 0 ? 1 : -1

          // 引导线起点（扇形边缘）
          const startX = this.centerX + Math.cos(midAngle) * radius
          const startY = this.centerY + Math.sin(midAngle) * radius

          // 引导线中点
          const midX = this.centerX + Math.cos(midAngle) * (radius + length1)
          const midY = this.centerY + Math.sin(midAngle) * (radius + length1)

          // 引导线终点（水平延伸）
          const endX = midX + direction * length2
          const endY = midY

          // 绘制引导线
          if (labelLine?.show !== false) {
            const lineDash = labelLine?.type === 'dashed' ? [4, 4] : labelLine?.type === 'dotted' ? [2, 2] : undefined
            renderer.drawPath(
              {
                commands: [
                  { type: 'M', x: startX, y: startY },
                  { type: 'L', x: midX, y: midY },
                  { type: 'L', x: endX, y: endY },
                ],
              },
              {
                stroke: labelLine?.color ?? colors.textSecondary,
                lineWidth: labelLine?.width ?? 1,
                lineDash,
              }
            )
          }

          // 绘制标签文本
          renderer.drawText(
            { x: endX + direction * 4, y: endY, text: labelText },
            {
              fill: options.label?.color ?? colors.text,
              fontSize: options.label?.fontSize ?? 11,
              textAlign: direction > 0 ? 'left' : 'right',
              textBaseline: 'middle'
            }
          )
        }
      }

      startAngle = endAngle
    })

    // 绘制图例
    if (options.legend?.show !== false) {
      this.drawLegend()
    }
  }

  private drawLegend(): void {
    const { renderer, pieOptions: options } = this
    const colors = this.colors
    const data = options.data || []

    const legendX = this.width - 90
    let legendY = 40

    data.forEach((item, i) => {
      const color = this.getSeriesColor(i, item.color)

      // 绘制图例圆点
      renderer.drawCircle(
        { x: legendX, y: legendY, radius: 5 },
        { fill: color }
      )

      // 绘制图例文本
      renderer.drawText(
        { x: legendX + 12, y: legendY, text: item.name },
        { fill: colors.text, fontSize: 12, textAlign: 'left', textBaseline: 'middle' }
      )

      legendY += 24
    })
  }

  private getTotal(): number {
    return (this.pieOptions.data || []).reduce((sum, d) => sum + d.value, 0)
  }

  private bindEvents(): void {
    const el = this.renderer.getElement()
    el.addEventListener('mousemove', this.onMouseMove.bind(this) as EventListener)
    el.addEventListener('mouseleave', this.onMouseLeave.bind(this) as EventListener)
  }

  private onMouseMove(e: MouseEvent): void {
    const el = this.renderer.getElement()
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (this.width / rect.width) - this.centerX
    const y = (e.clientY - rect.top) * (this.height / rect.height) - this.centerY

    const dist = Math.sqrt(x * x + y * y)
    let angle = Math.atan2(y, x)
    if (angle < -Math.PI / 2) angle += Math.PI * 2

    const data = this.pieOptions.data || []
    const total = this.getTotal()
    let startAngle = -Math.PI / 2
    let found = -1

    if (dist >= this.innerRadius && dist <= this.outerRadius) {
      for (let i = 0; i < data.length; i++) {
        const sliceAngle = (data[i]!.value / total) * Math.PI * 2
        const endAngle = startAngle + sliceAngle
        if (angle >= startAngle && angle < endAngle) {
          found = i
          break
        }
        startAngle = endAngle
      }
    }

    if (found !== this.hoverIndex) {
      this.hoverIndex = found
      this.render()
    }

    if (found >= 0 && this.pieOptions.tooltip?.show !== false) {
      const item = data[found]!
      const percent = ((item.value / total) * 100).toFixed(1)
      this.showTooltip(e.clientX, e.clientY, item.name, item.value, percent)
    } else {
      this.hideTooltip()
    }
  }

  private onMouseLeave(): void {
    this.hoverIndex = -1
    this.render()
    this.hideTooltip()
  }

  private showTooltip(x: number, y: number, name: string, value: number, percent: string): void {
    if (!this.tooltipEl) {
      this.tooltipEl = document.createElement('div')
      this.tooltipEl.className = 'chart-tooltip'
      document.body.appendChild(this.tooltipEl)
    }
    const colors = this.colors
    this.tooltipEl.style.cssText = `position:fixed;z-index:9999;padding:12px 16px;border-radius:8px;font-size:13px;box-shadow:0 4px 20px rgba(0,0,0,0.2);pointer-events:none;font-family:Inter,sans-serif;background:${colors.tooltipBg};color:${colors.text};border:1px solid ${colors.grid};`
    this.tooltipEl.innerHTML = `<div style="font-weight:600">${name}</div><div style="margin-top:4px">${value} (${percent}%)</div>`
    this.tooltipEl.classList.add('visible')
    this.tooltipEl.style.left = `${Math.min(x + 12, window.innerWidth - 150)}px`
    this.tooltipEl.style.top = `${Math.min(y + 12, window.innerHeight - 80)}px`
  }

  private hideTooltip(): void {
    if (this.tooltipEl) this.tooltipEl.classList.remove('visible')
  }

  private lightenColor(hex: string): string {
    const num = parseInt(hex.slice(1), 16)
    const r = Math.min(255, (num >> 16) + 40)
    const g = Math.min(255, ((num >> 8) & 0xff) + 40)
    const b = Math.min(255, (num & 0xff) + 40)
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }

  // ============== 公共方法 ==============

  setOption(options: Partial<PieChartOptions>): void {
    this.pieOptions = { ...this.pieOptions, ...options }
    this.options = { ...this.options, ...options }
    if (options.radius !== undefined) {
      this.calculateDimensions()
    }
    // 如果改变了动画类型，重新播放动画
    if (options.animationType !== undefined) {
      this.startAnimation()
    } else {
      this.render()
    }
  }

  setData(data: PieDataItem[]): void {
    this.pieOptions.data = data
    this.render()
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.pieOptions.theme = theme
      ; (this.options as any).theme = theme
    this.render()
  }

  refresh(): void {
    this.pieOptions.theme = getCurrentTheme()
      ; (this.options as any).theme = this.pieOptions.theme
    this.render()
  }

  dispose(): void {
    super.dispose()
    if (this.tooltipEl) this.tooltipEl.remove()
  }
}
