/**
 * 高级图表数据
 */

import { generateCandlestickData, generateHeatmapData } from './generators/mockData'

export const advancedChartsData = {
  candlestick: {
    title: 'K线图',
    description: '股票/期货价格走势图',
    badge: '金融',
    data: {
      labels: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'],
      datasets: [{
        type: 'candlestick',
        data: generateCandlestickData(6)
      }]
    }
  },

  waterfall: {
    title: '瀑布图',
    description: '展示累计变化过程',
    badge: 'v1.3+',
    data: {
      labels: ['初始', '收入', '支出', '税费', '净利润'],
      datasets: [{
        data: [100, 50, -30, -10, 110]
      }]
    }
  },

  funnel: {
    title: '漏斗图',
    description: '转化率分析，适用于流程分析',
    data: {
      labels: ['访问', '浏览', '加购', '下单', '支付'],
      datasets: [{
        data: [1000, 800, 500, 300, 200]
      }]
    }
  },

  gauge: {
    title: '仪表盘',
    description: '展示单一指标进度或完成度',
    data: {
      value: 75,
      min: 0,
      max: 100,
      title: '完成率'
    }
  },

  heatmap: {
    title: '热力图',
    description: '矩阵数据可视化，适用于多维数据',
    data: {
      labels: ['周一', '周二', '周三', '周四', '周五'],
      yLabels: ['早上', '中午', '下午', '晚上'],
      datasets: [{
        data: [
          [10, 20, 30, 40, 50],
          [15, 25, 35, 45, 55],
          [20, 30, 40, 50, 60],
          [25, 35, 45, 55, 65]
        ]
      }]
    }
  },

  sunburst: {
    title: '旭日图',
    description: '层级关系可视化，适用于树形数据',
    data: {
      name: '总计',
      children: [
        {
          name: '类别A',
          value: 100,
          children: [
            { name: 'A1', value: 50 },
            { name: 'A2', value: 50 }
          ]
        },
        {
          name: '类别B',
          value: 80,
          children: [
            { name: 'B1', value: 40 },
            { name: 'B2', value: 40 }
          ]
        }
      ]
    }
  },

  mixed: {
    title: '混合图表',
    description: '多种图表类型组合',
    badge: '高级',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          name: '销售额',
          type: 'bar',
          data: [100, 200, 150, 300]
        },
        {
          name: '增长率',
          type: 'line',
          data: [20, 50, 30, 80]
        }
      ]
    }
  }
}

