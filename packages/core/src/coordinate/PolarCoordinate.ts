/**
 * 极坐标系
 */

import type { ICoordinate, PolarCoordinateOptions, CoordinateType } from './interface'
import type { Point, Rect } from '../types'

/**
 * 极坐标系类
 * 用于雷达图、极坐标柱状图、极坐标折线图等
 */
export class PolarCoordinate implements ICoordinate {
  readonly type: CoordinateType = 'polar'

  private center: Point
  private radius: number
  private innerRadius: number
  private startAngle: number
  private endAngle: number
  private clockwise: boolean
  private boundingRect: Rect

  constructor(options: PolarCoordinateOptions) {
    this.center = options.center
    this.radius = options.radius
    this.innerRadius = options.innerRadius ?? 0
    this.startAngle = options.startAngle ?? 0
    this.endAngle = options.endAngle ?? Math.PI * 2
    this.clockwise = options.clockwise ?? true

    // 计算边界矩形
    this.boundingRect = {
      x: this.center.x - this.radius,
      y: this.center.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
    }
  }

  /**
   * 将数据点转换为屏幕坐标
   * @param point - [radius, angle] 或 [angle, radius] 取决于配置
   *   - point[0]: 半径比例 [0, 1]
   *   - point[1]: 角度比例 [0, 1] 映射到 [startAngle, endAngle]
   */
  dataToPoint(point: [number, number]): Point {
    const [radiusRatio, angleRatio] = point

    // 计算实际半径
    const actualRadius = this.innerRadius + radiusRatio * (this.radius - this.innerRadius)

    // 计算实际角度
    const angleSpan = this.endAngle - this.startAngle
    let angle = this.startAngle + angleRatio * angleSpan

    // 如果是逆时针，反转角度
    if (!this.clockwise) {
      angle = this.startAngle - angleRatio * Math.abs(angleSpan)
    }

    return {
      x: this.center.x + actualRadius * Math.cos(angle),
      y: this.center.y - actualRadius * Math.sin(angle),  // Y轴向下，所以用减法
    }
  }

  /**
   * 将屏幕坐标转换为数据点
   * @returns [radiusRatio, angleRatio]
   */
  pointToData(point: Point): [number, number] {
    const dx = point.x - this.center.x
    const dy = this.center.y - point.y  // 注意Y轴方向

    // 计算极坐标
    const distance = Math.sqrt(dx * dx + dy * dy)
    let angle = Math.atan2(dy, dx)

    // 确保角度在正确范围内
    if (angle < 0) {
      angle += Math.PI * 2
    }

    // 转换为比例
    const radiusRatio = (distance - this.innerRadius) / (this.radius - this.innerRadius)

    const angleSpan = this.endAngle - this.startAngle
    let angleRatio = (angle - this.startAngle) / angleSpan

    if (!this.clockwise) {
      angleRatio = (this.startAngle - angle) / Math.abs(angleSpan)
    }

    return [
      Math.max(0, Math.min(1, radiusRatio)),
      Math.max(0, Math.min(1, angleRatio)),
    ]
  }

  /**
   * 根据角度和半径获取屏幕坐标
   * @param angle - 弧度
   * @param radius - 实际半径
   */
  getPointByAngle(angle: number, radius: number): Point {
    return {
      x: this.center.x + radius * Math.cos(angle),
      y: this.center.y - radius * Math.sin(angle),
    }
  }

  /**
   * 获取指定比例的角度
   * @param ratio - 角度比例 [0, 1]
   */
  getAngle(ratio: number): number {
    const angleSpan = this.endAngle - this.startAngle
    if (this.clockwise) {
      return this.startAngle + ratio * angleSpan
    } else {
      return this.startAngle - ratio * Math.abs(angleSpan)
    }
  }

  /**
   * 获取指定比例的半径
   * @param ratio - 半径比例 [0, 1]
   */
  getRadiusByRatio(ratio: number): number {
    return this.innerRadius + ratio * (this.radius - this.innerRadius)
  }

  /**
   * 获取坐标系的边界矩形
   */
  getBoundingRect(): Rect {
    return { ...this.boundingRect }
  }

  /**
   * 判断点是否在坐标系内
   */
  containsPoint(point: Point): boolean {
    const dx = point.x - this.center.x
    const dy = point.y - this.center.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // 检查是否在半径范围内
    if (distance < this.innerRadius || distance > this.radius) {
      return false
    }

    // 如果是完整圆，无需检查角度
    if (Math.abs(this.endAngle - this.startAngle) >= Math.PI * 2) {
      return true
    }

    // 检查角度
    let angle = Math.atan2(-dy, dx)  // 注意Y轴方向
    if (angle < 0) {
      angle += Math.PI * 2
    }

    const minAngle = Math.min(this.startAngle, this.endAngle)
    const maxAngle = Math.max(this.startAngle, this.endAngle)

    return angle >= minAngle && angle <= maxAngle
  }

  /**
   * 更新坐标系布局
   */
  update(rect: Rect): void {
    this.center = {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
    }
    this.radius = Math.min(rect.width, rect.height) / 2
    this.boundingRect = rect
  }

  /**
   * 获取中心点
   */
  getCenter(): Point {
    return { ...this.center }
  }

  /**
   * 设置中心点
   */
  setCenter(center: Point): void {
    this.center = { ...center }
    this.updateBoundingRect()
  }

  /**
   * 获取外半径
   */
  getRadius(): number {
    return this.radius
  }

  /**
   * 设置外半径
   */
  setRadius(radius: number): void {
    this.radius = radius
    this.updateBoundingRect()
  }

  /**
   * 获取内半径
   */
  getInnerRadius(): number {
    return this.innerRadius
  }

  /**
   * 设置内半径
   */
  setInnerRadius(innerRadius: number): void {
    this.innerRadius = innerRadius
  }

  /**
   * 获取起始角度
   */
  getStartAngle(): number {
    return this.startAngle
  }

  /**
   * 设置起始角度
   */
  setStartAngle(angle: number): void {
    this.startAngle = angle
  }

  /**
   * 获取结束角度
   */
  getEndAngle(): number {
    return this.endAngle
  }

  /**
   * 设置结束角度
   */
  setEndAngle(angle: number): void {
    this.endAngle = angle
  }

  /**
   * 获取角度范围
   */
  getAngleExtent(): number {
    return Math.abs(this.endAngle - this.startAngle)
  }

  /**
   * 是否顺时针
   */
  isClockwise(): boolean {
    return this.clockwise
  }

  /**
   * 更新边界矩形
   */
  private updateBoundingRect(): void {
    this.boundingRect = {
      x: this.center.x - this.radius,
      y: this.center.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
    }
  }
}
