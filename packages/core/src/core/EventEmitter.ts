/**
 * 事件发射器 - 提供事件订阅和发布能力
 */

export type EventCallback<T = unknown> = (data: T) => void

interface EventListener<T = unknown> {
  callback: EventCallback<T>
  once: boolean
  context?: unknown
}

/**
 * 事件发射器类
 */
export class EventEmitter<EventMap extends Record<string, unknown> = Record<string, unknown>> {
  private listeners = new Map<keyof EventMap, Set<EventListener<unknown>>>()

  /** 订阅事件 */
  on<K extends keyof EventMap>(
    event: K,
    callback: EventCallback<EventMap[K]>,
    context?: unknown
  ): () => void {
    return this.addListener(event, callback, false, context)
  }

  /** 订阅事件（只触发一次） */
  once<K extends keyof EventMap>(
    event: K,
    callback: EventCallback<EventMap[K]>,
    context?: unknown
  ): () => void {
    return this.addListener(event, callback, true, context)
  }

  /** 取消订阅事件 */
  off<K extends keyof EventMap>(event: K, callback?: EventCallback<EventMap[K]>): void {
    const listeners = this.listeners.get(event)
    if (!listeners) return

    if (callback) {
      for (const listener of listeners) {
        if (listener.callback === callback) {
          listeners.delete(listener)
          break
        }
      }
      if (listeners.size === 0) this.listeners.delete(event)
    } else {
      this.listeners.delete(event)
    }
  }

  /** 发布事件 */
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    const listeners = this.listeners.get(event)
    if (!listeners) return

    const toRemove: EventListener<unknown>[] = []

    for (const listener of listeners) {
      try {
        const cb = listener.context ? listener.callback.bind(listener.context) : listener.callback
        cb(data)
        if (listener.once) toRemove.push(listener)
      } catch (error) {
        console.error(`Event "${String(event)}" error:`, error)
      }
    }

    for (const listener of toRemove) {
      listeners.delete(listener)
    }
    if (listeners.size === 0) this.listeners.delete(event)
  }

  /** 检查是否有事件监听器 */
  hasListeners<K extends keyof EventMap>(event: K): boolean {
    return (this.listeners.get(event)?.size ?? 0) > 0
  }

  /** 移除所有事件监听器 */
  removeAllListeners<K extends keyof EventMap>(event?: K): void {
    if (event !== undefined) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }

  /** 销毁 */
  dispose(): void {
    this.removeAllListeners()
  }

  private addListener<K extends keyof EventMap>(
    event: K,
    callback: EventCallback<EventMap[K]>,
    once: boolean,
    context?: unknown
  ): () => void {
    let listeners = this.listeners.get(event)
    if (!listeners) {
      listeners = new Set()
      this.listeners.set(event, listeners)
    }

    const listener: EventListener<unknown> = {
      callback: callback as EventCallback<unknown>,
      once,
      context,
    }
    listeners.add(listener)

    return () => {
      listeners?.delete(listener)
      if (listeners?.size === 0) this.listeners.delete(event)
    }
  }
}
