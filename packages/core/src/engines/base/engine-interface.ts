/**
 * 图表引擎抽象接口
 * 定义了所有图表引擎必须实现的标准接口
 */

/**
 * 图表引擎特性枚举
 * 用于检测引擎支持的功能
 */
export enum ChartFeature {
  /** 小程序支持（微信、支付宝等） */
  MINI_PROGRAM = 'miniProgram',
  /** Web Worker 支持 */
  WEB_WORKER = 'webWorker',
  /** 虚拟渲染支持（大数据） */
  VIRTUAL_RENDER = 'virtualRender',
  /** 数据故事模式 */
  STORY_MODE = 'storyMode',
  /** 3D 图表 */
  THREE_D = '3d',
  /** Canvas 渲染器 */
  CANVAS_RENDERER = 'canvas',
  /** SVG 渲染器 */
  SVG_RENDERER = 'svg',
  /** 服务端渲染 */
  SSR = 'ssr',
}

/**
 * 引擎实例接口
 * 所有图表引擎实例必须实现这些方法
 */
export interface EngineInstance {
  /** 设置图表配置 */
  setOption(option: any, opts?: any): void;
  /** 获取当前配置 */
  getOption(): any;
  /** 调整图表大小 */
  resize(opts?: any): void;
  /** 销毁实例 */
  dispose(): void;
  /** 获取 DataURL */
  getDataURL(opts?: any): string;
  /** 监听事件 */
  on(event: string, handler: Function): void;
  /** 取消监听 */
  off(event: string, handler?: Function): void;
  /** 显示加载动画 */
  showLoading?(opts?: any): void;
  /** 隐藏加载动画 */
  hideLoading?(): void;
  /** 获取原始引擎实例（用于高级用法） */
  getNativeInstance(): any;
}

/**
 * 图表引擎接口
 * 定义了引擎的元信息和工厂方法
 */
export interface ChartEngine {
  /** 引擎名称 */
  readonly name: 'echarts' | 'vchart' | 'chartjs' | 'g2' | 'd3';
  /** 引擎版本 */
  readonly version: string;

  /**
   * 初始化图表实例
   * @param container DOM 容器
   * @param options 初始化选项
   * @returns 引擎实例
   */
  init(container: HTMLElement, options?: any): Promise<EngineInstance>;

  /**
   * 检测引擎是否支持某个特性
   * @param feature 特性标识
   * @returns 是否支持
   */
  supports(feature: ChartFeature): boolean;

  /**
   * 获取配置适配器
   * @returns 配置适配器实例
   */
  getAdapter(): ConfigAdapter;

  /**
   * 销毁引擎（清理全局资源）
   */
  dispose(): void;
  
  /**
   * 获取支持的图表类型
   */
  getSupportedChartTypes?(): string[];
  
  /**
   * 获取引擎能力
   */
  getCapabilities?(): Record<string, any>;
}

/**
 * 配置适配器接口
 * 用于在通用配置和引擎特定配置之间转换
 */
export interface ConfigAdapter {
  /**
   * 将通用配置转换为引擎特定配置
   * @param config 通用配置
   * @returns 引擎特定配置
   */
  adapt(config: UniversalChartConfig): any;

  /**
   * 将引擎特定配置转换回通用配置（可选）
   * @param config 引擎特定配置
   * @returns 通用配置
   */
  reverse?(config: any): UniversalChartConfig;
}

/**
 * 通用图表配置
 * 引擎无关的标准化配置格式
 */
export interface UniversalChartConfig {
  /** 图表类型 */
  type: string;
  /** 图表数据 */
  data: any;
  /** 标题 */
  title?: string | any;
  /** 图例配置 */
  legend?: boolean | any;
  /** 提示框配置 */
  tooltip?: boolean | any;
  /** 网格配置 */
  grid?: any;
  /** 坐标轴配置 */
  axes?: any;
  /** 颜色配置 */
  colors?: string[];
  /** 主题 */
  theme?: string | any;
  /** 是否暗黑模式 */
  darkMode?: boolean;
  /** 字体大小 */
  fontSize?: number;
  /** 动画配置 */
  animation?: boolean | any;
  /** 响应式配置 */
  responsive?: boolean | any;
  /** 性能优化选项 */
  performance?: any;
  /** 引擎选择 */
  engine?: 'echarts' | 'vchart' | 'chartjs' | 'g2' | 'd3' | 'auto';
  /** 平台标识 */
  platform?: string;
  /** 渲染模式 */
  mode?: string;
}

/** 引擎专用图表类型（扩展） */
export type EngineChartType =
  | '3d-bar'
  | '3d-scatter'
  | '3d-pie'
  | 'sunburst'
  | 'treemap'
  | 'sankey'
  | 'liquid'
  | 'wordcloud';

/** 扩展的图表类型（包含通用类型和引擎专用类型） */
export type ExtendedChartType = string | EngineChartType;

