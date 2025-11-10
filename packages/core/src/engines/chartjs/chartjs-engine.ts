/**
 * Chart.js 引擎实现
 * 
 * Chart.js 是一个简单灵活的 JavaScript 图表库
 * 官网: https://www.chartjs.org/
 */

import { ChartFeature } from '../base/engine-interface';
import type {
  ChartEngine,
  EngineInstance,
  ConfigAdapter,
} from '../base/engine-interface';
import type { EngineInitOptions, EngineUpdateOptions, EngineExportOptions } from '../types';
import { ChartJSConfigAdapter } from './chartjs-adapter';

/**
 * Chart.js 实例包装器
 */
class ChartJSInstanceWrapper implements EngineInstance {
  private chart: any; // Chart.js instance

  constructor(chart: any) {
    this.chart = chart;
  }

  setOption(option: any, opts?: EngineUpdateOptions): void {
    // Chart.js 更新配置
    if (opts?.notMerge) {
      // 完全替换配置
      this.chart.config.options = option.options;
      this.chart.config.data = option.data;
    } else {
      // 合并配置
      Object.assign(this.chart.config.options, option.options || {});
      Object.assign(this.chart.config.data, option.data || {});
    }
    
    // 更新图表
    this.chart.update(opts?.lazyUpdate ? 'none' : undefined);
  }

  getOption(): any {
    return {
      type: this.chart.config.type,
      data: this.chart.config.data,
      options: this.chart.config.options,
    };
  }

  resize(opts?: any): void {
    this.chart.resize(opts?.width, opts?.height);
  }

  dispose(): void {
    this.chart.destroy();
  }

  getDataURL(opts?: EngineExportOptions): string {
    return this.chart.toBase64Image(opts?.type, opts?.quality);
  }

  on(event: string, handler: Function): void {
    // Chart.js 事件处理
    const eventMap: Record<string, string> = {
      'click': 'click',
      'hover': 'hover',
      'mousemove': 'mousemove',
      'mouseout': 'mouseout',
      'resize': 'resize',
    };

    const chartJsEvent = eventMap[event] || event;
    
    // Chart.js 使用 options.onClick, options.onHover 等
    if (chartJsEvent === 'click') {
      this.chart.options.onClick = handler;
    } else if (chartJsEvent === 'hover') {
      this.chart.options.onHover = handler;
    }
  }

  off(event: string, handler?: Function): void {
    // 移除事件处理器
    const eventMap: Record<string, string> = {
      'click': 'onClick',
      'hover': 'onHover',
    };

    const optionKey = eventMap[event];
    if (optionKey && this.chart.options[optionKey] === handler) {
      this.chart.options[optionKey] = null;
    }
  }

  showLoading(opts?: any): void {
    // Chart.js 没有内置的加载动画
    // 可以通过自定义插件实现
    console.warn('Chart.js does not have built-in loading animation');
  }

  hideLoading(): void {
    // Chart.js 没有内置的加载动画
  }

  getNativeInstance(): any {
    return this.chart;
  }

  /**
   * Chart.js 特有方法
   */
  
  /**
   * 获取数据集元数据
   */
  getDatasetMeta(datasetIndex: number): any {
    return this.chart.getDatasetMeta(datasetIndex);
  }

  /**
   * 获取元素位置
   */
  getElementsAtEventForMode(event: Event, mode: string): any[] {
    return this.chart.getElementsAtEventForMode(event, mode, {}, false);
  }

  /**
   * 重置图表
   */
  reset(): void {
    this.chart.reset();
  }

  /**
   * 停止动画
   */
  stop(): void {
    this.chart.stop();
  }
}

/**
 * Chart.js 引擎
 */
export class ChartJSEngine implements ChartEngine {
  readonly name = 'chartjs' as const;
  readonly version: string;
  private adapter: ChartJSConfigAdapter;
  private ChartJS: any; // Chart.js 构造函数

  constructor() {
    this.version = '4.x'; // 将在加载后更新
    this.adapter = new ChartJSConfigAdapter();
  }

  async init(container: HTMLElement, options?: EngineInitOptions): Promise<EngineInstance> {
    // 动态加载 Chart.js
    if (!this.ChartJS) {
      try {
        const chartjs = await import('chart.js/auto');
        this.ChartJS = chartjs.Chart || chartjs.default;
        // 获取版本
        if (this.ChartJS.version) {
          this.version = this.ChartJS.version;
        }
      } catch (error) {
        throw new Error(
          'Chart.js is not installed. Please run: npm install chart.js'
        );
      }
    }

    // 获取或创建 canvas 元素
    let canvas = container.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      container.appendChild(canvas);
    }

    // 设置容器尺寸
    if (options?.width) {
      canvas.style.width = `${options.width}px`;
    }
    if (options?.height) {
      canvas.style.height = `${options.height}px`;
    }

    // 创建 Chart.js 实例
    const chart = new this.ChartJS(canvas, {
      type: 'line', // 默认类型，将被覆盖
      data: { labels: [], datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ...options,
      },
    });

    return new ChartJSInstanceWrapper(chart);
  }

  supports(feature: ChartFeature): boolean {
    switch (feature) {
      case ChartFeature.CANVAS_RENDERER:
        return true;
      case ChartFeature.SVG_RENDERER:
        return false; // Chart.js 主要使用 Canvas
      case ChartFeature.WEB_WORKER:
        return false; // Chart.js 不直接支持 Web Worker
      case ChartFeature.VIRTUAL_RENDER:
        return false;
      case ChartFeature.SSR:
        return false; // 客户端渲染
      case ChartFeature.MINI_PROGRAM:
        return false; // 需要特殊适配
      case ChartFeature.STORY_MODE:
        return false;
      case ChartFeature.THREE_D:
        return false; // Chart.js 不支持 3D
      default:
        return false;
    }
  }

  getAdapter(): ConfigAdapter {
    return this.adapter;
  }

  dispose(): void {
    // Chart.js 的全局清理（如果需要）
    // 通常不需要特殊处理
  }

  /**
   * 获取支持的图表类型
   */
  getSupportedChartTypes(): string[] {
    return [
      'line',
      'bar',
      'radar',
      'doughnut',
      'pie',
      'polarArea',
      'bubble',
      'scatter',
    ];
  }

  /**
   * 注册自定义插件
   */
  registerPlugin(plugin: any): void {
    if (this.ChartJS) {
      this.ChartJS.register(plugin);
    }
  }

  /**
   * 注销插件
   */
  unregisterPlugin(plugin: any): void {
    if (this.ChartJS) {
      this.ChartJS.unregister(plugin);
    }
  }
}