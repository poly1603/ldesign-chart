/**
 * 图表动画工具模块
 * 提供可复用的动画功能，适用于所有图表类型
 */

// ============== 动画类型定义 ==============

/**
 * 入场动画类型
 */
export type EntryAnimationType =
  | 'grow'           // 从底部/中心生长（默认）
  | 'fadeIn'         // 淡入
  | 'scaleIn'        // 从中心缩放
  | 'slideLeft'      // 从左滑入
  | 'slideRight'     // 从右滑入
  | 'slideUp'        // 从下滑入
  | 'slideDown'      // 从上滑入
  | 'drawLine'       // 线条绘制效果（适用于折线图）
  | 'pointByPoint'   // 逐点/逐项出现
  | 'waveIn'         // 波浪效果
  | 'expand'         // 展开效果（适用于饼图）
  | 'none'           // 无动画

/**
 * 更新动画类型
 */
export type UpdateAnimationType =
  | 'morph'          // 形态过渡（默认）
  | 'fadeTransition' // 淡入淡出过渡
  | 'none'           // 无动画

/**
 * 动画配置
 */
export interface AnimationConfig {
  /** 是否启用动画 */
  enabled?: boolean
  /** 入场动画类型 */
  entryType?: EntryAnimationType
  /** 更新动画类型 */
  updateType?: UpdateAnimationType
  /** 入场动画时长（毫秒） */
  entryDuration?: number
  /** 更新动画时长（毫秒） */
  updateDuration?: number
  /** 入场动画延迟（毫秒） */
  entryDelay?: number
  /** 缓动函数名称 */
  easing?: string
  /** 是否按数据点依次动画 */
  stagger?: boolean
  /** 依次动画的间隔（毫秒） */
  staggerDelay?: number
}

/**
 * 默认动画配置
 */
export const DEFAULT_ANIMATION_CONFIG: Required<AnimationConfig> = {
  enabled: true,
  entryType: 'grow',
  updateType: 'morph',
  entryDuration: 800,
  updateDuration: 400,
  entryDelay: 0,
  easing: 'easeOutQuart',
  stagger: false,
  staggerDelay: 30,
}

// ============== 缓动函数 ==============

export type EasingFn = (t: number) => number

export const easingFns: Record<string, EasingFn> = {
  linear: (t) => t,

  // 二次
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  // 三次
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),

  // 四次
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
  easeInOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),

  // 弹性
  easeOutElastic: (t) => {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  },

  // 回弹
  easeOutBack: (t) => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  },

  // 弹跳
  easeOutBounce: (t) => {
    const n1 = 7.5625, d1 = 2.75
    if (t < 1 / d1) return n1 * t * t
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
    return n1 * (t -= 2.625 / d1) * t + 0.984375
  },
}

export function getEasing(name: string): EasingFn {
  return easingFns[name] || easingFns.easeOutQuart!
}

// ============== 动画控制器 ==============

export interface AnimationState {
  /** 入场动画进度 0-1 */
  entryProgress: number
  /** 更新动画进度 0-1 */
  updateProgress: number
  /** 是否正在入场动画 */
  isEntering: boolean
  /** 是否正在更新动画 */
  isUpdating: boolean
  /** 动画帧 ID */
  rafId: number | null
}

/**
 * 图表动画控制器
 * 可被所有图表类型复用
 */
export class ChartAnimationController {
  private state: AnimationState = {
    entryProgress: 1,
    updateProgress: 1,
    isEntering: false,
    isUpdating: false,
    rafId: null,
  }

  private config: Required<AnimationConfig>
  private onRender: () => void
  private startTime = 0
  private disposed = false

  constructor(
    config: AnimationConfig | boolean | undefined,
    onRender: () => void
  ) {
    this.config = this.parseConfig(config)
    this.onRender = onRender
  }

  /**
   * 解析动画配置
   */
  private parseConfig(config: AnimationConfig | boolean | undefined): Required<AnimationConfig> {
    if (typeof config === 'boolean') {
      return { ...DEFAULT_ANIMATION_CONFIG, enabled: config }
    }
    if (typeof config === 'object') {
      return { ...DEFAULT_ANIMATION_CONFIG, ...config }
    }
    return { ...DEFAULT_ANIMATION_CONFIG }
  }

  /**
   * 更新配置
   */
  updateConfig(config: AnimationConfig | boolean | undefined): void {
    this.config = this.parseConfig(config)
  }

  /**
   * 获取配置
   */
  getConfig(): Required<AnimationConfig> {
    return this.config
  }

  /**
   * 获取入场动画进度
   */
  getEntryProgress(): number {
    return this.state.entryProgress
  }

