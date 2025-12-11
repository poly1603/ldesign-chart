<script setup lang="ts">
import { ref, computed } from 'vue'
import ChartPageLayout from '@/components/ChartPageLayout.vue'
import type { ChartOptions, FunnelAnimationType, FunnelDataItem } from '@ldesign/chart-core'

const props = defineProps<{ useMode: 'native' | 'vue'; rendererType: 'canvas' | 'svg'; isDark: boolean }>()

// 动画类型选项
const animationOptions = [
  { value: 'drop', label: '落下' },
  { value: 'scale', label: '缩放' },
  { value: 'fade', label: '淡入' },
  { value: 'slide', label: '滑入' },
  { value: 'none', label: '无动画' },
]
const globalAnimation = ref<FunnelAnimationType>('drop')

// 销售漏斗数据
const salesFunnelData: FunnelDataItem[] = [
  { name: '展示', value: 100 },
  { name: '点击', value: 80 },
  { name: '访问', value: 60 },
  { name: '咨询', value: 40 },
  { name: '订单', value: 20 },
]

// 用户转化数据
const userConversionData: FunnelDataItem[] = [
  { name: '访问用户', value: 5000 },
  { name: '注册用户', value: 3500 },
  { name: '活跃用户', value: 2500 },
  { name: '付费用户', value: 800 },
  { name: 'VIP用户', value: 200 },
]

// 招聘流程数据
const recruitmentData: FunnelDataItem[] = [
  { name: '简历投递', value: 1000, itemStyle: { color: '#5470c6' } },
  { name: '简历筛选', value: 500, itemStyle: { color: '#91cc75' } },
  { name: '笔试通过', value: 200, itemStyle: { color: '#fac858' } },
  { name: '面试通过', value: 80, itemStyle: { color: '#ee6666' } },
  { name: '录用', value: 30, itemStyle: { color: '#73c0de' } },
]

// 电商转化数据
const ecommerceData: FunnelDataItem[] = [
  { name: '浏览商品', value: 10000 },
  { name: '加入购物车', value: 4500 },
  { name: '提交订单', value: 2000 },
  { name: '支付成功', value: 1500 },
  { name: '确认收货', value: 1400 },
]

