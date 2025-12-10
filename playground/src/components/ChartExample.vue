<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Chart } from '@ldesign/chart-core'
import type { ChartOptions } from '@ldesign/chart-core'
import LChart from './LChart.vue'
import CodeModal from './CodeModal.vue'

const props = defineProps<{
  title: string
  options: ChartOptions
  nativeCode: string
  vueCode: string
  useMode: 'native' | 'vue'
  rendererType: 'canvas' | 'svg'
  isDark: boolean
  animationTypes?: string[]
}>()

const emit = defineEmits<{ (e: 'refresh'): void; (e: 'animationChange', type: string): void }>()

const showCodeModal = ref(false)
const selectedAnimation = ref(props.options.animationType || 'grow')
const nativeChartRef = ref<HTMLDivElement>()
const vueChartRef = ref<InstanceType<typeof LChart>>()
const chartInstance = shallowRef<Chart | null>(null)

const defaultAnimations = ['grow', 'wave', 'draw', 'rise', 'expand', 'fade', 'none']
const animations = computed(() => props.animationTypes || defaultAnimations)

const mergedOptions = computed<ChartOptions>(() => ({
  ...props.options,
  theme: props.isDark ? 'dark' : 'light',
  renderer: props.rendererType,
  animationType: selectedAnimation.value,
}))

const currentCode = computed(() => props.useMode === 'vue' ? props.vueCode : props.nativeCode)

async function initNativeChart() {
  if (!nativeChartRef.value || props.useMode !== 'native') return
  
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
  
  await nextTick()
  if (nativeChartRef.value.clientWidth === 0) return
  
  chartInstance.value = new Chart(nativeChartRef.value, mergedOptions.value)
}

function disposeNativeChart() {
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
}

function refresh() {
  if (props.useMode === 'native') {
    initNativeChart()
  } else {
    vueChartRef.value?.refresh()
  }
}

function onAnimationChange() {
  emit('animationChange', selectedAnimation.value)
  refresh()
}

watch(() => props.useMode, async (mode) => {
  if (mode === 'native') {
    await nextTick()
    initNativeChart()
  } else {
    disposeNativeChart()
  }
})

watch(() => [props.rendererType, props.isDark, props.options], () => {
  if (props.useMode === 'native') initNativeChart()
}, { deep: true })

onMounted(() => {
  if (props.useMode === 'native') setTimeout(initNativeChart, 0)
})

onUnmounted(() => disposeNativeChart())
</script>

<template>
  <div class="chart-card">
    <div class="chart-header">
      <div class="chart-title-row">
        <h3 class="chart-title">{{ title }}</h3>
        <div class="chart-tags">
          <span :class="['tag', useMode === 'vue' ? 'tag-vue' : 'tag-native']">
            {{ useMode === 'vue' ? 'Vue' : 'JS' }}
          </span>
          <span :class="['tag', rendererType === 'svg' ? 'tag-svg' : 'tag-canvas']">
            {{ rendererType.toUpperCase() }}
          </span>
        </div>
      </div>
      <div class="chart-actions">
        <select v-if="animationTypes" v-model="selectedAnimation" class="animation-select" @change="onAnimationChange" title="动画类型">
          <option v-for="anim in animations" :key="anim" :value="anim">{{ anim }}</option>
        </select>
        <button class="chart-action-btn" @click="refresh" title="刷新">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
        <button class="chart-action-btn" @click="showCodeModal = true" title="查看代码">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="chart-container">
      <div v-show="useMode === 'native'" ref="nativeChartRef" style="width:100%;height:100%"></div>
      <LChart v-if="useMode === 'vue'" ref="vueChartRef" :options="mergedOptions" style="width:100%;height:100%"/>
    </div>
    
    <CodeModal
      :visible="showCodeModal"
      :title="title"
      :code="currentCode"
      :language="useMode === 'vue' ? 'vue' : 'javascript'"
      @close="showCodeModal = false"
    />
  </div>
</template>

<style scoped>
.chart-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
