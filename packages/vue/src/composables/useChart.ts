/**
 * Vue 3 Chart Composable
 */

import { ref, onMounted, onBeforeUnmount, watch, type Ref } from 'vue'

/**
 * Chart 配置选项
 */
export interface ChartOption {
  series?: Array<{
    type: string
    data: number[]
    [key: string]: any
  }>
  [key: string]: any
}

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
  chartInstance: Ref<any>
  resize: () => void
  dispose: () => void
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
  const chartInstance = ref<any>(null)
  let resizeObserver: ResizeObserver | null = null

  /**
   * 初始化图表
   */
  const initChart = () => {
    if (!containerRef.value) {
      console.warn('[useChart] Container ref is not available')
      return
    }

    // TODO: 使用 @ldesign/chart-core 创建图表实例
    // 当前仅创建占位，实际实现需要等待核心包API确定
    console.log('[useChart] Chart initialized with option:', option.value)
    
    // chartInstance.value = new Chart({
    //   container: containerRef.value,
    //   option: option.value,
    //   theme: theme?.value
    // })
  }

  /**
   * 更新图表配置
   */
  const updateChart = () => {
    if (!chartInstance.value) return
    
    console.log('[useChart] Chart updated with option:', option.value)
    // chartInstance.value.setOption(option.value)
  }

  /**
   * 调整图表大小
   */
  const resize = () => {
    if (!chartInstance.value) return
    
    console.log('[useChart] Chart resized')
    // chartInstance.value.resize()
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
      console.log('[useChart] Chart disposed')
      // chartInstance.value.dispose()
      chartInstance.value = null
    }
  }

  /**
   * 设置自动调整大小
   */
  const setupAutoResize = () => {
    if (!autoResize || !containerRef.value) return

    resizeObserver = new ResizeObserver(() => {
      resize()
    })

    resizeObserver.observe(containerRef.value)
  }

  // 生命周期：挂载后初始化
  onMounted(() => {
    initChart()
    setupAutoResize()
  })

  // 生命周期：卸载前清理
  onBeforeUnmount(() => {
    dispose()
  })

  // 监听配置变化
  watch(
    () => option.value,
    () => {
      updateChart()
    },
    { deep: true }
  )

  // 监听主题变化
  if (theme) {
    watch(
      () => theme.value,
      (newTheme) => {
        if (!chartInstance.value) return
        console.log('[useChart] Theme changed to:', newTheme)
        // chartInstance.value.setTheme(newTheme)
      }
    )
  }

  return {
    containerRef,
    chartInstance,
    resize,
    dispose
  }
}