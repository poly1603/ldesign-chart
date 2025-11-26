/**
 * Canvas 渲染器
 */

import type { Point, Rect, LineStyle, FillStyle, TextStyle, RendererOptions } from '../types'
import { BaseRenderer } from './BaseRenderer'
import { createCanvas } from '../utils/dom'

export class CanvasRenderer extends BaseRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor(container: HTMLElement, options: RendererOptions = {}) {
    super(container, options)
    this.canvas = createCanvas(100, 100, this.dpr)
    this.ctx = this.canvas.getContext('2d')!
    this.container.appendChild(this.canvas)
  }

  setSize(width: number, height: number): void {
    this.width = width
    this.height = height
    this.canvas.width = width * this.dpr
    this.canvas.height = height * this.dpr
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    this.ctx.scale(this.dpr, this.dpr)
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }

  dispose(): void {
    this.canvas.remove()
  }

  // ========== 绑制方法 ==========

  drawLine(points: Point[], style: LineStyle = {}): void {
    if (points.length < 2) return

    this.ctx.save()
    this.applyLineStyle(style)
    this.ctx.beginPath()
    this.ctx.moveTo(points[0].x, points[0].y)

    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y)
    }

    this.ctx.stroke()
    this.ctx.restore()
  }

  drawRect(rect: Rect, fill?: FillStyle, stroke?: LineStyle): void {
    this.ctx.save()

    if (fill) {
      this.applyFillStyle(fill)
      this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
    }

    if (stroke) {
      this.applyLineStyle(stroke)
      this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
    }

    this.ctx.restore()
  }

  drawCircle(center: Point, radius: number, fill?: FillStyle, stroke?: LineStyle): void {
    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.arc(center.x, center.y, radius, 0, Math.PI * 2)

    if (fill) {
      this.applyFillStyle(fill)
      this.ctx.fill()
    }

    if (stroke) {
      this.applyLineStyle(stroke)
      this.ctx.stroke()
    }

    this.ctx.restore()
  }

  drawArc(
    center: Point,
    radius: number,
    startAngle: number,
    endAngle: number,
    fill?: FillStyle,
    stroke?: LineStyle
  ): void {
    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.arc(center.x, center.y, radius, startAngle, endAngle)

    if (fill) {
      this.applyFillStyle(fill)
      this.ctx.fill()
    }

    if (stroke) {
      this.applyLineStyle(stroke)
      this.ctx.stroke()
    }

    this.ctx.restore()
  }

  drawSector(
    center: Point,
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number,
    fill?: FillStyle,
    stroke?: LineStyle
  ): void {
    this.ctx.save()
    this.ctx.beginPath()

    // 外弧
    this.ctx.arc(center.x, center.y, outerRadius, startAngle, endAngle)

    if (innerRadius > 0) {
      // 连接到内弧
      this.ctx.arc(center.x, center.y, innerRadius, endAngle, startAngle, true)
    } else {
      // 连接到圆心
      this.ctx.lineTo(center.x, center.y)
    }

    this.ctx.closePath()

    if (fill) {
      this.applyFillStyle(fill)
      this.ctx.fill()
    }

    if (stroke) {
      this.applyLineStyle(stroke)
      this.ctx.stroke()
    }

    this.ctx.restore()
  }

  drawPolygon(points: Point[], fill?: FillStyle, stroke?: LineStyle): void {
    if (points.length < 3) return

    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.moveTo(points[0].x, points[0].y)

    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y)
    }

    this.ctx.closePath()

    if (fill) {
      this.applyFillStyle(fill)
      this.ctx.fill()
    }

    if (stroke) {
      this.applyLineStyle(stroke)
      this.ctx.stroke()
    }

    this.ctx.restore()
  }

  drawText(text: string, position: Point, style: TextStyle = {}): void {
    this.ctx.save()
    this.applyTextStyle(style)
    this.ctx.fillText(text, position.x, position.y)
    this.ctx.restore()
  }

  drawPath(commands: string, fill?: FillStyle, stroke?: LineStyle): void {
    this.ctx.save()
    const path = new Path2D(commands)

    if (fill) {
      this.applyFillStyle(fill)
      this.ctx.fill(path)
    }

    if (stroke) {
      this.applyLineStyle(stroke)
      this.ctx.stroke(path)
    }

    this.ctx.restore()
  }

  // ========== 变换方法 ==========

  save(): void {
    this.ctx.save()
  }

  restore(): void {
    this.ctx.restore()
  }

  translate(x: number, y: number): void {
    this.ctx.translate(x, y)
  }

  rotate(angle: number): void {
    this.ctx.rotate(angle)
  }

  scale(x: number, y: number): void {
    this.ctx.scale(x, y)
  }

  setClip(rect: Rect): void {
    this.ctx.beginPath()
    this.ctx.rect(rect.x, rect.y, rect.width, rect.height)
    this.ctx.clip()
  }

  measureText(text: string, style: TextStyle = {}): number {
    this.ctx.save()
    this.applyTextStyle(style)
    const metrics = this.ctx.measureText(text)
    this.ctx.restore()
    return metrics.width
  }

  /** 获取 Canvas 上下文 */
  getContext(): CanvasRenderingContext2D {
    return this.ctx
  }

  // ========== 私有方法 ==========

  private applyLineStyle(style: LineStyle): void {
    if (style.color) this.ctx.strokeStyle = style.color as string
    if (style.width) this.ctx.lineWidth = style.width
    if (style.cap) this.ctx.lineCap = style.cap
    if (style.join) this.ctx.lineJoin = style.join
    if (style.dashArray) this.ctx.setLineDash(style.dashArray)
    if (style.opacity !== undefined) this.ctx.globalAlpha = style.opacity
  }

  private applyFillStyle(style: FillStyle): void {
    if (style.color) this.ctx.fillStyle = style.color as string
    if (style.opacity !== undefined) this.ctx.globalAlpha = style.opacity
  }

  private applyTextStyle(style: TextStyle): void {
    const fontSize = style.fontSize ?? 12
    const fontFamily = style.fontFamily ?? 'sans-serif'
    const fontWeight = style.fontWeight ?? 'normal'
    this.ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
    if (style.color) this.ctx.fillStyle = style.color
    if (style.align) this.ctx.textAlign = style.align
    if (style.baseline) this.ctx.textBaseline = style.baseline
    if (style.opacity !== undefined) this.ctx.globalAlpha = style.opacity
  }
}
