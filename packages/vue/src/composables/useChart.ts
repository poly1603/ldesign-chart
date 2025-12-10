/**
 * Vue 3 Chart Composable
 */

import { ref, shallowRef, onMounted, onBeforeUnmount, watch, type Ref } from 'vue'
import { Chart } from '@ldesign/chart-core'
import type { ChartOptions } from '@ldesign/chart-core'

/**
 * Chart 配置选项
 */
export type ChartOption = ChartOptions

/**
 * useChart 配置
 */
export interface UseChartOptions {
  option: Ref<ChartOption>
  theme?: Ref<string | undefined>
  autoResize?: boolean
}

/**
 * useChart 返回值
 */
export interface UseChartReturn {
  containerRef: Ref<HTMLDivElement | null>
  chartInstance: Ref<Chart | null>
  resize: () => void
  dispose: () => void
  refresh: () => void
}

/**
 * Vue 3 Chart Composable
 * 
 * @param options - 配置选项
 * @returns Chart 实例和控制方法
 * 
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue'
 * import { useChart } from '@ldesign/chart-vue'
 * 
 * const option = ref({
 *   series: [{ type: 'line', data: [1, 2, 3, 4, 5] }]
 * })
 * 
 * const { containerRef } = useChart({ option })
 * </script>
 * 
 * <template>
 *   <div ref="containerRef" style="width: 600px; height: 400px"></div>
 * </template>
 * ```
 */
export function useChart(options: UseChartOptions): UseChartReturn {
  const { option, theme, autoResize = true } = options

  const containerRef = ref<HTMLDivElement | null>(null)
  const chartInstance = shallowRef<Chart | null>(null)
  let resizeObserver: ResizeObserver | null = null

  /**
   * 初始化图表
   */
  const initChart = () => {
    if (!containerRef.value) return

    // 销毁旧实例
    if (chartInstance.value) {
      chartInstance.value.dispose()
      chartInstance.value = null
    }

    // 合并主题配置
    const chartOptions: ChartOptions = {
      ...option.value,
      theme: theme?.value === 'dark' ? 'dark' : 'light',
    }

    chartInstance.value = new Chart(containerRef.value, chartOptions)
  }

  /**
   * 更新图表配置
   */
  const updateChart = () => {
    if (!chartInstance.value) {
      initChart()
      return
    }
    chartInstance.value.setOption(option.value)
  }

  /**
   * 调整图表大小
   */
  const resize = () => {
    chartInstance.value?.resize()
  }

  /**
   * 刷新图表
   */
  const refresh = () => {
    initChart()
  }

  /**
   * 销毁图表
   */
  const dispose = () => {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
    if (chartInstance.value) {
      chartInstance.value.dispose()
      chartInstance.value = null
    }
  }

  /**
   * 设置自动调整大小
   */
  const setupAutoResize = () => {
    if (!autoResize || !containerRef.value) return
    resizeObserver = new ResizeObserver(() => resize())
    resizeObserver.observe(containerRef.value)
  }

  onMounted(() => {
    initChart()
    setupAutoResize()
  })

  onBeforeUnmount(() => {
    dispose()
  })

  // 监听配置变化
  watch(() => option.value, updateChart, { deep: true })

  // 监听主题变化
  if (theme) {
    watch(() => theme.value, () => initChart())
  }

  return {
    containerRef,
    chartInstance,
    resize,
    dispose,
    refresh
  }
}