/**
 * @ldesign/chart-core - 企业级图表核心库
 * 框架无关的核心功能
 */

// 导出引擎相关
export * from './engines'
export { engineFactory } from './engines/engine-factory'

// 导出核心类
export { Chart } from './core/chart'
export { ChartInstanceManager, instanceManager } from './core/instance-manager'

// 导出类型
export * from './types'

// 导出工具
export { DataParser } from './utils/data-parser'
export { validateConfig, isValidChartType } from './utils/validators'
export * from './utils/helpers'

// 导出主题
export * from './themes'

// 导出内存管理
export { chartCache, ChartCache } from './memory/cache'
export { ObjectPool, arrayPool, poolFactory } from './memory/pool'
export { cleanupManager, CleanupManager } from './memory/cleanup'

// 导出性能优化
export { VirtualRenderer } from './performance/virtual-render'
export { DataChunker, DataPipeline } from './performance/data-chunk'
export { ChartWorker, WorkerPool } from './performance/web-worker'

// 导出加载器
export { echartsLoader, EChartsLoader } from './loader/echarts-loader'
export { chartLoader, ChartLoader } from './loader/chart-loader'

// 导出配置生成器
export { SmartConfigGenerator } from './config/smart-config'
export { AIConfigGenerator, aiConfigGenerator } from './config/ai-config-generator'

// 导出数据解析器
export { CSVParser, csvParser } from './utils/parsers/csv-parser'

// 导出数据验证器
export { SchemaValidator, schemaValidator, chartDataSchema, chartConfigSchema } from './utils/validators/schema-validator'
export type { Schema, SchemaProperty, ValidationResult, ValidationError } from './utils/validators/schema-validator'

// 导出实时数据流
export { DataStreamManager, createChartStream, mergeStreamData } from './utils/data-stream'
export type { StreamOptions, StreamEvent, StreamCallback } from './utils/data-stream'

// 导出导出工具
export { ChartExporter, chartExporter } from './utils/export'
export type { ExportImageOptions, ExportPDFOptions, ExportDataOptions } from './utils/export'

// 导出交互功能
export { ChartSyncManager, chartSyncManager, connectCharts, connectMultipleCharts } from './interaction/chart-sync'
export type { SyncOptions, ChartSyncItem } from './interaction/chart-sync'

export { GestureHandler, enableGestures } from './interaction/gesture-handler'
export type { GestureOptions, GestureEvent, GestureCallback } from './interaction/gesture-handler'

/**
 * 创建图表实例（便捷方法）
 */
import { Chart } from './core/chart'
import { instanceManager } from './core/instance-manager'
import { chartCache } from './memory/cache'
import { echartsLoader } from './loader/echarts-loader'
import { chartLoader } from './loader/chart-loader'
import type { ChartConfig } from './types'

export function createChart(
  container: HTMLElement | string,
  config: ChartConfig
): Chart {
  const element =
    typeof container === 'string'
      ? document.querySelector(container) as HTMLElement
      : container

  if (!element) {
    throw new Error('Container element not found')
  }

  return new Chart(element, config)
}

/**
 * 默认导出
 */
export default {
  Chart,
  createChart,
  instanceManager,
  chartCache,
  echartsLoader,
  chartLoader,
}


