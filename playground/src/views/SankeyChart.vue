<script setup lang="ts">
import { ref, computed } from 'vue'
import ChartPageLayout from '@/components/ChartPageLayout.vue'
import type { ChartOptions, SankeyAnimationType, SankeyData } from '@ldesign/chart-core'

const props = defineProps<{ useMode: 'native' | 'vue'; rendererType: 'canvas' | 'svg'; isDark: boolean }>()

// 动画类型选项
const animationOptions = [
  { value: 'flow', label: '流动', desc: '流量渐进出现' },
  { value: 'grow', label: '生长', desc: '节点和连接同时生长' },
  { value: 'fade', label: '淡入', desc: '整体渐变显示' },
  { value: 'none', label: '无动画', desc: '直接显示' },
]
const globalAnimation = ref<SankeyAnimationType>('flow')

// 基础桑基图数据 - 能源流向
const energyFlowData: SankeyData = {
  nodes: [
    { name: '煤炭' },
    { name: '石油' },
    { name: '天然气' },
    { name: '发电' },
    { name: '工业' },
    { name: '交通' },
    { name: '居民' },
  ],
  links: [
    { source: '煤炭', target: '发电', value: 100 },
    { source: '煤炭', target: '工业', value: 50 },
    { source: '石油', target: '交通', value: 80 },
    { source: '石油', target: '工业', value: 30 },
    { source: '天然气', target: '发电', value: 40 },
    { source: '天然气', target: '居民', value: 30 },
    { source: '发电', target: '工业', value: 60 },
    { source: '发电', target: '居民', value: 80 },
  ]
}

// 用户转化漏斗数据
const userFunnelData: SankeyData = {
  nodes: [
    { name: '访问' },
    { name: '注册' },
    { name: '登录' },
    { name: '浏览商品' },
    { name: '加入购物车' },
    { name: '下单' },
    { name: '支付成功' },
    { name: '流失' },
  ],
  links: [
    { source: '访问', target: '注册', value: 100 },
    { source: '访问', target: '流失', value: 200 },
    { source: '注册', target: '登录', value: 80 },
    { source: '注册', target: '流失', value: 20 },
    { source: '登录', target: '浏览商品', value: 70 },
    { source: '登录', target: '流失', value: 10 },
    { source: '浏览商品', target: '加入购物车', value: 50 },
    { source: '浏览商品', target: '流失', value: 20 },
    { source: '加入购物车', target: '下单', value: 40 },
    { source: '加入购物车', target: '流失', value: 10 },
    { source: '下单', target: '支付成功', value: 35 },
    { source: '下单', target: '流失', value: 5 },
  ]
}

// 预算分配数据
const budgetData: SankeyData = {
  nodes: [
    { name: '总预算', itemStyle: { color: '#5470c6' } },
    { name: '研发', itemStyle: { color: '#91cc75' } },
    { name: '市场', itemStyle: { color: '#fac858' } },
    { name: '运营', itemStyle: { color: '#ee6666' } },
    { name: '人事', itemStyle: { color: '#73c0de' } },
    { name: '前端', itemStyle: { color: '#3ba272' } },
    { name: '后端', itemStyle: { color: '#fc8452' } },
    { name: '测试', itemStyle: { color: '#9a60b4' } },
    { name: '广告', itemStyle: { color: '#ea7ccc' } },
    { name: '活动', itemStyle: { color: '#5470c6' } },
  ],
  links: [
    { source: '总预算', target: '研发', value: 400 },
    { source: '总预算', target: '市场', value: 250 },
    { source: '总预算', target: '运营', value: 200 },
    { source: '总预算', target: '人事', value: 150 },
    { source: '研发', target: '前端', value: 150 },
    { source: '研发', target: '后端', value: 180 },
    { source: '研发', target: '测试', value: 70 },
    { source: '市场', target: '广告', value: 180 },
    { source: '市场', target: '活动', value: 70 },
  ]
}

