<script setup lang="ts">
/**
 * ScatterChart - 散点图组件
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
  /** 点形状 */
  symbol?: 'circle' | 'rect' | 'triangle' | 'diamond'
  /** 点大小 */
  symbolSize?: number
}>(), {
  symbol: 'circle',
  symbolSize: 10,
})

const emit = defineEmits<{
  (e: 'click', params: ChartEventMap['click']): void
  (e: 'rendered', params: ChartEventMap['rendered']): void
}>()

const mergedOptions = computed<ChartOptions>(() => {
  return {
    ...props.options,
    series: props.options?.series?.map(s => ({
      ...s,
      symbol: props.symbol,
      symbolSize: props.symbolSize,
    })),
  }
})
</script>

<template>
  <LChart
    type="scatter"
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
