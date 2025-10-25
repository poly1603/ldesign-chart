/**
 * 漏斗图配置生成器（增强版）
 * 支持：标准漏斗图、金字塔图、对比漏斗图、转化率标注
 */

import type { ParsedChartData, SmartChartConfig, EChartsOption } from '../../types';

export default {
  generate(parsedData: ParsedChartData, config: SmartChartConfig): EChartsOption {
    const { xData, series } = parsedData;
    const dataset = config.datasets?.[0] || {} as any;

    // 漏斗图模式
    const mode = dataset.mode || 'funnel'; // 'funnel' | 'pyramid' | 'compare'

    if (mode === 'compare') {
      return this.generateCompareFunnel(parsedData, config);
    }

    // 漏斗图数据格式
    const data = (xData || []).map((name, index) => {
      const value = series[0]?.[index] || 0;
      return {
        name: String(name),
        value,
      };
    });

    // 计算转化率
    const conversionRates = this.calculateConversionRate(data);

    return {
      series: [
        {
          type: 'funnel',
          data,
          // 金字塔模式：从小到大排列
          sort: mode === 'pyramid' ? 'ascending' : (dataset.sort || 'descending'),
          gap: dataset.gap || 2,
          // 金字塔模式使用不同的对齐方式
          funnelAlign: mode === 'pyramid' ? 'center' : (dataset.funnelAlign || 'center'),
          label: {
            show: true,
            position: dataset.labelPosition || 'inside',
            formatter: (params: any) => {
              let text = params.name;

              // 显示转化率
              if (dataset.showConversionRate !== false && params.dataIndex > 0) {
                const rate = conversionRates[params.dataIndex];
                text += `\n${rate.toFixed(1)}%`;
              }

              // 显示值
              if (dataset.showValue !== false) {
                text += `\n${params.value}`;
              }

              return text;
            },
            ...(dataset.label || {}),
          },
          labelLine: {
            length: dataset.labelLineLength || 10,
            lineStyle: {
              width: 1,
              type: 'solid',
            },
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1,
            ...(dataset.itemStyle || {}),
          },
          emphasis: {
            label: {
              fontSize: 20,
            },
          },
          // 最小尺寸（避免最后一项太小）
          minSize: dataset.minSize || '0%',
          maxSize: dataset.maxSize || '100%',
          ...dataset,
        },
      ],
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          let text = `<b>${params.name}</b><br/>`;
          text += `数值: ${params.value}<br/>`;
          text += `占比: ${params.percent}%<br/>`;

          if (params.dataIndex > 0) {
            const rate = conversionRates[params.dataIndex];
            text += `转化率: ${rate.toFixed(2)}%`;
          }

          return text;
        },
      },
    };
  },

  /**
   * 生成对比漏斗图
   */
  generateCompareFunnel(parsedData: ParsedChartData, config: SmartChartConfig): EChartsOption {
    const { xData, series } = parsedData;
    const dataset = config.datasets?.[0] || {};

    // 左右对比的两组数据
    const leftData = (xData || []).map((name, index) => ({
      name: String(name),
      value: series[0]?.[index] || 0,
    }));

    const rightData = (xData || []).map((name, index) => ({
      name: String(name),
      value: series[1]?.[index] || 0,
    }));

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c}',
      },
      legend: {
        data: [dataset.leftName || '组 A', dataset.rightName || '组 B'],
        orient: 'vertical',
        left: 'left',
        top: 'center',
      },
      series: [
        {
          name: dataset.leftName || '组 A',
          type: 'funnel',
          width: '40%',
          height: '80%',
          left: '5%',
          top: 'center',
          data: leftData,
          label: {
            position: 'left',
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1,
          },
        },
        {
          name: dataset.rightName || '组 B',
          type: 'funnel',
          width: '40%',
          height: '80%',
          left: '55%',
          top: 'center',
          sort: 'ascending',
          data: rightData,
          label: {
            position: 'right',
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1,
          },
        },
      ],
    };
  },

  /**
   * 计算转化率
   */
  calculateConversionRate(data: any[]): number[] {
    const rates: number[] = [100]; // 第一项转化率为100%

    for (let i = 1; i < data.length; i++) {
      const prevValue = data[i - 1].value;
      const currValue = data[i].value;

      if (prevValue === 0) {
        rates.push(0);
      } else {
        rates.push((currValue / prevValue) * 100);
      }
    }

    return rates;
  },
};

