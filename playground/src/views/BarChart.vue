<script setup lang="ts">
import { ref, computed } from 'vue'
import ChartPageLayout from '@/components/ChartPageLayout.vue'
import type { ChartOptions } from '@ldesign/chart-core'

const props = defineProps<{ useMode: 'native' | 'vue'; rendererType: 'canvas' | 'svg'; isDark: boolean }>()

const cats = ['类目A', '类目B', '类目C', '类目D', '类目E']
const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const months = ['1月', '2月', '3月', '4月', '5月', '6月']
const randomData = (n: number, min = 50, max = 300) => Array.from({ length: n }, () => Math.floor(Math.random() * (max - min) + min))

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
    ], animationType: 'cascade' } as ChartOptions,
    nativeCode: `// 横向柱状图 - horizontal: true
const chart = new Chart('#container', {
  horizontal: true,
  xAxis: { data: ['类目A', '类目B', '类目C', '类目D', '类目E'] },
  series: [{ type: 'bar', name: '访问量', data: [220, 182, 191, 234, 290], borderRadius: 4 }]
})`,
    vueCode: `<LChart :options="chartOptions" />
// horizontal: true 开启横向显示`,
  },
  // ========== 级联动画 ==========
  {
    id: 'cascade', title: '级联动画',
    options: { xAxis: { data: weekDays }, series: [
      { type: 'bar', name: '数据', data: [120, 200, 150, 280, 190, 230, 260], color: '#8b5cf6', borderRadius: 6 }
    ], animationType: 'cascade' } as ChartOptions,
    nativeCode: `// 级联动画 - 柱子从左到右依次快速升起
const chart = new Chart('#container', {
  xAxis: { data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
  series: [{ type: 'bar', name: '数据', data: [...], borderRadius: 6 }],
  animationType: 'cascade'
})`,
    vueCode: `<LChart :options="chartOptions" />
// animationType: 'cascade' - 级联动画，柱状图专用`,
  },
  // ========== 弹性动画 ==========
  {
    id: 'elastic', title: '弹性动画',
    options: { xAxis: { data: cats }, series: [
      { type: 'bar', name: '销量', data: [180, 260, 200, 320, 240], color: '#ec4899', borderRadius: 4 }
    ], animationType: 'elasticIn' } as ChartOptions,
    nativeCode: `// 弹性动画 - 柱子带回弹效果升起
const chart = new Chart('#container', {
  xAxis: { data: ['类目A', '类目B', '类目C', '类目D', '类目E'] },
  series: [{ type: 'bar', name: '销量', data: [...], borderRadius: 4 }],
  animationType: 'elasticIn'
})`,
    vueCode: `<LChart :options="chartOptions" />
// animationType: 'elasticIn' - 弹性动画，柱状图专用`,
  },
  // ========== 负值柱状图 ==========
  {
    id: 'negative', title: '正负值柱状图',
    options: { xAxis: { data: months }, series: [
      { type: 'bar', name: '利润', data: [120, -80, 150, -60, 180, 90], color: '#10b981', borderRadius: 4 }
    ], animationType: 'cascade' } as ChartOptions,
    nativeCode: `// 正负值柱状图 - 支持负数数据
const chart = new Chart('#container', {
  xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
  series: [{
    type: 'bar',
    name: '利润',
    data: [120, -80, 150, -60, 180, 90],  // 负值向下显示
    borderRadius: 4
  }]
})`,
    vueCode: `<LChart :options="chartOptions" />
// 负值会自动向下显示`,
  },
  // ========== 圆角柱状图 ==========
  {
    id: 'rounded', title: '圆角柱状图',
    options: { xAxis: { data: cats }, series: [
      { type: 'bar', name: '数据', data: [150, 230, 180, 260, 200], borderRadius: 20, color: '#f59e0b' }
    ], animationType: 'elasticIn' } as ChartOptions,
    nativeCode: `// 圆角柱状图 - 大圆角效果
const chart = new Chart('#container', {
  xAxis: { data: ['类目A', '类目B', '类目C', '类目D', '类目E'] },
  series: [{
    type: 'bar',
    name: '数据',
    data: [150, 230, 180, 260, 200],
    borderRadius: 20  // 较大的圆角值
  }]
})`,
    vueCode: `<LChart :options="chartOptions" />
// borderRadius: 20 设置圆角`,
  },
  // ========== 柱状图+折线图混合 ==========
  {
    id: 'bar-line', title: '柱线混合图',
    options: { 
      xAxis: { data: months }, 
      yAxis: [{}, { position: 'right' }],
      series: [
        { type: 'bar', name: '销量', data: [120, 200, 150, 180, 130, 160], color: '#6366f1', borderRadius: 4 },
        { type: 'line', name: '增长率', data: [15, 28, 22, 35, 18, 25], yAxisIndex: 1, color: '#f43f5e', smooth: true }
      ], animationType: 'cascade' 
    } as ChartOptions,
    nativeCode: `// 柱线混合图 - 双Y轴
const chart = new Chart('#container', {
  xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
  yAxis: [{}, { position: 'right' }],  // 双Y轴
  series: [
    { type: 'bar', name: '销量', data: [...], borderRadius: 4 },
    { type: 'line', name: '增长率', data: [...], yAxisIndex: 1, smooth: true }
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// 柱状图和折线图可以混合使用`,
  },
  // ========== 多系列分组 ==========
  {
    id: 'multi-group', title: '多系列分组',
    options: { xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4'] }, series: [
      { type: 'bar', name: '产品A', data: [320, 280, 350, 400], color: '#3b82f6', borderRadius: 4 },
      { type: 'bar', name: '产品B', data: [220, 250, 280, 320], color: '#22c55e', borderRadius: 4 },
      { type: 'bar', name: '产品C', data: [180, 200, 220, 260], color: '#f97316', borderRadius: 4 },
      { type: 'bar', name: '产品D', data: [120, 150, 180, 200], color: '#a855f7', borderRadius: 4 }
    ], animationType: 'cascade' } as ChartOptions,
    nativeCode: `// 多系列分组柱状图 - 4个系列
const chart = new Chart('#container', {
  xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4'] },
  series: [
    { type: 'bar', name: '产品A', data: [...], color: '#3b82f6' },
    { type: 'bar', name: '产品B', data: [...], color: '#22c55e' },
    { type: 'bar', name: '产品C', data: [...], color: '#f97316' },
    { type: 'bar', name: '产品D', data: [...], color: '#a855f7' }
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// 多个系列自动分组显示`,
  },
  // ========== 堆叠分组混合 ==========
  {
    id: 'stack-group', title: '堆叠分组混合',
    options: { xAxis: { data: ['2021', '2022', '2023'] }, series: [
      { type: 'bar', name: '线上-产品A', data: [320, 380, 420], stack: 'online', color: '#3b82f6' },
      { type: 'bar', name: '线上-产品B', data: [180, 220, 260], stack: 'online', color: '#60a5fa' },
      { type: 'bar', name: '线下-产品A', data: [260, 300, 340], stack: 'offline', color: '#22c55e' },
      { type: 'bar', name: '线下-产品B', data: [140, 180, 200], stack: 'offline', color: '#86efac' }
    ], animationType: 'rise' } as ChartOptions,
    nativeCode: `// 堆叠分组混合 - 多个堆叠组
const chart = new Chart('#container', {
  xAxis: { data: ['2021', '2022', '2023'] },
  series: [
    { type: 'bar', name: '线上-产品A', data: [...], stack: 'online' },
    { type: 'bar', name: '线上-产品B', data: [...], stack: 'online' },
    { type: 'bar', name: '线下-产品A', data: [...], stack: 'offline' },
    { type: 'bar', name: '线下-产品B', data: [...], stack: 'offline' }
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// 相同 stack 值的系列会堆叠，不同 stack 值分组显示`,
  },
  // ========== 横向堆叠 ==========
  {
    id: 'horizontal-stack', title: '横向堆叠图',
    options: { horizontal: true, xAxis: { data: ['团队A', '团队B', '团队C', '团队D'] }, series: [
      { type: 'bar', name: '已完成', data: [80, 120, 90, 110], stack: 'total', color: '#22c55e' },
      { type: 'bar', name: '进行中', data: [40, 30, 50, 35], stack: 'total', color: '#f59e0b' },
      { type: 'bar', name: '待处理', data: [20, 15, 25, 18], stack: 'total', color: '#ef4444' }
    ], animationType: 'expand' } as ChartOptions,
    nativeCode: `// 横向堆叠柱状图
const chart = new Chart('#container', {
  horizontal: true,
  xAxis: { data: ['团队A', '团队B', '团队C', '团队D'] },
  series: [
    { type: 'bar', name: '已完成', data: [...], stack: 'total', color: '#22c55e' },
    { type: 'bar', name: '进行中', data: [...], stack: 'total', color: '#f59e0b' },
    { type: 'bar', name: '待处理', data: [...], stack: 'total', color: '#ef4444' }
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// horizontal + stack 组合使用`,
  },
  // ========== DataZoom 大数据量 ==========
  {
    id: 'data-zoom', title: '大数据量 + DataZoom',
    options: { 
      xAxis: { data: Array.from({ length: 50 }, (_, i) => `${i + 1}月`) },
      series: [
        { type: 'bar', name: '销量', data: Array.from({ length: 50 }, () => Math.floor(Math.random() * 200 + 50)), color: '#91cc75' }
      ],
      dataZoom: { show: true, start: 0, end: 40 },
      animationType: 'grow' 
    } as ChartOptions,
    nativeCode: `// 大数据量柱状图 + DataZoom 滚动
const chart = new Chart('#container', {
  xAxis: { data: Array.from({ length: 50 }, (_, i) => (i+1) + '月') },
  series: [{ type: 'bar', name: '销量', data: [...] }],
  dataZoom: { 
    show: true, 
    start: 0,   // 起始百分比
    end: 40     // 结束百分比
  }
})`,
    vueCode: `<LChart :options="chartOptions" />
// 拖拽底部滑块可缩放数据范围`,
  },
])

