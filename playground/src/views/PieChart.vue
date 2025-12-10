<script setup lang="ts">
import { ref, computed } from 'vue'
import ChartExample from '@/components/ChartExample.vue'
import type { ChartOptions, PieAnimationType } from '@ldesign/chart-core'

const props = defineProps<{ useMode: 'native' | 'vue'; rendererType: 'canvas' | 'svg'; isDark: boolean }>()

const pieData = [
  { name: '搜索引擎', value: 1048 },
  { name: '直接访问', value: 735 },
  { name: '邮件营销', value: 580 },
  { name: '联盟广告', value: 484 },
  { name: '视频广告', value: 300 }
]

const deviceData = [
  { name: 'iPhone', value: 40 },
  { name: 'Android', value: 35 },
  { name: 'iPad', value: 15 },
  { name: '其他', value: 10 }
]

const colorfulData = [
  { name: '类别A', value: 335, color: '#5470c6' },
  { name: '类别B', value: 310, color: '#91cc75' },
  { name: '类别C', value: 234, color: '#fac858' },
  { name: '类别D', value: 135, color: '#ee6666' },
  { name: '类别E', value: 154, color: '#73c0de' }
]

const examples = ref([
  {
    id: 'basic', title: '基础饼图',
    options: { series: [{ type: 'pie', data: [...pieData], radius: 0.7 }], animationType: 'grow' } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

const chart = new Chart('#container', {
  series: [{
    type: 'pie',
    data: [
      { name: '搜索引擎', value: 1048 },
      { name: '直接访问', value: 735 },
      { name: '邮件营销', value: 580 },
      { name: '联盟广告', value: 484 },
      { name: '视频广告', value: 300 }
    ],
    radius: 0.7  // 半径为容器的 70%
  }],
  animationType: 'grow'
})`,
    vueCode: `<template>
  <LChart :options="chartOptions" />
</template>

<script setup>
import { LChart } from '@ldesign/chart-vue'

const chartOptions = {
  series: [{
    type: 'pie',
    data: [
      { name: '搜索引擎', value: 1048 },
      { name: '直接访问', value: 735 },
      { name: '邮件营销', value: 580 },
      { name: '联盟广告', value: 484 },
      { name: '视频广告', value: 300 }
    ],
    radius: 0.7
  }]
}
<\/script>`,
  },
  {
    id: 'doughnut', title: '环形图',
    options: { series: [{ type: 'pie', data: [...pieData], radius: [0.5, 0.8] }], animationType: 'grow' } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

// 环形图 - radius: [内半径, 外半径]
const chart = new Chart('#container', {
  series: [{
    type: 'pie',
    data: pieData,
    radius: [0.5, 0.8]  // [内半径, 外半径]
  }]
})`,
    vueCode: `<template>
  <LChart :options="chartOptions" />
</template>

<script setup>
import { LChart } from '@ldesign/chart-vue'

// 环形图 - radius: [0.5, 0.8]
const chartOptions = {
  series: [{
    type: 'pie',
    data: pieData,
    radius: [0.5, 0.8]  // 设置内外半径创建环形
  }]
}
<\/script>`,
  },
  {
    id: 'rose', title: '南丁格尔玫瑰图',
    options: { series: [{ type: 'pie', data: [...pieData], radius: [0.2, 0.8], roseType: 'radius' }], animationType: 'grow' } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

// 南丁格尔玫瑰图 - roseType: 'radius'
const chart = new Chart('#container', {
  series: [{
    type: 'pie',
    data: pieData,
    radius: [0.2, 0.8],
    roseType: 'radius'  // 'radius' | 'area'
  }]
})`,
    vueCode: `<template>
  <LChart :options="chartOptions" />
</template>

<script setup>
import { LChart } from '@ldesign/chart-vue'

// 南丁格尔玫瑰图
const chartOptions = {
  series: [{
    type: 'pie',
    data: pieData,
    radius: [0.2, 0.8],
    roseType: 'radius'  // 玫瑰图类型
  }]
}
<\/script>`,
  },
  {
    id: 'label', title: '带标签饼图',
    options: { series: [{ type: 'pie', data: [...pieData], radius: 0.6, label: { show: true, position: 'outside' } }] } as ChartOptions,
    nativeCode: `// 带标签饼图
const chart = new Chart('#container', {
  series: [{ type: 'pie', data: pieData, radius: 0.6, label: { show: true } }]
})`,
    vueCode: `<LChart :options="chartOptions" />
// label: { show: true } 显示标签`,
  },
  // ========== 旋转动画 ==========
  {
    id: 'spin', title: '旋转动画',
    options: { series: [{ type: 'pie', data: [...deviceData], radius: 0.7, pieAnimationType: 'spin' }] } as ChartOptions,
    nativeCode: `// 旋转动画 - 扇形旋转进入
const chart = new Chart('#container', {
  series: [{ type: 'pie', data: [...], radius: 0.7, pieAnimationType: 'spin' }]
})`,
    vueCode: `<LChart :options="chartOptions" />
// pieAnimationType: 'spin' - 旋转进入`,
  },
  // ========== 级联动画 ==========
  {
    id: 'cascade', title: '级联动画',
    options: { series: [{ type: 'pie', data: [...pieData], radius: 0.7, pieAnimationType: 'cascade' }] } as ChartOptions,
    nativeCode: `// 级联动画 - 扇形依次展开
const chart = new Chart('#container', {
  series: [{ type: 'pie', data: [...], radius: 0.7, pieAnimationType: 'cascade' }]
})`,
    vueCode: `<LChart :options="chartOptions" />
// pieAnimationType: 'cascade' - 扇形依次展开`,
  },
  // ========== 弹出动画 ==========
  {
    id: 'fan', title: '弹出动画',
    options: { series: [{ type: 'pie', data: [...colorfulData], radius: 0.7, pieAnimationType: 'fan' }] } as ChartOptions,
    nativeCode: `// 弹出动画 - 扇形依次弹出（带弹性）
const chart = new Chart('#container', {
  series: [{ type: 'pie', data: [...], radius: 0.7, pieAnimationType: 'fan' }]
})`,
    vueCode: `<LChart :options="chartOptions" />
// pieAnimationType: 'fan' - 带弹性的弹出效果`,
  },
  // ========== 半圆饼图 ==========
  {
    id: 'half-pie', title: '半圆饼图',
    options: { series: [{ type: 'pie', data: [...deviceData], radius: [0.3, 0.8], sweepAngle: Math.PI, startAngle: -Math.PI, pieAnimationType: 'expand' }] } as ChartOptions,
    nativeCode: `// 半圆饼图 - sweepAngle: Math.PI
const chart = new Chart('#container', {
  series: [{
    type: 'pie',
    data: [...],
    radius: [0.3, 0.8],
    sweepAngle: Math.PI,       // 半圆
    startAngle: -Math.PI       // 从左边开始
  }]
})`,
    vueCode: `<LChart :options="chartOptions" />
// sweepAngle: Math.PI 设置为半圆`,
  },
  // ========== 自定义颜色 ==========
  {
    id: 'custom-color', title: '自定义颜色',
    options: { series: [{ type: 'pie', data: [...colorfulData], radius: 0.7, pieAnimationType: 'bounce' }] } as ChartOptions,
    nativeCode: `// 自定义颜色 - 每个数据项指定 color
const chart = new Chart('#container', {
  series: [{
    type: 'pie',
    data: [
      { name: '类别A', value: 335, color: '#5470c6' },
      { name: '类别B', value: 310, color: '#91cc75' },
      // ...
    ]
  }]
})`,
    vueCode: `<LChart :options="chartOptions" />
// 每个数据项可以指定 color 属性`,
  },
  // ========== 大内径环形图 ==========
  {
    id: 'thin-ring', title: '细环形图',
    options: { series: [{ type: 'pie', data: [...pieData], radius: [0.7, 0.85], pieAnimationType: 'scale' }] } as ChartOptions,
    nativeCode: `// 细环形图 - 大内半径
const chart = new Chart('#container', {
  series: [{ type: 'pie', data: [...], radius: [0.7, 0.85] }]
})`,
    vueCode: `<LChart :options="chartOptions" />
// radius: [0.7, 0.85] 创建细环形`,
  },
  // ========== 玫瑰环形图 ==========
  {
    id: 'rose-ring', title: '玫瑰环形图',
    options: { series: [{ type: 'pie', data: [...pieData], radius: [0.3, 0.8], roseType: 'radius', pieAnimationType: 'fan' }] } as ChartOptions,
    nativeCode: `// 玫瑰环形图 - 环形 + 玫瑰图
const chart = new Chart('#container', {
  series: [{
    type: 'pie',
    data: [...],
    radius: [0.3, 0.8],  // 环形
    roseType: 'radius'   // 玫瑰图模式
  }]
})`,
    vueCode: `<LChart :options="chartOptions" />
// radius + roseType 组合`,
  },
  // ========== 3/4圆环 ==========
  {
    id: 'three-quarter', title: '仪表盘风格',
    options: { series: [{ type: 'pie', data: [
      { name: '已完成', value: 75, color: '#10b981' },
      { name: '未完成', value: 25, color: '#e5e7eb', noHover: true }
    ], radius: [0.6, 0.8], sweepAngle: Math.PI * 1.5, startAngle: -Math.PI * 1.25, cornerRadius: 8, pieAnimationType: 'expand', label: { show: false } }] } as ChartOptions,
    nativeCode: `// 仪表盘风格 - 3/4圆环
const chart = new Chart('#container', {
  series: [{
    type: 'pie',
    data: [
      { name: '已完成', value: 75, color: '#10b981' },
      { name: '未完成', value: 25, color: '#e5e7eb', noHover: true }
    ],
    radius: [0.6, 0.8],
    cornerRadius: 8,              // 圆角
    sweepAngle: Math.PI * 1.5,    // 3/4圆
    startAngle: -Math.PI * 1.25   // 起始角度
  }]
})`,
    vueCode: `<LChart :options="chartOptions" />
// noHover: true 禁用该扇形的悬停效果`,
  },
  // ========== 带缝隙环形图 ==========
  {
    id: 'gap-ring', title: '带缝隙环形图',
    options: { series: [{ type: 'pie', data: [...colorfulData], radius: [0.5, 0.85], padAngle: 0.05, pieAnimationType: 'cascade' }] } as ChartOptions,
    nativeCode: `// 带缝隙环形图 - padAngle 设置缝隙
const chart = new Chart('#container', {
  series: [{
    type: 'pie',
    data: [...],
    radius: [0.5, 0.85],
    padAngle: 0.05  // 缝隙角度（弧度）
  }]
})`,
    vueCode: `<LChart :options="chartOptions" />
// padAngle: 0.05 设置扇形间缝隙`,
  },
  // ========== 嵌套环形图 ==========
  {
    id: 'nested-ring', title: '嵌套环形图',
    options: { series: [
      { type: 'pie', data: [
        { name: '搜索引擎', value: 60, color: '#5470c6' },
        { name: '直接访问', value: 25, color: '#91cc75' },
        { name: '其他', value: 15, color: '#fac858' }
      ], radius: [0, 0.4], label: { show: false }, pieAnimationType: 'scale' },
      { type: 'pie', data: [
        { name: 'Google', value: 35, color: '#73c0de' },
        { name: 'Bing', value: 15, color: '#3ba272' },
        { name: 'Baidu', value: 10, color: '#fc8452' },
        { name: '直接访问', value: 25, color: '#91cc75' },
        { name: '邮件', value: 8, color: '#ee6666' },
        { name: '广告', value: 7, color: '#9a60b4' }
      ], radius: [0.55, 0.85], padAngle: 0.02, pieAnimationType: 'cascade' }
    ] } as ChartOptions,
    nativeCode: `// 嵌套环形图 - 多个 pie series
const chart = new Chart('#container', {
  series: [
    { type: 'pie', data: [...], radius: [0, 0.4] },      // 内层饼图
    { type: 'pie', data: [...], radius: [0.55, 0.85] }  // 外层环形
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// 多个 pie series 实现嵌套效果`,
  },
  // ========== 大缝隙环形图 ==========
  {
    id: 'big-gap', title: '分离环形图',
    options: { series: [{ type: 'pie', data: [...deviceData], radius: [0.4, 0.8], padAngle: 0.08, cornerRadius: 8, pieAnimationType: 'fan' }] } as ChartOptions,
    nativeCode: `// 分离环形图 - 大缝隙 + 圆角效果
const chart = new Chart('#container', {
  series: [{
    type: 'pie',
    data: [...],
    radius: [0.4, 0.8],
    padAngle: 0.15,    // 较大的缝隙
    cornerRadius: 6    // 圆角
  }]
})`,
    vueCode: `<LChart :options="chartOptions" />
// padAngle + cornerRadius 组合效果`,
  },
])

