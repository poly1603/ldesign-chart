<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import type { Chart as ChartCore, ChartConfig, ChartData } from '@ldesign/chart-core'
  import { createChart } from '@ldesign/chart-core'

  export let type: ChartConfig['type']
  export let data: ChartData
  export let title: string | undefined = undefined
  export let theme: string | undefined = undefined
  export let darkMode: boolean | undefined = undefined
  export let responsive: boolean | undefined = undefined
  export let config: Partial<ChartConfig> | undefined = undefined

  const dispatch = createEventDispatcher<{
    init: ChartCore
    click: any
  }>()

  let container: HTMLElement
  let chart: ChartCore | undefined

  onMount(() => {
    if (container) {
      const chartConfig: ChartConfig = {
        type,
        data,
        title,
        theme,
        darkMode,
        responsive,
        ...config,
      }

      chart = createChart(container, chartConfig)

      chart.on('click', (params: any) => {
        dispatch('click', params)
      })

      dispatch('init', chart)
    }
  })

  onDestroy(() => {
    chart?.dispose()
  })

  export function getChart(): ChartCore | undefined {
    return chart
  }

  export function resize(): void {
    chart?.resize()
  }

  $: if (chart && data) {
    chart.updateData(data)
  }

  $: if (chart && theme) {
    chart.setTheme(theme)
  }

  $: if (chart && darkMode !== undefined) {
    chart.setDarkMode(darkMode)
  }
</script>

<div bind:this={container} style="width: 100%; height: 100%;"></div>
