/**
 * ChartPainter - 统一的图表绑图类
 * 封装所有图表通用的高级绑图方法，确保 Canvas 和 SVG 渲染的一致性
 * 所有图表类型都应该使用此类进行绑图，而不是直接调用 IRenderer
 */

import type {
  IRenderer,
  Point,
  GradientDef,
  TextStyle,
  CircleStyle,
} from './interface'

// ============== 类型定义 ==============

export interface ChartThemeColors {
  text: string
  textSecondary: string
  grid: string
  background: string
  tooltipBg: string
  axis: string
  border: string
}

export interface LabelLineOptions {
  show?: boolean
  length1?: number  // 第一段长度
  length2?: number  // 第二段长度
  smooth?: boolean
  color?: string
  width?: number
  type?: 'solid' | 'dashed' | 'dotted'
}

export interface SectorOptions {
  cx: number
  cy: number
  innerRadius: number
  outerRadius: number
  startAngle: number
  endAngle: number
  fill?: string
  stroke?: string
  lineWidth?: number
  opacity?: number
  // 标签相关
  label?: {
    show?: boolean
    text?: string
    position?: 'inside' | 'outside' | 'center'
    color?: string
    fontSize?: number
  }
  labelLine?: LabelLineOptions
}

export interface BarOptions {
  x: number
  y: number
  width: number
  height: number
  fill?: string
  stroke?: string
  lineWidth?: number
  radius?: number
  opacity?: number
}

export interface LineOptions {
  points: Point[]
  color?: string
  width?: number
  smooth?: boolean
  dash?: number[]
  opacity?: number
}

export interface AreaOptions extends LineOptions {
  baseY: number
  fillColor?: string
  fillOpacity?: number
  gradient?: boolean
}

export interface ScatterPointOptions {
  x: number
  y: number
  size: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
  symbol?: 'circle' | 'rect' | 'triangle' | 'diamond'
}

export interface AxisOptions {
  start: Point
  end: Point
  ticks?: Array<{ value: number | string; position: number; label?: string }>
  color?: string
  lineWidth?: number
  tickLength?: number
  labelStyle?: Partial<TextStyle>
}

export interface GridOptions {
  rect: { x: number; y: number; width: number; height: number }
  xLines?: number
  yLines?: number
  color?: string
  lineWidth?: number
  dash?: number[]
}

export interface LegendItemOptions {
  x: number
  y: number
  text: string
  color: string
  enabled?: boolean
  symbol?: 'circle' | 'rect' | 'line'
  textStyle?: Partial<TextStyle>
}

// ============== 默认主题颜色 ==============

export function getDefaultThemeColors(theme: 'light' | 'dark' = 'dark'): ChartThemeColors {
  const isDark = theme === 'dark'
  return {
    text: isDark ? '#e2e8f0' : '#1e293b',
    textSecondary: isDark ? '#94a3b8' : '#64748b',
    grid: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(0, 0, 0, 0.08)',
    background: isDark ? '#1e293b' : '#ffffff',
    tooltipBg: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
    axis: isDark ? '#475569' : '#cbd5e1',
    border: isDark ? '#334155' : '#e2e8f0',
  }
}

// ============== 默认系列颜色 ==============

export const SERIES_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#3b82f6',
]

// ============== ChartPainter 类 ==============

export class ChartPainter {
  private renderer: IRenderer
  private _theme: 'light' | 'dark'
  private _colors: ChartThemeColors

  constructor(renderer: IRenderer, theme: 'light' | 'dark' = 'dark') {
    this.renderer = renderer
    this._theme = theme
    this._colors = getDefaultThemeColors(theme)
  }

  // ============== 基础属性 ==============

  get colors(): ChartThemeColors {
    return this._colors
  }

  get width(): number {
    return this.renderer.getWidth()
  }

  get height(): number {
    return this.renderer.getHeight()
  }

  getRenderer(): IRenderer {
    return this.renderer
  }

  getTheme(): 'light' | 'dark' {
    return this._theme
  }

  setTheme(theme: 'light' | 'dark'): void {
    this._theme = theme
    this._colors = getDefaultThemeColors(theme)
  }

  // ============== 工具方法 ==============

  /**
   * 获取系列颜色
   */
  getSeriesColor(index: number, customColor?: string): string {
    return customColor ?? SERIES_COLORS[index % SERIES_COLORS.length]!
  }

