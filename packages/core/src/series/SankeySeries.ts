/**
 * 桑基图系列
 */

import { Series } from './Series'
import type { IRenderer } from '../renderer/interface'
import type { SeriesOption } from '../types'

/**
 * 桑基图节点
 */
export interface SankeyNode {
  name: string
  value?: number
  depth?: number
  itemStyle?: {
    color?: string
    borderColor?: string
    borderWidth?: number
    opacity?: number
  }
  label?: {
    show?: boolean
    position?: 'inside' | 'left' | 'right'
    color?: string
    fontSize?: number
  }
}

/**
 * 桑基图边
 */
export interface SankeyLink {
  source: string
  target: string
  value: number
  lineStyle?: {
    color?: string | 'source' | 'target' | 'gradient'
    opacity?: number
    curveness?: number
  }
}

/**
 * 桑基图配置选项
 */
export interface SankeySeriesOption extends SeriesOption {
  type: 'sankey'
  data: SankeyNode[]
  links: SankeyLink[]

  // 布局方向
  orient?: 'horizontal' | 'vertical'

  // 节点样式
  nodeWidth?: number
  nodeGap?: number
  nodeAlign?: 'left' | 'right' | 'justify'

  // 是否可拖拽
  draggable?: boolean

  // 层级设置
  levels?: Array<{
    depth: number
    itemStyle?: {
      color?: string
    }
    lineStyle?: {
      color?: string
      opacity?: number
    }
  }>

  // 边样式
  lineStyle?: {
    color?: string | 'source' | 'target' | 'gradient'
    opacity?: number
    curveness?: number
  }

  emphasis?: {
    focus?: 'none' | 'self' | 'adjacency' | 'trajectory'
    itemStyle?: {
      color?: string
      borderColor?: string
      borderWidth?: number
    }
    lineStyle?: {
      color?: string
      opacity?: number
    }
    label?: {
      show?: boolean
    }
  }

  // 层级
  z?: number
  zlevel?: number
}

/**
 * 缓存的桑基节点
 */
interface CachedSankeyNode {
  node: SankeyNode
  x: number
  y: number
  width: number
  height: number
  depth: number
  inValue: number
  outValue: number
  color: string
}

/**
 * 缓存的桑基边
 */
interface CachedSankeyLink {
  source: CachedSankeyNode
  target: CachedSankeyNode
  value: number
  sourceY: number
  targetY: number
  linkHeight: number
  original: SankeyLink
}

// 默认颜色
const DEFAULT_COLORS = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
  '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#48b8d0'
]

/**
 * 桑基图系列类
 */
export class SankeySeries extends Series {
  protected declare option: SankeySeriesOption
  private cachedNodes: CachedSankeyNode[] = []
  private cachedLinks: CachedSankeyLink[] = []
  private hoveredNodeIndex: number = -1
  private containerWidth: number = 800
  private containerHeight: number = 600

  constructor(option: SankeySeriesOption) {
    super(option)
  }

  get type(): string {
    return 'sankey'
  }

  /**
   * 设置容器尺寸
   */
  setContainerSize(width: number, height: number): void {
    this.containerWidth = width
    this.containerHeight = height
  }

  /**
   * 设置悬停节点
   */
  setHoveredNodeIndex(index: number): void {
    this.hoveredNodeIndex = index
  }

