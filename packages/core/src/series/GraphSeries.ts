/**
 * 关系图系列
 */

import { Series } from './Series'
import type { IRenderer } from '../renderer/interface'
import type { SeriesOption } from '../types'

/**
 * 图节点
 */
export interface GraphNode {
  id?: string
  name: string
  x?: number
  y?: number
  value?: number
  category?: number
  symbolSize?: number
  symbol?: string
  itemStyle?: {
    color?: string
    borderColor?: string
    borderWidth?: number
    opacity?: number
  }
  label?: {
    show?: boolean
    position?: 'inside' | 'top' | 'bottom' | 'left' | 'right'
    color?: string
    fontSize?: number
  }
  fixed?: boolean  // 力导向布局时是否固定
}

/**
 * 图边
 */
export interface GraphLink {
  source: string | number
  target: string | number
  value?: number
  lineStyle?: {
    color?: string
    width?: number
    curveness?: number
    opacity?: number
    type?: 'solid' | 'dashed' | 'dotted'
  }
  label?: {
    show?: boolean
    formatter?: string | ((params: unknown) => string)
  }
}

/**
 * 图分类
 */
export interface GraphCategory {
  name: string
  itemStyle?: {
    color?: string
  }
}

/**
 * 力导向布局配置
 */
export interface ForceLayoutOption {
  initLayout?: 'circular' | 'none'
  repulsion?: number | number[]
  gravity?: number
  edgeLength?: number | number[]
  layoutAnimation?: boolean
  friction?: number
}

/**
 * 关系图配置选项
 */
export interface GraphSeriesOption extends SeriesOption {
  type: 'graph'
  data: GraphNode[]
  links: GraphLink[]
  categories?: GraphCategory[]

  // 布局
  layout?: 'none' | 'circular' | 'force'
  circular?: {
    rotateLabel?: boolean
  }
  force?: ForceLayoutOption

  // 交互
  roam?: boolean | 'scale' | 'move'
  draggable?: boolean
  focusNodeAdjacency?: boolean | 'inEdges' | 'outEdges' | 'allEdges'

  // 符号
  symbol?: string
  symbolSize?: number | number[] | ((value: number) => number)
  symbolRotate?: number

  // 边
  edgeSymbol?: [string, string]
  edgeSymbolSize?: number | number[]

  // 标签
  edgeLabel?: {
    show?: boolean
    position?: 'start' | 'middle' | 'end'
    formatter?: string | ((params: unknown) => string)
    color?: string
    fontSize?: number
  }

  // 样式
  lineStyle?: {
    color?: string
    width?: number
    curveness?: number
    opacity?: number
  }

  emphasis?: {
    focus?: 'none' | 'self' | 'adjacency'
    scale?: boolean | number
    itemStyle?: {
      color?: string
      borderColor?: string
      borderWidth?: number
    }
    lineStyle?: {
      color?: string
      width?: number
    }
    label?: {
      show?: boolean
      fontSize?: number
    }
  }

  // 层级
  z?: number
  zlevel?: number
}

/**
 * 缓存的节点数据
 */
interface CachedNode extends GraphNode {
  screenX: number
  screenY: number
  radius: number
  categoryColor?: string
}

/**
 * 缓存的边数据
 */
interface CachedLink {
  source: CachedNode
  target: CachedNode
  original: GraphLink
}

// 默认颜色
const DEFAULT_COLORS = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
  '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#48b8d0'
]

/**
 * 关系图系列类
 */
export class GraphSeries extends Series {
  protected declare option: GraphSeriesOption
  private cachedNodes: CachedNode[] = []
  private cachedLinks: CachedLink[] = []
  private hoveredNodeIndex: number = -1
  private containerWidth: number = 800
  private containerHeight: number = 600

  constructor(option: GraphSeriesOption) {
    super(option)
  }

  get type(): string {
    return 'graph'
  }

  /**
   * 设置容器尺寸
   */
  setContainerSize(width: number, height: number): void {
    this.containerWidth = width
    this.containerHeight = height
  }

  /**
   * 获取缓存的节点
   */
  getCachedNodes(): CachedNode[] {
    return this.cachedNodes
  }

  /**
   * 设置悬停节点
   */
  setHoveredNodeIndex(index: number): void {
    this.hoveredNodeIndex = index
  }

  /**
   * 渲染关系图
   */
  render(renderer: IRenderer): void {
    const nodes = this.option.data || []
    const links = this.option.links || []

    if (nodes.length === 0) return

    // 计算节点位置
    this.calculateLayout(nodes, links)

    // 先渲染边
    for (const link of this.cachedLinks) {
      this.renderLink(renderer, link)
    }

    // 再渲染节点
    for (let i = 0; i < this.cachedNodes.length; i++) {
      const node = this.cachedNodes[i]!
      const isHovered = i === this.hoveredNodeIndex
      this.renderNode(renderer, node, isHovered)
    }
  }

