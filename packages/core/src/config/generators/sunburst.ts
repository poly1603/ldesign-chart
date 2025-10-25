/**
 * 旭日图配置生成器（VChart 专属）
 */

import type { ParsedChartData } from '../../types';
import type { UniversalChartConfig } from '../../engines/base/engine-interface';

export default {
  /**
   * 生成旭日图的 VChart Spec
   */
  generate(parsedData: ParsedChartData, config: UniversalChartConfig): any {
    return {
      type: 'sunburst',
      data: {
        id: 'data',
        values: this.convertToHierarchical(parsedData),
      },
      categoryField: 'name',
      valueField: 'value',
      sunburst: {
        visible: true,
        style: {
          fill: (datum: any) => {
            // 根据层级设置颜色
            const colors = config.colors || [
              '#5470c6', '#91cc75', '#fac858', '#ee6666',
              '#73c0de', '#3ba272', '#fc8452', '#9a60b4',
            ];
            return colors[datum.depth % colors.length];
          },
        },
      },
      label: {
        visible: true,
        style: {
          fontSize: config.fontSize || 12,
        },
      },
      tooltip: {
        visible: true,
        mark: {
          title: {
            value: (datum: any) => datum.name,
          },
          content: [
            {
              key: '值',
              value: (datum: any) => datum.value,
            },
          ],
        },
      },
    };
  },

  /**
   * 将扁平数据转换为层级结构
   */
  convertToHierarchical(parsedData: ParsedChartData): any {
    const { xData, series } = parsedData;

    // 简单的层级结构
    return {
      name: 'root',
      children: xData.map((label, index) => ({
        name: label,
        value: series[0]?.[index] || 0,
      })),
    };
  },
};


