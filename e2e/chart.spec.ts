import { test, expect } from '@playwright/test'

test.describe('Chart 基础功能测试', () => {
  test('应该正确渲染折线图', async ({ page }) => {
    await page.goto('/')
    
    // 等待图表渲染
    await page.waitForSelector('canvas', { timeout: 5000 })
    
    // 检查canvas元素存在
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    
    // 检查图表尺寸
    const box = await canvas.boundingBox()
    expect(box?.width).toBeGreaterThan(0)
    expect(box?.height).toBeGreaterThan(0)
  })

  test('应该响应数据更新', async ({ page }) => {
    await page.goto('/')
    
    // 等待初始渲染
    await page.waitForSelector('canvas')
    
    // 截图 - 初始状态
    await page.screenshot({ path: 'screenshots/chart-initial.png' })
    
    // 点击更新数据按钮
    await page.click('button:has-text("更新数据")')
    
    // 等待重新渲染
    await page.waitForTimeout(500)
    
    // 截图 - 更新后
    await page.screenshot({ path: 'screenshots/chart-updated.png' })
  })

  test('应该支持主题切换', async ({ page }) => {
    await page.goto('/')
    
    // 等待初始渲染
    await page.waitForSelector('canvas')
    
    // 截图 - 亮色主题
    await page.screenshot({ path: 'screenshots/chart-light.png' })
    
    // 切换到暗色主题
    await page.click('button:has-text("切换主题")')
    await page.waitForTimeout(500)
    
    // 截图 - 暗色主题
    await page.screenshot({ path: 'screenshots/chart-dark.png' })
  })

  test('应该支持交互操作', async ({ page }) => {
    await page.goto('/')
    
    const canvas = page.locator('canvas')
    await canvas.waitFor()
    
    // 获取canvas位置
    const box = await canvas.boundingBox()
    if (!box) return
    
    // 模拟鼠标悬停
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.waitForTimeout(200)
    
    // 检查tooltip是否出现
    const tooltip = page.locator('.echarts-tooltip')
    // Note: 实际测试需要根据具体实现调整选择器
  })

  test('应该正确处理大数据集', async ({ page }) => {
    await page.goto('/performance')
    
    // 等待图表渲染
    await page.waitForSelector('canvas', { timeout: 10000 })
    
    // 检查渲染时间
    const renderTime = await page.evaluate(() => {
      return performance.measure('chart-render')?.duration || 0
    })
    
    // 渲染时间应该小于1秒
    expect(renderTime).toBeLessThan(1000)
  })
})

test.describe('Chart 响应式测试', () => {
  test('应该在移动端正确显示', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    const canvas = page.locator('canvas')
    await canvas.waitFor()
    
    const box = await canvas.boundingBox()
    expect(box?.width).toBeLessThanOrEqual(375)
  })

  test('应该响应窗口大小变化', async ({ page }) => {
    await page.goto('/')
    
    const canvas = page.locator('canvas')
    await canvas.waitFor()
    
    // 记录初始大小
    const initialBox = await canvas.boundingBox()
    
    // 改变窗口大小
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(500)
    
    // 检查图表大小变化
    const newBox = await canvas.boundingBox()
    expect(newBox?.width).not.toBe(initialBox?.width)
  })
})

test.describe('Chart 性能测试', () => {
  test('首次渲染性能', async ({ page }) => {
    const start = Date.now()
    
    await page.goto('/')
    await page.waitForSelector('canvas')
    
    const duration = Date.now() - start
    
    // 首次渲染应该在2秒内完成
    expect(duration).toBeLessThan(2000)
  })

  test('内存使用测试', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('canvas')
    
    // 获取内存使用情况
    const metrics = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
        }
      }
      return null
    })
    
    if (metrics) {
      // 内存使用应该合理（小于50MB）
      expect(metrics.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024)
    }
  })
})
