<script setup lang="ts">
import { ref, computed } from 'vue'
import ChartPageLayout from '@/components/ChartPageLayout.vue'
import type { ChartOptions, TreeAnimationType, TreeData, TreeLayout, TreeEdgeShape } from '@ldesign/chart-core'

const props = defineProps<{ useMode: 'native' | 'vue'; rendererType: 'canvas' | 'svg'; isDark: boolean }>()

// 动画类型选项
const animationOptions = [
  { value: 'fade', label: '淡入', desc: '整体渐变显示' },
  { value: 'expand', label: '逐层展开', desc: '从根节点逐层展开' },
  { value: 'grow', label: '生长', desc: '从根节点生长出来' },
  { value: 'none', label: '无动画', desc: '直接显示' },
]
const globalAnimation = ref<TreeAnimationType>('fade')

// 基础树图数据
const basicTreeData: TreeData = {
  root: {
    name: '根节点',
    children: [
      {
        name: '分支1',
        children: [
          { name: '叶子1-1' },
          { name: '叶子1-2' },
        ]
      },
      {
        name: '分支2',
        children: [
          { name: '叶子2-1' },
          { name: '叶子2-2' },
          { name: '叶子2-3' },
        ]
      },
      {
        name: '分支3',
        children: [
          { name: '叶子3-1' },
        ]
      },
    ]
  }
}

// 公司组织结构数据
const orgTreeData: TreeData = {
  root: {
    name: 'CEO',
    itemStyle: { color: '#5470c6' },
    children: [
      {
        name: 'CTO',
        itemStyle: { color: '#91cc75' },
        children: [
          { name: '前端团队' },
          { name: '后端团队' },
          { name: '测试团队' },
        ]
      },
      {
        name: 'CFO',
        itemStyle: { color: '#fac858' },
        children: [
          { name: '财务部' },
          { name: '审计部' },
        ]
      },
      {
        name: 'COO',
        itemStyle: { color: '#ee6666' },
        children: [
          { name: '运营部' },
          { name: '市场部' },
          { name: '销售部' },
        ]
      },
    ]
  }
}

// 文件系统数据
const fileTreeData: TreeData = {
  root: {
    name: 'src',
    children: [
      {
        name: 'components',
        children: [
          { name: 'Button.vue' },
          { name: 'Input.vue' },
          { name: 'Modal.vue' },
        ]
      },
      {
        name: 'views',
        children: [
          { name: 'Home.vue' },
          { name: 'About.vue' },
        ]
      },
      {
        name: 'utils',
        children: [
          { name: 'helpers.ts' },
          { name: 'api.ts' },
        ]
      },
      { name: 'App.vue' },
      { name: 'main.ts' },
    ]
  }
}

// 知识图谱数据
const knowledgeTreeData: TreeData = {
  root: {
    name: '前端开发',
    children: [
      {
        name: 'HTML',
        children: [
          { name: '语义化标签' },
          { name: '表单元素' },
          { name: 'Canvas' },
        ]
      },
      {
        name: 'CSS',
        children: [
          { name: 'Flexbox' },
          { name: 'Grid' },
          { name: '动画' },
        ]
      },
      {
        name: 'JavaScript',
        children: [
          { name: 'ES6+' },
          { name: 'TypeScript' },
          { name: '框架' },
        ]
      },
    ]
  }
}