  /**
   * 将颜色转换为带透明度的 RGBA
   */
  colorWithOpacity(color: string, opacity: number): string {
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

  /**
   * 调亮颜色
   */
  lightenColor(hex: string, amount: number = 40): string {
    if (!hex.startsWith('#')) return hex
    const num = parseInt(hex.slice(1), 16)
    const r = Math.min(255, (num >> 16) + amount)
    const g = Math.min(255, ((num >> 8) & 0xff) + amount)
    const b = Math.min(255, (num & 0xff) + amount)
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }

  /**
   * 格式化数字
   */
  formatNumber(value: number): string {
    if (Math.abs(value) >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M'
    }
    if (Math.abs(value) >= 1000) {
      return (value / 1000).toFixed(1) + 'K'
    }
    return value % 1 === 0 ? String(value) : value.toFixed(1)
  }

  /**
   * 创建线性渐变
   */
  createLinearGradient(
    x1: number, y1: number, x2: number, y2: number,
    stops: Array<{ offset: number; color: string }>
  ): GradientDef {
    return { type: 'linear', x1, y1, x2, y2, stops }
  }

  /**
   * 测量文本宽度
   */
  measureText(text: string, fontSize: number = 12, fontFamily?: string): number {
    return this.renderer.measureText(text, fontSize, fontFamily)
  }

  // ============== 基础绑图方法 ==============

  /**
   * 清空画布
   */
  clear(): void {
    this.renderer.clear()
  }

  /**
   * 绘制背景
   */
  drawBackground(color?: string): void {
    this.renderer.drawRect(
      { x: 0, y: 0, width: this.width, height: this.height },
      { fill: color ?? this._colors.background }
    )
  }

  /**
   * 绘制矩形
   */
  drawRect(options: BarOptions): void {
    this.renderer.drawRect(
      { x: options.x, y: options.y, width: options.width, height: options.height },
      {
        fill: options.fill,
        stroke: options.stroke,
        lineWidth: options.lineWidth,
        radius: options.radius,
        opacity: options.opacity,
      }
    )
  }

  /**
   * 绘制圆形
   */
  drawCircle(x: number, y: number, radius: number, style: CircleStyle): void {
    this.renderer.drawCircle({ x, y, radius }, style)
  }

  /**
   * 绘制文本
   */
  drawText(x: number, y: number, text: string, style: Partial<TextStyle> = {}): void {
    this.renderer.drawText(
      { x, y, text },
      {
        fill: style.fill ?? this._colors.text,
        fontSize: style.fontSize ?? 12,
        fontFamily: style.fontFamily ?? 'Inter, -apple-system, sans-serif',
        fontWeight: style.fontWeight,
        textAlign: style.textAlign ?? 'left',
        textBaseline: style.textBaseline ?? 'middle',
        opacity: style.opacity,
      }
    )
  }

  // ============== 图表专用绑图方法 ==============

  /**
   * 绘制网格线
   */
  drawGrid(options: GridOptions): void {
    const { rect, xLines = 0, yLines = 5, color, lineWidth = 1, dash } = options
    const gridColor = color ?? this._colors.grid

    // 水平网格线
    for (let i = 0; i <= yLines; i++) {
      const y = rect.y + (i / yLines) * rect.height
      this.renderer.drawLine(
        [{ x: rect.x, y }, { x: rect.x + rect.width, y }],
        { stroke: gridColor, lineWidth, lineDash: dash }
      )
    }

    // 垂直网格线
    if (xLines > 0) {
      for (let i = 0; i <= xLines; i++) {
        const x = rect.x + (i / xLines) * rect.width
        this.renderer.drawLine(
          [{ x, y: rect.y }, { x, y: rect.y + rect.height }],
          { stroke: gridColor, lineWidth, lineDash: dash }
        )
      }
    }
  }

  /**
   * 绘制折线/曲线
   */
  drawLine(options: LineOptions): void {
    if (options.points.length < 2) return

    this.renderer.drawLine(
      options.points,
      {
        stroke: options.color ?? SERIES_COLORS[0],
        lineWidth: options.width ?? 2,
        lineDash: options.dash,
        opacity: options.opacity,
        lineCap: 'round',
        lineJoin: 'round',
      },
      options.smooth
    )
  }

  /**
   * 绘制面积图
   */
  drawArea(options: AreaOptions): void {
    if (options.points.length < 2) return

    const fillColor = options.fillColor ?? options.color ?? SERIES_COLORS[0]!
    const opacity = options.fillOpacity ?? 0.3

    if (options.gradient) {
      // 使用渐变填充
      const minY = Math.min(...options.points.map(p => p.y))
      this.renderer.drawArea(
        options.points,
        options.baseY,
        {
          type: 'linear',
          x1: 0, y1: minY,
          x2: 0, y2: options.baseY,
          stops: [
            { offset: 0, color: this.colorWithOpacity(fillColor, opacity) },
            { offset: 1, color: this.colorWithOpacity(fillColor, 0.05) },
          ]
        },
        options.smooth
      )
    } else {
      this.renderer.drawArea(
        options.points,
        options.baseY,
        this.colorWithOpacity(fillColor, opacity),
        options.smooth
      )
    }
  }

  /**
   * 绘制扇形（用于饼图）
   */
  drawSector(options: SectorOptions): void {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, stroke, lineWidth, opacity } = options

    this.renderer.drawSector(
      cx, cy,
      innerRadius, outerRadius,
      startAngle, endAngle,
      { fill, stroke, lineWidth, opacity }
    )

    // 绘制标签和引导线
    if (options.label?.show !== false && options.label?.text) {
      this.drawSectorLabel(options)
    }
  }

