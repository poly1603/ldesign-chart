/**
 * 树图系列
 */

import { Series } from './Series'
import type { IRenderer } from '../renderer/interface'
import type { SeriesOption } from '../types'

/**
 * 树节点
 */
export interface TreeNode {
  name: string
  value?: number
  children?: TreeNode[]
  collapsed?: boolean
  itemStyle?: {
    color?: string
    borderColor?: string
    borderWidth?: number
  }
  lineStyle?: {
    color?: string
    width?: number
    curveness?: number
  }
  label?: {
    show?: boolean
    position?: 'inside' | 'top' | 'bottom' | 'left' | 'right'
    color?: string
    fontSize?: number
  }
}

/**
 * 树图配置选项
 */
export interface TreeSeriesOption extends SeriesOption {
  type: 'tree'
  data: TreeNode[]

  // 布局方向
  orient?: 'LR' | 'RL' | 'TB' | 'BT'  // 左右/右左/上下/下上

  // 布局类型
  layout?: 'orthogonal' | 'radial'

  // 符号
  symbol?: string
  symbolSize?: number | [number, number]
  symbolRotate?: number

  // 展开收起
  expandAndCollapse?: boolean
  initialTreeDepth?: number

  // 节点间距
  nodeGap?: number
  levelGap?: number

  // 边类型
  edgeShape?: 'curve' | 'polyline'
  edgeForkPosition?: string

  // 交互
  roam?: boolean | 'scale' | 'move'

  // 叶子节点样式
  leaves?: {
    label?: {
      show?: boolean
      position?: string
      color?: string
      fontSize?: number
    }
    itemStyle?: {
      color?: string
    }
  }

  // 标签
  labelLayout?: {
    hideOverlap?: boolean
  }

  emphasis?: {
    focus?: 'none' | 'self' | 'ancestor' | 'descendant'
    itemStyle?: {
      color?: string
      borderColor?: string
      borderWidth?: number
    }
    lineStyle?: {
      color?: string
      width?: number
    }
  }

  // 层级
  z?: number
  zlevel?: number
}

/**
 * 缓存的树节点
 */
interface CachedTreeNode {
  node: TreeNode
  x: number
  y: number
  depth: number
  parent: CachedTreeNode | null
  children: CachedTreeNode[]
  isLeaf: boolean
  width: number
  height: number
}

// 默认颜色
const DEFAULT_NODE_COLOR = '#5470c6'

/**
 * 树图系列类
 */
export class TreeSeries extends Series {
  protected declare option: TreeSeriesOption
  private cachedNodes: CachedTreeNode[] = []
  private rootNode: CachedTreeNode | null = null
  private hoveredNodeIndex: number = -1
  private containerWidth: number = 800
  private containerHeight: number = 600

  constructor(option: TreeSeriesOption) {
    super(option)
  }

