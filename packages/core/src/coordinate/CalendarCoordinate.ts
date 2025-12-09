/**
 * 日历坐标系
 */

import type { ICoordinate, CoordinateType } from './interface'
import type { Point, Rect } from '../types'

/**
 * 日历坐标系配置
 */
export interface CalendarCoordinateOptions {
  /** 边界矩形 */
  rect: Rect
  /** 日期范围 ['2024-01', '2024-12'] 或 '2024' */
  range: string | [string, string]
  /** 单元格大小 [width, height] 或 number */
  cellSize?: number | [number, number]
  /** 方向 */
  orient?: 'horizontal' | 'vertical'
  /** 每周起始日 0=周日, 1=周一 */
  firstDay?: number
  /** 分隔线 */
  splitLine?: {
    show?: boolean
    lineStyle?: {
      color?: string
      width?: number
    }
  }
  /** 月份标签 */
  monthLabel?: {
    show?: boolean
    position?: 'start' | 'end'
    color?: string
    fontSize?: number
  }
  /** 星期标签 */
  dayLabel?: {
    show?: boolean
    position?: 'start' | 'end'
    color?: string
    fontSize?: number
    nameMap?: string[]
  }
}

/**
 * 日历坐标系类
 */
export class CalendarCoordinate implements ICoordinate {
  readonly type: CoordinateType = 'cartesian'  // 基于笛卡尔

  private rect: Rect
  private startDate: Date
  private endDate: Date
  private cellSize: [number, number]
  private orient: 'horizontal' | 'vertical'
  private firstDay: number
  private options: CalendarCoordinateOptions

  // 缓存的日期到位置映射
  private dateMap: Map<string, { row: number; col: number }> = new Map()
  private weeks: number = 0
  // @ts-ignore - Reserved for future use
  private _daysPerWeek: number = 7

  constructor(options: CalendarCoordinateOptions) {
    this.options = options
    this.rect = options.rect
    this.orient = options.orient || 'horizontal'
    this.firstDay = options.firstDay ?? 0

    // 解析日期范围
    const [start, end] = this.parseRange(options.range)
    this.startDate = start
    this.endDate = end

    // 解析单元格大小
    this.cellSize = this.parseCellSize(options.cellSize)

    // 构建日期映射
    this.buildDateMap()
  }

  /**
   * 解析日期范围
   */
  private parseRange(range: string | [string, string]): [Date, Date] {
    if (typeof range === 'string') {
      // 单个年份 '2024'
      const year = parseInt(range, 10)
      return [new Date(year, 0, 1), new Date(year, 11, 31)]
    }

    // 日期范围
    const start = this.parseDate(range[0])
    const end = this.parseDate(range[1])
    return [start, end]
  }

  /**
   * 解析日期字符串
   */
  private parseDate(dateStr: string): Date {
    const parts = dateStr.split('-').map(Number)
    if (parts.length === 1) {
      // 年
      return new Date(parts[0]!, 0, 1)
    } else if (parts.length === 2) {
      // 年-月
      return new Date(parts[0]!, parts[1]! - 1, 1)
    } else {
      // 年-月-日
      return new Date(parts[0]!, parts[1]! - 1, parts[2]!)
    }
  }

  /**
   * 解析单元格大小
   */
  private parseCellSize(size?: number | [number, number]): [number, number] {
    if (size === undefined) {
      // 自动计算
      const totalDays = this.getDaysBetween(this.startDate, this.endDate) + 1
      const weeks = Math.ceil(totalDays / 7)

      if (this.orient === 'horizontal') {
        const cellW = Math.floor((this.rect.width - 60) / weeks)  // 留出标签空间
        const cellH = Math.floor((this.rect.height - 30) / 7)
        return [Math.max(10, cellW), Math.max(10, cellH)]
      } else {
        const cellW = Math.floor((this.rect.width - 30) / 7)
        const cellH = Math.floor((this.rect.height - 60) / weeks)
        return [Math.max(10, cellW), Math.max(10, cellH)]
      }
    }

    if (typeof size === 'number') {
      return [size, size]
    }
    return size
  }

