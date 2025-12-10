/**
 * 图表注册系统 - 支持按需加载
 * 
 * @example
 * ```ts
 * import { use, registerSeries, registerComponent } from '@ldesign/chart-core'
 * import { LineSeries } from '@ldesign/chart-core/series/line'
 * import { BarSeries } from '@ldesign/chart-core/series/bar'
 * 
 * // 注册需要的图表类型
 * use([LineSeries, BarSeries])
 * ```
 */

import type { IRenderer } from '../renderer/interface'
import type { ICoordinate } from '../coordinate/interface'
import type { IScale } from '../scale/interface'
import type { Theme } from '../theme/interface'

// ============== 类型定义 ==============

/**
 * 系列构造器参数
 */
export interface SeriesConstructorParams {
  option: SeriesOptionBase
  xScale?: IScale
  yScale?: IScale
  coordinate?: ICoordinate
  theme?: Theme
  chartWidth: number
  chartHeight: number
  chartRect: { x: number; y: number; width: number; height: number }
}

/**
 * 系列基础配置
 */
export interface SeriesOptionBase {
  type: string
  name?: string
  data?: unknown[]
  [key: string]: unknown
}

/**
 * 可注册的系列类
 */
export interface RegisterableSeries {
  /** 系列类型标识 */
  readonly seriesType: string

  /** 创建系列实例 */
  new(params: SeriesConstructorParams): ISeriesInstance
}

/**
 * 系列实例接口
 */
export interface ISeriesInstance {
  /** 系列类型 */
  readonly type: string

  /** 渲染系列 */
  render(renderer: IRenderer, animationProgress: number): void

  /** 更新配置 */
  updateOption(option: Partial<SeriesOptionBase>): void

  /** 更新比例尺 */
  updateScales?(xScale: IScale, yScale: IScale): void

  /** 更新坐标系 */
  updateCoordinate?(coordinate: ICoordinate): void

  /** 获取数据范围 */
  getDataExtent?(): { xMin: number; xMax: number; yMin: number; yMax: number } | { min: number; max: number }

  /** 处理交互事件 */
  handleEvent?(type: string, event: MouseEvent, point: { x: number; y: number }): void

  /** 销毁 */
  dispose(): void
}

/**
 * 组件构造器参数
 */
export interface ComponentConstructorParams {
  option: ComponentOptionBase
  theme?: Theme
  chartWidth: number
  chartHeight: number
  chartRect: { x: number; y: number; width: number; height: number }
}

/**
 * 组件基础配置
 */
export interface ComponentOptionBase {
  type: string
  show?: boolean
  [key: string]: unknown
}

/**
 * 可注册的组件类
 */
export interface RegisterableComponent {
  /** 组件类型标识 */
  readonly componentType: string

  /** 创建组件实例 */
  new(params: ComponentConstructorParams): IComponentInstance
}

/**
 * 组件实例接口
 */
export interface IComponentInstance {
  /** 组件类型 */
  readonly type: string

  /** 渲染组件 */
  render(renderer: IRenderer): void

  /** 更新配置 */
  updateOption(option: Partial<ComponentOptionBase>): void

  /** 更新布局 */
  updateLayout(rect: { x: number; y: number; width: number; height: number }): void

  /** 销毁 */
  dispose(): void
}

// ============== 注册表 ==============

/**
 * 系列注册表
 */
const seriesRegistry = new Map<string, RegisterableSeries>()

/**
 * 组件注册表
 */
const componentRegistry = new Map<string, RegisterableComponent>()

/**
 * 坐标系注册表
 */
const coordinateRegistry = new Map<string, new (...args: unknown[]) => ICoordinate>()

// ============== 注册函数 ==============

/**
 * 注册系列类型
 */
export function registerSeries(SeriesClass: RegisterableSeries): void {
  if (!SeriesClass.seriesType) {
    console.warn('Series class must have a static seriesType property')
    return
  }
  seriesRegistry.set(SeriesClass.seriesType, SeriesClass)
}

/**
 * 注册组件类型
 */
export function registerComponent(ComponentClass: RegisterableComponent): void {
  if (!ComponentClass.componentType) {
    console.warn('Component class must have a static componentType property')
    return
  }
  componentRegistry.set(ComponentClass.componentType, ComponentClass)
}

/**
 * 注册坐标系类型
 */
export function registerCoordinate(
  type: string,
  CoordinateClass: new (...args: unknown[]) => ICoordinate
): void {
  coordinateRegistry.set(type, CoordinateClass)
}

/**
 * 批量注册（统一入口）
 */
export function use(
  items: (RegisterableSeries | RegisterableComponent)[] | RegisterableSeries | RegisterableComponent
): void {
  const itemArray = Array.isArray(items) ? items : [items]

  for (const item of itemArray) {
    if ('seriesType' in item) {
      registerSeries(item as RegisterableSeries)
    } else if ('componentType' in item) {
      registerComponent(item as RegisterableComponent)
    }
  }
}

// ============== 获取函数 ==============

/**
 * 获取已注册的系列类
 */
export function getSeriesClass(type: string): RegisterableSeries | undefined {
  return seriesRegistry.get(type)
}

/**
 * 获取已注册的组件类
 */
export function getComponentClass(type: string): RegisterableComponent | undefined {
  return componentRegistry.get(type)
}

/**
 * 获取已注册的坐标系类
 */
export function getCoordinateClass(type: string): (new (...args: unknown[]) => ICoordinate) | undefined {
  return coordinateRegistry.get(type)
}

/**
 * 检查系列类型是否已注册
 */
export function hasSeriesType(type: string): boolean {
  return seriesRegistry.has(type)
}

/**
 * 检查组件类型是否已注册
 */
export function hasComponentType(type: string): boolean {
  return componentRegistry.has(type)
}

/**
 * 获取所有已注册的系列类型
 */
export function getRegisteredSeriesTypes(): string[] {
  return Array.from(seriesRegistry.keys())
}

/**
 * 获取所有已注册的组件类型
 */
export function getRegisteredComponentTypes(): string[] {
  return Array.from(componentRegistry.keys())
}

// ============== 创建实例 ==============

/**
 * 创建系列实例
 */
export function createSeriesInstance(
  type: string,
  params: SeriesConstructorParams
): ISeriesInstance | null {
  const SeriesClass = seriesRegistry.get(type)
  if (!SeriesClass) {
    console.warn(`Series type "${type}" is not registered. Use registerSeries() or use() to register it.`)
    return null
  }
  return new SeriesClass(params)
}

/**
 * 创建组件实例
 */
export function createComponentInstance(
  type: string,
  params: ComponentConstructorParams
): IComponentInstance | null {
  const ComponentClass = componentRegistry.get(type)
  if (!ComponentClass) {
    console.warn(`Component type "${type}" is not registered. Use registerComponent() or use() to register it.`)
    return null
  }
  return new ComponentClass(params)
}
