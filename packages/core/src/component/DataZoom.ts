/**
 * 数据缩放组件 - 用于数据范围选择
 */

import type { IRenderer } from '../renderer/interface'
import type { IComponent, ComponentOptions } from './interface'
import { EventEmitter } from '../event/EventEmitter'

/**
 * 数据缩放类型
 */
export type DataZoomType = 'inside' | 'slider'

/**
 * 数据缩放组件配置
 */
export interface DataZoomComponentOptions extends ComponentOptions {
  type: 'dataZoom'
  /** 缩放类型 */
  zoomType?: DataZoomType
  /** 起始百分比 0-100 */
  start?: number
  /** 结束百分比 0-100 */
  end?: number
  /** 最小缩放范围百分比 */
  minSpan?: number
  /** 最大缩放范围百分比 */
  maxSpan?: number
  /** 是否显示 */
  show?: boolean
  /** 高度 */
  height?: number
  /** 底部距离 */
  bottom?: number
  /** 左侧距离 */
  left?: number | string
  /** 右侧距离 */
  right?: number | string
  /** 背景颜色 */
  backgroundColor?: string
  /** 数据阴影颜色 */
  dataBackgroundColor?: string
  /** 选中区域颜色 */
  fillerColor?: string
  /** 边框颜色 */
  borderColor?: string
  /** 手柄颜色 */
  handleColor?: string
  /** 手柄大小 */
  handleSize?: number
  /** 文字样式 */
  textStyle?: {
    color?: string
    fontSize?: number
  }
  /** 是否显示详情 */
  showDetail?: boolean
  /** 是否实时更新 */
  realtime?: boolean
}

/**
 * 数据缩放事件
 */
export interface DataZoomEvent {
  start: number
  end: number
  startValue?: number
  endValue?: number
}

/**
 * 数据缩放组件类
 */
export class DataZoom extends EventEmitter implements IComponent {
  readonly type: 'dataZoom' = 'dataZoom'
  visible: boolean = true

  private option: DataZoomComponentOptions
  private start: number = 0
  private end: number = 100
  private isDragging: boolean = false
  private dragType: 'left' | 'right' | 'middle' | null = null
  private dragStartX: number = 0
  private dragStartStart: number = 0
  private dragStartEnd: number = 0