// 示例配置
const examples = computed(() => [
  // ========== 基础桑基图 ==========
  {
    id: 'basic', title: '基础桑基图',
    options: {
      series: [{
        type: 'sankey',
        sankeyData: energyFlowData,
        sankeyAnimationType: globalAnimation.value,
      }]
    } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

const chart = new Chart('#container', {
  series: [{
    type: 'sankey',
    sankeyData: {
      nodes: [
        { name: '煤炭' },
        { name: '石油' },
        { name: '发电' },
        { name: '工业' },
        // ...
      ],
      links: [
        { source: '煤炭', target: '发电', value: 100 },
        { source: '石油', target: '工业', value: 30 },
        // ...
      ]
    }
  }]
})`,
    vueCode: `<LChart :options="{ series: [{ type: 'sankey', sankeyData: data }] }" />`,
  },
  // ========== 用户转化漏斗 ==========
  {
    id: 'funnel', title: '用户转化流程',
    options: {
      series: [{
        type: 'sankey',
        sankeyData: userFunnelData,
        sankeyAnimationType: globalAnimation.value,
        sankeyCurveness: 0.6,
      }]
    } as ChartOptions,
    nativeCode: `// 用户转化流程 - 展示用户在各阶段的流失和转化
const chart = new Chart('#container', {
  series: [{
    type: 'sankey',
    sankeyData: userFunnelData,
    sankeyCurveness: 0.6  // 连接线曲率
  }]
})`,
    vueCode: `<LChart :options="{ series: [{ type: 'sankey', sankeyData: data, sankeyCurveness: 0.6 }] }" />`,
  },
  // ========== 预算分配 ==========
  {
    id: 'budget', title: '预算分配',
    options: {
      series: [{
        type: 'sankey',
        sankeyData: budgetData,
        sankeyAnimationType: globalAnimation.value,
        sankeyNodeWidth: 25,
        sankeyNodeGap: 12,
      }]
    } as ChartOptions,
    nativeCode: `// 预算分配 - 带自定义颜色
const chart = new Chart('#container', {
  series: [{
    type: 'sankey',
    sankeyData: {
      nodes: [
        { name: '总预算', itemStyle: { color: '#5470c6' } },
        { name: '研发', itemStyle: { color: '#91cc75' } },
        // ...
      ],
      links: [
        { source: '总预算', target: '研发', value: 400 },
        // ...
      ]
    },
    sankeyNodeWidth: 25,
    sankeyNodeGap: 12
  }]
})`,
    vueCode: `<LChart :options="budgetOptions" />`,
  },
  // ========== 标签位置 ==========
  {
    id: 'label-left', title: '左侧标签',
    options: {
      series: [{
        type: 'sankey',
        sankeyData: energyFlowData,
        sankeyAnimationType: globalAnimation.value,
        sankeyLabelPosition: 'left',
      }]
    } as ChartOptions,
    nativeCode: `// 标签显示在节点左侧
const chart = new Chart('#container', {
  series: [{
    type: 'sankey',
    sankeyData: data,
    sankeyLabelPosition: 'left'  // 'left' | 'right' | 'inside'
  }]
})`,
    vueCode: `<LChart :options="{ series: [{ type: 'sankey', sankeyData: data, sankeyLabelPosition: 'left' }] }" />`,
  },
  // ========== 低曲率连接 ==========
  {
    id: 'low-curve', title: '低曲率连接',
    options: {
      series: [{
        type: 'sankey',
        sankeyData: energyFlowData,
        sankeyAnimationType: globalAnimation.value,
        sankeyCurveness: 0.2,
      }]
    } as ChartOptions,
    nativeCode: `// 低曲率 - 更直的连接线
const chart = new Chart('#container', {
  series: [{
    type: 'sankey',
    sankeyData: data,
    sankeyCurveness: 0.2  // 0-1, 值越小越直
  }]
})`,
    vueCode: `<LChart :options="{ series: [{ type: 'sankey', sankeyData: data, sankeyCurveness: 0.2 }] }" />`,
  },
  // ========== 紧凑布局 ==========
  {
    id: 'compact', title: '紧凑布局',
    options: {
      series: [{
        type: 'sankey',
        sankeyData: energyFlowData,
        sankeyAnimationType: globalAnimation.value,
        sankeyNodeWidth: 15,
        sankeyNodeGap: 4,
      }]
    } as ChartOptions,
    nativeCode: `// 紧凑布局 - 较小的节点和间距
const chart = new Chart('#container', {
  series: [{
    type: 'sankey',
    sankeyData: data,
    sankeyNodeWidth: 15,
    sankeyNodeGap: 4
  }]
})`,
    vueCode: `<LChart :options="{ series: [{ type: 'sankey', sankeyData: data, sankeyNodeWidth: 15, sankeyNodeGap: 4 }] }" />`,
  },
])
</script>

<template>
  <ChartPageLayout
    title="桑基图示例"
    description="桑基图用于展示数据流量和转化关系，支持多级节点、自定义颜色、动画效果等功能。"
    :examples="examples"
    :useMode="props.useMode"
    :rendererType="props.rendererType"
    :isDark="props.isDark"
  >
    <template #controls>
      <div class="control-group">
        <label>动画效果</label>
        <select v-model="globalAnimation">
          <option v-for="opt in animationOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }} - {{ opt.desc }}
          </option>
        </select>
      </div>
    </template>
  </ChartPageLayout>
</template>

<style scoped>
.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group label {
  font-size: 13px;
  color: var(--text-secondary);
}

.control-group select {
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
}
</style>
