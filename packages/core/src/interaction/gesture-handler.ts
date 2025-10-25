/**
 * 移动端手势支持
 * 支持：双指缩放、双指旋转、滑动浏览、长按交互
 */

import type { EChartsInstance } from '../types';

export interface GestureOptions {
  /** 是否启用缩放 */
  enableZoom?: boolean;
  /** 是否启用旋转 */
  enableRotate?: boolean;
  /** 是否启用滑动 */
  enableSwipe?: boolean;
  /** 是否启用长按 */
  enableLongPress?: boolean;
  /** 长按触发时间（毫秒） */
  longPressDelay?: number;
  /** 最小缩放比例 */
  minZoom?: number;
  /** 最大缩放比例 */
  maxZoom?: number;
  /** 缩放灵敏度 */
  zoomSensitivity?: number;
}

export interface Touch {
  x: number;
  y: number;
  identifier: number;
}

export interface GestureEvent {
  type: 'zoom' | 'rotate' | 'swipe' | 'longpress' | 'tap';
  scale?: number;
  rotation?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  position?: { x: number; y: number };
}

export type GestureCallback = (event: GestureEvent) => void;

/**
 * 手势处理器
 */
export class GestureHandler {
  private container: HTMLElement;
  private chart: EChartsInstance;
  private options: Required<GestureOptions>;
  private callbacks: GestureCallback[] = [];

  // 触摸状态
  private touches: Touch[] = [];
  private lastDistance = 0;
  private lastAngle = 0;
  private lastCenter = { x: 0, y: 0 };
  private longPressTimer?: ReturnType<typeof setTimeout>;
  private currentZoom = 1;

  constructor(
    chart: EChartsInstance,
    container: HTMLElement,
    options: GestureOptions = {}
  ) {
    this.chart = chart;
    this.container = container;
    this.options = {
      enableZoom: options.enableZoom !== false,
      enableRotate: options.enableRotate !== false,
      enableSwipe: options.enableSwipe !== false,
      enableLongPress: options.enableLongPress !== false,
      longPressDelay: options.longPressDelay || 500,
      minZoom: options.minZoom || 0.5,
      maxZoom: options.maxZoom || 3,
      zoomSensitivity: options.zoomSensitivity || 1,
    };

    this.bindEvents();
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    this.container.addEventListener('touchstart', this.handleTouchStart);
    this.container.addEventListener('touchmove', this.handleTouchMove);
    this.container.addEventListener('touchend', this.handleTouchEnd);
    this.container.addEventListener('touchcancel', this.handleTouchEnd);
  }

  /**
   * 解绑事件
   */
  private unbindEvents(): void {
    this.container.removeEventListener('touchstart', this.handleTouchStart);
    this.container.removeEventListener('touchmove', this.handleTouchMove);
    this.container.removeEventListener('touchend', this.handleTouchEnd);
    this.container.removeEventListener('touchcancel', this.handleTouchEnd);
  }

  /**
   * 触摸开始
   */
  private handleTouchStart = (e: TouchEvent): void => {
    this.clearLongPressTimer();

    // 记录触摸点
    this.touches = Array.from(e.touches).map(touch => ({
      x: touch.clientX,
      y: touch.clientY,
      identifier: touch.identifier,
    }));

    if (this.touches.length === 1 && this.options.enableLongPress) {
      // 启动长按计时器
      this.longPressTimer = setTimeout(() => {
        this.emit({
          type: 'longpress',
          position: this.touches[0],
        });
      }, this.options.longPressDelay);
    } else if (this.touches.length === 2) {
      // 双指操作
      this.lastDistance = this.getDistance(this.touches[0], this.touches[1]);
      this.lastAngle = this.getAngle(this.touches[0], this.touches[1]);
      this.lastCenter = this.getCenter(this.touches[0], this.touches[1]);
    }
  };

  /**
   * 触摸移动
   */
  private handleTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    this.clearLongPressTimer();

    // 更新触摸点
    this.touches = Array.from(e.touches).map(touch => ({
      x: touch.clientX,
      y: touch.clientY,
      identifier: touch.identifier,
    }));

