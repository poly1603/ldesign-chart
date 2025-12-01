# @ldesign/chart-core

核心图表库，提供框架无关的图表功能。

## 特性

- 🎯 TypeScript 原生支持，完整类型定义
- 🎨 多渲染引擎抽象（Canvas/SVG/WebGL）
- 📊 灵活的配置系统
- 🔌 事件驱动架构
- 📏 强大的比例尺系统
- 🛠️ 丰富的工具函数
- 🧩 组件化设计
- 📈 多种图表类型支持

## 安装

```bash
pnpm add @ldesign/chart-core @ldesign/chart-renderer-canvas
```

## 快速开始

### 基础示例

```typescript
import { Chart, LinearScale, CartesianCoordinate, Axis, LineSeries } from '@ldesign/chart-core'
import { CanvasRenderer } from '@ldesign/chart-renderer-canvas'

// 1. 创建图表实例
const chart = new Chart(document.getElementById('chart'), {
  renderer: new CanvasRenderer(container),
  width: 800,
  height: 400,
})

// 2. 准备数据
const data = [30, 45, 28, 60, 55, 70, 65]

// 3. 创建比例尺
const xScale = new LinearScale({
  domain: [0, data.length - 1],
  range: [0, 1],
})

const yScale = new LinearScale({
  domain: [0, 100],
  range: [0, 1],
})

// 4. 创建坐标系
const coordinate = new CartesianCoordinate({
  x: [50, 750],
  y: [350, 50],
})

// 5. 创建坐标轴
const xAxis = new Axis({
  type: 'axis',
  orientation: 'bottom',
  position: [50, 350, 750, 350],
  scale: xScale,
})

const yAxis = new Axis({
  type: 'axis',
  orientation: 'left',
  position: [50, 50, 50, 350],
  scale: yScale,
})

// 6. 创建折线系列
const lineSeries = new LineSeries({
  type: 'line',
  data: data,
  lineStyle: {
    stroke: '#1890ff',
    lineWidth: 2,
  },
  showSymbol: true,
  symbolSize: 6,
}, xScale, yScale, coordinate)

// 7. 渲染
const renderer = chart.getRenderer()
if (renderer) {
  renderer.clear()
  xAxis.render(renderer)
  yAxis.render(renderer)
  lineSeries.render(renderer)
}
```

## 核心概念

### Chart - 图表主类

图表的核心容器，管理渲染器、事件和生命周期。

```typescript
const chart = new Chart(container: HTMLElement | string, options?: ChartInitOptions)
```

**参数：**
- `container`: DOM 元素或选择器
- `options`: 初始化配置
  - `renderer`: 渲染器实例
  - `width`: 宽度（可选，默认为容器宽度）
  - `height`: 高度（可选，默认为容器高度）
  - `devicePixelRatio`: 设备像素比（可选）

**方法：**
- `getRenderer(): IRenderer | null` - 获取渲染器
- `resize(width?: number, height?: number): void` - 调整大小
- `dispose(): void` - 销毁图表
- `on(event: string, handler: Function): this` - 监听事件
- `off(event: string, handler?: Function): this` - 移除事件监听

### Scale - 比例尺系统

将数据域映射到视觉空间。

#### LinearScale - 线性比例尺

```typescript
const scale = new LinearScale({
  domain: [0, 100],    // 数据范围
  range: [0, 1],       // 映射范围（归一化 0-1）
})
```

**方法：**
- `map(value: number): number` - 将数据值映射到范围值
- `invert(value: number): number` - 反向映射
- `getTicks(count?: number): number[]` - 获取刻度值
- `nice(): void` - 优化数据域为友好值
- `setDomain(domain: [number, number]): void` - 设置数据域
- `setRange(range: [number, number]): void` - 设置映射范围

**示例：**
```typescript
const scale = new LinearScale({ domain: [0, 100], range: [0, 1] })
scale.map(50)        // 0.5
scale.invert(0.5)    // 50
scale.getTicks(5)    // [0, 25, 50, 75, 100]
```

#### BandScale - 分类比例尺

```typescript
const scale = new BandScale({
  domain: ['A', 'B', 'C'],
  range: [0, 1],
  paddingInner: 0.1,  // 内边距
  paddingOuter: 0.05, // 外边距
})
```

