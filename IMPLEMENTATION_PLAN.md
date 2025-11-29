
# 图表库实施计划

## 核心接口设计

### 1. 渲染器接口

```typescript
// packages/core/src/renderer/IRenderer.ts
export interface IRenderer {
  // 初始化
  init(container: HTMLElement, width: number, height: number): void
  
  // 渲染控制
  render(): void
  clear(): void
  resize(width: number, height: number): void
  dispose(): void
  
  // 图形绘制 API
  drawPath(path: PathData, style: PathStyle): void
  drawRect(x: number, y: number, width: number, height: number, style: RectStyle): void
  drawCircle(cx: number, cy: number, radius: number, style: CircleStyle): void
  drawText(text: string, x: number, y: number, style: TextStyle): void
  drawImage(image: HTMLImageElement, x: number, y: number, width: number, height: number): void
  drawPolygon(points: Point[], style: PolygonStyle): void
  
  // 变换操作
  save(): void
  restore(): void
  translate(x: number, y: number): void
  rotate(angle: number): void
  scale(x: number, y: number): void
  
  // 裁剪
  clip(path: PathData): void
  
  // 获取上下文信息
  getContext(): RenderContext
  getPixelRatio(): number
}
```

### 2. 图表核心接口

```typescript
// packages/core/src/chart/Chart.ts
export class Chart {
  constructor(container: HTMLElement | string, options?: ChartInitOptions)
  
  // 配置方法
  setOption(option: ChartOption, opts?: SetOptionOpts): void
  getOption(): ChartOption
  
  // 尺寸控制
  resize(opts?: ResizeOpts): void
  getWidth(): number
  getHeight(): number
  
  // 渲染控制
  render(): void
  clear(): void
  
  // 主题
  setTheme(theme: string | Theme): void
  getTheme(): Theme
  
  // 插件
  use(plugin: Plugin): this
  
  // 事件
  on(event: string, handler: EventHandler, context?: any): this
  off(event: string, handler?: EventHandler): this
  
  // 数据操作
  setData(data: any): void
  appendData(data: any): void
  
  // 导出
  getDataURL(opts?: ExportOpts): string
  
  // 销毁
  dispose(): void
}
```

### 3. 配置选项结构

```typescript
// packages/core/src/types/option.ts
export interface ChartOption {
  // 全局配置
  backgroundColor?: string
  animation?: boolean | AnimationOption
  
  // 标题
  title?: TitleOption
  
  // 图例
  legend?: LegendOption
  
  // 提示框
  tooltip?: TooltipOption
  
  // 工具箱
  toolbox?: ToolboxOption
  
  // 坐标系
  grid?: GridOption | GridOption[]
  xAxis?: AxisOption | AxisOption[]
  yAxis?: AxisOption | AxisOption[]
  polar?: PolarOption | PolarOption[]
  
  // 系列
  series: SeriesOption[]
  
  // 数据集
  dataset?: DatasetOption | DatasetOption[]
  
  // 视觉映射
  visualMap?: VisualMapOption
  
  // 数据区域缩放
  dataZoom?: DataZoomOption | DataZoomOption[]
  
  // 颜色
  color?: string[]
}
```

## 关键类实现示例

### 1. Canvas 渲染器

```typescript
// packages/renderer-canvas/src/CanvasRenderer.ts
export class CanvasRenderer implements IRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private pixelRatio: number
  
  init(container: HTMLElement, width: number, height: number): void {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
    this.pixelRatio = window.devicePixelRatio || 1
    
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    this.canvas.width = width * this.pixelRatio
    this.canvas.height = height * this.pixelRatio
    
    this.ctx.scale(this.pixelRatio, this.pixelRatio)
    container.appendChild(this.canvas)
  }
  
  drawPath(path: PathData, style: PathStyle): void {
    this.ctx.beginPath()
    path.forEach((cmd, i) => {
      if (i === 0) {
        this.ctx.moveTo(cmd[1], cmd[2])
      } else if (cmd[0] === 'L') {
        this.ctx.lineTo(cmd[1], cmd[2])
      } else if (cmd[0] === 'C') {
        this.ctx.bezierCurveTo(cmd[1], cmd[2], cmd[3], cmd[4], cmd[5], cmd[6])
      }
    })
    
    if (style.fill) {
      this.ctx.fillStyle = style.fill
      this.ctx.fill()
    }
    if (style.stroke) {
      this.ctx.strokeStyle = style.stroke
      this.ctx.lineWidth = style.lineWidth || 1
      this.ctx.stroke()
    }
  }
  
  // ... 其他方法实现
}
```

