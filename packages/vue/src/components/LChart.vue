<script setup lang="ts">
/**
 * LChart - 通用图表组件
 */

import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { createChart, type Chart, type ChartOptions, type ChartEventMap } from '@ldesign/chart-core'

// Props 定义
const props = withDefaults(defineProps<{
  /** 图表类型 */
  type?: 'line' | 'bar' | 'pie' | 'scatter'
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
  /** 是否响应式 */
  responsive?: boolean
  /** 自动调整大小 */
  autoresize?: boolean
}>(), {
  responsive: true,
  autoresize: true,
})

// Emits 定义
const emit = defineEmits<{
  (e: 'click', params: ChartEventMap['click']): void
  (e: 'mouseover', params: ChartEventMap['mouseover']): void
  (e: 'mouseout', params: ChartEventMap['mouseout']): void
  (e: 'rendered', params: ChartEventMap['rendered']): void
  (e: 'init', chart: Chart): void
}>()

// Refs
const containerRef = ref<HTMLElement | null>(null)
let chartInstance: Chart | null = null

// 计算样式
const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width || '100%',
  height: typeof props.height === 'number' ? `${props.height}px` : props.height || '400px',
}))

// 合并配置
const mergedOptions = computed<ChartOptions>(() => {
  const opts: ChartOptions = {
    ...props.options,
    responsive: props.responsive,
  }

  if (props.type) opts.type = props.type
  if (props.data) opts.data = props.data
  if (props.title) opts.title = props.title
  if (props.theme) opts.theme = props.theme
  if (props.width) opts.width = props.width
  if (props.height) opts.height = props.height

  return opts
})

// 初始化图表
const initChart = () => {
  if (!containerRef.value) return

  // 销毁旧实例
  disposeChart()

  // 创建新实例
  chartInstance = createChart(containerRef.value, mergedOptions.value)

  // 绑定事件
  chartInstance.on('click', (params) => emit('click', params))
  chartInstance.on('mouseover', (params) => emit('mouseover', params))
  chartInstance.on('mouseout', (params) => emit('mouseout', params))
  chartInstance.on('rendered', (params) => emit('rendered', params))

  emit('init', chartInstance)
}

// 销毁图表
const disposeChart = () => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
}

// 更新配置
const setOption = (options: Partial<ChartOptions>, merge = true) => {
  chartInstance?.setOption(options, merge)
}

// 调整大小
const resize = () => {
  chartInstance?.resize()
}

// 获取实例
const getInstance = () => chartInstance

// 监听数据变化
watch(
  () => props.data,
  (newData) => {
    if (chartInstance && newData) {
      chartInstance.setOption({ data: newData })
    }
  },
  { deep: true }
)

// 监听配置变化
watch(
  () => props.options,
  (newOptions) => {
    if (chartInstance && newOptions) {
      chartInstance.setOption(newOptions)
    }
  },
  { deep: true }
)

// 监听主题变化
watch(
  () => props.theme,
  () => {
    // 主题变化需要重新初始化
    initChart()
  }
)

// 生命周期
onMounted(() => {
  initChart()
})

onBeforeUnmount(() => {
  disposeChart()
})

// 暴露方法
defineExpose({
  setOption,
  resize,
  getInstance,
})
</script>

<template>
  <div ref="containerRef" class="lchart-container" :style="containerStyle" />
</template>

<style scoped>
.lchart-container {
  position: relative;
}
</style>
