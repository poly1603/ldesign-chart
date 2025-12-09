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
 * 线条样式
 */
export interface LineStyle {
  stroke?: string
  lineWidth?: number
  lineCap?: 'butt' | 'round' | 'square'
  lineJoin?: 'miter' | 'round' | 'bevel'
  lineDash?: number[]
  opacity?: number
}

/**
 * 圆弧样式
 */
export interface ArcStyle {
  fill?: string
  stroke?: string
  lineWidth?: number
  opacity?: number
}

/**
 * 扇形样式
 */
export interface SectorStyle {
  fill?: string
  stroke?: string
  lineWidth?: number
  opacity?: number
}

/**
 * 多边形样式
 */
export interface PolygonStyle {
  fill?: string
  stroke?: string
  lineWidth?: number
  opacity?: number
}

/**
 * 多段线点
 */
export interface Point {
  x: number
  y: number
}

/**
 * 渐变定义
 */
export interface GradientDef {
  type: 'linear' | 'radial'
  x1: number
  y1: number
  x2: number
  y2: number
  stops: Array<{ offset: number; color: string }>
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
   * 绘制线条（多段线）
   * @param points - 点数组
   * @param style - 线条样式
   * @param smooth - 是否平滑曲线
   */
  drawLine(points: Point[], style: LineStyle, smooth?: boolean): void

  /**
   * 绘制填充区域（多边形/面积图）
   * @param points - 点数组
   * @param baseY - 基准线Y坐标
   * @param fill - 填充色或渐变
   * @param smooth - 是否平滑曲线
   */
  drawArea(points: Point[], baseY: number, fill: string | GradientDef, smooth?: boolean): void

  /**
   * 绘制圆弧
   * @param cx - 圆心X坐标
   * @param cy - 圆心Y坐标
   * @param radius - 半径
   * @param startAngle - 起始角度（弧度）
   * @param endAngle - 结束角度（弧度）
   * @param style - 样式
   * @param counterclockwise - 是否逆时针
   */
  drawArc(
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    style: ArcStyle,
    counterclockwise?: boolean
  ): void

  /**
   * 绘制扇形（饼图用）
   * @param cx - 圆心X坐标
   * @param cy - 圆心Y坐标
   * @param innerRadius - 内半径（0为实心）
   * @param outerRadius - 外半径
   * @param startAngle - 起始角度（弧度）
   * @param endAngle - 结束角度（弧度）
   * @param style - 样式
   */
  drawSector(
    cx: number,
    cy: number,
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number,
    style: SectorStyle
  ): void

  /**
   * 绘制多边形
   * @param points - 顶点数组
   * @param style - 样式
   */
  drawPolygon(points: Point[], style: PolygonStyle): void

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

  /**
   * 获取渲染器类型
   */
  getType(): 'canvas' | 'svg'

  /**
   * 获取根元素（canvas 或 svg）
   */
  getElement(): HTMLCanvasElement | SVGSVGElement

  /**
   * 获取 Canvas 2D 上下文（仅 Canvas 渲染器有效）
   */
  getContext2D(): CanvasRenderingContext2D | null

  /**
   * 测量文本宽度
   */
  measureText(text: string, fontSize?: number, fontFamily?: string): number
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