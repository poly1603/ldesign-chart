/**
 * SmoothAnimator - 高性能流畅动画控制器
 * 提供更流畅的图表动画体验
 * 
 * 特性：
 * - 基于 requestAnimationFrame 的流畅动画
 * - 自动帧率适配
 * - 丰富的缓动函数
 * - 支持中断和暂停
 * - 值插值工具
 */

// ============== 缓动函数 ==============

export type EasingFunction = (t: number) => number

/**
 * 预定义缓动函数集合
 * 所有函数输入输出都在 [0, 1] 范围内
 */
export const SmoothEasings = {
  // 线性
  linear: (t: number): number => t,

  // 二次方
  easeInQuad: (t: number): number => t * t,
  easeOutQuad: (t: number): number => t * (2 - t),
  easeInOutQuad: (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

  // 三次方
  easeInCubic: (t: number): number => t * t * t,
  easeOutCubic: (t: number): number => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

  // 四次方 - 最适合图表动画
  easeInQuart: (t: number): number => t * t * t * t,
  easeOutQuart: (t: number): number => 1 - Math.pow(1 - t, 4),
  easeInOutQuart: (t: number): number =>
    t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,

  // 五次方
  easeOutQuint: (t: number): number => 1 - Math.pow(1 - t, 5),

  // 指数
  easeOutExpo: (t: number): number => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),

  // 正弦
  easeOutSine: (t: number): number => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2,

  // 圆形
  easeOutCirc: (t: number): number => Math.sqrt(1 - Math.pow(t - 1, 2)),

  // 回弹
  easeOutBack: (t: number): number => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  },

  // 弹性
  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  },

  // 弹跳
  easeOutBounce: (t: number): number => {
    const n1 = 7.5625
    const d1 = 2.75
    if (t < 1 / d1) return n1 * t * t
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
    return n1 * (t -= 2.625 / d1) * t + 0.984375
  },

  // 平滑步进（适合图表绘制动画）
  smoothStep: (t: number): number => t * t * (3 - 2 * t),
  smootherStep: (t: number): number => t * t * t * (t * (t * 6 - 15) + 10),
} as const

/**
 * 获取缓动函数
 */
export function getEasingFn(name: string): EasingFunction {
  return (SmoothEasings as Record<string, EasingFunction>)[name] ?? SmoothEasings.easeOutQuart
}

// ============== 动画配置 ==============

export interface SmoothAnimationConfig {
  /** 动画时长 (ms) */
  duration: number
  /** 延迟 (ms) */
  delay?: number
  /** 缓动函数名称或自定义函数 */
  easing?: string | EasingFunction
  /** 动画完成回调 */
  onComplete?: () => void
  /** 每帧回调 */
  onUpdate?: (progress: number) => void
}

export interface AnimatorState {
  /** 当前进度 0-1 */
  progress: number
  /** 是否正在运行 */
  running: boolean
  /** 是否已暂停 */
  paused: boolean
  /** 是否已完成 */
  completed: boolean
}

// ============== SmoothAnimator 类 ==============

export class SmoothAnimator {
  private rafId: number | null = null
  private startTime = 0
  private pauseTime = 0
  private pausedDuration = 0
  private disposed = false

  private config: Required<SmoothAnimationConfig>
  private state: AnimatorState = {
    progress: 0,
    running: false,
    paused: false,
    completed: false,
  }

  private renderCallback: (progress: number, deltaTime: number) => void
  private lastFrameTime = 0

  constructor(
    renderCallback: (progress: number, deltaTime: number) => void,
    config: SmoothAnimationConfig
  ) {
    this.renderCallback = renderCallback
    this.config = {
      duration: config.duration,
      delay: config.delay ?? 0,
      easing: config.easing ?? 'easeOutQuart',
      onComplete: config.onComplete ?? (() => { }),
      onUpdate: config.onUpdate ?? (() => { }),
    }
  }

  /**
   * 获取当前状态
   */
  getState(): AnimatorState {
    return { ...this.state }
  }

  /**
   * 获取当前进度
   */
  getProgress(): number {
    return this.state.progress
  }

  /**
   * 是否正在运行
   */
  isRunning(): boolean {
    return this.state.running && !this.state.paused
  }

