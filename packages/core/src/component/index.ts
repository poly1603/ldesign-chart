/**
 * 组件系统
 */

export { Axis } from './Axis'
export { Legend } from './Legend'
export { Title } from './Title'
export { Tooltip } from './Tooltip'
export { DataZoom } from './DataZoom'

export type { AxisOrientation, AxisComponentOptions } from './Axis'
export type {
  LegendComponentOptions,
  LegendItem,
  LegendOrient,
  LegendPosition
} from './Legend'
export type { TitleComponentOptions, TitleAlign } from './Title'
export type {
  TooltipComponentOptions,
  TooltipDataItem,
  TooltipTrigger,
  TooltipPosition
} from './Tooltip'
export type {
  DataZoomComponentOptions,
  DataZoomEvent,
  DataZoomType
} from './DataZoom'

export type { IComponent, ComponentType, ComponentOptions } from './interface'