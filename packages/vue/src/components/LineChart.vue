<script setup lang="ts">
/**
 * LineChart - 折线图组件
 */

import { computed } from 'vue'
import LChart from './LChart.vue'
import type { ChartOptions, ChartEventMap } from '@ldesign/chart-core'

const props = withDefaults(defineProps<{
  /** 数据 */
  data?: ChartOptions['data']
  /** 完整配置 */
  options?: ChartOptions
  /** 标题 */
  title?: string
  /** 宽度 */
  width?: number | string
  /** 高度 */
  height?: number | string
  /** 主题 */
  theme?: string
  /** 是否平滑曲线 */
  smooth?: boolean
  /** 是否显示区域填充 */
  area?: boolean
  /** 是否显示数据点 */
  showSymbol?: boolean
}>(), {
  smooth: false,
  area: false,
  showSymbol: true,
})

const emit = defineEmits<{
  (e: 'click', params: ChartEventMap['click']): void
  (e: 'rendered', params: ChartEventMap['rendered']): void
}>()

const mergedOptions = computed<ChartOptions>(() => {
  const seriesConfig: Record<string, unknown> = {
    smooth: props.smooth,
    showSymbol: props.showSymbol,
  }

  if (props.area) {
    seriesConfig.areaStyle = { opacity: 0.3 }
  }

  return {
    ...props.options,
    series: props.options?.series?.map(s => ({
      ...s,
      ...seriesConfig,
    })),
  }
})
</script>

<template>
  <LChart
    type="line"
    :data="data"
    :options="mergedOptions"
    :title="title"
    :width="width"
    :height="height"
    :theme="theme"
    @click="emit('click', $event)"
    @rendered="emit('rendered', $event)"
  />
</template>