### 2. 折线系列实现

```typescript
// packages/charts-basic/src/line/LineSeries.ts
export class LineSeries extends Series {
  type = 'line'
  
  render(renderer: IRenderer): void {
    const data = this.getData()
    const coordinateSystem = this.coordinateSystem
    
    // 计算所有数据点的像素坐标
    const points = data.map(item => {
      return coordinateSystem.dataToPoint([item[0], item[1]])
    })
    
    // 生成路径数据
    const pathData = this.createPathData(points)
    
    // 渲染线条
    renderer.drawPath(pathData, {
      stroke: this.getLineColor(),
      lineWidth: this.getLineWidth(),
      fill: this.isArea() ? this.getAreaColor() : undefined
    })
    
    // 渲染数据点
    if (this.showSymbol()) {
      this.renderSymbols(renderer, points)
    }
    
    // 渲染标签
    if (this.showLabel()) {
      this.renderLabels(renderer, points, data)
    }
  }
  
  private createPathData(points: Point[]): PathData {
    if (points.length === 0) return []
    
    const path: PathData = [['M', points[0].x, points[0].y]]
    
    if (this.isSmooth()) {
      // 使用贝塞尔曲线平滑
      const controlPoints = this.calculateControlPoints(points)
      for (let i = 1; i < points.length; i++) {
        path.push([
          'C',
          controlPoints[i-1].cp2x,
          controlPoints[i-1].cp2y,
          controlPoints[i].cp1x,
          controlPoints[i].cp1y,
          points[i].x,
          points[i].y
        ])
      }
    } else {
      // 直线连接
      for (let i = 1; i < points.length; i++) {
        path.push(['L', points[i].x, points[i].y])
      }
    }
    
    return path
  }
}
```

### 3. 坐标轴组件

```typescript
// packages/core/src/component/axis/Axis.ts
export class Axis extends Component {
  private scale: Scale
  private orientation: 'horizontal' | 'vertical'
  
  render(renderer: IRenderer): void {
    // 渲染轴线
    this.renderAxisLine(renderer)
    
    // 渲染刻度
    this.renderTicks(renderer)
    
    // 渲染标签
    this.renderLabels(renderer)
    
    // 渲染网格线（如果启用）
    if (this.option.splitLine?.show) {
      this.renderSplitLines(renderer)
    }
  }
  
  private renderAxisLine(renderer: IRenderer): void {
    const { start, end } = this.getAxisLinePosition()
    renderer.drawPath([
      ['M', start.x, start.y],
      ['L', end.x, end.y]
    ], {
      stroke: this.option.axisLine?.lineStyle?.color || '#333',
      lineWidth: this.option.axisLine?.lineStyle?.width || 1
    })
  }
  
  private renderTicks(renderer: IRenderer): void {
    const ticks = this.scale.getTicks()
    const tickLength = this.option.axisTick?.length || 5
    
    ticks.forEach(tick => {
      const pos = this.scale.map(tick)
      const { start, end } = this.getTickPosition(pos, tickLength)
      
      renderer.drawPath([
        ['M', start.x, start.y],
        ['L', end.x, end.y]
      ], {
        stroke: this.option.axisTick?.lineStyle?.color || '#333',
        lineWidth: this.option.axisTick?.lineStyle?.width || 1
      })
    })
  }
}
```

## 数据流转示例

```typescript
// 用户配置
const option = {
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed'] },
  yAxis: { type: 'value' },
  series: [{
    type: 'line',
    data: [120, 200, 150]
  }]
}

// 内部处理流程：
// 1. 数据解析
const parsedData = DataParser.parse(option.series[0].data)

// 2. 创建比例尺
const xScale = new CategoryScale({ 
  data: option.xAxis.data,
  range: [0, chartWidth] 
})
const yScale = new LinearScale({ 
  domain: [0, Math.max(...parsedData)],
  range: [chartHeight, 0] 
})

// 3. 创建坐标系
const coordinate = new CartesianCoordinate(xScale, yScale)

// 4. 数据映射到像素坐标
const points = parsedData.map((value, index) => {
  return coordinate.dataToPoint([index, value])
})

// 5. 渲染
renderer.drawPath(createPathFromPoints(points), style)
```

## 插件开发示例

