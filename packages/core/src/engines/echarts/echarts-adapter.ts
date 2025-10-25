/**
 * ECharts 配置适配器
 * 将通用配置转换为 ECharts 特定配置
 */

import { BaseConfigAdapter } from '../base/config-adapter';
import type { UniversalChartConfig } from '../base/engine-interface';
import { DataParser } from '../../utils/data-parser';
import { chartLoader } from '../../loader/chart-loader';

/**
 * ECharts 配置适配器
 */
export class EChartsConfigAdapter extends BaseConfigAdapter {
  private parser = new DataParser();

  /**
   * 将通用配置转换为 ECharts 配置
   */
  async adapt(config: UniversalChartConfig): Promise<any> {
    // 1. 解析数据
    const parsedData = this.parser.parse(config.data);

    // 2. 加载对应的图表类型生成器
    const generator = await chartLoader.loadGenerator(config.type as any);

    // 3. 生成基础配置
    const baseOption = generator.generate(parsedData, config);

    // 4. 应用通用配置
    let option = this.applyCommonConfig(baseOption, config, parsedData);

    // 5. 应用主题
    if (config.theme) {
      option = this.applyTheme(option, config);
    }

    // 6. 应用暗黑模式
    if (config.darkMode) {
      option = this.applyDarkMode(option, config.darkMode);
    }

    // 7. 应用字体大小
    if (config.fontSize) {
      option = this.applyFontSize(option, config.fontSize);
    }

    return option;
  }

  /**
   * 应用通用配置
   */
  private applyCommonConfig(
    option: any,
    config: UniversalChartConfig,
    parsedData: any
  ): any {
    const result = { ...option };

    // 标题
    const title = this.extractTitle(config);
    if (title) {
      result.title = title;
    }

    // 图例
    if (config.legend !== undefined && parsedData.seriesNames?.length > 1) {
      result.legend = this.extractLegend(config);
    }

    // 提示框
    const tooltip = this.extractTooltip(config);
    if (tooltip) {
      result.tooltip = tooltip;
    }

    // 网格
    if (config.grid) {
      result.grid = config.grid;
    }

    // 颜色
    if (config.colors) {
      result.color = config.colors;
    }

    // 动画
    const animation = this.extractAnimation(config);
    if (animation !== undefined) {
      if (typeof animation === 'boolean') {
        result.animation = animation;
      } else {
        Object.assign(result, animation);
      }
    }

    return result;
  }

  /**
   * 应用主题
   */
  private applyTheme(option: any, config: UniversalChartConfig): any {
    const theme = this.extractTheme(config);

    // 如果是对象主题，直接合并
    if (typeof theme === 'object') {
      return this.mergeConfig(option, theme);
    }

    // 如果是字符串主题名，应该在初始化时处理
    // 这里不做处理
    return option;
  }
}


