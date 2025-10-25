/**
 * 图表 Key 管理
 * 用于在引擎切换时强制重新渲染图表
 */

import { ref, watch, type Ref } from 'vue'

export function useChartKey(engine: Ref<string>) {
  const chartKey = ref(0)

  // 引擎切换时更新 key，强制重新渲染
  watch(engine, (newEngine, oldEngine) => {
    if (newEngine !== oldEngine) {
      chartKey.value++
      console.log(`🔄 引擎切换: ${oldEngine} → ${newEngine}，图表将重新渲染`)
    }
  })

  /**
   * 生成唯一的图表 key
   */
  const generateKey = (type: string) => {
    return `${type}-${engine.value}-${chartKey.value}`
  }

  /**
   * 手动刷新所有图表
   */
  const refreshAll = () => {
    chartKey.value++
  }

  return {
    chartKey,
    generateKey,
    refreshAll
  }
}


