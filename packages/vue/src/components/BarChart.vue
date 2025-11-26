<script setup lang="ts">
/**
 * BarChart - 柱状图组件
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
  /** 柱宽度 */
  barWidth?: number | string
  /** 圆角 */
  borderRadius?: number
  /** 是否横向 */
  horizontal?: boolean
}>(), {
  barWidth: '60%',
  borderRadius: 0,
  horizontal: false,
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
      barWidth: props.barWidth,
      borderRadius: props.borderRadius,
    })),
  }
})
</script>

<template>
  <LChart
    type="bar"
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