const examples = computed(() => [
  // ========== 从上到下 ==========
  {
    id: 'tb', title: '从上到下树图',
    options: {
      series: [{
        type: 'tree',
        name: '树图',
        treeData: basicTreeData,
        treeLayout: 'TB' as TreeLayout,
        treeEdgeShape: 'curve' as TreeEdgeShape,
        treeAnimationType: globalAnimation.value,
        nodeSize: 10,
      }],
    } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

const chart = new Chart('#container', {
  series: [{
    type: 'tree',
    treeData: {
      root: {
        name: '根节点',
        children: [
          { name: '分支1', children: [...] },
          { name: '分支2', children: [...] },
        ]
      }
    },
    treeLayout: 'TB'  // 从上到下
  }]
})`,
    vueCode: `<template>
  <LChart :options="chartOptions" />
</template>

<script setup>
const chartOptions = {
  series: [{
    type: 'tree',
    treeData: { root: {...} },
    treeLayout: 'TB'
  }]
}
<\/script>`,
  },
  // ========== 从下到上 ==========
  {
    id: 'bt', title: '从下到上树图',
    options: {
      series: [{
        type: 'tree',
        name: '树图',
        treeData: basicTreeData,
        treeLayout: 'BT' as TreeLayout,
        treeEdgeShape: 'curve' as TreeEdgeShape,
        treeAnimationType: globalAnimation.value,
        nodeSize: 10,
      }],
    } as ChartOptions,
    nativeCode: `// 从下到上布局
series: [{
  type: 'tree',
  treeData: { root: {...} },
  treeLayout: 'BT'  // Bottom to Top
}]`,
    vueCode: `<LChart :options="chartOptions" />
// treeLayout: 'BT' 从下到上`,
  },
  // ========== 从左到右 ==========
  {
    id: 'lr', title: '从左到右树图',
    options: {
      series: [{
        type: 'tree',
        name: '组织结构',
        treeData: orgTreeData,
        treeLayout: 'LR' as TreeLayout,
        treeEdgeShape: 'curve' as TreeEdgeShape,
        treeAnimationType: globalAnimation.value,
        nodeSize: 10,
      }],
    } as ChartOptions,
    nativeCode: `// 从左到右布局 - 适合组织结构图
series: [{
  type: 'tree',
  treeData: {
    root: {
      name: 'CEO',
      children: [
        { name: 'CTO', children: [...] },
        { name: 'CFO', children: [...] },
      ]
    }
  },
  treeLayout: 'LR'  // Left to Right
}]`,
    vueCode: `<LChart :options="chartOptions" />
// treeLayout: 'LR' 从左到右`,
  },
  // ========== 从右到左 ==========
  {
    id: 'rl', title: '从右到左树图',
    options: {
      series: [{
        type: 'tree',
        name: '树图',
        treeData: fileTreeData,
        treeLayout: 'RL' as TreeLayout,
        treeEdgeShape: 'curve' as TreeEdgeShape,
        treeAnimationType: globalAnimation.value,
        nodeSize: 8,
      }],
    } as ChartOptions,
    nativeCode: `// 从右到左布局
series: [{
  type: 'tree',
  treeData: { root: {...} },
  treeLayout: 'RL'  // Right to Left
}]`,
    vueCode: `<LChart :options="chartOptions" />
// treeLayout: 'RL' 从右到左`,
  },
  // ========== 径向布局 ==========
  {
    id: 'radial', title: '径向树图',
    options: {
      series: [{
        type: 'tree',
        name: '知识图谱',
        treeData: knowledgeTreeData,
        treeLayout: 'radial' as TreeLayout,
        treeEdgeShape: 'curve' as TreeEdgeShape,
        treeAnimationType: globalAnimation.value,
        nodeSize: 10,
      }],
    } as ChartOptions,
    nativeCode: `// 径向布局 - 适合展示层级关系
series: [{
  type: 'tree',
  treeData: { root: {...} },
  treeLayout: 'radial'  // 径向布局
}]`,
    vueCode: `<LChart :options="chartOptions" />
// treeLayout: 'radial' 径向布局`,
  },
  // ========== 折线边 ==========
  {
    id: 'polyline', title: '折线边树图',
    options: {
      series: [{
        type: 'tree',
        name: '树图',
        treeData: basicTreeData,
        treeLayout: 'TB' as TreeLayout,
        treeEdgeShape: 'polyline' as TreeEdgeShape,
        treeAnimationType: globalAnimation.value,
        nodeSize: 10,
      }],
    } as ChartOptions,
    nativeCode: `// 折线边样式
series: [{
  type: 'tree',
  treeData: { root: {...} },
  treeEdgeShape: 'polyline'  // 折线
}]`,
    vueCode: `<LChart :options="chartOptions" />
// treeEdgeShape: 'polyline' 折线边`,
  },
  // ========== 阶梯边 ==========
  {
    id: 'step', title: '阶梯边树图',
    options: {
      series: [{
        type: 'tree',
        name: '树图',
        treeData: orgTreeData,
        treeLayout: 'LR' as TreeLayout,
        treeEdgeShape: 'step' as TreeEdgeShape,
        treeAnimationType: globalAnimation.value,
        nodeSize: 10,
      }],
    } as ChartOptions,
    nativeCode: `// 阶梯边样式
series: [{
  type: 'tree',
  treeData: { root: {...} },
  treeEdgeShape: 'step'  // 阶梯
}]`,
    vueCode: `<LChart :options="chartOptions" />
// treeEdgeShape: 'step' 阶梯边`,
  },
])
// 刷新示例数据 - 树形图的数据结构固定，刷新时随机生成新的树结构
function refreshExample(index: number) {
  // 树形图数据结构较复杂，暂不支持随机刷新
  // 后续可以添加随机生成树结构的逻辑
  console.log('刷新树图示例', index)
}

// 示例数量
const exampleCount = computed(() => examples.value.length)

defineExpose({ exampleCount })
</script>

<template>
  <ChartPageLayout
    title="树形图示例"
    description="树形图用于展示层级结构数据，支持多种布局方向（从上到下、从左到右等）和径向布局，适合组织结构、文件目录、知识图谱等场景。"
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
