/**
 * 图表联动管理器
 * 支持多个图表之间的数据联动、事件同步、选择同步等
 */

import type { EChartsInstance } from '../types';

export interface SyncOptions {
  /** 联动组ID */
  group?: string;
  /** 需要同步的事件类型 */
  events?: string[];
  /** 需要同步的配置项 */
  syncProps?: ('dataZoom' | 'brush' | 'timeline' | 'legend')[];
  /** 是否启用双向同步 */
  bidirectional?: boolean;
}

export interface ChartSyncItem {
  id: string;
  chart: EChartsInstance;
  options: SyncOptions;
  listeners: Map<string, Function>;
}

/**
 * 图表联动管理器
 */
export class ChartSyncManager {
  private groups = new Map<string, Set<ChartSyncItem>>();
  private charts = new Map<string, ChartSyncItem>();
  private nextId = 1;

  /**
   * 注册图表到联动组
   */
  register(
    chart: EChartsInstance,
    options: SyncOptions = {}
  ): string {
    const id = `chart-sync-${this.nextId++}`;
    const group = options.group || 'default';
    const events = options.events || ['dataZoom', 'brush', 'legendselectchanged'];
    const syncProps = options.syncProps || ['dataZoom', 'brush', 'legend'];

    const item: ChartSyncItem = {
      id,
      chart,
      options: {
        ...options,
        group,
        events,
        syncProps,
        bidirectional: options.bidirectional !== false,
      },
      listeners: new Map(),
    };

    // 添加到组
    if (!this.groups.has(group)) {
      this.groups.set(group, new Set());
    }
    this.groups.get(group)!.add(item);

    // 添加到图表映射
    this.charts.set(id, item);

    // 绑定事件监听器
    this.bindListeners(item);

    return id;
  }

  /**
   * 取消注册图表
   */
  unregister(id: string): void {
    const item = this.charts.get(id);
    if (!item) return;

    // 移除事件监听器
    this.unbindListeners(item);

    // 从组中移除
    const group = this.groups.get(item.options.group!);
    if (group) {
      group.delete(item);
      if (group.size === 0) {
        this.groups.delete(item.options.group!);
      }
    }

    // 从图表映射中移除
    this.charts.delete(id);
  }

  /**
   * 绑定事件监听器
   */
  private bindListeners(item: ChartSyncItem): void {
    const { chart, options } = item;
    const events = options.events || [];

    for (const event of events) {
      const listener = (params: any) => {
        this.handleEvent(item, event, params);
      };

      chart.on(event, listener);
      item.listeners.set(event, listener);
    }
  }

  /**
   * 解绑事件监听器
   */
  private unbindListeners(item: ChartSyncItem): void {
    const { chart, listeners } = item;

    for (const [event, listener] of listeners.entries()) {
      chart.off(event, listener as any);
    }

    listeners.clear();
  }

  /**
   * 处理事件
   */
  private handleEvent(source: ChartSyncItem, eventType: string, params: any): void {
    const group = this.groups.get(source.options.group!);
    if (!group) return;

    // 同步到同组的其他图表
    for (const target of group) {
      if (target.id === source.id) continue;
      if (!source.options.bidirectional && target.options.bidirectional === false) continue;

      this.syncEvent(eventType, params, target);
    }
  }

  /**
   * 同步事件到目标图表
   */
  private syncEvent(eventType: string, params: any, target: ChartSyncItem): void {
    const { chart, options } = target;
    const syncProps = options.syncProps || [];

    try {
      switch (eventType) {
        case 'dataZoom':
          if (syncProps.includes('dataZoom')) {
            this.syncDataZoom(params, chart);
          }
          break;

        case 'brush':
          if (syncProps.includes('brush')) {
            this.syncBrush(params, chart);
          }
          break;

        case 'legendselectchanged':
          if (syncProps.includes('legend')) {
            this.syncLegend(params, chart);
          }
          break;

        case 'timelinechanged':
          if (syncProps.includes('timeline')) {
            this.syncTimeline(params, chart);
          }
          break;

        default:
          // 其他事件暂不处理
          break;
      }
    } catch (error) {
      console.error(`Failed to sync ${eventType}:`, error);
    }
  }

