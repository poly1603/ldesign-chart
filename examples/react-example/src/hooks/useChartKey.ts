/**
 * 图表 Key 管理 Hook
 * 用于在引擎切换时强制重新渲染图表
 */

import { useState, useEffect } from 'react'

export function useChartKey(engine: string) {
  const [chartKey, setChartKey] = useState(0)

  // 引擎切换时更新 key，强制重新渲染
  useEffect(() => {
    setChartKey(prev => prev + 1)
    console.log(`🔄 引擎切换至: ${engine}，图表将重新渲染`)
  }, [engine])

  /**
   * 生成唯一的图表 key
   */
  const generateKey = (type: string) => {
    return `${type}-${engine}-${chartKey}`
  }

  /**
   * 手动刷新所有图表
   */
  const refreshAll = () => {
    setChartKey(prev => prev + 1)
  }

  return {
    chartKey,
    generateKey,
    refreshAll
  }
}


