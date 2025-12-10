<script setup lang="ts">
import { ref, computed } from 'vue'
import ChartExample from '@/components/ChartExample.vue'
import type { ChartOptions } from '@ldesign/chart-core'

const props = defineProps<{ useMode: 'native' | 'vue'; rendererType: 'canvas' | 'svg'; isDark: boolean }>()

const pieData = [
  { name: '搜索引擎', value: 1048 },
  { name: '直接访问', value: 735 },
  { name: '邮件营销', value: 580 },
  { name: '联盟广告', value: 484 },
  { name: '视频广告', value: 300 }
]

const examples = ref([
  {
    id: 'basic', title: '基础饼图',
    options: { series: [{ type: 'pie', data: [...pieData], radius: 0.7 }], animationType: 'grow' } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

const chart = new Chart('#container', {
  series: [{
    type: 'pie',
    data: [
      { name: '搜索引擎', value: 1048 },
      { name: '直接访问', value: 735 },
      { name: '邮件营销', value: 580 },
      { name: '联盟广告', value: 484 },
      { name: '视频广告', value: 300 }
    ],
    radius: 0.7  // 半径为容器的 70%
  }],
  animationType: 'grow'
})`,
    vueCode: `<template>
  <LChart :options="chartOptions" />
</template>

<script setup>
import { LChart } from '@ldesign/chart-vue'

const chartOptions = {
  series: [{
    type: 'pie',
    data: [
      { name: '搜索引擎', value: 1048 },
      { name: '直接访问', value: 735 },
      { name: '邮件营销', value: 580 },
      { name: '联盟广告', value: 484 },
      { name: '视频广告', value: 300 }
    ],
    radius: 0.7
  }]
}
<\/script>`,
  },
  {
    id: 'doughnut', title: '环形图',
    options: { series: [{ type: 'pie', data: [...pieData], radius: [0.5, 0.8] }], animationType: 'grow' } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

// 环形图 - radius: [内半径, 外半径]
const chart = new Chart('#container', {
  series: [{
    type: 'pie',
    data: pieData,
    radius: [0.5, 0.8]  // [内半径, 外半径]
  }]
})`,
    vueCode: `<template>
  <LChart :options="chartOptions" />
</template>

<script setup>
import { LChart } from '@ldesign/chart-vue'

// 环形图 - radius: [0.5, 0.8]
const chartOptions = {
  series: [{
    type: 'pie',
    data: pieData,
    radius: [0.5, 0.8]  // 设置内外半径创建环形
  }]
}
<\/script>`,
  },
  {
    id: 'rose', title: '南丁格尔玫瑰图',
    options: { series: [{ type: 'pie', data: [...pieData], radius: [0.2, 0.8], roseType: 'radius' }], animationType: 'grow' } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

// 南丁格尔玫瑰图 - roseType: 'radius'
const chart = new Chart('#container', {
  series: [{
    type: 'pie',
    data: pieData,
    radius: [0.2, 0.8],
    roseType: 'radius'  // 'radius' | 'area'
  }]
})`,
    vueCode: `<template>
  <LChart :options="chartOptions" />
</template>

<script setup>
import { LChart } from '@ldesign/chart-vue'

// 南丁格尔玫瑰图
const chartOptions = {
  series: [{
    type: 'pie',
    data: pieData,
    radius: [0.2, 0.8],
    roseType: 'radius'  // 玫瑰图类型
  }]
}
<\/script>`,
  },
  {
    id: 'label', title: '带标签饼图',
    options: { series: [{ type: 'pie', data: [...pieData], radius: 0.6, label: { show: true, position: 'outside' } }], animationType: 'grow' } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

// 带标签饼图
const chart = new Chart('#container', {
  series: [{
    type: 'pie',
    data: pieData,
    radius: 0.6,
    label: {
      show: true,
      position: 'outside'  // 'outside' | 'inside' | 'center'
    }
  }]
})`,
    vueCode: `<template>
  <LChart :options="chartOptions" />
</template>

<script setup>
import { LChart } from '@ldesign/chart-vue'

// 带标签饼图 - label.position
const chartOptions = {
  series: [{
    type: 'pie',
    data: pieData,
    radius: 0.6,
    label: {
      show: true,
      position: 'outside'  // 标签位置
    }
  }]
}
<\/script>`,
  },
])

const exampleCount = computed(() => examples.value.length)

function refreshExample(index: number) {
  const e = examples.value[index]
  const s = e?.options.series?.[0] as any
  if (s?.data) {
    e.options = {
      ...e.options,
      series: [{
        ...s,
        data: s.data.map((d: any) => ({ ...d, value: Math.floor(Math.random() * 1000) + 100 }))
      }]
    }
  }
}

defineExpose({ exampleCount })
</script>

<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">饼图示例</h2>
      <span class="example-count">{{ exampleCount }} 个示例</span>
    </div>
    <div class="examples-grid">
      <ChartExample 
        v-for="(e, i) in examples" 
        :key="e.id + '-' + i" 
        :title="e.title" 
        :options="e.options"
        :native-code="e.nativeCode" 
        :vue-code="e.vueCode" 
        :use-mode="props.useMode" 
        :renderer-type="props.rendererType"
        :is-dark="props.isDark"
        :animation-types="['grow', 'fade', 'scale', 'none']"
        @refresh="refreshExample(i)"
      />
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.page-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}
</style>
