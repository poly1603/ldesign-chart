/**
 * 时间比例尺
 */

import type { IScale, TimeScaleOptions } from './interface'

/**
 * 时间间隔类型
 */
type TimeInterval = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'

/**
 * 时间间隔配置
 */
interface TimeIntervalConfig {
  interval: TimeInterval
  step: number
  format: (date: Date) => string
}

/**
 * 时间间隔定义（毫秒）
 */
const TIME_INTERVALS: Record<TimeInterval, number> = {
  second: 1000,
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
}

/**
 * 时间比例尺类
 */
export class TimeScale implements IScale<number | Date, number> {
  private domain: [number, number] = [0, 1]
  private range: [number, number] = [0, 1]
  private clamp: boolean = false

  constructor(options?: TimeScaleOptions) {
    if (options) {
      this.setDomain(options.domain)
      this.setRange(options.range)
      this.clamp = options.clamp ?? false
      if (options.nice) {
        this.nice()
      }
    }
  }

  /**
   * 将时间值映射到视觉范围
   */
  map(value: number | Date): number {
    const timestamp = this.toTimestamp(value)
    const [d0, d1] = this.domain
    const [r0, r1] = this.range

    let t = (timestamp - d0) / (d1 - d0 || 1)

    if (this.clamp) {
      t = Math.max(0, Math.min(1, t))
    }

    return r0 + t * (r1 - r0)
  }

  /**
   * 将视觉位置反向映射到时间值
   */
  invert(pixel: number): number {
    const [d0, d1] = this.domain
    const [r0, r1] = this.range

    let t = (pixel - r0) / (r1 - r0 || 1)

    if (this.clamp) {
      t = Math.max(0, Math.min(1, t))
    }

    return d0 + t * (d1 - d0)
  }

  /**
   * 反向映射为 Date 对象
   */
  invertDate(pixel: number): Date {
    return new Date(this.invert(pixel))
  }

  /**
   * 获取数据域
   */
  getDomain(): number[] {
    return [...this.domain]
  }

  /**
   * 设置数据域
   */
  setDomain(domain: (number | Date)[]): this {
    if (domain.length >= 2) {
      this.domain = [
        this.toTimestamp(domain[0]!),
        this.toTimestamp(domain[1]!),
      ]
    }
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
    if (range.length >= 2) {
      this.range = [range[0]!, range[1]!]
    }
    return this
  }

  /**
   * 获取刻度值
   */
  getTicks(count: number = 10): number[] {
    const [d0, d1] = this.domain
    const span = d1 - d0

    // 选择合适的时间间隔
    const intervalConfig = this.selectInterval(span, count)
    const ticks: number[] = []

    // 对齐到间隔起点
    const start = this.floorToInterval(new Date(d0), intervalConfig)
    let current = start.getTime()

    while (current <= d1) {
      if (current >= d0) {
        ticks.push(current)
      }
      current = this.addInterval(new Date(current), intervalConfig).getTime()
    }

    return ticks
  }

  /**
   * 获取格式化后的刻度
   */
  getTicksFormatted(count: number = 10): Array<{ value: number; label: string }> {
    const [d0, d1] = this.domain
    const span = d1 - d0
    const intervalConfig = this.selectInterval(span, count)

    return this.getTicks(count).map(tick => ({
      value: tick,
      label: intervalConfig.format(new Date(tick)),
    }))
  }

  /**
   * 优化刻度范围
   */
  nice(): this {
    const [d0, d1] = this.domain
    const span = d1 - d0
    const intervalConfig = this.selectInterval(span, 10)

    const start = this.floorToInterval(new Date(d0), intervalConfig)
    const end = this.ceilToInterval(new Date(d1), intervalConfig)

    this.domain = [start.getTime(), end.getTime()]
    return this
  }

  /**
   * 克隆比例尺
   */
  clone(): TimeScale {
    const scale = new TimeScale()
    scale.domain = [...this.domain]
    scale.range = [...this.range]
    scale.clamp = this.clamp
    return scale
  }

  /**
   * 转换为时间戳
   */
  private toTimestamp(value: number | Date): number {
    return value instanceof Date ? value.getTime() : value
  }

