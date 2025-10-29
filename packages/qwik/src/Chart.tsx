import { component$, useSignal, useVisibleTask$, useOnDocument, $ } from '@builder.io/qwik'
import type { QwikIntrinsicElements, PropFunction } from '@builder.io/qwik'
import type { Chart as ChartCore, ChartConfig, ChartData } from '@ldesign/chart-core'
import { createChart } from '@ldesign/chart-core'

export interface ChartProps {
  type: ChartConfig['type']
  data: ChartData
  title?: string
  theme?: string
  darkMode?: boolean
  responsive?: boolean
  config?: Partial<ChartConfig>
  onInit$?: PropFunction<(chart: ChartCore) => void>
  onClick$?: PropFunction<(params: any) => void>
}

export const Chart = component$<ChartProps>((props) => {
  const containerRef = useSignal<HTMLElement>()
  const chartRef = useSignal<ChartCore>()

  useVisibleTask$(({ track }) => {
    track(() => props.data)
    
    const container = containerRef.value
    if (!container) return

    if (!chartRef.value) {
      const chartConfig: ChartConfig = {
        type: props.type,
        data: props.data,
        title: props.title,
        theme: props.theme,
        darkMode: props.darkMode,
        responsive: props.responsive,
        ...props.config,
      }

      const chart = createChart(container, chartConfig)

      chart.on('click', (params: any) => {
        props.onClick$?.(params)
      })

      chartRef.value = chart
      props.onInit$?.(chart)
    } else {
      chartRef.value.updateData(props.data)
    }

    return () => {
      chartRef.value?.dispose()
    }
  })

  useVisibleTask$(({ track }) => {
    track(() => props.theme)
    
    if (chartRef.value && props.theme) {
      chartRef.value.setTheme(props.theme)
    }
  })

  useVisibleTask$(({ track }) => {
    track(() => props.darkMode)
    
    if (chartRef.value && props.darkMode !== undefined) {
      chartRef.value.setDarkMode(props.darkMode)
    }
  })

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
})

export default Chart
