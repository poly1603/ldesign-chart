/**
 * 笛卡尔坐标系
 * 用于折线图、柱状图等图表类型
 */

import type { ICoordinate, CartesianCoordinateOptions } from './interface'
import type { Point, Rect } from '../types'

/**
 * 笛卡尔坐标系类
 */
export class CartesianCoordinate implements ICoordinate {
  readonly type = 'cartesian' as const

  private rect: Rect
  private invertX: boolean
  private invertY: boolean

  constructor(options: CartesianCoordinateOptions) {
    this.rect = { ...options.rect }
    this.invertX = options.invertX ?? false
    this.invertY = options.invertY ?? true // 默认反转 Y 轴（因为屏幕坐标系 Y 轴向下）
  }

  /**
   * 将数据点转换为屏幕坐标
   * 数据点范围假定为 [0, 1] x [0, 1]
   */
  dataToPoint(point: [number, number]): Point {
    const [dataX, dataY] = point
    const { x, y, width, height } = this.rect

    // 计算屏幕 X 坐标
    const screenX = this.invertX
      ? x + width * (1 - dataX)
      : x + width * dataX

    // 计算屏幕 Y 坐标
    const screenY = this.invertY
      ? y + height * (1 - dataY)
      : y + height * dataY

    return { x: screenX, y: screenY }
  }

  /**
   * 将屏幕坐标转换为数据点
   */
  pointToData(point: Point): [number, number] {
    const { x, y, width, height } = this.rect

    // 计算数据 X
    const dataX = this.invertX
      ? 1 - (point.x - x) / width
      : (point.x - x) / width

    // 计算数据 Y
    const dataY = this.invertY
      ? 1 - (point.y - y) / height
      : (point.y - y) / height

    return [dataX, dataY]
  }

  /**
   * 获取坐标系的边界矩形
   */
  getBoundingRect(): Rect {
    return { ...this.rect }
  }

  /**
   * 判断点是否在坐标系内
   */
  containsPoint(point: Point): boolean {
    const { x, y, width, height } = this.rect
    return (
      point.x >= x &&
      point.x <= x + width &&
      point.y >= y &&
      point.y <= y + height
    )
  }

  /**
   * 更新坐标系布局
   */
  update(rect: Rect): void {
    this.rect = { ...rect }
  }

  /**
   * 设置是否反转 X 轴
   */
  setInvertX(invert: boolean): void {
    this.invertX = invert
  }

  /**
   * 设置是否反转 Y 轴
   */
  setInvertY(invert: boolean): void {
    this.invertY = invert
  }

  /**
   * 获取 X 轴是否反转
   */
  isInvertX(): boolean {
    return this.invertX
  }

  /**
   * 获取 Y 轴是否反转
   */
  isInvertY(): boolean {
    return this.invertY
  }

  /**
   * 获取坐标系宽度
   */
  getWidth(): number {
    return this.rect.width
  }

  /**
   * 获取坐标系高度
   */
  getHeight(): number {
    return this.rect.height
  }

  /**
   * 获取坐标系中心点
   */
  getCenter(): Point {
    return {
      x: this.rect.x + this.rect.width / 2,
      y: this.rect.y + this.rect.height / 2,
    }
  }
}