  /**
   * 计算布局
   */
  private calculateLayout(nodes: GraphNode[], links: GraphLink[]): void {
    const layout = this.option.layout || 'none'
    const categories = this.option.categories || []

    // 首先创建缓存节点
    this.cachedNodes = nodes.map((node, index) => {
      const symbolSize = this.getNodeSize(node)
      const categoryColor = node.category !== undefined && categories[node.category]
        ? categories[node.category]!.itemStyle?.color
        : undefined

      return {
        ...node,
        screenX: 0,
        screenY: 0,
        radius: symbolSize / 2,
        categoryColor: categoryColor || node.itemStyle?.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      }
    })

    // 根据布局类型计算位置
    switch (layout) {
      case 'circular':
        this.calculateCircularLayout()
        break
      case 'force':
        this.calculateForceLayout()
        break
      default:
        this.calculateNoneLayout()
    }

    // 创建缓存边
    this.cachedLinks = links.map(link => {
      const sourceNode = this.findNodeById(link.source)
      const targetNode = this.findNodeById(link.target)
      return {
        source: sourceNode!,
        target: targetNode!,
        original: link,
      }
    }).filter(link => link.source && link.target)
  }

  /**
   * 无布局 - 使用节点自带坐标
   */
  private calculateNoneLayout(): void {
    const padding = 50
    const width = this.containerWidth - padding * 2
    const height = this.containerHeight - padding * 2

    for (const node of this.cachedNodes) {
      if (node.x !== undefined && node.y !== undefined) {
        node.screenX = padding + (node.x / 100) * width
        node.screenY = padding + (node.y / 100) * height
      } else {
        // 随机位置
        node.screenX = padding + Math.random() * width
        node.screenY = padding + Math.random() * height
      }
    }
  }

