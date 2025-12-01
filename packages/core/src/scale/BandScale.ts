/**
 * 分类比例尺
 * 用于分类数据的映射，如柱状图的类别轴
 */

import type { IScale, BandScaleOptions } from './interface'

/**
 * 分类比例尺类
 */
export class BandScale implements IScale<string, number> {
  private domain: string[] = []
  private range: number[] = [0, 1]
  private paddingInner = 0
  private paddingOuter = 0
  private align = 0.5
  private bandwidth = 0
  private step = 0

  constructor(options: BandScaleOptions) {
    this.setDomain(options.domain)
    this.setRange(options.range)

    if (options.paddingInner !== undefined) {
      this.paddingInner = Math.max(0, Math.min(1, options.paddingInner))
    }

    if (options.paddingOuter !== undefined) {
      this.paddingOuter = Math.max(0, Math.min(1, options.paddingOuter))
    }

    if (options.align !== undefined) {
      this.align = Math.max(0, Math.min(1, options.align))
    }

    this.rescale()
  }

  /**
   * 将类别映射到视觉范围的起始位置
   */
  map(value: string): number {
    const index = this.domain.indexOf(value)
    if (index === -1) {
      return NaN
    }

    const start = this.range[0]!
    return start + index * this.step + this.paddingOuter * this.step
  }

  /**
   * 反向映射（从像素位置查找最近的类别）
   */
  invert(pixel: number): string {
    const start = this.range[0]!
    const offset = pixel - start - this.paddingOuter * this.step
    const index = Math.floor(offset / this.step)

    if (index >= 0 && index < this.domain.length) {
      return this.domain[index]!
    }

    return ''
  }

  /**
   * 获取数据域
   */
  getDomain(): string[] {
    return [...this.domain]
  }

  /**
   * 设置数据域
   */
  setDomain(domain: string[]): this {
    this.domain = [...domain]
    this.rescale()
    return this
  }

  /**
   * 获取视觉范围
   */
  getRange(): number[] {
    return [...this.range]
  }

  /**
   * 设置视觉范围
   */
  setRange(range: number[]): this {
    if (range.length < 2) {
      throw new Error('Range must have at least 2 values')
    }
    this.range = [range[0]!, range[range.length - 1]!]
    this.rescale()
    return this
  }

  /**
   * 获取刻度值（返回所有类别）
   */
  getTicks(): string[] {
    return this.getDomain()
  }

  /**
   * 获取带宽（每个类别的宽度）
   */
  getBandwidth(): number {
    return this.bandwidth
  }

  /**
   * 获取步长（类别之间的间距）
   */
  getStep(): number {
    return this.step
  }

  /**
   * 设置内边距
   */
  setPaddingInner(padding: number): this {
    this.paddingInner = Math.max(0, Math.min(1, padding))
    this.rescale()
    return this
  }

  /**
   * 设置外边距
   */
  setPaddingOuter(padding: number): this {
    this.paddingOuter = Math.max(0, Math.min(1, padding))
    this.rescale()
    return this
  }

  /**
   * 设置对齐方式
   */
  setAlign(align: number): this {
    this.align = Math.max(0, Math.min(1, align))
    this.rescale()
    return this
  }

  /**
   * 重新计算步长和带宽
   */
  private rescale(): void {
    const n = this.domain.length
    if (n === 0) {
      this.step = 0
      this.bandwidth = 0
      return
    }

    const start = this.range[0]!
    const stop = this.range[1]!
    const rangeSize = Math.abs(stop - start)

    // 计算步长
    const paddingCount = this.paddingInner * (n - 1) + this.paddingOuter * 2
    this.step = rangeSize / Math.max(1, n + paddingCount)

    // 计算带宽
    this.bandwidth = this.step * (1 - this.paddingInner)

    // 应用对齐
    const offset = (rangeSize - n * this.step + this.step * this.paddingInner) * this.align
    if (start < stop) {
      this.range[0] = start + offset
    } else {
      this.range[0] = start - offset
    }
  }

  /**
   * 克隆比例尺
   */
  clone(): BandScale {
    return new BandScale({
      domain: this.domain,
      range: this.range,
      paddingInner: this.paddingInner,
      paddingOuter: this.paddingOuter,
      align: this.align,
    })
  }
}