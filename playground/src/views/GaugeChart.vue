<script setup lang="ts">
import { ref, computed } from 'vue'
import ChartPageLayout from '@/components/ChartPageLayout.vue'
import type { ChartOptions, GaugeAnimationType, GaugeDataItem } from '@ldesign/chart-core'

const props = defineProps<{ useMode: 'native' | 'vue'; rendererType: 'canvas' | 'svg'; isDark: boolean }>()

// 动画类型选项
const animationOptions = [
  { value: 'sweep', label: '扫过' },
  { value: 'grow', label: '增长' },
  { value: 'bounce', label: '弹性' },
  { value: 'fade', label: '淡入' },
  { value: 'none', label: '无动画' },
]
const globalAnimation = ref<GaugeAnimationType>('sweep')

// 基础仪表盘数据
const basicGaugeData: GaugeDataItem[] = [
  { value: 72, name: '完成率' }
]

// 速度仪表盘数据
const speedGaugeData: GaugeDataItem[] = [
  { value: 85, name: '速度' }
]

// 温度仪表盘数据
const temperatureGaugeData: GaugeDataItem[] = [
  { value: 36.5, name: '温度' }
]

// 进度仪表盘数据
const progressGaugeData: GaugeDataItem[] = [
  { value: 65, name: '进度' }
]

