/**
 * 基础图表预设
 * 包含最常用的图表类型，方便快速开始
 * 
 * @example
 * ```ts
 * import { use } from '@ldesign/chart-core'
 * import { basicCharts } from '@ldesign/chart-core/presets/basic'
 * 
 * // 注册所有基础图表类型
 * use(basicCharts)
 * ```
 */

import { LineSeriesNew } from '../series/line'
import { BarSeriesNew } from '../series/bar'
import type { RegisterableSeries } from '../core/registry'

/**
 * 基础图表类型集合
 */
export const basicCharts: RegisterableSeries[] = [
  LineSeriesNew,
  BarSeriesNew,
  // 后续可以添加更多：
  // PieSeriesNew,
  // ScatterSeriesNew,
  // AreaSeriesNew,
]

/**
 * 导出各个系列以便单独使用
 */
export { LineSeriesNew, BarSeriesNew }
