<script setup lang="ts">
import { computed } from 'vue'
import ChartPageLayout from '@/components/ChartPageLayout.vue'
import type { ChartOptions, WordCloudDataItem, WordCloudShape } from '@ldesign/chart-core'

const props = defineProps<{ useMode: 'native' | 'vue'; rendererType: 'canvas' | 'svg'; isDark: boolean }>()

// 基础词云数据 - 热门话题
const basicWordData: WordCloudDataItem[] = [
  { name: '宅家dou剧场', value: 1000 },
  { name: '我的观影报告', value: 900 },
  { name: '我要上热门', value: 850 },
  { name: '抖瓜小助手', value: 800 },
  { name: '正能量', value: 750 },
  { name: '搞笑', value: 700 },
  { name: '热门', value: 680 },
  { name: '影视剪辑', value: 650 },
  { name: '教师节', value: 600 },
  { name: '抖瓜热门', value: 550 },
  { name: '美食', value: 500 },
  { name: '情感', value: 450 },
  { name: '音乐', value: 420 },
  { name: '健康', value: 400 },
  { name: '涨知识', value: 380 },
  { name: '家庭', value: 350 },
  { name: '解说电影', value: 320 },
  { name: '浪计划', value: 300 },
  { name: '舞蹈', value: 280 },
  { name: '画画', value: 250 },
  { name: '我在抖瓜看综艺', value: 240 },
  { name: '健身', value: 220 },
  { name: '一口吃个秋', value: 200 },
  { name: '寻情记', value: 180 },
  { name: '沙雕', value: 160 },
]

// 技术栈词云数据
const techWordData: WordCloudDataItem[] = [
  { name: 'Vue.js', value: 100 },
  { name: 'React', value: 95 },
  { name: 'Angular', value: 70 },
  { name: 'Node.js', value: 85 },
  { name: 'TypeScript', value: 90 },
  { name: 'JavaScript', value: 88 },
  { name: 'Python', value: 75 },
  { name: 'Go', value: 60 },
  { name: 'Rust', value: 55 },
  { name: 'Docker', value: 72 },
  { name: 'Kubernetes', value: 65 },
  { name: 'MongoDB', value: 58 },
  { name: 'PostgreSQL', value: 62 },
  { name: 'Redis', value: 50 },
  { name: 'GraphQL', value: 48 },
  { name: 'REST', value: 45 },
  { name: 'Webpack', value: 42 },
  { name: 'Vite', value: 68 },
  { name: 'ESLint', value: 35 },
  { name: 'Git', value: 80 },
]

// 城市词云数据
const cityWordData: WordCloudDataItem[] = [
  { name: '北京', value: 100 },
  { name: '上海', value: 95 },
  { name: '广州', value: 85 },
  { name: '深圳', value: 90 },
  { name: '杭州', value: 75 },
  { name: '成都', value: 70 },
  { name: '武汉', value: 65 },
  { name: '南京', value: 60 },
  { name: '重庆', value: 72 },
  { name: '西安', value: 55 },
  { name: '苏州', value: 50 },
  { name: '天津', value: 48 },
  { name: '长沙', value: 45 },
  { name: '青岛', value: 42 },
  { name: '厦门', value: 40 },
  { name: '大连', value: 38 },
  { name: '宁波', value: 35 },
  { name: '无锡', value: 32 },
  { name: '合肥', value: 30 },
  { name: '郑州', value: 28 },
]

// 食物词云数据 - 美食话题
const foodWordData: WordCloudDataItem[] = [
  { name: '螺蛳粉', value: 957 },
  { name: '钵钵鸡', value: 942 },
  { name: '板栗', value: 842 },
  { name: '胡辣汤', value: 828 },
  { name: '关东煮', value: 665 },
  { name: '热干面', value: 580 },
  { name: '羊肉汤', value: 520 },
  { name: '灌肠', value: 480 },
  { name: '米粉', value: 450 },
  { name: '凉皮', value: 420 },
  { name: '春卷', value: 380 },
  { name: '豆腐脑', value: 350 },
  { name: '麻花', value: 320 },
  { name: '臊子面', value: 300 },
  { name: '肉夹馍', value: 280 },
  { name: '酸辣粉', value: 260 },
]

