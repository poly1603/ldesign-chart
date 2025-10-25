/**
 * 图表演示组件 - React
 */

import React, { useState } from 'react'
import { Chart } from '@ldesign/chart-react'
import './ChartDemo.css'

interface ChartDemoProps {
  title: string
  description?: string
  badge?: string
  type: string
  data: any
  engine: 'echarts' | 'vchart' | 'auto'
  height?: number
}

export function ChartDemo({ 
  title, 
  description, 
  badge, 
  type, 
  data, 
  engine, 
  height = 300 
}: ChartDemoProps) {
  const [chartReady, setChartReady] = useState(false)
  const [chartError, setChartError] = useState(false)

  const handleReady = () => {
    setChartReady(true)
    setChartError(false)
  }

  const handleError = (error: Error) => {
    console.error('Chart error:', error)
    setChartError(true)
    setChartReady(false)
  }

  return (
    <div className="chart-demo-card">
      <div className="chart-header">
        <h3>{title}</h3>
        <div className="badges">
          {badge && <span className="badge badge-primary">{badge}</span>}
          <span className="badge badge-engine">{engine}</span>
        </div>
      </div>
      
      {description && (
        <p className="chart-description">{description}</p>
      )}
      
      <div className="chart-container">
        <Chart
          type={type}
          data={data}
          engine={engine}
          height={height}
          responsive={true}
          onReady={handleReady}
          onError={handleError}
        />
      </div>
      
      <div className="chart-meta">
        <span className="meta-item">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="6" cy="6" r="6"/>
          </svg>
          {type}
        </span>
        {chartReady && (
          <span className="meta-item status-ready">
            ✓ 已加载
          </span>
        )}
        {chartError && (
          <span className="meta-item status-error">
            ✗ 错误
          </span>
        )}
      </div>
    </div>
  )
}


