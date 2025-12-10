<script setup lang="ts">
import { ref, computed } from 'vue'
import ChartExample from '@/components/ChartExample.vue'
import type { ChartOptions, ScatterAnimationType } from '@ldesign/chart-core'

const props = defineProps<{ useMode: 'native' | 'vue'; rendererType: 'canvas' | 'svg'; isDark: boolean }>()

// 动画类型选项
const animationTypes: { value: ScatterAnimationType; label: string; desc: string }[] = [
  { value: 'scale', label: '缩放', desc: '点从小到大缩放出现' },
  { value: 'fade', label: '淡入', desc: '渐变显示' },
  { value: 'rise', label: '升起', desc: '从底部升起' },
  { value: 'ripple', label: '涟漪', desc: '弹性涟漪效果' },
  { value: 'cascade', label: '级联', desc: '依次出现' },
  { value: 'none', label: '无动画', desc: '直接显示' },
]
const selectedAnimationType = ref<ScatterAnimationType>('scale')

// 基础散点数据
const basicData = [
  { x: 10, y: 8.04 },
  { x: 8, y: 6.95 },
  { x: 13, y: 7.58 },
  { x: 9, y: 8.81 },
  { x: 11, y: 8.33 },
  { x: 14, y: 9.96 },
  { x: 6, y: 7.24 },
  { x: 4, y: 4.26 },
  { x: 12, y: 10.84 },
  { x: 7, y: 4.82 },
  { x: 5, y: 5.68 }
]

// 多系列数据
const seriesAData = [
  { x: 1, y: 4.5 }, { x: 2, y: 5.2 }, { x: 3, y: 3.8 }, { x: 4, y: 6.1 },
  { x: 5, y: 5.5 }, { x: 6, y: 7.2 }, { x: 7, y: 6.8 }, { x: 8, y: 8.1 }
]
const seriesBData = [
  { x: 1, y: 2.3 }, { x: 2, y: 3.1 }, { x: 3, y: 4.2 }, { x: 4, y: 3.5 },
  { x: 5, y: 4.8 }, { x: 6, y: 5.5 }, { x: 7, y: 4.9 }, { x: 8, y: 6.2 }
]

// 气泡图数据 (x, y, size)
const bubbleData = [
  { x: 10, y: 8, size: 20 },
  { x: 15, y: 12, size: 35 },
  { x: 8, y: 5, size: 15 },
  { x: 20, y: 15, size: 45 },
  { x: 12, y: 10, size: 25 },
  { x: 18, y: 8, size: 30 },
  { x: 6, y: 14, size: 18 },
  { x: 25, y: 18, size: 50 }
]

// 分类散点数据
const categoryLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const categoryData = [120, 200, 150, 80, 70, 110, 130]