  /**
   * 绘制扇形标签和引导线
   */
  private drawSectorLabel(options: SectorOptions): void {
    const { cx, cy, outerRadius, startAngle, endAngle, label, labelLine } = options
    if (!label?.text) return

    const midAngle = (startAngle + endAngle) / 2
    const position = label.position ?? 'outside'

    if (position === 'inside' || position === 'center') {
      // 内部标签
      const labelRadius = position === 'center' ? 0 : outerRadius * 0.6
      const lx = cx + Math.cos(midAngle) * labelRadius
      const ly = cy + Math.sin(midAngle) * labelRadius

      this.drawText(lx, ly, label.text, {
        fill: label.color ?? '#fff',
        fontSize: label.fontSize ?? 12,
        textAlign: 'center',
        textBaseline: 'middle',
      })
    } else {
      // 外部标签，绘制引导线
      const length1 = labelLine?.length1 ?? 15
      const length2 = labelLine?.length2 ?? 25

      // 引导线起点（扇形边缘）
      const startX = cx + Math.cos(midAngle) * outerRadius
      const startY = cy + Math.sin(midAngle) * outerRadius

      // 引导线中点
      const midX = cx + Math.cos(midAngle) * (outerRadius + length1)
      const midY = cy + Math.sin(midAngle) * (outerRadius + length1)

      // 引导线终点（水平延伸）
      const direction = Math.cos(midAngle) >= 0 ? 1 : -1
      const endX = midX + direction * length2
      const endY = midY

      // 绘制引导线
      if (labelLine?.show !== false) {
        const lineDash = labelLine?.type === 'dashed' ? [4, 4] : labelLine?.type === 'dotted' ? [2, 2] : undefined

        this.renderer.drawPath(
          {
            commands: [
              { type: 'M', x: startX, y: startY },
              { type: 'L', x: midX, y: midY },
              { type: 'L', x: endX, y: endY },
            ],
          },
          {
            stroke: labelLine?.color ?? this._colors.textSecondary,
            lineWidth: labelLine?.width ?? 1,
            lineDash,
          }
        )
      }

      // 绘制标签文本
      this.drawText(endX + direction * 4, endY, label.text, {
        fill: label.color ?? this._colors.text,
        fontSize: label.fontSize ?? 12,
        textAlign: direction > 0 ? 'left' : 'right',
        textBaseline: 'middle',
      })
    }
  }

