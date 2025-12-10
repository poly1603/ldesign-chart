<script setup lang="ts">
import { ref, computed } from 'vue'
import ChartPageLayout from '@/components/ChartPageLayout.vue'
import type { ChartOptions, CandlestickAnimationType } from '@ldesign/chart-core'

const props = defineProps<{ useMode: 'native' | 'vue'; rendererType: 'canvas' | 'svg'; isDark: boolean }>()

// 动画类型选项
const animationTypes: { value: CandlestickAnimationType; label: string; desc: string }[] = [
  { value: 'grow', label: '生长', desc: '蜡烛从中心生长' },
  { value: 'rise', label: '升起', desc: '从底部升起' },
  { value: 'fade', label: '淡入', desc: '渐变显示' },
  { value: 'cascade', label: '级联', desc: '从左到右依次' },
  { value: 'none', label: '无动画', desc: '直接显示' },
]

const selectedAnimationType = ref<CandlestickAnimationType>('grow')

// 生成模拟K线数据
function generateKLineData(count: number, startPrice = 100) {
  const data: [number, number, number, number][] = []
  let price = startPrice
  
  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.5) * 10
    const open = price
    const close = price + change
    const high = Math.max(open, close) + Math.random() * 3
    const low = Math.min(open, close) - Math.random() * 3
    
    data.push([
      parseFloat(open.toFixed(2)),
      parseFloat(close.toFixed(2)),
      parseFloat(low.toFixed(2)),
      parseFloat(high.toFixed(2))
    ])
    
    price = close
  }
  
  return data
}

// 生成日期标签
function generateDateLabels(count: number) {
  const labels: string[] = []
  const startDate = new Date('2024-01-01')
  
  for (let i = 0; i < count; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    labels.push(`${date.getMonth() + 1}/${date.getDate()}`)
  }
  
  return labels
}

// 示例数据
const basicData = generateKLineData(20, 100)
const basicLabels = generateDateLabels(20)

const weekData = generateKLineData(7, 50)
const weekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const monthData = generateKLineData(12, 200)
const monthLabels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

const largeData = generateKLineData(60, 150)
const largeLabels = generateDateLabels(60)

// 股票示例数据
const stockData: [number, number, number, number][] = [
  [100.00, 102.50, 99.20, 103.80],
  [102.50, 101.30, 100.10, 104.20],
  [101.30, 105.60, 100.80, 106.50],
  [105.60, 104.20, 103.00, 107.30],
  [104.20, 108.90, 103.50, 109.80],
  [108.90, 107.50, 106.20, 110.40],
  [107.50, 112.30, 106.80, 113.50],
  [112.30, 110.80, 109.50, 114.20],
  [110.80, 115.40, 109.20, 116.80],
  [115.40, 113.60, 112.00, 117.50],
]
const stockLabels = ['09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00']

