<script setup lang="ts">
/**
 * LChart Vue Demo 应用
 */
import { ref, reactive } from 'vue'
import { LChart, LineChart, BarChart, PieChart } from '@ldesign/chart-vue'
import type { ChartEventMap } from '@ldesign/chart-core'

// ==================== 数据 ====================

const months = ['一月', '二月', '三月', '四月', '五月', '六月']

// 折线图数据
const lineData = reactive({
  labels: months,
  datasets: [
    { name: '2023年', data: [65, 78, 90, 82, 95, 110] },
    { name: '2024年', data: [85, 92, 105, 98, 115, 128] },
  ],
})

// 柱状图数据
const barData = reactive({
  labels: ['研发部', '市场部', '销售部', '运营部', '财务部'],
  datasets: [
    { name: 'Q1', data: [120, 95, 150, 80, 70] },
    { name: 'Q2', data: [140, 110, 165, 95, 85] },
  ],
})

// 饼图数据
const pieData = reactive({
  labels: ['产品A', '产品B', '产品C', '产品D', '产品E'],
  datasets: [
    {
      data: [
        { x: '产品A', y: 35 },
        { x: '产品B', y: 25 },
        { x: '产品C', y: 20 },
        { x: '产品D', y: 12 },
        { x: '产品E', y: 8 },
      ],
    },
  ],
})

// 状态
const lineSmooth = ref(false)
const pieDonut = ref(false)
const currentTheme = ref<'default' | 'dark'>('default')

// ==================== 工具函数 ====================

function randomData(count: number, min: number = 10, max: number = 100): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min) + min))
}

// ==================== 事件处理 ====================

function handleChartClick(params: ChartEventMap['click']) {
  console.log('图表点击:', params)
}

// ==================== 更新函数 ====================

function updateLineData() {
  lineData.datasets = [
    { name: '2023年', data: randomData(6, 50, 120) },
    { name: '2024年', data: randomData(6, 70, 150) },
  ]
}

function updateBarData() {
  barData.datasets = [
    { name: 'Q1', data: randomData(5, 60, 180) },
    { name: 'Q2', data: randomData(5, 80, 200) },
  ]
}

function updatePieData() {
  const values = randomData(5, 10, 50)
  pieData.datasets = [
    {
      data: [
        { x: '产品A', y: values[0] },
        { x: '产品B', y: values[1] },
        { x: '产品C', y: values[2] },
        { x: '产品D', y: values[3] },
        { x: '产品E', y: values[4] },
      ],
    },
  ]
}

function toggleTheme() {
  currentTheme.value = currentTheme.value === 'default' ? 'dark' : 'default'
}
</script>

<template>
  <div class="app" :class="{ dark: currentTheme === 'dark' }">
    <header class="header">
      <h1>🚀 LChart Vue Demo</h1>
      <button @click="toggleTheme" class="theme-btn">
        {{ currentTheme === 'default' ? '🌙 暗色' : '☀️ 亮色' }}
      </button>
    </header>

    <main class="chart-grid">
      <!-- 折线图 -->
      <div class="chart-card">
        <h3>📈 折线图 - LineChart 组件</h3>
        <LineChart
          :data="lineData"
          title="月度销售趋势"
          :smooth="lineSmooth"
          height="320px"
          :theme="currentTheme"
          @click="handleChartClick"
        />
        <div class="controls">
          <button @click="updateLineData">更新数据</button>
          <button class="secondary" @click="lineSmooth = !lineSmooth">
            {{ lineSmooth ? '关闭平滑' : '开启平滑' }}
          </button>
        </div>
      </div>

      <!-- 柱状图 -->
      <div class="chart-card">
        <h3>📊 柱状图 - BarChart 组件</h3>
        <BarChart
          :data="barData"
          title="各部门业绩对比"
          height="320px"
          :theme="currentTheme"
          :border-radius="4"
          @click="handleChartClick"
        />
        <div class="controls">
          <button @click="updateBarData">更新数据</button>
        </div>
      </div>

      <!-- 饼图 -->
      <div class="chart-card">
        <h3>🥧 饼图 - PieChart 组件</h3>
        <PieChart
          :data="pieData"
          title="市场份额分布"
          height="320px"
          :theme="currentTheme"
          :donut="pieDonut"
          @click="handleChartClick"
        />
        <div class="controls">
          <button @click="updatePieData">更新数据</button>
          <button class="secondary" @click="pieDonut = !pieDonut">
            {{ pieDonut ? '普通饼图' : '环形图' }}
          </button>
        </div>
      </div>

      <!-- 通用组件 LChart -->
      <div class="chart-card">
        <h3>🎯 通用组件 - LChart</h3>
        <LChart
          type="line"
          :data="{
            labels: months,
            datasets: [
              { name: 'UV', data: [820, 932, 901, 934, 1290, 1330] },
              { name: 'PV', data: [1200, 1400, 1300, 1500, 1800, 2000] },
            ],
          }"
          :options="{
            title: { text: '流量趋势', subtext: '使用 LChart 通用组件' },
            series: [
              { type: 'line', smooth: true, areaStyle: { opacity: 0.4 } },
              { type: 'line', smooth: true, areaStyle: { opacity: 0.4 } },
            ],
          }"
          height="320px"
          :theme="currentTheme"
          @click="handleChartClick"
        />
        <div class="controls">
          <span class="hint">✨ 支持任意图表类型和完整配置</span>
        </div>
      </div>
    </main>

    <footer class="footer">
      <p>📦 @ldesign/chart-vue + @ldesign/chart-core</p>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: #f5f7fa;
  transition: background 0.3s, color 0.3s;
}

.app.dark {
  background: #0d1117;
  color: #e6edf3;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.app.dark .header {
  background: #161b22;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.header h1 {
  font-size: 24px;
  color: #333;
}

.app.dark .header h1 {
  color: #e6edf3;
}

.theme-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #5470c6;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  padding: 30px 40px;
  max-width: 1600px;
  margin: 0 auto;
}

.chart-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.app.dark .chart-card {
  background: #161b22;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.chart-card h3 {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  color: #333;
  font-size: 16px;
}

.app.dark .chart-card h3 {
  border-color: #30363d;
  color: #e6edf3;
}

.controls {
  padding: 16px 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.app.dark .controls {
  border-color: #30363d;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #5470c6;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

button:hover {
  background: #4060b6;
}

button.secondary {
  background: #91cc75;
}

button.secondary:hover {
  background: #81bc65;
}

.hint {
  color: #888;
  font-size: 13px;
}

.footer {
  text-align: center;
  padding: 30px;
  color: #888;
  font-size: 14px;
}
</style>
