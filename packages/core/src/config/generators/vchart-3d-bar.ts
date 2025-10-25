/**
 * 3D 柱状图配置生成器（VChart 专属）
 */

import type { ParsedChartData } from '../../types';
import type { UniversalChartConfig } from '../../engines/base/engine-interface';

export default {
  /**
   * 生成 3D 柱状图的 VChart Spec
   */
  generate(parsedData: ParsedChartData, config: UniversalChartConfig): any {
    const { xData, series, seriesNames } = parsedData;

    return {
      type: 'bar3d',
      data: {
        id: 'barData',
        values: this.convertData(xData, series, seriesNames),
      },
      xField: 'x',
      yField: 'y',
      zField: 'z',
      bar3d: {
        style: {
          fill: config.colors?.[0] || '#5470c6',
        },
      },
      axes: [
        {
          orient: 'bottom',
          type: 'band',
          domainLine: { visible: true },
          tick: { visible: true },
          label: { visible: true },
        },
        {
          orient: 'left',
          type: 'linear',
          domainLine: { visible: true },
          tick: { visible: true },
          label: { visible: true },
        },
        {
          orient: 'z',
          type: 'linear',
          domainLine: { visible: true },
          tick: { visible: true },
          label: { visible: true },
        },
      ],
    };
  },

  /**
   * 转换数据为 3D 格式
   */
  convertData(xData: any[], series: any[][], seriesNames: string[]): any[] {
    const values: any[] = [];

    series.forEach((data, seriesIndex) => {
      data.forEach((value, index) => {
        values.push({
          x: xData[index] || index,
          y: value,
          z: seriesNames[seriesIndex] || `系列${seriesIndex + 1}`,
          series: seriesNames[seriesIndex],
        });
      });
    });

    return values;
  },
};


