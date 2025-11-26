<script setup lang="ts">
/**
 * PieChart - 饼图组件
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
  /** 是否环形图 */
  donut?: boolean
  /** 内半径（环形图） */
  innerRadius?: string
  /** 外半径 */
  outerRadius?: string
  /** 是否南丁格尔玫瑰图 */
  roseType?: 'radius' | 'area' | false
}>(), {
  donut: false,
  innerRadius: '40%',
  outerRadius: '75%',
  roseType: false,
})

const emit = defineEmits<{
  (e: 'click', params: ChartEventMap['click']): void
  (e: 'rendered', params: ChartEventMap['rendered']): void
}>()

const mergedOptions = computed<ChartOptions>(() => {
  const radius = props.donut
    ? [props.innerRadius, props.outerRadius]
    : ['0%', props.outerRadius]

  return {
    ...props.options,
    series: props.options?.series?.map(s => ({
      ...s,
      radius,
      roseType: props.roseType,
    })) ?? [{
      type: 'pie',
      radius,
      roseType: props.roseType,
    }],
  }
})
</script>

<template>
  <LChart
    type="pie"
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
