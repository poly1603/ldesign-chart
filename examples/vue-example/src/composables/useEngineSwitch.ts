/**
 * 引擎切换 Composable
 */

import { ref, onMounted } from 'vue'
import { engineManager, EChartsEngine, VChartEngine } from '@ldesign/chart-core'

export function useEngineSwitch() {
  const currentEngine = ref<'echarts' | 'vchart' | 'auto'>('echarts')
  const isVChartAvailable = ref(false)
  
  // 检测 VChart 是否可用
  onMounted(async () => {
    try {
      await import('@visactor/vchart')
      isVChartAvailable.value = true
      
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
      if (saved === 'vchart' && !isVChartAvailable.value) {
        console.warn('VChart 未安装，使用 ECharts')
      } else {
        currentEngine.value = saved as any
      }
    }
  })
  
  const switchEngine = (engine: 'echarts' | 'vchart' | 'auto') => {
    if (engine === 'vchart' && !isVChartAvailable.value) {
      alert('VChart 未安装，请先安装: pnpm add @visactor/vchart')
      return
    }
    currentEngine.value = engine
    localStorage.setItem('chart-engine', engine)
  }
  
  return {
    currentEngine,
    isVChartAvailable,
    switchEngine
  }
}


