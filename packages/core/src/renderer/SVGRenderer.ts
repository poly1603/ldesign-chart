/**
 * SVG 渲染器实现
 * 支持动画和更好的交互性
 */

import type {
  IRenderer,
  PathData,
  PathStyle,
  RectStyle,
  Circle,
  CircleStyle,
  Text,
  TextStyle,
  Rect,
  Point,
  LineStyle,
  GradientDef,
  ArcStyle,
  SectorStyle,
  PolygonStyle,
} from './interface'

/**
 * SVG 命名空间
 */
const SVG_NS = 'http://www.w3.org/2000/svg'

/**
 * SVG 渲染器
 */
export class SVGRenderer implements IRenderer {
  private svg: SVGSVGElement | null = null
  private container: HTMLElement | null = null
  private width = 0
  private height = 0
  private currentGroup: SVGGElement | null = null
  private transformStack: { x: number; y: number; rotation: number; scaleX: number; scaleY: number }[] = []
  private clipCounter = 0

  /**
   * 初始化渲染器
   */
  init(container: HTMLElement, width: number, height: number): void {
    this.container = container
    this.width = width
    this.height = height

    // 创建 SVG 元素
    this.svg = document.createElementNS(SVG_NS, 'svg')
    this.svg.setAttribute('width', String(width))
    this.svg.setAttribute('height', String(height))
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    this.svg.style.display = 'block'
    this.svg.style.overflow = 'hidden'
    // 注意：不设置 max-width，因为宽度已经明确指定
    // 如果需要响应式，应该在容器层面处理

    // 添加 defs 用于渐变和剪裁
    const defs = document.createElementNS(SVG_NS, 'defs')
    this.svg.appendChild(defs)

    // 初始化变换栈
    this.transformStack = [{ x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 }]

    container.appendChild(this.svg)
  }

  /**
   * 渲染
   */
  render(): void {
    // SVG 是保留模式渲染，元素已经添加到 DOM
  }

  /**
   * 清空画布
   */
  clear(): void {
    if (!this.svg) return

    // 清空 defs 中的渐变定义，避免累积
    const defs = this.svg.querySelector('defs')
    if (defs) {
      defs.innerHTML = ''
    }

    // 清除其他元素
    while (this.svg.lastChild && this.svg.lastChild !== defs) {
      this.svg.removeChild(this.svg.lastChild)
    }

    this.currentGroup = null
    this.transformStack = [{ x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 }]
    this.clipCounter = 0  // 重置计数器
  }

  /**
   * 调整大小
   */
  resize(width: number, height: number): void {
    if (!this.svg) return

    this.width = width
    this.height = height

    this.svg.setAttribute('width', String(width))
    this.svg.setAttribute('height', String(height))
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
  }

  /**
   * 销毁渲染器
   */
  dispose(): void {
    if (this.svg && this.svg.parentNode) {
      this.svg.parentNode.removeChild(this.svg)
    }
    this.svg = null
    this.container = null
  }

  /**
   * 获取画布宽度
   */
  getWidth(): number {
    return this.width
  }

  /**
   * 获取画布高度
   */
  getHeight(): number {
    return this.height
  }

  /**
   * 获取 SVG 元素
   */
  getSVGElement(): SVGSVGElement | null {
    return this.svg
  }

  /**
   * 绘制路径
   */
  drawPath(path: PathData, style: PathStyle): void {
    if (!this.svg) return

    const pathEl = document.createElementNS(SVG_NS, 'path')
    pathEl.setAttribute('d', this.pathDataToString(path))

    this.applyPathStyle(pathEl, style)
    this.applyTransform(pathEl)
    this.appendElement(pathEl)
  }

