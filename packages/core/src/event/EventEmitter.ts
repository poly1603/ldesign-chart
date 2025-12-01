/**
 * 事件发射器
 */

type EventHandler = (...args: unknown[]) => void

interface EventMap {
  [event: string]: EventHandler[]
}

/**
 * 事件发射器类
 */
export class EventEmitter {
  private events: EventMap = {}

  /**
   * 监听事件
   * @param event - 事件名称
   * @param handler - 事件处理函数
   */
  on(event: string, handler: EventHandler): this {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event]!.push(handler)
    return this
  }

  /**
   * 监听一次事件
   * @param event - 事件名称
   * @param handler - 事件处理函数
   */
  once(event: string, handler: EventHandler): this {
    const onceHandler = (...args: unknown[]): void => {
      handler(...args)
      this.off(event, onceHandler)
    }
    return this.on(event, onceHandler)
  }

  /**
   * 移除事件监听
   * @param event - 事件名称
   * @param handler - 事件处理函数（可选，不传则移除该事件的所有监听）
   */
  off(event: string, handler?: EventHandler): this {
    if (!this.events[event]) {
      return this
    }

    if (!handler) {
      delete this.events[event]
      return this
    }

    const index = this.events[event]!.indexOf(handler)
    if (index > -1) {
      this.events[event]!.splice(index, 1)
    }

    if (this.events[event]!.length === 0) {
      delete this.events[event]
    }

    return this
  }

  /**
   * 触发事件
   * @param event - 事件名称
   * @param args - 事件参数
   */
  emit(event: string, ...args: unknown[]): this {
    if (!this.events[event]) {
      return this
    }

    const handlers = [...this.events[event]!]
    for (const handler of handlers) {
      handler(...args)
    }

    return this
  }

  /**
   * 移除所有事件监听
   */
  removeAllListeners(): this {
    this.events = {}
    return this
  }

  /**
   * 获取事件监听器数量
   * @param event - 事件名称
   */
  listenerCount(event: string): number {
    return this.events[event]?.length ?? 0
  }
}