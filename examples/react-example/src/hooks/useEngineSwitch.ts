/**
 * 引擎切换 Hook
 */

import { useState, useEffect } from 'react'
import { engineManager, EChartsEngine, VChartEngine } from '@ldesign/chart-core'

export function useEngineSwitch() {
  const [currentEngine, setCurrentEngine] = useState<'echarts' | 'vchart' | 'auto'>('echarts')
  const [isVChartAvailable, setIsVChartAvailable] = useState(false)
  
  useEffect(() => {
    // 检测 VChart 是否可用
    const checkVChart = async () => {
      try {
        await import('@visactor/vchart')
        setIsVChartAvailable(true)
        
        // 注册引擎
        engineManager.register('echarts', new EChartsEngine())
        engineManager.register('vchart', new VChartEngine())
        
        console.log('✅ 双引擎已注册')
      } catch (e) {
        console.warn('⚠️ VChart 未安装，只能使用 ECharts')
        engineManager.register('echarts', new EChartsEngine())
      }
      
      // 从 localStorage 读取上次选择的引擎
      const saved = localStorage.getItem('chart-engine')
      if (saved && (saved === 'echarts' || saved === 'vchart' || saved === 'auto')) {
        if (saved === 'vchart' && !isVChartAvailable) {
          console.warn('VChart 未安装，使用 ECharts')
        } else {
          setCurrentEngine(saved as any)
        }
      }
    }
    
    checkVChart()
  }, [])
  
  const switchEngine = (engine: 'echarts' | 'vchart' | 'auto') => {
    if (engine === 'vchart' && !isVChartAvailable) {
      alert('VChart 未安装，请先安装: pnpm add @visactor/vchart')
      return
    }
    setCurrentEngine(engine)
    localStorage.setItem('chart-engine', engine)
  }
  
  return {
    currentEngine,
    isVChartAvailable,
    switchEngine
  }
}