  /**
   * 渲染桑基图
   */
  render(renderer: IRenderer): void {
    const nodes = this.option.data || []
    const links = this.option.links || []

    if (nodes.length === 0) return

    // 计算布局
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
  private calculateLayout(nodes: SankeyNode[], links: SankeyLink[]): void {
    const orient = this.option.orient || 'horizontal'
    const nodeWidth = this.option.nodeWidth ?? 20
    const nodeGap = this.option.nodeGap ?? 10
    const padding = 50

    // 创建节点映射
    const nodeMap = new Map<string, CachedSankeyNode>()

    // 初始化缓存节点
    this.cachedNodes = nodes.map((node, index) => {
      const cachedNode: CachedSankeyNode = {
        node,
        x: 0,
        y: 0,
        width: nodeWidth,
        height: 0,
        depth: node.depth ?? -1,
        inValue: 0,
        outValue: 0,
        color: node.itemStyle?.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]!,
      }
      nodeMap.set(node.name, cachedNode)
      return cachedNode
    })

    // 计算节点的流入/流出值
    for (const link of links) {
      const source = nodeMap.get(link.source)
      const target = nodeMap.get(link.target)
      if (source) source.outValue += link.value
      if (target) target.inValue += link.value
    }

    // 如果没有指定深度，计算深度
    this.calculateDepths(nodeMap, links)

    // 按深度分组
    const depthGroups = new Map<number, CachedSankeyNode[]>()
    for (const node of this.cachedNodes) {
      const group = depthGroups.get(node.depth) || []
      group.push(node)
      depthGroups.set(node.depth, group)
    }

    const maxDepth = Math.max(...Array.from(depthGroups.keys()))
    const isHorizontal = orient === 'horizontal'

    // 计算总流量用于缩放
    const totalValue = Math.max(
      ...this.cachedNodes.map(n => Math.max(n.inValue, n.outValue, 1))
    )

    const mainAxisSize = isHorizontal
      ? this.containerWidth - padding * 2
      : this.containerHeight - padding * 2
    const crossAxisSize = isHorizontal
      ? this.containerHeight - padding * 2
      : this.containerWidth - padding * 2

    const depthSize = mainAxisSize / (maxDepth + 1)
    const valueScale = (crossAxisSize - nodeGap * 10) / (totalValue * 2)

    // 计算每个深度组的节点位置
    for (const [depth, group] of depthGroups) {
      const mainPos = padding + depth * depthSize + depthSize / 2 - nodeWidth / 2

      // 计算该组的总高度
      let totalHeight = 0
      for (const node of group) {
        node.height = Math.max(10, Math.max(node.inValue, node.outValue) * valueScale)
        totalHeight += node.height
      }
      totalHeight += (group.length - 1) * nodeGap

      // 居中分布
      let crossPos = padding + (crossAxisSize - totalHeight) / 2

      for (const node of group) {
        if (isHorizontal) {
          node.x = mainPos
          node.y = crossPos
        } else {
          node.x = crossPos
          node.y = mainPos
        }
        crossPos += node.height + nodeGap
      }
    }

    // 创建缓存边
    this.cachedLinks = []
    const sourceOffsets = new Map<string, number>()
    const targetOffsets = new Map<string, number>()

    for (const link of links) {
      const source = nodeMap.get(link.source)
      const target = nodeMap.get(link.target)
      if (!source || !target) continue

      const sourceOffset = sourceOffsets.get(link.source) || 0
      const targetOffset = targetOffsets.get(link.target) || 0

      const linkHeight = (link.value / Math.max(source.outValue, 1)) * source.height

      this.cachedLinks.push({
        source,
        target,
        value: link.value,
        sourceY: source.y + sourceOffset,
        targetY: target.y + targetOffset,
        linkHeight,
        original: link,
      })

      sourceOffsets.set(link.source, sourceOffset + linkHeight)
      targetOffsets.set(link.target, targetOffset + (link.value / Math.max(target.inValue, 1)) * target.height)
    }
  }

  /**
   * 计算节点深度
   */
  private calculateDepths(nodeMap: Map<string, CachedSankeyNode>, links: SankeyLink[]): void {
    // 找出所有没有入边的节点作为起始节点
    const hasIncoming = new Set<string>()
    for (const link of links) {
      hasIncoming.add(link.target)
    }

    // 广度优先遍历设置深度
    const queue: string[] = []
    for (const [name, node] of nodeMap) {
      if (node.depth >= 0) continue  // 已指定深度
      if (!hasIncoming.has(name)) {
        node.depth = 0
        queue.push(name)
      }
    }

    // 如果没有找到起始节点，使用第一个节点
    if (queue.length === 0 && nodeMap.size > 0) {
      const first = this.cachedNodes[0]!
      first.depth = 0
      queue.push(first.node.name)
    }

    // BFS
    while (queue.length > 0) {
      const current = queue.shift()!
      const currentNode = nodeMap.get(current)!

      for (const link of links) {
        if (link.source === current) {
          const target = nodeMap.get(link.target)
          if (target && target.depth < 0) {
            target.depth = currentNode.depth + 1
            queue.push(link.target)
          }
        }
      }
    }

    // 处理未访问的节点
    for (const node of this.cachedNodes) {
      if (node.depth < 0) node.depth = 0
    }
  }

