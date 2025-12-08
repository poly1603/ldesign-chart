/**
 * 交互管理器 - 统一管理所有图表交互（仿 ECharts）
 */

import { EventEmitter } from '../event/EventEmitter'
import type { IRenderer } from '../renderer/interface'

/**
 * 交互事件类型
 */
export type InteractionEventType =
  | 'click'
  | 'dblclick'
  | 'mousedown'
  | 'mouseup'
  | 'mousemove'
  | 'mouseover'
  | 'mouseout'
  | 'globalout'
  | 'contextmenu'

/**
 * 数据项位置信息
 */
export interface DataItemPosition {
  seriesIndex: number
  seriesType: string
  seriesName?: string
  dataIndex: number
  name?: string
  value: number | number[]
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
}

/**
 * 交互事件参数
 */
export interface InteractionEvent {
  type: InteractionEventType
  event: MouseEvent
  /** 鼠标在 canvas 中的坐标 */
  offsetX: number
  offsetY: number
  /** 命中的数据项 */
  data?: DataItemPosition
  /** 所有命中的数据项（同一位置可能有多个） */
  dataAll?: DataItemPosition[]
  /** 组件类型 */
  componentType?: 'series' | 'axis' | 'legend' | 'title' | 'dataZoom'
  /** 组件索引 */
  componentIndex?: number
}

/**
 * 高亮配置
 */
export interface HighlightOptions {
  /** 系列索引 */
  seriesIndex?: number
  /** 数据索引 */
  dataIndex?: number
  /** 系列名称 */
  seriesName?: string
  /** 数据名称 */
  name?: string
}

/**
 * 轴指示器类型
 */
export type AxisPointerType = 'line' | 'shadow' | 'cross' | 'none'

/**
 * 轴指示器配置
 */
export interface AxisPointerConfig {
  show: boolean
  type: AxisPointerType
  snap?: boolean
  lineStyle?: {
    color?: string
    width?: number
    type?: 'solid' | 'dashed' | 'dotted'
  }
  shadowStyle?: {
    color?: string
    opacity?: number
  }
  crossStyle?: {
    color?: string
    width?: number
  }
  label?: {
    show?: boolean
    backgroundColor?: string
    color?: string
  }
}

/**
 * 交互管理器
 */
export class InteractionManager extends EventEmitter {
  private canvas: HTMLCanvasElement | null = null
  private chartRect: { x: number; y: number; width: number; height: number } = {
    x: 0, y: 0, width: 0, height: 0,
  }

  // 数据项位置缓存
  private dataPositions: DataItemPosition[] = []

  // 当前状态
  private hoveredData: DataItemPosition | null = null
  private selectedData: DataItemPosition[] = []
  private highlightedSeries: Set<number> = new Set()
  private hiddenSeries: Set<number> = new Set()

  // 配置
  private axisPointer: AxisPointerConfig = {
    show: true,
    type: 'line',
    snap: true,
    lineStyle: { color: '#6366f1', width: 1, type: 'dashed' },
    shadowStyle: { color: 'rgba(99, 102, 241, 0.1)', opacity: 0.5 },
  }

  private throttleTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * 初始化交互管理器
   */
  init(canvas: HTMLCanvasElement, _width?: number, _height?: number): void {
    this.canvas = canvas
    this.bindEvents()
  }

  /**
   * 设置图表区域
   */
  setChartRect(rect: { x: number; y: number; width: number; height: number }): void {
    this.chartRect = rect
  }

  /**
   * 设置轴指示器配置
   */
  setAxisPointer(config: Partial<AxisPointerConfig>): void {
    this.axisPointer = { ...this.axisPointer, ...config }
  }

  /**
   * 更新数据位置缓存
   */
  updateDataPositions(positions: DataItemPosition[]): void {
    this.dataPositions = positions
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.canvas) return

    const canvas = this.canvas

