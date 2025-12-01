/**
 * 图表核心类
 */

import type { ChartOption, ChartInitOptions } from '../types'
import type { IRenderer } from '../renderer/interface'
import { EventEmitter } from '../event/EventEmitter'
import { generateId, getElementSize, isString } from '../util'

/**
 * 图表类
 */
export class Chart extends EventEmitter {
  private container: HTMLElement
  private renderer: IRenderer | null = null
  private option: ChartOption = {}
  private readonly id: string
  private width = 0
  private height = 0
  private disposed = false

  /**
   * 构造函数
   * @param container - 容器元素或选择器
   * @param options - 初始化选项
   */
  constructor(container: HTMLElement | string, options: ChartInitOptions = {}) {
    super()

    // 解析容器
    if (isString(container)) {
      const element = document.querySelector(container)
      if (!element || !(element instanceof HTMLElement)) {
        throw new Error(`Cannot find container: ${container}`)
      }
      this.container = element
    } else {
      this.container = container
    }

    this.id = generateId('chart')

    // 初始化尺寸
    const size = getElementSize(this.container)
    this.width = options.width ?? size.width
    this.height = options.height ?? size.height

    // 初始化渲染器（暂时占位，后续会实现）
    this.initRenderer(options.renderer ?? 'canvas')

    // 监听窗口大小变化
    this.setupResizeObserver()
  }

  /**
   * 初始化渲染器
   */
  private initRenderer(type: 'canvas' | 'svg' | 'webgl'): void {
    // TODO: 实现渲染器工厂，根据类型创建对应的渲染器
    // 暂时留空，等待渲染器实现
    console.warn(`Renderer type "${type}" will be implemented soon`)
  }

  /**
   * 设置图表配置
   * @param option - 图表配置
   */
  setOption(option: ChartOption): void {
    if (this.disposed) {
      throw new Error('Chart has been disposed')
    }

    // 合并配置
    this.option = { ...this.option, ...option }

    // 触发配置更新事件
    this.emit('optionChanged', this.option)

    // 执行渲染
    this.render()
  }

  /**
   * 获取当前配置
   */
  getOption(): ChartOption {
    return { ...this.option }
  }

  /**
   * 渲染图表
   */
  private render(): void {
    if (!this.renderer) {
      console.warn('Renderer not initialized')
      return
    }

    // 清空画布
    this.renderer.clear()

    // TODO: 实现图表渲染逻辑
    // 1. 解析配置
    // 2. 计算布局
    // 3. 渲染各个组件
    // 4. 渲染系列数据

    // 触发渲染完成事件
    this.emit('rendered')
  }

  /**
   * 调整图表大小
   * @param width - 新宽度（可选）
   * @param height - 新高度（可选）
   */
  resize(width?: number, height?: number): void {
    if (this.disposed) {
      return
    }

    // 如果没有指定尺寸，使用容器尺寸
    if (width === undefined || height === undefined) {
      const size = getElementSize(this.container)
      width = size.width
      height = size.height
    }

    this.width = width
    this.height = height

    if (this.renderer) {
      this.renderer.resize(width, height)
    }

    // 触发大小变化事件
    this.emit('resize', { width, height })

    // 重新渲染
    this.render()
  }

  /**
   * 销毁图表
   */
  dispose(): void {
    if (this.disposed) {
      return
    }

    // 销毁渲染器
    if (this.renderer) {
      this.renderer.dispose()
      this.renderer = null
    }

    // 移除所有事件监听
    this.removeAllListeners()

    // 清空配置
    this.option = {}

    this.disposed = true

    // 触发销毁事件
    this.emit('disposed')
  }

  /**
   * 获取图表 ID
   */
  getId(): string {
    return this.id
  }

  /**
   * 获取容器元素
   */
  getContainer(): HTMLElement {
    return this.container
  }

  /**
   * 获取图表宽度
   */
  getWidth(): number {
    return this.width
  }

  /**
   * 获取图表高度
   */
  getHeight(): number {
    return this.height
  }

  /**
   * 检查是否已销毁
   */
  isDisposed(): boolean {
    return this.disposed
  }

  /**
   * 设置监听容器大小变化
   */
  private setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') {
      // 浏览器不支持 ResizeObserver，使用 window resize 事件
      window.addEventListener('resize', () => this.resize())
      return
    }

    const observer = new ResizeObserver(() => {
      this.resize()
    })

    observer.observe(this.container)

    // 在销毁时清理观察器
    this.once('disposed', () => {
      observer.disconnect()
    })
  }
}