/**
 * 引擎工厂
 * 负责引擎的自动注册、创建和管理
 */

import { engineManager } from './engine-manager';
import { ChartFeature } from './base/engine-interface';
import type { ChartEngine, EngineInstance, UniversalChartConfig } from './base/engine-interface';
import type { EngineInitOptions } from './types';

/**
 * 引擎工厂类
 * 提供便捷的引擎创建和管理方法
 */
export class EngineFactory {
  private static instance: EngineFactory;
  private engineCache = new Map<string, ChartEngine>();
  
  private constructor() {
    // 自动注册内置引擎
    this.registerBuiltInEngines();
  }
  
  /**
   * 获取工厂实例（单例）
   */
  static getInstance(): EngineFactory {
    if (!EngineFactory.instance) {
      EngineFactory.instance = new EngineFactory();
    }
    return EngineFactory.instance;
  }
  
  /**
   * 注册内置引擎
   */
  private async registerBuiltInEngines(): Promise<void> {
    // 注册 ECharts 引擎
    try {
      const { EChartsEngine } = await import('./echarts');
      const echartsEngine = new EChartsEngine();
      engineManager.register('echarts', echartsEngine);
      this.engineCache.set('echarts', echartsEngine);
    } catch (error) {
      console.debug('ECharts engine not available');
    }
    
    // 注册 VChart 引擎
    try {
      const { VChartEngine } = await import('./vchart');
      const vchartEngine = new VChartEngine();
      engineManager.register('vchart', vchartEngine);
      this.engineCache.set('vchart', vchartEngine);
    } catch (error) {
      console.debug('VChart engine not available');
    }
    
    // 注册 Chart.js 引擎
    try {
      const { ChartJSEngine } = await import('./chartjs');
      const chartjsEngine = new ChartJSEngine();
      engineManager.register('chartjs', chartjsEngine);
      this.engineCache.set('chartjs', chartjsEngine);
    } catch (error) {
      console.debug('Chart.js engine not available');
    }
  }
  
  /**
   * 创建图表实例
   * @param container 容器元素
   * @param config 图表配置
   * @param options 初始化选项
   * @returns 引擎实例
   */
  async createChart(
    container: HTMLElement | string,
    config: UniversalChartConfig,
    options?: EngineInitOptions
  ): Promise<EngineInstance> {
    // 获取容器元素
    const element = typeof container === 'string'
      ? document.querySelector(container) as HTMLElement
      : container;
      
    if (!element) {
      throw new Error('Container element not found');
    }
    
    // 选择引擎
    const engine = this.selectEngine(config);
    
    // 初始化实例
    const instance = await engine.init(element, options);
    
    // 应用配置
    const adapter = engine.getAdapter();
    const engineConfig = await adapter.adapt(config);
    instance.setOption(engineConfig);
    
    return instance;
  }
  
  /**
   * 根据配置选择合适的引擎
   * @param config 图表配置
   * @returns 选中的引擎
   */
  private selectEngine(config: UniversalChartConfig): ChartEngine {
    // 1. 如果明确指定了引擎
    if (config.engine && config.engine !== 'auto') {
      const engine = engineManager.get(config.engine);
      if (!engine) {
        throw new Error(`Engine "${config.engine}" not found`);
      }
      return engine;
    }
    
    // 2. 根据图表类型自动选择
    const engineName = this.getRecommendedEngine(config.type);
    const engine = engineManager.get(engineName);
    
    if (!engine) {
      // 返回默认引擎
      return engineManager.select();
    }
    
    return engine;
  }
  
  /**
   * 根据图表类型推荐引擎
   * @param type 图表类型
   * @returns 推荐的引擎名称
   */
  private getRecommendedEngine(type: string): string {
    // 特定图表类型的推荐引擎
    const recommendations: Record<string, string> = {
      // 3D 图表推荐 VChart
      '3d-bar': 'vchart',
      '3d-scatter': 'vchart',
      '3d-pie': 'vchart',
      
      // 数据故事推荐 VChart
      'story': 'vchart',
      
      // 基础图表推荐 Chart.js（性能更好）
      'doughnut': 'chartjs',
      'polarArea': 'chartjs',
      
      // 复杂图表推荐 ECharts
      'sankey': 'echarts',
      'graph': 'echarts',
      'tree': 'echarts',
      'treemap': 'echarts',
      'sunburst': 'echarts',
      'heatmap': 'echarts',
      'parallel': 'echarts',
      'themeRiver': 'echarts',
      
      // 默认使用 ECharts
      'default': 'echarts',
    };
    
    return recommendations[type] || recommendations.default;
  }
  
  /**
   * 注册自定义引擎
   * @param name 引擎名称
   * @param engine 引擎实例
   */
  registerEngine(name: string, engine: ChartEngine): void {
    engineManager.register(name, engine);
    this.engineCache.set(name, engine);
  }
  
  /**
   * 获取所有可用引擎
   * @returns 引擎列表
   */
  getAvailableEngines(): string[] {
    return engineManager.getRegisteredEngines();
  }
  
  /**
   * 检查引擎是否支持特定特性
   * @param engineName 引擎名称
   * @param feature 特性
   * @returns 是否支持
   */
  checkFeatureSupport(engineName: string, feature: ChartFeature): boolean {
    const engine = engineManager.get(engineName);
    return engine ? engine.supports(feature) : false;
  }
  
  /**
   * 获取支持特定特性的所有引擎
   * @param feature 特性
   * @returns 支持该特性的引擎列表
   */
  getEnginesWithFeature(feature: ChartFeature): string[] {
    const engines: string[] = [];
    
    for (const name of this.getAvailableEngines()) {
      if (this.checkFeatureSupport(name, feature)) {
        engines.push(name);
      }
    }
    
    return engines;
  }
  
  /**
   * 比较引擎能力
   * @returns 引擎能力对比表
   */
  compareEngines(): Record<string, Record<string, any>> {
    const comparison: Record<string, Record<string, any>> = {};
    
    for (const name of this.getAvailableEngines()) {
      const engine = engineManager.get(name);
      if (engine) {
        comparison[name] = {
          version: engine.version,
          supportedChartTypes: engine.getSupportedChartTypes?.() || [],
          features: {
            miniProgram: engine.supports(ChartFeature.MINI_PROGRAM),
            webWorker: engine.supports(ChartFeature.WEB_WORKER),
            virtualRender: engine.supports(ChartFeature.VIRTUAL_RENDER),
            storyMode: engine.supports(ChartFeature.STORY_MODE),
            threeD: engine.supports(ChartFeature.THREE_D),
            canvas: engine.supports(ChartFeature.CANVAS_RENDERER),
            svg: engine.supports(ChartFeature.SVG_RENDERER),
            ssr: engine.supports(ChartFeature.SSR),
          },
          capabilities: engine.getCapabilities?.() || {},
        };
      }
    }
    
    return comparison;
  }
  
  /**
   * 清理所有引擎
   */
  dispose(): void {
    engineManager.clear();
    this.engineCache.clear();
  }
}

// 导出单例实例
export const engineFactory = EngineFactory.getInstance();