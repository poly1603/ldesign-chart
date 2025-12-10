<script setup lang="ts">
import { ref, computed } from 'vue'
import ChartPageLayout from '@/components/ChartPageLayout.vue'
import type { ChartOptions, GraphAnimationType, GraphData } from '@ldesign/chart-core'

const props = defineProps<{ useMode: 'native' | 'vue'; rendererType: 'canvas' | 'svg'; isDark: boolean }>()

// 动画类型选项
const animationTypes = [
  { value: 'fade', label: '淡入', desc: '整体渐变显示' },
  { value: 'scale', label: '缩放', desc: '节点缩放出现' },
  { value: 'expand', label: '扩展', desc: '从中心扩展' },
  { value: 'none', label: '无动画', desc: '直接显示' },
]
const selectedAnimationType = ref<GraphAnimationType>('fade')

// 基础关系图数据
const basicGraphData: GraphData = {
  nodes: [
    { id: '1', name: '节点1' },
    { id: '2', name: '节点2' },
    { id: '3', name: '节点3' },
    { id: '4', name: '节点4' },
    { id: '5', name: '节点5' },
  ],
  links: [
    { source: '1', target: '2' },
    { source: '1', target: '3' },
    { source: '2', target: '4' },
    { source: '3', target: '4' },
    { source: '4', target: '5' },
  ]
}

// 带分类的关系图数据
const categoryGraphData: GraphData = {
  nodes: [
    { id: 'a1', name: '前端', category: 0, symbolSize: 30 },
    { id: 'a2', name: 'Vue', category: 0 },
    { id: 'a3', name: 'React', category: 0 },
    { id: 'b1', name: '后端', category: 1, symbolSize: 30 },
    { id: 'b2', name: 'Node', category: 1 },
    { id: 'b3', name: 'Python', category: 1 },
    { id: 'c1', name: '数据库', category: 2, symbolSize: 30 },
    { id: 'c2', name: 'MySQL', category: 2 },
    { id: 'c3', name: 'MongoDB', category: 2 },
  ],
  links: [
    { source: 'a1', target: 'a2' },
    { source: 'a1', target: 'a3' },
    { source: 'b1', target: 'b2' },
    { source: 'b1', target: 'b3' },
    { source: 'c1', target: 'c2' },
    { source: 'c1', target: 'c3' },
    { source: 'a2', target: 'b2' },
    { source: 'b2', target: 'c2' },
    { source: 'b3', target: 'c3' },
  ],
  categories: [
    { name: '前端', itemStyle: { color: '#5470c6' } },
    { name: '后端', itemStyle: { color: '#91cc75' } },
    { name: '数据库', itemStyle: { color: '#fac858' } },
  ]
}

// 社交网络数据
const socialGraphData: GraphData = {
  nodes: [
    { id: 'user1', name: '张三', symbolSize: 35 },
    { id: 'user2', name: '李四', symbolSize: 25 },
    { id: 'user3', name: '王五', symbolSize: 28 },
    { id: 'user4', name: '赵六', symbolSize: 22 },
    { id: 'user5', name: '钱七', symbolSize: 20 },
    { id: 'user6', name: '孙八', symbolSize: 18 },
    { id: 'user7', name: '周九', symbolSize: 24 },
    { id: 'user8', name: '吴十', symbolSize: 20 },
  ],
  links: [
    { source: 'user1', target: 'user2', lineStyle: { width: 3 } },
    { source: 'user1', target: 'user3', lineStyle: { width: 2 } },
    { source: 'user1', target: 'user4' },
    { source: 'user2', target: 'user5' },
    { source: 'user2', target: 'user6' },
    { source: 'user3', target: 'user7' },
    { source: 'user4', target: 'user8' },
    { source: 'user5', target: 'user7' },
    { source: 'user6', target: 'user8' },
  ]
}

// 流程图数据
const flowGraphData: GraphData = {
  nodes: [
    { id: 'start', name: '开始', itemStyle: { color: '#67c23a' } },
    { id: 'step1', name: '需求分析' },
    { id: 'step2', name: '设计' },
    { id: 'step3', name: '开发' },
    { id: 'step4', name: '测试' },
    { id: 'end', name: '上线', itemStyle: { color: '#e6a23c' } },
  ],
  links: [
    { source: 'start', target: 'step1' },
    { source: 'step1', target: 'step2' },
    { source: 'step2', target: 'step3' },
    { source: 'step3', target: 'step4' },
    { source: 'step4', target: 'end' },
  ]
}