  /**
   * 开始动画
   */
  start(): void {
    if (this.disposed) return

    this.cancel()
    this.state = {
      progress: 0,
      running: true,
      paused: false,
      completed: false,
    }
    this.startTime = performance.now()
    this.lastFrameTime = this.startTime
    this.pausedDuration = 0

    this.animate(this.startTime)
  }

  /**
   * 暂停动画
   */
  pause(): void {
    if (!this.state.running || this.state.paused) return

    this.state.paused = true
    this.pauseTime = performance.now()

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  /**
   * 恢复动画
   */
  resume(): void {
    if (!this.state.running || !this.state.paused || this.disposed) return

    this.state.paused = false
    this.pausedDuration += performance.now() - this.pauseTime
    this.lastFrameTime = performance.now()

    this.animate(performance.now())
  }

  /**
   * 取消动画
   */
  cancel(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }

    this.state = {
      progress: this.state.progress,
      running: false,
      paused: false,
      completed: false,
    }
  }

  /**
   * 立即完成
   */
  finish(): void {
    this.cancel()
    this.state.progress = 1
    this.state.completed = true
    this.renderCallback(1, 0)
    this.config.onUpdate?.(1)
    this.config.onComplete?.()
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<SmoothAnimationConfig>): void {
    Object.assign(this.config, config)
  }

  /**
   * 销毁
   */
  dispose(): void {
    this.disposed = true
    this.cancel()
  }

  /**
   * 动画循环
   */
  private animate = (currentTime: number): void => {
    if (this.disposed || !this.state.running || this.state.paused) return

    const elapsed = currentTime - this.startTime - this.pausedDuration - this.config.delay

    // 延迟期间
    if (elapsed < 0) {
      this.rafId = requestAnimationFrame(this.animate)
      return
    }

    // 计算原始进度
    const rawProgress = Math.min(elapsed / this.config.duration, 1)

    // 应用缓动
    const easingFn = typeof this.config.easing === 'function'
      ? this.config.easing
      : getEasingFn(this.config.easing)

    this.state.progress = easingFn(rawProgress)

    // 计算帧间隔
    const deltaTime = currentTime - this.lastFrameTime
    this.lastFrameTime = currentTime

    // 调用渲染回调
    this.renderCallback(this.state.progress, deltaTime)
    this.config.onUpdate?.(this.state.progress)

    // 继续或完成
    if (rawProgress < 1) {
      this.rafId = requestAnimationFrame(this.animate)
    } else {
      this.state.progress = 1
      this.state.running = false
      this.state.completed = true
      this.rafId = null
      this.config.onComplete?.()
    }
  }
}

// ============== 值插值工具 ==============

/**
 * 数值插值
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

/**
 * 带缓动的数值插值
 */
export function lerpEased(
  start: number,
  end: number,
  t: number,
  easing: string | EasingFunction = 'easeOutQuart'
): number {
  const easingFn = typeof easing === 'function' ? easing : getEasingFn(easing)
  return lerp(start, end, easingFn(t))
}

/**
 * 颜色插值 (支持 hex 和 rgb)
 */
