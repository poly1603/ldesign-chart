/**
 * 渲染器基类
 */

import type { Point, Rect, LineStyle, FillStyle, TextStyle, RendererOptions } from '../types'

export abstract class BaseRenderer {
  protected container: HTMLElement
  protected width: number = 0
  protected height: number = 0
  protected dpr: number = 1
  protected options: RendererOptions

  constructor(container: HTMLElement, options: RendererOptions = {}) {
    this.container = container
    this.options = options
    this.dpr = options.devicePixelRatio ?? (typeof window !== 'undefined' ? window.devicePixelRatio : 1)
  }

  /** 设置尺寸 */
  abstract setSize(width: number, height: number): void

  /** 清空画布 */
  abstract clear(): void

  /** 销毁渲染器 */
  abstract dispose(): void

  // ========== 基础绑制方法 ==========

  /** 绑制线条 */
  abstract drawLine(points: Point[], style?: LineStyle): void

  /** 绘制矩形 */
  abstract drawRect(rect: Rect, fill?: FillStyle, stroke?: LineStyle): void

  /** 绘制圆形 */
  abstract drawCircle(center: Point, radius: number, fill?: FillStyle, stroke?: LineStyle): void

  /** 绘制弧形 */
  abstract drawArc(
    center: Point,
    radius: number,
    startAngle: number,
    endAngle: number,
    fill?: FillStyle,
    stroke?: LineStyle
  ): void

  /** 绘制扇形 */
  abstract drawSector(
    center: Point,
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number,
    fill?: FillStyle,
    stroke?: LineStyle
  ): void

  /** 绘制多边形 */
  abstract drawPolygon(points: Point[], fill?: FillStyle, stroke?: LineStyle): void

  /** 绘制文本 */
  abstract drawText(text: string, position: Point, style?: TextStyle): void

  /** 绘制路径 */
  abstract drawPath(commands: string, fill?: FillStyle, stroke?: LineStyle): void

  // ========== 变换方法 ==========

  /** 保存状态 */
  abstract save(): void

  /** 恢复状态 */
  abstract restore(): void

  /** 平移 */
  abstract translate(x: number, y: number): void

  /** 旋转 */
  abstract rotate(angle: number): void

  /** 缩放 */
  abstract scale(x: number, y: number): void

  /** 设置裁剪区域 */
  abstract setClip(rect: Rect): void

  // ========== 辅助方法 ==========

  /** 获取宽度 */
  getWidth(): number {
    return this.width
  }

  /** 获取高度 */
  getHeight(): number {
    return this.height
  }

  /** 获取设备像素比 */
  getDpr(): number {
    return this.dpr
  }

  /** 测量文本宽度 */
  abstract measureText(text: string, style?: TextStyle): number
}
