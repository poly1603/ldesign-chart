<script setup lang="ts">
import { ref, computed } from 'vue'
import ChartPageLayout from '@/components/ChartPageLayout.vue'
import type { ChartOptions, SunburstAnimationType, SunburstData } from '@ldesign/chart-core'

const props = defineProps<{ useMode: 'native' | 'vue'; rendererType: 'canvas' | 'svg'; isDark: boolean }>()

// 动画类型选项
const animationOptions = [
  { value: 'expand', label: '展开', desc: '扇形从中心展开' },
  { value: 'scale', label: '缩放', desc: '整体缩放出现' },
  { value: 'fade', label: '淡入', desc: '整体渐变显示' },
  { value: 'rotate', label: '旋转', desc: '旋转进入' },
  { value: 'none', label: '无动画', desc: '直接显示' },
]
const globalAnimation = ref<SunburstAnimationType>('expand')

// 基础旭日图数据（类似 ECharts 多层级结构）
const basicSunburstData: SunburstData = {
  children: [
    {
      name: '销售',
      children: [
        { 
          name: '线上', 
          children: [
            { name: '淘宝', value: 25 },
            { name: '京东', value: 20 },
            { name: '拼多多', value: 15 },
          ]
        },
        { 
          name: '线下', 
          children: [
            { name: '门店', value: 30 },
            { name: '代理', value: 18 },
          ]
        },
      ]
    },
    {
      name: '市场',
      children: [
        { name: '广告', value: 22 },
        { name: '活动', value: 15 },
        { name: 'SEO', value: 10 },
      ]
    },
    {
      name: '研发',
      children: [
        { name: '前端', value: 18 },
        { name: '后端', value: 20 },
        { name: '测试', value: 12 },
      ]
    },
  ]
}

// 饮料口味数据
const drinkFlavorsData: SunburstData = {
  children: [
    {
      name: '咖啡',
      itemStyle: { color: '#6f4e37' },
      children: [
        { name: '美式', value: 25 },
        { name: '拿铁', value: 35 },
        { name: '卡布奇诺', value: 20 },
        { name: '摩卡', value: 15 },
      ]
    },
    {
      name: '茶',
      itemStyle: { color: '#8fbc8f' },
      children: [
        { name: '绿茶', value: 30 },
        { name: '红茶', value: 25 },
        { name: '乌龙茶', value: 15 },
        { name: '普洱', value: 10 },
      ]
    },
    {
      name: '果汁',
      itemStyle: { color: '#ffa500' },
      children: [
        { name: '橙汁', value: 20 },
        { name: '苹果汁', value: 15 },
        { name: '葡萄汁', value: 12 },
      ]
    },
  ]
}

// 公司组织结构数据
const orgData: SunburstData = {
  children: [
    {
      name: '技术部',
      itemStyle: { color: '#5470c6' },
      children: [
        {
          name: '前端组',
          children: [
            { name: 'React', value: 8 },
            { name: 'Vue', value: 6 },
            { name: 'Angular', value: 4 },
          ]
        },
        {
          name: '后端组',
          children: [
            { name: 'Java', value: 10 },
            { name: 'Go', value: 5 },
            { name: 'Python', value: 6 },
          ]
        },
        { name: '测试组', value: 12 },
      ]
    },
    {
      name: '产品部',
      itemStyle: { color: '#91cc75' },
      children: [
        { name: '产品经理', value: 8 },
        { name: 'UI设计', value: 6 },
        { name: 'UX研究', value: 4 },
      ]
    },
    {
      name: '运营部',
      itemStyle: { color: '#fac858' },
      children: [
        { name: '市场', value: 10 },
        { name: '客服', value: 15 },
        { name: '销售', value: 12 },
      ]
    },
  ]
}

// 书籍分类数据
const bookData: SunburstData = {
  children: [
    {
      name: '文学',
      itemStyle: { color: '#ee6666' },
      children: [
        { name: '小说', value: 40 },
        { name: '诗歌', value: 15 },
        { name: '散文', value: 20 },
      ]
    },
    {
      name: '科技',
      itemStyle: { color: '#73c0de' },
      children: [
        { name: '编程', value: 35 },
        { name: '数学', value: 20 },
        { name: '物理', value: 15 },
      ]
    },
    {
      name: '艺术',
      itemStyle: { color: '#fc8452' },
      children: [
        { name: '音乐', value: 18 },
        { name: '绘画', value: 22 },
        { name: '摄影', value: 12 },
      ]
    },
    {
      name: '历史',
      itemStyle: { color: '#9a60b4' },
      children: [
        { name: '中国史', value: 25 },
        { name: '世界史', value: 20 },
      ]
    },
  ]
}