  /**
   * 绘制散点
   */
  drawScatterPoint(options: ScatterPointOptions): void {
    const { x, y, size, fill, stroke, strokeWidth, opacity, symbol = 'circle' } = options

    switch (symbol) {
      case 'rect':
        this.renderer.drawRect(
          { x: x - size / 2, y: y - size / 2, width: size, height: size },
          { fill, stroke, lineWidth: strokeWidth, opacity }
        )
        break
      case 'triangle':
        this.renderer.drawPolygon(
          [
            { x: x, y: y - size },
            { x: x + size * 0.866, y: y + size * 0.5 },
            { x: x - size * 0.866, y: y + size * 0.5 },
          ],
          { fill, stroke, lineWidth: strokeWidth, opacity }
        )
        break
      case 'diamond':
        this.renderer.drawPolygon(
          [
            { x: x, y: y - size },
            { x: x + size, y: y },
            { x: x, y: y + size },
            { x: x - size, y: y },
          ],
          { fill, stroke, lineWidth: strokeWidth, opacity }
        )
        break
      default: // circle
        this.renderer.drawCircle(
          { x, y, radius: size },
          { fill, stroke, lineWidth: strokeWidth, opacity }
        )
    }
  }

  /**
   * 绘制柱形
   */
  drawBar(options: BarOptions): void {
    this.drawRect(options)
  }

  /**
   * 绘制 X 轴
   */
  drawXAxis(
    rect: { x: number; y: number; width: number; height: number },
    labels: string[],
    options: {
      showLine?: boolean
      showTicks?: boolean
      interval?: number | 'auto'
      rotate?: number
      formatter?: (value: string, index: number) => string
    } = {}
  ): void {
    const { showLine = false, showTicks = false, interval = 0, rotate = 0, formatter } = options
    const xStep = rect.width / Math.max(labels.length - 1, 1)

    // 轴线
    if (showLine) {
      this.renderer.drawLine(
        [{ x: rect.x, y: rect.y + rect.height }, { x: rect.x + rect.width, y: rect.y + rect.height }],
        { stroke: this._colors.axis, lineWidth: 1 }
      )
    }

    // 标签
    labels.forEach((label, i) => {
      // 处理间隔显示
      if (typeof interval === 'number' && interval > 0 && i % (interval + 1) !== 0) return

      const x = rect.x + i * xStep
      const y = rect.y + rect.height + (showTicks ? 8 : 0) + 14

      // 刻度线
      if (showTicks) {
        this.renderer.drawLine(
          [{ x, y: rect.y + rect.height }, { x, y: rect.y + rect.height + 6 }],
          { stroke: this._colors.axis, lineWidth: 1 }
        )
      }

      // 标签文本
      const displayLabel = formatter ? formatter(label, i) : label
      const textAlign = i === 0 ? 'left' : i === labels.length - 1 ? 'right' : 'center'

      if (rotate !== 0) {
        this.renderer.save()
        this.renderer.translate(x, y)
        this.renderer.rotate((rotate * Math.PI) / 180)
        this.drawText(0, 0, displayLabel, {
          fill: this._colors.textSecondary,
          fontSize: 11,
          textAlign: rotate > 0 ? 'right' : 'left',
          textBaseline: 'middle',
        })
        this.renderer.restore()
      } else {
        this.drawText(x, y, displayLabel, {
          fill: this._colors.textSecondary,
          fontSize: 11,
          textAlign: textAlign as 'left' | 'center' | 'right',
          textBaseline: 'top',
        })
      }
    })
  }

  /**
   * 绘制 Y 轴
   */
  drawYAxis(
    rect: { x: number; y: number; width: number; height: number },
    range: { min: number; max: number },
    options: {
      ticks?: number
      showLine?: boolean
      showTicks?: boolean
      formatter?: (value: number) => string
    } = {}
  ): void {
    const { ticks = 5, showLine = false, showTicks = false, formatter } = options
    const { min, max } = range

    // 轴线
    if (showLine) {
      this.renderer.drawLine(
        [{ x: rect.x, y: rect.y }, { x: rect.x, y: rect.y + rect.height }],
        { stroke: this._colors.axis, lineWidth: 1 }
      )
    }

    // 刻度和标签
    for (let i = 0; i <= ticks; i++) {
      const value = min + (max - min) * (1 - i / ticks)
      const y = rect.y + (i / ticks) * rect.height
      const x = rect.x - (showTicks ? 8 : 0) - 4

      // 刻度线
      if (showTicks) {
        this.renderer.drawLine(
          [{ x: rect.x - 6, y }, { x: rect.x, y }],
          { stroke: this._colors.axis, lineWidth: 1 }
        )
      }

      // 标签
      const displayValue = formatter ? formatter(value) : this.formatNumber(value)
      this.drawText(x, y, displayValue, {
        fill: this._colors.textSecondary,
        fontSize: 11,
        textAlign: 'right',
        textBaseline: 'middle',
      })
    }
  }

