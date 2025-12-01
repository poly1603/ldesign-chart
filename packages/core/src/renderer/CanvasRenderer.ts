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
          break
        case 'L':
          this.ctx.lineTo(command.x, command.y)
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
          // Canvas 的 arc 方法与 SVG 的弧线命令参数不同，需要转换
          // 这里简化实现，实际使用时需要完整的椭圆弧转换算法
          this.ctx.arc(command.x, command.y, command.rx, 0, Math.PI * 2)
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

    if (style.radius && style.radius > 0) {
      // 绘制圆角矩形
      this.drawRoundedRect(rect, style.radius)
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

    if (style.opacity !== undefined && style.opacity < 1) {
      this.ctx.globalAlpha = style.opacity
    }
  }

  /**
   * 绘制圆角矩形
   */
  private drawRoundedRect(rect: Rect, radius: number): void {
    if (!this.ctx) return

    const { x, y, width, height } = rect

    this.ctx.beginPath()
    this.ctx.moveTo(x + radius, y)
    this.ctx.lineTo(x + width - radius, y)
    this.ctx.arcTo(x + width, y, x + width, y + radius, radius)
    this.ctx.lineTo(x + width, y + height - radius)
    this.ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
    this.ctx.lineTo(x + radius, y + height)
    this.ctx.arcTo(x, y + height, x, y + height - radius, radius)
    this.ctx.lineTo(x, y + radius)
    this.ctx.arcTo(x, y, x + radius, y, radius)
    this.ctx.closePath()
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
}