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
  /** 图表配置 */
  option: ChartOption
  /** 主题名称或主题对象 */
  theme?: string
  /** 宽度 */
  width?: number | string
  /** 高度 */
  height?: number | string
  /** 自动调整大小 */
  autoResize?: boolean
}

const props = withDefaults(defineProps<LChartProps>(), {
  theme: 'default',
  width: '100%',
  height: '400px',
  autoResize: true
})

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
const { containerRef, chartInstance, resize, dispose } = useChart({
  option: toRef(props, 'option'),
  theme: toRef(props, 'theme'),
  autoResize: props.autoResize
})

/**
 * 暴露方法给父组件
 */
defineExpose({
  chartInstance,
  resize,
  dispose
})
</script>

<style scoped>
.l-chart {
  position: relative;
  overflow: hidden;
}
</style>