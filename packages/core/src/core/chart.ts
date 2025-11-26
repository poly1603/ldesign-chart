/**
 * 图表主类
 */

import type {
  ChartOptions,
  ChartEventMap,
  Rect,
  Point,
  SeriesOptions,
  MouseEventParams,
} from '../types'
import { EventEmitter } from './EventEmitter'
import { CanvasRenderer } from '../renderers/CanvasRenderer'
import { BaseRenderer } from '../renderers/BaseRenderer'
import { Title } from '../components/Title'
import { Legend, LegendItem } from '../components/Legend'
import { Axis } from '../components/Axis'
import { Tooltip } from '../components/Tooltip'
import { BaseSeries, SeriesContext } from '../series/BaseSeries'
import { LineSeries } from '../series/LineSeries'
import { BarSeries } from '../series/BarSeries'
import { PieSeries } from '../series/PieSeries'
import { ScatterSeries } from '../series/ScatterSeries'
import { getElementSize, getMousePosition } from '../utils/dom'
import { debounce, deepMerge, isString, parseSize } from '../utils/data'
import { defaultTheme, getTheme } from '../theme'

export class Chart extends EventEmitter<ChartEventMap> {
  private container: HTMLElement
  private options: ChartOptions
  private renderer: BaseRenderer
  private width: number = 0
  private height: number = 0

  // 组件
  private title: Title | null = null
  private legend: Legend | null = null
  private xAxis: Axis | null = null
  private yAxis: Axis | null = null
  private tooltip: Tooltip

  // 系列
  private seriesList: BaseSeries[] = []

  // 区域
  private plotArea: Rect = { x: 0, y: 0, width: 0, height: 0 }

  // 主题颜色
  private colors: string[] = defaultTheme.colors

  // 状态
  private isDisposed: boolean = false
  private resizeObserver: ResizeObserver | null = null

  constructor(container: HTMLElement | string, options: ChartOptions = {}) {
    super()

    // 获取容器元素
    this.container = isString(container)
      ? document.querySelector(container) as HTMLElement
      : container

    if (!this.container) {
      throw new Error('LChart: Container element not found')
    }

    // 初始化配置
    this.options = this.normalizeOptions(options)

    // 应用主题
    this.applyTheme()

    // 创建渲染器
    this.renderer = new CanvasRenderer(this.container, {
      devicePixelRatio: this.options.devicePixelRatio,
    })

    // 创建提示框
    this.tooltip = new Tooltip(this.options.tooltip)

    // 初始化尺寸
    this.resize()

    // 初始化组件和系列
    this.initComponents()
    this.initSeries()

    // 绑定事件
    this.bindEvents()

    // 监听容器大小变化
    if (this.options.responsive !== false) {
      this.observeResize()
    }

    // 首次渲染
    this.render()
  }

  /** 标准化配置 */
  private normalizeOptions(options: ChartOptions): ChartOptions {
    const normalized = { ...options }

    // 简化配置转换
    if (options.type && options.data) {
      normalized.series = this.convertSimpleData(options.type, options.data)
    }

    // 标题字符串转对象
    if (isString(options.title)) {
      normalized.title = { text: options.title }
    }

    return normalized
  }

  /** 转换简化数据格式 */
  private convertSimpleData(type: string, data: ChartOptions['data']): SeriesOptions[] {
    if (!data) return []

    return data.datasets.map((dataset, index) => {
      const seriesData = dataset.data.map((value, i) => {
        if (typeof value === 'number') {
          return {
            x: data.labels?.[i] ?? i,
            y: value,
          }
        }
        return value
      })

      return {
        type,
        name: dataset.name ?? `Series ${index + 1}`,
        data: seriesData,
        style: dataset.style,
      } as SeriesOptions
    })
  }

  /** 应用主题 */
  private applyTheme(): void {
    const { theme } = this.options

    if (theme) {
      const themeConfig = isString(theme) ? getTheme(theme) : theme
      this.colors = themeConfig?.colors ?? defaultTheme.colors
    }
  }

  /** 初始化组件 */
  private initComponents(): void {
    const { title, legend, xAxis, yAxis } = this.options

    // 标题
    if (title) {
      this.title = new Title(isString(title) ? { text: title } : title)
    }

    // 图例
    if (legend?.show !== false) {
      this.legend = new Legend(legend)
    }

    // 坐标轴（非饼图）
    const hasPie = this.options.series?.some(s => s.type === 'pie')
    if (!hasPie) {
      this.xAxis = new Axis('bottom', Array.isArray(xAxis) ? xAxis[0] : xAxis)
      this.yAxis = new Axis('left', Array.isArray(yAxis) ? yAxis[0] : yAxis)
    }
  }

