/**
 * 默认主题
 */

import type { Theme } from '../interface'

export const defaultTheme: Theme = {
  name: 'default',
  color: {
    palette: [
      '#5470c6',
      '#91cc75',
      '#fac858',
      '#ee6666',
      '#73c0de',
      '#3ba272',
      '#fc8452',
      '#9a60b4',
      '#ea7ccc',
    ],
    backgroundColor: '#ffffff',
    textColor: '#333333',
    borderColor: '#cccccc',
    splitLineColor: '#e0e0e0',
    gridLineColor: '#e0e0e0',
  },
  component: {
    title: {
      textStyle: {
        color: '#333333',
        fontSize: 18,
        fontWeight: 'bold',
      },
      subtextStyle: {
        color: '#666666',
        fontSize: 12,
      },
    },
    legend: {
      textStyle: {
        color: '#333333',
        fontSize: 12,
      },
      itemGap: 10,
      itemWidth: 25,
      itemHeight: 14,
    },
    axis: {
      axisLine: {
        lineStyle: {
          color: '#333333',
          width: 1,
        },
      },
      axisTick: {
        lineStyle: {
          color: '#333333',
          width: 1,
        },
      },
      axisLabel: {
        textStyle: {
          color: '#666666',
          fontSize: 12,
        },
      },
      splitLine: {
        lineStyle: {
          color: '#e0e0e0',
          width: 1,
          type: 'solid',
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      borderColor: '#333333',
      borderWidth: 0,
      textStyle: {
        color: '#ffffff',
        fontSize: 12,
      },
    },
  },
  series: {
    line: {
      lineWidth: 2,
      smooth: false,
      showSymbol: true,
      symbolSize: 4,
    },
    bar: {
      borderRadius: 0,
      barGap: 0.3,
    },
    scatter: {
      symbolSize: 10,
    },
    area: {
      lineWidth: 2,
      smooth: true,
      opacity: 0.5,
    },
  },
}