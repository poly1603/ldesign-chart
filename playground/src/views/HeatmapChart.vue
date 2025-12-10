<script setup lang="ts">
import { ref, computed } from 'vue'
import ChartPageLayout from '@/components/ChartPageLayout.vue'
import type { ChartOptions, HeatmapAnimationType } from '@ldesign/chart-core'

const props = defineProps<{ useMode: 'native' | 'vue'; rendererType: 'canvas' | 'svg'; isDark: boolean }>()

// 动画类型选项
const animationTypes = [
  { value: 'fade', label: '淡入', desc: '整体渐变显示' },
  { value: 'scale', label: '缩放', desc: '单元格缩放出现' },
  { value: 'wave', label: '波浪', desc: '波浪式显示' },
  { value: 'cascade', label: '级联', desc: '从左上角依次出现' },
  { value: 'none', label: '无动画', desc: '直接显示' },
]
const selectedAnimationType = ref<HeatmapAnimationType>('fade')

// 生成大规模平滑数据（用于 smooth/contour 模式）
const generateSmoothData = (xLen: number, yLen: number) => {
  const data: [number, number, number][] = []
  for (let x = 0; x < xLen; x++) {
    for (let y = 0; y < yLen; y++) {
      // 使用多个正弦波叠加生成平滑数据
      const v1 = Math.sin(x * 0.3) * Math.cos(y * 0.3) * 30
      const v2 = Math.sin(x * 0.15 + 1) * Math.sin(y * 0.2) * 25
      const v3 = Math.cos((x + y) * 0.1) * 20
      const value = 50 + v1 + v2 + v3
      data.push([x, y, Math.round(value)])
    }
  }
  return data
}

// 平滑/等高线模式数据（适中的网格大小）
const xLabelsSmooth = Array.from({ length: 12 }, (_, i) => String(i * 10))
const yLabelsSmooth = Array.from({ length: 10 }, (_, i) => String(i * 5))
const smoothData = generateSmoothData(12, 10)

// 星期数据
const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const hours = ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']

// 生成随机热力图数据
const generateHeatmapData = (xLen: number, yLen: number, min = 0, max = 100) => {
  const data: [number, number, number][] = []
  for (let x = 0; x < xLen; x++) {
    for (let y = 0; y < yLen; y++) {
      data.push([x, y, Math.floor(Math.random() * (max - min) + min)])
    }
  }
  return data
}

// 活动热力图数据
const activityData = generateHeatmapData(7, 8, 0, 100)

// 月度数据
const months = ['1月', '2月', '3月', '4月', '5月', '6月']
const categories = ['销售', '市场', '研发', '运营', '客服']
const monthlyData = generateHeatmapData(6, 5, 50, 200)

// 温度数据
const locations = ['北京', '上海', '广州', '深圳', '杭州']
const tempMonths = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const tempData: [number, number, number][] = []
locations.forEach((_, li) => {
  tempMonths.forEach((_, mi) => {
    // 模拟温度：夏高冬低
    const baseTemp = 10 + Math.sin((mi - 3) * Math.PI / 6) * 15
    const cityOffset = (locations.length - li) * 3
    tempData.push([mi, li, Math.round(baseTemp + cityOffset + Math.random() * 5)])
  })
})