  /**
   * 构建日期到位置的映射
   */
  private buildDateMap(): void {
    this.dateMap.clear()

    let currentDate = new Date(this.startDate)
    let week = 0

    // 找到第一个星期的起始
    const firstDayOfWeek = currentDate.getDay()
    const offset = (firstDayOfWeek - this.firstDay + 7) % 7

    while (currentDate <= this.endDate) {
      const dateKey = this.formatDate(currentDate)
      const dayOfWeek = (currentDate.getDay() - this.firstDay + 7) % 7

      const daysSinceStart = this.getDaysBetween(this.startDate, currentDate)
      week = Math.floor((daysSinceStart + offset) / 7)

      if (this.orient === 'horizontal') {
        this.dateMap.set(dateKey, { row: dayOfWeek, col: week })
      } else {
        this.dateMap.set(dateKey, { row: week, col: dayOfWeek })
      }

      // 下一天
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
    }

    this.weeks = week + 1
  }

  /**
   * 格式化日期为字符串
   */
  private formatDate(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  /**
   * 计算两个日期之间的天数
   */
  private getDaysBetween(start: Date, end: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000
    return Math.floor((end.getTime() - start.getTime()) / msPerDay)
  }

  /**
   * 将数据点转换为屏幕坐标
   * @param point - [timestamp or date string index, value] - 只使用 index 部分
   */
  dataToPoint(point: [number, number]): Point {
    // 对于日历，使用日期索引
    const dayIndex = point[0]
    const date = new Date(this.startDate.getTime() + dayIndex * 24 * 60 * 60 * 1000)
    const dateKey = this.formatDate(date)

    return this.getPointByDate(dateKey)
  }

  /**
   * 根据日期字符串获取单元格中心坐标
   */
  getPointByDate(dateStr: string): Point {
    const pos = this.dateMap.get(dateStr)
    if (!pos) {
      return { x: 0, y: 0 }
    }

    const offsetX = this.orient === 'horizontal' ? 50 : 20  // 标签空间
    const offsetY = this.orient === 'horizontal' ? 20 : 50

    return {
      x: this.rect.x + offsetX + pos.col * this.cellSize[0] + this.cellSize[0] / 2,
      y: this.rect.y + offsetY + pos.row * this.cellSize[1] + this.cellSize[1] / 2,
    }
  }

  /**
   * 根据日期字符串获取单元格矩形
   */
  getCellRectByDate(dateStr: string): Rect | null {
    const pos = this.dateMap.get(dateStr)
    if (!pos) {
      return null
    }

    const offsetX = this.orient === 'horizontal' ? 50 : 20
    const offsetY = this.orient === 'horizontal' ? 20 : 50

    return {
      x: this.rect.x + offsetX + pos.col * this.cellSize[0],
      y: this.rect.y + offsetY + pos.row * this.cellSize[1],
      width: this.cellSize[0],
      height: this.cellSize[1],
    }
  }

  /**
   * 将屏幕坐标转换为数据点
   */
  pointToData(point: Point): [number, number] {
    const offsetX = this.orient === 'horizontal' ? 50 : 20
    const offsetY = this.orient === 'horizontal' ? 20 : 50

    const col = Math.floor((point.x - this.rect.x - offsetX) / this.cellSize[0])
    const row = Math.floor((point.y - this.rect.y - offsetY) / this.cellSize[1])

    // 反向查找日期
    for (const [dateStr, pos] of this.dateMap) {
      if (pos.row === row && pos.col === col) {
        const date = this.parseDate(dateStr)
        const dayIndex = this.getDaysBetween(this.startDate, date)
        return [dayIndex, 0]
      }
    }

    return [0, 0]
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
    return (
      point.x >= this.rect.x &&
      point.x <= this.rect.x + this.rect.width &&
      point.y >= this.rect.y &&
      point.y <= this.rect.y + this.rect.height
    )
  }

  /**
   * 更新坐标系布局
   */
  update(rect: Rect): void {
    this.rect = rect
    this.cellSize = this.parseCellSize(this.options.cellSize)
    this.buildDateMap()
  }

  /**
   * 获取所有日期
   */
  getAllDates(): string[] {
    return Array.from(this.dateMap.keys())
  }

  /**
   * 获取单元格大小
   */
  getCellSize(): [number, number] {
    return [...this.cellSize]
  }

  /**
   * 获取周数
   */
  getWeeks(): number {
    return this.weeks
  }

  /**
   * 获取日期范围
   */
  getDateRange(): [Date, Date] {
    return [new Date(this.startDate), new Date(this.endDate)]
  }

  /**
   * 获取配置
   */
  getOptions(): CalendarCoordinateOptions {
    return this.options
  }
}
