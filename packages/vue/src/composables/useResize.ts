/**
 * useResize - 响应式大小 Composable
 */

import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'

export interface UseResizeOptions {
  /** 防抖延迟 */
  debounce?: number
}

export interface UseResizeReturn {
  /** 宽度 */
  width: Ref<number>
  /** 高度 */
  height: Ref<number>
}

/**
 * 响应式监听元素大小变化
 */
export function useResize(
  elementRef: Ref<HTMLElement | null>,
  options: UseResizeOptions = {}
): UseResizeReturn {
  const { debounce: debounceDelay = 100 } = options

  const width = ref(0)
  const height = ref(0)

  let resizeObserver: ResizeObserver | null = null
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const updateSize = (entries: ResizeObserverEntry[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect
        width.value = w
        height.value = h
      }
    }, debounceDelay)
  }

  onMounted(() => {
    if (!elementRef.value) return

    // 初始化尺寸
    const rect = elementRef.value.getBoundingClientRect()
    width.value = rect.width
    height.value = rect.height

    // 监听大小变化
    resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(elementRef.value)
  })

  onBeforeUnmount(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    resizeObserver?.disconnect()
  })

  return {
    width,
    height,
  }
}