// 示例配置
const examples = computed(() => [
  {
    id: 'basic',
    title: '基础K线图',
    options: {
      xAxis: { data: basicLabels },
      yAxis: { name: '价格' },
      series: [{
        type: 'candlestick',
        name: 'K线',
        data: basicData,
        candlestickAnimationType: selectedAnimationType.value,
      }],
    } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

const chart = new Chart('#container', {
  xAxis: { data: ['1/1', '1/2', '1/3', ...] },
  yAxis: { name: '价格' },
  series: [{
    type: 'candlestick',
    name: 'K线',
    data: [
      [open, close, low, high],  // 每个蜡烛的数据
      ...
    ]
  }]
})`,
    vueCode: `<LChart :options="chartOptions" />

// data: [open, close, low, high][]`,
  },
  {
    id: 'custom-colors',
    title: '自定义涨跌颜色',
    options: {
      xAxis: { data: weekLabels },
      yAxis: {},
      series: [{
        type: 'candlestick',
        name: '周K',
        data: weekData,
        upColor: '#ff6b6b',    // 上涨红色
        downColor: '#51cf66',  // 下跌绿色
        candlestickAnimationType: selectedAnimationType.value,
      }],
    } as ChartOptions,
    nativeCode: `series: [{
  type: 'candlestick',
  upColor: '#ff6b6b',    // 上涨颜色
  downColor: '#51cf66',  // 下跌颜色
  data: [...]
}]`,
    vueCode: `// upColor: 上涨颜色（阳线）
// downColor: 下跌颜色（阴线）`,
  },
  {
    id: 'us-style',
    title: '美股风格（绿涨红跌）',
    options: {
      xAxis: { data: stockLabels },
      yAxis: {},
      series: [{
        type: 'candlestick',
        name: '股价',
        data: stockData,
        upColor: '#00da3c',   // 美股绿涨
        downColor: '#ec0000', // 美股红跌
        candlestickAnimationType: selectedAnimationType.value,
      }],
    } as ChartOptions,
    nativeCode: `// 美股风格：绿涨红跌
series: [{
  type: 'candlestick',
  upColor: '#00da3c',   // 上涨绿色
  downColor: '#ec0000', // 下跌红色
  data: [...]
}]`,
    vueCode: `// 美股、港股通常使用绿涨红跌`,
  },
  {
    id: 'month',
    title: '月K线图',
    options: {
      xAxis: { data: monthLabels },
      yAxis: { name: '月度价格' },
      series: [{
        type: 'candlestick',
        name: '月K',
        data: monthData,
        candleWidth: '50%',
        candlestickAnimationType: selectedAnimationType.value,
      }],
    } as ChartOptions,
    nativeCode: `series: [{
  type: 'candlestick',
  candleWidth: '50%',  // 蜡烛宽度
  data: [...]
}]`,
    vueCode: `// candleWidth 支持像素值或百分比`,
  },
  {
    id: 'large-data',
    title: '大数据量 + DataZoom',
    options: {
      xAxis: { data: largeLabels },
      yAxis: {},
      series: [{
        type: 'candlestick',
        name: '日K',
        data: largeData,
        candleWidth: 8,
        candlestickAnimationType: selectedAnimationType.value,
      }],
      dataZoom: {
        show: true,
        start: 50,
        end: 100,
      },
    } as ChartOptions,
    nativeCode: `// 带数据缩放的K线图
{
  series: [{
    type: 'candlestick',
    data: [...60条数据]
  }],
  dataZoom: {
    show: true,
    start: 50,  // 起始百分比
    end: 100,   // 结束百分比
  }
}`,
    vueCode: `// 拖拽滑块可缩放数据范围`,
  },
  {
    id: 'with-line',
    title: 'K线+均线组合',
    options: {
      xAxis: { data: basicLabels },
      yAxis: {},
      series: [
        {
          type: 'candlestick',
          name: 'K线',
          data: basicData,
          candlestickAnimationType: selectedAnimationType.value,
        },
        {
          type: 'line',
          name: 'MA5',
          data: basicData.map((d, i, arr) => {
            if (i < 4) return null
            const sum = arr.slice(i - 4, i + 1).reduce((s, v) => s + v[1], 0)
            return parseFloat((sum / 5).toFixed(2))
          }),
          smooth: true,
          color: '#ffd43b',
          lineStyle: { width: 2 },
          showSymbol: false,
        },
        {
          type: 'line',
          name: 'MA10',
          data: basicData.map((d, i, arr) => {
            if (i < 9) return null
            const sum = arr.slice(i - 9, i + 1).reduce((s, v) => s + v[1], 0)
            return parseFloat((sum / 10).toFixed(2))
          }),
          smooth: true,
          color: '#ff6b6b',
          lineStyle: { width: 2 },
          showSymbol: false,
        },
      ],
    } as ChartOptions,
    nativeCode: `// K线图 + 移动平均线
series: [
  { type: 'candlestick', data: [...] },
  { type: 'line', name: 'MA5', data: [...], smooth: true },
  { type: 'line', name: 'MA10', data: [...], smooth: true },
]`,
    vueCode: `// 常见的K线+均线组合图`,
  },
])

// 刷新示例
function refreshExample(index: number) {
  selectedAnimationType.value = selectedAnimationType.value
}

// 示例数量
const exampleCount = computed(() => examples.value.length)

defineExpose({ exampleCount })
</script>

<template>
  <ChartPageLayout
    title="K线图示例"
    description="K线图（蜡烛图）用于展示金融数据的价格走势，每根蜡烛包含开盘价、收盘价、最高价、最低价四个数据点。支持中国股市（红涨绿跌）和美股风格（绿涨红跌）。"
    :examples="examples"
    :use-mode="props.useMode"
    :renderer-type="props.rendererType"
    :is-dark="props.isDark"
    :animation-types="animationTypes"
    :selected-animation="selectedAnimationType"
    layout="sidebar"
    @update:selected-animation="selectedAnimationType = $event as CandlestickAnimationType"
    @refresh="refreshExample"
  />
</template>