// 示例配置
const examples = computed(() => [
  // ========== 基础漏斗图 ==========
  {
    id: 'basic', title: '基础漏斗图',
    options: {
      series: [{
        type: 'funnel',
        funnelData: salesFunnelData,
        funnelAnimationType: globalAnimation.value,
      }]
    } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

const chart = new Chart('#container', {
  series: [{
    type: 'funnel',
    funnelData: [
      { name: '展示', value: 100 },
      { name: '点击', value: 80 },
      { name: '访问', value: 60 },
      { name: '咨询', value: 40 },
      { name: '订单', value: 20 },
    ]
  }]
})`,
    vueCode: `<LChart :options="{ series: [{ type: 'funnel', funnelData: data }] }" />`,
  },
  // ========== 用户转化漏斗 ==========
  {
    id: 'user-conversion', title: '用户转化漏斗',
    options: {
      series: [{
        type: 'funnel',
        funnelData: userConversionData,
        funnelAnimationType: globalAnimation.value,
        funnelGap: 4,
      }]
    } as ChartOptions,
    nativeCode: `// 用户转化漏斗
const chart = new Chart('#container', {
  series: [{
    type: 'funnel',
    funnelData: userConversionData,
    funnelGap: 4  // 层间间距
  }]
})`,
    vueCode: `<LChart :options="{ series: [{ type: 'funnel', funnelData: data, funnelGap: 4 }] }" />`,
  },
  // ========== 自定义颜色 ==========
  {
    id: 'custom-color', title: '自定义颜色',
    options: {
      series: [{
        type: 'funnel',
        funnelData: recruitmentData,
        funnelAnimationType: globalAnimation.value,
      }]
    } as ChartOptions,
    nativeCode: `// 自定义每层颜色
const chart = new Chart('#container', {
  series: [{
    type: 'funnel',
    funnelData: [
      { name: '简历投递', value: 1000, itemStyle: { color: '#5470c6' } },
      { name: '简历筛选', value: 500, itemStyle: { color: '#91cc75' } },
      // ...
    ]
  }]
})`,
    vueCode: `<LChart :options="recruitmentOptions" />`,
  },
  // ========== 升序排列 ==========
  {
    id: 'ascending', title: '升序排列',
    options: {
      series: [{
        type: 'funnel',
        funnelData: salesFunnelData,
        funnelAnimationType: globalAnimation.value,
        funnelSort: 'ascending',
      }]
    } as ChartOptions,
    nativeCode: `// 升序排列（小在上，大在下）
const chart = new Chart('#container', {
  series: [{
    type: 'funnel',
    funnelData: data,
    funnelSort: 'ascending'  // 'ascending' | 'descending' | 'none'
  }]
})`,
    vueCode: `<LChart :options="{ series: [{ type: 'funnel', funnelData: data, funnelSort: 'ascending' }] }" />`,
  },
  // ========== 左对齐 ==========
  {
    id: 'left-align', title: '左对齐',
    options: {
      series: [{
        type: 'funnel',
        funnelData: salesFunnelData,
        funnelAnimationType: globalAnimation.value,
        funnelAlign: 'left',
      }]
    } as ChartOptions,
    nativeCode: `// 左对齐漏斗
const chart = new Chart('#container', {
  series: [{
    type: 'funnel',
    funnelData: data,
    funnelAlign: 'left'  // 'left' | 'center' | 'right'
  }]
})`,
    vueCode: `<LChart :options="{ series: [{ type: 'funnel', funnelData: data, funnelAlign: 'left' }] }" />`,
  },
  // ========== 右对齐 ==========
  {
    id: 'right-align', title: '右对齐',
    options: {
      series: [{
        type: 'funnel',
        funnelData: salesFunnelData,
        funnelAnimationType: globalAnimation.value,
        funnelAlign: 'right',
      }]
    } as ChartOptions,
    nativeCode: `// 右对齐漏斗
const chart = new Chart('#container', {
  series: [{
    type: 'funnel',
    funnelData: data,
    funnelAlign: 'right'
  }]
})`,
    vueCode: `<LChart :options="{ series: [{ type: 'funnel', funnelData: data, funnelAlign: 'right' }] }" />`,
  },
  // ========== 标签在左侧 ==========
  {
    id: 'label-left', title: '左侧标签',
    options: {
      series: [{
        type: 'funnel',
        funnelData: salesFunnelData,
        funnelAnimationType: globalAnimation.value,
        funnelLabelPosition: 'left',
      }]
    } as ChartOptions,
    nativeCode: `// 标签显示在左侧
const chart = new Chart('#container', {
  series: [{
    type: 'funnel',
    funnelData: data,
    funnelLabelPosition: 'left'  // 'left' | 'right' | 'inside' | 'outside'
  }]
})`,
    vueCode: `<LChart :options="{ series: [{ type: 'funnel', funnelData: data, funnelLabelPosition: 'left' }] }" />`,
  },
  // ========== 内部标签 ==========
  {
    id: 'label-inside', title: '内部标签',
    options: {
      series: [{
        type: 'funnel',
        funnelData: ecommerceData,
        funnelAnimationType: globalAnimation.value,
        funnelLabelPosition: 'inside',
      }]
    } as ChartOptions,
    nativeCode: `// 标签显示在内部
const chart = new Chart('#container', {
  series: [{
    type: 'funnel',
    funnelData: data,
    funnelLabelPosition: 'inside'
  }]
})`,
    vueCode: `<LChart :options="{ series: [{ type: 'funnel', funnelData: data, funnelLabelPosition: 'inside' }] }" />`,
  },
])
// 刷新示例数据
function refreshExample(index: number) {
  console.log('刷新漏斗图示例', index)
}

// 示例数量
const exampleCount = computed(() => examples.value.length)

defineExpose({ exampleCount })
</script>

<template>
  <ChartPageLayout
    title="漏斗图示例"
    description="漏斗图用于展示流程中各阶段的数据转化情况，常用于销售转化、用户行为分析等场景。支持多种动画效果、排序方式、对齐方式和标签位置等配置。"
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
