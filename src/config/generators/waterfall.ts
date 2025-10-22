/**
 * 瀑布图配置生成器 - Waterfall Chart
 * 适用于展示财务数据、累计变化等场景
 */

import type { ParsedChartData, SmartChartConfig, EChartsOption } from '../../types';

export interface WaterfallDataPoint {
  name: string;
  value: number;
  isTotal?: boolean; // 是否是总计项
  itemStyle?: any;
}

/**
 * 生成瀑布图配置
 */
export default {
  generate(parsedData: ParsedChartData, config: SmartChartConfig): EChartsOption {
    const { xData, series } = parsedData;
    const dataset = config.datasets?.[0] || {};

    // 计算瀑布图数据
    const waterfallData = this.calculateWaterfallData(
      xData || [],
      series[0] || [],
      dataset
    );

    return {
      xAxis: config.xAxis || {
        type: 'category',
        data: waterfallData.categories,
        splitLine: { show: false },
        axisLine: { lineStyle: { color: '#999' } },
      },
      yAxis: config.yAxis || {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => {
            return dataset.formatter ? dataset.formatter(value) : value.toFixed(0);
          },
        },
      },
      series: [
        // 隐藏的辅助系列（用于定位）
        {
          name: 'Assist',
          type: 'bar',
          stack: 'Total',
          silent: true,
          itemStyle: {
            borderColor: 'transparent',
            color: 'transparent',
          },
          emphasis: {
            itemStyle: {
              borderColor: 'transparent',
              color: 'transparent',
            },
          },
          data: waterfallData.assists,
        },
        // 显示的数据系列
        {
          name: dataset.name || '值',
          type: 'bar',
          stack: 'Total',
          label: {
            show: dataset.showLabel !== false,
            position: 'top',
            formatter: (params: any) => {
              const value = params.value;
              if (dataset.formatter) {
                return dataset.formatter(value);
              }
              return value > 0 ? `+${value}` : value.toString();
            },
          },
          data: waterfallData.values,
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            ...dataset.itemStyle,
          },
        },
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          if (!Array.isArray(params)) params = [params];

          const dataIndex = params[0].dataIndex;
          const info = waterfallData.tooltipData[dataIndex];

          let result = `<b>${info.name}</b><br/>`;
          result += `当前值: ${info.current}<br/>`;
          if (info.cumulative !== undefined) {
            result += `累计值: ${info.cumulative}`;
          }

          return result;
        },
      },
      ...dataset,
    };
  },

  /**
   * 计算瀑布图数据
   */
  calculateWaterfallData(
    categories: any[],
    values: number[],
    dataset: any
  ): {
    categories: string[];
    assists: number[];
    values: any[];
    tooltipData: any[];
  } {
    const result = {
      categories: [] as string[],
      assists: [] as number[],
      values: [] as any[],
      tooltipData: [] as any[],
    };

    let cumulative = 0;

    categories.forEach((name, index) => {
      const value = values[index] || 0;
      const isTotal = dataset.totals?.includes(index) || false;

      result.categories.push(String(name));

      if (isTotal) {
        // 总计项：从0开始显示到累计值
        result.assists.push(0);
        result.values.push({
          value: cumulative,
          itemStyle: {
            color: dataset.totalColor || '#6B8E23',
          },
        });

        result.tooltipData.push({
          name,
          current: cumulative,
          cumulative: cumulative,
        });
      } else {
        // 普通项：从上一个累计值开始
        result.assists.push(cumulative);

        const color = value >= 0
          ? (dataset.positiveColor || '#91cc75')
          : (dataset.negativeColor || '#ee6666');

        result.values.push({
          value: Math.abs(value),
          itemStyle: { color },
        });

        cumulative += value;

        result.tooltipData.push({
          name,
          current: value,
          cumulative: cumulative,
        });
      }
    });

    // 如果启用了自动总计，添加总计列
    if (dataset.autoTotal !== false && !dataset.totals) {
      result.categories.push('总计');
      result.assists.push(0);
      result.values.push({
        value: cumulative,
        itemStyle: {
          color: dataset.totalColor || '#6B8E23',
        },
      });
      result.tooltipData.push({
        name: '总计',
        current: cumulative,
        cumulative: cumulative,
      });
    }

    return result;
  },
};