const exampleCount = computed(() => examples.value.length)

function refreshExample(index: number) {
  const e = examples.value[index]
  if (e?.options.series) {
    e.options = {
      ...e.options,
      series: e.options.series.map((s: any) => ({ 
        ...s, 
        data: s.type === 'line' 
          ? randomData(s.data?.length || 6, 10, 40)
          : randomData(s.data?.length || 5, 50, 350) 
      }))
    }
  }
}

// 全局动画类型选择
const globalAnimation = ref('cascade')
const animationOptions = [
  { value: 'cascade', label: '级联', desc: '多米诺骨牌式依次弹出' },
  { value: 'elasticIn', label: '弹性', desc: '超过目标后回弹' },
  { value: 'grow', label: '生长', desc: '整体带回弹效果' },
  { value: 'expand', label: '展开', desc: '从中间向两边展开' },
  { value: 'rise', label: '升起', desc: '整体同时升起' },
  { value: 'fade', label: '淡入', desc: '高度到位，透明度渐变' },
  { value: 'none', label: '无动画', desc: '直接显示' },
]

// 应用全局动画到示例
const examplesWithAnimation = computed(() => 
  examples.value.map(e => ({
    ...e,
    options: { ...e.options, animationType: globalAnimation.value }
  }))
)

defineExpose({ exampleCount })
</script>

<template>
  <ChartPageLayout
    title="柱状图示例"
    description="柱状图用于比较不同类别之间的数值大小，适合展示离散数据的对比关系。支持分组、堆叠、横向、级联动画等多种模式。"
    :examples="examplesWithAnimation"
    :use-mode="props.useMode"
    :renderer-type="props.rendererType"
    :is-dark="props.isDark"
    :animation-types="animationOptions"
    :selected-animation="globalAnimation"
    layout="sidebar"
    @update:selected-animation="globalAnimation = $event"
    @refresh="refreshExample"
  />
</template>
