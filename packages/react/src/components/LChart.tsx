import React, { useMemo, CSSProperties } from 'react'
import { useChart, type ChartOption } from '../hooks/useChart'

/**
 * LChart 组件的 Props
 */
export interface LChartProps {
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
   * 容器宽度
   * @default '100%'
   */
  width?: number | string

  /**
   * 容器高度
   * @default '400px'
   */
  height?: number | string

  /**
   * 是否自动调整大小
   * @default true
   */
  autoResize?: boolean

  /**
   * 自定义类名
   */
  className?: string

  /**
   * 自定义样式
   */
  style?: CSSProperties
}

/**
 * LChart 组件的 Ref
 */
export interface LChartRef {
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
 * LChart - React chart component
 * 
 * @example
 * ```tsx
 * function App() {
 *   const option = {
 *     series: [{ type: 'line', data: [1, 2, 3, 4, 5] }]
 *   }
 *   
 *   return <LChart option={option} theme="default" />
 * }
 * ```
 */
export const LChart = React.forwardRef<LChartRef, LChartProps>((props, ref) => {
  const {
    option,
    theme = 'default',
    width = '100%',
    height = '400px',
    autoResize = true,
    className,
    style
  } = props

  const { containerRef, chartInstance, resize, dispose } = useChart({
    option,
    theme,
    autoResize
  })

  // 暴露方法给父组件
  React.useImperativeHandle(ref, () => ({
    chartInstance,
    resize,
    dispose
  }), [chartInstance, resize, dispose])

  // 容器样式
  const containerStyle = useMemo<CSSProperties>(() => {
    const normalizedWidth = typeof width === 'number' ? `${width}px` : width
    const normalizedHeight = typeof height === 'number' ? `${height}px` : height

    return {
      width: normalizedWidth,
      height: normalizedHeight,
      ...style
    }
  }, [width, height, style])

  return (
    <div
      ref={containerRef}
      className={className ? `l-chart ${className}` : 'l-chart'}
      style={containerStyle}
    />
  )
})

LChart.displayName = 'LChart'