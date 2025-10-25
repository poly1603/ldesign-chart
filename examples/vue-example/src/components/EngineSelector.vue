<template>
  <div class="engine-selector">
    <h3>🔧 图表引擎</h3>
    <div class="engine-buttons">
      <button 
        :class="{ active: modelValue === 'echarts' }"
        @click="$emit('update:modelValue', 'echarts')"
        title="使用 ECharts 引擎"
      >
        📊 ECharts
      </button>
      <button 
        :class="{ active: modelValue === 'vchart' }"
        @click="$emit('update:modelValue', 'vchart')"
        :disabled="!isVChartAvailable"
        title="使用 VChart 引擎"
      >
        📈 VChart
        <span v-if="!isVChartAvailable" class="disabled-badge">未安装</span>
      </button>
      <button 
        :class="{ active: modelValue === 'auto' }"
        @click="$emit('update:modelValue', 'auto')"
        title="自动选择最佳引擎"
      >
        🤖 Auto
      </button>
    </div>
    <p class="engine-info">
      当前引擎: <strong>{{ modelValue }}</strong>
      <span v-if="modelValue === 'auto'" class="hint">（根据图表类型自动选择）</span>
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: 'echarts' | 'vchart' | 'auto'
  isVChartAvailable: boolean
}>()

defineEmits<{
  'update:modelValue': [value: 'echarts' | 'vchart' | 'auto']
}>()
</script>

<style scoped>
.engine-selector {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.engine-selector h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
}

.engine-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.engine-buttons button {
  flex: 1;
  padding: 10px 16px;
  border: 2px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.1);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  position: relative;
}

.engine-buttons button:hover:not(:disabled) {
  background: rgba(255,255,255,0.2);
  border-color: rgba(255,255,255,0.5);
  transform: translateY(-2px);
}

.engine-buttons button.active {
  background: white;
  color: #667eea;
  border-color: white;
  font-weight: 600;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.engine-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.disabled-badge {
  font-size: 10px;
  display: block;
  margin-top: 2px;
}

.engine-info {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
}

.engine-info strong {
  color: #fff;
  text-transform: uppercase;
}

.hint {
  font-size: 11px;
  opacity: 0.8;
}
</style>