  /**
   * 选择合适的时间间隔
   */
  private selectInterval(span: number, targetCount: number): TimeIntervalConfig {
    const idealStep = span / targetCount

    // 候选间隔（从小到大）
    const candidates: Array<{ interval: TimeInterval; step: number; ms: number }> = [
      { interval: 'second', step: 1, ms: TIME_INTERVALS.second },
      { interval: 'second', step: 5, ms: TIME_INTERVALS.second * 5 },
      { interval: 'second', step: 15, ms: TIME_INTERVALS.second * 15 },
      { interval: 'second', step: 30, ms: TIME_INTERVALS.second * 30 },
      { interval: 'minute', step: 1, ms: TIME_INTERVALS.minute },
      { interval: 'minute', step: 5, ms: TIME_INTERVALS.minute * 5 },
      { interval: 'minute', step: 15, ms: TIME_INTERVALS.minute * 15 },
      { interval: 'minute', step: 30, ms: TIME_INTERVALS.minute * 30 },
      { interval: 'hour', step: 1, ms: TIME_INTERVALS.hour },
      { interval: 'hour', step: 3, ms: TIME_INTERVALS.hour * 3 },
      { interval: 'hour', step: 6, ms: TIME_INTERVALS.hour * 6 },
      { interval: 'hour', step: 12, ms: TIME_INTERVALS.hour * 12 },
      { interval: 'day', step: 1, ms: TIME_INTERVALS.day },
      { interval: 'day', step: 2, ms: TIME_INTERVALS.day * 2 },
      { interval: 'week', step: 1, ms: TIME_INTERVALS.week },
      { interval: 'month', step: 1, ms: TIME_INTERVALS.month },
      { interval: 'month', step: 3, ms: TIME_INTERVALS.month * 3 },
      { interval: 'month', step: 6, ms: TIME_INTERVALS.month * 6 },
      { interval: 'year', step: 1, ms: TIME_INTERVALS.year },
      { interval: 'year', step: 5, ms: TIME_INTERVALS.year * 5 },
      { interval: 'year', step: 10, ms: TIME_INTERVALS.year * 10 },
    ]

    // 找到最接近的间隔
    let best = candidates[0]!
    for (const candidate of candidates) {
      if (candidate.ms <= idealStep) {
        best = candidate
      } else {
        break
      }
    }

    return {
      interval: best.interval,
      step: best.step,
      format: this.getFormatter(best.interval),
    }
  }

  /**
   * 获取格式化器
   */
  private getFormatter(interval: TimeInterval): (date: Date) => string {
    switch (interval) {
      case 'second':
        return (d) => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
      case 'minute':
        return (d) => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
      case 'hour':
        return (d) => `${d.getHours().toString().padStart(2, '0')}:00`
      case 'day':
        return (d) => `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
      case 'week':
        return (d) => `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
      case 'month':
        return (d) => `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
      case 'year':
        return (d) => `${d.getFullYear()}`
      default:
        return (d) => d.toISOString()
    }
  }

  /**
   * 向下取整到间隔
   */
  private floorToInterval(date: Date, config: TimeIntervalConfig): Date {
    const result = new Date(date)

    switch (config.interval) {
      case 'second':
        result.setMilliseconds(0)
        result.setSeconds(Math.floor(result.getSeconds() / config.step) * config.step)
        break
      case 'minute':
        result.setMilliseconds(0)
        result.setSeconds(0)
        result.setMinutes(Math.floor(result.getMinutes() / config.step) * config.step)
        break
      case 'hour':
        result.setMilliseconds(0)
        result.setSeconds(0)
        result.setMinutes(0)
        result.setHours(Math.floor(result.getHours() / config.step) * config.step)
        break
      case 'day':
        result.setMilliseconds(0)
        result.setSeconds(0)
        result.setMinutes(0)
        result.setHours(0)
        break
      case 'week':
        result.setMilliseconds(0)
        result.setSeconds(0)
        result.setMinutes(0)
        result.setHours(0)
        result.setDate(result.getDate() - result.getDay())
        break
      case 'month':
        result.setMilliseconds(0)
        result.setSeconds(0)
        result.setMinutes(0)
        result.setHours(0)
        result.setDate(1)
        result.setMonth(Math.floor(result.getMonth() / config.step) * config.step)
        break
      case 'year':
        result.setMilliseconds(0)
        result.setSeconds(0)
        result.setMinutes(0)
        result.setHours(0)
        result.setDate(1)
        result.setMonth(0)
        result.setFullYear(Math.floor(result.getFullYear() / config.step) * config.step)
        break
    }

    return result
  }

  /**
   * 向上取整到间隔
   */
  private ceilToInterval(date: Date, config: TimeIntervalConfig): Date {
    const floor = this.floorToInterval(date, config)
    if (floor.getTime() === date.getTime()) {
      return floor
    }
    return this.addInterval(floor, config)
  }

  /**
   * 添加间隔
   */
  private addInterval(date: Date, config: TimeIntervalConfig): Date {
    const result = new Date(date)

    switch (config.interval) {
      case 'second':
        result.setSeconds(result.getSeconds() + config.step)
        break
      case 'minute':
        result.setMinutes(result.getMinutes() + config.step)
        break
      case 'hour':
        result.setHours(result.getHours() + config.step)
        break
      case 'day':
        result.setDate(result.getDate() + config.step)
        break
      case 'week':
        result.setDate(result.getDate() + 7 * config.step)
        break
      case 'month':
        result.setMonth(result.getMonth() + config.step)
        break
      case 'year':
        result.setFullYear(result.getFullYear() + config.step)
        break
    }

    return result
  }
}
