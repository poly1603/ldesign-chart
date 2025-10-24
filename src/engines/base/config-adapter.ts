/**
 * 配置适配器基类
 * 提供通用的配置转换逻辑
 */

import type { UniversalChartConfig, ConfigAdapter } from './engine-interface';

/**
 * 抽象配置适配器
 * 子类必须实现 adapt 方法
 */
export abstract class BaseConfigAdapter implements ConfigAdapter {
  /**
   * 将通用配置转换为引擎特定配置
   * 子类必须实现此方法
   */
  abstract adapt(config: UniversalChartConfig): any;

  /**
   * 将引擎特定配置转换回通用配置（可选）
   * 子类可以选择实现此方法
   */
  reverse?(config: any): UniversalChartConfig;

  /**
   * 合并配置对象
   * 深度合并两个配置对象
   */
  protected mergeConfig(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (this.isObject(source[key]) && this.isObject(target[key])) {
          result[key] = this.mergeConfig(target[key], source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  }

  /**
   * 检查是否为对象
   */
  protected isObject(value: any): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * 提取颜色配置
   */
  protected extractColors(config: UniversalChartConfig): string[] | undefined {
    return config.colors;
  }

  /**
   * 提取主题配置
   */
  protected extractTheme(config: UniversalChartConfig): string | object | undefined {
    if (typeof config.theme === 'string') {
      return config.theme;
    }
    return config.theme;
  }

  /**
   * 提取标题配置
   */
  protected extractTitle(config: UniversalChartConfig): any {
    if (!config.title) return undefined;

    if (typeof config.title === 'string') {
      return {
        text: config.title,
        left: 'center',
      };
    }

    return config.title;
  }

  /**
   * 提取图例配置
   */
  protected extractLegend(config: UniversalChartConfig): any {
    if (config.legend === false) {
      return { show: false };
    }

    if (config.legend === true) {
      return {
        show: true,
        orient: 'horizontal',
        position: 'bottom',
      };
    }

    return config.legend;
  }

  /**
   * 提取提示框配置
   */
  protected extractTooltip(config: UniversalChartConfig): any {
    if (config.tooltip === false) {
      return { show: false };
    }

    if (config.tooltip === true || config.tooltip === undefined) {
      return {
        show: true,
        trigger: 'axis',
      };
    }

    return config.tooltip;
  }

  /**
   * 提取网格配置
   */
  protected extractGrid(config: UniversalChartConfig): any {
    return config.grid || {
      left: '10%',
      right: '10%',
      top: '15%',
      bottom: '10%',
      containLabel: true,
    };
  }

  /**
   * 提取动画配置
   */
  protected extractAnimation(config: UniversalChartConfig): any {
    if (config.animation === false) {
      return false;
    }

    if (config.animation === true || config.animation === undefined) {
      return true;
    }

    return config.animation;
  }

  /**
   * 应用暗黑模式
   */
  protected applyDarkMode(option: any, darkMode: boolean): any {
    if (!darkMode) return option;

    // 基本暗黑主题配置
    const darkTheme = {
      backgroundColor: '#1a1a1a',
      textStyle: {
        color: '#e0e0e0',
      },
    };

    return this.mergeConfig(option, darkTheme);
  }

  /**
   * 应用字体大小
   */
  protected applyFontSize(option: any, fontSize?: number): any {
    if (!fontSize) return option;

    const fontConfig = {
      textStyle: {
        fontSize,
      },
      title: {
        textStyle: {
          fontSize: fontSize * 1.5,
        },
      },
      legend: {
        textStyle: {
          fontSize,
        },
      },
      tooltip: {
        textStyle: {
          fontSize,
        },
      },
    };

    return this.mergeConfig(option, fontConfig);
  }
}