export function lerpColor(startColor: string, endColor: string, t: number): string {
  const start = parseColor(startColor)
  const end = parseColor(endColor)

  const r = Math.round(lerp(start.r, end.r, t))
  const g = Math.round(lerp(start.g, end.g, t))
  const b = Math.round(lerp(start.b, end.b, t))
  const a = lerp(start.a, end.a, t)

  return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})` : `rgb(${r}, ${g}, ${b})`
}

/**
 * 点位置插值
 */
export function lerpPoint(
  start: { x: number; y: number },
  end: { x: number; y: number },
  t: number
): { x: number; y: number } {
  return {
    x: lerp(start.x, end.x, t),
    y: lerp(start.y, end.y, t),
  }
}

/**
 * 数组插值
 */
export function lerpArray(start: number[], end: number[], t: number): number[] {
  const result: number[] = []
  const length = Math.max(start.length, end.length)

  for (let i = 0; i < length; i++) {
    const startVal = start[i] ?? end[i] ?? 0
    const endVal = end[i] ?? start[i] ?? 0
    result.push(lerp(startVal, endVal, t))
  }

  return result
}

/**
 * 解析颜色为 RGBA
 */
function parseColor(color: string): { r: number; g: number; b: number; a: number } {
  // HEX 格式
  if (color.startsWith('#')) {
    let hex = color.slice(1)
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('')
    }
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
    }
  }

  // RGB/RGBA 格式
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]!, 10),
      g: parseInt(rgbMatch[2]!, 10),
      b: parseInt(rgbMatch[3]!, 10),
      a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1,
    }
  }

  // 默认返回黑色
  return { r: 0, g: 0, b: 0, a: 1 }
}

// ============== 图表专用动画工具 ==============

/**
 * 计算生长动画的 Y 坐标
 */
export function animateGrowY(targetY: number, baseY: number, progress: number): number {
  return baseY - (baseY - targetY) * progress
}

/**
 * 计算扩展动画的角度（饼图）
 */
export function animateExpandAngle(
  startAngle: number,
  endAngle: number,
  progress: number
): { start: number; end: number } {
  const midAngle = (startAngle + endAngle) / 2
  const halfAngle = ((endAngle - startAngle) / 2) * progress
  return {
    start: midAngle - halfAngle,
    end: midAngle + halfAngle,
  }
}

/**
 * 计算扩展动画的半径（饼图）
 */
export function animateExpandRadius(targetRadius: number, progress: number): number {
  return targetRadius * progress
}

/**
 * 计算绘制线条动画的可见点数
 */
export function animateDrawLinePoints<T>(
  points: T[],
  progress: number,
  minPoints: number = 2
): T[] {
  if (points.length <= minPoints) return points
  const visibleCount = Math.max(minPoints, Math.ceil(points.length * progress))
  return points.slice(0, visibleCount)
}

/**
 * 计算缩放动画的尺寸
 */
export function animateScale(
  targetSize: number,
  progress: number,
  minScale: number = 0
): number {
  return targetSize * lerp(minScale, 1, progress)
}

/**
 * 计算淡入动画的透明度
 */
export function animateFadeIn(targetOpacity: number, progress: number): number {
  return targetOpacity * progress
}

/**
 * 计算交错动画中单个项目的进度
 */
export function getStaggerProgress(
  index: number,
  totalItems: number,
  globalProgress: number,
  staggerRatio: number = 0.3
): number {
  if (totalItems <= 1) return globalProgress

  // staggerRatio 决定每个项目开始时间的错开程度
  const itemDuration = 1 / (1 + staggerRatio * (totalItems - 1))
  const itemStart = (index / (totalItems - 1)) * staggerRatio * (1 - itemDuration)
  const itemEnd = itemStart + itemDuration

  if (globalProgress <= itemStart) return 0
  if (globalProgress >= itemEnd) return 1
  return (globalProgress - itemStart) / itemDuration
}

// ============== 动画编排器 ==============

export interface AnimationSequenceItem {
  animator: SmoothAnimator
  startAt?: number  // 相对于序列开始的时间 (ms)
}

export class AnimationSequence {
  private items: AnimationSequenceItem[] = []
  private running = false
  private startTime = 0
  private rafId: number | null = null
  private onComplete?: () => void

  /**
   * 添加动画到序列
   */
  add(animator: SmoothAnimator, startAt: number = 0): this {
    this.items.push({ animator, startAt })
    return this
  }

  /**
   * 开始序列
   */
  start(onComplete?: () => void): void {
    this.onComplete = onComplete
    this.running = true
    this.startTime = performance.now()
    this.tick(this.startTime)
  }

  /**
   * 停止序列
   */
  stop(): void {
    this.running = false
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.items.forEach(item => item.animator.cancel())
  }

  private tick = (currentTime: number): void => {
    if (!this.running) return

    const elapsed = currentTime - this.startTime
    let allCompleted = true

    this.items.forEach(item => {
      const state = item.animator.getState()

      // 检查是否应该启动
      if (!state.running && !state.completed && elapsed >= (item.startAt ?? 0)) {
        item.animator.start()
      }

      // 检查是否全部完成
      if (!state.completed) {
        allCompleted = false
      }
    })

    if (allCompleted) {
      this.running = false
      this.rafId = null
      this.onComplete?.()
    } else {
      this.rafId = requestAnimationFrame(this.tick)
    }
  }
}
