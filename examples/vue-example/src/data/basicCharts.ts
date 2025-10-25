/**
 * 基础图表数据
 */

import { generateScatterData } from './generators/mockData'

export const basicChartsData = {
  line: {
    title: '折线图',
    description: '展示趋势变化，适用于时间序列数据',
    data: {
      labels: ['一月', '二月', '三月', '四月', '五月', '六月'],
      datasets: [{
        name: '销售额',
        data: [120, 200, 150, 80, 70, 110]
      }]
    }
  },

  bar: {
    title: '柱状图',
    description: '对比数据大小，适用于分类数据对比',
    data: {
      labels: ['产品A', '产品B', '产品C', '产品D'],
      datasets: [{
        name: '销量',
        data: [320, 150, 280, 200]
      }]
    }
  },

  pie: {
    title: '饼图',
    description: '展示占比分布，适用于部分与整体关系',
    data: {
      labels: ['直销', '联盟', '邮件', '视频'],
      datasets: [{
        data: [30, 25, 25, 20]
      }]
    }
  },

  scatter: {
    title: '散点图',
    description: '展示数据分布关系，适用于相关性分析',
    data: {
      labels: ['数据分布'],
      datasets: [{
        data: generateScatterData(100)
      }]
    }
  },

  radar: {
    title: '雷达图',
    description: '多维度数据对比，适用于综合评估',
    data: {
      labels: ['质量', '服务', '价格', '速度', '创新'],
      datasets: [
        { name: '产品A', data: [80, 90, 70, 85, 75] },
        { name: '产品B', data: [70, 85, 80, 75, 80] }
      ]
    }
  }
}

