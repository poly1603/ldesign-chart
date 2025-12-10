/**
 * Canvas 渲染器实现
 */

import type {
  IRenderer,
  PathData,
  PathStyle,
  RectStyle,
  Circle,
  CircleStyle,
  Text,
  TextStyle,
  Rect,
  Point,
  LineStyle,
  GradientDef,
  ArcStyle,
  SectorStyle,
  PolygonStyle,
} from './interface'

/**
 * Canvas 渲染器
 */
export class CanvasRenderer implements IRenderer {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private width = 0
  private height = 0
  private dpr = 1

  /**
   * 初始化渲染器
   */
  init(container: HTMLElement, width: number, height: number): void {
    // 创建 Canvas 元素
    this.canvas = document.createElement('canvas')
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`

    // 获取设备像素比
    this.dpr = window.devicePixelRatio || 1

    // 设置 Canvas 实际尺寸
    this.width = width
    this.height = height
    this.canvas.width = width * this.dpr
    this.canvas.height = height * this.dpr

    // 获取绘图上下文
    this.ctx = this.canvas.getContext('2d')
    if (!this.ctx) {
      throw new Error('Failed to get 2d context')
    }

    // 缩放上下文以匹配设备像素比
    this.ctx.scale(this.dpr, this.dpr)

    // 添加到容器
    container.appendChild(this.canvas)
  }

  /**
   * 渲染
   */
  render(): void {
    // Canvas 是立即模式渲染，不需要单独的 render 调用
    // 所有绘制操作都是立即执行的
  }

  /**
   * 清空画布
   */
  clear(): void {
    if (!this.ctx) return

    this.ctx.clearRect(0, 0, this.width, this.height)
  }

  /**
   * 调整大小
   */
  resize(width: number, height: number): void {
    if (!this.canvas || !this.ctx) return

    this.width = width
    this.height = height

    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    this.canvas.width = width * this.dpr
    this.canvas.height = height * this.dpr

    // 重新缩放上下文
    this.ctx.scale(this.dpr, this.dpr)
  }

  /**
   * 销毁渲染器
   */
  dispose(): void {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas)
    }

    this.canvas = null
    this.ctx = null
  }

  /**
   * 绘制路径
   */
  drawPath(path: PathData, style: PathStyle): void {
    if (!this.ctx) return

    this.ctx.beginPath()

    for (const command of path.commands) {
      switch (command.type) {
        case 'M':
          this.ctx.moveTo(command.x, command.y)
          this.lastX = command.x
          this.lastY = command.y
          break
        case 'L':
          this.ctx.lineTo(command.x, command.y)
          this.lastX = command.x
          this.lastY = command.y
          break
        case 'C':
          this.ctx.bezierCurveTo(
            command.x1,
            command.y1,
            command.x2,
            command.y2,
            command.x,
            command.y
          )
          break
        case 'Q':
          this.ctx.quadraticCurveTo(command.x1, command.y1, command.x, command.y)
          break
        case 'A':
          // SVG 弧线命令转换为 Canvas 弧线
          // command: { rx, ry, rotation, large, sweep, x, y }
          this.drawArcCommand(command)
          break
        case 'Z':
          this.ctx.closePath()
          break
      }
    }

    this.applyPathStyle(style)
  }

  /**
   * 绘制矩形
   */
  drawRect(rect: Rect, style: RectStyle): void {
    if (!this.ctx) return

    // 保存当前状态
    this.ctx.save()

    if (style.opacity !== undefined && style.opacity < 1) {
      this.ctx.globalAlpha = style.opacity
    }

    if (style.radius && style.radius > 0) {
      // 绘制圆角矩形
      this.drawRoundedRect(rect, style.radius, style)
    } else {
      // 绘制普通矩形
      if (style.fill) {
        this.ctx.fillStyle = style.fill
        this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
      }

      if (style.stroke && style.lineWidth) {
        this.ctx.strokeStyle = style.stroke
        this.ctx.lineWidth = style.lineWidth
        this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
      }
    }

    // 恢复状态
    this.ctx.restore()
  }

  /**
   * 绘制圆角矩形
   */
  private drawRoundedRect(rect: Rect, radius: number, style: RectStyle): void {
    if (!this.ctx) return

    const { x, y, width, height } = rect
    // 确保半径不超过宽高的一半
    const r = Math.min(radius, width / 2, height / 2)

    this.ctx.beginPath()
    this.ctx.moveTo(x + r, y)
    this.ctx.lineTo(x + width - r, y)
    this.ctx.arcTo(x + width, y, x + width, y + r, r)
    this.ctx.lineTo(x + width, y + height - r)
    this.ctx.arcTo(x + width, y + height, x + width - r, y + height, r)
    this.ctx.lineTo(x + r, y + height)
    this.ctx.arcTo(x, y + height, x, y + height - r, r)
    this.ctx.lineTo(x, y + r)
    this.ctx.arcTo(x, y, x + r, y, r)
    this.ctx.closePath()

    // 填充和描边
    if (style.fill) {
      this.ctx.fillStyle = style.fill
      this.ctx.fill()
    }

    if (style.stroke && style.lineWidth) {
      this.ctx.strokeStyle = style.stroke
      this.ctx.lineWidth = style.lineWidth
      this.ctx.stroke()
    }
  }

  /**
   * 绘制圆形
   */
  drawCircle(circle: Circle, style: CircleStyle): void {
    if (!this.ctx) return

    this.ctx.beginPath()
    this.ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2)

    if (style.opacity !== undefined && style.opacity < 1) {
      this.ctx.globalAlpha = style.opacity
    }

    if (style.fill) {
      this.ctx.fillStyle = style.fill
      this.ctx.fill()
    }

    if (style.stroke && style.lineWidth) {
      this.ctx.strokeStyle = style.stroke
      this.ctx.lineWidth = style.lineWidth
      this.ctx.stroke()
    }

    this.ctx.globalAlpha = 1
  }

  /**
   * 绘制文本
   */
  drawText(text: Text, style: TextStyle): void {
    if (!this.ctx) return

    // 设置字体样式
    const fontSize = style.fontSize ?? 12
    const fontFamily = style.fontFamily ?? 'sans-serif'
    const fontWeight = style.fontWeight ?? 'normal'
    this.ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`

    // 设置文本对齐
    this.ctx.textAlign = style.textAlign ?? 'left'
    this.ctx.textBaseline = style.textBaseline ?? 'alphabetic'

    if (style.opacity !== undefined && style.opacity < 1) {
      this.ctx.globalAlpha = style.opacity
    }

    // 绘制文本
    if (style.fill) {
      this.ctx.fillStyle = style.fill
      this.ctx.fillText(text.text, text.x, text.y)
    }

    if (style.stroke) {
      this.ctx.strokeStyle = style.stroke
      this.ctx.strokeText(text.text, text.x, text.y)
    }

    this.ctx.globalAlpha = 1
  }

