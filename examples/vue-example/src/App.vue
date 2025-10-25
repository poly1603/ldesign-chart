<template>
  <div class="app" :class="{ 'dark-mode': darkMode }">
    <!-- Header -->
    <header class="app-header">
      <div class="header-content">
        <h1>@ldesign/chart v2.0 - Vue 3 完整示例</h1>
        <p class="subtitle">13种图表类型 · 双引擎支持 · 响应式设计</p>
      </div>
      
      <div class="header-controls">
        <EngineSelector 
          v-model="currentEngine"
          :is-v-chart-available="isVChartAvailable"
        />
        
        <button class="dark-mode-toggle" @click="darkMode = !darkMode">
          {{ darkMode ? '🌞' : '🌙' }}
        </button>
      </div>
    </header>

    <!-- Tabs -->
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.icon }} {{ tab.label }}
        <span class="count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Charts Grid -->
    <div class="charts-container">
      <!-- 基础图表 -->
      <div v-show="activeTab === 'basic'" class="charts-grid">
        <ChartDemo
          v-for="(chart, type) in basicChartsData"
          :key="type"
          :title="chart.title"
          :description="chart.description"
          :type="type as string"
          :data="chart.data"
          :engine="currentEngine"
        />
      </div>

      <!-- 高级图表 -->
      <div v-show="activeTab === 'advanced'" class="charts-grid">
        <ChartDemo
          v-for="(chart, type) in advancedChartsData"
          :key="type"
          :title="chart.title"
          :description="chart.description"
          :badge="chart.badge"
          :type="type as string"
          :data="chart.data"
          :engine="currentEngine"
        />
      </div>

      <!-- 3D图表（VChart Only）-->
      <div v-show="activeTab === '3d'" class="charts-grid">
        <div v-if="!isVChartAvailable" class="warning-banner">
          <h3>⚠️ VChart 未安装</h3>
          <p>3D 图表需要 VChart 引擎支持</p>
          <code>pnpm add @visactor/vchart</code>
        </div>
        
        <template v-else>
          <ChartDemo
            v-for="(chart, type) in vchartChartsData"
            :key="type"
            :title="chart.title"
            :description="chart.description"
            :badge="chart.badge"
            :type="type as string"
            :data="chart.data"
            engine="vchart"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EngineSelector from './components/EngineSelector.vue'
import ChartDemo from './components/ChartDemo.vue'
import { useEngineSwitch } from './composables/useEngineSwitch'
import { basicChartsData } from './data/basicCharts'
import { advancedChartsData } from './data/advancedCharts'
import { vchartChartsData } from './data/vchartOnly'

// 引擎切换
const { currentEngine, isVChartAvailable, switchEngine } = useEngineSwitch()

// Tab 状态
const activeTab = ref('basic')
const darkMode = ref(false)

const tabs = [
  { id: 'basic', icon: '📊', label: '基础图表', count: Object.keys(basicChartsData).length },
  { id: 'advanced', icon: '🎨', label: '高级图表', count: Object.keys(advancedChartsData).length },
  { id: '3d', icon: '🎭', label: '3D图表', count: Object.keys(vchartChartsData).length }
]
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: #f5f7fa;
  transition: background 0.3s;
}

.app.dark-mode {
  background: #1a1a1a;
  color: #fff;
}

.app-header {
  background: white;
  padding: 24px 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.app.dark-mode .app-header {
  background: #2a2a2a;
}

.header-content h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #999;
}

.header-controls {
  display: flex;
  gap: 16px;
  align-items: center;
}

.dark-mode-toggle {
  padding: 10px 16px;
  border: none;
  background: #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s;
}

.dark-mode-toggle:hover {
  transform: scale(1.1);
}

.tabs {
  display: flex;
  gap: 8px;
  padding: 24px 32px 0;
  background: transparent;
}

.tabs button {
  padding: 12px 24px;
  border: none;
  background: white;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.app.dark-mode .tabs button {
  background: #2a2a2a;
  color: #999;
}

.tabs button:hover {
  background: #f5f5f5;
  color: #333;
}

.tabs button.active {
  background: white;
  color: #667eea;
  font-weight: 600;
  box-shadow: 0 -2px 8px rgba(102, 126, 234, 0.15);
}

.app.dark-mode .tabs button.active {
  background: #363636;
  color: #667eea;
}

.count {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  color: #999;
}

.tabs button.active .count {
  background: #667eea;
  color: white;
}

.charts-container {
  padding: 24px 32px 32px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .app-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-controls {
    width: 100%;
  }
}

.warning-banner {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
  padding: 32px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(253, 203, 110, 0.3);
}

.warning-banner h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #d63031;
}

.warning-banner p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #636e72;
}

.warning-banner code {
  background: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-family: 'Consolas', monospace;
  font-size: 13px;
  color: #d63031;
  display: inline-block;
}
</style>