// 计算示例配置（响应动画类型变化）
const examples = computed(() => [
  // ========== 基础散点图 ==========
  {
    id: 'basic', title: '基础散点图',
    options: {
      xAxis: { data: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'] },
      yAxis: { min: 0, max: 12 },
      series: [{ type: 'scatter', name: '散点', data: [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68, null, null, null], symbolSize: 10, scatterAnimationType: selectedAnimationType.value }]
    } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

const chart = new Chart('#container', {
  xAxis: { data: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
  yAxis: { min: 0, max: 12 },
  series: [{
    type: 'scatter',
    name: '散点',
    data: [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82],
    symbolSize: 10  // 点的大小
  }]
})`,
    vueCode: `<LChart :options="chartOptions" />

const chartOptions = {
  xAxis: { data: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
  series: [{
    type: 'scatter',
    data: [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82],
    symbolSize: 10
  }]
}`,
  },
  // ========== 多系列散点图 ==========
  {
    id: 'multi-series', title: '多系列散点图',
    options: {
      xAxis: { data: ['1', '2', '3', '4', '5', '6', '7', '8'] },
      yAxis: { min: 0, max: 10 },
      series: [
        { type: 'scatter', name: '系列A', data: [4.5, 5.2, 3.8, 6.1, 5.5, 7.2, 6.8, 8.1], symbolSize: 12, color: '#5470c6' },
        { type: 'scatter', name: '系列B', data: [2.3, 3.1, 4.2, 3.5, 4.8, 5.5, 4.9, 6.2], symbolSize: 12, color: '#91cc75' }
      ]
    } as ChartOptions,
    nativeCode: `// 多系列散点图
const chart = new Chart('#container', {
  xAxis: { data: ['1', '2', '3', '4', '5', '6', '7', '8'] },
  series: [
    { type: 'scatter', name: '系列A', data: [...], symbolSize: 12, color: '#5470c6' },
    { type: 'scatter', name: '系列B', data: [...], symbolSize: 12, color: '#91cc75' }
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// 使用不同颜色区分多个系列`,
  },
  // ========== 散点+折线 ==========
  {
    id: 'scatter-line', title: '散点+趋势线',
    options: {
      xAxis: { data: ['1', '2', '3', '4', '5', '6', '7', '8'] },
      yAxis: { min: 0, max: 10 },
      series: [
        { type: 'scatter', name: '数据点', data: [2.5, 3.8, 3.2, 5.1, 4.5, 6.2, 5.8, 7.1], symbolSize: 10, color: '#ee6666' },
        { type: 'line', name: '趋势线', data: [2.5, 3.5, 4.0, 4.5, 5.0, 5.8, 6.2, 7.0], smooth: true, color: '#5470c6', lineWidth: 2 }
      ]
    } as ChartOptions,
    nativeCode: `// 散点图 + 趋势线组合
const chart = new Chart('#container', {
  xAxis: { data: ['1', '2', '3', '4', '5', '6', '7', '8'] },
  series: [
    { type: 'scatter', name: '数据点', data: [...], symbolSize: 10, color: '#ee6666' },
    { type: 'line', name: '趋势线', data: [...], smooth: true, color: '#5470c6' }
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// 散点图和折线图可以组合使用`,
  },
  // ========== 大数据量散点 ==========
  {
    id: 'large-data', title: '大数据散点',
    options: {
      xAxis: { data: Array.from({ length: 50 }, (_, i) => String(i + 1)) },
      yAxis: { min: 0, max: 100 },
      series: [{
        type: 'scatter',
        name: '随机数据',
        data: Array.from({ length: 50 }, () => Math.random() * 100),
        symbolSize: 6,
        color: '#73c0de'
      }]
    } as ChartOptions,
    nativeCode: `// 大数据量散点图
const data = Array.from({ length: 50 }, () => Math.random() * 100)

const chart = new Chart('#container', {
  xAxis: { data: Array.from({ length: 50 }, (_, i) => String(i + 1)) },
  series: [{
    type: 'scatter',
    data: data,
    symbolSize: 6,  // 小点适合大数据
    color: '#73c0de'
  }]
})`,
    vueCode: `<LChart :options="chartOptions" />
// 大数据量时建议使用较小的 symbolSize`,
  },
  // ========== 分类散点 ==========
  {
    id: 'category', title: '分类散点图',
    options: {
      xAxis: { data: categoryLabels },
      yAxis: { min: 0, max: 250 },
      series: [{
        type: 'scatter',
        name: '访问量',
        data: categoryData,
        symbolSize: 14,
        color: '#fac858'
      }]
    } as ChartOptions,
    nativeCode: `// 分类散点图
const chart = new Chart('#container', {
  xAxis: { data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
  series: [{
    type: 'scatter',
    name: '访问量',
    data: [120, 200, 150, 80, 70, 110, 130],
    symbolSize: 14
  }]
})`,
    vueCode: `<LChart :options="chartOptions" />
// x 轴使用分类数据`,
  },
  // ========== 不同大小的点 ==========
  {
    id: 'varied-size', title: '不同大小散点',
    options: {
      xAxis: { data: ['A', 'B', 'C', 'D', 'E', 'F'] },
      yAxis: { min: 0, max: 100 },
      series: [
        { type: 'scatter', name: '小', data: [20, 35, 45, null, null, null], symbolSize: 8, color: '#91cc75', scatterAnimationType: selectedAnimationType.value },
        { type: 'scatter', name: '中', data: [null, null, null, 55, 65, null], symbolSize: 16, color: '#fac858', scatterAnimationType: selectedAnimationType.value },
        { type: 'scatter', name: '大', data: [null, null, null, null, null, 85], symbolSize: 24, color: '#ee6666', scatterAnimationType: selectedAnimationType.value }
      ]
    } as ChartOptions,
    nativeCode: `// 使用多个系列实现不同大小的点
const chart = new Chart('#container', {
  xAxis: { data: ['A', 'B', 'C', 'D', 'E', 'F'] },
  series: [
    { type: 'scatter', name: '小', data: [20, 35, 45], symbolSize: 8 },
    { type: 'scatter', name: '中', data: [null, null, null, 55, 65], symbolSize: 16 },
    { type: 'scatter', name: '大', data: [null, null, null, null, null, 85], symbolSize: 24 }
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// symbolSize 控制点的大小`,
  },
  // ========== 不同形状散点 ==========
  {
    id: 'shapes', title: '不同形状散点',
    options: {
      xAxis: { data: ['圆形', '方形', '菱形', '三角', '箭头', '标记'] },
      yAxis: { min: 0, max: 100 },
      series: [
        { type: 'scatter', name: '圆形', data: [70, null, null, null, null, null], symbolSize: 14, symbol: 'circle', color: '#5470c6', scatterAnimationType: selectedAnimationType.value },
        { type: 'scatter', name: '方形', data: [null, 60, null, null, null, null], symbolSize: 14, symbol: 'rect', color: '#91cc75', scatterAnimationType: selectedAnimationType.value },
        { type: 'scatter', name: '菱形', data: [null, null, 80, null, null, null], symbolSize: 14, symbol: 'diamond', color: '#fac858', scatterAnimationType: selectedAnimationType.value },
        { type: 'scatter', name: '三角', data: [null, null, null, 50, null, null], symbolSize: 14, symbol: 'triangle', color: '#ee6666', scatterAnimationType: selectedAnimationType.value },
        { type: 'scatter', name: '箭头', data: [null, null, null, null, 75, null], symbolSize: 14, symbol: 'arrow', color: '#73c0de', scatterAnimationType: selectedAnimationType.value },
        { type: 'scatter', name: '标记', data: [null, null, null, null, null, 65], symbolSize: 14, symbol: 'pin', color: '#fc8452', scatterAnimationType: selectedAnimationType.value },
      ]
    } as ChartOptions,
    nativeCode: `// 不同形状的散点
const chart = new Chart('#container', {
  series: [
    { type: 'scatter', data: [...], symbol: 'circle' },   // 圆形（默认）
    { type: 'scatter', data: [...], symbol: 'rect' },     // 方形
    { type: 'scatter', data: [...], symbol: 'diamond' },  // 菱形
    { type: 'scatter', data: [...], symbol: 'triangle' }, // 三角形
    { type: 'scatter', data: [...], symbol: 'arrow' },    // 箭头
    { type: 'scatter', data: [...], symbol: 'pin' },      // 标记点
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// symbol 属性支持: circle, rect, diamond, triangle, arrow, pin`,
  },
  // ========== 多形状分组 ==========
  {
    id: 'multi-shape', title: '多形状分组',
    options: {
      xAxis: { data: ['1', '2', '3', '4', '5', '6', '7', '8'] },
      yAxis: { min: 0, max: 100 },
      series: [
        { type: 'scatter', name: '美洲', data: [45, 52, 38, 61, 55, 72, 68, 81], symbolSize: 12, symbol: 'rect', color: '#5470c6', scatterAnimationType: selectedAnimationType.value },
        { type: 'scatter', name: '亚洲', data: [23, 31, 42, 35, 48, 55, 49, 62], symbolSize: 12, symbol: 'triangle', color: '#73c0de', scatterAnimationType: selectedAnimationType.value },
        { type: 'scatter', name: '欧洲', data: [65, 58, 72, 68, 75, 82, 78, 88], symbolSize: 12, symbol: 'diamond', color: '#fac858', scatterAnimationType: selectedAnimationType.value },
        { type: 'scatter', name: '大洋洲', data: [35, 42, 55, 48, 62, 58, 65, 72], symbolSize: 12, symbol: 'circle', color: '#91cc75', scatterAnimationType: selectedAnimationType.value },
      ]
    } as ChartOptions,
    nativeCode: `// 多形状分组散点图 - 类似参考图
const chart = new Chart('#container', {
  series: [
    { type: 'scatter', name: '美洲', data: [...], symbol: 'rect', color: '#5470c6' },
    { type: 'scatter', name: '亚洲', data: [...], symbol: 'triangle', color: '#73c0de' },
    { type: 'scatter', name: '欧洲', data: [...], symbol: 'diamond', color: '#fac858' },
    { type: 'scatter', name: '大洋洲', data: [...], symbol: 'circle', color: '#91cc75' },
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// 不同系列使用不同形状区分数据组`,
  },
  // ========== 大数据量 + DataZoom ==========
  {
    id: 'data-zoom', title: '大数据量 + DataZoom',
    options: {
      xAxis: { data: Array.from({ length: 100 }, (_, i) => `${i + 1}`) },
      yAxis: { min: 0, max: 120 },
      series: [
        { 
          type: 'scatter', 
          name: '数据点', 
          data: Array.from({ length: 100 }, () => Math.floor(Math.random() * 100 + 10)), 
          symbolSize: 8, 
          color: '#5470c6',
          scatterAnimationType: selectedAnimationType.value 
        },
      ],
      dataZoom: { show: true, start: 0, end: 50 },
    } as ChartOptions,
    nativeCode: `// 大数据量散点图 + DataZoom 滚动
const chart = new Chart('#container', {
  xAxis: { data: Array.from({ length: 100 }, (_, i) => (i+1).toString()) },
  series: [{ 
    type: 'scatter', 
    data: [...100个数据点], 
    symbolSize: 8 
  }],
  dataZoom: { show: true, start: 0, end: 50 }
})`,
    vueCode: `<LChart :options="chartOptions" />
// 拖拽底部滑块可缩放数据范围`,
  },
])

// 刷新示例
function refreshExample(index: number) {
  // 触发重新渲染
  selectedAnimationType.value = selectedAnimationType.value
}

// 示例数量
const exampleCount = computed(() => examples.value.length)

defineExpose({ exampleCount })
</script>

<template>
  <div class="scatter-chart-page">
    <!-- 左侧内容区 -->
    <div class="main-content">
      <div class="page-header">
        <div class="title-row">
          <h2 class="page-title">散点图示例</h2>
          <span class="example-count">{{ exampleCount }} 个示例</span>
        </div>
        <p class="page-desc">散点图用于展示两个变量之间的相关性，常用于数据分析和趋势发现。支持多种形状（圆形、方形、菱形、三角等）和丰富的动画效果。</p>
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
.scatter-chart-page {
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
  .scatter-chart-page {
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