  private containerWidth: number = 800
  private containerHeight: number = 600
  private sliderRect: { x: number; y: number; width: number; height: number } = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  }

  constructor(option: DataZoomComponentOptions) {
    super()
    this.option = {
      show: true,
      zoomType: 'slider',
      start: 0,
      end: 100,
      minSpan: 5,
      maxSpan: 100,
      height: 30,
      bottom: 20,
      left: 50,
      right: 50,
      backgroundColor: '#1e293b',
      dataBackgroundColor: 'rgba(99, 102, 241, 0.2)',
      fillerColor: 'rgba(99, 102, 241, 0.3)',
      borderColor: '#475569',
      handleColor: '#6366f1',
      handleSize: 20,
      textStyle: {
        color: '#94a3b8',
        fontSize: 11,
      },
      showDetail: true,
      realtime: true,
      ...option,
    }
    this.start = this.option.start ?? 0
    this.end = this.option.end ?? 100
  }

  /**
   * 设置容器尺寸
   */
  setContainerSize(width: number, height: number): void {
    this.containerWidth = width
    this.containerHeight = height
    this.calculateSliderRect()
  }

  /**
   * 计算滑块区域
   */
  private calculateSliderRect(): void {
    const left = typeof this.option.left === 'number' ? this.option.left : 50
    const right = typeof this.option.right === 'number' ? this.option.right : 50
    const height = this.option.height ?? 30
    const bottom = this.option.bottom ?? 20

    this.sliderRect = {
      x: left,
      y: this.containerHeight - bottom - height,
      width: this.containerWidth - left - right,
      height,
    }
  }

  /**
   * 渲染数据缩放组件
   */
  render(renderer: IRenderer): void {
    if (!this.visible || !this.option.show || this.option.zoomType !== 'slider') {
      return
    }

    this.calculateSliderRect()
    const { x, y, width, height } = this.sliderRect

    // 绘制背景
    this.renderBackground(renderer, x, y, width, height)

    // 绘制选中区域
    this.renderSelectedArea(renderer, x, y, width, height)

    // 绘制手柄
    this.renderHandles(renderer, x, y, width, height)

    // 绘制文字
    if (this.option.showDetail && this.isDragging) {
      this.renderLabels(renderer, x, y, width, height)
    }
  }

  /**
   * 渲染背景
   */
  private renderBackground(
    renderer: IRenderer,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    // 背景
    renderer.drawPath(
      {
        commands: [
          { type: 'M', x, y },
          { type: 'L', x: x + width, y },
          { type: 'L', x: x + width, y: y + height },
          { type: 'L', x, y: y + height },
          { type: 'Z' },
        ],
      },
      {
        fill: this.option.backgroundColor,
        stroke: this.option.borderColor,
        lineWidth: 1,
      }
    )
  }

  /**
   * 渲染选中区域
   */
  private renderSelectedArea(
    renderer: IRenderer,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const startX = x + (width * this.start) / 100
    const endX = x + (width * this.end) / 100
    const selectedWidth = endX - startX

    // 选中区域
    renderer.drawPath(
      {
        commands: [
          { type: 'M', x: startX, y },
          { type: 'L', x: endX, y },
          { type: 'L', x: endX, y: y + height },
          { type: 'L', x: startX, y: y + height },
          { type: 'Z' },
        ],
      },
      {
        fill: this.option.fillerColor,
      }
    )

    // 上下边框
    renderer.drawPath(
      {
        commands: [
          { type: 'M', x: startX, y },
          { type: 'L', x: startX + selectedWidth, y },
        ],
      },
      {
        stroke: this.option.handleColor,
        lineWidth: 2,
      }
    )
    renderer.drawPath(
      {
        commands: [
          { type: 'M', x: startX, y: y + height },
          { type: 'L', x: startX + selectedWidth, y: y + height },
        ],
      },
      {
        stroke: this.option.handleColor,
        lineWidth: 2,
      }
    )
  }

  /**
   * 渲染手柄
   */
  private renderHandles(
    renderer: IRenderer,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const handleWidth = 8
    const startX = x + (width * this.start) / 100
    const endX = x + (width * this.end) / 100

    // 左手柄
    this.renderHandle(renderer, startX - handleWidth / 2, y, handleWidth, height)

    // 右手柄
    this.renderHandle(renderer, endX - handleWidth / 2, y, handleWidth, height)
  }

  /**
   * 渲染单个手柄
   */
  private renderHandle(
    renderer: IRenderer,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const radius = 3

    // 手柄背景
    renderer.drawPath(
      {
        commands: [
          { type: 'M', x: x + radius, y },
          { type: 'L', x: x + width - radius, y },
          { type: 'Q', x1: x + width, y1: y, x: x + width, y: y + radius },
          { type: 'L', x: x + width, y: y + height - radius },
          { type: 'Q', x1: x + width, y1: y + height, x: x + width - radius, y: y + height },
          { type: 'L', x: x + radius, y: y + height },
          { type: 'Q', x1: x, y1: y + height, x, y: y + height - radius },
          { type: 'L', x, y: y + radius },
          { type: 'Q', x1: x, y1: y, x: x + radius, y },
          { type: 'Z' },
        ],
      },
      {
        fill: this.option.handleColor,
      }
    )

    // 手柄装饰线
    const centerX = x + width / 2
    const lineY1 = y + height * 0.3
    const lineY2 = y + height * 0.7
    renderer.drawPath(
      {
        commands: [
          { type: 'M', x: centerX - 1, y: lineY1 },
          { type: 'L', x: centerX - 1, y: lineY2 },
        ],
      },
      { stroke: '#fff', lineWidth: 1, opacity: 0.8 }
    )
    renderer.drawPath(
      {
        commands: [
          { type: 'M', x: centerX + 1, y: lineY1 },
          { type: 'L', x: centerX + 1, y: lineY2 },
        ],
      },
      { stroke: '#fff', lineWidth: 1, opacity: 0.8 }
    )
  }

  /**
   * 渲染标签
   */
  private renderLabels(
    renderer: IRenderer,
    x: number,
    y: number,
    width: number,
    _height: number
  ): void {
    const textStyle = this.option.textStyle!
    const startX = x + (width * this.start) / 100
    const endX = x + (width * this.end) / 100

    renderer.drawText(
      { text: `${this.start.toFixed(0)}%`, x: startX, y: y - 5 },
      {
        fill: textStyle.color,
        fontSize: textStyle.fontSize,
        textAlign: 'center',
        textBaseline: 'bottom',
      }
    )

    renderer.drawText(
      { text: `${this.end.toFixed(0)}%`, x: endX, y: y - 5 },
      {
        fill: textStyle.color,
        fontSize: textStyle.fontSize,
        textAlign: 'center',
        textBaseline: 'bottom',
      }
    )
  }

  /**
   * 处理鼠标按下
   */
  handleMouseDown(mouseX: number, mouseY: number): boolean {
    if (!this.visible || !this.option.show) return false

    const { x, y, width, height } = this.sliderRect
    const handleWidth = 8
    const startX = x + (width * this.start) / 100
    const endX = x + (width * this.end) / 100

    // 检查是否在滑块区域内
    if (mouseY < y || mouseY > y + height) return false

    // 检查左手柄
    if (Math.abs(mouseX - startX) < handleWidth) {
      this.isDragging = true
      this.dragType = 'left'
      this.dragStartX = mouseX
      this.dragStartStart = this.start
      this.dragStartEnd = this.end
      return true
    }

    // 检查右手柄
    if (Math.abs(mouseX - endX) < handleWidth) {
      this.isDragging = true
      this.dragType = 'right'
      this.dragStartX = mouseX
      this.dragStartStart = this.start
      this.dragStartEnd = this.end
      return true
    }

    // 检查中间区域（拖拽移动）
    if (mouseX > startX && mouseX < endX) {
      this.isDragging = true
      this.dragType = 'middle'
      this.dragStartX = mouseX
      this.dragStartStart = this.start
      this.dragStartEnd = this.end
      return true
    }

    return false
  }

  /**
   * 处理鼠标移动
   */
  handleMouseMove(mouseX: number, _mouseY: number): boolean {
    if (!this.isDragging || !this.dragType) return false

    const { width } = this.sliderRect
    const deltaPercent = ((mouseX - this.dragStartX) / width) * 100
    const minSpan = this.option.minSpan ?? 5
    const maxSpan = this.option.maxSpan ?? 100

    let newStart = this.start
    let newEnd = this.end

    switch (this.dragType) {
      case 'left':
        newStart = Math.max(0, Math.min(this.dragStartStart + deltaPercent, this.end - minSpan))
        break

      case 'right':
        newEnd = Math.min(100, Math.max(this.dragStartEnd + deltaPercent, this.start + minSpan))
        break

      case 'middle':
        const span = this.dragStartEnd - this.dragStartStart
        newStart = this.dragStartStart + deltaPercent
        newEnd = this.dragStartEnd + deltaPercent

        if (newStart < 0) {
          newStart = 0
          newEnd = span
        }
        if (newEnd > 100) {
          newEnd = 100
          newStart = 100 - span
        }
        break
    }

    // 检查范围限制
    const currentSpan = newEnd - newStart
    if (currentSpan < minSpan || currentSpan > maxSpan) {
      return true
    }

    const changed = this.start !== newStart || this.end !== newEnd
    this.start = newStart
    this.end = newEnd

    if (changed && this.option.realtime) {
      this.emitChange()
    }

    return changed
  }

  /**
   * 处理鼠标抬起
   */
  handleMouseUp(): void {
    if (this.isDragging) {
      this.isDragging = false
      this.dragType = null
      this.emitChange()
    }
  }

  /**
   * 发出变化事件
   */
  private emitChange(): void {
    const event: DataZoomEvent = {
      start: this.start,
      end: this.end,
    }
    this.emit('dataZoom', event)
  }

  /**
   * 获取当前范围
   */
  getRange(): { start: number; end: number } {
    return { start: this.start, end: this.end }
  }

  /**
   * 设置范围
   */
  setRange(start: number, end: number): void {
    this.start = Math.max(0, Math.min(100, start))
    this.end = Math.max(0, Math.min(100, end))
    this.emitChange()
  }

  /**
   * 重置范围
   */
  reset(): void {
    this.start = this.option.start ?? 0
    this.end = this.option.end ?? 100
    this.emitChange()
  }

  /**
   * 更新配置
   */
  updateOption(option: Partial<DataZoomComponentOptions>): void {
    this.option = { ...this.option, ...option }
    if (option.start !== undefined) this.start = option.start
    if (option.end !== undefined) this.end = option.end
  }

  /**
   * 获取边界矩形
   */
  getBoundingRect(): { x: number; y: number; width: number; height: number } {
    return { ...this.sliderRect }
  }

  /**
   * 更新布局
   */
  update(rect: { x: number; y: number; width: number; height: number }): void {
    this.setContainerSize(rect.width, rect.height)
  }

  /**
   * 销毁组件
   */
  dispose(): void {
    this.removeAllListeners()
    this.isDragging = false
    this.dragType = null
  }
}