  /**
   * 应用路径样式
   */
  private applyPathStyle(style: PathStyle): void {
    if (!this.ctx) return

    if (style.opacity !== undefined && style.opacity < 1) {
      this.ctx.globalAlpha = style.opacity
    }

    if (style.lineCap) {
      this.ctx.lineCap = style.lineCap
    }

    if (style.lineJoin) {
      this.ctx.lineJoin = style.lineJoin
    }

    if (style.lineDash) {
      this.ctx.setLineDash(style.lineDash)
    }

    if (style.fill) {
      this.ctx.fillStyle = style.fill
      this.ctx.fill()
    }

    if (style.stroke && style.lineWidth) {
      this.ctx.strokeStyle = style.stroke
      this.ctx.lineWidth = style.lineWidth
      this.ctx.stroke()
    }

    // 重置全局透明度
    this.ctx.globalAlpha = 1
  }

  /**
   * 保存当前状态
   */
  save(): void {
    this.ctx?.save()
  }

  /**
   * 恢复之前保存的状态
   */
  restore(): void {
    this.ctx?.restore()
  }

  /**
   * 平移
   */
  translate(x: number, y: number): void {
    this.ctx?.translate(x, y)
  }

  /**
   * 旋转
   */
  rotate(angle: number): void {
    this.ctx?.rotate(angle)
  }

  /**
   * 缩放
   */
  scale(x: number, y: number): void {
    this.ctx?.scale(x, y)
  }

  /**
   * 设置剪裁区域
   */
  clip(rect: Rect): void {
    if (!this.ctx) return

    this.ctx.beginPath()
    this.ctx.rect(rect.x, rect.y, rect.width, rect.height)
    this.ctx.clip()
  }

  /**
   * 获取画布宽度
   */
  getWidth(): number {
    return this.width
  }

  /**
   * 获取画布高度
   */
  getHeight(): number {
    return this.height
  }