  /**
   * 绘制矩形
   */
  drawRect(rect: Rect, style: RectStyle): void {
    if (!this.svg) return

    const rectEl = document.createElementNS(SVG_NS, 'rect')
    rectEl.setAttribute('x', String(rect.x))
    rectEl.setAttribute('y', String(rect.y))
    rectEl.setAttribute('width', String(rect.width))
    rectEl.setAttribute('height', String(rect.height))

    if (style.radius) {
      rectEl.setAttribute('rx', String(style.radius))
      rectEl.setAttribute('ry', String(style.radius))
    }

    this.applyRectStyle(rectEl, style)
    this.applyTransform(rectEl)
    this.appendElement(rectEl)
  }

  /**
   * 绘制圆形
   */
  drawCircle(circle: Circle, style: CircleStyle): void {
    if (!this.svg) return

    const circleEl = document.createElementNS(SVG_NS, 'circle')
    circleEl.setAttribute('cx', String(circle.x))
    circleEl.setAttribute('cy', String(circle.y))
    circleEl.setAttribute('r', String(circle.radius))

    this.applyCircleStyle(circleEl, style)
    this.applyTransform(circleEl)
    this.appendElement(circleEl)
  }

  /**
   * 绘制文本
   */
  drawText(text: Text, style: TextStyle): void {
    if (!this.svg) return

    const textEl = document.createElementNS(SVG_NS, 'text')
    textEl.setAttribute('x', String(text.x))
    textEl.setAttribute('y', String(text.y))
    textEl.textContent = text.text

    this.applyTextStyle(textEl, style)
    this.applyTransform(textEl)
    this.appendElement(textEl)
  }

  /**
   * 保存当前状态
   */
  save(): void {
    const current = this.transformStack[this.transformStack.length - 1]!
    this.transformStack.push({ ...current })
  }

  /**
   * 恢复之前保存的状态
   */
  restore(): void {
    if (this.transformStack.length > 1) {
      this.transformStack.pop()
    }
  }

  /**
   * 平移
   */
  translate(x: number, y: number): void {
    const current = this.transformStack[this.transformStack.length - 1]!
    current.x += x
    current.y += y
  }

  /**
   * 旋转
   */
  rotate(angle: number): void {
    const current = this.transformStack[this.transformStack.length - 1]!
    current.rotation += angle * (180 / Math.PI) // 转换为度数
  }

  /**
   * 缩放
   */
  scale(x: number, y: number): void {
    const current = this.transformStack[this.transformStack.length - 1]!
    current.scaleX *= x
    current.scaleY *= y
  }

  /**
   * 设置剪裁区域
   */
  clip(rect: Rect): void {
    if (!this.svg) return

    const clipId = `clip-${++this.clipCounter}`
    const defs = this.svg.querySelector('defs')!

    const clipPath = document.createElementNS(SVG_NS, 'clipPath')
    clipPath.setAttribute('id', clipId)

    const clipRect = document.createElementNS(SVG_NS, 'rect')
    clipRect.setAttribute('x', String(rect.x))
    clipRect.setAttribute('y', String(rect.y))
    clipRect.setAttribute('width', String(rect.width))
    clipRect.setAttribute('height', String(rect.height))

    clipPath.appendChild(clipRect)
    defs.appendChild(clipPath)

    // 创建新的 group 并应用剪裁
    const group = document.createElementNS(SVG_NS, 'g')
    group.setAttribute('clip-path', `url(#${clipId})`)

    this.appendElement(group)
    this.currentGroup = group
  }

  /**
   * 创建线性渐变
   */
  createLinearGradient(
    id: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    stops: { offset: number; color: string; opacity?: number }[]
  ): string {
    if (!this.svg) return ''

    const defs = this.svg.querySelector('defs')!
    const gradient = document.createElementNS(SVG_NS, 'linearGradient')
    gradient.setAttribute('id', id)
    gradient.setAttribute('x1', `${x1 * 100}%`)
    gradient.setAttribute('y1', `${y1 * 100}%`)
    gradient.setAttribute('x2', `${x2 * 100}%`)
    gradient.setAttribute('y2', `${y2 * 100}%`)

    stops.forEach(stop => {
      const stopEl = document.createElementNS(SVG_NS, 'stop')
      stopEl.setAttribute('offset', `${stop.offset * 100}%`)
      stopEl.setAttribute('stop-color', stop.color)
      if (stop.opacity !== undefined) {
        stopEl.setAttribute('stop-opacity', String(stop.opacity))
      }
      gradient.appendChild(stopEl)
    })

    defs.appendChild(gradient)
    return `url(#${id})`
  }

