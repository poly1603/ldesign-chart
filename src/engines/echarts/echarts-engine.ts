/**
 * ECharts 引擎实现
 */

import * as echarts from 'echarts/core';
import { ChartFeature } from '../base/engine-interface';
import type {
  ChartEngine,
  EngineInstance,
  ConfigAdapter,
} from '../base/engine-interface';
import { EChartsConfigAdapter } from './echarts-adapter';
import { echartsLoader } from '../../loader/echarts-loader';

/**
 * ECharts 引擎实例包装器
 */
class EChartsInstanceWrapper implements EngineInstance {
  constructor(private instance: echarts.EChartsType) { }

  setOption(option: any, opts?: any): void {
    this.instance.setOption(option, opts);
  }

  getOption(): any {
    return this.instance.getOption();
  }

  resize(opts?: any): void {
    this.instance.resize(opts);
  }

  dispose(): void {
    this.instance.dispose();
  }

  getDataURL(opts?: any): string {
    return this.instance.getDataURL(opts);
  }

  on(event: string, handler: Function): void {
    this.instance.on(event, handler as any);
  }

  off(event: string, handler?: Function): void {
    this.instance.off(event, handler as any);
  }

  showLoading(opts?: any): void {
    this.instance.showLoading(opts);
  }

  hideLoading(): void {
    this.instance.hideLoading();
  }

  getNativeInstance(): any {
    return this.instance;
  }
}

/**
 * ECharts 引擎
 */
export class EChartsEngine implements ChartEngine {
  readonly name = 'echarts' as const;
  readonly version: string;
  private adapter: EChartsConfigAdapter;

  constructor() {
    // 获取 ECharts 版本
    this.version = echarts.version || '5.x';
    this.adapter = new EChartsConfigAdapter();
  }

  async init(container: HTMLElement, options?: any): Promise<EngineInstance> {
    // 确保核心模块已加载
    await echartsLoader.loadCore();

    // 加载渲染器（默认 canvas）
    const renderer = options?.renderer || 'canvas';
    await echartsLoader.loadRenderer(renderer);

    // 初始化实例
    const instance = echarts.init(container, options?.theme, {
      renderer,
      ...options,
    });

    return new EChartsInstanceWrapper(instance);
  }

  supports(feature: ChartFeature): boolean {
    switch (feature) {
      case ChartFeature.WEB_WORKER:
        return true;
      case ChartFeature.VIRTUAL_RENDER:
        return true;
      case ChartFeature.CANVAS_RENDERER:
        return true;
      case ChartFeature.SVG_RENDERER:
        return true;
      case ChartFeature.SSR:
        return true;
      case ChartFeature.MINI_PROGRAM:
        return false; // ECharts 对小程序支持有限
      case ChartFeature.STORY_MODE:
        return false;
      case ChartFeature.THREE_D:
        return false; // 基础 ECharts 不支持 3D
      default:
        return false;
    }
  }

  getAdapter(): ConfigAdapter {
    return this.adapter;
  }

  dispose(): void {
    // ECharts 的清理通常由实例自己处理
    // 这里可以清理全局资源
  }
}