  /**
   * 绘制线条（多段线）
   * @param step - 阶梯线类型: 'start' | 'middle' | 'end' | false
   */
  drawLine(points: Point[], style: LineStyle, smooth: boolean = false, step?: false | 'start' | 'middle' | 'end'): void {
    if (!this.ctx || points.length < 2) return

    this.ctx.beginPath()
    this.ctx.moveTo(points[0]!.x, points[0]!.y)

    if (step) {
      // 阶梯线绘制
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]!
        const curr = points[i]!
        if (step === 'start') {
          this.ctx.lineTo(prev.x, curr.y)
          this.ctx.lineTo(curr.x, curr.y)
        } else if (step === 'middle') {
          const midX = (prev.x + curr.x) / 2
          this.ctx.lineTo(midX, prev.y)
          this.ctx.lineTo(midX, curr.y)
          this.ctx.lineTo(curr.x, curr.y)
        } else if (step === 'end') {
          this.ctx.lineTo(curr.x, prev.y)
          this.ctx.lineTo(curr.x, curr.y)
        }
      }
    } else if (smooth) {
      // 使用贝塞尔曲线绘制平滑曲线
      for (let i = 1; i < points.length; i++) {
        const p0 = points[Math.max(0, i - 2)]!
        const p1 = points[i - 1]!
        const p2 = points[i]!
        const p3 = points[Math.min(points.length - 1, i + 1)]!

        const tension = 0.3
        const cp1x = p1.x + (p2.x - p0.x) * tension
        const cp1y = p1.y + (p2.y - p0.y) * tension
        const cp2x = p2.x - (p3.x - p1.x) * tension
        const cp2y = p2.y - (p3.y - p1.y) * tension

        this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y)
      }
    } else {
      for (let i = 1; i < points.length; i++) {
        this.ctx.lineTo(points[i]!.x, points[i]!.y)
      }
    }

    // 应用样式
    if (style.opacity !== undefined) this.ctx.globalAlpha = style.opacity
    this.ctx.strokeStyle = style.stroke || '#000'
    this.ctx.lineWidth = style.lineWidth || 1
    this.ctx.lineCap = style.lineCap || 'round'
    this.ctx.lineJoin = style.lineJoin || 'round'
    if (style.lineDash) this.ctx.setLineDash(style.lineDash)

    this.ctx.stroke()
    this.ctx.setLineDash([])
    this.ctx.globalAlpha = 1
  }

  /**
   * 绘制填充区域（面积图）- 支持平滑顶部曲线和水平基线
   */
  drawArea(points: Point[], baseY: number, fill: string | GradientDef, smooth: boolean = false, opacity: number = 1): void {
    if (!this.ctx || points.length < 2) return

    this.ctx.beginPath()
    this.ctx.moveTo(points[0]!.x, baseY)
    this.ctx.lineTo(points[0]!.x, points[0]!.y)

    if (smooth) {
      for (let i = 1; i < points.length; i++) {
        const p0 = points[Math.max(0, i - 2)]!
        const p1 = points[i - 1]!
        const p2 = points[i]!
        const p3 = points[Math.min(points.length - 1, i + 1)]!

        const tension = 0.3
        const cp1x = p1.x + (p2.x - p0.x) * tension
        const cp1y = p1.y + (p2.y - p0.y) * tension
        const cp2x = p2.x - (p3.x - p1.x) * tension
        const cp2y = p2.y - (p3.y - p1.y) * tension

        this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y)
      }
    } else {
      for (let i = 1; i < points.length; i++) {
        this.ctx.lineTo(points[i]!.x, points[i]!.y)
      }
    }

    this.ctx.lineTo(points[points.length - 1]!.x, baseY)
    this.ctx.closePath()

    // 应用透明度
    if (opacity < 1) {
      this.ctx.globalAlpha = opacity
    }

    // 应用填充
    if (typeof fill === 'string') {
      this.ctx.fillStyle = fill
    } else {
      const gradient = this.ctx.createLinearGradient(fill.x1, fill.y1, fill.x2, fill.y2)
      for (const stop of fill.stops) {
        gradient.addColorStop(stop.offset, stop.color)
      }
      this.ctx.fillStyle = gradient
    }

    this.ctx.fill()
    this.ctx.globalAlpha = 1
  }

  /**
   * 绘制堆叠面积（顶部和底部都是曲线）
   */
  drawStackedArea(
    topPoints: Point[],
    bottomPoints: Point[],
    style: PolygonStyle,
    smooth: boolean = false
  ): void {
    if (!this.ctx || topPoints.length < 2) return

    this.ctx.beginPath()

    // 绘制顶部曲线
    this.ctx.moveTo(topPoints[0]!.x, topPoints[0]!.y)
    if (smooth) {
      for (let i = 1; i < topPoints.length; i++) {
        const p0 = topPoints[Math.max(0, i - 2)]!
        const p1 = topPoints[i - 1]!
        const p2 = topPoints[i]!
        const p3 = topPoints[Math.min(topPoints.length - 1, i + 1)]!

        const tension = 0.3
        const cp1x = p1.x + (p2.x - p0.x) * tension
        const cp1y = p1.y + (p2.y - p0.y) * tension
        const cp2x = p2.x - (p3.x - p1.x) * tension
        const cp2y = p2.y - (p3.y - p1.y) * tension

        this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y)
      }
    } else {
      for (let i = 1; i < topPoints.length; i++) {
        this.ctx.lineTo(topPoints[i]!.x, topPoints[i]!.y)
      }
    }

    // 从顶部最后一点直线连接到底部最后一点
    const lastBottom = bottomPoints[bottomPoints.length - 1]!
    this.ctx.lineTo(lastBottom.x, lastBottom.y)

    // 绘制底部曲线（反向）
    if (smooth) {
      for (let i = bottomPoints.length - 2; i >= 0; i--) {
        const p0 = bottomPoints[Math.min(bottomPoints.length - 1, i + 2)]!
        const p1 = bottomPoints[i + 1]!
        const p2 = bottomPoints[i]!
        const p3 = bottomPoints[Math.max(0, i - 1)]!

        const tension = 0.3
        const cp1x = p1.x + (p2.x - p0.x) * tension
        const cp1y = p1.y + (p2.y - p0.y) * tension
        const cp2x = p2.x - (p3.x - p1.x) * tension
        const cp2y = p2.y - (p3.y - p1.y) * tension

        this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y)
      }
    } else {
      for (let i = bottomPoints.length - 2; i >= 0; i--) {
        this.ctx.lineTo(bottomPoints[i]!.x, bottomPoints[i]!.y)
      }
    }

    this.ctx.closePath()

    if (style.opacity !== undefined) {
      this.ctx.globalAlpha = style.opacity
    }

    if (style.fill) {
      this.ctx.fillStyle = style.fill
      this.ctx.fill()
    }

    this.ctx.globalAlpha = 1
  }

  /**
   * 获取渲染器类型
   */
  getType(): 'canvas' | 'svg' {
    return 'canvas'
  }

  /**
   * 获取根元素
   */
  getElement(): HTMLCanvasElement | SVGSVGElement {
    return this.canvas!
  }

  /**
   * 获取 Canvas 元素
   */
  getCanvas(): HTMLCanvasElement | null {
    return this.canvas
  }

  /**
   * 获取绘图上下文
   */
  getContext(): CanvasRenderingContext2D | null {
    return this.ctx
  }

  // 存储当前路径的最后一个点
  private lastX = 0
  private lastY = 0

  /**
   * 绘制SVG弧线命令
   * SVG Arc: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
   * 转换为 Canvas arc
   */
  private drawArcCommand(command: any): void {
    if (!this.ctx) return

    const { rx, ry, large, sweep, x: endX, y: endY } = command
    const startX = this.lastX
    const startY = this.lastY

    // 更新最后一个点
    this.lastX = endX
    this.lastY = endY

    // 如果起点和终点相同，不绘制
    if (startX === endX && startY === endY) return

    // 如果半径为0，画直线
    if (rx === 0 || ry === 0) {
      this.ctx.lineTo(endX, endY)
      return
    }

    // SVG arc endpoint 转 Canvas arc center 参数
    // 参考: https://www.w3.org/TR/SVG/implnote.html#ArcConversionEndpointToCenter
    const dx = (startX - endX) / 2
    const dy = (startY - endY) / 2

    // 计算中点
    const midX = (startX + endX) / 2
    const midY = (startY + endY) / 2

    // 简化计算（假设rx = ry，即圆弧）
    const radius = Math.abs(rx)

    // 计算弦长的一半
    const d = Math.sqrt(dx * dx + dy * dy)

    // 如果弦长大于直径，调整半径
    const r = Math.max(radius, d / 2)

    // 计算圆心到弦的距离
    const h = Math.sqrt(Math.max(0, r * r - d * d))

    // 计算圆心位置（有两个可能的位置）
    const perpX = -dy / d
    const perpY = dx / d

    // 根据large和sweep标志选择圆心
    const sign = (large !== sweep) ? 1 : -1
    const cx = midX + sign * h * perpX
    const cy = midY + sign * h * perpY

    // 计算起始角度和终止角度
    let startAngle = Math.atan2(startY - cy, startX - cx)
    let endAngle = Math.atan2(endY - cy, endX - cx)

    // 绘制圆弧
    this.ctx.arc(cx, cy, r, startAngle, endAngle, !sweep)
  }

  /**
   * 绘制圆弧
   */
  drawArc(
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    style: ArcStyle,
    counterclockwise: boolean = false
  ): void {
    if (!this.ctx) return

    this.ctx.beginPath()
    this.ctx.arc(cx, cy, radius, startAngle, endAngle, counterclockwise)

    if (style.opacity !== undefined) {
      this.ctx.globalAlpha = style.opacity
    }

    if (style.fill) {
      this.ctx.fillStyle = style.fill
      this.ctx.fill()
    }

    if (style.stroke) {
      this.ctx.strokeStyle = style.stroke
      this.ctx.lineWidth = style.lineWidth || 1
      this.ctx.stroke()
    }

    this.ctx.globalAlpha = 1
  }

  /**
   * 绘制扇形（饼图用）
   */
  drawSector(
    cx: number,
    cy: number,
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number,
    style: SectorStyle
  ): void {
    if (!this.ctx) return

    this.ctx.beginPath()

    if (innerRadius > 0) {
      // 环形扇形
      this.ctx.arc(cx, cy, outerRadius, startAngle, endAngle)
      this.ctx.arc(cx, cy, innerRadius, endAngle, startAngle, true)
    } else {
      // 实心扇形
      this.ctx.moveTo(cx, cy)
      this.ctx.arc(cx, cy, outerRadius, startAngle, endAngle)
    }
    this.ctx.closePath()

    if (style.opacity !== undefined) {
      this.ctx.globalAlpha = style.opacity
    }

    if (style.fill) {
      this.ctx.fillStyle = style.fill
      this.ctx.fill()
    }

    if (style.stroke) {
      this.ctx.strokeStyle = style.stroke
      this.ctx.lineWidth = style.lineWidth || 1
      this.ctx.stroke()
    }

    this.ctx.globalAlpha = 1
  }

  /**
   * 绘制多边形
   * @param smooth - 是否使用平滑曲线（面积图需要与线条匹配）
   */
  drawPolygon(points: Point[], style: PolygonStyle, smooth: boolean = false): void {
    if (!this.ctx || points.length < 3) return

    this.ctx.beginPath()
    this.ctx.moveTo(points[0]!.x, points[0]!.y)

    if (smooth && points.length > 2) {
      // 使用贝塞尔曲线绘制平滑边缘（与 drawLine 的 smooth 算法一致）
      for (let i = 1; i < points.length; i++) {
        const p0 = points[Math.max(0, i - 2)]!
        const p1 = points[i - 1]!
        const p2 = points[i]!
        const p3 = points[Math.min(points.length - 1, i + 1)]!

        const tension = 0.3
        const cp1x = p1.x + (p2.x - p0.x) * tension
        const cp1y = p1.y + (p2.y - p0.y) * tension
        const cp2x = p2.x - (p3.x - p1.x) * tension
        const cp2y = p2.y - (p3.y - p1.y) * tension

        this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y)
      }
    } else {
      for (let i = 1; i < points.length; i++) {
        this.ctx.lineTo(points[i]!.x, points[i]!.y)
      }
    }
    this.ctx.closePath()

    if (style.opacity !== undefined) {
      this.ctx.globalAlpha = style.opacity
    }

    if (style.fill) {
      this.ctx.fillStyle = style.fill
      this.ctx.fill()
    }

    if (style.stroke) {
      this.ctx.strokeStyle = style.stroke
      this.ctx.lineWidth = style.lineWidth || 1
      this.ctx.stroke()
    }

    this.ctx.globalAlpha = 1
  }

  /**
   * 获取 Canvas 2D 上下文
   */
  getContext2D(): CanvasRenderingContext2D | null {
    return this.ctx
  }

  /**
   * 测量文本宽度
   */
  measureText(text: string, fontSize: number = 12, fontFamily: string = 'sans-serif'): number {
    if (!this.ctx) return 0
    const oldFont = this.ctx.font
    this.ctx.font = `${fontSize}px ${fontFamily}`
    const width = this.ctx.measureText(text).width
    this.ctx.font = oldFont
    return width
  }
}