const examples = computed(() => [
  // ========== 基础关系图 ==========
  {
    id: 'basic', title: '基础关系图',
    options: {
      series: [{
        type: 'graph',
        name: '关系图',
        graphData: basicGraphData,
        graphLayout: 'force',
        graphAnimationType: selectedAnimationType.value,
      }],
    } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

const chart = new Chart('#container', {
  series: [{
    type: 'graph',
    graphData: {
      nodes: [
        { id: '1', name: '节点1' },
        { id: '2', name: '节点2' },
        // ...
      ],
      links: [
        { source: '1', target: '2' },
        // ...
      ]
    },
    graphLayout: 'force'
  }]
})`,
    vueCode: `<template>
  <LChart :options="chartOptions" />
</template>

<script setup>
const chartOptions = {
  series: [{
    type: 'graph',
    graphData: { nodes: [...], links: [...] }
  }]
}
<\/script>`,
  },
  // ========== 环形布局 ==========
  {
    id: 'circular', title: '环形布局',
    options: {
      series: [{
        type: 'graph',
        name: '环形关系图',
        graphData: basicGraphData,
        graphLayout: 'circular',
        graphAnimationType: selectedAnimationType.value,
      }],
    } as ChartOptions,
    nativeCode: `// 环形布局
series: [{
  type: 'graph',
  graphData: { nodes: [...], links: [...] },
  graphLayout: 'circular'  // 环形布局
}]`,
    vueCode: `<LChart :options="chartOptions" />
// graphLayout: 'circular' 环形布局`,
  },
  // ========== 网格布局 ==========
  {
    id: 'grid', title: '网格布局',
    options: {
      series: [{
        type: 'graph',
        name: '网格关系图',
        graphData: basicGraphData,
        graphLayout: 'grid',
        graphAnimationType: selectedAnimationType.value,
      }],
    } as ChartOptions,
    nativeCode: `// 网格布局
series: [{
  type: 'graph',
  graphData: { nodes: [...], links: [...] },
  graphLayout: 'grid'  // 网格布局
}]`,
    vueCode: `<LChart :options="chartOptions" />
// graphLayout: 'grid' 网格布局`,
  },
  // ========== 分类关系图 ==========
  {
    id: 'category', title: '分类关系图',
    options: {
      series: [{
        type: 'graph',
        name: '技术栈',
        graphData: categoryGraphData,
        graphLayout: 'circular',
        graphAnimationType: selectedAnimationType.value,
        showNodeLabel: true,
      }],
    } as ChartOptions,
    nativeCode: `// 带分类的关系图
graphData: {
  nodes: [
    { id: 'a1', name: '前端', category: 0 },
    { id: 'b1', name: '后端', category: 1 },
    // ...
  ],
  links: [...],
  categories: [
    { name: '前端', itemStyle: { color: '#5470c6' } },
    { name: '后端', itemStyle: { color: '#91cc75' } },
  ]
}`,
    vueCode: `<LChart :options="chartOptions" />
// 通过 category 属性对节点分类`,
  },
  // ========== 社交网络 ==========
  {
    id: 'social', title: '社交网络',
    options: {
      series: [{
        type: 'graph',
        name: '社交关系',
        graphData: socialGraphData,
        graphLayout: 'force',
        graphAnimationType: selectedAnimationType.value,
        nodeSize: 20,
      }],
    } as ChartOptions,
    nativeCode: `// 社交网络图
graphData: {
  nodes: [
    { id: 'user1', name: '张三', symbolSize: 35 },
    // symbolSize 控制节点大小
  ],
  links: [
    { source: 'user1', target: 'user2', lineStyle: { width: 3 } },
    // lineStyle.width 控制连线粗细
  ]
}`,
    vueCode: `<LChart :options="chartOptions" />
// symbolSize 和 lineStyle.width 控制大小`,
  },
  // ========== 带箭头流程图 ==========
  {
    id: 'flow', title: '流程图（带箭头）',
    options: {
      series: [{
        type: 'graph',
        name: '开发流程',
        graphData: flowGraphData,
        graphLayout: 'grid',
        graphAnimationType: selectedAnimationType.value,
        showArrow: true,
        nodeSize: 25,
      }],
    } as ChartOptions,
    nativeCode: `// 带箭头的流程图
series: [{
  type: 'graph',
  graphData: { nodes: [...], links: [...] },
  graphLayout: 'grid',
  showArrow: true  // 显示箭头
}]`,
    vueCode: `<LChart :options="chartOptions" />
// showArrow: true 显示连线箭头`,
  },
])

const exampleCount = computed(() => examples.value.length)
defineExpose({ exampleCount })
</script>

<template>
  <ChartPageLayout
    title="关系图示例"
    description="关系图（Graph）用于展示节点之间的关系，支持力导向、环形、网格三种布局模式。"
    :examples="examples"
    :use-mode="props.useMode"
    :renderer-type="props.rendererType"
    :is-dark="props.isDark"
    :animation-types="animationTypes"
    :selected-animation="selectedAnimationType"
    layout="sidebar"
    @update:selected-animation="selectedAnimationType = $event as GraphAnimationType"
  />
</template>