const examples = computed(() => [
  // ========== 基础热力图 ==========
  {
    id: 'basic', title: '基础热力图',
    options: {
      xAxis: { data: hours },
      yAxis: { data: weekDays },
      series: [{
        type: 'heatmap',
        name: '活跃度',
        data: activityData,
        heatmapAnimationType: selectedAnimationType.value,
      }],
    } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

const chart = new Chart('#container', {
  xAxis: { data: ['8:00', '10:00', '12:00', ...] },
  yAxis: { data: ['周一', '周二', '周三', ...] },
  series: [{
    type: 'heatmap',
    name: '活跃度',
    data: [
      [0, 0, 50],  // [x索引, y索引, 值]
      [0, 1, 80],
      // ...
    ]
  }]
})`,
    vueCode: `<template>
  <LChart :options="chartOptions" />
</template>

<script setup>
const chartOptions = {
  xAxis: { data: [...] },
  yAxis: { data: [...] },
  series: [{ type: 'heatmap', data: [...] }]
}
<\/script>`,
  },
  // ========== 自定义颜色 ==========
  {
    id: 'custom-color', title: '自定义颜色',
    options: {
      xAxis: { data: months },
      yAxis: { data: categories },
      series: [{
        type: 'heatmap',
        name: '业绩',
        data: monthlyData,
        colorRange: ['#91cc75', '#ee6666'],  // 绿到红
        heatmapAnimationType: selectedAnimationType.value,
      }],
    } as ChartOptions,
    nativeCode: `// 自定义颜色范围：绿到红
const chart = new Chart('#container', {
  xAxis: { data: ['1月', '2月', ...] },
  yAxis: { data: ['销售', '市场', ...] },
  series: [{
    type: 'heatmap',
    data: [...],
    colorRange: ['#91cc75', '#ee6666']  // [低值颜色, 高值颜色]
  }]
})`,
    vueCode: `<LChart :options="chartOptions" />
// colorRange: ['#91cc75', '#ee6666']`,
  },
  // ========== 温度分布 ==========
  {
    id: 'temperature', title: '温度分布图',
    options: {
      xAxis: { data: tempMonths },
      yAxis: { data: locations },
      series: [{
        type: 'heatmap',
        name: '温度',
        data: tempData,
        colorRange: ['#313695', '#d73027'],  // 蓝到红
        heatmapAnimationType: selectedAnimationType.value,
      }],
    } as ChartOptions,
    nativeCode: `// 温度分布 - 冷蓝热红
const chart = new Chart('#container', {
  xAxis: { data: ['1月', '2月', ...] },
  yAxis: { data: ['北京', '上海', ...] },
  series: [{
    type: 'heatmap',
    data: [...],
    colorRange: ['#313695', '#d73027']
  }]
})`,
    vueCode: `<LChart :options="chartOptions" />
// 适用于温度、密度等数据可视化`,
  },
  // ========== 紫色主题 ==========
  {
    id: 'purple', title: '紫色渐变',
    options: {
      xAxis: { data: ['A', 'B', 'C', 'D', 'E'] },
      yAxis: { data: ['1', '2', '3', '4', '5'] },
      series: [{
        type: 'heatmap',
        name: '数值',
        data: generateHeatmapData(5, 5, 0, 100),
        colorRange: ['#f3e5f5', '#7b1fa2'],  // 浅紫到深紫
        heatmapAnimationType: selectedAnimationType.value,
      }],
    } as ChartOptions,
    nativeCode: `// 紫色渐变主题
colorRange: ['#f3e5f5', '#7b1fa2']`,
    vueCode: `<LChart :options="chartOptions" />`,
  },
  // ========== 显示数值 ==========
  {
    id: 'with-label', title: '显示数值',
    options: {
      xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4'] },
      yAxis: { data: ['产品A', '产品B', '产品C'] },
      series: [{
        type: 'heatmap',
        name: '销量',
        data: [
          [0, 0, 85], [1, 0, 92], [2, 0, 78], [3, 0, 96],
          [0, 1, 65], [1, 1, 72], [2, 1, 88], [3, 1, 75],
          [0, 2, 45], [1, 2, 58], [2, 2, 62], [3, 2, 70],
        ],
        showLabel: true,
        colorRange: ['#e3f2fd', '#1565c0'],
        heatmapAnimationType: selectedAnimationType.value,
      }],
    } as ChartOptions,
    nativeCode: `// 在单元格内显示数值
series: [{
  type: 'heatmap',
  data: [...],
  showLabel: true,  // 显示数值
  colorRange: ['#e3f2fd', '#1565c0']
}]`,
    vueCode: `<LChart :options="chartOptions" />
// showLabel: true 显示每个单元格的值`,
  },
  // ========== 橙色主题 ==========
  {
    id: 'orange', title: '橙色渐变',
    options: {
      xAxis: { data: weekDays },
      yAxis: { data: ['项目1', '项目2', '项目3', '项目4'] },
      series: [{
        type: 'heatmap',
        name: '进度',
        data: generateHeatmapData(7, 4, 20, 100),
        colorRange: ['#fff3e0', '#e65100'],  // 浅橙到深橙
        heatmapAnimationType: selectedAnimationType.value,
      }],
    } as ChartOptions,
    nativeCode: `// 橙色渐变 - 适合进度类数据
colorRange: ['#fff3e0', '#e65100']`,
    vueCode: `<LChart :options="chartOptions" />`,
  },
  // ========== 平滑插值模式 ==========
  {
    id: 'smooth', title: '平滑插值模式',
    options: {
      xAxis: { data: xLabelsSmooth },
      yAxis: { data: yLabelsSmooth },
      series: [{
        type: 'heatmap',
        name: '密度',
        data: smoothData,
        heatmapRenderMode: 'smooth',
        colorRange: ['#313695', '#d73027'],
        heatmapAnimationType: 'fade',
      }],
    } as ChartOptions,
    nativeCode: `// 平滑插值模式 - 颜色平滑过渡
series: [{
  type: 'heatmap',
  data: [...],
  heatmapRenderMode: 'smooth',  // 平滑模式
  colorRange: ['#313695', '#d73027']
}]`,
    vueCode: `<LChart :options="chartOptions" />
// heatmapRenderMode: 'smooth' 实现平滑过渡效果`,
  },
  // ========== 等高线模式 ==========
  {
    id: 'contour', title: '等高线模式',
    options: {
      xAxis: { data: xLabelsSmooth },
      yAxis: { data: yLabelsSmooth },
      series: [{
        type: 'heatmap',
        name: '等高线',
        data: smoothData,
        heatmapRenderMode: 'contour',
        contourLevels: 12,
        colorRange: ['#313695', '#d73027'],
        heatmapAnimationType: 'fade',
      }],
    } as ChartOptions,
    nativeCode: `// 等高线模式 - 离散色带
series: [{
  type: 'heatmap',
  data: [...],
  heatmapRenderMode: 'contour',  // 等高线模式
  contourLevels: 12,  // 等高线层数
  colorRange: ['#313695', '#d73027']
}]`,
    vueCode: `<LChart :options="chartOptions" />
// contourLevels 控制等高线分层数量`,
  },
  // ========== 绿色等高线 ==========
  {
    id: 'contour-green', title: '绿色等高线',
    options: {
      xAxis: { data: xLabelsSmooth },
      yAxis: { data: yLabelsSmooth },
      series: [{
        type: 'heatmap',
        name: '地形',
        data: smoothData,
        heatmapRenderMode: 'contour',
        contourLevels: 8,
        colorRange: ['#f7fcb9', '#004529'],
        heatmapAnimationType: 'fade',
      }],
    } as ChartOptions,
    nativeCode: `// 绿色等高线 - 适合地形数据
heatmapRenderMode: 'contour',
contourLevels: 8,
colorRange: ['#f7fcb9', '#004529']`,
    vueCode: `<LChart :options="chartOptions" />`,
  },
])

const exampleCount = computed(() => examples.value.length)
defineExpose({ exampleCount })
</script>

<template>
  <ChartPageLayout
    title="热力图示例"
    description="热力图（Heatmap）通过颜色深浅展示二维数据的分布情况。支持三种渲染模式：<b>单元格</b>（标准网格）、<b>平滑</b>（颜色平滑过渡）、<b>等高线</b>（离散色带效果）。"
    :examples="examples"
    :use-mode="props.useMode"
    :renderer-type="props.rendererType"
    :is-dark="props.isDark"
    :animation-types="animationTypes"
    :selected-animation="selectedAnimationType"
    layout="sidebar"
    @update:selected-animation="selectedAnimationType = $event as HeatmapAnimationType"
  />
</template>
