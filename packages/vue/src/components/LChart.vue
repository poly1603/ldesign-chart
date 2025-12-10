<template>
  <div 
    ref="containerRef" 
    class="l-chart"
    :style="containerStyle"
  />
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useChart, type ChartOption } from '../composables/useChart'

/**
 * LChart 组件属性
 */
export interface LChartProps {
  /** 图表配置 (支持 option 或 options) */
  option?: ChartOption
  options?: ChartOption
  /** 主题名称 */
  theme?: string
  /** 宽度 */
  width?: number | string
  /** 高度 */
  height?: number | string
  /** 自动调整大小 */
  autoResize?: boolean
}

const props = withDefaults(defineProps<LChartProps>(), {
  theme: 'light',
  width: '100%',
  height: '100%',
  autoResize: true
})

// 兼容 option 和 options 两种写法
const chartOption = computed(() => props.options || props.option || {})

/**
 * 容器样式
 */
const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))

/**
 * 使用 useChart composable
 */
const { containerRef, chartInstance, resize, dispose, refresh } = useChart({
  option: chartOption,
  theme: toRef(props, 'theme'),
  autoResize: props.autoResize
})

/**
 * 暴露方法给父组件
 */
defineExpose({
  chartInstance,
  resize,
  dispose,
  refresh
})
</script>

<style scoped>
.l-chart {
  position: relative;
  overflow: hidden;
}
</style>