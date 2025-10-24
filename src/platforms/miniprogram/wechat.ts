/**
 * 微信小程序适配器
 * 
 * 使用 VChart 引擎为微信小程序提供图表支持
 */

import type { ChartConfig } from '../../types';
import { Chart } from '../../core/chart';
import { VChartEngine } from '../../engines/vchart/vchart-engine';
import { engineManager } from '../../engines/engine-manager';

/**
 * 微信小程序图表配置
 */
export interface WechatMiniProgramChartConfig extends ChartConfig {
  /** Canvas 对象 */
  canvas?: any;
  /** Canvas 上下文 */
  context?: any;
  /** 设备像素比 */
  pixelRatio?: number;
}

/**
 * 微信小程序图表适配器
 */
export class WechatMiniProgramAdapter {
  private static initialized = false;

  /**
   * 初始化微信小程序环境
   */
  static init(): void {
    if (this.initialized) return;

    // 注册 VChart 引擎（微信小程序必须使用 VChart）
    if (!engineManager.hasEngine('vchart')) {
      engineManager.register('vchart', new VChartEngine());
    }

    this.initialized = true;
  }

  /**
   * 创建微信小程序图表
   * 
   * @example
   * ```javascript
   * // 在小程序页面中
   * const query = wx.createSelectorQuery();
   * query.select('#chart')
   *   .fields({ node: true, size: true })
   *   .exec((res) => {
   *     const canvas = res[0].node;
   *     const ctx = canvas.getContext('2d');
   *     
   *     const chart = WechatMiniProgramAdapter.createChart({
   *       canvas,
   *       context: ctx,
   *       type: 'line',
   *       data: [1, 2, 3, 4, 5],
   *       pixelRatio: wx.getSystemInfoSync().pixelRatio,
   *     });
   *   });
   * ```
   */
  static createChart(config: WechatMiniProgramChartConfig): Chart {
    this.init();

    // 创建容器元素（虚拟DOM，小程序环境）
    const container = this.createVirtualContainer(config);

    // 强制使用 VChart 引擎
    const chartConfig: ChartConfig = {
      ...config,
      engine: 'vchart',
      platform: 'wechat-miniprogram',
      // VChart 小程序特定配置
      mode: 'miniprogram',
      canvas: config.canvas,
      context: config.context,
      pixelRatio: config.pixelRatio || 2,
    };

    return new Chart(container, chartConfig);
  }

  /**
   * 创建虚拟容器
   * 小程序环境中没有真实的 DOM，需要创建虚拟容器
   */
  private static createVirtualContainer(config: WechatMiniProgramChartConfig): any {
    return {
      // 模拟 DOM 节点
      nodeType: 1,
      nodeName: 'DIV',
      canvas: config.canvas,
      context: config.context,
      // 小程序环境标识
      __miniprogram__: true,
      __platform__: 'wechat',
    };
  }

  /**
   * 获取微信小程序系统信息
   */
  static getSystemInfo(): any {
    if (typeof wx !== 'undefined' && wx.getSystemInfoSync) {
      return wx.getSystemInfoSync();
    }
    return null;
  }
}

/**
 * 便捷函数：创建微信小程序图表
 */
export function createWechatChart(config: WechatMiniProgramChartConfig): Chart {
  return WechatMiniProgramAdapter.createChart(config);
}


