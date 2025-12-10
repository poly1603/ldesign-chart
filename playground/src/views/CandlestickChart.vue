<script setup lang="ts">
import { ref, computed } from 'vue'
import ChartExample from '@/components/ChartExample.vue'
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
  <div class="candlestick-chart-page">
    <!-- 左侧内容区 -->
    <div class="main-content">
      <div class="page-header">
        <div class="title-row">
          <h2 class="page-title">K线图示例</h2>
          <span class="example-count">{{ exampleCount }} 个示例</span>
        </div>
        <p class="page-desc">K线图（蜡烛图）用于展示金融数据的价格走势，每根蜡烛包含开盘价、收盘价、最高价、最低价四个数据点。支持中国股市（红涨绿跌）和美股风格（绿涨红跌）。</p>
      </div>
      <div class="examples-grid">
        <ChartExample
          v-for="(example, i) in examples"
          :key="example.id + '-' + selectedAnimationType"
          :title="example.title"
          :options="example.options"
          :native-code="example.nativeCode"
          :vue-code="example.vueCode"
          :use-mode="props.useMode"
          :renderer-type="props.rendererType"
          :is-dark="props.isDark"
          @refresh="refreshExample(i)"
        />
      </div>
    </div>

    <!-- 右侧动画控制面板 -->
    <div class="animation-panel">
      <div class="panel-title">动画效果</div>
      <div class="animation-options">
        <label 
          v-for="opt in animationTypes" 
          :key="opt.value"
          class="animation-option"
          :class="{ active: selectedAnimationType === opt.value }"
        >
          <input 
            type="radio" 
            :value="opt.value" 
            v-model="selectedAnimationType"
            class="radio-input"
          />
          <div class="option-content">
            <span class="option-label">{{ opt.label }}</span>
            <span class="option-desc">{{ opt.desc }}</span>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.candlestick-chart-page {
  display: flex;
  gap: 20px;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.page-header {
  margin-bottom: 24px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary, #1e293b);
}

.example-count {
  font-size: 12px;
  padding: 2px 10px;
  background: var(--primary, #3b82f6);
  color: white;
  border-radius: 12px;
}

.page-desc {
  font-size: 14px;
  color: var(--text-secondary, #64748b);
  margin: 0;
  line-height: 1.6;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 20px;
}

/* 右侧面板 */
.animation-panel {
  width: 180px;
  flex-shrink: 0;
  position: sticky;
  top: 20px;
  height: fit-content;
  background: var(--bg-secondary, #f8fafc);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--border-color, #e2e8f0);
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary, #1e293b);
}

.animation-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.animation-option {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.animation-option:hover {
  background: var(--bg-hover, #f1f5f9);
}

.animation-option.active {
  background: var(--primary-light, #eff6ff);
  border-color: var(--primary, #3b82f6);
}

.radio-input {
  margin-top: 2px;
  accent-color: var(--primary, #3b82f6);
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.option-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary, #1e293b);
}

.option-desc {
  font-size: 11px;
  color: var(--text-secondary, #64748b);
}

/* 响应式 */
@media (max-width: 1200px) {
  .candlestick-chart-page {
    flex-direction: column;
  }
  
  .animation-panel {
    width: 100%;
    position: static;
  }
  
  .animation-options {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

@media (max-width: 900px) {
  .examples-grid {
    grid-template-columns: 1fr;
  }
}

/* 暗色模式 */
:global([data-theme="dark"]) .animation-panel {
  background: #1e293b;
  border-color: #334155;
}

:global([data-theme="dark"]) .panel-title {
  color: #f1f5f9;
}

:global([data-theme="dark"]) .animation-option:hover {
  background: #334155;
}

:global([data-theme="dark"]) .animation-option.active {
  background: #2563eb;
  border-color: #3b82f6;
}

:global([data-theme="dark"]) .animation-option.active .option-label {
  color: #ffffff;
}

:global([data-theme="dark"]) .animation-option.active .option-desc {
  color: #bfdbfe;
}

:global([data-theme="dark"]) .option-label {
  color: #f1f5f9;
}

:global([data-theme="dark"]) .option-desc {
  color: #94a3b8;
}

:global([data-theme="dark"]) .page-title {
  color: #f1f5f9;
}

:global([data-theme="dark"]) .page-desc {
  color: #94a3b8;
}
</style>