  get type(): string {
    return 'tree'
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
   * 渲染树图
   */
  render(renderer: IRenderer): void {
    const data = this.option.data
    if (!data || data.length === 0) return

    // 构建树结构
    this.buildTree(data[0]!)

    // 计算布局
    this.calculateLayout()

    // 渲染边
    this.renderEdges(renderer)

    // 渲染节点
    for (let i = 0; i < this.cachedNodes.length; i++) {
      const node = this.cachedNodes[i]!
      const isHovered = i === this.hoveredNodeIndex
      this.renderNode(renderer, node, isHovered)
    }
  }

  /**
   * 构建树结构
   */
  private buildTree(rootData: TreeNode): void {
    this.cachedNodes = []

    const buildNode = (
      nodeData: TreeNode,
      depth: number,
      parent: CachedTreeNode | null
    ): CachedTreeNode => {
      const cachedNode: CachedTreeNode = {
        node: nodeData,
        x: 0,
        y: 0,
        depth,
        parent,
        children: [],
        isLeaf: !nodeData.children || nodeData.children.length === 0,
        width: 0,
        height: 0,
      }

      this.cachedNodes.push(cachedNode)

      if (nodeData.children && !nodeData.collapsed) {
        for (const child of nodeData.children) {
          const childNode = buildNode(child, depth + 1, cachedNode)
          cachedNode.children.push(childNode)
        }
      }

      return cachedNode
    }

    this.rootNode = buildNode(rootData, 0, null)
  }

  /**
   * 计算布局
   */
  private calculateLayout(): void {
    if (!this.rootNode) return

    const layout = this.option.layout || 'orthogonal'
    const orient = this.option.orient || 'LR'

    if (layout === 'radial') {
      this.calculateRadialLayout()
    } else {
      this.calculateOrthogonalLayout(orient)
    }
  }

  /**
   * 正交布局
   */
  private calculateOrthogonalLayout(orient: 'LR' | 'RL' | 'TB' | 'BT'): void {
    const nodeGap = this.option.nodeGap ?? 20
    const levelGap = this.option.levelGap ?? 80
    const padding = 50

    // 计算每个节点的子树宽度
    const calculateSubtreeSize = (node: CachedTreeNode): number => {
      if (node.children.length === 0) {
        node.width = 1
        return 1
      }

      let totalWidth = 0
      for (const child of node.children) {
        totalWidth += calculateSubtreeSize(child)
      }
      totalWidth += (node.children.length - 1) * 0.5  // 间距
      node.width = totalWidth
      return totalWidth
    }

    calculateSubtreeSize(this.rootNode!)

    // 分配位置
    const isHorizontal = orient === 'LR' || orient === 'RL'
    const isReverse = orient === 'RL' || orient === 'BT'

    const maxDepth = Math.max(...this.cachedNodes.map(n => n.depth))
    const totalWidth = this.rootNode!.width

    const availableMainAxis = isHorizontal
      ? this.containerWidth - padding * 2
      : this.containerHeight - padding * 2
    const availableCrossAxis = isHorizontal
      ? this.containerHeight - padding * 2
      : this.containerWidth - padding * 2

    const levelSize = availableMainAxis / (maxDepth + 1)
    const unitSize = availableCrossAxis / totalWidth

    const assignPosition = (node: CachedTreeNode, offset: number): void => {
      const mainPos = padding + (isReverse ? maxDepth - node.depth : node.depth) * levelSize + levelSize / 2
      const crossPos = padding + (offset + node.width / 2) * unitSize

      if (isHorizontal) {
        node.x = mainPos
        node.y = crossPos
      } else {
        node.x = crossPos
        node.y = mainPos
      }

      let childOffset = offset
      for (const child of node.children) {
        assignPosition(child, childOffset)
        childOffset += child.width + 0.5
      }
    }

    assignPosition(this.rootNode!, 0)
  }

  /**
   * 径向布局
   */
  private calculateRadialLayout(): void {
    const cx = this.containerWidth / 2
    const cy = this.containerHeight / 2
    const maxRadius = Math.min(cx, cy) * 0.8

    // 计算每个深度层的节点数
    const depthCounts: Map<number, number> = new Map()
    const depthIndices: Map<CachedTreeNode, number> = new Map()

    for (const node of this.cachedNodes) {
      const count = depthCounts.get(node.depth) ?? 0
      depthIndices.set(node, count)
      depthCounts.set(node.depth, count + 1)
    }

    const maxDepth = Math.max(...Array.from(depthCounts.keys()))

    for (const node of this.cachedNodes) {
      const depth = node.depth
      const index = depthIndices.get(node) ?? 0
      const count = depthCounts.get(depth) ?? 1

      const radius = (depth / (maxDepth || 1)) * maxRadius
      const angle = (2 * Math.PI * index) / count - Math.PI / 2

      if (depth === 0) {
        node.x = cx
        node.y = cy
      } else {
        node.x = cx + radius * Math.cos(angle)
        node.y = cy + radius * Math.sin(angle)
      }
    }
  }

  /**
   * 渲染边
   */
  private renderEdges(renderer: IRenderer): void {
    const edgeShape = this.option.edgeShape || 'curve'

    for (const node of this.cachedNodes) {
      if (!node.parent) continue

      const lineStyle = node.node.lineStyle || {}
      const color = lineStyle.color || '#ccc'
      const width = lineStyle.width || 1

      if (edgeShape === 'polyline') {
        this.renderPolylineEdge(renderer, node.parent, node, color, width)
      } else {
        this.renderCurveEdge(renderer, node.parent, node, color, width)
      }
    }
  }

  /**
   * 渲染曲线边
   */
  private renderCurveEdge(
    renderer: IRenderer,
    parent: CachedTreeNode,
    child: CachedTreeNode,
    color: string,
    width: number
  ): void {
    const orient = this.option.orient || 'LR'
    const isHorizontal = orient === 'LR' || orient === 'RL'

    let ctrlX1: number, ctrlY1: number, ctrlX2: number, ctrlY2: number

    if (isHorizontal) {
      const midX = (parent.x + child.x) / 2
      ctrlX1 = midX
      ctrlY1 = parent.y
      ctrlX2 = midX
      ctrlY2 = child.y
    } else {
      const midY = (parent.y + child.y) / 2
      ctrlX1 = parent.x
      ctrlY1 = midY
      ctrlX2 = child.x
      ctrlY2 = midY
    }

    renderer.drawPath(
      {
        commands: [
          { type: 'M', x: parent.x, y: parent.y },
          { type: 'C', x1: ctrlX1, y1: ctrlY1, x2: ctrlX2, y2: ctrlY2, x: child.x, y: child.y },
        ],
      },
      {
        stroke: color,
        lineWidth: width,
        fill: undefined,
      }
    )
  }

  /**
   * 渲染折线边
   */
  private renderPolylineEdge(
    renderer: IRenderer,
    parent: CachedTreeNode,
    child: CachedTreeNode,
    color: string,
    width: number
  ): void {
    const orient = this.option.orient || 'LR'
    const isHorizontal = orient === 'LR' || orient === 'RL'

    let midX: number, midY: number

    if (isHorizontal) {
      midX = (parent.x + child.x) / 2
      midY = parent.y

      renderer.drawPath(
        {
          commands: [
            { type: 'M', x: parent.x, y: parent.y },
            { type: 'L', x: midX, y: parent.y },
            { type: 'L', x: midX, y: child.y },
            { type: 'L', x: child.x, y: child.y },
          ],
        },
        {
          stroke: color,
          lineWidth: width,
          fill: undefined,
        }
      )
    } else {
      midX = parent.x
      midY = (parent.y + child.y) / 2

      renderer.drawPath(
        {
          commands: [
            { type: 'M', x: parent.x, y: parent.y },
            { type: 'L', x: parent.x, y: midY },
            { type: 'L', x: child.x, y: midY },
            { type: 'L', x: child.x, y: child.y },
          ],
        },
        {
          stroke: color,
          lineWidth: width,
          fill: undefined,
        }
      )
    }
  }

  /**
   * 渲染节点
   */
  private renderNode(
    renderer: IRenderer,
    cachedNode: CachedTreeNode,
    isHovered: boolean = false
  ): void {
    const node = cachedNode.node
    const itemStyle = node.itemStyle || {}
    const emphasisStyle = this.option.emphasis?.itemStyle || {}

    const symbolSize = this.getSymbolSize()
    const radius = symbolSize / 2

    const fillColor = isHovered
      ? (emphasisStyle.color || '#fff')
      : (itemStyle.color || DEFAULT_NODE_COLOR)

    const borderColor = isHovered
      ? (emphasisStyle.borderColor || DEFAULT_NODE_COLOR)
      : (itemStyle.borderColor || '#fff')

    const borderWidth = isHovered
      ? (emphasisStyle.borderWidth ?? 3)
      : (itemStyle.borderWidth ?? 2)

    const actualRadius = isHovered ? radius * 1.2 : radius

    renderer.drawCircle(
      { x: cachedNode.x, y: cachedNode.y, radius: actualRadius },
      {
        fill: fillColor,
        stroke: borderColor,
        lineWidth: borderWidth,
      }
    )

    // 渲染标签
    const labelOption = node.label || {}
    if (labelOption.show !== false) {
      const orient = this.option.orient || 'LR'
      const isHorizontal = orient === 'LR' || orient === 'RL'

      let labelX = cachedNode.x
      let labelY = cachedNode.y
      let textAlign: 'left' | 'center' | 'right' = 'center'
      let textBaseline: 'top' | 'middle' | 'bottom' = 'middle'

      const position = labelOption.position || (isHorizontal ? 'right' : 'bottom')

      switch (position) {
        case 'inside':
          break
        case 'top':
          labelY = cachedNode.y - actualRadius - 5
          textBaseline = 'bottom'
          break
        case 'bottom':
          labelY = cachedNode.y + actualRadius + 5
          textBaseline = 'top'
          break
        case 'left':
          labelX = cachedNode.x - actualRadius - 5
          textAlign = 'right'
          break
        case 'right':
          labelX = cachedNode.x + actualRadius + 5
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
   * 获取符号大小
   */
  private getSymbolSize(): number {
    const size = this.option.symbolSize
    if (typeof size === 'number') return size
    if (Array.isArray(size)) return size[0] ?? 10
    return 10
  }

  /**
   * 根据坐标找到节点
   */
  findNodeAtPosition(mouseX: number, mouseY: number): { node: CachedTreeNode | null; index: number } {
    const symbolSize = this.getSymbolSize()
    const radius = symbolSize / 2 + 5

    for (let i = 0; i < this.cachedNodes.length; i++) {
      const node = this.cachedNodes[i]!
      const dx = mouseX - node.x
      const dy = mouseY - node.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist <= radius) {
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
    this.rootNode = null
  }
}