const examples = computed(() => [
  // ========== 基础仪表盘 ==========
  {
    id: 'basic', title: '基础仪表盘',
    options: {
      series: [{
        type: 'gauge',
        gaugeData: basicGaugeData,
        gaugeAnimationType: globalAnimation.value,
      }]
    } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

const chart = new Chart('#container', {
  series: [{
    type: 'gauge',
    gaugeData: [{ value: 72, name: '完成率' }]
  }]
})`,
    vueCode: `<LChart :options="{ series: [{ type: 'gauge', gaugeData: [{ value: 72, name: '完成率' }] }] }" />`,
  },
  // ========== 速度仪表盘 ==========
  {
    id: 'speed', title: '速度仪表盘',
    options: {
      series: [{
        type: 'gauge',
        gaugeData: speedGaugeData,
        gaugeAnimationType: globalAnimation.value,
        gaugeMax: 120,
        gaugeAxisLineColors: [
          { offset: 0.3, color: '#67e0e3' },
          { offset: 0.6, color: '#37a2da' },
          { offset: 1, color: '#fd666d' }
        ],
        gaugeDetailFormatter: '{value} km/h',
        gaugeDetailFontSize: 20,
        gaugePointerStyle: 'arrow',
      }]
    } as ChartOptions,
    nativeCode: `// 速度仪表盘 - 自定义颜色段和格式化
const chart = new Chart('#container', {
  series: [{
    type: 'gauge',
    gaugeData: [{ value: 85, name: '速度' }],
    gaugeMax: 120,
    gaugeAxisLineColors: [
      { offset: 0.3, color: '#67e0e3' },
      { offset: 0.6, color: '#37a2da' },
      { offset: 1, color: '#fd666d' }
    ],
    gaugeDetailFormatter: '{value} km/h',
    gaugePointerStyle: 'arrow'
  }]
})`,
    vueCode: `<LChart :options="speedOptions" />`,
  },
  // ========== 温度仪表盘 ==========
  {
    id: 'temperature', title: '温度仪表盘',
    options: {
      series: [{
        type: 'gauge',
        gaugeData: temperatureGaugeData,
        gaugeAnimationType: globalAnimation.value,
        gaugeMin: 35,
        gaugeMax: 42,
        gaugeSplitNumber: 7,
        gaugeAxisTick: { show: false },
        gaugeShowGradient: false,
        gaugeAxisLineColors: [
          { offset: 0.3, color: '#91cc75' },
          { offset: 0.7, color: '#fac858' },
          { offset: 1, color: '#ee6666' }
        ],
        gaugeDetailFormatter: (value: number) => `${value.toFixed(1)}°C`,
        gaugeDetailFontSize: 20,
        gaugePointerStyle: 'triangle',
        gaugePointerAutoColor: true,
      }]
    } as ChartOptions,
    nativeCode: `// 温度仪表盘 - 自定义范围和精度
const chart = new Chart('#container', {
  series: [{
    type: 'gauge',
    gaugeData: [{ value: 36.5, name: '温度' }],
    gaugeMin: 35,
    gaugeMax: 42,
    gaugeSplitNumber: 7,
    gaugeDetailFormatter: (value) => \`\${value.toFixed(1)}°C\`
  }]
})`,
    vueCode: `<LChart :options="temperatureOptions" />`,
  },
  // ========== 简洁仪表盘 ==========
  {
    id: 'simple', title: '简洁仪表盘',
    options: {
      series: [{
        type: 'gauge',
        gaugeData: [{ value: 50, name: '进度' }],
        gaugeAnimationType: globalAnimation.value,
        gaugeShowAxisLabel: false,
        gaugeSplitLine: { show: false },
        gaugeAxisTick: { show: false },
        gaugeAxisLineWidth: 25,
        gaugeShowPointer: true,
        gaugePointerStyle: 'triangle',
        gaugePointerLength: 0.5,
        gaugeShowProgress: true,
        gaugeProgressColor: '#5470c6',
        gaugeDetailFontSize: 28,
        gaugeDetailOffset: [0, 25],
      }]
    } as ChartOptions,
    nativeCode: `// 简洁仪表盘 - 无刻度
const chart = new Chart('#container', {
  series: [{
    type: 'gauge',
    gaugeData: [{ value: 50, name: '进度' }],
    gaugeShowAxisLabel: false,
    gaugeSplitLine: { show: false },
    gaugeAxisTick: { show: false },
    gaugeShowProgress: true,
    gaugeProgressColor: '#5470c6'
  }]
})`,
    vueCode: `<LChart :options="simpleOptions" />`,
  },
  // ========== 圆形指针 ==========
  {
    id: 'circle-pointer', title: '圆形指针',
    options: {
      series: [{
        type: 'gauge',
        gaugeData: progressGaugeData,
        gaugeAnimationType: globalAnimation.value,
        gaugePointerStyle: 'circle',
        gaugePointerWidth: 10,
        gaugeAxisLineColors: [
          { offset: 0.5, color: '#73c0de' },
          { offset: 0.8, color: '#5470c6' },
          { offset: 1, color: '#9a60b4' }
        ],
      }]
    } as ChartOptions,
    nativeCode: `// 圆形指针样式
const chart = new Chart('#container', {
  series: [{
    type: 'gauge',
    gaugeData: [{ value: 65, name: '进度' }],
    gaugePointerStyle: 'circle',
    gaugePointerWidth: 10
  }]
})`,
    vueCode: `<LChart :options="circlePointerOptions" />`,
  },
  // ========== 矩形指针 ==========
  {
    id: 'rect-pointer', title: '矩形指针',
    options: {
      series: [{
        type: 'gauge',
        gaugeData: [{ value: 45, name: '能耗' }],
        gaugeAnimationType: globalAnimation.value,
        gaugePointerStyle: 'rect',
        gaugePointerWidth: 4,
        gaugePointerLength: 0.7,
        gaugeAxisLineColors: [
          { offset: 0.4, color: '#91cc75' },
          { offset: 0.7, color: '#fac858' },
          { offset: 1, color: '#ee6666' }
        ],
      }]
    } as ChartOptions,
    nativeCode: `// 矩形指针样式
const chart = new Chart('#container', {
  series: [{
    type: 'gauge',
    gaugeData: [{ value: 45, name: '能耗' }],
    gaugePointerStyle: 'rect',
    gaugePointerWidth: 4,
    gaugePointerLength: 0.7
  }]
})`,
    vueCode: `<LChart :options="rectPointerOptions" />`,
  },
  // ========== 半圆仪表盘 ==========
  {
    id: 'half-circle', title: '半圆仪表盘',
    options: {
      series: [{
        type: 'gauge',
        gaugeData: [{ value: 80, name: '评分' }],
        gaugeAnimationType: globalAnimation.value,
        gaugeStartAngle: 180,
        gaugeEndAngle: 0,
        gaugeSplitNumber: 5,
        gaugeAxisLineColors: [
          { offset: 0.5, color: '#5470c6' },
          { offset: 0.8, color: '#91cc75' },
          { offset: 1, color: '#fac858' }
        ],
      }]
    } as ChartOptions,
    nativeCode: `// 半圆仪表盘 - 自定义起止角度
const chart = new Chart('#container', {
  series: [{
    type: 'gauge',
    gaugeData: [{ value: 80, name: '评分' }],
    gaugeStartAngle: 180,
    gaugeEndAngle: 0,
    gaugeSplitNumber: 5
  }]
})`,
    vueCode: `<LChart :options="halfCircleOptions" />`,
  },
  // ========== 自定义颜色 ==========
  {
    id: 'custom-color', title: '自定义颜色',
    options: {
      series: [{
        type: 'gauge',
        gaugeData: [{ value: 90, name: '健康度', itemStyle: { color: '#67C23A' } }],
        gaugeAnimationType: globalAnimation.value,
        gaugeProgressColor: '#67C23A',
        gaugePointerColor: '#67C23A',
        gaugeAxisLineColors: [
          { offset: 0.3, color: '#F56C6C' },
          { offset: 0.6, color: '#E6A23C' },
          { offset: 1, color: '#67C23A' }
        ],
      }]
    } as ChartOptions,
    nativeCode: `// 自定义颜色
const chart = new Chart('#container', {
  series: [{
    type: 'gauge',
    gaugeData: [{ value: 90, name: '健康度', itemStyle: { color: '#67C23A' } }],
    gaugeProgressColor: '#67C23A',
    gaugePointerColor: '#67C23A'
  }]
})`,
    vueCode: `<LChart :options="customColorOptions" />`,
  },
  // ========== 环形进度 ==========
  {
    id: 'ring-progress', title: '环形进度',
    options: {
      series: [{
        type: 'gauge',
        gaugeData: [{ value: 75, name: '完成度' }],
        gaugeAnimationType: globalAnimation.value,
        gaugeStartAngle: 90,
        gaugeEndAngle: -270,
        gaugeShowPointer: false,
        gaugeShowAxisLabel: false,
        gaugeSplitLine: { show: false },
        gaugeAxisTick: { show: false },
        gaugeShowGradient: false,
        gaugeAxisLineWidth: 15,
        gaugeShowProgress: true,
        gaugeProgressColor: '#409EFF',
        gaugeDetailFontSize: 32,
        gaugeDetailOffset: [0, 0],
        gaugeDetailFormatter: '{value}%',
        gaugeTitleOffset: [0, 35],
      }]
    } as ChartOptions,
    nativeCode: `// 环形进度 - 纯进度条样式
const chart = new Chart('#container', {
  series: [{
    type: 'gauge',
    gaugeData: [{ value: 75, name: '完成度' }],
    gaugeStartAngle: 90,
    gaugeEndAngle: -270,
    gaugeShowPointer: false,
    gaugeShowGradient: false,
    gaugeShowProgress: true,
    gaugeProgressColor: '#409EFF'
  }]
})`,
    vueCode: `<LChart :options="ringProgressOptions" />`,
  },
  // ========== 渐变进度环 ==========
  {
    id: 'gradient-ring', title: '渐变进度环',
    options: {
      series: [{
        type: 'gauge',
        gaugeData: [{ value: 68 }],
        gaugeAnimationType: globalAnimation.value,
        gaugeStartAngle: 90,
        gaugeEndAngle: -270,
        gaugeShowPointer: false,
        gaugeShowAxisLabel: false,
        gaugeSplitLine: { show: false },
        gaugeAxisTick: { show: false },
        gaugeAxisLineWidth: 20,
        gaugeShowProgress: true,
        gaugePointerAutoColor: true,
        gaugeAxisLineColors: [
          { offset: 0, color: '#37a2da' },
          { offset: 0.5, color: '#67e0e3' },
          { offset: 1, color: '#91cc75' }
        ],
        gaugeDetailFontSize: 28,
        gaugeDetailOffset: [0, 0],
        gaugeShowTitle: false,
      }]
    } as ChartOptions,
    nativeCode: `// 渐变进度环
const chart = new Chart('#container', {
  series: [{
    type: 'gauge',
    gaugeData: [{ value: 68 }],
    gaugeStartAngle: 90,
    gaugeEndAngle: -270,
    gaugeShowPointer: false,
    gaugePointerAutoColor: true,
    gaugeAxisLineColors: [
      { offset: 0, color: '#37a2da' },
      { offset: 0.5, color: '#67e0e3' },
      { offset: 1, color: '#91cc75' }
    ]
  }]
})`,
    vueCode: `<LChart :options="gradientRingOptions" />`,
  },
  // ========== 扇形仪表盘 ==========
  {
    id: 'sector', title: '扇形仪表盘',
    options: {
      series: [{
        type: 'gauge',
        gaugeData: [{ value: 60, name: '效率' }],
        gaugeAnimationType: globalAnimation.value,
        gaugeStartAngle: 225,
        gaugeEndAngle: 135,
        gaugeSplitNumber: 3,
        gaugeAxisLineColors: [
          { offset: 0.33, color: '#ee6666' },
          { offset: 0.66, color: '#fac858' },
          { offset: 1, color: '#91cc75' }
        ],
        gaugePointerAutoColor: true,
      }]
    } as ChartOptions,
    nativeCode: `// 扇形仪表盘 - 90度范围
const chart = new Chart('#container', {
  series: [{
    type: 'gauge',
    gaugeData: [{ value: 60, name: '效率' }],
    gaugeStartAngle: 225,
    gaugeEndAngle: 135,
    gaugeSplitNumber: 3,
    gaugePointerAutoColor: true
  }]
})`,
    vueCode: `<LChart :options="sectorOptions" />`,
  },
  // ========== 仪表盘（无轨道） ==========
  {
    id: 'no-track', title: '纯指针仪表盘',
    options: {
      series: [{
        type: 'gauge',
        gaugeData: [{ value: 55, name: '功率' }],
        gaugeAnimationType: globalAnimation.value,
        gaugeShowGradient: false,
        gaugeShowProgress: false,
        gaugeAxisLineWidth: 2,
        gaugePointerStyle: 'arrow',
        gaugePointerLength: 0.7,
        gaugePointerWidth: 8,
        gaugeCenterSize: 12,
        gaugeAxisLineColors: [
          { offset: 0.5, color: '#5470c6' },
          { offset: 0.8, color: '#91cc75' },
          { offset: 1, color: '#ee6666' }
        ],
        gaugePointerAutoColor: true,
      }]
    } as ChartOptions,
    nativeCode: `// 纯指针仪表盘 - 无进度轨道
const chart = new Chart('#container', {
  series: [{
    type: 'gauge',
    gaugeData: [{ value: 55, name: '功率' }],
    gaugeShowGradient: false,
    gaugeShowProgress: false,
    gaugePointerStyle: 'arrow',
    gaugePointerAutoColor: true
  }]
})`,
    vueCode: `<LChart :options="noTrackOptions" />`,
  },
  // ========== 双色仪表盘 ==========
  {
    id: 'dual-color', title: '双色仪表盘',
    options: {
      series: [{
        type: 'gauge',
        gaugeData: [{ value: 40, name: '负载' }],
        gaugeAnimationType: globalAnimation.value,
        gaugeAxisLineColors: [
          { offset: 0.5, color: '#67C23A' },
          { offset: 1, color: '#F56C6C' }
        ],
        gaugeShowGradient: true,
        gaugeSplitNumber: 4,
        gaugePointerAutoColor: true,
      }]
    } as ChartOptions,
    nativeCode: `// 双色仪表盘
const chart = new Chart('#container', {
  series: [{
    type: 'gauge',
    gaugeData: [{ value: 40, name: '负载' }],
    gaugeAxisLineColors: [
      { offset: 0.5, color: '#67C23A' },
      { offset: 1, color: '#F56C6C' }
    ],
    gaugePointerAutoColor: true
  }]
})`,
    vueCode: `<LChart :options="dualColorOptions" />`,
  },
  // ========== 彩虹仪表盘 ==========
  {
    id: 'rainbow', title: '彩虹仪表盘',
    options: {
      series: [{
        type: 'gauge',
        gaugeData: [{ value: 78, name: '综合评分' }],
        gaugeAnimationType: globalAnimation.value,
        gaugeAxisLineColors: [
          { offset: 0.14, color: '#c23531' },
          { offset: 0.28, color: '#e69d87' },
          { offset: 0.42, color: '#d48265' },
          { offset: 0.56, color: '#91c7ae' },
          { offset: 0.70, color: '#749f83' },
          { offset: 0.84, color: '#ca8622' },
          { offset: 1, color: '#bda29a' }
        ],
        gaugeAxisLineWidth: 25,
        gaugeSplitNumber: 7,
        gaugePointerAutoColor: true,
      }]
    } as ChartOptions,
    nativeCode: `// 彩虹仪表盘 - 多色渐变
const chart = new Chart('#container', {
  series: [{
    type: 'gauge',
    gaugeData: [{ value: 78, name: '综合评分' }],
    gaugeAxisLineColors: [
      { offset: 0.14, color: '#c23531' },
      { offset: 0.28, color: '#e69d87' },
      // ... 更多颜色
    ],
    gaugePointerAutoColor: true
  }]
})`,
    vueCode: `<LChart :options="rainbowOptions" />`,
  },
  // ========== 迷你仪表盘 ==========
  {
    id: 'mini', title: '迷你仪表盘',
    options: {
      series: [{
        type: 'gauge',
        gaugeData: [{ value: 88 }],
        gaugeAnimationType: globalAnimation.value,
        gaugeRadius: 0.9,
        gaugeShowAxisLabel: false,
        gaugeSplitLine: { show: false },
        gaugeAxisTick: { show: false },
        gaugeAxisLineWidth: 8,
        gaugeShowGradient: false,
        gaugeShowProgress: true,
        gaugeProgressColor: '#409EFF',
        gaugeShowPointer: false,
        gaugeDetailFontSize: 20,
        gaugeDetailOffset: [0, 0],
        gaugeShowTitle: false,
      }]
    } as ChartOptions,
    nativeCode: `// 迷你仪表盘 - 紧凑样式
const chart = new Chart('#container', {
  series: [{
    type: 'gauge',
    gaugeData: [{ value: 88 }],
    gaugeRadius: 0.9,
    gaugeShowAxisLabel: false,
    gaugeSplitLine: { show: false },
    gaugeAxisTick: { show: false },
    gaugeShowPointer: false,
    gaugeShowProgress: true
  }]
})`,
    vueCode: `<LChart :options="miniOptions" />`,
  },
])

// 刷新示例数据
function refreshExample(index: number) {
  console.log('刷新仪表盘示例', index)
}

// 示例数量
const exampleCount = computed(() => examples.value.length)

defineExpose({ exampleCount })
</script>

<template>
  <ChartPageLayout
    title="仪表盘示例"
    description="仪表盘用于显示数值在某个范围内的位置，常用于监控指标、KPI展示等场景。支持多种指针样式、渐变色轨道、自定义角度范围等丰富配置。"
    :examples="examples"
    :use-mode="props.useMode"
    :renderer-type="props.rendererType"
    :is-dark="props.isDark"
    :animation-types="animationOptions"
    :selected-animation="globalAnimation"
    layout="sidebar"
    @update:selected-animation="globalAnimation = $event"
    @refresh="refreshExample"
  />
</template>
