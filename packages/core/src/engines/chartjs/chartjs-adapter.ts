/**
 * Chart.js 配置适配器
 * 将通用配置转换为 Chart.js 配置格式
 */

import { BaseConfigAdapter } from '../base/config-adapter';
import type { UniversalChartConfig, SeriesConfig } from '../types';
import type { ChartType } from '../../types';

/**
 * Chart.js 配置适配器
 */
export class ChartJSConfigAdapter extends BaseConfigAdapter {
  /**
   * 将通用配置转换为 Chart.js 配置
   */
  adapt(config: UniversalChartConfig): any {
    const type = this.mapChartType(config.type);
    const datasets = this.adaptDatasets(config);
    const options = this.buildOptions(config);

    return {
      type,
      data: {
        labels: this.extractLabels(config),
        datasets,
      },
      options,
    };
  }

  /**
   * 映射图表类型
   */
  private mapChartType(type: ChartType | string): string {
    const mapping: Record<string, string> = {
      'line': 'line',
      'bar': 'bar',
      'pie': 'pie',
      'doughnut': 'doughnut',
      'donut': 'doughnut',
      'radar': 'radar',
      'polarArea': 'polarArea',
      'scatter': 'scatter',
      'bubble': 'bubble',
      'area': 'line', // 使用 fill 选项
      'column': 'bar',
      'gauge': 'doughnut', // 使用 doughnut 模拟
    };

    return mapping[type] || type;
  }

  /**
   * 提取标签
   */
  private extractLabels(config: UniversalChartConfig): string[] {
    // 从数据中提取标签
    if (config.data) {
      if ('labels' in config.data) {
        return config.data.labels;
      }
      if (Array.isArray(config.data)) {
        return config.data.map((_, i) => `${i + 1}`);
      }
      if ('categories' in config.data) {
        return config.data.categories;
      }
    }

    return [];
  }

  /**
   * 适配数据集
   */
  private adaptDatasets(config: UniversalChartConfig): any[] {
    const datasets: any[] = [];
    const type = this.mapChartType(config.type);

    // 处理不同的数据格式
    if (config.series) {
      // 使用 series 配置
      config.series.forEach(series => {
        datasets.push(this.adaptSeries(series, type));
      });
    } else if (config.data) {
      if ('datasets' in config.data) {
        // 已经是 datasets 格式
        config.data.datasets.forEach((dataset: any) => {
          datasets.push(this.adaptDataset(dataset, type));
        });
      } else if (Array.isArray(config.data)) {
        // 简单数组格式
        datasets.push({
          label: config.title || 'Data',
          data: config.data,
          ...this.getDefaultDatasetStyle(type),
        });
      } else if ('series' in config.data) {
        // 处理带 series 的数据
        config.data.series.forEach((series: any, index: number) => {
          datasets.push({
            label: series.name || `Series ${index + 1}`,
            data: series.data || series.values,
            ...this.getDefaultDatasetStyle(type),
            ...series,
          });
        });
      }
    }

    return datasets;
  }

  /**
   * 适配单个系列
   */
  private adaptSeries(series: SeriesConfig, chartType: string): any {
    const dataset: any = {
      label: series.name || 'Series',
      data: series.data,
    };

    // 应用样式
    if (series.style) {
      Object.assign(dataset, this.adaptStyle(series.style, chartType));
    }

    // 特定图表类型的配置
    switch (chartType) {
      case 'line':
        dataset.fill = series.fill !== undefined ? series.fill : false;
        dataset.tension = series.smooth ? 0.4 : 0;
        break;
      case 'bar':
        dataset.barThickness = series.barWidth;
        break;
      case 'scatter':
      case 'bubble':
        dataset.showLine = false;
        break;
    }

    return dataset;
  }

  /**
   * 适配数据集
   */
  private adaptDataset(dataset: any, chartType: string): any {
    const result: any = {
      label: dataset.label || dataset.name,
      data: dataset.data || dataset.values,
    };

    // 复制其他属性
    Object.keys(dataset).forEach(key => {
      if (!['label', 'name', 'data', 'values'].includes(key)) {
        result[key] = dataset[key];
      }
    });

    // 应用默认样式
    Object.assign(result, this.getDefaultDatasetStyle(chartType));

    return result;
  }

  /**
   * 适配样式
   */
  private adaptStyle(style: Record<string, any>, chartType: string): any {
    const result: any = {};

    // 颜色映射
    if (style.color) {
      result.borderColor = style.color;
      if (['bar', 'pie', 'doughnut', 'polarArea'].includes(chartType)) {
        result.backgroundColor = style.color;
      }
    }

    if (style.backgroundColor) {
      result.backgroundColor = style.backgroundColor;
    }

    if (style.borderColor) {
      result.borderColor = style.borderColor;
    }

    if (style.borderWidth !== undefined) {
      result.borderWidth = style.borderWidth;
    }

    if (style.pointRadius !== undefined) {
      result.pointRadius = style.pointRadius;
    }

    if (style.pointStyle) {
      result.pointStyle = style.pointStyle;
    }

    return result;
  }

  /**
   * 获取默认数据集样式
   */
  private getDefaultDatasetStyle(chartType: string): any {
    const styles: Record<string, any> = {
      line: {
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0,
        fill: false,
      },
      bar: {
        borderWidth: 1,
        borderRadius: 4,
      },
      radar: {
        borderWidth: 2,
        pointRadius: 3,
      },
      scatter: {
        pointRadius: 5,
        showLine: false,
      },
      bubble: {
        borderWidth: 1,
      },
    };

    return styles[chartType] || {};
  }

