/**
 * 图表引擎相关的类型定义
 */

import type { ChartConfig, ChartData, ThemeConfig } from '../types';

/**
 * 引擎初始化选项
 */
export interface EngineInitOptions {
  /** 渲染器类型 */
  renderer?: 'canvas' | 'svg' | 'webgl';
  /** 主题配置 */
  theme?: string | ThemeConfig;
  /** 设备像素比 */
  devicePixelRatio?: number;
  /** 是否使用脏矩形渲染 */
  useDirtyRect?: boolean;
  /** 是否开启无障碍辅助 */
  aria?: boolean;
  /** 语言设置 */
  locale?: string;
  /** 容器宽度 */
  width?: number;
  /** 容器高度 */
  height?: number;
  /** 自定义选项 */
  [key: string]: unknown;
}

/**
 * 引擎更新选项
 */
export interface EngineUpdateOptions {
  /** 是否不合并配置 */
  notMerge?: boolean;
  /** 是否懒更新 */
  lazyUpdate?: boolean;
  /** 是否静默更新（不触发事件） */
  silent?: boolean;
  /** 过渡动画配置 */
  transition?: {
    duration?: number;
    easing?: string;
  };
}

/**
 * 引擎导出选项
 */
export interface EngineExportOptions {
  /** 导出类型 */
  type?: 'png' | 'jpeg' | 'svg' | 'pdf';
  /** 图片质量 (0-1) */
  quality?: number;
  /** 背景色 */
  backgroundColor?: string;
  /** 像素比 */
  pixelRatio?: number;
  /** 排除的组件 */
  excludeComponents?: string[];
}

/**
 * 引擎事件类型
 */
export interface EngineEventParams {
  /** 事件类型 */
  type: string;
  /** 事件目标 */
  target?: any;
  /** 数据项 */
  data?: any;
  /** 数据索引 */
  dataIndex?: number;
  /** 系列索引 */
  seriesIndex?: number;
  /** 系列名称 */
  seriesName?: string;
  /** 组件类型 */
  componentType?: string;
  /** 组件索引 */
  componentIndex?: number;
  /** 鼠标事件的位置 */
  event?: MouseEvent | TouchEvent;
}

/**
 * 引擎性能指标
 */
export interface EnginePerformanceMetrics {
  /** 初始化时间 */
  initTime: number;
  /** 渲染时间 */
  renderTime: number;
  /** 帧率 */
  fps: number;
  /** 内存使用 */
  memoryUsage: number;
  /** 数据点数量 */
  dataPoints: number;
  /** 系列数量 */
  seriesCount: number;
}

/**
 * 通用图表配置（跨引擎）
 */
export interface UniversalChartConfig extends ChartConfig {
  /** 引擎特定配置 */
  engineOptions?: Record<string, unknown>;
  /** 坐标轴配置 */
  axes?: {
    x?: AxisConfig;
    y?: AxisConfig;
    z?: AxisConfig;
  };
  /** 系列配置 */
  series?: SeriesConfig[];
  /** 数据集配置 */
  dataset?: DatasetConfig;
  /** 视觉映射配置 */
  visualMap?: VisualMapConfig[];
  /** 数据缩放配置 */
  dataZoom?: DataZoomConfig[];
}

/**
 * 坐标轴配置
 */
export interface AxisConfig {
  /** 轴类型 */
  type?: 'value' | 'category' | 'time' | 'log' | 'band' | 'linear';
  /** 轴名称 */
  name?: string;
  /** 显示状态 */
  show?: boolean;
  /** 位置 */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** 数据 */
  data?: any[];
  /** 最小值 */
  min?: number | string | Function;
  /** 最大值 */
  max?: number | string | Function;
  /** 刻度配置 */
  tick?: {
    show?: boolean;
    interval?: number | 'auto';
    rotate?: number;
  };
  /** 标签配置 */
  label?: {
    show?: boolean;
    formatter?: string | Function;
    rotate?: number;
  };
  /** 网格线配置 */
  gridLine?: {
    show?: boolean;
    style?: LineStyle;
  };
}

/**
 * 系列配置
 */
export interface SeriesConfig {
  /** 系列名称 */
  name?: string;
  /** 系列类型 */
  type: string;
  /** 数据 */
  data?: any[];
  /** 数据集索引 */
  datasetIndex?: number;
  /** 编码配置 */
  encode?: Record<string, string | number | string[] | number[]>;
  /** 标签配置 */
  label?: LabelConfig;
  /** 样式配置 */
  style?: Record<string, any>;
  /** 自定义配置 */
  [key: string]: any;
}

/**
 * 数据集配置
 */
export interface DatasetConfig {
  /** 数据源 */
  source?: any[][] | Record<string, any>[];
  /** 维度定义 */
  dimensions?: Array<string | { name: string; type?: string }>;
  /** 数据转换 */
  transform?: DataTransform[];
}

/**
 * 数据转换配置
 */
export interface DataTransform {
  /** 转换类型 */
  type: 'filter' | 'sort' | 'aggregate' | 'custom';
  /** 转换配置 */
  config?: Record<string, any>;
  /** 自定义转换函数 */
  transform?: (data: any) => any;
}

/**
 * 视觉映射配置
 */
export interface VisualMapConfig {
  /** 类型 */
  type?: 'continuous' | 'piecewise';
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 维度 */
  dimension?: number | string;
  /** 颜色范围 */
  color?: string[];
  /** 显示状态 */
  show?: boolean;
}

/**
 * 数据缩放配置
 */
export interface DataZoomConfig {
  /** 类型 */
  type?: 'inside' | 'slider';
  /** 轴索引 */
  xAxisIndex?: number | number[];
  yAxisIndex?: number | number[];
  /** 起始百分比 */
  start?: number;
  /** 结束百分比 */
  end?: number;
  /** 显示状态 */
  show?: boolean;
}

/**
 * 标签配置
 */
export interface LabelConfig {
  /** 显示状态 */
  show?: boolean;
  /** 位置 */
  position?: string;
  /** 格式化器 */
  formatter?: string | Function;
  /** 样式 */
  style?: TextStyle;
}

/**
 * 文本样式
 */
export interface TextStyle {
  /** 颜色 */
  color?: string;
  /** 字体大小 */
  fontSize?: number;
  /** 字体族 */
  fontFamily?: string;
  /** 字体粗细 */
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
  /** 字体样式 */
  fontStyle?: 'normal' | 'italic' | 'oblique';
}

/**
 * 线条样式
 */
export interface LineStyle {
  /** 颜色 */
  color?: string;
  /** 宽度 */
  width?: number;
  /** 类型 */
  type?: 'solid' | 'dashed' | 'dotted';
  /** 透明度 */
  opacity?: number;
}

/**
 * 引擎能力矩阵
 */
export interface EngineCapabilities {
  /** 支持的图表类型 */
  supportedChartTypes: string[];
  /** 支持的特性 */
  supportedFeatures: string[];
  /** 性能指标 */
  performanceBenchmark?: {
    maxDataPoints: number;
    maxSeries: number;
    renderingSpeed: 'fast' | 'medium' | 'slow';
  };
  /** 浏览器兼容性 */
  browserCompatibility?: {
    chrome?: string;
    firefox?: string;
    safari?: string;
    edge?: string;
    ie?: string;
  };
}