  /**
   * 绘制图例
   */
  drawLegend(
    items: Array<{ name: string; color: string; enabled?: boolean }>,
    position: { x: number; y: number },
    options: {
      direction?: 'horizontal' | 'vertical'
      gap?: number
      symbol?: 'circle' | 'rect' | 'line'
      symbolSize?: number
      fontSize?: number
    } = {}
  ): void {
    const { direction = 'horizontal', gap = 16, symbol = 'circle', symbolSize = 8, fontSize = 12 } = options
    let currentX = position.x
    let currentY = position.y

    items.forEach((item) => {
      const enabled = item.enabled !== false
      const color = enabled ? item.color : this._colors.textSecondary
      const textColor = enabled ? this._colors.text : this._colors.textSecondary
      const opacity = enabled ? 1 : 0.4

      // 绘制图例符号
      switch (symbol) {
        case 'rect':
          this.renderer.drawRect(
            { x: currentX, y: currentY - symbolSize / 2, width: symbolSize, height: symbolSize },
            { fill: color, opacity }
          )
          break
        case 'line':
          this.renderer.drawLine(
            [{ x: currentX, y: currentY }, { x: currentX + symbolSize * 1.5, y: currentY }],
            { stroke: color, lineWidth: 2, opacity }
          )
          break
        default: // circle
          this.renderer.drawCircle(
            { x: currentX + symbolSize / 2, y: currentY, radius: symbolSize / 2 },
            { fill: color, opacity }
          )
      }

      // 绘制图例文本
      const textX = currentX + symbolSize + 6
      this.drawText(textX, currentY, item.name, {
        fill: textColor,
        fontSize,
        textAlign: 'left',
        textBaseline: 'middle',
        opacity,
      })

      // 计算下一个位置
      const textWidth = this.measureText(item.name, fontSize)
      if (direction === 'horizontal') {
        currentX += symbolSize + 6 + textWidth + gap
      } else {
        currentY += fontSize + gap
      }
    })
  }

  /**
   * 绘制悬停参考线
   */
  drawHoverLine(
    x: number,
    rect: { x: number; y: number; width: number; height: number },
    options: { color?: string; dash?: number[] } = {}
  ): void {
    if (x < rect.x || x > rect.x + rect.width) return

    this.renderer.drawLine(
      [{ x, y: rect.y }, { x, y: rect.y + rect.height }],
      {
        stroke: options.color ?? this._colors.grid,
        lineWidth: 1,
        lineDash: options.dash ?? [4, 4],
      }
    )
  }

  /**
   * 绘制标记线（平均线、最大值线等）
   */
  drawMarkLine(
    y: number,
    rect: { x: number; y: number; width: number; height: number },
    options: {
      color?: string
      label?: string
      dash?: number[]
      labelPosition?: 'start' | 'end'
    } = {}
  ): void {
    const { color = '#ef4444', label, dash = [6, 4], labelPosition = 'end' } = options

    this.renderer.drawLine(
      [{ x: rect.x, y }, { x: rect.x + rect.width, y }],
      { stroke: color, lineWidth: 1, lineDash: dash }
    )

    if (label) {
      const labelX = labelPosition === 'end' ? rect.x + rect.width : rect.x
      const textAlign = labelPosition === 'end' ? 'right' : 'left'
      this.drawText(labelX, y - 4, label, {
        fill: color,
        fontSize: 10,
        textAlign: textAlign as 'left' | 'right',
        textBaseline: 'bottom',
      })
    }
  }

  // ============== 状态管理 ==============

  save(): void {
    this.renderer.save()
  }

  restore(): void {
    this.renderer.restore()
  }

  translate(x: number, y: number): void {
    this.renderer.translate(x, y)
  }

  rotate(angle: number): void {
    this.renderer.rotate(angle)
  }

  scale(x: number, y: number): void {
    this.renderer.scale(x, y)
  }

  clip(rect: { x: number; y: number; width: number; height: number }): void {
    this.renderer.clip(rect)
  }
}