```typescript
// 示例：数据导出插件
import { Plugin, Chart } from '@ldesign/chart-core'

export class ExportPlugin implements Plugin {
  name = 'export'
  version = '1.0.0'
  
  install(chart: Chart): void {
    // 添加导出图片方法
    chart.exportImage = (format: 'png' | 'jpeg' = 'png') => {
      const dataURL = chart.getDataURL({ type: format })
      const link = document.createElement('a')
      link.download = `chart.${format}`
      link.href = dataURL
      link.click()
    }
    
    // 添加导出 SVG 方法
    chart.exportSVG = () => {
      // 切换到 SVG 渲染器并导出
    }
    
    // 添加导出数据方法
    chart.exportData = (format: 'json' | 'csv' = 'json') => {
      const data = chart.getData()
      if (format === 'json') {
        return JSON.stringify(data, null, 2)
      } else {
        return this.convertToCSV(data)
      }
    }
  }
  
  private convertToCSV(data: any[]): string {
    // CSV 转换逻辑
  }
}

// 使用
import { Chart } from '@ldesign/chart-core'
import { ExportPlugin } from '@ldesign/chart-plugin-export'

const chart = new Chart('#container')
chart.use(new ExportPlugin())
chart.exportImage('png')
```

## Vue 组件实现示例

```vue
<!-- packages/vue/src/components/Chart.vue -->
<template>
  <div ref="chartRef" :style="{ width, height }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Chart, ChartOption } from '@ldesign/chart-core'

interface Props {
  option: ChartOption
  theme?: string
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '400px'
})

const emit = defineEmits<{
  'chart-ready': [chart: Chart]
  'chart-click': [event: any]
}>()

const chartRef = ref<HTMLElement>()
let chartInstance: Chart | null = null

onMounted(() => {
  if (chartRef.value) {
    chartInstance = new Chart(chartRef.value)
    
    if (props.theme) {
      chartInstance.setTheme(props.theme)
    }
    
    chartInstance.setOption(props.option)
    
    // 绑定事件
    chartInstance.on('click', (e) => emit('chart-click', e))
    
    emit('chart-ready', chartInstance)
  }
})

watch(() => props.option, (newOption) => {
  chartInstance?.setOption(newOption)
}, { deep: true })

watch(() => props.theme, (newTheme) => {
  if (newTheme) {
    chartInstance?.setTheme(newTheme)
  }
})

onUnmounted(() => {
  chartInstance?.dispose()
})

// 暴露实例方法
defineExpose({
  getChart: () => chartInstance
})
</script>
```

```typescript
// packages/vue/src/composables/useChart.ts
import { ref, onMounted, onUnmounted, Ref } from 'vue'
import { Chart, ChartOption } from '@ldesign/chart-core'

export function useChart(
  containerRef: Ref<HTMLElement | undefined>,
  option: Ref<ChartOption>
) {
  const chartInstance = ref<Chart>()
  
  onMounted(() => {
    if (containerRef.value) {
      chartInstance.value = new Chart(containerRef.value)
      chartInstance.value.setOption(option.value)
    }
  })
  
  onUnmounted(() => {
    chartInstance.value?.dispose()
  })
  
  const setOption = (newOption: ChartOption) => {
    chartInstance.value?.setOption(newOption)
  }
  
  const resize = () => {
    chartInstance.value?.resize()
  }
  
  return {
    chart: chartInstance,
    setOption,
    resize
  }
}
```

## 性能优化实现

### 1. 脏检查机制

```typescript
class DirtyManager {
  private dirtyFlags = new Set<string>()
  
  markDirty(component: string): void {
    this.dirtyFlags.add(component)
  }
  
  isDirty(component: string): boolean {
    return this.dirtyFlags.has(component)
  }
  
  clearDirty(): void {
    this.dirtyFlags.clear()
  }
}

// 在 Chart 类中使用
class Chart {
  private dirtyManager = new DirtyManager()
  
  setOption(option: ChartOption): void {
    // 比较新旧配置，只标记变化的部分为脏
    if (option.xAxis !== this.option.xAxis) {
      this.dirtyManager.markDirty('xAxis')
    }
    // ...
    
    this.render()
  }
  
  render(): void {
    // 只重新渲染标记为脏的组件
    if (this.dirtyManager.isDirty('xAxis')) {
      this.xAxis.render()
    }
    // ...
    
    this.dirtyManager.clearDirty()
  }
}
```

### 2. 数据抽样

```typescript
// packages/core/src/data/sampler/Sampler.ts
export class LTTBSampler {
  /**
   * Largest Triangle Three Buckets 算法
   * 用于大数据量的降采样
   */
  sample(data: Point[], threshold: number): Point[] {
    if (data.length <= threshold) {
      return data
    }
    
    const sampled: Point[] = [data[0]]
    const bucketSize = (data.length - 2) / (threshold - 2)
    
    let a = 0
    for (let i = 0; i < threshold - 2; i++) {
      const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1
