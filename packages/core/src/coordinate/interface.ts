/**
 * 坐标系统接口定义
 */

import type { Point, Rect } from '../types'

/**
 * 坐标系统类型
 */
export type CoordinateType = 'cartesian' | 'polar' | 'geo'

/**
 * 坐标系统基础接口
 */
export interface ICoordinate {
  /**
   * 坐标系类型
   */
  readonly type: CoordinateType

  /**
   * 将数据点转换为屏幕坐标
   * @param point - 数据点 [x, y]
   * @returns 屏幕坐标
   */
  dataToPoint(point: [number, number]): Point

  /**
   * 将屏幕坐标转换为数据点
   * @param point - 屏幕坐标
   * @returns 数据点 [x, y]
   */
  pointToData(point: Point): [number, number]

  /**
   * 获取坐标系的边界矩形
   */
  getBoundingRect(): Rect

  /**
   * 判断点是否在坐标系内
   * @param point - 屏幕坐标
   */
  containsPoint(point: Point): boolean

  /**
   * 更新坐标系布局
   * @param rect - 新的边界矩形
   */
  update(rect: Rect): void
}

/**
 * 笛卡尔坐标系配置
 */
export interface CartesianCoordinateOptions {
  /** 坐标系在容器中的位置和大小 */
  rect: Rect
  /** 是否反转 X 轴 */
  invertX?: boolean
  /** 是否反转 Y 轴 */
  invertY?: boolean
}

/**
 * 极坐标系配置
 */
export interface PolarCoordinateOptions {
  /** 中心点位置 */
  center: Point
  /** 外半径 */
  radius: number
  /** 内半径（用于环形） */
  innerRadius?: number
  /** 起始角度（弧度） */
  startAngle?: number
  /** 结束角度（弧度） */
  endAngle?: number
  /** 是否顺时针 */
  clockwise?: boolean
}