const exampleCount = computed(() => examples.value.length)

function refreshExample(index: number) {
  const e = examples.value[index]
  const s = e?.options.series?.[0] as any
  if (s?.data) {
    e.options = {
      ...e.options,
      series: [{
        ...s,
        data: s.data.map((d: any) => ({ ...d, value: Math.floor(Math.random() * 1000) + 100 }))
      }]
    }
  }
}

// 全局动画类型选择
const globalAnimation = ref<PieAnimationType>('cascade')
const animationOptions = [
  { value: 'cascade', label: '级联', desc: '扇形依次展开' },
  { value: 'fan', label: '弹出', desc: '扇形依次弹出（带弹性）' },
  { value: 'spin', label: '旋转', desc: '整体旋转进入' },
  { value: 'expand', label: '展开', desc: '整体扇形展开' },
  { value: 'scale', label: '缩放', desc: '整体从中心放大' },
  { value: 'bounce', label: '回弹', desc: '缩放带回弹效果' },
  { value: 'fade', label: '淡入', desc: '渐变显示' },
  { value: 'none', label: '无动画', desc: '直接显示' },
]

// 应用全局动画到示例
const examplesWithAnimation = computed(() => 
  examples.value.map(e => ({
    ...e,
    options: { 
      ...e.options, 
      series: e.options.series?.map((s: any) => ({
        ...s,
        pieAnimationType: globalAnimation.value
      }))
    }
  }))
)

defineExpose({ exampleCount })
</script>

<template>
  <div class="pie-chart-page">
    <!-- 左侧内容区 -->
    <div class="main-content">
      <div class="page-header">
        <div class="title-row">
          <h2 class="page-title">饼图示例</h2>
          <span class="example-count">{{ exampleCount }} 个示例</span>
        </div>
        <p class="page-desc">饼图用于展示数据的占比关系，适合显示分类数据的比例分布。支持环形图、南丁格尔玫瑰图、嵌套饼图等多种变体。</p>
      </div>
      <div class="examples-grid">
        <ChartExample 
          v-for="(e, i) in examplesWithAnimation" 
          :key="e.id + '-' + i + '-' + globalAnimation" 
          :title="e.title" 
          :options="e.options"
          :native-code="e.nativeCode" 
          :vue-code="e.vueCode" 
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
          v-for="opt in animationOptions" 
          :key="opt.value"
          class="animation-option"
          :class="{ active: globalAnimation === opt.value }"
        >
          <input 
            type="radio" 
            :value="opt.value" 
            v-model="globalAnimation"
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
.pie-chart-page {
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
