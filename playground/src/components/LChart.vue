<script setup lang="ts">
import { ref, shallowRef, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Chart } from '@ldesign/chart-core'
import type { ChartOptions } from '@ldesign/chart-core'

const props = defineProps<{ options: ChartOptions }>()

const chartRef = ref<HTMLDivElement>()
const chartInstance = shallowRef<Chart | null>(null)

async function initChart() {
  if (!chartRef.value) return
  
  // 销毁旧实例
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
  
  // 等待 DOM 更新
  await nextTick()
  
  // 确保容器有尺寸
  if (chartRef.value.clientWidth === 0 || chartRef.value.clientHeight === 0) {
    return
  }
  
  chartInstance.value = new Chart(chartRef.value, props.options)
}

watch(() => props.options, () => initChart(), { deep: true })

onMounted(() => {
  // 延迟初始化，确保容器尺寸正确
  setTimeout(initChart, 0)
})

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
})

defineExpose({ getInstance: () => chartInstance.value, refresh: initChart })
</script>

<template>
  <div ref="chartRef" style="width:100%;height:100%"></div>
</template>
