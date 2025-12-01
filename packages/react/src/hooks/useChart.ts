import { useEffect, useRef, useCallback, useMemo } from 'react'
import type { Theme } from '@ldesign/chart-core'

/**
 * Chart配置选项（临时接口，待核心包实现后替换）
 */
export interface ChartOption {
  series?: any[]
  [key: string]: any
}

/**
 * useChart Hook 的选项
 */
export interface UseChartOptions {
  /**
   * 图表配置选项
   */
  option: ChartOption

  /**
   * 主题名称
   * @default 'default'
   */
  theme?: string

  /**
   * 是否自动调整大小
   * @default true
   */
  autoResize?: boolean
}

/**
 * useChart Hook 的返回值
 */
export interface UseChartReturn {
  /**
   * 容器元素的 ref
   */
  containerRef: React.RefObject<HTMLDivElement>

  /**
   * 图表实例
   */
  chartInstance: any | null

  /**
   * 手动调整图表大小
   */
  resize: () => void

  /**
   * 销毁图表实例
   */
  dispose: () => void
}

/**
 * React Hook for creating and managing chart instances
 * 
 * @example
 * ```tsx
 * function MyChart() {
 *   const option = {
 *     series: [{ type: 'line', data: [1, 2, 3, 4, 5] }]
 *   }
 *   
 *   const { containerRef } = useChart({ option })
 *   
 *   return <div ref={containerRef} style={{ width: '100%', height: '400px' }} />
 * }
 * ```
 */
export function useChart(options: UseChartOptions): UseChartReturn {
  const { option, theme = 'default', autoResize = true } = options

  const containerRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<any>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  /**
   * 初始化图表实例
   */
  const initChart = useCallback(() => {
    if (!containerRef.current) return

    // TODO: 当核心包的 Chart 类实现后，替换为实际的初始化代码
    // import { Chart } from '@ldesign/chart-core'
    // chartInstanceRef.current = new Chart(containerRef.current, {
    //   theme,
    //   option
    // })

    // 临时占位实现
    console.log('[useChart] Chart instance initialized with theme:', theme)
    chartInstanceRef.current = {
      setOption: (opt: ChartOption) => {
        console.log('[useChart] Chart option updated:', opt)
      },
      setTheme: (themeName: string) => {
        console.log('[useChart] Chart theme updated:', themeName)
      },
      resize: () => {
        console.log('[useChart] Chart resized')
      },
      dispose: () => {
        console.log('[useChart] Chart disposed')
      }
    }
  }, [theme])

  /**
   * 更新图表配置
   */
  const updateOption = useCallback(() => {
    if (!chartInstanceRef.current) return

    // TODO: 当核心包实现后，使用实际的 setOption 方法
    chartInstanceRef.current.setOption(option)
  }, [option])

  /**
   * 更新主题
   */
  const updateTheme = useCallback(() => {
    if (!chartInstanceRef.current) return

    // TODO: 当核心包实现后，使用实际的 setTheme 方法
    chartInstanceRef.current.setTheme(theme)
  }, [theme])

  /**
   * 手动调整图表大小
   */
  const resize = useCallback(() => {
    if (!chartInstanceRef.current) return
    chartInstanceRef.current.resize()
  }, [])

  /**
   * 销毁图表实例
   */
  const dispose = useCallback(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.dispose()
      chartInstanceRef.current = null
    }

    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect()
      resizeObserverRef.current = null
    }
  }, [])

  /**
   * 初始化 ResizeObserver
   */
  const setupResizeObserver = useCallback(() => {
    if (!autoResize || !containerRef.current) return

    resizeObserverRef.current = new ResizeObserver(() => {
      resize()
    })

    resizeObserverRef.current.observe(containerRef.current)
  }, [autoResize, resize])

  /**
   * 组件挂载时初始化图表
   */
  useEffect(() => {
    initChart()
    setupResizeObserver()

    return () => {
      dispose()
    }
  }, []) // 仅在挂载时执行一次

  /**
   * 监听 option 变化并更新图表
   */
  useEffect(() => {
    updateOption()
  }, [option, updateOption])

  /**
   * 监听 theme 变化并更新图表
   */
  useEffect(() => {
    updateTheme()
  }, [theme, updateTheme])

  return {
    containerRef,
    chartInstance: chartInstanceRef.current,
    resize,
    dispose
  }
}