    canvas.addEventListener('mousemove', this.handleMouseMove)
    canvas.addEventListener('mouseleave', this.handleMouseLeave)
    canvas.addEventListener('click', this.handleClick)
    canvas.addEventListener('dblclick', this.handleDblClick)
    canvas.addEventListener('mousedown', this.handleMouseDown)
    canvas.addEventListener('mouseup', this.handleMouseUp)
    canvas.addEventListener('contextmenu', this.handleContextMenu)
  }

  /**
   * 解绑事件
   */
  private unbindEvents(): void {
    if (!this.canvas) return

    const canvas = this.canvas

    canvas.removeEventListener('mousemove', this.handleMouseMove)
    canvas.removeEventListener('mouseleave', this.handleMouseLeave)
    canvas.removeEventListener('click', this.handleClick)
    canvas.removeEventListener('dblclick', this.handleDblClick)
    canvas.removeEventListener('mousedown', this.handleMouseDown)
    canvas.removeEventListener('mouseup', this.handleMouseUp)
    canvas.removeEventListener('contextmenu', this.handleContextMenu)
  }

  /**
   * 创建交互事件
   */
  private createEvent(type: InteractionEventType, e: MouseEvent): InteractionEvent {
    const rect = this.canvas!.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    const hitData = this.findDataAt(offsetX, offsetY)
    const hitDataAll = this.findAllDataAt(offsetX, offsetY)

    return {
      type,
      event: e,
      offsetX,
      offsetY,
      data: hitData || undefined,
      dataAll: hitDataAll.length > 0 ? hitDataAll : undefined,
      componentType: hitData ? 'series' : undefined,
    }
  }

  /**
   * 鼠标移动处理（节流）
   */
  private handleMouseMove = (e: MouseEvent): void => {
    if (this.throttleTimer) return

    this.throttleTimer = setTimeout(() => {
      this.throttleTimer = null
      this.processMouseMove(e)
    }, 16) // ~60fps
  }

  /**
   * 实际处理鼠标移动
   */
  private processMouseMove(e: MouseEvent): void {
    const interactionEvent = this.createEvent('mousemove', e)

    // 更新悬停状态
    const prevHoveredData = this.hoveredData
    this.hoveredData = interactionEvent.data || null

    // 发出事件
    if (this.hoveredData) {
      this.canvas!.style.cursor = 'pointer'

      // 如果悬停的数据项变化了
      if (!prevHoveredData ||
        prevHoveredData.seriesIndex !== this.hoveredData.seriesIndex ||
        prevHoveredData.dataIndex !== this.hoveredData.dataIndex) {

        // 发出 mouseover 事件
        this.emit('mouseover', {
          ...interactionEvent,
          type: 'mouseover',
        })

        // 如果之前有悬停项，发出 mouseout
        if (prevHoveredData) {
          this.emit('mouseout', {
            ...interactionEvent,
            type: 'mouseout',
            data: prevHoveredData,
          })
        }
      }
    } else {
      this.canvas!.style.cursor = 'default'

      // 如果之前有悬停项
      if (prevHoveredData) {
        this.emit('mouseout', {
          ...interactionEvent,
          type: 'mouseout',
          data: prevHoveredData,
        })
      }
    }

    this.emit('mousemove', interactionEvent)
  }

  /**
   * 鼠标离开处理
   */
  private handleMouseLeave = (e: MouseEvent): void => {
    const interactionEvent = this.createEvent('globalout', e)

    if (this.hoveredData) {
      this.emit('mouseout', {
        ...interactionEvent,
        type: 'mouseout',
        data: this.hoveredData,
      })
    }

    this.hoveredData = null
    this.canvas!.style.cursor = 'default'

    this.emit('globalout', interactionEvent)
  }

  /**
   * 点击处理
   */
  private handleClick = (e: MouseEvent): void => {
    const interactionEvent = this.createEvent('click', e)
    this.emit('click', interactionEvent)

    // 数据选择
    if (interactionEvent.data) {
      this.toggleSelect(interactionEvent.data)
    }
  }

  /**
   * 双击处理
   */
  private handleDblClick = (e: MouseEvent): void => {
    const interactionEvent = this.createEvent('dblclick', e)
    this.emit('dblclick', interactionEvent)
  }

  /**
   * 鼠标按下处理
   */
  private handleMouseDown = (e: MouseEvent): void => {
    const interactionEvent = this.createEvent('mousedown', e)
    this.emit('mousedown', interactionEvent)
  }

  /**
   * 鼠标抬起处理
   */
  private handleMouseUp = (e: MouseEvent): void => {
    const interactionEvent = this.createEvent('mouseup', e)
    this.emit('mouseup', interactionEvent)
  }

  /**
   * 右键菜单处理
   */
  private handleContextMenu = (e: MouseEvent): void => {
    e.preventDefault()
    const interactionEvent = this.createEvent('contextmenu', e)
    this.emit('contextmenu', interactionEvent)
  }

  /**
   * 查找指定位置的数据项
   */
  private findDataAt(x: number, y: number): DataItemPosition | null {
    for (const item of this.dataPositions) {
      if (this.hiddenSeries.has(item.seriesIndex)) continue

      if (item.radius !== undefined) {
        // 圆形检测（散点图、饼图等）
        const distance = Math.sqrt(Math.pow(x - item.x, 2) + Math.pow(y - item.y, 2))
        if (distance <= item.radius + 5) {
          return item
        }
      } else if (item.width !== undefined && item.height !== undefined) {
        // 矩形检测（柱状图等）
        if (x >= item.x && x <= item.x + item.width &&
          y >= item.y && y <= item.y + item.height) {
          return item
        }
      } else {
        // 点检测（折线图等）
        const distance = Math.sqrt(Math.pow(x - item.x, 2) + Math.pow(y - item.y, 2))
        if (distance <= 10) {
          return item
        }
      }
    }
    return null
  }

  /**
   * 查找指定位置的所有数据项
   */
  private findAllDataAt(x: number, _y: number): DataItemPosition[] {
    const results: DataItemPosition[] = []

    for (const item of this.dataPositions) {
      if (this.hiddenSeries.has(item.seriesIndex)) continue

      // 使用 X 轴proximity 检测（用于轴触发）
      const xDistance = Math.abs(x - item.x)
      if (xDistance <= 30) {
        results.push(item)
      }
    }

    return results
  }

  /**
   * 根据 X 坐标查找最近的数据索引
   */
  findNearestDataIndexByX(x: number): number {
    let nearestIndex = -1
    let minDistance = Infinity

    for (const item of this.dataPositions) {
      if (this.hiddenSeries.has(item.seriesIndex)) continue

      const distance = Math.abs(x - item.x)
      if (distance < minDistance) {
        minDistance = distance
        nearestIndex = item.dataIndex
      }
    }

    return nearestIndex
  }

  /**
   * 获取指定数据索引的所有系列数据
   */
  getDataByIndex(dataIndex: number): DataItemPosition[] {
    return this.dataPositions.filter(
      item => item.dataIndex === dataIndex && !this.hiddenSeries.has(item.seriesIndex)
    )
  }

  /**
   * 切换数据选择状态
   */
  toggleSelect(data: DataItemPosition): void {
    const index = this.selectedData.findIndex(
      d => d.seriesIndex === data.seriesIndex && d.dataIndex === data.dataIndex
    )

    if (index >= 0) {
      this.selectedData.splice(index, 1)
      this.emit('unselect', { data })
    } else {
      this.selectedData.push(data)
      this.emit('select', { data })
    }

    this.emit('selectchanged', { selected: this.selectedData })
  }

  /**
   * 高亮系列或数据
   */
  highlight(options: HighlightOptions): void {
    if (options.seriesIndex !== undefined) {
      this.highlightedSeries.add(options.seriesIndex)
    }
    this.emit('highlight', options)
  }

  /**
   * 取消高亮
   */
  downplay(options: HighlightOptions): void {
    if (options.seriesIndex !== undefined) {
      this.highlightedSeries.delete(options.seriesIndex)
    }
    this.emit('downplay', options)
  }

  /**
   * 切换系列显示/隐藏（Legend 交互）
   */
  toggleSeriesVisibility(seriesIndex: number): boolean {
    if (this.hiddenSeries.has(seriesIndex)) {
      this.hiddenSeries.delete(seriesIndex)
      this.emit('legendselectchanged', {
        name: seriesIndex,
        selected: true,
        hiddenSeries: Array.from(this.hiddenSeries),
      })
      return true
    } else {
      this.hiddenSeries.add(seriesIndex)
      this.emit('legendselectchanged', {
        name: seriesIndex,
        selected: false,
        hiddenSeries: Array.from(this.hiddenSeries),
      })
      return false
    }
  }

  /**
   * 检查系列是否可见
   */
  isSeriesVisible(seriesIndex: number): boolean {
    return !this.hiddenSeries.has(seriesIndex)
  }

  /**
   * 检查系列是否高亮
   */
  isSeriesHighlighted(seriesIndex: number): boolean {
    return this.highlightedSeries.size === 0 || this.highlightedSeries.has(seriesIndex)
  }

  /**
   * 获取当前悬停的数据
   */
  getHoveredData(): DataItemPosition | null {
    return this.hoveredData
  }

  /**
   * 获取选中的数据
   */
  getSelectedData(): DataItemPosition[] {
    return [...this.selectedData]
  }

  /**
   * 渲染轴指示器
   */
  renderAxisPointer(renderer: IRenderer, x: number): void {
    if (!this.axisPointer.show || this.axisPointer.type === 'none') return

    const { type, lineStyle, shadowStyle } = this.axisPointer
    const { x: chartX, y: chartY, width: chartWidth, height: chartHeight } = this.chartRect

    // 边界检查
    if (x < chartX || x > chartX + chartWidth) return

    if (type === 'line' || type === 'cross') {
      // 绘制垂直线
      const lineDash = lineStyle?.type === 'dashed' ? [5, 5] :
        lineStyle?.type === 'dotted' ? [2, 2] : undefined

      renderer.drawPath(
        {
          commands: [
            { type: 'M', x, y: chartY },
            { type: 'L', x, y: chartY + chartHeight },
          ],
        },
        {
          stroke: lineStyle?.color || '#6366f1',
          lineWidth: lineStyle?.width || 1,
          lineDash,
        }
      )

      // 十字线还需要水平线
      if (type === 'cross' && this.hoveredData) {
        renderer.drawPath(
          {
            commands: [
              { type: 'M', x: chartX, y: this.hoveredData.y },
              { type: 'L', x: chartX + chartWidth, y: this.hoveredData.y },
            ],
          },
          {
            stroke: lineStyle?.color || '#6366f1',
            lineWidth: lineStyle?.width || 1,
            lineDash,
          }
        )
      }
    }

    if (type === 'shadow') {
      // 查找最近的数据点来确定阴影宽度
      const nearestIndex = this.findNearestDataIndexByX(x)
      if (nearestIndex >= 0) {
        const dataAtIndex = this.getDataByIndex(nearestIndex)
        if (dataAtIndex.length > 0) {
          const itemWidth = dataAtIndex[0]!.width || 30
          const shadowX = dataAtIndex[0]!.x - itemWidth / 2

          renderer.drawPath(
            {
              commands: [
                { type: 'M', x: shadowX, y: chartY },
                { type: 'L', x: shadowX + itemWidth, y: chartY },
                { type: 'L', x: shadowX + itemWidth, y: chartY + chartHeight },
                { type: 'L', x: shadowX, y: chartY + chartHeight },
                { type: 'Z' },
              ],
            },
            {
              fill: shadowStyle?.color || 'rgba(99, 102, 241, 0.1)',
              opacity: shadowStyle?.opacity || 0.5,
            }
          )
        }
      }
    }
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.unbindEvents()
    this.removeAllListeners()
    this.dataPositions = []
    this.selectedData = []
    this.highlightedSeries.clear()
    this.hiddenSeries.clear()
    this.canvas = null
  }
}