  /** 初始化系列 */
  private initSeries(): void {
    const { series = [] } = this.options

    this.seriesList = series.map((config) => {
      switch (config.type) {
        case 'line':
          return new LineSeries(config)
        case 'bar':
          return new BarSeries(config)
        case 'pie':
          return new PieSeries(config)
        case 'scatter':
          return new ScatterSeries(config)
        default:
          return new LineSeries(config as any)
      }
    })

    // 更新图例数据
    if (this.legend) {
      const legendItems: LegendItem[] = this.seriesList.map((series, index) => ({
        name: series.getName(),
        color: this.colors[index % this.colors.length],
      }))
      this.legend.setItems(legendItems)
    }
  }

  /** 绑定事件 */
  private bindEvents(): void {
    const canvas = this.container.querySelector('canvas')
    if (!canvas) return

    canvas.addEventListener('mousemove', this.handleMouseMove)
    canvas.addEventListener('click', this.handleClick)
    canvas.addEventListener('mouseout', this.handleMouseOut)
  }

  /** 解绑事件 */
  private unbindEvents(): void {
    const canvas = this.container.querySelector('canvas')
    if (!canvas) return

    canvas.removeEventListener('mousemove', this.handleMouseMove)
    canvas.removeEventListener('click', this.handleClick)
    canvas.removeEventListener('mouseout', this.handleMouseOut)
  }

  private handleMouseMove = (event: MouseEvent): void => {
    const point = getMousePosition(event, this.container)

    // 命中测试
    for (let i = 0; i < this.seriesList.length; i++) {
      const series = this.seriesList[i]
      const hit = series.hitTest(point)

      if (hit) {
        this.tooltip.show(point, {
          seriesName: series.getName(),
          name: String(hit.x),
          value: hit.y,
          dataIndex: series.getData().indexOf(hit),
          seriesIndex: i,
          color: series.getColor(),
        })
        this.render()
        return
      }
    }

    this.tooltip.hide()
    this.render()
  }

  private handleClick = (event: MouseEvent): void => {
    const point = getMousePosition(event, this.container)

    for (let i = 0; i < this.seriesList.length; i++) {
      const series = this.seriesList[i]
      const hit = series.hitTest(point)

      if (hit) {
        const params: MouseEventParams = {
          type: 'click',
          componentType: 'series',
          seriesType: series.getOptions().type,
          seriesIndex: i,
          seriesName: series.getName(),
          name: String(hit.x),
          dataIndex: series.getData().indexOf(hit),
          value: hit.y,
          color: series.getColor(),
          event,
          point,
        }
        this.emit('click', params)
        return
      }
    }
  }

  private handleMouseOut = (): void => {
    this.tooltip.hide()
    this.render()
  }

  /** 监听容器大小变化 */
  private observeResize(): void {
    const debouncedResize = debounce(() => {
      if (!this.isDisposed) {
        this.resize()
        this.render()
      }
    }, 100)

    this.resizeObserver = new ResizeObserver(debouncedResize)
    this.resizeObserver.observe(this.container)
  }

  /** 调整尺寸 */
  resize(): void {
    const { width: optWidth, height: optHeight } = this.options
    const containerSize = getElementSize(this.container)

    this.width = optWidth ? parseSize(optWidth, containerSize.width) : containerSize.width
    this.height = optHeight ? parseSize(optHeight, containerSize.height) : containerSize.height

    if (this.width === 0) this.width = 600
    if (this.height === 0) this.height = 400

    this.renderer.setSize(this.width, this.height)
    this.calculateLayout()
  }

