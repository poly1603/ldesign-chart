/**
 * 引擎选择器组件 - React
 */

import React from 'react'
import './EngineSelector.css'

interface EngineSelectorProps {
  value: 'echarts' | 'vchart' | 'auto'
  isVChartAvailable: boolean
  onChange: (engine: 'echarts' | 'vchart' | 'auto') => void
}

export function EngineSelector({ value, isVChartAvailable, onChange }: EngineSelectorProps) {
  return (
    <div className="engine-selector">
      <h3>🔧 图表引擎</h3>
      <div className="engine-buttons">
        <button 
          className={value === 'echarts' ? 'active' : ''}
          onClick={() => onChange('echarts')}
          title="使用 ECharts 引擎"
        >
          📊 ECharts
        </button>
        <button 
          className={value === 'vchart' ? 'active' : ''}
          onClick={() => onChange('vchart')}
          disabled={!isVChartAvailable}
          title="使用 VChart 引擎"
        >
          📈 VChart
          {!isVChartAvailable && <span className="disabled-badge">未安装</span>}
        </button>
        <button 
          className={value === 'auto' ? 'active' : ''}
          onClick={() => onChange('auto')}
          title="自动选择最佳引擎"
        >
          🤖 Auto
        </button>
      </div>
      <p className="engine-info">
        当前引擎: <strong>{value}</strong>
        {value === 'auto' && <span className="hint">（根据图表类型自动选择）</span>}
      </p>
    </div>
  )
}