  /**
   * 构建选项配置
   */
  private buildOptions(config: UniversalChartConfig): any {
    const options: any = {
      responsive: config.responsive !== false,
      maintainAspectRatio: false,
      plugins: {},
      scales: {},
    };

    // 标题
    if (config.title) {
      options.plugins.title = {
        display: true,
        text: typeof config.title === 'string' ? config.title : config.title.text,
        ...(typeof config.title === 'object' ? config.title : {}),
      };
    }

    // 图例
    if (config.legend !== false) {
      options.plugins.legend = this.adaptLegend(config.legend);
    }

    // 提示框
    if (config.tooltip !== false) {
      options.plugins.tooltip = this.adaptTooltip(config.tooltip);
    }

    // 坐标轴
    if (this.needsScales(config.type)) {
      options.scales = this.adaptScales(config);
    }

    // 动画
    if (config.animation !== undefined) {
      options.animation = this.adaptAnimation(config.animation);
    }

    // 暗黑模式
    if (config.darkMode) {
      this.applyDarkMode(options);
    }

    // 字体大小
    if (config.fontSize) {
      this.applyFontSize(options, config.fontSize);
    }

    return options;
  }

  /**
   * 适配图例
   */
  private adaptLegend(legend: any): any {
    if (legend === true || legend === undefined) {
      return { display: true };
    }
    if (legend === false) {
      return { display: false };
    }
    return {
      display: true,
      position: legend.position || 'top',
      align: legend.align || 'center',
      ...legend,
    };
  }

  /**
   * 适配提示框
   */
  private adaptTooltip(tooltip: any): any {
    if (tooltip === false) {
      return { enabled: false };
    }
    if (tooltip === true || tooltip === undefined) {
      return { enabled: true };
    }
    return {
      enabled: true,
      ...tooltip,
    };
  }

  /**
   * 适配坐标轴
   */
  private adaptScales(config: UniversalChartConfig): any {
    const scales: any = {};

    // X 轴
    if (config.axes?.x) {
      scales.x = {
        type: this.mapScaleType(config.axes.x.type),
        display: config.axes.x.show !== false,
        title: {
          display: !!config.axes.x.name,
          text: config.axes.x.name,
        },
        ...config.axes.x,
      };
    } else {
      scales.x = { display: true };
    }

    // Y 轴
    if (config.axes?.y) {
      scales.y = {
        type: this.mapScaleType(config.axes.y.type),
        display: config.axes.y.show !== false,
        title: {
          display: !!config.axes.y.name,
          text: config.axes.y.name,
        },
        ...config.axes.y,
      };
    } else {
      scales.y = { display: true };
    }

    return scales;
  }

  /**
   * 映射坐标轴类型
   */
  private mapScaleType(type?: string): string {
    const mapping: Record<string, string> = {
      'value': 'linear',
      'category': 'category',
      'time': 'time',
      'log': 'logarithmic',
      'band': 'category',
      'linear': 'linear',
    };
    return type ? (mapping[type] || type) : 'linear';
  }

  /**
   * 适配动画
   */
  private adaptAnimation(animation: any): any {
    if (animation === false) {
      return false;
    }
    if (animation === true) {
      return true;
    }
    return {
      duration: animation.duration || 1000,
      easing: animation.easing || 'easeOutQuart',
      ...animation,
    };
  }

  /**
   * 检查是否需要坐标轴
   */
  private needsScales(type: ChartType | string): boolean {
    const typesWithScales = ['line', 'bar', 'scatter', 'bubble', 'area', 'column'];
    return typesWithScales.includes(type);
  }

  /**
   * 应用暗黑模式
   */
  private applyDarkMode(options: any): void {
    // 设置暗黑模式的默认颜色
    const darkColors = {
      text: '#e4e4e7',
      grid: '#27272a',
      tick: '#71717a',
    };

    // 应用到插件
    if (options.plugins.title) {
      options.plugins.title.color = darkColors.text;
    }
    if (options.plugins.legend) {
      options.plugins.legend.labels = {
        ...options.plugins.legend.labels,
        color: darkColors.text,
      };
    }

    // 应用到坐标轴
    if (options.scales) {
      Object.values(options.scales).forEach((scale: any) => {
        scale.ticks = {
          ...scale.ticks,
          color: darkColors.tick,
        };
        scale.grid = {
          ...scale.grid,
          color: darkColors.grid,
        };
        if (scale.title) {
          scale.title.color = darkColors.text;
        }
      });
    }
  }

  /**
   * 应用字体大小
   */
  private applyFontSize(options: any, fontSize: number): void {
    // 应用到标题
    if (options.plugins.title) {
      options.plugins.title.font = {
        ...options.plugins.title.font,
        size: fontSize + 4,
      };
    }

    // 应用到图例
    if (options.plugins.legend) {
      options.plugins.legend.labels = {
        ...options.plugins.legend.labels,
        font: { size: fontSize },
      };
    }

    // 应用到提示框
    if (options.plugins.tooltip) {
      options.plugins.tooltip.titleFont = {
        ...options.plugins.tooltip.titleFont,
        size: fontSize,
      };
      options.plugins.tooltip.bodyFont = {
        ...options.plugins.tooltip.bodyFont,
        size: fontSize,
      };
    }

    // 应用到坐标轴
    if (options.scales) {
      Object.values(options.scales).forEach((scale: any) => {
        scale.ticks = {
          ...scale.ticks,
          font: { size: fontSize },
        };
        if (scale.title) {
          scale.title.font = {
            ...scale.title.font,
            size: fontSize,
          };
        }
      });
    }
  }
}