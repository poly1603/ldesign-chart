import { createEffect, createSignal, onCleanup, onMount } from 'solid-js'
import type { JSX } from 'solid-js'
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
  onInit?: (chart: ChartCore) => void
  onClick?: (params: any) => void
}

export function Chart(props: ChartProps): JSX.Element {
  const [container, setContainer] = createSignal<HTMLElement>()
  const [chart, setChart] = createSignal<ChartCore>()

  onMount(() => {
    const el = container()
    if (!el) return

    const chartConfig: ChartConfig = {
      type: props.type,
      data: props.data,
      title: props.title,
      theme: props.theme,
      darkMode: props.darkMode,
      responsive: props.responsive,
      ...props.config,
    }

    const chartInstance = createChart(el, chartConfig)

    chartInstance.on('click', (params: any) => {
      props.onClick?.(params)
    })

    setChart(chartInstance)
    props.onInit?.(chartInstance)
  })

  createEffect(() => {
    const chartInstance = chart()
    if (chartInstance) {
      chartInstance.updateData(props.data)
    }
  })

  createEffect(() => {
    const chartInstance = chart()
    if (chartInstance && props.theme) {
      chartInstance.setTheme(props.theme)
    }
  })

  createEffect(() => {
    const chartInstance = chart()
    if (chartInstance && props.darkMode !== undefined) {
      chartInstance.setDarkMode(props.darkMode)
    }
  })

  onCleanup(() => {
    chart()?.dispose()
  })

  return <div ref={setContainer} style={{ width: '100%', height: '100%' }} />
}

export default Chart
