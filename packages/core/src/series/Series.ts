/**
 * 系列基类
 */

import type { IRenderer } from '../renderer/interface'
import type { ICoordinate } from '../coordinate/interface'
import type { SeriesOption } from '../types'
import { EventEmitter } from '../event/EventEmitter'

/**
 * 系列基类
 */
export abstract class Series extends EventEmitter {
  protected option: SeriesOption
  protected coordinate: ICoordinate | null = null
  protected data: unknown[] = []

  constructor(option: SeriesOption) {
    super()
    this.option = option
    this.data = option.data || []
  }

  /**
   * 系列类型
   */
  abstract get type(): string

  /**
   * 渲染系列
   */
  abstract render(renderer: IRenderer): void

  /**
   * 设置坐标系
   */
  setCoordinate(coordinate: ICoordinate): void {
    this.coordinate = coordinate
  }

  /**
   * 获取坐标系
   */
  getCoordinate(): ICoordinate | null {
    return this.coordinate
  }

  /**
   * 更新配置
   */
  updateOption(option: Partial<SeriesOption>): void {
    this.option = { ...this.option, ...option }
    if (option.data) {
      this.data = option.data
    }
  }

  /**
   * 获取配置
   */
  getOption(): SeriesOption {
    return { ...this.option }
  }

  /**
   * 获取数据
   */
  getData(): unknown[] {
    return [...this.data]
  }

  /**
   * 设置数据
   */
  setData(data: unknown[]): void {
    this.data = data
    this.option.data = data
  }

  /**
   * 销毁系列
   */
  dispose(): void {
    this.removeAllListeners()
    this.data = []
    this.coordinate = null
  }
}