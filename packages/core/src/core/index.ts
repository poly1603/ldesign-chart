/**
 * 核心模块导出
 */

// ============== 注册系统 ==============
export {
  // 注册函数
  use,
  registerSeries,
  registerComponent,
  registerCoordinate,

  // 获取函数
  getSeriesClass,
  getComponentClass,
  getCoordinateClass,
  hasSeriesType,
  hasComponentType,
  getRegisteredSeriesTypes,
  getRegisteredComponentTypes,

  // 创建实例
  createSeriesInstance,
  createComponentInstance,
} from './registry'

export type {
  // 类型
  SeriesConstructorParams,
  SeriesOptionBase,
  RegisterableSeries,
  ISeriesInstance,
  ComponentConstructorParams,
  ComponentOptionBase,
  RegisterableComponent,
  IComponentInstance,
} from './registry'

// ============== 动画系统 ==============
export {
  // 缓动函数
  easings,
  getEasing,

  // 动画配置
  DEFAULT_ANIMATION_CONFIG,
  resolveAnimationConfig,

  // 动画计算
  calculateItemProgress,
  calculateAnimationTransform,
} from './animation'

export type {
  EasingName,
  EasingFn,
  EntryAnimationType,
  UpdateAnimationType,
  ChartAnimationConfig,
} from './animation'

// ============== 主题系统 ==============
export {
  // 调色板
  DEFAULT_PALETTE,
  ECHARTS_PALETTE,

  // 颜色常量
  LIGHT_COLORS,
  DARK_COLORS,

  // 主题定义
  lightTheme,
  darkTheme,

  // 主题管理
  registerTheme,
  getTheme,
  setGlobalTheme,
  getGlobalThemeName,
  getGlobalTheme,
  detectSystemTheme,
  getThemeColors,
  getSeriesColor,

  // 颜色工具
  colorWithOpacity,
} from './theme'

export type { ThemeColors } from './theme'

// ============== 图表核心类 ==============
export { ChartCore } from './ChartCore'
export type {
  ChartRect,
  Padding,
  AxisConfig,
  SeriesConfig,
  ChartCoreOptions,
} from './ChartCore'
