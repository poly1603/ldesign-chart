import { ThemeManager } from '../../src/theme/ThemeManager'
import { defaultTheme } from '../../src/theme/themes/default'
import { darkTheme } from '../../src/theme/themes/dark'
import { AnimationManager } from '../../src/animation/AnimationManager'
import { PropertyAnimation } from '../../src/animation/Animation'
import { KeyframeAnimation } from '../../src/animation/KeyframeAnimation'
import type { EasingFunction } from '../../src/animation/easing'

// 初始化主题管理器
const themeManager = new ThemeManager()
themeManager.register('default', defaultTheme)
themeManager.register('dark', darkTheme)
themeManager.setTheme('default')

// 初始化动画管理器
const animationManager = new AnimationManager()

// 当前主题
let currentTheme = 'default'

// 主题演示
function drawThemeDemo(canvas: HTMLCanvasElement, theme: string) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const colors = themeManager.getPalette()
  const barWidth = canvas.width / colors.length
  const barHeight = canvas.height - 100

  colors.forEach((color, index) => {
    ctx.fillStyle = color
    ctx.fillRect(index * barWidth, 50, barWidth - 2, barHeight)
    
    // 绘制颜色值文本
    ctx.fillStyle = '#333'
    ctx.font = '12px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(color, index * barWidth + barWidth / 2, canvas.height - 20)
  })

  // 绘制主题名称
  ctx.fillStyle = '#333'
  ctx.font = 'bold 20px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`当前主题: ${theme}`, canvas.width / 2, 30)
}

// 切换主题
(window as any).switchTheme = (theme: string) => {
  currentTheme = theme
  themeManager.setTheme(theme)
  
  const canvas = document.getElementById('theme-demo') as HTMLCanvasElement
  if (canvas) {
    drawThemeDemo(canvas, theme)
  }

  showThemeInfo()
}

// 显示调色板信息
(window as any).showPalette = () => {
  const colors = themeManager.getPalette()
  const info = document.getElementById('theme-info')
  if (info) {
    info.innerHTML = `
      <strong>当前调色板 (${currentTheme}):</strong><br>
      ${colors.map((c, i) => `颜色 ${i + 1}: ${c}`).join('<br>')}
    `
  }
}

// 显示主题信息
function showThemeInfo() {
  const info = document.getElementById('theme-info')
  const primary = themeManager.getColor('primary')
  const background = themeManager.getColor('background')
  
  if (info) {
    info.innerHTML = `
      <strong>主题信息:</strong><br>
      主题名称: ${currentTheme}<br>
      主色调: ${primary}<br>
      背景色: ${background}
    `
  }
}

// 动画演示
(window as any).playAnimation = (easing: string) => {
  const canvas = document.getElementById('animation-demo') as HTMLCanvasElement
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 停止所有动画
  animationManager.stopAll()

  // 创建属性动画
  const ball = { x: 50, y: canvas.height / 2 }
  
  const animation = new PropertyAnimation({
    target: ball,
    property: 'x',
    from: 50,
    to: canvas.width - 50,
    duration: 2000,
    easing: easing as EasingFunction,
    onUpdate: () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 绘制轨迹线
      ctx.strokeStyle = '#ddd'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(50, canvas.height / 2)
      ctx.lineTo(canvas.width - 50, canvas.height / 2)
      ctx.stroke()
      
      // 绘制小球
      ctx.fillStyle = themeManager.getColor('primary')
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, 20, 0, Math.PI * 2)
      ctx.fill()
      
      // 绘制缓动函数名称
      ctx.fillStyle = '#333'
      ctx.font = 'bold 16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`缓动函数: ${easing}`, canvas.width / 2, 30)
    }
  })

  animationManager.add(animation)
}

// 关键帧动画演示
(window as any).playKeyframeAnimation = () => {
  const canvas = document.getElementById('keyframe-demo') as HTMLCanvasElement
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  animationManager.stopAll()

  const box = { x: 50, y: 50, rotation: 0, scale: 1, opacity: 1 }

  const animation = new KeyframeAnimation({
    keyframes: {
      x: [
        { time: 0, value: 50 },
        { time: 0.5, value: canvas.width - 100 },
        { time: 1, value: 50 }
      ],
      y: [
        { time: 0, value: 50 },
        { time: 0.5, value: canvas.height - 100 },
        { time: 1, value: 50 }
      ],
      rotation: [
        { time: 0, value: 0 },
        { time: 1, value: Math.PI * 4 }
      ],
      scale: [
        { time: 0, value: 1 },
        { time: 0.25, value: 1.5 },
        { time: 0.5, value: 1 },
        { time: 0.75, value: 0.5 },
        { time: 1, value: 1 }
      ]
    },
    duration: 3000,
    loop: true,
    easing: 'easeInOutQuad',
    onUpdate: (values) => {
      Object.assign(box, values)
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 绘制标题
      ctx.fillStyle = '#333'
      ctx.font = 'bold 16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('多属性关键帧动画', canvas.width / 2, 30)
      
      // 保存画布状态
      ctx.save()
      
      // 移动到盒子中心
      ctx.translate(box.x + 25, box.y + 25)
      ctx.rotate(box.rotation)
      ctx.scale(box.scale, box.scale)
      
      // 绘制盒子
      ctx.fillStyle = themeManager.getColor('primary')
      ctx.fillRect(-25, -25, 50, 50)
      
      // 恢复画布状态
      ctx.restore()
    }
  })

  animationManager.add(animation)
}

// 暂停所有动画
(window as any).pauseAllAnimations = () => {
  animationManager.pauseAll()
}

// 继续所有动画
(window as any).resumeAllAnimations = () => {
  animationManager.resumeAll()
}

// 初始化画布
function initCanvas(id: string): HTMLCanvasElement | null {
  const container = document.getElementById(id)
  if (!container) return null

  const canvas = document.createElement('canvas')
  canvas.width = container.clientWidth
  canvas.height = container.clientHeight
  container.innerHTML = ''
  container.appendChild(canvas)

  return canvas
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
  // 初始化所有画布
  const themeCanvas = initCanvas('theme-demo')
  const animationCanvas = initCanvas('animation-demo')
  const keyframeCanvas = initCanvas('keyframe-demo')

  // 绘制初始主题演示
  if (themeCanvas) {
    drawThemeDemo(themeCanvas, 'default')
  }

  // 显示初始主题信息
  showThemeInfo()

  // 绘制动画演示的初始状态
  if (animationCanvas) {
    const ctx = animationCanvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#333'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('点击上方按钮开始动画演示', animationCanvas.width / 2, animationCanvas.height / 2)
    }
  }

  // 绘制关键帧动画的初始状态
  if (keyframeCanvas) {
    const ctx = keyframeCanvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#333'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('点击上方按钮开始关键帧动画', keyframeCanvas.width / 2, keyframeCanvas.height / 2)
    }
  }
})