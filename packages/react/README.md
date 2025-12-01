# @ldesign/chart-react

React adapter for @ldesign/chart - A modern, lightweight charting library.

## Installation

```bash
npm install @ldesign/chart-react
# or
pnpm add @ldesign/chart-react
# or
yarn add @ldesign/chart-react
```

## Quick Start

### Using Component

```tsx
import { LChart } from '@ldesign/chart-react'

function App() {
  const option = {
    series: [
      {
        type: 'line',
        data: [1, 2, 3, 4, 5]
      }
    ]
  }

  return (
    <div>
      <LChart 
        option={option} 
        theme="default"
        width="100%"
        height="400px"
      />
    </div>
  )
}
```

### Using Hook

```tsx
import { useChart } from '@ldesign/chart-react'

function App() {
  const option = {
    series: [
      {
        type: 'line',
        data: [1, 2, 3, 4, 5]
      }
    ]
  }

  const { containerRef } = useChart({ option })

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '400px' }}
    />
  )
}
```

## API Reference

### LChart Component

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `option` | `ChartOption` | **required** | Chart configuration options |
| `theme` | `string` | `'default'` | Theme name |
| `width` | `number \| string` | `'100%'` | Container width |
| `height` | `number \| string` | `'400px'` | Container height |
| `autoResize` | `boolean` | `true` | Auto resize on container size change |
| `className` | `string` | - | Custom CSS class name |
| `style` | `CSSProperties` | - | Custom inline styles |

#### Ref Methods

```tsx
import { useRef } from 'react'
import { LChart, type LChartRef } from '@ldesign/chart-react'

function App() {
  const chartRef = useRef<LChartRef>(null)

  const handleResize = () => {
    chartRef.current?.resize()
  }

  return (
    <>
      <LChart ref={chartRef} option={option} />
      <button onClick={handleResize}>Resize</button>
    </>
  )
}
```

Available methods:
- `chartInstance`: Get the chart instance
- `resize()`: Manually resize the chart
- `dispose()`: Destroy the chart instance

### useChart Hook

#### Parameters

```typescript
interface UseChartOptions {
  option: ChartOption
  theme?: string
  autoResize?: boolean
}
```

#### Return Value

```typescript
interface UseChartReturn {
  containerRef: React.RefObject<HTMLDivElement>
  chartInstance: any | null
  resize: () => void
  dispose: () => void
}
```

## Examples

### Basic Usage

```tsx
import { LChart } from '@ldesign/chart-react'

function BasicChart() {
  const option = {
    series: [
      {
        type: 'line',
        data: [10, 20, 30, 40, 50]
      }
    ]
  }

  return <LChart option={option} />
}
```

### Responsive Chart with State

```tsx
import { useState } from 'react'
import { LChart } from '@ldesign/chart-react'

function ResponsiveChart() {
  const [data, setData] = useState([1, 2, 3, 4, 5])

  const option = {
    series: [
      {
        type: 'line',
        data
      }
    ]
  }

  const updateData = () => {
    setData(data.map(v => v + Math.random() * 10))
  }

  return (
    <div>
      <LChart option={option} width="100%" height={400} />
      <button onClick={updateData}>Update Data</button>
    </div>
  )
}
```

### Theme Switching

```tsx
import { useState } from 'react'
import { LChart } from '@ldesign/chart-react'

function ThemeChart() {
  const [theme, setTheme] = useState('default')

  const option = {
    series: [
      {
        type: 'bar',
        data: [10, 20, 30, 40, 50]
      }
    ]
  }

  return (
    <div>
      <LChart option={option} theme={theme} />
      <button onClick={() => setTheme('default')}>Default Theme</button>
      <button onClick={() => setTheme('dark')}>Dark Theme</button>
    </div>
  )
}
```

### Using Hook for Advanced Control

```tsx
import { useEffect } from 'react'
import { useChart } from '@ldesign/chart-react'

function AdvancedChart() {
  const option = {
    series: [
      {
        type: 'line',
        data: [1, 2, 3, 4, 5]
      }
    ]
  }

  const { containerRef, chartInstance, resize } = useChart({ 
    option,
    theme: 'default'
  })

  useEffect(() => {
    // Access chart instance for advanced operations
    if (chartInstance) {
      console.log('Chart instance ready:', chartInstance)
    }
  }, [chartInstance])

  return (
    <div>
      <div ref={containerRef} style={{ width: '100%', height: '400px' }} />
      <button onClick={resize}>Manual Resize</button>
    </div>
  )
}
```

### Multiple Charts

```tsx
import { LChart } from '@ldesign/chart-react'

function MultipleCharts() {
  const lineOption = {
    series: [{ type: 'line', data: [1, 2, 3, 4, 5] }]
  }

  const barOption = {
    series: [{ type: 'bar', data: [5, 4, 3, 2, 1] }]
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <LChart option={lineOption} height={300} />
      <LChart option={barOption} height={300} />
    </div>
  )
}
```

## TypeScript Support

This package is written in TypeScript and provides full type definitions.

```tsx
import type { 
  LChartProps, 
  LChartRef,
  UseChartOptions,
  UseChartReturn,
  ChartOption 
} from '@ldesign/chart-react'

// Use types in your components
const MyChart: React.FC<LChartProps> = (props) => {
  return <LChart {...props} />
}
```

## License

MIT