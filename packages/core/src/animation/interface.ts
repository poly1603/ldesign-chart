/**
 * 动画系统接口定义
 */

/**
 * 缓动函数类型
 */
export type EasingFunction = (t: number) => number

/**
 * 动画配置选项
 */
export interface AnimationOptions {
  /** 动画时长（毫秒） */
  duration?: number
  /** 缓动函数 */
  easing?: string | EasingFunction
  /** 延迟（毫秒） */
  delay?: number
  /** 循环次数，-1 表示无限循环 */
  loop?: number | boolean
  /** 动画结束回调 */
  onComplete?: () => void
  /** 动画更新回调 */
  onUpdate?: (progress: number) => void
}

/**
 * 动画状态
 */
export enum AnimationState {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}

/**
 * 动画接口
 */
export interface IAnimation {
  /** 动画ID */
  id: string
  /** 动画状态 */
  state: AnimationState
  /** 开始动画 */
  start(): void
  /** 暂停动画 */
  pause(): void
  /** 恢复动画 */
  resume(): void
  /** 停止动画 */
  stop(): void
  /** 更新动画 */
  update(deltaTime: number): void
}

/**
 * 动画管理器接口
 */
export interface IAnimationManager {
  /** 创建动画 */
  create(options: AnimationOptions): IAnimation
  /** 添加动画 */
  add(animation: IAnimation): void
  /** 移除动画 */
  remove(animationId: string): void
  /** 清除所有动画 */
  clear(): void
  /** 更新所有动画 */
  update(deltaTime: number): void
  /** 暂停所有动画 */
  pauseAll(): void
  /** 恢复所有动画 */
  resumeAll(): void
  /** 停止所有动画 */
  stopAll(): void
}

/**
 * 属性动画配置
 */
export interface PropertyAnimationOptions extends AnimationOptions {
  /** 目标对象 */
  target: Record<string, unknown>
  /** 属性名 */
  property: string
  /** 起始值 */
  from: number
  /** 结束值 */
  to: number
}

/**
 * 关键帧
 */
export interface Keyframe {
  /** 时间点（0-1） */
  time: number
  /** 值 */
  value: number
  /** 缓动函数 */
  easing?: string | EasingFunction
}

/**
 * 多属性关键帧
 */
export interface MultiKeyframe {
  /** 时间点（0-1） */
  time: number
  /** 属性值映射 */
  values: Record<string, number>
  /** 缓动函数 */
  easing?: string | EasingFunction
}

/**
 * 关键帧动画配置
 */
export interface KeyframeAnimationOptions extends AnimationOptions {
  /** 目标对象 */
  target: Record<string, unknown>
  /** 属性名 */
  property: string
  /** 关键帧列表 */
  keyframes: Keyframe[]
}

/**
 * 多属性关键帧动画配置
 */
export interface MultiKeyframeAnimationOptions extends Omit<AnimationOptions, 'onUpdate'> {
  /** 关键帧列表 */
  keyframes: MultiKeyframe[]
  /** 动画更新回调 */
  onUpdate?: (values: Record<string, number>) => void
}