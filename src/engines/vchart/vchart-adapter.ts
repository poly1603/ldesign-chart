/**
 * VChart 配置适配器
 * 将通用配置转换为 VChart Spec 格式
 */

import { BaseConfigAdapter } from '../base/config-adapter';
import type { UniversalChartConfig, ChartType } from '../base/engine-interface';

/**
 * VChart 配置适配器
 */
export class VChartConfigAdapter extends BaseConfigAdapter {
  /**
   * 将通用配置转换为 VChart Spec
   */
  adapt(config: UniversalChartConfig): any {
    // 1. 映射图表类型
    const type = this.mapChartType(config.type);

    // 2. 转换数据格式
    const data = this.adaptData(config.data);

    // 3. 构建 VChart Spec
    const spec: any = {
      type,
      data,
    };

    // 4. 添加标题
    if (config.title) {
      spec.title = this.adaptTitle(config);
    }

    // 5. 添加图例
    if (config.legend !== false) {
      spec.legends = this.adaptLegend(config);
    }

    // 6. 添加坐标轴（如果需要）
    if (this.needsAxes(type)) {
      spec.axes = this.adaptAxes(config);
    }

    // 7. 添加颜色
    if (config.colors) {
      spec.color = config.colors;
    }

    // 8. 添加提示框
    if (config.tooltip !== false) {
      spec.tooltip = this.adaptTooltip(config);
    }

    // 9. 应用暗黑模式
    if (config.darkMode) {
      spec.theme = 'dark';
    }

    // 10. 添加动画
    if (config.animation !== undefined) {
      spec.animation = config.animation;
    }

    return spec;
  }

  /**
   * 映射图表类型
   */
  private mapChartType(type: ChartType): string {
    const mapping: Record<string, string> = {
      'line': 'line',
      'bar': 'bar',
      'pie': 'pie',
      'scatter': 'scatter',
      'radar': 'radar',
      'heatmap': 'heatmap',
      'gauge': 'gauge',
      'funnel': 'funnel',
      'waterfall': 'waterfall',
      '3d-bar': 'bar3d',
      '3d-scatter': 'scatter3d',
      '3d-pie': 'pie3d',
      'sunburst': 'sunburst',
      'treemap': 'treemap',
      'sankey': 'sankey',
      'liquid': 'liquid',
      'wordcloud': 'wordCloud',
    };

    return mapping[type] || type;
  }

  /**
   * 转换数据格式
   */
  private adaptData(data: any): any {
    // VChart 支持多种数据格式
    // 需要根据数据结构进行转换

    if (Array.isArray(data)) {
      // 简单数组转换为 VChart 数据格式
      return {
        values: data.map((value, index) => ({
          x: index,
          y: value,
        })),
      };
    }

    if (data.datasets) {
      // Dataset 格式转换
      const values: any[] = [];
      const labels = data.labels || [];

      data.datasets.forEach((dataset: any) => {
        dataset.data.forEach((value: any, index: number) => {
          values.push({
            x: labels[index] || index,
            y: value,
            type: dataset.name || 'series',
          });
        });
      });

      return { values };
    }

    // 其他格式直接返回
    return data;
  }

  /**
   * 转换标题
   */
  private adaptTitle(config: UniversalChartConfig): any {
    if (typeof config.title === 'string') {
      return {
        visible: true,
        text: config.title,
      };
    }

    return {
      visible: true,
      ...config.title,
    };
  }

  /**
   * 转换图例
   */
  private adaptLegend(config: UniversalChartConfig): any {
    if (config.legend === true || config.legend === undefined) {
      return [
        {
          visible: true,
          orient: 'bottom',
        },
      ];
    }

    if (typeof config.legend === 'object') {
      const position = config.legend.position || 'bottom';
      const orient = config.legend.orient || 'horizontal';

      return [
        {
          visible: true,
          orient: position,
          layout: orient,
          ...config.legend,
        },
      ];
    }

    return [];
  }

  /**
   * 转换坐标轴
   */
  private adaptAxes(config: UniversalChartConfig): any {
    const axes: any[] = [];

    // X 轴
    axes.push({
      orient: 'bottom',
      type: config.axes?.x?.type || 'band',
      ...config.axes?.x,
    });

    // Y 轴
    axes.push({
      orient: 'left',
      type: config.axes?.y?.type || 'linear',
      ...config.axes?.y,
    });

    return axes;
  }

  /**
   * 转换提示框
   */
  private adaptTooltip(config: UniversalChartConfig): any {
    if (config.tooltip === true || config.tooltip === undefined) {
      return {
        visible: true,
        mark: {
          visible: true,
        },
      };
    }

    if (typeof config.tooltip === 'object') {
      return {
        visible: true,
        ...config.tooltip,
      };
    }

    return { visible: false };
  }

  /**
   * 检查图表类型是否需要坐标轴
   */
  private needsAxes(type: string): boolean {
    const typesNeedingAxes = [
      'line',
      'bar',
      'scatter',
      'heatmap',
      'waterfall',
    ];

    return typesNeedingAxes.includes(type);
  }
}