  /**
   * 获取更新动画进度
   */
  getUpdateProgress(): number {
    return this.state.updateProgress
  }

  /**
   * 是否正在入场动画
   */
  isEntering(): boolean {
    return this.state.isEntering
  }

  /**
   * 是否正在更新动画
   */
  isUpdating(): boolean {
    return this.state.isUpdating
  }

  /**
   * 是否启用动画
   */
  isEnabled(): boolean {
    return this.config.enabled
  }

  /**
   * 启动入场动画
   */
  startEntryAnimation(): void {
    if (!this.config.enabled || this.config.entryType === 'none') {
      this.state.entryProgress = 1
      this.onRender()
      return
    }

    this.cancelAnimation()
    this.state.entryProgress = 0
    this.state.isEntering = true
    this.state.isUpdating = false
    this.startTime = performance.now()

    const animate = (currentTime: number) => {
      if (this.disposed) return

      const elapsed = currentTime - this.startTime - this.config.entryDelay
      if (elapsed < 0) {
        this.state.rafId = requestAnimationFrame(animate)
        return
      }

      const rawProgress = Math.min(elapsed / this.config.entryDuration, 1)
      const easing = getEasing(this.config.easing)
      this.state.entryProgress = easing(rawProgress)

      this.onRender()

      if (rawProgress < 1) {
        this.state.rafId = requestAnimationFrame(animate)
      } else {
        this.state.entryProgress = 1
        this.state.isEntering = false
        this.state.rafId = null
      }
    }

    this.state.rafId = requestAnimationFrame(animate)
  }

  /**
   * 启动更新动画
   */
  startUpdateAnimation(): void {
    if (!this.config.enabled || this.config.updateType === 'none') {
      this.state.updateProgress = 1
      this.onRender()
      return
    }

    this.cancelAnimation()
    this.state.updateProgress = 0
    this.state.isUpdating = true
    this.state.isEntering = false
    this.startTime = performance.now()

    const animate = (currentTime: number) => {
      if (this.disposed) return

      const elapsed = currentTime - this.startTime
      const rawProgress = Math.min(elapsed / this.config.updateDuration, 1)
      const easing = getEasing(this.config.easing)
      this.state.updateProgress = easing(rawProgress)

      this.onRender()

      if (rawProgress < 1) {
        this.state.rafId = requestAnimationFrame(animate)
      } else {
        this.state.updateProgress = 1
        this.state.isUpdating = false
        this.state.rafId = null
      }
    }

    this.state.rafId = requestAnimationFrame(animate)
  }

  /**
   * 取消动画
   */
  cancelAnimation(): void {
    if (this.state.rafId !== null) {
      cancelAnimationFrame(this.state.rafId)
      this.state.rafId = null
    }
    this.state.isEntering = false
    this.state.isUpdating = false
  }

  /**
   * 完成动画（立即跳到结束状态）
   */
  finishAnimation(): void {
    this.cancelAnimation()
    this.state.entryProgress = 1
    this.state.updateProgress = 1
    this.onRender()
  }

  /**
   * 销毁
   */
  dispose(): void {
    this.disposed = true
    this.cancelAnimation()
  }
}

// ============== 动画值计算工具 ==============

/**
 * 计算入场动画的 Y 值（从底部生长效果）
 */
export function animateGrowY(
  targetY: number,
  baseY: number,
  progress: number
): number {
  return baseY - (baseY - targetY) * progress
}

/**
 * 计算更新动画的值（从旧值过渡到新值）
 */
export function animateMorph(
  oldValue: number,
  newValue: number,
  progress: number
): number {
  return oldValue + (newValue - oldValue) * progress
}

/**
 * 计算逐点动画的进度
 */
export function getPointProgress(
  index: number,
  totalPoints: number,
  globalProgress: number,
  stagger: boolean,
  staggerDelay: number,
  duration: number
): number {
  if (!stagger) return globalProgress

  const elapsed = globalProgress * (duration + (totalPoints - 1) * staggerDelay)
  const itemStart = index * staggerDelay
  const itemEnd = itemStart + duration

  if (elapsed < itemStart) return 0
  if (elapsed >= itemEnd) return 1
  return (elapsed - itemStart) / duration
}

/**
 * 计算缩放动画的值
 */
export function animateScale(
  progress: number,
  centerX: number,
  centerY: number,
  x: number,
  y: number
): { x: number; y: number } {
  return {
    x: centerX + (x - centerX) * progress,
    y: centerY + (y - centerY) * progress,
  }
}

/**
 * 计算透明度动画
 */
export function animateOpacity(progress: number): number {
  return progress
}