const examples = computed(() => [
  // ========== 基础旭日图 ==========
  {
    id: 'basic', title: '基础旭日图',
    options: {
      series: [{
        type: 'sunburst',
        sunburstData: basicSunburstData,
        sunburstAnimationType: globalAnimation.value,
      }]
    } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

const chart = new Chart('#container', {
  series: [{
    type: 'sunburst',
    sunburstData: {
      children: [
        {
          name: '数据A',
          children: [
            { name: 'A1', value: 10 },
            { name: 'A2', value: 15 },
            { name: 'A3', value: 8 },
          ]
        },
        // ...更多数据
      ]
    }
  }]
})`,
    vueCode: `<template>
  <LChart :options="chartOptions" />
</template>

<script setup>
import { LChart } from '@ldesign/chart-vue'

const chartOptions = {
  series: [{
    type: 'sunburst',
    sunburstData: { children: [...] }
  }]
}
<\/script>`,
  },
  // ========== 圆角旭日图 ==========
  {
    id: 'rounded', title: '圆角旭日图',
    options: {
      series: [{
        type: 'sunburst',
        sunburstData: basicSunburstData,
        sunburstCornerRadius: 5,
        sunburstAnimationType: globalAnimation.value,
      }]
    } as ChartOptions,
    nativeCode: `// 圆角旭日图 - sunburstCornerRadius
const chart = new Chart('#container', {
  series: [{
    type: 'sunburst',
    sunburstData: data,
    sunburstCornerRadius: 5  // 扇形圆角
  }]
})`,
    vueCode: `<LChart :options="{ series: [{ type: 'sunburst', sunburstData: data, sunburstCornerRadius: 5 }] }" />`,
  },
  // ========== 标签旋转旭日图 ==========
  {
    id: 'label-rotate', title: '旭日图标签旋转',
    options: {
      series: [{
        type: 'sunburst',
        sunburstData: drinkFlavorsData,
        sunburstLabelRotate: 'tangential',
        sunburstAnimationType: globalAnimation.value,
      }]
    } as ChartOptions,
    nativeCode: `// 标签切线方向旋转
const chart = new Chart('#container', {
  series: [{
    type: 'sunburst',
    sunburstData: data,
    sunburstLabelRotate: 'tangential'  // 'radial' | 'tangential' | number
  }]
})`,
    vueCode: `<LChart :options="{ series: [{ type: 'sunburst', sunburstData: data, sunburstLabelRotate: 'tangential' }] }" />`,
  },
  // ========== 单色旭日图 ==========
  {
    id: 'monochrome', title: 'Monochrome Sunburst',
    options: {
      series: [{
        type: 'sunburst',
        sunburstData: {
          children: basicSunburstData.children.map(node => ({
            ...node,
            itemStyle: { color: '#ee6666' },
            children: node.children?.map(child => ({ ...child, itemStyle: { color: '#ee6666' } }))
          }))
        },
        sunburstAnimationType: globalAnimation.value,
      }]
    } as ChartOptions,
    nativeCode: `// 单色旭日图 - 通过 itemStyle.color 设置统一颜色
const chart = new Chart('#container', {
  series: [{
    type: 'sunburst',
    sunburstData: {
      children: data.children.map(node => ({
        ...node,
        itemStyle: { color: '#ee6666' }
      }))
    }
  }]
})`,
    vueCode: `<LChart :options="monochromeOptions" />`,
  },
  // ========== 饮料口味旭日图 ==========
  {
    id: 'drink-flavors', title: 'Drink Flavors',
    options: {
      series: [{
        type: 'sunburst',
        sunburstData: drinkFlavorsData,
        sunburstAnimationType: globalAnimation.value,
      }]
    } as ChartOptions,
    nativeCode: `// 饮料口味分布
const drinkFlavorsData = {
  children: [
    {
      name: '咖啡',
      itemStyle: { color: '#6f4e37' },
      children: [
        { name: '美式', value: 25 },
        { name: '拿铁', value: 35 },
        // ...
      ]
    },
    // ...
  ]
}`,
    vueCode: `<LChart :options="{ series: [{ type: 'sunburst', sunburstData: drinkFlavorsData }] }" />`,
  },
  // ========== 组织结构旭日图 ==========
  {
    id: 'org', title: '组织结构旭日图',
    options: {
      series: [{
        type: 'sunburst',
        sunburstData: orgData,
        sunburstAnimationType: globalAnimation.value,
      }]
    } as ChartOptions,
    nativeCode: `// 公司组织结构
const orgData = {
  children: [
    {
      name: '技术部',
      itemStyle: { color: '#5470c6' },
      children: [
        { name: '前端组', children: [...] },
        { name: '后端组', children: [...] },
        { name: '测试组', value: 12 },
      ]
    },
    // ...
  ]
}`,
    vueCode: `<LChart :options="{ series: [{ type: 'sunburst', sunburstData: orgData }] }" />`,
  },
  // ========== 书籍分类旭日图 ==========
  {
    id: 'books', title: '书籍分布',
    options: {
      series: [{
        type: 'sunburst',
        sunburstData: bookData,
        sunburstSort: 'desc',
        sunburstAnimationType: globalAnimation.value,
      }]
    } as ChartOptions,
    nativeCode: `// 书籍分类 - 按值降序排列
const chart = new Chart('#container', {
  series: [{
    type: 'sunburst',
    sunburstData: bookData,
    sunburstSort: 'desc'  // 'desc' | 'asc' | null
  }]
})`,
    vueCode: `<LChart :options="{ series: [{ type: 'sunburst', sunburstData: bookData, sunburstSort: 'desc' }] }" />`,
  },
  // ========== 内半径旭日图 ==========
  {
    id: 'inner-radius', title: '中空旭日图',
    options: {
      series: [{
        type: 'sunburst',
        sunburstData: basicSunburstData,
        sunburstInnerRadius: 0.3,
        sunburstAnimationType: globalAnimation.value,
      }]
    } as ChartOptions,
    nativeCode: `// 中空旭日图 - 设置内半径
const chart = new Chart('#container', {
  series: [{
    type: 'sunburst',
    sunburstData: data,
    sunburstInnerRadius: 0.3  // 内半径为30%
  }]
})`,
    vueCode: `<LChart :options="{ series: [{ type: 'sunburst', sunburstData: data, sunburstInnerRadius: 0.3 }] }" />`,
  },
])
</script>

<template>
  <ChartPageLayout
    title="旭日图示例"
    description="旭日图用于展示层级数据的占比关系，支持多级嵌套、圆角、标签旋转、排序等功能。"
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