  /**
   * 渲染边
   */
  private renderLink(renderer: IRenderer, link: CachedSankeyLink): void {
    const orient = this.option.orient || 'horizontal'
    const lineStyle = link.original.lineStyle || this.option.lineStyle || {}
    const curveness = lineStyle.curveness ?? 0.5
    const opacity = lineStyle.opacity ?? 0.3

    // 确定颜色
    let color: string
    const colorOption = lineStyle.color || 'source'
    if (colorOption === 'source') {
      color = link.source.color
    } else if (colorOption === 'target') {
      color = link.target.color
    } else if (typeof colorOption === 'string') {
      color = colorOption
    } else {
      color = link.source.color
    }

    const isHorizontal = orient === 'horizontal'

    if (isHorizontal) {
      const x1 = link.source.x + link.source.width
      const y1Top = link.sourceY
      const y1Bottom = link.sourceY + link.linkHeight
      const x2 = link.target.x
      const y2Top = link.targetY
      const y2Bottom = link.targetY + (link.value / Math.max(link.target.inValue, 1)) * link.target.height

      const midX = x1 + (x2 - x1) * curveness

      renderer.drawPath(
        {
          commands: [
            { type: 'M', x: x1, y: y1Top },
            { type: 'C', x1: midX, y1: y1Top, x2: midX, y2: y2Top, x: x2, y: y2Top },
            { type: 'L', x: x2, y: y2Bottom },
            { type: 'C', x1: midX, y1: y2Bottom, x2: midX, y2: y1Bottom, x: x1, y: y1Bottom },
            { type: 'Z' },
          ],
        },
        {
          fill: color,
          opacity,
          stroke: undefined,
        }
      )
    } else {
      // 垂直布局
      const y1 = link.source.y + link.source.height
      const x1Left = link.source.x + link.sourceY - link.source.y
      const x1Right = x1Left + link.linkHeight
      const y2 = link.target.y
      const x2Left = link.target.x + link.targetY - link.target.y
      const x2Right = x2Left + (link.value / Math.max(link.target.inValue, 1)) * link.target.width

      const midY = y1 + (y2 - y1) * curveness

      renderer.drawPath(
        {
          commands: [
            { type: 'M', x: x1Left, y: y1 },
            { type: 'C', x1: x1Left, y1: midY, x2: x2Left, y2: midY, x: x2Left, y: y2 },
            { type: 'L', x: x2Right, y: y2 },
            { type: 'C', x1: x2Right, y1: midY, x2: x1Right, y2: midY, x: x1Right, y: y1 },
            { type: 'Z' },
          ],
        },
        {
          fill: color,
          opacity,
          stroke: undefined,
        }
      )
    }
  }

  /**
   * 渲染节点
   */
  private renderNode(
    renderer: IRenderer,
    node: CachedSankeyNode,
    isHovered: boolean = false
  ): void {
    const itemStyle = node.node.itemStyle || {}
    const emphasisStyle = this.option.emphasis?.itemStyle || {}

    const fillColor = isHovered
      ? (emphasisStyle.color || node.color)
      : node.color

    const borderColor = isHovered
      ? (emphasisStyle.borderColor || '#fff')
      : (itemStyle.borderColor || undefined)

    const borderWidth = isHovered
      ? (emphasisStyle.borderWidth ?? 2)
      : (itemStyle.borderWidth ?? 0)

    const opacity = itemStyle.opacity ?? 1

    renderer.drawPath(
      {
        commands: [
          { type: 'M', x: node.x, y: node.y },
          { type: 'L', x: node.x + node.width, y: node.y },
          { type: 'L', x: node.x + node.width, y: node.y + node.height },
          { type: 'L', x: node.x, y: node.y + node.height },
          { type: 'Z' },
        ],
      },
      {
        fill: fillColor,
        stroke: borderColor,
        lineWidth: borderWidth,
        opacity,
      }
    )

    // 渲染标签
    const labelOption = node.node.label || {}
    if (labelOption.show !== false) {
      const position = labelOption.position || 'right'
      let labelX = node.x + node.width / 2
      let labelY = node.y + node.height / 2
      let textAlign: 'left' | 'center' | 'right' = 'center'

      switch (position) {
        case 'inside':
          break
        case 'left':
          labelX = node.x - 5
          textAlign = 'right'
          break
        case 'right':
          labelX = node.x + node.width + 5
          textAlign = 'left'
          break
      }

      renderer.drawText(
        { text: node.node.name, x: labelX, y: labelY },
        {
          fill: labelOption.color || '#333',
          fontSize: labelOption.fontSize || 12,
          textAlign,
          textBaseline: 'middle',
        }
      )
    }
  }

  /**
   * 根据坐标找到节点
   */
  findNodeAtPosition(mouseX: number, mouseY: number): { node: CachedSankeyNode | null; index: number } {
    for (let i = 0; i < this.cachedNodes.length; i++) {
      const node = this.cachedNodes[i]!
      if (
        mouseX >= node.x &&
        mouseX <= node.x + node.width &&
        mouseY >= node.y &&
        mouseY <= node.y + node.height
      ) {
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
