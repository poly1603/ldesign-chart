/**
 * 图表元数据
 * 定义每种图表的属性和引擎支持情况
 */

export interface ChartMeta {
  id: string
  title: string
  description: string
  category: 'basic' | 'advanced' | 'vchart-only'
  engines: ('echarts' | 'vchart')[]
  badge?: string
  officialExample?: {
    echarts?: string
    vchart?: string
  }
}

export const chartMetadata: Record<string, ChartMeta> = {
  // 基础图表
  line: {
    id: 'line',
    title: '折线图',
    description: '展示数据趋势变化，适用于时间序列',
    category: 'basic',
    engines: ['echarts', 'vchart'],
    officialExample: {
      echarts: 'https://echarts.apache.org/examples/zh/editor.html?c=line-simple',
      vchart: 'https://www.visactor.io/vchart/demo/line-chart/basic-line'
    }
  },

  bar: {
    id: 'bar',
    title: '柱状图',
    description: '对比不同类别的数据大小',
    category: 'basic',
    engines: ['echarts', 'vchart'],
    officialExample: {
      echarts: 'https://echarts.apache.org/examples/zh/editor.html?c=bar-simple',
      vchart: 'https://www.visactor.io/vchart/demo/bar-chart/basic-bar'
    }
  },

  pie: {
    id: 'pie',
    title: '饼图',
    description: '展示占比分布，适用于部分与整体关系',
    category: 'basic',
    engines: ['echarts', 'vchart'],
    officialExample: {
      echarts: 'https://echarts.apache.org/examples/zh/editor.html?c=pie-simple',
      vchart: 'https://www.visactor.io/vchart/demo/pie-chart/basic-pie'
    }
  },

  scatter: {
    id: 'scatter',
    title: '散点图',
    description: '展示数据分布关系，适用于相关性分析',
    category: 'basic',
    engines: ['echarts', 'vchart'],
    officialExample: {
      echarts: 'https://echarts.apache.org/examples/zh/editor.html?c=scatter-simple',
      vchart: 'https://www.visactor.io/vchart/demo/scatter-chart/basic-scatter'
    }
  },

  radar: {
    id: 'radar',
    title: '雷达图',
    description: '多维度数据对比，适用于综合评估',
    category: 'basic',
    engines: ['echarts', 'vchart'],
    officialExample: {
      echarts: 'https://echarts.apache.org/examples/zh/editor.html?c=radar',
      vchart: 'https://www.visactor.io/vchart/demo/radar-chart/basic-radar'
    }
  },

  // 高级图表
  candlestick: {
    id: 'candlestick',
    title: 'K线图',
    description: '股票/期货价格走势图',
    category: 'advanced',
    engines: ['echarts', 'vchart'],
    badge: '金融',
    officialExample: {
      echarts: 'https://echarts.apache.org/examples/zh/editor.html?c=candlestick-simple'
    }
  },

  waterfall: {
    id: 'waterfall',
    title: '瀑布图',
    description: '展示数据的累加变化过程',
    category: 'advanced',
    engines: ['echarts', 'vchart'],
    badge: 'v1.3+',
    officialExample: {
      vchart: 'https://www.visactor.io/vchart/demo/waterfall/basic-waterfall'
    }
  },

  funnel: {
    id: 'funnel',
    title: '漏斗图',
    description: '展示业务流程的转化率',
    category: 'advanced',
    engines: ['echarts', 'vchart'],
    officialExample: {
      echarts: 'https://echarts.apache.org/examples/zh/editor.html?c=funnel',
      vchart: 'https://www.visactor.io/vchart/demo/funnel-chart/basic-funnel'
    }
  },

  gauge: {
    id: 'gauge',
    title: '仪表盘',
    description: '直观展示KPI指标完成情况',
    category: 'advanced',
    engines: ['echarts', 'vchart'],
    officialExample: {
      echarts: 'https://echarts.apache.org/examples/zh/editor.html?c=gauge-simple',
      vchart: 'https://www.visactor.io/vchart/demo/gauge-chart/basic-gauge'
    }
  },

  heatmap: {
    id: 'heatmap',
    title: '热力图',
    description: '矩阵数据的可视化，展示数据分布',
    category: 'advanced',
    engines: ['echarts', 'vchart'],
    officialExample: {
      echarts: 'https://echarts.apache.org/examples/zh/editor.html?c=heatmap-cartesian',
      vchart: 'https://www.visactor.io/vchart/demo/heatmap/basic-heatmap'
    }
  },

  sunburst: {
    id: 'sunburst',
    title: '旭日图',
    description: '展示层级数据的占比和关系',
    category: 'advanced',
    engines: ['echarts', 'vchart'],
    officialExample: {
      echarts: 'https://echarts.apache.org/examples/zh/editor.html?c=sunburst-simple',
      vchart: 'https://www.visactor.io/vchart/demo/sunburst-chart/basic-sunburst'
    }
  },

  mixed: {
    id: 'mixed',
    title: '混合图表',
    description: '多种图表类型组合展示',
    category: 'advanced',
    engines: ['echarts', 'vchart'],
    badge: '组合'
  },

  // VChart 专属
  'vchart-3d-bar': {
    id: 'vchart-3d-bar',
    title: '3D 柱状图',
    description: '立体视角的柱状图，视觉效果震撼',
    category: 'vchart-only',
    engines: ['vchart'],
    badge: 'VChart',
    officialExample: {
      vchart: 'https://www.visactor.io/vchart/demo/3d-chart/3d-bar'
    }
  },

  liquid: {
    id: 'liquid',
    title: '水球图',
    description: '以水球形式展示百分比数据',
    category: 'vchart-only',
    engines: ['vchart'],
    badge: 'VChart',
    officialExample: {
      vchart: 'https://www.visactor.io/vchart/demo/liquid-chart/basic-liquid'
    }
  },

  'circle-packing': {
    id: 'circle-packing',
    title: '圆堆积图',
    description: '圆形打包布局，展示层级关系',
    category: 'vchart-only',
    engines: ['vchart'],
    badge: 'VChart',
    officialExample: {
      vchart: 'https://www.visactor.io/vchart/demo/circle-packing/basic-circle-packing'
    }
  }
}

/**
 * 根据引擎过滤可用图表
 */
export function getAvailableCharts(engine: 'echarts' | 'vchart' | 'auto'): string[] {
  if (engine === 'auto') {
    return Object.keys(chartMetadata)
  }

  return Object.entries(chartMetadata)
    .filter(([_, meta]) => meta.engines.includes(engine))
    .map(([id]) => id)
}

/**
 * 检查图表类型是否被指定引擎支持
 */
export function isChartSupported(chartType: string, engine: 'echarts' | 'vchart' | 'auto'): boolean {
  if (engine === 'auto') return true

  const meta = chartMetadata[chartType]
  return meta ? meta.engines.includes(engine) : false
}


