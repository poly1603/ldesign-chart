/**
 * 仪表盘配置生成器（增强版）
 * 支持：标准仪表盘、多指针仪表盘、分段颜色、进度环、时钟样式
 */

import type { ParsedChartData, SmartChartConfig, EChartsOption } from '../../types';

export default {
  generate(parsedData: ParsedChartData, config: SmartChartConfig): EChartsOption {
    const { series, seriesNames } = parsedData;
    const dataset = config.datasets?.[0] || {};

    // 仪表盘模式
    const mode = dataset.mode || 'gauge'; // 'gauge' | 'progress' | 'clock' | 'multi'

    switch (mode) {
      case 'progress':
        return this.generateProgressRing(series, dataset);
      case 'clock':
        return this.generateClock(series, dataset);
      case 'multi':
        return this.generateMultiPointer(series, seriesNames, dataset);
      default:
        return this.generateStandard(series, dataset);
    }
  },

  /**
   * 标准仪表盘
   */
  generateStandard(series: any[][], dataset: any): EChartsOption {
    const value = series[0]?.[0] || 0;
    const min = dataset.min || 0;
    const max = dataset.max || 100;

    // 分段颜色配置
    const axisLine = dataset.segmentColors ? {
      lineStyle: {
        width: 30,
        color: this.generateSegmentColors(dataset.segmentColors, min, max)
      }
    } : {
      lineStyle: { width: 30 }
    };

    return {
      series: [
        {
          type: 'gauge',
          min,
          max,
          progress: {
            show: true,
            width: 18,
          },
          axisLine,
          axisTick: {
            show: dataset.showTick !== false,
          },
          splitLine: {
            show: dataset.showSplitLine !== false,
            length: 15,
            lineStyle: {
              width: 2,
              color: '#999',
            },
          },
          axisLabel: {
            distance: 25,
            color: '#999',
            fontSize: 14,
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 25,
            itemStyle: {
              borderWidth: 10,
            },
          },
          title: {
            show: dataset.showTitle !== false,
            offsetCenter: [0, '70%'],
          },
          detail: {
            valueAnimation: true,
            fontSize: 40,
            offsetCenter: [0, '0%'],
            formatter: dataset.formatter || '{value}',
          },
          data: [
            {
              value,
              name: dataset.name || '进度',
            },
          ],
          ...dataset,
        },
      ],
    };
  },

  /**
   * 进度环
   */
  generateProgressRing(series: any[][], dataset: any): EChartsOption {
    const value = series[0]?.[0] || 0;
    const min = dataset.min || 0;
    const max = dataset.max || 100;

    return {
      series: [
        {
          type: 'gauge',
          startAngle: 90,
          endAngle: -270,
          min,
          max,
          pointer: {
            show: false,
          },
          progress: {
            show: true,
            overlap: false,
            roundCap: true,
            clip: false,
            itemStyle: {
              borderWidth: 1,
              borderColor: '#464646',
            },
          },
          axisLine: {
            lineStyle: {
              width: 20,
            },
          },
          splitLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
          detail: {
            valueAnimation: true,
            fontSize: 50,
            offsetCenter: [0, 0],
            formatter: dataset.formatter || '{value}%',
            color: 'inherit',
          },
          data: [
            {
              value,
              name: dataset.name || '完成率',
            },
          ],
          ...dataset,
        },
      ],
    };
  },

  /**
   * 多指针仪表盘
   */
  generateMultiPointer(series: any[][], seriesNames: string[], dataset: any): EChartsOption {
    const min = dataset.min || 0;
    const max = dataset.max || 100;

    // 为每个系列创建指针数据
    const data = series[0].map((value, index) => ({
      value,
      name: seriesNames[index] || `指标 ${index + 1}`,
      title: {
        offsetCenter: [0, `${20 + index * 15}%`],
      },
      detail: {
        offsetCenter: [0, `${35 + index * 15}%`],
      },
    }));

    return {
      series: [
        {
          type: 'gauge',
          min,
          max,
          axisLine: {
            lineStyle: {
              width: 30,
            },
          },
          pointer: {
            itemStyle: {
              color: 'auto',
            },
          },
          axisTick: {
            distance: -30,
            splitNumber: 5,
            lineStyle: {
              width: 2,
              color: '#999',
            },
          },
          splitLine: {
            distance: -30,
            length: 30,
            lineStyle: {
              width: 4,
              color: '#999',
            },
          },
          axisLabel: {
            color: 'auto',
            distance: 40,
            fontSize: 14,
          },
          detail: {
            valueAnimation: true,
            formatter: dataset.formatter || '{value}',
            color: 'auto',
          },
          data,
          ...dataset,
        },
      ],
    };
  },

  /**
   * 时钟样式仪表盘
   */
  generateClock(series: any[][], dataset: any): EChartsOption {
    const value = series[0]?.[0] || 0;

    return {
      series: [
        {
          type: 'gauge',
          startAngle: 90,
          endAngle: -270,
          min: 0,
          max: dataset.max || 12,
          splitNumber: dataset.max || 12,
          clockwise: true,
          axisLine: {
            lineStyle: {
              width: 6,
              color: [[1, '#AAAAAA']],
            },
          },
          pointer: {
            icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z',
            length: '75%',
            width: 8,
            offsetCenter: [0, 0],
            itemStyle: {
              color: '#C0911F',
            },
          },
          axisTick: {
            show: true,
            splitNumber: 5,
            lineStyle: {
              width: 2,
              color: '#999',
            },
            length: -8,
          },
          splitLine: {
            show: true,
            length: -20,
            lineStyle: {
              width: 3,
              color: '#999',
            },
          },
          axisLabel: {
            fontSize: 14,
            distance: -35,
            formatter: (value: number) => {
              return value === 0 ? '12' : String(value);
            },
          },
          title: {
            show: false,
          },
          detail: {
            show: false,
          },
          data: [{ value }],
          ...dataset,
        },
      ],
    };
  },

  /**
   * 生成分段颜色
   */
  generateSegmentColors(segments: any[], min: number, max: number): any[] {
    const range = max - min;
    return segments.map((seg, index) => {
      const threshold = seg.threshold !== undefined
        ? (seg.threshold - min) / range
        : (index + 1) / segments.length;

      return [threshold, seg.color || '#5470c6'];
    });
  },
};

