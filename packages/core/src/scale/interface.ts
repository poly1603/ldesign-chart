/**
 * 比例尺接口定义
 */

/**
 * 比例尺基础接口
 */
export interface IScale<Domain = number, Range = number> {
  /**
   * 将数据域的值映射到视觉范围
   * @param value - 数据域的值
   * @returns 视觉范围的值
   */
  map(value: Domain): Range

  /**
   * 将视觉范围的值反向映射到数据域
   * @param pixel - 视觉范围的值
   * @returns 数据域的值
   */
  invert(pixel: Range): Domain

  /**
   * 获取数据域
   */
  getDomain(): Domain[]

  /**
   * 设置数据域
   * @param domain - 数据域
   */
  setDomain(domain: Domain[]): this

  /**
   * 获取视觉范围
   */
  getRange(): Range[]

  /**
   * 设置视觉范围
   * @param range - 视觉范围
   */
  setRange(range: Range[]): this

  /**
   * 获取刻度值
   * @param count - 期望的刻度数量
   */
  getTicks(count?: number): Domain[]

  /**
   * 克隆比例尺
   */
  clone(): IScale<Domain, Range>
}

/**
 * 连续型比例尺配置
 */
export interface ContinuousScaleOptions {
  /** 数据域 */
  domain: number[]
  /** 视觉范围 */
  range: number[]
  /** 是否限制在范围内 */
  clamp?: boolean
  /** 是否友好刻度 */
  nice?: boolean
  /** 刻度数量 */
  tickCount?: number
}

/**
 * 分类比例尺配置
 */
export interface BandScaleOptions {
  /** 数据域 */
  domain: string[]
  /** 视觉范围 */
  range: number[]
  /** 内边距比例 [0, 1] */
  paddingInner?: number
  /** 外边距比例 [0, 1] */
  paddingOuter?: number
  /** 对齐方式 [0, 1] */
  align?: number
}

/**
 * 时间比例尺配置
 */
export interface TimeScaleOptions {
  /** 数据域（时间戳或 Date） */
  domain: (number | Date)[]
  /** 视觉范围 */
  range: number[]
  /** 是否限制在范围内 */
  clamp?: boolean
  /** 是否友好刻度 */
  nice?: boolean
}