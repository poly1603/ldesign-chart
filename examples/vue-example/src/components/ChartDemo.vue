<template>
  <div class="chart-demo-card">
    <div class="chart-header">
      <h3>{{ title }}</h3>
      <div class="badges">
        <span v-if="badge" class="badge badge-primary">{{ badge }}</span>
        <span class="badge badge-engine">{{ engine }}</span>
      </div>
    </div>
    
    <p v-if="description" class="chart-description">
      {{ description }}
    </p>
    
    <div class="chart-container">
      <Chart
        :type="type"
        :data="data"
        :engine="engine"
        :height="height"
        :responsive="true"
        @ready="handleReady"
        @error="handleError"
      />
    </div>
    
    <div class="chart-meta">
      <span class="meta-item">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <circle cx="6" cy="6" r="6"/>
        </svg>
        {{ type }}
      </span>
      <span v-if="chartReady" class="meta-item status-ready">
        ✓ 已加载
      </span>
      <span v-else-if="chartError" class="meta-item status-error">
        ✗ 错误
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Chart } from '@ldesign/chart-vue'

withDefaults(defineProps<{
  title: string
  description?: string
  badge?: string
  type: string
  data: any
  engine: 'echarts' | 'vchart' | 'auto'
  height?: number
}>(), {
  height: 300
})

const chartReady = ref(false)
const chartError = ref(false)

const handleReady = () => {
  chartReady.value = true
  chartError.value = false
}

const handleError = (error: Error) => {
  console.error('Chart error:', error)
  chartError.value = true
  chartReady.value = false
}
</script>

<style scoped>
.chart-demo-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s;
  border: 1px solid #f0f0f0;
}

.chart-demo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  border-color: #667eea;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.chart-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.badges {
  display: flex;
  gap: 6px;
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.badge-engine {
  background: #f0f0f0;
  color: #666;
}

.chart-description {
  margin: 0 0 16px 0;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.chart-container {
  min-height: 300px;
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.chart-meta {
  display: flex;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  color: #999;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-item svg {
  opacity: 0.6;
}

.status-ready {
  color: #52c41a;
  font-weight: 500;
}

.status-error {
  color: #ff4d4f;
  font-weight: 500;
}
</style>


