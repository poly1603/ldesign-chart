/**
 * 渲染器抽象接口
 */

import type { Rect } from '../types'

// 重新导出 Rect 类型供外部使用
export type { Rect } from '../types'

/**
 * 路径数据
 */
export interface PathData {
  commands: PathCommand[]
}

/**
 * 路径命令
 */
export type PathCommand =
  | { type: 'M'; x: number; y: number }
  | { type: 'L'; x: number; y: number }
  | { type: 'C'; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
  | { type: 'Q'; x1: number; y1: number; x: number; y: number }
  | { type: 'A'; rx: number; ry: number; rotation: number; large: boolean; sweep: boolean; x: number; y: number }
  | { type: 'Z' }

/**
 * 路径样式
 */
export interface PathStyle {
  fill?: string
  stroke?: string
  lineWidth?: number
  lineCap?: 'butt' | 'round' | 'square'
  lineJoin?: 'miter' | 'round' | 'bevel'
  lineDash?: number[]
  opacity?: number
}

/**
 * 矩形样式
 */
export interface RectStyle {
  fill?: string
  stroke?: string
  lineWidth?: number
  opacity?: number
  radius?: number
}

/**
 * 圆形
 */
export interface Circle {
  x: number
  y: number
  radius: number
}

/**
 * 圆形样式
 */
export interface CircleStyle {
  fill?: string
  stroke?: string
  lineWidth?: number
  opacity?: number
}

/**
 * 文本
 */
export interface Text {
  x: number
  y: number
  text: string
}

/**
 * 文本样式
 */
export interface TextStyle {
  fill?: string
  stroke?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string | number
  textAlign?: 'left' | 'center' | 'right'
  textBaseline?: 'top' | 'middle' | 'bottom' | 'alphabetic'
  opacity?: number
}

/**
 * 渲染器接口
 */
export interface IRenderer {
  /**
   * 初始化渲染器
   * @param container - 容器元素
   * @param width - 宽度
   * @param height - 高度
   */
  init(container: HTMLElement, width: number, height: number): void

  /**
   * 渲染
   */
  render(): void

  /**
   * 清空画布
   */
  clear(): void

  /**
   * 调整大小
   * @param width - 新宽度
   * @param height - 新高度
   */
  resize(width: number, height: number): void

  /**
   * 销毁渲染器
   */
  dispose(): void

  /**
   * 绘制路径
   * @param path - 路径数据
   * @param style - 路径样式
   */
  drawPath(path: PathData, style: PathStyle): void

  /**
   * 绘制矩形
   * @param rect - 矩形数据
   * @param style - 矩形样式
   */
  drawRect(rect: Rect, style: RectStyle): void

  /**
   * 绘制圆形
   * @param circle - 圆形数据
   * @param style - 圆形样式
   */
  drawCircle(circle: Circle, style: CircleStyle): void

  /**
   * 绘制文本
   * @param text - 文本数据
   * @param style - 文本样式
   */
  drawText(text: Text, style: TextStyle): void

  /**
   * 保存当前状态
   */
  save(): void

  /**
   * 恢复之前保存的状态
   */
  restore(): void

  /**
   * 平移
   * @param x - X轴偏移
   * @param y - Y轴偏移
   */
  translate(x: number, y: number): void

  /**
   * 旋转
   * @param angle - 旋转角度（弧度）
   */
  rotate(angle: number): void

  /**
   * 缩放
   * @param x - X轴缩放比例
   * @param y - Y轴缩放比例
   */
  scale(x: number, y: number): void

  /**
   * 设置剪裁区域
   * @param rect - 剪裁矩形
   */
  clip(rect: Rect): void

  /**
   * 获取画布宽度
   */
  getWidth(): number

  /**
   * 获取画布高度
   */
  getHeight(): number
}

/**
 * 渲染器工厂接口
 */
export interface IRendererFactory {
  /**
   * 创建渲染器
   */
  create(): IRenderer
}