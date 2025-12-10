<script setup lang="ts">
import { ref, computed } from 'vue'
import ChartPageLayout from '@/components/ChartPageLayout.vue'
import type { ChartOptions } from '@ldesign/chart-core'

const props = defineProps<{ useMode: 'native' | 'vue'; rendererType: 'canvas' | 'svg'; isDark: boolean }>()

const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月']
const randomData = (n: number, min = 50, max = 300) => 
  Array.from({ length: n }, () => Math.floor(Math.random() * (max - min) + min))

// 生成大数据量
const generateLargeData = (count: number) => {
  const data: number[] = []
  let value = 100
  for (let i = 0; i < count; i++) {
    value += Math.random() * 20 - 10
    data.push(Math.max(0, Math.round(value)))
  }
  return data
}

const generateTimeLabels = (count: number) => {
  const labels: string[] = []
  let year = 2020, month = 1
  for (let i = 0; i < count; i++) {
    labels.push(`${year}-${month.toString().padStart(2, '0')}`)
    if (++month > 12) { month = 1; year++ }
  }
  return labels
}

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const examples = ref([
  {
    id: 'basic', title: '基础折线图',
    options: { xAxis: { data: weekDays }, series: [{ type: 'line', name: '销售额', data: [150, 230, 224, 218, 135, 147, 260] }], animationType: 'grow' } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

const chart = new Chart('#container', {
  xAxis: { 
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'] 
  },
  series: [{
    type: 'line',
    name: '销售额',
    data: [150, 230, 224, 218, 135, 147, 260]
  }],
  animationType: 'grow'
})`,
    vueCode: `<template>
  <LChart :options="chartOptions" />
</template>

<script setup>
import { LChart } from '@ldesign/chart-vue'

const chartOptions = {
  xAxis: { 
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'] 
  },
  series: [{
    type: 'line',
    name: '销售额',
    data: [150, 230, 224, 218, 135, 147, 260]
  }]
}
<\/script>`,
  },
  // ========== 波浪动画 ==========
  {
    id: 'wave-animation', title: '波浪动画',
    options: { xAxis: { data: weekDays }, series: [
      { type: 'line', name: '数据A', data: [120, 200, 150, 280, 190, 230, 260], color: '#5470c6', symbolSize: 8 },
      { type: 'line', name: '数据B', data: [80, 150, 180, 120, 220, 170, 190], color: '#91cc75', symbolSize: 8 }
    ], animationType: 'wave' } as ChartOptions,
    nativeCode: `// 波浪动画 - 数据点依次弹起，带弹性效果
const chart = new Chart('#container', {
  xAxis: { data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
  series: [
    { type: 'line', name: '数据A', data: [120, 200, 150, 280, 190, 230, 260], symbolSize: 8 },
    { type: 'line', name: '数据B', data: [80, 150, 180, 120, 220, 170, 190], symbolSize: 8 }
  ],
  animationType: 'wave'  // 波浪动画：数据点从底部依次弹起
})`,
    vueCode: `<LChart :options="chartOptions" />
// animationType: 'wave' - 波浪弹起效果，折线图专用`,
  },
  // ========== 绘制动画 ==========
  {
    id: 'draw-animation', title: '绘制动画',
    options: { xAxis: { data: weekDays }, series: [
      { type: 'line', name: '趋势', data: [150, 230, 224, 218, 335, 247, 360], smooth: true, color: '#ee6666', symbolSize: 6 }
    ], animationType: 'draw' } as ChartOptions,
    nativeCode: `// 绘制动画 - 线条像手绘一样从左到右渐进出现
const chart = new Chart('#container', {
  xAxis: { data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
  series: [{
    type: 'line',
    name: '趋势',
    data: [150, 230, 224, 218, 335, 247, 360],
    smooth: true,
    symbolSize: 6
  }],
  animationType: 'draw'  // 绘制动画：线条从左到右逐渐绘制
})`,
    vueCode: `<LChart :options="chartOptions" />
// animationType: 'draw' - 线条渐进绘制效果`,
  },
  {
    id: 'smooth', title: '平滑折线图',
    options: { xAxis: { data: months }, series: [
      { type: 'line', name: '用户数', data: [820, 932, 901, 934, 1290, 1330, 1320], smooth: true, color: '#10b981' },
      { type: 'line', name: '访问量', data: [320, 332, 301, 334, 390, 330, 320], smooth: true, color: '#f59e0b' }
    ], animationType: 'wave' } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

// 平滑折线图 - 多系列
const chart = new Chart('#container', {
  xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'] },
  series: [
    { 
      type: 'line', 
      name: '用户数', 
      data: [820, 932, 901, 934, 1290, 1330, 1320], 
      smooth: true,  // 开启平滑曲线
      color: '#10b981' 
    },
    { 
      type: 'line', 
      name: '访问量', 
      data: [320, 332, 301, 334, 390, 330, 320], 
      smooth: true, 
      color: '#f59e0b' 
    }
  ]
})`,
    vueCode: `<template>
  <LChart :options="chartOptions" />
</template>

<script setup>
import { LChart } from '@ldesign/chart-vue'

// 平滑折线图 - smooth: true
const chartOptions = {
  xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'] },
  series: [
    { type: 'line', name: '用户数', data: [820, 932, 901, 934, 1290, 1330, 1320], smooth: true, color: '#10b981' },
    { type: 'line', name: '访问量', data: [320, 332, 301, 334, 390, 330, 320], smooth: true, color: '#f59e0b' }
  ]
}
<\/script>`,
  },
  {
    id: 'area', title: '面积图',
    options: { xAxis: { data: months }, series: [
      { type: 'line', name: '下载量', data: [150, 232, 201, 154, 190, 330, 410], smooth: true, areaStyle: { opacity: 0.4 }, color: '#6366f1' }
    ], animationType: 'grow' } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

// 面积图 - 使用 areaStyle
const chart = new Chart('#container', {
  xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'] },
  series: [{
    type: 'line',
    name: '下载量',
    data: [150, 232, 201, 154, 190, 330, 410],
    smooth: true,
    areaStyle: { opacity: 0.4 },  // 开启面积填充
    color: '#6366f1'
  }]
})`,
    vueCode: `<template>
  <LChart :options="chartOptions" />
</template>

<script setup>
import { LChart } from '@ldesign/chart-vue'

// 面积图 - areaStyle: { opacity: 0.4 }
const chartOptions = {
  xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'] },
  series: [{
    type: 'line',
    name: '下载量',
    data: [150, 232, 201, 154, 190, 330, 410],
    smooth: true,
    areaStyle: { opacity: 0.4 },
    color: '#6366f1'
  }]
}
<\/script>`,
  },
  {
    id: 'step', title: '阶梯折线图',
    options: { xAxis: { data: ['周一','周二','周三','周四','周五','周六','周日'] }, series: [
      { type: 'line', name: '步数', data: [4200, 3800, 5100, 4800, 6200, 8500, 7200], step: 'middle', color: '#8b5cf6' }
    ], animationType: 'grow' } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

// 阶梯折线图 - 使用 step
const chart = new Chart('#container', {
  xAxis: { data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
  series: [{
    type: 'line',
    name: '步数',
    data: [4200, 3800, 5100, 4800, 6200, 8500, 7200],
    step: 'middle',  // 'start' | 'middle' | 'end'
    color: '#8b5cf6'
  }]
})`,
    vueCode: `<template>
  <LChart :options="chartOptions" />
</template>

<script setup>
import { LChart } from '@ldesign/chart-vue'

// 阶梯折线图 - step: 'start' | 'middle' | 'end'
const chartOptions = {
  xAxis: { data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
  series: [{
    type: 'line',
    name: '步数',
    data: [4200, 3800, 5100, 4800, 6200, 8500, 7200],
    step: 'middle',
    color: '#8b5cf6'
  }]
}
<\/script>`,
  },
  // ========== 堆叠面积图 ==========
  {
    id: 'stacked-area', title: '堆叠面积图',
    options: { 
      xAxis: { data: weekDays }, 
      series: [
        { type: 'line', name: '邮件营销', data: [120, 132, 101, 134, 90, 230, 210], stack: 'total', smooth: true, areaStyle: { opacity: 0.6 }, color: '#5470c6' },
        { type: 'line', name: '联盟广告', data: [220, 182, 191, 234, 290, 330, 310], stack: 'total', smooth: true, areaStyle: { opacity: 0.6 }, color: '#91cc75' },
        { type: 'line', name: '视频广告', data: [150, 232, 201, 154, 190, 330, 410], stack: 'total', smooth: true, areaStyle: { opacity: 0.6 }, color: '#fac858' },
        { type: 'line', name: '直接访问', data: [320, 332, 301, 334, 390, 330, 320], stack: 'total', smooth: true, areaStyle: { opacity: 0.6 }, color: '#ee6666' },
        { type: 'line', name: '搜索引擎', data: [820, 932, 901, 934, 1290, 1330, 1320], stack: 'total', smooth: true, areaStyle: { opacity: 0.6 }, color: '#73c0de' }
      ], 
      animationType: 'grow' 
    } as ChartOptions,
    nativeCode: `// 堆叠面积图 - stack 相同的系列会堆叠
const chart = new Chart('#container', {
  xAxis: { data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
  series: [
    { type: 'line', name: '邮件营销', data: [120, 132, 101, 134, 90, 230, 210], 
      stack: 'total', smooth: true, areaStyle: { opacity: 0.6 }, color: '#5470c6' },
    { type: 'line', name: '联盟广告', data: [220, 182, 191, 234, 290, 330, 310], 
      stack: 'total', smooth: true, areaStyle: { opacity: 0.6 }, color: '#91cc75' },
    // ... 更多系列
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// stack: 'total' 相同值的系列会堆叠显示`,
  },
  // ========== 渐变堆叠面积图 ==========
  {
    id: 'gradient-area', title: '渐变堆叠面积图',
    options: { 
      xAxis: { data: weekDays }, 
      series: [
        { type: 'line', name: 'Line 1', data: [140, 232, 101, 264, 90, 340, 250], smooth: true, areaStyle: { opacity: 0.8 }, color: '#80FFA5', stack: 'total' },
        { type: 'line', name: 'Line 2', data: [120, 282, 111, 234, 220, 340, 310], smooth: true, areaStyle: { opacity: 0.8 }, color: '#00DDFF', stack: 'total' },
        { type: 'line', name: 'Line 3', data: [320, 132, 201, 334, 190, 130, 220], smooth: true, areaStyle: { opacity: 0.8 }, color: '#37A2FF', stack: 'total' },
        { type: 'line', name: 'Line 4', data: [220, 402, 231, 134, 190, 230, 120], smooth: true, areaStyle: { opacity: 0.8 }, color: '#FF0087', stack: 'total' },
        { type: 'line', name: 'Line 5', data: [220, 302, 181, 234, 210, 290, 150], smooth: true, areaStyle: { opacity: 0.8 }, color: '#FFBF00', stack: 'total' }
      ], 
      animationType: 'grow' 
    } as ChartOptions,
    nativeCode: `// 渐变堆叠面积图 - 多彩渐变效果
const chart = new Chart('#container', {
  series: [
    { type: 'line', name: 'Line 1', data: [...], smooth: true, 
      areaStyle: { opacity: 0.8 }, color: '#80FFA5', stack: 'total' },
    { type: 'line', name: 'Line 2', data: [...], smooth: true, 
      areaStyle: { opacity: 0.8 }, color: '#00DDFF', stack: 'total' },
    // ... 更多彩色系列
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// 使用不同颜色创建彩虹渐变效果`,
  },
  // ========== 凹凸排名图 ==========
  {
    id: 'bump-chart', title: '凹凸排名图',
    options: { 
      xAxis: { data: ['2019', '2020', '2021', '2022', '2023', '2024'] },
      yAxis: { inverse: true, min: 1, max: 6 },
      series: [
        { type: 'line', name: 'Apple', data: [1, 2, 3, 2, 1, 2], smooth: true, color: '#ee6666', symbolSize: 12 },
        { type: 'line', name: 'Samsung', data: [2, 1, 2, 3, 4, 1], smooth: true, color: '#5470c6', symbolSize: 12 },
        { type: 'line', name: 'Huawei', data: [3, 4, 1, 1, 2, 3], smooth: true, color: '#91cc75', symbolSize: 12 },
        { type: 'line', name: 'Xiaomi', data: [4, 3, 4, 5, 3, 4], smooth: true, color: '#fac858', symbolSize: 12 },
        { type: 'line', name: 'OPPO', data: [5, 5, 5, 4, 5, 5], smooth: true, color: '#73c0de', symbolSize: 12 },
        { type: 'line', name: 'Vivo', data: [6, 6, 6, 6, 6, 6], smooth: true, color: '#9a60b4', symbolSize: 12 }
      ], 
      animationType: 'grow' 
    } as ChartOptions,
    nativeCode: `// 凹凸图（排名图）- yAxis.inverse: true 让排名1在上方
const chart = new Chart('#container', {
  xAxis: { data: ['2019', '2020', '2021', '2022', '2023', '2024'] },
  yAxis: { inverse: true, min: 1, max: 6 },
  series: [
    { type: 'line', name: 'Apple', data: [1, 2, 3, 2, 1, 2], smooth: true, color: '#ee6666', symbolSize: 12 },
    { type: 'line', name: 'Samsung', data: [2, 1, 2, 3, 4, 1], smooth: true, color: '#5470c6', symbolSize: 12 },
    // ... 更多品牌
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// inverse: true 反转Y轴，让排名1显示在最上方`,
  },
  // ========== 大数据量面积图 ==========
  {
    id: 'large-data', title: '大数据量面积图',
    options: { 
      xAxis: { data: generateTimeLabels(100) }, 
      series: [
        { type: 'line', name: '数据', data: generateLargeData(100), smooth: true, areaStyle: { opacity: 0.3 }, color: '#5470c6', showSymbol: false }
      ], 
      animationType: 'grow' 
    } as ChartOptions,
    nativeCode: `// 大数据量面积图 - showSymbol: false 隐藏数据点提升性能
const chart = new Chart('#container', {
  xAxis: { data: generateTimeLabels(100) },
  series: [{
    type: 'line', name: '数据', data: generateLargeData(100),
    smooth: true, areaStyle: { opacity: 0.3 }, color: '#5470c6',
    showSymbol: false  // 大数据量建议隐藏数据点
  }]
})`,
    vueCode: `<LChart :options="chartOptions" />
// showSymbol: false 提升大数据量渲染性能`,
  },
  // ========== 双Y轴图表 ==========
  {
    id: 'dual-axis', title: '双Y轴图表',
    options: { 
      xAxis: { data: months },
      yAxis: [
        { name: '蒸发量(ml)', position: 'left' },
        { name: '降水量(mm)', position: 'right' }
      ],
      series: [
        { type: 'line', name: '蒸发量', data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6], color: '#5470c6', yAxisIndex: 0 },
        { type: 'line', name: '降水量', data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6], color: '#91cc75', yAxisIndex: 1 }
      ], 
      animationType: 'grow' 
    } as ChartOptions,
    nativeCode: `// 双Y轴图表 - yAxisIndex 指定系列使用哪个Y轴
const chart = new Chart('#container', {
  xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'] },
  yAxis: [
    { name: '蒸发量(ml)', position: 'left' },
    { name: '降水量(mm)', position: 'right' }
  ],
  series: [
    { type: 'line', name: '蒸发量', data: [...], color: '#5470c6', yAxisIndex: 0 },
    { type: 'line', name: '降水量', data: [...], color: '#91cc75', yAxisIndex: 1 }
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// yAxisIndex: 0/1 指定使用左/右Y轴`,
  },
  // ========== 多X轴图表 ==========
  {
    id: 'multi-x-axis', title: '多X轴图表',
    options: { 
      xAxis: [
        { data: ['2015-1', '2015-2', '2015-3', '2015-4', '2015-5', '2015-6'], position: 'bottom' },
        { data: ['2016-1', '2016-2', '2016-3', '2016-4', '2016-5', '2016-6'], position: 'top' }
      ],
      series: [
        { type: 'line', name: '2015年', data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7], smooth: true, color: '#5470c6', xAxisIndex: 0 },
        { type: 'line', name: '2016年', data: [3.9, 5.9, 11.1, 18.7, 48.3, 69.2], smooth: true, color: '#ee6666', xAxisIndex: 1 }
      ], 
      animationType: 'grow' 
    } as ChartOptions,
    nativeCode: `// 多X轴图表 - 上下两个X轴对比
const chart = new Chart('#container', {
  xAxis: [
    { data: ['2015-1', ...], position: 'bottom' },
    { data: ['2016-1', ...], position: 'top' }
  ],
  series: [
    { type: 'line', name: '2015年', data: [...], xAxisIndex: 0 },
    { type: 'line', name: '2016年', data: [...], xAxisIndex: 1 }
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// xAxisIndex 指定使用哪个X轴`,
  },
  // ========== 雨量流量关系图 ==========
  {
    id: 'rainfall-flow', title: '雨量流量关系图',
    options: { 
      xAxis: { data: ['9/1', '9/5', '9/10', '9/15', '9/20', '9/25', '9/30'] },
      yAxis: [
        { name: '流量(m³/s)', position: 'left' },
        { name: '降雨量(mm)', position: 'right', inverse: true }
      ],
      series: [
        { type: 'line', name: '流量', data: [10, 52, 200, 334, 120, 30, 10], smooth: true, areaStyle: { opacity: 0.4 }, color: '#5470c6', yAxisIndex: 0 },
        { type: 'line', name: '降雨量', data: [0, 2.2, 3.4, 4.5, 1.2, 0.5, 0], smooth: true, areaStyle: { opacity: 0.4 }, color: '#91cc75', yAxisIndex: 1 }
      ], 
      animationType: 'grow' 
    } as ChartOptions,
    nativeCode: `// 雨量流量关系图 - 降雨Y轴反转，从上方显示
const chart = new Chart('#container', {
  yAxis: [
    { name: '流量(m³/s)', position: 'left' },
    { name: '降雨量(mm)', position: 'right', inverse: true }
  ],
  series: [
    { type: 'line', name: '流量', data: [...], yAxisIndex: 0, areaStyle: {...} },
    { type: 'line', name: '降雨量', data: [...], yAxisIndex: 1, areaStyle: {...} }
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// inverse: true 反转降雨量轴`,
  },
  // ========== AQI 可视化 ==========
  {
    id: 'aqi-visual', title: 'AQI 空气质量可视化',
    options: { 
      xAxis: { data: ['1点', '4点', '7点', '10点', '13点', '16点', '19点', '22点'] },
      series: [
        { type: 'line', name: 'PM2.5', data: [55, 42, 38, 65, 120, 95, 78, 52], smooth: true, color: '#ff7875' },
        { type: 'line', name: 'PM10', data: [88, 75, 62, 98, 156, 132, 110, 85], smooth: true, color: '#ffc53d' },
        { type: 'line', name: 'O3', data: [25, 18, 35, 85, 125, 98, 65, 32], smooth: true, color: '#95de64' },
        { type: 'line', name: 'NO2', data: [42, 35, 55, 78, 92, 65, 48, 38], smooth: true, color: '#69b1ff' }
      ], 
      animationType: 'grow' 
    } as ChartOptions,
    nativeCode: `// AQI 空气质量指数可视化 - 多污染物对比
const chart = new Chart('#container', {
  xAxis: { data: ['1点', '4点', '7点', '10点', '13点', '16点', '19点', '22点'] },
  series: [
    { type: 'line', name: 'PM2.5', data: [...], smooth: true, color: '#ff7875' },
    { type: 'line', name: 'PM10', data: [...], smooth: true, color: '#ffc53d' },
    { type: 'line', name: 'O3', data: [...], smooth: true, color: '#95de64' },
    { type: 'line', name: 'NO2', data: [...], smooth: true, color: '#69b1ff' }
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// 多系列对比空气质量指标`,
  },
  // ========== 多系列阶梯图 ==========
  {
    id: 'step-multi', title: '多系列阶梯图',
    options: { 
      xAxis: { data: weekDays }, 
      series: [
        { type: 'line', name: 'Step Start', data: [120, 132, 101, 134, 90, 230, 210], step: 'start', color: '#5470c6' },
        { type: 'line', name: 'Step Middle', data: [220, 282, 201, 234, 290, 430, 410], step: 'middle', color: '#91cc75' },
        { type: 'line', name: 'Step End', data: [450, 432, 401, 454, 590, 530, 510], step: 'end', color: '#fac858' }
      ], 
      animationType: 'grow' 
    } as ChartOptions,
    nativeCode: `// 阶梯折线图对比 - start / middle / end
const chart = new Chart('#container', {
  series: [
    { type: 'line', name: 'Step Start', data: [...], step: 'start', color: '#5470c6' },
    { type: 'line', name: 'Step Middle', data: [...], step: 'middle', color: '#91cc75' },
    { type: 'line', name: 'Step End', data: [...], step: 'end', color: '#fac858' }
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// step: 'start' | 'middle' | 'end'`,
  },
  // ========== 多国收入对比 ==========
  {
    id: 'multi-series', title: '多国收入对比图',
    options: { 
      xAxis: { data: ['1990', '1995', '2000', '2005', '2010', '2015', '2020'] },
      series: [
        { type: 'line', name: '中国', data: [1000, 2200, 3500, 5800, 9500, 15000, 23000], smooth: true, color: '#ee6666' },
        { type: 'line', name: '美国', data: [25000, 28000, 35000, 42000, 48000, 55000, 63000], smooth: true, color: '#5470c6' },
        { type: 'line', name: '日本', data: [28000, 35000, 38000, 36000, 42000, 38000, 40000], smooth: true, color: '#91cc75' },
        { type: 'line', name: '德国', data: [22000, 26000, 28000, 32000, 38000, 42000, 48000], smooth: true, color: '#fac858' }
      ], 
      animationType: 'grow' 
    } as ChartOptions,
    nativeCode: `// 多国人均收入对比 - 展示长期趋势
const chart = new Chart('#container', {
  xAxis: { data: ['1990', '1995', '2000', '2005', '2010', '2015', '2020'] },
  series: [
    { type: 'line', name: '中国', data: [...], smooth: true, color: '#ee6666' },
    { type: 'line', name: '美国', data: [...], smooth: true, color: '#5470c6' },
    { type: 'line', name: '日本', data: [...], smooth: true, color: '#91cc75' },
    { type: 'line', name: '德国', data: [...], smooth: true, color: '#fac858' }
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// 多系列折线图对比不同国家数据`,
  },
  // ========== 断点折线图 ==========
  {
    id: 'null-data', title: '断点折线图',
    options: { 
      xAxis: { data: weekDays },
      series: [
        { type: 'line', name: '不连接', data: [120, 132, null, null, 90, 230, 210], connectNulls: false, color: '#5470c6' },
        { type: 'line', name: '连接空值', data: [220, null, null, 334, 190, null, 410], connectNulls: true, color: '#91cc75', lineStyle: { type: 'dashed' } }
      ], 
      animationType: 'grow' 
    } as ChartOptions,
    nativeCode: `// 断点折线图 - connectNulls 控制是否连接空值
const chart = new Chart('#container', {
  series: [
    { type: 'line', name: '不连接', data: [120, 132, null, null, 90, 230, 210], 
      connectNulls: false, color: '#5470c6' },  // 遇到 null 断开
    { type: 'line', name: '连接空值', data: [220, null, null, 334, 190, null, 410], 
      connectNulls: true, color: '#91cc75', lineStyle: { type: 'dashed' } }  // 跳过 null 连接
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// connectNulls: true 跳过空值点连接`,
  },
  // ========== 负值面积图 ==========
  {
    id: 'negative-area', title: '负值面积图',
    options: { 
      xAxis: { data: weekDays },
      series: [
        { type: 'line', name: '收益', data: [120, -50, 80, -120, 150, -80, 200], smooth: true, areaStyle: { opacity: 0.4 }, color: '#5470c6' }
      ], 
      animationType: 'grow' 
    } as ChartOptions,
    nativeCode: `// 负值面积图 - 支持正负值
const chart = new Chart('#container', {
  series: [{
    type: 'line', name: '收益',
    data: [120, -50, 80, -120, 150, -80, 200],
    smooth: true, areaStyle: { opacity: 0.4 }
  }]
})`,
    vueCode: `<LChart :options="chartOptions" />
// 自动处理正负值的面积填充`,
  },
  // ========== 折线柱状混合图 ==========
  {
    id: 'line-bar-mix', title: '折线柱状混合图',
    options: { 
      xAxis: { data: months },
      series: [
        { type: 'bar', name: '销量', data: [120, 200, 150, 80, 70, 110, 130], color: '#91cc75' },
        { type: 'line', name: '增长率', data: [10, 15, 8, -5, 12, 18, 22], color: '#ee6666', yAxisIndex: 0 }
      ], 
      animationType: 'grow' 
    } as ChartOptions,
    nativeCode: `// 折线柱状混合图 - 不同 type 的系列组合
const chart = new Chart('#container', {
  series: [
    { type: 'bar', name: '销量', data: [...], color: '#91cc75' },
    { type: 'line', name: '增长率', data: [...], color: '#ee6666' }
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// type: 'bar' 和 type: 'line' 组合使用`,
  },
  // ========== 虚线折线图 ==========
  {
    id: 'dashed-line', title: '虚线折线图',
    options: { 
      xAxis: { data: weekDays },
      series: [
        { type: 'line', name: '实线', data: [150, 230, 224, 218, 135, 147, 260], color: '#5470c6' },
        { type: 'line', name: '虚线', data: [220, 182, 191, 234, 290, 330, 310], color: '#ee6666', lineStyle: { type: 'dashed' } },
        { type: 'line', name: '点线', data: [320, 332, 301, 334, 390, 330, 320], color: '#91cc75', lineStyle: { type: 'dotted' } }
      ], 
      animationType: 'grow' 
    } as ChartOptions,
    nativeCode: `// 虚线折线图 - lineStyle.type 控制线条样式
const chart = new Chart('#container', {
  series: [
    { type: 'line', name: '实线', data: [...], color: '#5470c6' },
    { type: 'line', name: '虚线', data: [...], color: '#ee6666', 
      lineStyle: { type: 'dashed' } },  // 虚线
    { type: 'line', name: '点线', data: [...], color: '#91cc75', 
      lineStyle: { type: 'dotted' } }   // 点线
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// lineStyle.type: 'solid' | 'dashed' | 'dotted'`,
  },
  // ========== 数据点样式折线图 ==========
  {
    id: 'symbol-style', title: '数据点样式',
    options: { 
      xAxis: { data: weekDays },
      series: [
        { type: 'line', name: '圆形', data: [150, 230, 224, 218, 135, 147, 260], color: '#5470c6', symbol: 'circle', symbolSize: 10 },
        { type: 'line', name: '方形', data: [220, 182, 191, 234, 290, 330, 310], color: '#ee6666', symbol: 'rect', symbolSize: 8 },
        { type: 'line', name: '无标记', data: [320, 332, 301, 334, 390, 330, 320], color: '#91cc75', showSymbol: false }
      ], 
      animationType: 'grow' 
    } as ChartOptions,
    nativeCode: `// 数据点样式 - symbol 和 symbolSize 配置
const chart = new Chart('#container', {
  series: [
    { type: 'line', name: '圆形', data: [...], symbol: 'circle', symbolSize: 10 },
    { type: 'line', name: '方形', data: [...], symbol: 'rect', symbolSize: 8 },
    { type: 'line', name: '无标记', data: [...], showSymbol: false }
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// symbol: 'circle' | 'rect' | 'triangle' | 'diamond' | 'none'`,
  },
  // ========== 预测数据折线图 ==========
  {
    id: 'forecast', title: '预测数据折线图',
    options: { 
      xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月'] },
      series: [
        { type: 'line', name: '实际数据', data: [120, 132, 101, 134, 90, 230, 210, null, null, null], color: '#5470c6' },
        { type: 'line', name: '预测数据', data: [null, null, null, null, null, null, 210, 280, 310, 350], color: '#5470c6', lineStyle: { type: 'dashed' } }
      ], 
      animationType: 'grow' 
    } as ChartOptions,
    nativeCode: `// 预测数据折线图 - 实际数据实线，预测数据虚线
const chart = new Chart('#container', {
  xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月'] },
  series: [
    { type: 'line', name: '实际数据', 
      data: [120, 132, 101, 134, 90, 230, 210, null, null, null], 
      color: '#5470c6' },
    { type: 'line', name: '预测数据', 
      data: [null, null, null, null, null, null, 210, 280, 310, 350], 
      color: '#5470c6', lineStyle: { type: 'dashed' } }  // 虚线表示预测
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// 使用两个系列：实线为实际数据，虚线为预测数据`,
  },
  // ========== 大数据量滚动图表 ==========
  {
    id: 'data-zoom', title: '大数据量滚动图表',
    options: { 
      xAxis: { data: generateTimeLabels(200) },
      series: [
        { type: 'line', name: '数据', data: generateLargeData(200), smooth: true, color: '#5470c6', showSymbol: false, areaStyle: { opacity: 0.2 } }
      ],
      dataZoom: { show: true, type: 'both', start: 70, end: 100 },
      animationType: 'grow' 
    } as ChartOptions,
    nativeCode: `// 大数据量滚动图表 - 使用 dataZoom 配置
const chart = new Chart('#container', {
  xAxis: { data: generateTimeLabels(200) },
  series: [{
    type: 'line', name: '数据', 
    data: generateLargeData(200),
    smooth: true, showSymbol: false, areaStyle: { opacity: 0.2 }
  }],
  dataZoom: {
    show: true,
    type: 'both',    // 'slider' 滑块 | 'inside' 滚轮/拖拽 | 'both' 两者
    start: 70,       // 初始显示起点百分比
    end: 100         // 初始显示终点百分比
  }
})`,
    vueCode: `<LChart :options="chartOptions" />
// dataZoom 支持滑块拖拽和鼠标滚轮缩放`,
  },
])

const exampleCount = computed(() => examples.value.length)

function refreshExample(index: number) {
  const e = examples.value[index]
  if (!e?.options.series) return

  // 特殊处理大数据量图表
  if (e.id === 'large-data') {
    e.options = {
      ...e.options,
      series: e.options.series.map((s: any) => ({ ...s, data: generateLargeData(100) }))
    }
    return
  }

  // 特殊处理凹凸图（排名数据）
  if (e.id === 'bump-chart') {
    const ranks = [1, 2, 3, 4, 5, 6]
    e.options = {
      ...e.options,
      series: e.options.series.map((s: any) => ({
        ...s,
        data: Array.from({ length: s.data.length }, () => ranks[Math.floor(Math.random() * 6)])
      }))
    }
    return
  }

  // 特殊处理断点数据
  if (e.id === 'null-data') {
    e.options = {
      ...e.options,
      series: e.options.series.map((s: any) => ({
        ...s,
        data: Array.from({ length: s.data.length }, (_, i) => 
          Math.random() > 0.3 ? Math.floor(Math.random() * 300 + 100) : null
        )
      }))
    }
    return
  }

  // 特殊处理 DataZoom 图表
  if (e.id === 'data-zoom') {
    e.options = {
      ...e.options,
      series: e.options.series.map((s: any) => ({ ...s, data: generateLargeData(200) }))
    }
    return
  }

  // 特殊处理滚动柱状图
  if (e.id === 'data-zoom-bar') {
    e.options = {
      ...e.options,
      series: e.options.series.map((s: any) => ({ 
        ...s, 
        data: Array.from({ length: 50 }, () => Math.floor(Math.random() * 200 + 50)) 
      }))
    }
    return
  }

  // 默认刷新
  e.options = {
    ...e.options,
    series: e.options.series.map((s: any) => ({ 
      ...s, 
      data: randomData(s.data?.length || 7, 50, 400) 
    }))
  }
}

// 全局动画类型选择
const globalAnimation = ref('wave')
const animationOptions = [
  { value: 'wave', label: '波浪弹起', desc: '数据点依次弹起' },
  { value: 'draw', label: '渐进绘制', desc: '线条从左到右绘制' },
  { value: 'grow', label: '生长', desc: '点依次出现' },
  { value: 'rise', label: '升起', desc: '从底部升起' },
  { value: 'expand', label: '展开', desc: '从左到右展开' },
  { value: 'fade', label: '淡入', desc: '渐变显示' },
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
    title="折线图示例"
    description="折线图用于展示数据的变化趋势，适合时间序列数据和连续数据的可视化。支持平滑曲线、阶梯线、面积图、多轴等多种组合。"
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
