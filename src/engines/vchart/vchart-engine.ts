/**
 * VChart 引擎实现
 * 
 * VChart 是字节跳动开源的可视化图表库
 * 官网: https://www.visactor.io/vchart
 */

import { ChartFeature } from '../base/engine-interface';
import type {
  ChartEngine,
  EngineInstance,
  ConfigAdapter,
} from '../base/engine-interface';
import { VChartConfigAdapter } from './vchart-adapter';

/**
 * VChart 引擎实例包装器
 */
class VChartInstanceWrapper implements EngineInstance {
  constructor(private instance: any) { }

  setOption(option: any, opts?: any): void {
    // VChart 使用 updateSpec 方法更新配置
    this.instance.updateSpec(option);
  }

  getOption(): any {
    // VChart 使用 getSpec 获取配置
    return this.instance.getSpec();
  }

  resize(opts?: any): void {
    this.instance.resize(opts?.width, opts?.height);
  }

  dispose(): void {
    this.instance.release();
  }

  getDataURL(opts?: any): string {
    // VChart 导出图片
    const type = opts?.type || 'png';
    return this.instance.getImageBuffer() || '';
  }

  on(event: string, handler: Function): void {
    this.instance.on(event, handler);
  }

  off(event: string, handler?: Function): void {
    this.instance.off(event, handler);
  }

  showLoading(opts?: any): void {
    // VChart 的加载动画实现
    // 需要根据实际 API 调整
  }

  hideLoading(): void {
    // VChart 的加载动画实现
    // 需要根据实际 API 调整
  }

  getNativeInstance(): any {
    return this.instance;
  }
}

/**
 * VChart 引擎
 */
export class VChartEngine implements ChartEngine {
  readonly name = 'vchart' as const;
  readonly version: string;
  private adapter: VChartConfigAdapter;
  private VChart: any; // VChart 构造函数

  constructor() {
    this.version = '1.x'; // 将在加载后更新
    this.adapter = new VChartConfigAdapter();
  }

  async init(container: HTMLElement, options?: any): Promise<EngineInstance> {
    // 动态加载 VChart（避免强依赖）
    if (!this.VChart) {
      try {
        const vchart = await import('@visactor/vchart');
        this.VChart = vchart.VChart || vchart.default?.VChart;
        this.version = vchart.version || '1.x';
      } catch (error) {
        throw new Error(
          'VChart is not installed. Please run: npm install @visactor/vchart'
        );
      }
    }

    // 创建 VChart 实例
    const instance = new this.VChart(
      {
        // 初始空配置
        ...options?.spec,
      },
      {
        dom: container,
        mode: options?.mode || 'desktop-browser',
        ...options,
      }
    );

    // 渲染图表
    await instance.renderAsync();

    return new VChartInstanceWrapper(instance);
  }

  supports(feature: ChartFeature): boolean {
    switch (feature) {
      case ChartFeature.MINI_PROGRAM:
        return true; // VChart 支持小程序
      case ChartFeature.STORY_MODE:
        return true; // VChart 有数据故事功能
      case ChartFeature.THREE_D:
        return true; // VChart 支持 3D 图表
      case ChartFeature.CANVAS_RENDERER:
        return true;
      case ChartFeature.SVG_RENDERER:
        return false; // VChart 主要使用 Canvas
      case ChartFeature.SSR:
        return true; // VChart 支持服务端渲染
      case ChartFeature.WEB_WORKER:
        return false; // 需要验证
      case ChartFeature.VIRTUAL_RENDER:
        return false; // 需要验证
      default:
        return false;
    }
  }

  getAdapter(): ConfigAdapter {
    return this.adapter;
  }

  dispose(): void {
    // VChart 的全局清理
    // 通常不需要特殊处理
  }
}


