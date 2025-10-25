import React, { useState } from 'react'
import { EngineSelector } from './components/EngineSelector'
import { ChartDemo } from './components/ChartDemo'
import { useEngineSwitch } from './hooks/useEngineSwitch'
import { useChartKey } from './hooks/useChartKey'
import { basicChartsData } from './data/basicCharts'
import { advancedChartsData } from './data/advancedCharts'
import { vchartChartsData } from './data/vchartOnly'
import './App.css'

function App() {
  const { currentEngine, isVChartAvailable, switchEngine } = useEngineSwitch()
  const { generateKey, refreshAll } = useChartKey(currentEngine)
  const [activeTab, setActiveTab] = useState('basic')
  const [darkMode, setDarkMode] = useState(false)

  const tabs = [
    { id: 'basic', icon: '📊', label: '基础图表', count: Object.keys(basicChartsData).length },
    { id: 'advanced', icon: '🎨', label: '高级图表', count: Object.keys(advancedChartsData).length },
    { id: '3d', icon: '🎭', label: '3D图表', count: Object.keys(vchartChartsData).length }
  ]

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>@ldesign/chart v2.0 - React 完整示例</h1>
          <p className="subtitle">13种图表类型 · 双引擎支持 · 响应式设计</p>
        </div>

        <div className="header-controls">
          <EngineSelector
            value={currentEngine}
            isVChartAvailable={isVChartAvailable}
            onChange={switchEngine}
          />

          <button
            className="dark-mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? '🌞' : '🌙'}
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
            <span className="count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="charts-container">
        {/* 基础图表 */}
        {activeTab === 'basic' && (
          <div className="charts-grid">
            {Object.entries(basicChartsData).map(([type, chart]) => (
              <ChartDemo
                key={generateKey(type)}
                type={type}
                title={chart.title}
                description={chart.description}
                data={chart.data}
                engine={currentEngine}
              />
            ))}
          </div>
        )}

        {/* 高级图表 */}
        {activeTab === 'advanced' && (
          <div className="charts-grid">
            {Object.entries(advancedChartsData).map(([type, chart]) => (
              <ChartDemo
                key={generateKey(type)}
                type={type}
                title={chart.title}
                description={chart.description}
                badge={chart.badge}
                data={chart.data}
                engine={currentEngine}
              />
            ))}
          </div>
        )}

        {/* 3D图表 */}
        {activeTab === '3d' && (
          <div className="charts-grid">
            {!isVChartAvailable ? (
              <div className="warning-banner">
                <h3>⚠️ VChart 未安装</h3>
                <p>3D 图表需要 VChart 引擎支持</p>
                <code>pnpm add @visactor/vchart</code>
              </div>
            ) : (
              Object.entries(vchartChartsData).map(([type, chart]) => (
                <ChartDemo
                  key={generateKey(type)}
                  type={type}
                  title={chart.title}
                  description={chart.description}
                  badge={chart.badge}
                  data={chart.data}
                  engine="vchart"
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