const examples = computed(() => [
  // ========== 基础词云 ==========
  {
    id: 'basic', title: '基础词云',
    options: {
      series: [{
        type: 'wordcloud',
        wordCloudData: basicWordData,
      }]
    } as ChartOptions,
    nativeCode: `import { Chart } from '@ldesign/chart-core'

const chart = new Chart('#container', {
  series: [{
    type: 'wordcloud',
    wordCloudData: [
      { name: '可视化', value: 100 },
      { name: '图表', value: 90 },
      { name: '数据', value: 85 },
      // ...
    ]
  }]
})`,
    vueCode: `<LChart :options="{ series: [{ type: 'wordcloud', wordCloudData: [...] }] }" />`,
  },
  // ========== 矩形词云 ==========
  {
    id: 'rect', title: '矩形词云',
    options: {
      series: [{
        type: 'wordcloud',
        wordCloudData: techWordData,
        wordCloudShape: 'rect' as WordCloudShape,
        wordCloudDrawMask: true,
      }]
    } as ChartOptions,
    nativeCode: `// 矩形词云
const chart = new Chart('#container', {
  series: [{
    type: 'wordcloud',
    wordCloudData: [...],
    wordCloudShape: 'rect',
    wordCloudDrawMask: true
  }]
})`,
    vueCode: `<LChart :options="rectOptions" />`,
  },
  // ========== 菱形词云 ==========
  {
    id: 'diamond', title: '菱形词云',
    options: {
      series: [{
        type: 'wordcloud',
        wordCloudData: cityWordData,
        wordCloudShape: 'diamond' as WordCloudShape,
        wordCloudDrawMask: true,
        wordCloudColors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'],
      }]
    } as ChartOptions,
    nativeCode: `// 菱形词云
const chart = new Chart('#container', {
  series: [{
    type: 'wordcloud',
    wordCloudData: [...],
    wordCloudShape: 'diamond',
    wordCloudDrawMask: true
  }]
})`,
    vueCode: `<LChart :options="diamondOptions" />`,
  },
  // ========== 三角形词云 ==========
  {
    id: 'triangle', title: '三角形词云',
    options: {
      series: [{
        type: 'wordcloud',
        wordCloudData: foodWordData,
        wordCloudShape: 'triangle' as WordCloudShape,
        wordCloudDrawMask: true,
        wordCloudMinFontSize: 14,
        wordCloudMaxFontSize: 50,
      }]
    } as ChartOptions,
    nativeCode: `// 三角形词云
const chart = new Chart('#container', {
  series: [{
    type: 'wordcloud',
    wordCloudData: [...],
    wordCloudShape: 'triangle',
    wordCloudDrawMask: true
  }]
})`,
    vueCode: `<LChart :options="triangleOptions" />`,
  },
  // ========== 星形词云 ==========
  {
    id: 'star', title: '星形词云',
    options: {
      series: [{
        type: 'wordcloud',
        wordCloudData: basicWordData,
        wordCloudShape: 'star' as WordCloudShape,
        wordCloudDrawMask: true,
        wordCloudColors: ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'],
      }]
    } as ChartOptions,
    nativeCode: `// 星形词云
const chart = new Chart('#container', {
  series: [{
    type: 'wordcloud',
    wordCloudData: [...],
    wordCloudShape: 'star',
    wordCloudDrawMask: true
  }]
})`,
    vueCode: `<LChart :options="starOptions" />`,
  },
  // ========== 心形词云 ==========
  {
    id: 'heart', title: '心形词云',
    options: {
      series: [{
        type: 'wordcloud',
        wordCloudData: cityWordData,
        wordCloudShape: 'heart' as WordCloudShape,
        wordCloudDrawMask: true,
        wordCloudColors: ['#e74c3c', '#c0392b', '#ff6b6b', '#ee5a24', '#f39c12'],
      }]
    } as ChartOptions,
    nativeCode: `// 心形词云
const chart = new Chart('#container', {
  series: [{
    type: 'wordcloud',
    wordCloudData: [...],
    wordCloudShape: 'heart',
    wordCloudDrawMask: true
  }]
})`,
    vueCode: `<LChart :options="heartOptions" />`,
  },
  // ========== 自定义字体 ==========
  {
    id: 'custom-font', title: '自定义字体',
    options: {
      series: [{
        type: 'wordcloud',
        wordCloudData: techWordData,
        wordCloudFontFamily: 'Georgia, serif',
        wordCloudFontWeight: 'bold',
        wordCloudMinFontSize: 10,
        wordCloudMaxFontSize: 48,
      }]
    } as ChartOptions,
    nativeCode: `// 自定义字体
const chart = new Chart('#container', {
  series: [{
    type: 'wordcloud',
    wordCloudData: [...],
    wordCloudFontFamily: 'Georgia, serif',
    wordCloudFontWeight: 'bold'
  }]
})`,
    vueCode: `<LChart :options="customFontOptions" />`,
  },
  // ========== 单色词云 ==========
  {
    id: 'mono-color', title: '单色词云',
    options: {
      series: [{
        type: 'wordcloud',
        wordCloudData: basicWordData,
        wordCloudRandomColor: false,
        wordCloudColors: ['#3498db'],
        wordCloudMaxFontSize: 55,
      }]
    } as ChartOptions,
    nativeCode: `// 单色词云
const chart = new Chart('#container', {
  series: [{
    type: 'wordcloud',
    wordCloudData: [...],
    wordCloudRandomColor: false,
    wordCloudColors: ['#3498db']
  }]
})`,
    vueCode: `<LChart :options="monoColorOptions" />`,
  },
  // ========== 等大小词云 ==========
  {
    id: 'same-size', title: '等大小词云',
    options: {
      series: [{
        type: 'wordcloud',
        wordCloudData: basicWordData.map(d => ({ ...d, value: 100 })),
        wordCloudMinFontSize: 16,
        wordCloudMaxFontSize: 16,
      }]
    } as ChartOptions,
    nativeCode: `// 等大小词云 - 不配置大小字段
const chart = new Chart('#container', {
  series: [{
    type: 'wordcloud',
    wordCloudData: [...],
    wordCloudMinFontSize: 16,
    wordCloudMaxFontSize: 16
  }]
})`,
    vueCode: `<LChart :options="sameSizeOptions" />`,
  },
  // ========== 只有水平方向 ==========
  {
    id: 'horizontal', title: '水平词云',
    options: {
      series: [{
        type: 'wordcloud',
        wordCloudData: foodWordData,
        wordCloudRotationRange: [0, 0],
        wordCloudRotationStep: 1,
        wordCloudColors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272'],
      }]
    } as ChartOptions,
    nativeCode: `// 水平词云 - 只有0度旋转
const chart = new Chart('#container', {
  series: [{
    type: 'wordcloud',
    wordCloudData: [...],
    wordCloudRotationRange: [0, 0]
  }]
})`,
    vueCode: `<LChart :options="horizontalOptions" />`,
  },
  // ========== 随机角度词云 ==========
  {
    id: 'random-angle', title: '随机角度词云',
    options: {
      series: [{
        type: 'wordcloud',
        wordCloudData: techWordData,
        wordCloudRotationRange: [-45, 45],
        wordCloudRotationStep: 15,
      }]
    } as ChartOptions,
    nativeCode: `// 随机角度词云
const chart = new Chart('#container', {
  series: [{
    type: 'wordcloud',
    wordCloudData: [...],
    wordCloudRotationRange: [-45, 45],
    wordCloudRotationStep: 15
  }]
})`,
    vueCode: `<LChart :options="randomAngleOptions" />`,
  },
  // ========== 大字体词云 ==========
  {
    id: 'large-font', title: '大字体词云',
    options: {
      series: [{
        type: 'wordcloud',
        wordCloudData: foodWordData.slice(0, 8),
        wordCloudMinFontSize: 24,
        wordCloudMaxFontSize: 80,
        wordCloudColors: ['#5470c6'],
        wordCloudRandomColor: false,
      }]
    } as ChartOptions,
    nativeCode: `// 大字体词云 - 少量词自适应
const chart = new Chart('#container', {
  series: [{
    type: 'wordcloud',
    wordCloudData: [...],
    wordCloudMinFontSize: 24,
    wordCloudMaxFontSize: 80
  }]
})`,
    vueCode: `<LChart :options="largeFontOptions" />`,
  },
  // ========== 渐变色词云 ==========
  {
    id: 'gradient', title: '渐变色词云',
    options: {
      series: [{
        type: 'wordcloud',
        wordCloudData: cityWordData,
        wordCloudColors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
      }]
    } as ChartOptions,
    nativeCode: `// 渐变色词云
const chart = new Chart('#container', {
  series: [{
    type: 'wordcloud',
    wordCloudData: [...],
    wordCloudColors: ['#667eea', '#764ba2', '#f093fb', '#f5576c']
  }]
})`,
    vueCode: `<LChart :options="gradientOptions" />`,
  },
  // ========== 紧凑词云 ==========
  {
    id: 'compact', title: '紧凑词云',
    options: {
      series: [{
        type: 'wordcloud',
        wordCloudData: basicWordData,
        wordCloudGridSize: 1,
        wordCloudMinFontSize: 10,
        wordCloudMaxFontSize: 45,
      }]
    } as ChartOptions,
    nativeCode: `// 紧凑词云 - 更小间距
const chart = new Chart('#container', {
  series: [{
    type: 'wordcloud',
    wordCloudData: [...],
    wordCloudGridSize: 1
  }]
})`,
    vueCode: `<LChart :options="compactOptions" />`,
  },
  // ========== 暖色系词云 ==========
  {
    id: 'warm-colors', title: '暖色系词云',
    options: {
      series: [{
        type: 'wordcloud',
        wordCloudData: foodWordData,
        wordCloudColors: ['#ff6b6b', '#feca57', '#ff9ff3', '#f39c12', '#e74c3c', '#fd79a8'],
        wordCloudShape: 'rect' as WordCloudShape,
      }]
    } as ChartOptions,
    nativeCode: `// 暖色系词云
const chart = new Chart('#container', {
  series: [{
    type: 'wordcloud',
    wordCloudData: [...],
    wordCloudColors: ['#ff6b6b', '#feca57', '#ff9ff3']
  }]
})`,
    vueCode: `<LChart :options="warmColorsOptions" />`,
  },
  // ========== 冷色系词云 ==========
  {
    id: 'cool-colors', title: '冷色系词云',
    options: {
      series: [{
        type: 'wordcloud',
        wordCloudData: techWordData,
        wordCloudColors: ['#74b9ff', '#0984e3', '#00cec9', '#81ecec', '#a29bfe', '#6c5ce7'],
        wordCloudShape: 'diamond' as WordCloudShape,
      }]
    } as ChartOptions,
    nativeCode: `// 冷色系词云
const chart = new Chart('#container', {
  series: [{
    type: 'wordcloud',
    wordCloudData: [...],
    wordCloudColors: ['#74b9ff', '#0984e3', '#00cec9']
  }]
})`,
    vueCode: `<LChart :options="coolColorsOptions" />`,
  },
  // ========== 彩虹色词云 ==========
  {
    id: 'rainbow', title: '彩虹色词云',
    options: {
      series: [{
        type: 'wordcloud',
        wordCloudData: cityWordData,
        wordCloudColors: ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'],
      }]
    } as ChartOptions,
    nativeCode: `// 彩虹色词云
const chart = new Chart('#container', {
  series: [{
    type: 'wordcloud',
    wordCloudData: [...],
    wordCloudColors: ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6']
  }]
})`,
    vueCode: `<LChart :options="rainbowOptions" />`,
  },
  // ========== 小型词云 ==========
  {
    id: 'small', title: '小型词云',
    options: {
      series: [{
        type: 'wordcloud',
        wordCloudData: basicWordData.slice(0, 12),
        wordCloudMinFontSize: 8,
        wordCloudMaxFontSize: 28,
        wordCloudGridSize: 1,
      }]
    } as ChartOptions,
    nativeCode: `// 小型词云
const chart = new Chart('#container', {
  series: [{
    type: 'wordcloud',
    wordCloudData: [...],
    wordCloudMinFontSize: 8,
    wordCloudMaxFontSize: 28
  }]
})`,
    vueCode: `<LChart :options="smallOptions" />`,
  },
  // ========== 密集词云 ==========
  {
    id: 'dense', title: '密集词云',
    options: {
      series: [{
        type: 'wordcloud',
        wordCloudData: [...basicWordData, ...techWordData.slice(0, 10)],
        wordCloudMinFontSize: 10,
        wordCloudMaxFontSize: 40,
        wordCloudGridSize: 1,
      }]
    } as ChartOptions,
    nativeCode: `// 密集词云 - 大量数据
const chart = new Chart('#container', {
  series: [{
    type: 'wordcloud',
    wordCloudData: [...],  // 大量数据
    wordCloudGridSize: 1
  }]
})`,
    vueCode: `<LChart :options="denseOptions" />`,
  },
])

// 刷新示例数据
function refreshExample(index: number) {
  console.log('刷新词云示例', index)
}

// 示例数量
const exampleCount = computed(() => examples.value.length)

defineExpose({ exampleCount })
</script>

<template>
  <ChartPageLayout
    title="词云示例"
    description="词云图用于展示文本数据的词频或权重，词语大小与其权重成正比。支持多种形状（圆形、矩形、菱形、三角形、星形、心形）、自定义颜色和字体等配置。"
    :examples="examples"
    :use-mode="props.useMode"
    :renderer-type="props.rendererType"
    :is-dark="props.isDark"
    layout="sidebar"
    @refresh="refreshExample"
  />
</template>