  /**
   * 同步 DataZoom
   */
  private syncDataZoom(params: any, chart: EChartsInstance): void {
    const option: any = {
      dataZoom: [],
    };

    if (params.batch) {
      // 批量 dataZoom
      option.dataZoom = params.batch.map((item: any) => ({
        dataZoomIndex: item.dataZoomIndex,
        start: item.start,
        end: item.end,
        startValue: item.startValue,
        endValue: item.endValue,
      }));
    } else {
      // 单个 dataZoom
      option.dataZoom = [{
        dataZoomIndex: params.dataZoomIndex,
        start: params.start,
        end: params.end,
        startValue: params.startValue,
        endValue: params.endValue,
      }];
    }

    chart.setOption(option, {
      notMerge: false,
      lazyUpdate: true,
    });
  }

  /**
   * 同步 Brush
   */
  private syncBrush(params: any, chart: EChartsInstance): void {
    const option: any = {
      brush: {
        areas: params.areas,
      },
    };

    chart.setOption(option, {
      notMerge: false,
      lazyUpdate: true,
    });
  }

  /**
   * 同步图例选择
   */
  private syncLegend(params: any, chart: EChartsInstance): void {
    // 直接调用 ECharts API
    chart.dispatchAction({
      type: 'legendToggleSelect',
      name: params.name,
    });
  }

  /**
   * 同步时间轴
   */
  private syncTimeline(params: any, chart: EChartsInstance): void {
    chart.dispatchAction({
      type: 'timelineChange',
      currentIndex: params.currentIndex,
    });
  }

  /**
   * 获取组内所有图表
   */
  getGroupCharts(group: string): EChartsInstance[] {
    const groupSet = this.groups.get(group);
    if (!groupSet) return [];

    return Array.from(groupSet).map(item => item.chart);
  }

  /**
   * 同步特定配置到组内所有图表
   */
  syncConfig(group: string, config: any): void {
    const charts = this.getGroupCharts(group);

    for (const chart of charts) {
      chart.setOption(config, {
        notMerge: false,
        lazyUpdate: true,
      });
    }
  }

  /**
   * 创建联动组（便捷方法）
   */
  createGroup(
    charts: EChartsInstance[],
    options: Omit<SyncOptions, 'group'> = {}
  ): string {
    const group = `group-${Date.now()}`;

    for (const chart of charts) {
      this.register(chart, { ...options, group });
    }

    return group;
  }

  /**
   * 销毁联动组
   */
  destroyGroup(group: string): void {
    const groupSet = this.groups.get(group);
    if (!groupSet) return;

    for (const item of groupSet) {
      this.unregister(item.id);
    }
  }

  /**
   * 获取所有组
   */
  getGroups(): string[] {
    return Array.from(this.groups.keys());
  }

  /**
   * 获取图表信息
   */
  getChartInfo(id: string): ChartSyncItem | undefined {
    return this.charts.get(id);
  }

  /**
   * 清空所有联动
   */
  clear(): void {
    for (const item of this.charts.values()) {
      this.unbindListeners(item);
    }

    this.charts.clear();
    this.groups.clear();
  }
}

// 全局单例
export const chartSyncManager = new ChartSyncManager();

/**
 * 便捷函数：连接两个图表
 */
export function connectCharts(
  chart1: EChartsInstance,
  chart2: EChartsInstance,
  options: Omit<SyncOptions, 'group'> = {}
): () => void {
  const group = chartSyncManager.createGroup([chart1, chart2], options);

  // 返回断开连接函数
  return () => {
    chartSyncManager.destroyGroup(group);
  };
}

/**
 * 便捷函数：连接多个图表
 */
export function connectMultipleCharts(
  charts: EChartsInstance[],
  options: Omit<SyncOptions, 'group'> = {}
): () => void {
  const group = chartSyncManager.createGroup(charts, options);

  return () => {
    chartSyncManager.destroyGroup(group);
  };
}

