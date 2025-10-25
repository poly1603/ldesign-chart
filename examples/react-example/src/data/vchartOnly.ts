/**
 * VChart 专属图表数据
 */

export const vchartChartsData = {
  'vchart-3d-bar': {
    title: '3D 柱状图',
    description: '立体柱状图（VChart 专属）',
    badge: 'VChart Only',
    engine: 'vchart' as const,
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{
        data: [100, 200, 150, 300]
      }]
    }
  }
}


