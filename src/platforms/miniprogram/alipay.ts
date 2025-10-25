/**
 * 支付宝小程序适配器
 * 
 * 使用 VChart 引擎为支付宝小程序提供图表支持
 */

import type { ChartConfig } from '../../types';
import { Chart } from '../../core/chart';
import { VChartEngine } from '../../engines/vchart/vchart-engine';
import { engineManager } from '../../engines/engine-manager';

/**
 * 支付宝小程序图表配置
 */
export interface AlipayMiniProgramChartConfig extends ChartConfig {
  /** Canvas 对象 */
  canvas?: any;
  /** Canvas 上下文 */
  context?: any;
  /** 设备像素比 */
  pixelRatio?: number;
}

/**
 * 支付宝小程序图表适配器
 */
export class AlipayMiniProgramAdapter {
  private static initialized = false;

  /**
   * 初始化支付宝小程序环境
   */
  static init(): void {
    if (this.initialized) return;

    // 注册 VChart 引擎
    if (!engineManager.hasEngine('vchart')) {
      engineManager.register('vchart', new VChartEngine());
    }

    this.initialized = true;
  }

  /**
   * 创建支付宝小程序图表
   * 
   * @example
   * ```javascript
   * // 在支付宝小程序页面中
   * const ctx = my.createCanvasContext('chart');
   * 
   * const chart = AlipayMiniProgramAdapter.createChart({
   *   context: ctx,
   *   type: 'bar',
   *   data: [100, 200, 150, 300],
   *   pixelRatio: my.getSystemInfoSync().pixelRatio,
   * });
   * ```
   */
  static createChart(config: AlipayMiniProgramChartConfig): Chart {
    this.init();

    const container = this.createVirtualContainer(config);

    const chartConfig: ChartConfig = {
      ...config,
      engine: 'vchart',
      platform: 'alipay-miniprogram',
      mode: 'miniprogram',
      canvas: config.canvas,
      context: config.context,
      pixelRatio: config.pixelRatio || 2,
    };

    return new Chart(container, chartConfig);
  }

  /**
   * 创建虚拟容器
   */
  private static createVirtualContainer(config: AlipayMiniProgramChartConfig): any {
    return {
      nodeType: 1,
      nodeName: 'DIV',
      canvas: config.canvas,
      context: config.context,
      __miniprogram__: true,
      __platform__: 'alipay',
    };
  }

  /**
   * 获取支付宝小程序系统信息
   */
  static getSystemInfo(): any {
    if (typeof my !== 'undefined' && (my as any).getSystemInfoSync) {
      return (my as any).getSystemInfoSync();
    }
    return null;
  }
}

/**
 * 便捷函数：创建支付宝小程序图表
 */
export function createAlipayChart(config: AlipayMiniProgramChartConfig): Chart {
  return AlipayMiniProgramAdapter.createChart(config);
}