  /** 计算布局 */
  private calculateLayout(): void {
    let contentArea: Rect = { x: 20, y: 20, width: this.width - 40, height: this.height - 40 }

    // 标题布局
    if (this.title?.isVisible()) {
      const titleBounds = this.title.layout(contentArea)
      contentArea = {
        ...contentArea,
        y: contentArea.y + titleBounds.height,
        height: contentArea.height - titleBounds.height,
      }
    }

    // 图例布局
    if (this.legend?.isVisible()) {
      const legendBounds = this.legend.layout(contentArea)
      const position = this.legend.getOptions().position ?? 'top'

      if (position === 'top') {
        contentArea = {
          ...contentArea,
          y: contentArea.y + legendBounds.height,
          height: contentArea.height - legendBounds.height,
        }
      } else if (position === 'bottom') {
        contentArea = {
          ...contentArea,
          height: contentArea.height - legendBounds.height,
        }
      }
    }

    // 坐标轴布局
    if (this.xAxis?.isVisible()) {
      const xAxisBounds = this.xAxis.layout(contentArea)
      contentArea = {
        ...contentArea,
        height: contentArea.height - xAxisBounds.height,
      }
    }

    if (this.yAxis?.isVisible()) {
      const yAxisBounds = this.yAxis.layout(contentArea)
      contentArea = {
        ...contentArea,
        x: contentArea.x + yAxisBounds.width,
        width: contentArea.width - yAxisBounds.width,
      }
    }

    // 绑图区域
    this.plotArea = contentArea

    // 更新坐标轴数据范围
    this.updateAxisRange()

    // 设置系列上下文
    this.seriesList.forEach((series, index) => {
      series.processData()
      series.setContext({
        xAxis: this.xAxis ?? undefined,
        yAxis: this.yAxis ?? undefined,
        plotArea: this.plotArea,
        colors: this.colors,
        seriesIndex: index,
      })
    })

    // 提示框布局
    this.tooltip.layout({ x: 0, y: 0, width: this.width, height: this.height })
  }

  /** 更新坐标轴数据范围 */
  private updateAxisRange(): void {
    if (!this.xAxis || !this.yAxis) return

    const allYValues: number[] = []
    const allXValues: (string | number)[] = []

    this.seriesList.forEach(series => {
      series.processData()
      const data = series.getData()

      data.forEach(d => {
        allYValues.push(d.y)
        if (typeof d.x === 'string' || typeof d.x === 'number') {
          allXValues.push(d.x)
        }
      })
    })

    // 设置 X 轴数据
    const xAxisOptions = Array.isArray(this.options.xAxis)
      ? this.options.xAxis[0]
      : this.options.xAxis

    if (xAxisOptions?.type === 'category' || typeof allXValues[0] === 'string') {
      this.xAxis.setOptions({ type: 'category' })
      this.xAxis.setCategoryData([...new Set(allXValues)])
    } else {
      this.xAxis.setDataRange(allXValues.filter((v): v is number => typeof v === 'number'))
    }

    // 设置 Y 轴数据范围
    this.yAxis.setDataRange(allYValues)
  }

  /** 渲染 */
  render(): void {
    if (this.isDisposed) return

    this.renderer.clear()

    // 绘制背景
    if (this.options.backgroundColor) {
      this.renderer.drawRect(
        { x: 0, y: 0, width: this.width, height: this.height },
        { color: this.options.backgroundColor }
      )
    }

    // 绘制标题
    this.title?.render(this.renderer)

    // 绘制图例
    this.legend?.render(this.renderer)

    // 绘制坐标轴
    this.xAxis?.render(this.renderer)
    this.yAxis?.render(this.renderer)

    // 绘制系列
    this.renderer.save()
    this.renderer.setClip(this.plotArea)
    this.seriesList.forEach(series => series.render(this.renderer))
    this.renderer.restore()

    // 绘制提示框
    this.tooltip.render(this.renderer)

    this.emit('rendered', { elapsedTime: 0 })
  }

  /** 更新配置 */
  setOption(options: Partial<ChartOptions>, merge: boolean = true): void {
    if (merge) {
      this.options = deepMerge(this.options, options)
    } else {
      this.options = this.normalizeOptions(options as ChartOptions)
    }

    this.initComponents()
    this.initSeries()
    this.calculateLayout()
    this.render()
  }

  /** 获取配置 */
  getOption(): ChartOptions {
    return this.options
  }

  /** 获取宽度 */
  getWidth(): number {
    return this.width
  }

  /** 获取高度 */
  getHeight(): number {
    return this.height
  }

  /** 销毁 */
  dispose(): void {
    if (this.isDisposed) return

    this.emit('beforeDestroy', undefined as never)

    this.unbindEvents()
    this.resizeObserver?.disconnect()
    this.renderer.dispose()
    super.dispose()

    this.isDisposed = true
  }
}

/**
 * 创建图表实例
 */
export function createChart(
  container: HTMLElement | string,
  options?: ChartOptions
): Chart {
  return new Chart(container, options)
}
