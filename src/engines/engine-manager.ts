/**
 * 引擎管理器
 * 负责引擎的注册、选择和管理
 */

import type { ChartEngine, ChartFeature } from './base/engine-interface';

/**
 * 引擎选择策略
 */
export interface EngineSelectionStrategy {
  /**
   * 选择引擎
   * @param engines 可用引擎列表
   * @param feature 需要的特性
   * @returns 选中的引擎，如果没有合适的返回 undefined
   */
  select(engines: Map<string, ChartEngine>, feature?: ChartFeature): ChartEngine | undefined;
}

/**
 * 默认引擎选择策略
 * 按优先级选择：特性匹配 > 默认引擎 > 第一个可用引擎
 */
export class DefaultSelectionStrategy implements EngineSelectionStrategy {
  constructor(private defaultEngine: string = 'echarts') { }

  select(engines: Map<string, ChartEngine>, feature?: ChartFeature): ChartEngine | undefined {
    // 1. 如果指定了特性，找到第一个支持该特性的引擎
    if (feature) {
      for (const [_, engine] of engines) {
        if (engine.supports(feature)) {
          return engine;
        }
      }
    }

    // 2. 返回默认引擎
    const defaultEng = engines.get(this.defaultEngine);
    if (defaultEng) {
      return defaultEng;
    }

    // 3. 返回第一个可用引擎
    for (const [_, engine] of engines) {
      return engine;
    }

    return undefined;
  }
}

/**
 * 引擎管理器类
 * 单例模式管理所有图表引擎
 */
export class EngineManager {
  private engines = new Map<string, ChartEngine>();
  private selectionStrategy: EngineSelectionStrategy;
  private defaultEngine: string = 'echarts';

  constructor(strategy?: EngineSelectionStrategy) {
    this.selectionStrategy = strategy || new DefaultSelectionStrategy(this.defaultEngine);
  }

  /**
   * 注册引擎
   * @param name 引擎名称
   * @param engine 引擎实例
   */
  register(name: string, engine: ChartEngine): void {
    if (this.engines.has(name)) {
      console.warn(`Engine "${name}" is already registered. Overwriting...`);
    }
    this.engines.set(name, engine);
  }

  /**
   * 注销引擎
   * @param name 引擎名称
   */
  unregister(name: string): boolean {
    const engine = this.engines.get(name);
    if (engine) {
      engine.dispose();
      return this.engines.delete(name);
    }
    return false;
  }

  /**
   * 获取指定引擎
   * @param name 引擎名称
   * @returns 引擎实例，如果不存在返回 undefined
   */
  get(name: string): ChartEngine | undefined {
    return this.engines.get(name);
  }

  /**
   * 选择引擎
   * @param name 引擎名称（可选）
   * @param feature 需要的特性（可选）
   * @returns 选中的引擎
   * @throws 如果没有可用引擎则抛出错误
   */
  select(name?: string, feature?: ChartFeature): ChartEngine {
    // 1. 如果指定了引擎名称，直接返回
    if (name) {
      const engine = this.engines.get(name);
      if (!engine) {
        throw new Error(`Engine "${name}" not found. Available engines: ${Array.from(this.engines.keys()).join(', ')}`);
      }
      return engine;
    }

    // 2. 使用选择策略
    const selected = this.selectionStrategy.select(this.engines, feature);
    if (!selected) {
      throw new Error('No chart engine available. Please register at least one engine.');
    }

    return selected;
  }

  /**
   * 设置默认引擎
   * @param name 引擎名称
   */
  setDefaultEngine(name: string): void {
    if (!this.engines.has(name)) {
      throw new Error(`Cannot set default engine to "${name}": engine not registered`);
    }
    this.defaultEngine = name;
    this.selectionStrategy = new DefaultSelectionStrategy(name);
  }

  /**
   * 获取默认引擎
   * @returns 默认引擎名称
   */
  getDefaultEngine(): string {
    return this.defaultEngine;
  }

  /**
   * 设置选择策略
   * @param strategy 选择策略实例
   */
  setSelectionStrategy(strategy: EngineSelectionStrategy): void {
    this.selectionStrategy = strategy;
  }

  /**
   * 获取所有已注册的引擎
   * @returns 引擎名称列表
   */
  getRegisteredEngines(): string[] {
    return Array.from(this.engines.keys());
  }

  /**
   * 检查引擎是否已注册
   * @param name 引擎名称
   * @returns 是否已注册
   */
  hasEngine(name: string): boolean {
    return this.engines.has(name);
  }

  /**
   * 清空所有引擎
   */
  clear(): void {
    for (const [_, engine] of this.engines) {
      engine.dispose();
    }
    this.engines.clear();
  }

  /**
   * 获取引擎统计信息
   */
  getStats(): {
    total: number;
    engines: Array<{
      name: string;
      version: string;
      features: ChartFeature[];
    }>;
  } {
    const engineStats = Array.from(this.engines.entries()).map(([name, engine]) => {
      // 获取引擎支持的所有特性
      const features: ChartFeature[] = [];
      for (const feature of Object.values(ChartFeature)) {
        if (engine.supports(feature)) {
          features.push(feature);
        }
      }

      return {
        name,
        version: engine.version,
        features,
      };
    });

    return {
      total: this.engines.size,
      engines: engineStats,
    };
  }
}

/**
 * 全局引擎管理器实例
 */
export const engineManager = new EngineManager();


