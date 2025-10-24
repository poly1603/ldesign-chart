/**
 * 引擎管理器测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EngineManager } from '../engines/engine-manager';
import type { ChartEngine, EngineInstance } from '../engines/base/engine-interface';
import { ChartFeature } from '../engines/base/engine-interface';

// Mock 引擎实现
class MockEngine implements ChartEngine {
  constructor(
    public readonly name: 'echarts' | 'vchart',
    public readonly version: string = '1.0.0',
    private features: ChartFeature[] = []
  ) { }

  async init(container: HTMLElement): Promise<EngineInstance> {
    return {
      setOption: () => { },
      getOption: () => ({}),
      resize: () => { },
      dispose: () => { },
      getDataURL: () => '',
      on: () => { },
      off: () => { },
      getNativeInstance: () => ({}),
    };
  }

  supports(feature: ChartFeature): boolean {
    return this.features.includes(feature);
  }

  getAdapter(): any {
    return {
      adapt: (config: any) => config,
    };
  }

  dispose(): void { }
}

describe('EngineManager', () => {
  let manager: EngineManager;

  beforeEach(() => {
    manager = new EngineManager();
  });

  it('should register an engine', () => {
    const engine = new MockEngine('echarts');
    manager.register('echarts', engine);

    expect(manager.hasEngine('echarts')).toBe(true);
    expect(manager.get('echarts')).toBe(engine);
  });

  it('should return registered engines list', () => {
    manager.register('echarts', new MockEngine('echarts'));
    manager.register('vchart', new MockEngine('vchart'));

    const engines = manager.getRegisteredEngines();
    expect(engines).toContain('echarts');
    expect(engines).toContain('vchart');
    expect(engines.length).toBe(2);
  });

  it('should select engine by name', () => {
    const echartsEngine = new MockEngine('echarts');
    const vchartEngine = new MockEngine('vchart');

    manager.register('echarts', echartsEngine);
    manager.register('vchart', vchartEngine);

    expect(manager.select('echarts')).toBe(echartsEngine);
    expect(manager.select('vchart')).toBe(vchartEngine);
  });

  it('should select engine by feature', () => {
    const echartsEngine = new MockEngine('echarts', '5.0', [
      ChartFeature.WEB_WORKER,
      ChartFeature.VIRTUAL_RENDER,
    ]);

    const vchartEngine = new MockEngine('vchart', '1.0', [
      ChartFeature.MINI_PROGRAM,
      ChartFeature.THREE_D,
    ]);

    manager.register('echarts', echartsEngine);
    manager.register('vchart', vchartEngine);

    // 选择支持小程序的引擎
    const selected = manager.select(undefined, ChartFeature.MINI_PROGRAM);
    expect(selected).toBe(vchartEngine);
  });

  it('should throw error when selecting non-existent engine', () => {
    expect(() => {
      manager.select('nonexistent');
    }).toThrow('Engine "nonexistent" not found');
  });

  it('should set and get default engine', () => {
    manager.register('echarts', new MockEngine('echarts'));
    manager.register('vchart', new MockEngine('vchart'));

    expect(manager.getDefaultEngine()).toBe('echarts');

    manager.setDefaultEngine('vchart');
    expect(manager.getDefaultEngine()).toBe('vchart');
  });

  it('should unregister engine', () => {
    const engine = new MockEngine('echarts');
    manager.register('echarts', engine);

    expect(manager.hasEngine('echarts')).toBe(true);

    const result = manager.unregister('echarts');
    expect(result).toBe(true);
    expect(manager.hasEngine('echarts')).toBe(false);
  });

  it('should get stats', () => {
    manager.register('echarts', new MockEngine('echarts', '5.4.3', [
      ChartFeature.WEB_WORKER,
    ]));

    manager.register('vchart', new MockEngine('vchart', '1.2.0', [
      ChartFeature.MINI_PROGRAM,
      ChartFeature.THREE_D,
    ]));

    const stats = manager.getStats();

    expect(stats.total).toBe(2);
    expect(stats.engines.length).toBe(2);
    expect(stats.engines[0].name).toBe('echarts');
    expect(stats.engines[0].features).toContain(ChartFeature.WEB_WORKER);
    expect(stats.engines[1].features).toContain(ChartFeature.MINI_PROGRAM);
  });

  it('should clear all engines', () => {
    manager.register('echarts', new MockEngine('echarts'));
    manager.register('vchart', new MockEngine('vchart'));

    expect(manager.getRegisteredEngines().length).toBe(2);

    manager.clear();

    expect(manager.getRegisteredEngines().length).toBe(0);
  });
});


