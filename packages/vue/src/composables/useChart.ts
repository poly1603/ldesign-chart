/**
 * useChart - 图表 Composable
 */

import { ref, shallowRef, onMounted, onBeforeUnmount, watch, type Ref } from 'vue'
import { createChart, type Chart, type ChartOptions } from '@ldesign/chart-core'

export interface UseChartOptions {
  /** 初始配置 */
  options?: ChartOptions
  /** 是否自动渲染 */
  autoRender?: boolean
}

export interface UseChartReturn {
  /** 容器引用 */
  containerRef: Ref<HTMLElement | null>
  /** 图表实例 */
  chartInstance: Ref<Chart | null>
  /** 设置配置 */
  setOption: (options: Partial<ChartOptions>, merge?: boolean) => void
  /** 调整大小 */
  resize: () => void
  /** 重新渲染 */
  render: () => void
}

/**
 * 图表 Composable
 */
export function useChart(options: UseChartOptions = {}): UseChartReturn {
  const containerRef = ref<HTMLElement | null>(null)
  const chartInstance = shallowRef<Chart | null>(null)

  const initChart = () => {
    if (!containerRef.value) return

    // 销毁旧实例
    if (chartInstance.value) {
      chartInstance.value.dispose()
    }

    // 创建新实例
    chartInstance.value = createChart(containerRef.value, options.options)
  }

  const setOption = (newOptions: Partial<ChartOptions>, merge: boolean = true) => {
    chartInstance.value?.setOption(newOptions, merge)
  }

  const resize = () => {
    chartInstance.value?.resize()
  }

  const render = () => {
    chartInstance.value?.render()
  }

  onMounted(() => {
    initChart()
  })

  onBeforeUnmount(() => {
    chartInstance.value?.dispose()
    chartInstance.value = null
  })

  return {
    containerRef,
    chartInstance,
    setOption,
    resize,
    render,
  }
}
