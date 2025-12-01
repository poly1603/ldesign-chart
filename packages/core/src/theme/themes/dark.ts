/**
 * 暗色主题
 */

import type { Theme } from '../interface'

export const darkTheme: Theme = {
  name: 'dark',
  color: {
    palette: [
      '#4992ff',
      '#7cffb2',
      '#fddd60',
      '#ff6e76',
      '#58d9f9',
      '#05c091',
      '#ff8a45',
      '#8d48e3',
      '#dd79ff',
    ],
    backgroundColor: '#100c2a',
    textColor: '#eeeeee',
    borderColor: '#444444',
    splitLineColor: '#484753',
    gridLineColor: '#484753',
  },
  component: {
    title: {
      textStyle: {
        color: '#eeeeee',
        fontSize: 18,
        fontWeight: 'bold',
      },
      subtextStyle: {
        color: '#aaaaaa',
        fontSize: 12,
      },
    },
    legend: {
      textStyle: {
        color: '#eeeeee',
        fontSize: 12,
      },
      itemGap: 10,
      itemWidth: 25,
      itemHeight: 14,
    },
    axis: {
      axisLine: {
        lineStyle: {
          color: '#eeeeee',
          width: 1,
        },
      },
      axisTick: {
        lineStyle: {
          color: '#eeeeee',
          width: 1,
        },
      },
      axisLabel: {
        textStyle: {
          color: '#aaaaaa',
          fontSize: 12,
        },
      },
      splitLine: {
        lineStyle: {
          color: '#484753',
          width: 1,
          type: 'solid',
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(50, 50, 50, 0.95)',
      borderColor: '#777777',
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