  /**
   * 创建带动画的元素组
   */
  createAnimatedGroup(options: {
    duration?: number
    delay?: number
    easing?: string
    animationType?: 'fadeIn' | 'scaleIn' | 'slideUp' | 'grow'
  }): SVGGElement {
    const group = document.createElementNS(SVG_NS, 'g')
    const { duration = 800, delay = 0, easing = 'ease-out', animationType = 'fadeIn' } = options

    // 设置初始状态
    switch (animationType) {
      case 'fadeIn':
        group.style.opacity = '0'
        break
      case 'scaleIn':
        group.style.transform = 'scale(0)'
        group.style.transformOrigin = 'center'
        break
      case 'slideUp':
        group.style.transform = 'translateY(20px)'
        group.style.opacity = '0'
        break
      case 'grow':
        group.style.transform = 'scaleY(0)'
        group.style.transformOrigin = 'bottom'
        break
    }

    // 设置 CSS 过渡
    group.style.transition = `all ${duration}ms ${easing} ${delay}ms`

    // 使用 requestAnimationFrame 触发动画
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        switch (animationType) {
          case 'fadeIn':
            group.style.opacity = '1'
            break
          case 'scaleIn':
            group.style.transform = 'scale(1)'
            break
          case 'slideUp':
            group.style.transform = 'translateY(0)'
            group.style.opacity = '1'
            break
          case 'grow':
            group.style.transform = 'scaleY(1)'
            break
        }
      })
    })

    return group
  }

  // ============== 私有方法 ==============

  /**
   * 将路径数据转换为 SVG path d 属性
   */
  private pathDataToString(path: PathData): string {
    return path.commands
      .map(cmd => {
        switch (cmd.type) {
          case 'M':
            return `M ${cmd.x} ${cmd.y}`
          case 'L':
            return `L ${cmd.x} ${cmd.y}`
          case 'C':
            return `C ${cmd.x1} ${cmd.y1} ${cmd.x2} ${cmd.y2} ${cmd.x} ${cmd.y}`
          case 'Q':
            return `Q ${cmd.x1} ${cmd.y1} ${cmd.x} ${cmd.y}`
          case 'A':
            return `A ${cmd.rx} ${cmd.ry} ${cmd.rotation} ${cmd.large ? 1 : 0} ${cmd.sweep ? 1 : 0} ${cmd.x} ${cmd.y}`
          case 'Z':
            return 'Z'
          default:
            return ''
        }
      })
      .join(' ')
  }

  /**
   * 应用路径样式
   */
  private applyPathStyle(el: SVGElement, style: PathStyle): void {
    el.setAttribute('fill', style.fill || 'none')
    el.setAttribute('stroke', style.stroke || 'none')

    if (style.lineWidth) {
      el.setAttribute('stroke-width', String(style.lineWidth))
    }
    if (style.lineCap) {
      el.setAttribute('stroke-linecap', style.lineCap)
    }
    if (style.lineJoin) {
      el.setAttribute('stroke-linejoin', style.lineJoin)
    }
    if (style.lineDash && style.lineDash.length > 0) {
      el.setAttribute('stroke-dasharray', style.lineDash.join(' '))
    }
    if (style.opacity !== undefined) {
      el.setAttribute('opacity', String(style.opacity))
    }
  }

  /**
   * 应用矩形样式
   */
  private applyRectStyle(el: SVGElement, style: RectStyle): void {
    el.setAttribute('fill', style.fill || 'none')
    el.setAttribute('stroke', style.stroke || 'none')

    if (style.lineWidth) {
      el.setAttribute('stroke-width', String(style.lineWidth))
    }
    if (style.opacity !== undefined) {
      el.setAttribute('opacity', String(style.opacity))
    }
  }

  /**
   * 应用圆形样式
   */
  private applyCircleStyle(el: SVGElement, style: CircleStyle): void {
    el.setAttribute('fill', style.fill || 'none')
    el.setAttribute('stroke', style.stroke || 'none')

    if (style.lineWidth) {
      el.setAttribute('stroke-width', String(style.lineWidth))
    }
    if (style.opacity !== undefined) {
      el.setAttribute('opacity', String(style.opacity))
    }
  }

  /**
   * 应用文本样式
   */
  private applyTextStyle(el: SVGTextElement, style: TextStyle): void {
    el.setAttribute('fill', style.fill || '#000')

    if (style.fontSize) {
      el.setAttribute('font-size', String(style.fontSize))
    }
    if (style.fontFamily) {
      el.setAttribute('font-family', style.fontFamily)
    }
    if (style.fontWeight) {
      el.setAttribute('font-weight', String(style.fontWeight))
    }
    if (style.textAlign) {
      const anchor = style.textAlign === 'center' ? 'middle' : style.textAlign === 'right' ? 'end' : 'start'
      el.setAttribute('text-anchor', anchor)
    }
    if (style.textBaseline) {
      const baseline =
        style.textBaseline === 'top'
          ? 'hanging'
          : style.textBaseline === 'middle'
            ? 'central'
            : style.textBaseline === 'bottom'
              ? 'text-bottom'
              : 'alphabetic'
      el.setAttribute('dominant-baseline', baseline)
    }
    if (style.opacity !== undefined) {
      el.setAttribute('opacity', String(style.opacity))
    }
  }

  /**
   * 应用变换
   */
  private applyTransform(el: SVGElement): void {
    const current = this.transformStack[this.transformStack.length - 1]!
    const transforms: string[] = []

    if (current.x !== 0 || current.y !== 0) {
      transforms.push(`translate(${current.x}, ${current.y})`)
    }
    if (current.rotation !== 0) {
      transforms.push(`rotate(${current.rotation})`)
    }
    if (current.scaleX !== 1 || current.scaleY !== 1) {
      transforms.push(`scale(${current.scaleX}, ${current.scaleY})`)
    }

    if (transforms.length > 0) {
      el.setAttribute('transform', transforms.join(' '))
    }
  }

  /**
   * 添加元素到 SVG
   */
  private appendElement(el: SVGElement): void {
    if (this.currentGroup) {
      this.currentGroup.appendChild(el)
    } else if (this.svg) {
      this.svg.appendChild(el)
    }
  }

  /**
   * 绘制线条（多段线）
   */
  drawLine(points: Point[], style: LineStyle, smooth: boolean = false): void {
    if (!this.svg || points.length < 2) return

    const path = document.createElementNS(SVG_NS, 'path')
    let d = `M ${points[0]!.x} ${points[0]!.y}`

    if (smooth) {
      for (let i = 1; i < points.length; i++) {
        const p0 = points[Math.max(0, i - 2)]!
        const p1 = points[i - 1]!
        const p2 = points[i]!
        const p3 = points[Math.min(points.length - 1, i + 1)]!

        const tension = 0.3
        const cp1x = p1.x + (p2.x - p0.x) * tension
        const cp1y = p1.y + (p2.y - p0.y) * tension
        const cp2x = p2.x - (p3.x - p1.x) * tension
        const cp2y = p2.y - (p3.y - p1.y) * tension

        d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`
      }
    } else {
      for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i]!.x} ${points[i]!.y}`
      }
    }

    path.setAttribute('d', d)
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', style.stroke || '#000')
    path.setAttribute('stroke-width', String(style.lineWidth || 1))
    path.setAttribute('stroke-linecap', style.lineCap || 'round')
    path.setAttribute('stroke-linejoin', style.lineJoin || 'round')
    if (style.lineDash && style.lineDash.length > 0) {
      path.setAttribute('stroke-dasharray', style.lineDash.join(' '))
    }
    if (style.opacity !== undefined) {
      path.setAttribute('opacity', String(style.opacity))
    }

    this.applyTransform(path)
    this.appendElement(path)
  }

  /**
   * 绘制填充区域（面积图）
   */
  drawArea(points: Point[], baseY: number, fill: string | GradientDef, smooth: boolean = false): void {
    if (!this.svg || points.length < 2) return

    const path = document.createElementNS(SVG_NS, 'path')
    let d = `M ${points[0]!.x} ${baseY} L ${points[0]!.x} ${points[0]!.y}`

    if (smooth) {
      for (let i = 1; i < points.length; i++) {
        const p0 = points[Math.max(0, i - 2)]!
        const p1 = points[i - 1]!
        const p2 = points[i]!
        const p3 = points[Math.min(points.length - 1, i + 1)]!

        const tension = 0.3
        const cp1x = p1.x + (p2.x - p0.x) * tension
        const cp1y = p1.y + (p2.y - p0.y) * tension
        const cp2x = p2.x - (p3.x - p1.x) * tension
        const cp2y = p2.y - (p3.y - p1.y) * tension

        d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`
      }
    } else {
      for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i]!.x} ${points[i]!.y}`
      }
    }

    d += ` L ${points[points.length - 1]!.x} ${baseY} Z`
    path.setAttribute('d', d)

    // 应用填充
    if (typeof fill === 'string') {
      path.setAttribute('fill', fill)
    } else {
      // 创建渐变
      const gradientId = `gradient-${this.clipCounter++}`
      const defs = this.svg.querySelector('defs')
      if (defs) {
        const gradient = document.createElementNS(SVG_NS, 'linearGradient')
        gradient.setAttribute('id', gradientId)
        gradient.setAttribute('x1', String(fill.x1))
        gradient.setAttribute('y1', String(fill.y1))
        gradient.setAttribute('x2', String(fill.x2))
        gradient.setAttribute('y2', String(fill.y2))
        gradient.setAttribute('gradientUnits', 'userSpaceOnUse')

        for (const stop of fill.stops) {
          const stopEl = document.createElementNS(SVG_NS, 'stop')
          stopEl.setAttribute('offset', `${stop.offset * 100}%`)
          stopEl.setAttribute('stop-color', stop.color)
          gradient.appendChild(stopEl)
        }
        defs.appendChild(gradient)
        path.setAttribute('fill', `url(#${gradientId})`)
      }
    }

    path.setAttribute('stroke', 'none')
    this.applyTransform(path)
    this.appendElement(path)
  }

  /**
   * 获取渲染器类型
   */
  getType(): 'canvas' | 'svg' {
    return 'svg'
  }

  /**
   * 获取根元素
   */
  getElement(): HTMLCanvasElement | SVGSVGElement {
    return this.svg!
  }

  /**
   * 获取 Canvas 2D 上下文（SVG 渲染器返回 null）
   */
  getContext2D(): CanvasRenderingContext2D | null {
    return null
  }

  /**
   * 测量文本宽度
   */
  measureText(text: string, fontSize: number = 12, fontFamily: string = 'sans-serif'): number {
    // SVG 使用临时 canvas 测量文本
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return text.length * fontSize * 0.6
    ctx.font = `${fontSize}px ${fontFamily}`
    return ctx.measureText(text).width
  }

  /**
   * 绘制圆弧
   */
  drawArc(
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    style: ArcStyle,
    counterclockwise: boolean = false
  ): void {
    if (!this.svg) return

    // 计算起点和终点坐标
    const startX = cx + radius * Math.cos(startAngle)
    const startY = cy + radius * Math.sin(startAngle)
    const endX = cx + radius * Math.cos(endAngle)
    const endY = cy + radius * Math.sin(endAngle)

    // 计算弧线角度
    let angleDiff = endAngle - startAngle
    if (counterclockwise) {
      angleDiff = -angleDiff
    }
    const largeArc = Math.abs(angleDiff) > Math.PI ? 1 : 0
    const sweep = counterclockwise ? 0 : 1

    const path = document.createElementNS(SVG_NS, 'path')
    const d = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${endX} ${endY}`
    path.setAttribute('d', d)
    path.setAttribute('fill', style.fill || 'none')
    path.setAttribute('stroke', style.stroke || 'none')
    if (style.lineWidth) {
      path.setAttribute('stroke-width', String(style.lineWidth))
    }
    if (style.opacity !== undefined) {
      path.setAttribute('opacity', String(style.opacity))
    }

    // CSS transition for smooth animation
    path.style.transition = 'all 0.3s ease-out'

    this.applyTransform(path)
    this.appendElement(path)
  }

  /**
   * 绘制扇形（饼图用）- 支持 CSS/SMIL 动画
   */
  drawSector(
    cx: number,
    cy: number,
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number,
    style: SectorStyle
  ): void {
    if (!this.svg) return

    const path = document.createElementNS(SVG_NS, 'path')
    const d = this.createSectorPath(cx, cy, innerRadius, outerRadius, startAngle, endAngle)
    path.setAttribute('d', d)
    path.setAttribute('fill', style.fill || 'none')
    path.setAttribute('stroke', style.stroke || 'none')
    if (style.lineWidth) {
      path.setAttribute('stroke-width', String(style.lineWidth))
    }
    if (style.opacity !== undefined) {
      path.setAttribute('opacity', String(style.opacity))
    }

    // CSS transitions for smooth hover/animation effects
    path.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out'
    path.style.transformOrigin = `${cx}px ${cy}px`

    this.applyTransform(path)
    this.appendElement(path)
  }

  /**
   * 创建扇形路径
   */
  private createSectorPath(
    cx: number,
    cy: number,
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number
  ): string {
    // 外弧起点和终点
    const outerStartX = cx + outerRadius * Math.cos(startAngle)
    const outerStartY = cy + outerRadius * Math.sin(startAngle)
    const outerEndX = cx + outerRadius * Math.cos(endAngle)
    const outerEndY = cy + outerRadius * Math.sin(endAngle)

    // 判断是否为大弧
    const angleDiff = endAngle - startAngle
    const largeArc = Math.abs(angleDiff) > Math.PI ? 1 : 0

    if (innerRadius > 0) {
      // 环形扇形
      const innerStartX = cx + innerRadius * Math.cos(startAngle)
      const innerStartY = cy + innerRadius * Math.sin(startAngle)
      const innerEndX = cx + innerRadius * Math.cos(endAngle)
      const innerEndY = cy + innerRadius * Math.sin(endAngle)

      return `M ${outerStartX} ${outerStartY}
              A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEndX} ${outerEndY}
              L ${innerEndX} ${innerEndY}
              A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStartX} ${innerStartY}
              Z`
    } else {
      // 实心扇形
      return `M ${cx} ${cy}
              L ${outerStartX} ${outerStartY}
              A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEndX} ${outerEndY}
              Z`
    }
  }

  /**
   * 绘制多边形
   */
  drawPolygon(points: Point[], style: PolygonStyle): void {
    if (!this.svg || points.length < 3) return

    const polygon = document.createElementNS(SVG_NS, 'polygon')
    const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ')
    polygon.setAttribute('points', pointsStr)
    polygon.setAttribute('fill', style.fill || 'none')
    polygon.setAttribute('stroke', style.stroke || 'none')
    if (style.lineWidth) {
      polygon.setAttribute('stroke-width', String(style.lineWidth))
    }
    if (style.opacity !== undefined) {
      polygon.setAttribute('opacity', String(style.opacity))
    }

    // CSS transition for smooth animation
    polygon.style.transition = 'all 0.3s ease-out'

    this.applyTransform(polygon)
    this.appendElement(polygon)
  }
}