**方法：**
- `map(value: string): number` - 映射分类值
- `bandwidth(): number` - 获取每个分类的带宽
- `step(): number` - 获取步长

### Coordinate - 坐标系

定义数据的空间映射关系。

#### CartesianCoordinate - 笛卡尔坐标系

```typescript
const coordinate = new CartesianCoordinate({
  x: [left, right],   // X 轴像素范围
  y: [bottom, top],   // Y 轴像素范围
})
```

**方法：**
- `dataToPoint(data: [number, number]): Point` - 数据坐标转屏幕坐标
- `pointToData(point: Point): [number, number]` - 屏幕坐标转数据坐标
- `update(options: CartesianCoordinateOptions): void` - 更新配置

**示例：**
```typescript
const coord = new CartesianCoordinate({
  x: [0, 800],
  y: [400, 0]  // 注意 Y 轴通常是倒置的
})

coord.dataToPoint([0.5, 0.5])  // { x: 400, y: 200 }
coord.pointToData({ x: 400, y: 200 })  // [0.5, 0.5]
```

### Component - 组件系统

可复用的图表组件。

#### Axis - 坐标轴

```typescript
const axis = new Axis({
  type: 'axis',
  orientation: 'bottom' | 'top' | 'left' | 'right',
  position: [x1, y1, x2, y2],  // 轴的起止位置
  scale: scale,                 // 关联的比例尺
  line: {
    show: true,
    style: { stroke: '#333', lineWidth: 1 }
  },
  tick: {
    show: true,
    length: 5,
    style: { stroke: '#333', lineWidth: 1 }
  },
  label: {
    show: true,
    rotate: 0,
    offset: 10,
    formatter: (value) => value.toString(),
    style: { fill: '#333', fontSize: 12 }
  }
})
```

**方法：**
- `render(renderer: IRenderer): void` - 渲染坐标轴
- `update(options: AxisComponentOptions): void` - 更新配置

### Series - 系列系统

数据可视化的核心。

#### Series - 抽象基类

所有系列的基类，提供通用功能。

**方法：**
- `render(renderer: IRenderer): void` - 渲染系列
- `update(options: SeriesOption): void` - 更新配置
- `setData(data: any[]): void` - 设置数据
- `destroy(): void` - 销毁系列

#### LineSeries - 折线图

```typescript
const lineSeries = new LineSeries({
  type: 'line',
  data: [10, 20, 30, 40, 50],
  lineStyle: {
    stroke: '#1890ff',
    lineWidth: 2,
    lineDash: [],        // 虚线配置
  },
  showSymbol: true,      // 显示数据点
  symbolSize: 6,         // 数据点大小
  itemStyle: {
    fill: '#1890ff',
    stroke: '#fff',
    lineWidth: 2,
  }
}, xScale, yScale, coordinate)
```

**特性：**
- ✅ 平滑曲线
- ✅ 数据点标记
- ✅ 虚线支持
- ✅ 自定义样式

## 工具函数

### 类型检查

```typescript
import { isObject, isArray, isString, isNumber, isFunction } from '@ldesign/chart-core'

isObject({})        // true
isArray([])         // true
isString('text')    // true
isNumber(123)       // true
isFunction(() => {}) // true
```

### 对象操作

```typescript
import { merge, clone } from '@ldesign/chart-core'

// 深度合并
const result = merge({ a: 1 }, { b: 2 })  // { a: 1, b: 2 }

// 深度克隆
const copy = clone({ a: { b: 1 } })
```

### 函数工具

```typescript
import { throttle, debounce } from '@ldesign/chart-core'

// 节流
const throttled = throttle(() => console.log('call'), 100)

// 防抖
const debounced = debounce(() => console.log('call'), 100)
```

### 数学工具

```typescript
import { clamp, lerp } from '@ldesign/chart-core'

clamp(150, 0, 100)    // 100 (限制在范围内)
lerp(0, 100, 0.5)     // 50 (线性插值)
```

### 其他工具

