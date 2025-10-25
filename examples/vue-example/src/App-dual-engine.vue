<template>
  <div class="container">
    <h1>@ldesign/chart v2.0.0 - 双引擎演示</h1>

    <div class="version-badge">
      <span class="badge">✅ 双引擎架构</span>
      <span class="badge">✅ ECharts + VChart</span>
      <span class="badge">✅ 小程序支持</span>
    </div>

    <div class="controls">
      <button @click="toggleDarkMode">
        {{ darkMode ? '🌞 亮色' : '🌙 暗色' }}
      </button>
      <button @click="refreshData">🔄 刷新数据</button>
      <button @click="switchEngine">
        🔄 切换引擎: {{ currentEngine }}
      </button>
    </div>

    <div class="chart-grid">
      <!-- ECharts 引擎图表 -->
      <div class="chart-card">
        <h2>折线图 <span class="engine-tag echarts">ECharts 引擎</span></h2>
        <Chart type="line" :data="lineData" title="月度销售趋势" :dark-mode="darkMode" :height="300" engine="echarts" />
      </div>

      <!-- VChart 引擎图表 -->
      <div class="chart-card">
        <h2>柱状图 <span class="engine-tag vchart">VChart 引擎</span></h2>
        <Chart type="bar" :data="barData" title="季度销售额" :dark-mode="darkMode" :height="300" engine="vchart" />
      </div>
    </div>

    <div class="info">
      <h3>💡 双引擎架构说明</h3>
      <p>上面两个图表使用了不同的引擎，但配置代码完全相同！只需指定 <code>engine</code> 参数即可。</p>
      <ul>
        <li><strong>ECharts</strong>: 成熟稳定，适合 Web 应用</li>
        <li><strong>VChart</strong>: 小程序优先，支持 3D 图表</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Chart } from '@ldesign/chart-vue'
import { EChartsEngine, VChartEngine, engineManager } from '@ldesign/chart-core'

// 初始化引擎
onMounted(() => {
  // 注册两个引擎
  engineManager.register('echarts', new EChartsEngine())
  engineManager.register('vchart', new VChartEngine())
  console.log('✅ 双引擎初始化成功')
})

// 状态
const darkMode = ref(false)
const currentEngine = ref('echarts')

// 数据
const lineData = ref([120, 200, 150, 80, 70, 110, 130])
const barData = ref({
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [{ name: '销售额', data: [100, 200, 150, 300] }]
})

// 方法
const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
}

const refreshData = () => {
  lineData.value = Array.from({ length: 7 }, () => Math.floor(Math.random() * 200) + 50)
  barData.value = {
    ...barData.value,
    datasets: [{ name: '销售额', data: Array.from({ length: 4 }, () => Math.floor(Math.random() * 300) + 50) }]
  }
}

const switchEngine = () => {
  currentEngine.value = currentEngine.value === 'echarts' ? 'vchart' : 'echarts'
}
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.version-badge {
  text-align: center;
  margin-bottom: 30px;
}

.badge {
  display: inline-block;
  padding: 8px 16px;
  margin: 0 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.controls {
  text-align: center;
  margin: 30px 0;
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
}

button:active {
  transform: translateY(0);
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
  gap: 24px;
  margin-top: 30px;
}

.chart-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.chart-card h2 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.engine-tag {
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: normal;
}

.echarts {
  background: #5470c6;
  color: white;
}

.vchart {
  background: #91cc75;
  color: white;
}

.info {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  padding: 24px;
  border-radius: 12px;
  margin-top: 30px;
  border-left: 4px solid #667eea;
}

.info h3 {
  margin: 0 0 12px 0;
  color: #667eea;
}

.info p {
  color: #666;
  line-height: 1.6;
  margin: 8px 0;
}

.info ul {
  margin: 12px 0 0 20px;
  color: #666;
}

.info li {
  margin: 6px 0;
  line-height: 1.6;
}

.info code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  color: #667eea;
  font-family: 'Courier New', monospace;
}
</style>
