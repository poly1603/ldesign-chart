<script setup lang="ts">
import { ref, computed } from 'vue'
import ChartExample from '@/components/ChartExample.vue'
import type { ChartOptions, RadarAnimationType } from '@ldesign/chart-core'

const props = defineProps<{ useMode: 'native' | 'vue'; rendererType: 'canvas' | 'svg'; isDark: boolean }>()

// 动画类型选项
const animationTypes: { value: RadarAnimationType; label: string; desc: string }[] = [
  { value: 'scale', label: '缩放', desc: '从中心缩放展开' },
  { value: 'rotate', label: '旋转', desc: '旋转展开' },
  { value: 'fade', label: '淡入', desc: '渐变显示' },
  { value: 'unfold', label: '展开', desc: '各顶点依次展开' },
  { value: 'none', label: '无动画', desc: '直接显示' },
]
const selectedAnimationType = ref<RadarAnimationType>('scale')

// 基础雷达图数据
const basicIndicator = [
  { name: '销售', max: 6500 },
  { name: '管理', max: 16000 },
  { name: '技术', max: 30000 },
  { name: '客服', max: 38000 },
  { name: '研发', max: 52000 },
  { name: '市场', max: 25000 }
]

const basicData = [4200, 3000, 20000, 35000, 50000, 18000]

// 多系列数据
const multiIndicator = [
  { name: '攻击', max: 100 },
  { name: '防御', max: 100 },
  { name: '速度', max: 100 },
  { name: '魔力', max: 100 },
  { name: '智力', max: 100 },
  { name: '体力', max: 100 }
]

const heroAData = [80, 70, 90, 60, 85, 75]
const heroBData = [65, 90, 70, 95, 70, 80]

// 圆形雷达图数据
const circleIndicator = [
  { name: '周一', max: 100 },
  { name: '周二', max: 100 },
  { name: '周三', max: 100 },
  { name: '周四', max: 100 },
  { name: '周五', max: 100 },
  { name: '周六', max: 100 },
  { name: '周日', max: 100 }
]

const weekData1 = [70, 80, 60, 90, 85, 40, 30]
const weekData2 = [50, 60, 70, 75, 80, 90, 85]

// 能力评估数据
const skillIndicator = [
  { name: '编程', max: 10 },
  { name: '设计', max: 10 },
  { name: '沟通', max: 10 },
  { name: '团队', max: 10 },
  { name: '创新', max: 10 }
]

const skillData = [8, 6, 7, 9, 8]