  /**
   * 环形布局
   */
  private calculateCircularLayout(): void {
    const cx = this.containerWidth / 2
    const cy = this.containerHeight / 2
    const radius = Math.min(cx, cy) * 0.7
    const count = this.cachedNodes.length

    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2
      const node = this.cachedNodes[i]!
      node.screenX = cx + radius * Math.cos(angle)
      node.screenY = cy + radius * Math.sin(angle)
    }
  }

  /**
   * 力导向布局（简化版本）
   */
  private calculateForceLayout(): void {
    const force = this.option.force || {}
    const repulsion = typeof force.repulsion === 'number' ? force.repulsion : 50
    const iterations = 100

    const cx = this.containerWidth / 2
    const cy = this.containerHeight / 2

    // 初始化位置（环形或随机）
    if (force.initLayout === 'circular') {
      this.calculateCircularLayout()
    } else {
      for (const node of this.cachedNodes) {
        node.screenX = cx + (Math.random() - 0.5) * 200
        node.screenY = cy + (Math.random() - 0.5) * 200
      }
    }

    // 简化的力导向迭代
    for (let iter = 0; iter < iterations; iter++) {
      const alpha = 1 - iter / iterations

      // 斥力
      for (let i = 0; i < this.cachedNodes.length; i++) {
        for (let j = i + 1; j < this.cachedNodes.length; j++) {
          const nodeA = this.cachedNodes[i]!
          const nodeB = this.cachedNodes[j]!

          const dx = nodeB.screenX - nodeA.screenX
          const dy = nodeB.screenY - nodeA.screenY
          const dist = Math.sqrt(dx * dx + dy * dy) || 1

          const force = (repulsion * alpha) / dist
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force

          if (!nodeA.fixed) {
            nodeA.screenX -= fx
            nodeA.screenY -= fy
          }
          if (!nodeB.fixed) {
            nodeB.screenX += fx
            nodeB.screenY += fy
          }
        }
      }

      // 引力（边连接的节点互相吸引）
      for (const link of this.cachedLinks) {
        if (!link.source || !link.target) continue

        const dx = link.target.screenX - link.source.screenX
        const dy = link.target.screenY - link.source.screenY
        const dist = Math.sqrt(dx * dx + dy * dy) || 1

        const edgeLength = typeof force.edgeLength === 'number' ? force.edgeLength : 30
        const pull = (dist - edgeLength) * 0.1 * alpha
        const fx = (dx / dist) * pull
        const fy = (dy / dist) * pull

        if (!link.source.fixed) {
          link.source.screenX += fx
          link.source.screenY += fy
        }
        if (!link.target.fixed) {
          link.target.screenX -= fx
          link.target.screenY -= fy
        }
      }

      // 向中心的引力
      const gravity = force.gravity ?? 0.1
      for (const node of this.cachedNodes) {
        if (node.fixed) continue
        node.screenX += (cx - node.screenX) * gravity * alpha
        node.screenY += (cy - node.screenY) * gravity * alpha
      }
    }
  }

  /**
   * 根据 ID 或索引查找节点
   */
  private findNodeById(id: string | number): CachedNode | undefined {
    if (typeof id === 'number') {
      return this.cachedNodes[id]
    }
    return this.cachedNodes.find(n => n.id === id || n.name === id)
  }

  /**
   * 获取节点大小
   */
  private getNodeSize(node: GraphNode): number {
    if (node.symbolSize !== undefined) {
      return node.symbolSize
    }
    const defaultSize = this.option.symbolSize
    if (typeof defaultSize === 'function' && node.value !== undefined) {
      return defaultSize(node.value)
    }
    if (typeof defaultSize === 'number') {
      return defaultSize
    }
    if (Array.isArray(defaultSize)) {
      return defaultSize[0] ?? 10
    }
    return 10
  }

  /**
   * 渲染边
   */
  private renderLink(renderer: IRenderer, link: CachedLink): void {
    const lineStyle = link.original.lineStyle || this.option.lineStyle || {}
    const curveness = lineStyle.curveness ?? 0

    if (curveness === 0) {
      // 直线
      renderer.drawPath(
        {
          commands: [
            { type: 'M', x: link.source.screenX, y: link.source.screenY },
            { type: 'L', x: link.target.screenX, y: link.target.screenY },
          ],
        },
        {
          stroke: lineStyle.color || '#999',
          lineWidth: lineStyle.width || 1,
          opacity: lineStyle.opacity ?? 0.6,
          fill: undefined,
        }
      )
    } else {
      // 曲线
      const midX = (link.source.screenX + link.target.screenX) / 2
      const midY = (link.source.screenY + link.target.screenY) / 2
      const dx = link.target.screenX - link.source.screenX
      const dy = link.target.screenY - link.source.screenY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const offset = curveness * dist

      // 垂直方向偏移
      const ctrlX = midX + (-dy / dist) * offset
      const ctrlY = midY + (dx / dist) * offset

      renderer.drawPath(
        {
          commands: [
            { type: 'M', x: link.source.screenX, y: link.source.screenY },
            { type: 'Q', x1: ctrlX, y1: ctrlY, x: link.target.screenX, y: link.target.screenY },
          ],
        },
        {
          stroke: lineStyle.color || '#999',
          lineWidth: lineStyle.width || 1,
          opacity: lineStyle.opacity ?? 0.6,
          fill: undefined,
        }
      )
    }
  }

  /**
   * 渲染节点
   */
  private renderNode(renderer: IRenderer, node: CachedNode, isHovered: boolean = false): void {
    const itemStyle = node.itemStyle || {}
    const emphasisStyle = this.option.emphasis?.itemStyle || {}

    const fillColor = isHovered
      ? (emphasisStyle.color || '#fff')
      : (node.categoryColor || itemStyle.color || '#5470c6')

    const borderColor = isHovered
      ? (emphasisStyle.borderColor || node.categoryColor || '#5470c6')
      : (itemStyle.borderColor || '#fff')

    const borderWidth = isHovered
      ? (emphasisStyle.borderWidth ?? 3)
      : (itemStyle.borderWidth ?? 1)

    const radius = isHovered ? node.radius * 1.2 : node.radius

    renderer.drawCircle(
      { x: node.screenX, y: node.screenY, radius },
      {
        fill: fillColor,
        stroke: borderColor,
        lineWidth: borderWidth,
        opacity: itemStyle.opacity ?? 1,
      }
    )

    // 渲染标签
    const labelOption = node.label || {}
    if (labelOption.show !== false) {
      const position = labelOption.position || 'bottom'
      let labelX = node.screenX
      let labelY = node.screenY
      let textAlign: 'left' | 'center' | 'right' = 'center'
      let textBaseline: 'top' | 'middle' | 'bottom' = 'middle'

      switch (position) {
        case 'inside':
          break
        case 'top':
          labelY = node.screenY - radius - 5
          textBaseline = 'bottom'
          break
        case 'bottom':
          labelY = node.screenY + radius + 5
          textBaseline = 'top'
          break
        case 'left':
          labelX = node.screenX - radius - 5
          textAlign = 'right'
          break
        case 'right':
          labelX = node.screenX + radius + 5
          textAlign = 'left'
          break
      }

      renderer.drawText(
        { text: node.name, x: labelX, y: labelY },
        {
          fill: labelOption.color || '#333',
          fontSize: labelOption.fontSize || 12,
          textAlign,
          textBaseline,
        }
      )
    }
  }

  /**
   * 根据坐标找到节点
   */
  findNodeAtPosition(mouseX: number, mouseY: number): { node: CachedNode | null; index: number } {
    for (let i = 0; i < this.cachedNodes.length; i++) {
      const node = this.cachedNodes[i]!
      const dx = mouseX - node.screenX
      const dy = mouseY - node.screenY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist <= node.radius + 5) {
        return { node, index: i }
      }
    }
    return { node: null, index: -1 }
  }

  /**
   * 销毁
   */
  dispose(): void {
    super.dispose()
    this.cachedNodes = []
    this.cachedLinks = []
  }
}