```typescript
import { generateId, getElementSize, formatNumber, parseColor } from '@ldesign/chart-core'

generateId()                    // 'chart_abc123'
getElementSize(element)         // { width: 800, height: 400 }
formatNumber(1234.5678, 2)     // '1234.57'
parseColor('#1890ff')          // { r: 24, g: 144, b: 255, a: 1 }
```

## 事件系统

```typescript
import { EventEmitter } from '@ldesign/chart-core'

const emitter = new EventEmitter()

// 监听事件
emitter.on('click', (data) => {
  console.log('clicked', data)
})

// 触发事件
emitter.emit('click', { x: 100, y: 200 })

// 单次监听
emitter.once('load', () => {
  console.log('loaded')
})

// 移除监听
emitter.off('click')
```

## 渲染器接口

### IRenderer

所有渲染器必须实现的接口。

**绘图方法：**
- `drawPath(pathData: PathData, style: PathStyle): void` - 绘制路径
- `drawRect(x: number, y: number, width: number, height: number, style: RectStyle): void` - 绘制矩形
- `drawCircle(circle: Circle, style: CircleStyle): void` - 绘制圆形
- `drawText(text: Text, style: TextStyle): void` - 绘制文本

**变换方法：**
- `save(): void` - 保存状态
- `restore(): void` - 恢复状态
- `translate(x: number, y: number): void` - 平移
- `rotate(angle: number): void` - 旋转
- `scale(x: number, y: number): void` - 缩放

**其他方法：**
- `clear(): void` - 清空画布
- `resize(width: number, height: number): void` - 调整大小
- `getContext(): any` - 获取上下文

## 类型定义

```typescript
// 图表配置
interface ChartOption {
  title?: TitleOption
  xAxis?: AxisOption
  yAxis?: AxisOption
  series?: SeriesOption[]
  legend?: LegendOption
  tooltip?: TooltipOption
  grid?: GridOption
  animation?: AnimationOption
}

// 系列配置
interface SeriesOption {
  type: 'line' | 'bar' | 'pie' | 'scatter' // 等等
  data: any[]
  lineStyle?: LineStyle
  itemStyle?: ItemStyle
  label?: LabelOption
  // ... 更多配置
}

// 样式定义
interface LineStyle {
  stroke?: string
  lineWidth?: number
  lineDash?: number[]
  lineCap?: 'butt' | 'round' | 'square'
  lineJoin?: 'miter' | 'round' | 'bevel'
}

interface ItemStyle {
  fill?: string
  stroke?: string
  lineWidth?: number
  opacity?: number
}
```

## 最佳实践

### 1. 响应式设计

```typescript
const chart = new Chart(container, {
  renderer: new CanvasRenderer(container)
})

window.addEventListener('resize', () => {
  const { width, height } = getElementSize(container)
  chart.resize(width, height)
  // 重新渲染...
})
```

### 2. 性能优化

```typescript
// 使用节流优化频繁更新
const updateChart = throttle(() => {
  // 更新图表
}, 16) // 约 60fps
```

### 3. 内存管理

```typescript
// 组件销毁时清理资源
onUnmount(() => {
  chart.dispose()
})
```

### 4. 类型安全

```typescript
// 充分利用 TypeScript 类型
import type { ChartOption, SeriesOption } from '@ldesign/chart-core'

const option: ChartOption = {
  series: [{
    type: 'line',
    data: [1, 2, 3]
  }]
}
```

## 进阶用法

### 自定义渲染器

```typescript
import { IRenderer } from '@ldesign/chart-core'

class CustomRenderer implements IRenderer {
  // 实现所有接口方法
  drawPath(pathData: PathData, style: PathStyle) {
    // 自定义实现
  }
  // ...
}
```

### 自定义系列

```typescript
import { Series } from '@ldesign/chart-core'

class CustomSeries extends Series {
  render(renderer: IRenderer) {
    // 自定义渲染逻辑
  }
}
```

## 示例

查看 [examples](../../examples) 目录获取更多示例：

- `basic/` - 基础示例
- `basic-line/` - 基础折线图
- `line-chart/` - 完整折线图（交互式）

## API 文档

完整 API 文档请参考：
- [架构设计](../../ARCHITECTURE.md)
- [技术细节](../../TECHNICAL_DETAILS.md)
- [开发指南](../../GETTING_STARTED.md)

## 许可证

MIT