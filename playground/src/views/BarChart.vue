<script setup lang="ts">
import { ref, computed } from 'vue'
import ChartExample from '@/components/ChartExample.vue'
import type { ChartOptions } from '@ldesign/chart-core'

const props = defineProps<{ useMode: 'native' | 'vue'; rendererType: 'canvas' | 'svg'; isDark: boolean }>()

const cats = ['类目A', '类目B', '类目C', '类目D', '类目E']
const randomData = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 250 + 50))

const examples = ref([
  {
    id: 'basic', title: '基础柱状图',
    options: { xAxis: { data: cats }, series: [{ type: 'bar', name: '销量', data: [120, 200, 150, 80, 70] }], animationType: 'grow' } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

const chart = new Chart('#container', {
  xAxis: { 
    data: ['类目A', '类目B', '类目C', '类目D', '类目E'] 
  },
  series: [{
    type: 'bar',
    name: '销量',
    data: [120, 200, 150, 80, 70]
  }],
  animationType: 'grow'
})`,
    vueCode: `<template>
  <LChart :options="chartOptions" />
</template>

<script setup>
import { LChart } from '@ldesign/chart-vue'

const chartOptions = {
  xAxis: { data: ['类目A', '类目B', '类目C', '类目D', '类目E'] },
  series: [{
    type: 'bar',
    name: '销量',
    data: [120, 200, 150, 80, 70]
  }]
}
<\/script>`,
  },
  {
    id: 'grouped', title: '分组柱状图',
    options: { xAxis: { data: ['2019','2020','2021','2022','2023'] }, series: [
      { type: 'bar', name: '北京', data: [320, 332, 301, 334, 390], color: '#6366f1' },
      { type: 'bar', name: '上海', data: [220, 182, 191, 234, 290], color: '#10b981' },
      { type: 'bar', name: '深圳', data: [150, 232, 201, 154, 190], color: '#f59e0b' }
    ], animationType: 'grow' } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

// 分组柱状图 - 多系列自动分组
const chart = new Chart('#container', {
  xAxis: { data: ['2019', '2020', '2021', '2022', '2023'] },
  series: [
    { type: 'bar', name: '北京', data: [320, 332, 301, 334, 390], color: '#6366f1' },
    { type: 'bar', name: '上海', data: [220, 182, 191, 234, 290], color: '#10b981' },
    { type: 'bar', name: '深圳', data: [150, 232, 201, 154, 190], color: '#f59e0b' }
  ]
})`,
    vueCode: `<template>
  <LChart :options="chartOptions" />
</template>

<script setup>
import { LChart } from '@ldesign/chart-vue'

// 分组柱状图 - 多系列自动分组显示
const chartOptions = {
  xAxis: { data: ['2019', '2020', '2021', '2022', '2023'] },
  series: [
    { type: 'bar', name: '北京', data: [320, 332, 301, 334, 390], color: '#6366f1' },
    { type: 'bar', name: '上海', data: [220, 182, 191, 234, 290], color: '#10b981' },
    { type: 'bar', name: '深圳', data: [150, 232, 201, 154, 190], color: '#f59e0b' }
  ]
}
<\/script>`,
  },
  {
    id: 'stacked', title: '堆叠柱状图',
    options: { xAxis: { data: ['周一','周二','周三','周四','周五','周六','周日'] }, series: [
      { type: 'bar', name: '直接访问', data: [320, 302, 301, 334, 390, 330, 320], stack: 'total', color: '#6366f1' },
      { type: 'bar', name: '邮件营销', data: [120, 132, 101, 134, 90, 230, 210], stack: 'total', color: '#10b981' },
      { type: 'bar', name: '联盟广告', data: [220, 182, 191, 234, 290, 330, 310], stack: 'total', color: '#f59e0b' }
    ], animationType: 'grow' } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

// 堆叠柱状图 - 使用 stack 属性
const chart = new Chart('#container', {
  xAxis: { data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
  series: [
    { type: 'bar', name: '直接访问', data: [320, 302, 301, 334, 390, 330, 320], stack: 'total', color: '#6366f1' },
    { type: 'bar', name: '邮件营销', data: [120, 132, 101, 134, 90, 230, 210], stack: 'total', color: '#10b981' },
    { type: 'bar', name: '联盟广告', data: [220, 182, 191, 234, 290, 330, 310], stack: 'total', color: '#f59e0b' }
  ]
})
// stack: 'total' 相同 stack 值的系列会堆叠在一起`,
    vueCode: `<template>
  <LChart :options="chartOptions" />
</template>

<script setup>
import { LChart } from '@ldesign/chart-vue'

// 堆叠柱状图 - stack: 'total'
const chartOptions = {
  xAxis: { data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
  series: [
    { type: 'bar', name: '直接访问', data: [320, 302, 301, 334, 390, 330, 320], stack: 'total', color: '#6366f1' },
    { type: 'bar', name: '邮件营销', data: [120, 132, 101, 134, 90, 230, 210], stack: 'total', color: '#10b981' },
    { type: 'bar', name: '联盟广告', data: [220, 182, 191, 234, 290, 330, 310], stack: 'total', color: '#f59e0b' }
  ]
}
<\/script>`,
  },
  {
    id: 'horizontal', title: '横向柱状图',
    options: { horizontal: true, xAxis: { data: cats }, series: [
      { type: 'bar', name: '访问量', data: [220, 182, 191, 234, 290], borderRadius: 4, color: '#06b6d4' }
    ], animationType: 'grow' } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

// 横向柱状图 - horizontal: true
const chart = new Chart('#container', {
  horizontal: true,  // 开启横向显示
  xAxis: { data: ['类目A', '类目B', '类目C', '类目D', '类目E'] },
  series: [{
    type: 'bar',
    name: '访问量',
    data: [220, 182, 191, 234, 290],
    borderRadius: 4,
    color: '#06b6d4'
  }]
})`,
    vueCode: `<template>
  <LChart :options="chartOptions" />
</template>

<script setup>
import { LChart } from '@ldesign/chart-vue'

// 横向柱状图 - horizontal: true
const chartOptions = {
  horizontal: true,
  xAxis: { data: ['类目A', '类目B', '类目C', '类目D', '类目E'] },
  series: [{
    type: 'bar',
    name: '访问量',
    data: [220, 182, 191, 234, 290],
    borderRadius: 4,
    color: '#06b6d4'
  }]
}
<\/script>`,
  },
])

const exampleCount = computed(() => examples.value.length)

function refreshExample(index: number) {
  const e = examples.value[index]
  if (e?.options.series) {
    e.options = {
      ...e.options,
      series: e.options.series.map((s: any) => ({ ...s, data: randomData(s.data?.length || 5) }))
    }
  }
}

defineExpose({ exampleCount })
</script>

<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">柱状图示例</h2>
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
        :animation-types="['grow', 'fade', 'slide', 'scale', 'none']"
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