// 使用 computed 使示例响应动画类型变化
const examples = computed(() => [
  // ========== 基础雷达图 ==========
  {
    id: 'basic', title: '基础雷达图',
    options: {
      radar: { indicator: basicIndicator },
      series: [{
        type: 'radar',
        name: '预算分配',
        data: basicData,
        radarAnimationType: selectedAnimationType.value,
      }],
    } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

const chart = new Chart('#container', {
  radar: {
    indicator: [
      { name: '销售', max: 6500 },
      { name: '管理', max: 16000 },
      { name: '技术', max: 30000 },
      { name: '客服', max: 38000 },
      { name: '研发', max: 52000 },
      { name: '市场', max: 25000 }
    ]
  },
  series: [{
    type: 'radar',
    name: '预算分配',
    data: [4200, 3000, 20000, 35000, 50000, 18000]
  }]
})`,
    vueCode: `<template>
  <LChart :options="chartOptions" />
</template>

<script setup>
import { LChart } from '@ldesign/chart-vue'

const chartOptions = {
  radar: {
    indicator: [
      { name: '销售', max: 6500 },
      { name: '管理', max: 16000 },
      // ...
    ]
  },
  series: [{ type: 'radar', data: [...] }]
}
<\/script>`,
  },
  // ========== 多系列雷达图 ==========
  {
    id: 'multi-series', title: '多系列对比',
    options: {
      radar: { indicator: multiIndicator },
      series: [
        {
          type: 'radar',
          name: '英雄A',
          data: heroAData,
          color: '#5470c6',
          radarAnimationType: selectedAnimationType.value,
        },
        {
          type: 'radar',
          name: '英雄B',
          data: heroBData,
          color: '#91cc75',
          radarAnimationType: selectedAnimationType.value,
        },
      ],
    } as ChartOptions,
    nativeCode: `// 多系列雷达图 - 对比两个数据集
const chart = new Chart('#container', {
  radar: {
    indicator: [
      { name: '攻击', max: 100 },
      { name: '防御', max: 100 },
      { name: '速度', max: 100 },
      { name: '魔力', max: 100 },
      { name: '智力', max: 100 },
      { name: '体力', max: 100 }
    ]
  },
  series: [
    { type: 'radar', name: '英雄A', data: [80, 70, 90, 60, 85, 75], color: '#5470c6' },
    { type: 'radar', name: '英雄B', data: [65, 90, 70, 95, 70, 80], color: '#91cc75' }
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// 多系列可以直观对比两组数据`,
  },
  // ========== 圆形雷达图 ==========
  {
    id: 'circle', title: '圆形雷达图',
    options: {
      radar: { indicator: circleIndicator, shape: 'circle' },
      series: [
        {
          type: 'radar',
          name: '实际值',
          data: weekData1,
          color: '#ee6666',
          radarAnimationType: selectedAnimationType.value,
        },
        {
          type: 'radar',
          name: '目标值',
          data: weekData2,
          color: '#73c0de',
          radarAnimationType: selectedAnimationType.value,
        },
      ],
    } as ChartOptions,
    nativeCode: `// 圆形雷达图
const chart = new Chart('#container', {
  radar: {
    indicator: [...],
    shape: 'circle'  // 使用圆形而非多边形
  },
  series: [
    { type: 'radar', name: '实际值', data: [...] },
    { type: 'radar', name: '目标值', data: [...] }
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// shape: 'circle' 切换为圆形网格`,
  },
  // ========== 不填充区域 ==========
  {
    id: 'no-fill', title: '仅线条样式',
    options: {
      radar: { indicator: skillIndicator },
      series: [{
        type: 'radar',
        name: '能力评估',
        data: skillData,
        areaOpacity: 0,
        color: '#fac858',
        radarAnimationType: selectedAnimationType.value,
      }],
    } as ChartOptions,
    nativeCode: `// 不填充区域，仅显示线条
const chart = new Chart('#container', {
  radar: {
    indicator: [
      { name: '编程', max: 10 },
      { name: '设计', max: 10 },
      { name: '沟通', max: 10 },
      { name: '团队', max: 10 },
      { name: '创新', max: 10 }
    ]
  },
  series: [{
    type: 'radar',
    name: '能力评估',
    data: [8, 6, 7, 9, 8],
    areaOpacity: 0  // 不填充区域
  }]
})`,
    vueCode: `<LChart :options="chartOptions" />
// areaOpacity: 0 取消区域填充`,
  },
  // ========== 自定义样式 ==========
  {
    id: 'custom', title: '自定义样式',
    options: {
      radar: {
        indicator: multiIndicator,
        splitNumber: 4,
        axisLine: { lineStyle: { color: 'rgba(100, 100, 100, 0.3)' } },
        splitLine: { lineStyle: { color: 'rgba(100, 100, 100, 0.2)' } },
      },
      series: [{
        type: 'radar',
        name: '能力值',
        data: [90, 85, 75, 80, 70, 95],
        areaOpacity: 0.5,
        color: '#9b59b6',
        radarAnimationType: selectedAnimationType.value,
      }],
    } as ChartOptions,
    nativeCode: `// 自定义分割数和样式
const chart = new Chart('#container', {
  radar: {
    indicator: [...],
    splitNumber: 4,  // 4层分割
    axisLine: { lineStyle: { color: 'rgba(100,100,100,0.3)' } },
    splitLine: { lineStyle: { color: 'rgba(100,100,100,0.2)' } }
  },
  series: [{
    type: 'radar',
    data: [...],
    areaOpacity: 0.5,  // 半透明填充
    color: '#9b59b6'
  }]
})`,
    vueCode: `<LChart :options="chartOptions" />
// 可自定义分割线、轴线样式`,
  },
  // ========== 五边形雷达图 ==========
  {
    id: 'pentagon', title: '五边形雷达图',
    options: {
      radar: {
        indicator: skillIndicator,
        startAngle: 90,
      },
      series: [
        {
          type: 'radar',
          name: '团队A',
          data: [9, 7, 6, 8, 7],
          color: '#3498db',
          areaOpacity: 0.4,
          radarAnimationType: selectedAnimationType.value,
        },
        {
          type: 'radar',
          name: '团队B',
          data: [6, 8, 9, 7, 9],
          color: '#e74c3c',
          areaOpacity: 0.4,
          radarAnimationType: selectedAnimationType.value,
        },
      ],
    } as ChartOptions,
    nativeCode: `// 五边形雷达图
const chart = new Chart('#container', {
  radar: {
    indicator: [
      { name: '编程', max: 10 },
      { name: '设计', max: 10 },
      { name: '沟通', max: 10 },
      { name: '团队', max: 10 },
      { name: '创新', max: 10 }
    ],
    startAngle: 90  // 从顶部开始
  },
  series: [
    { type: 'radar', name: '团队A', data: [9, 7, 6, 8, 7] },
    { type: 'radar', name: '团队B', data: [6, 8, 9, 7, 9] }
  ]
})`,
    vueCode: `<LChart :options="chartOptions" />
// 5个维度形成五边形`,
  },
])

// 示例数量
const exampleCount = computed(() => examples.value.length)

function refreshExample(_index: number) {
  // computed 自动响应，无需手动触发
}

defineExpose({ exampleCount })
</script>

<template>
  <div class="chart-page">
    <div class="page-content">
      <div class="page-header">
        <div class="title-row">
          <h2 class="page-title">雷达图示例</h2>
          <span class="example-count">{{ exampleCount }} 个示例</span>
        </div>
        <p class="page-desc">雷达图（Radar Chart）也叫蜘蛛网图，常用于多维度数据的可视化对比。支持多边形和圆形两种形状，以及多系列数据叠加显示。</p>
      </div>

      <div class="examples-grid">
        <ChartExample
          v-for="(example, index) in examples"
          :key="example.id"
          :title="example.title"
          :options="example.options"
          :native-code="example.nativeCode"
          :vue-code="example.vueCode"
          :use-mode="props.useMode"
          :renderer-type="props.rendererType"
          :is-dark="props.isDark"
          @refresh="refreshExample(index)"
        />
      </div>
    </div>

    <!-- 右侧动画选择面板 -->
    <div class="animation-panel">
      <h3 class="panel-title">动画效果</h3>
      <div class="animation-options">
        <label
          v-for="anim in animationTypes"
          :key="anim.value"
          class="animation-option"
          :class="{ active: selectedAnimationType === anim.value }"
        >
          <input
            type="radio"
            :value="anim.value"
            v-model="selectedAnimationType"
            class="radio-input"
          />
          <div class="option-content">
            <span class="option-label">{{ anim.label }}</span>
            <span class="option-desc">{{ anim.desc }}</span>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-page {
  display: flex;
  gap: 24px;
}

.page-content {
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
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.example-count {
  font-size: 14px;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 10px;
  border-radius: 12px;
}

.page-desc {
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  max-width: 800px;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
}

/* 动画面板 */
.animation-panel {
  position: sticky;
  top: 20px;
  width: 220px;
  height: fit-content;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #1e293b;
}

.animation-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.animation-option {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.animation-option:hover {
  background: #f8fafc;
}

.animation-option.active {
  background: #eff6ff;
  border-color: #3b82f6;
}

.radio-input {
  margin-top: 2px;
  accent-color: #3b82f6;
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.option-label {
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
}

.option-desc {
  font-size: 11px;
  color: #64748b;
}

/* 暗色模式 */
:global(.dark) .example-count {
  background: #334155;
  color: #94a3b8;
}

:global(.dark) .page-desc {
  color: #94a3b8;
}

:global(.dark) .animation-panel {
  background: #1e293b;
  border-color: #334155;
}

:global(.dark) .panel-title {
  color: #f1f5f9;
}

:global(.dark) .animation-option:hover {
  background: #334155;
}

:global(.dark) .animation-option.active {
  background: #1e3a5f;
  border-color: #3b82f6;
}

:global(.dark) .option-label {
  color: #f1f5f9;
}

:global(.dark) .option-desc {
  color: #94a3b8;
}
</style>