    if (this.touches.length === 2) {
      // 双指操作
      this.handleTwoFingerGesture();
    } else if (this.touches.length === 1 && this.options.enableSwipe) {
      // 单指滑动
      this.handleSwipe();
    }
  };

  /**
   * 触摸结束
   */
  private handleTouchEnd = (e: TouchEvent): void => {
    this.clearLongPressTimer();

    if (e.touches.length === 0) {
      // 所有手指都离开
      if (this.touches.length === 1) {
        // 单击
        this.emit({
          type: 'tap',
          position: this.touches[0],
        });
      }

      this.touches = [];
      this.lastDistance = 0;
      this.lastAngle = 0;
    } else {
      // 更新触摸点
      this.touches = Array.from(e.touches).map(touch => ({
        x: touch.clientX,
        y: touch.clientY,
        identifier: touch.identifier,
      }));
    }
  };

  /**
   * 处理双指手势
   */
  private handleTwoFingerGesture(): void {
    if (this.touches.length !== 2) return;

    const distance = this.getDistance(this.touches[0], this.touches[1]);
    const angle = this.getAngle(this.touches[0], this.touches[1]);
    const center = this.getCenter(this.touches[0], this.touches[1]);

    // 缩放
    if (this.options.enableZoom && this.lastDistance > 0) {
      const scale = (distance / this.lastDistance) * this.options.zoomSensitivity;
      const newZoom = this.currentZoom * scale;

      if (newZoom >= this.options.minZoom && newZoom <= this.options.maxZoom) {
        this.currentZoom = newZoom;
        this.emit({
          type: 'zoom',
          scale: newZoom,
          position: center,
        });

        this.applyZoom(newZoom);
      }
    }

    // 旋转
    if (this.options.enableRotate && this.lastAngle !== 0) {
      const rotation = angle - this.lastAngle;

      if (Math.abs(rotation) > 2) {
        // 避免微小旋转
        this.emit({
          type: 'rotate',
          rotation,
          position: center,
        });
      }
    }

    this.lastDistance = distance;
    this.lastAngle = angle;
    this.lastCenter = center;
  }

  /**
   * 处理滑动
   */
  private handleSwipe(): void {
    if (this.touches.length !== 1) return;

    const current = this.touches[0];
    const deltaX = current.x - this.lastCenter.x;
    const deltaY = current.y - this.lastCenter.y;

    if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
      let direction: 'left' | 'right' | 'up' | 'down';

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      this.emit({
        type: 'swipe',
        direction,
        position: current,
      });

      this.lastCenter = current;
    }
  }

  /**
   * 应用缩放到图表
   */
  private applyZoom(scale: number): void {
    // 使用 ECharts 的 dataZoom 来实现缩放效果
    const range = 100 / scale;
    const center = 50;
    const start = Math.max(0, center - range / 2);
    const end = Math.min(100, center + range / 2);

    this.chart.dispatchAction({
      type: 'dataZoom',
      start,
      end,
    });
  }

  /**
   * 计算两点距离
   */
  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch2.x - touch1.x;
    const dy = touch2.y - touch1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 计算两点角度
   */
  private getAngle(touch1: Touch, touch2: Touch): number {
    const dx = touch2.x - touch1.x;
    const dy = touch2.y - touch1.y;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  }

  /**
   * 计算两点中心
   */
  private getCenter(touch1: Touch, touch2: Touch): { x: number; y: number } {
    return {
      x: (touch1.x + touch2.x) / 2,
      y: (touch1.y + touch2.y) / 2,
    };
  }

  /**
   * 清除长按计时器
   */
  private clearLongPressTimer(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = undefined;
    }
  }

  /**
   * 订阅手势事件
   */
  on(callback: GestureCallback): () => void {
    this.callbacks.push(callback);

    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * 触发事件
   */
  private emit(event: GestureEvent): void {
    this.callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Gesture callback error:', error);
      }
    });
  }

  /**
   * 重置缩放
   */
  resetZoom(): void {
    this.currentZoom = 1;
    this.chart.dispatchAction({
      type: 'dataZoom',
      start: 0,
      end: 100,
    });
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.unbindEvents();
    this.clearLongPressTimer();
    this.callbacks = [];
  }
}

/**
 * 创建手势处理器（便捷方法）
 */
export function enableGestures(
  chart: EChartsInstance,
  container: HTMLElement,
  options?: GestureOptions
): GestureHandler {
  return new GestureHandler(chart, container, options);
}

