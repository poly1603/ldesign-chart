/**
 * ThemeManager 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ThemeManager } from '../ThemeManager'
import { defaultTheme, darkTheme } from '../themes'
import type { Theme } from '../interface'

describe('ThemeManager', () => {
  let themeManager: ThemeManager

  beforeEach(() => {
    themeManager = new ThemeManager()
  })

  describe('初始化', () => {
    it('应该使用默认主题初始化', () => {
      expect(themeManager.getCurrentTheme()).toBeDefined()
      expect(themeManager.getCurrentTheme().name).toBe('default')
    })

    it('应该返回默认调色板', () => {
      const palette = themeManager.getPalette()
      expect(palette).toBeDefined()
      expect(Array.isArray(palette)).toBe(true)
      expect(palette.length).toBeGreaterThan(0)
    })
  })

  describe('主题注册', () => {
    it('应该能注册新主题', () => {
      const customTheme: Theme = {
        name: 'custom',
        color: {
          palette: ['#FF0000', '#00FF00', '#0000FF'],
          backgroundColor: '#FFFFFF',
          textColor: '#333333',
        },
      }

      themeManager.register('custom', customTheme)
      const theme = themeManager.get('custom')
      
      expect(theme).toBeDefined()
      expect(theme?.name).toBe('custom')
      expect(theme?.color.palette).toEqual(['#FF0000', '#00FF00', '#0000FF'])
    })

    it('应该能覆盖已存在的主题', () => {
      const theme1: Theme = {
        name: 'test',
        color: { palette: ['#FF0000'] },
      }
      const theme2: Theme = {
        name: 'test',
        color: { palette: ['#00FF00'] },
      }

      themeManager.register('test', theme1)
      themeManager.register('test', theme2)

      const result = themeManager.get('test')
      expect(result?.color.palette).toEqual(['#00FF00'])
    })
  })

  describe('主题切换', () => {
    beforeEach(() => {
      themeManager.register('default', defaultTheme)
      themeManager.register('dark', darkTheme)
    })

    it('应该能切换到已注册的主题', () => {
      themeManager.setTheme('dark')
      expect(themeManager.getCurrentTheme().name).toBe('dark')
    })

    it('切换不存在的主题应该保持当前主题', () => {
      const currentTheme = themeManager.getCurrentTheme().name
      themeManager.setTheme('nonexistent')
      expect(themeManager.getCurrentTheme().name).toBe(currentTheme)
    })

    it('切换主题后调色板应该更新', () => {
      themeManager.setTheme('default')
      const defaultPalette = themeManager.getPalette()

      themeManager.setTheme('dark')
      const darkPalette = themeManager.getPalette()

      expect(defaultPalette).not.toEqual(darkPalette)
    })
  })

  describe('获取颜色', () => {
    beforeEach(() => {
      const testTheme: Theme = {
        name: 'test',
        color: {
          palette: ['#FF0000', '#00FF00', '#0000FF'],
        },
      }
      themeManager.register('test', testTheme)
      themeManager.setTheme('test')
    })

    it('应该按索引返回调色板中的颜色', () => {
      expect(themeManager.getColor(0)).toBe('#FF0000')
      expect(themeManager.getColor(1)).toBe('#00FF00')
      expect(themeManager.getColor(2)).toBe('#0000FF')
    })

    it('超出范围的索引应该循环', () => {
      expect(themeManager.getColor(3)).toBe('#FF0000')
      expect(themeManager.getColor(4)).toBe('#00FF00')
      expect(themeManager.getColor(5)).toBe('#0000FF')
    })

    it('负数索引应该从末尾循环', () => {
      expect(themeManager.getColor(-1)).toBe('#0000FF')
      expect(themeManager.getColor(-2)).toBe('#00FF00')
      expect(themeManager.getColor(-3)).toBe('#FF0000')
    })
  })

  describe('内置主题', () => {
    it('默认主题应该有正确的结构', () => {
      expect(defaultTheme.name).toBe('default')
      expect(defaultTheme.color).toBeDefined()
      expect(defaultTheme.color.palette).toBeDefined()
      expect(Array.isArray(defaultTheme.color.palette)).toBe(true)
      expect(defaultTheme.color.palette.length).toBeGreaterThan(0)
    })

    it('暗色主题应该有正确的结构', () => {
      expect(darkTheme.name).toBe('dark')
      expect(darkTheme.color).toBeDefined()
      expect(darkTheme.color.palette).toBeDefined()
      expect(darkTheme.color.backgroundColor).toBeDefined()
    })

    it('默认主题和暗色主题应该有不同的调色板', () => {
      expect(defaultTheme.color.palette).not.toEqual(darkTheme.color.palette)
    })
  })

  describe('主题属性', () => {
    it('应该支持组件主题配置', () => {
      const themeWithComponent: Theme = {
        name: 'test',
        color: { palette: ['#FF0000'] },
        component: {
          title: {
            textStyle: { color: '#333333' },
          },
        },
      }

      themeManager.register('test', themeWithComponent)
      themeManager.setTheme('test')

      const theme = themeManager.getCurrentTheme()
      expect(theme.component).toBeDefined()
      expect(theme.component?.title).toBeDefined()
    })

    it('应该支持系列主题配置', () => {
      const themeWithSeries: Theme = {
        name: 'test',
        color: { palette: ['#FF0000'] },
        series: {
          line: {
            lineWidth: 3,
            smooth: true,
          },
        },
      }

      themeManager.register('test', themeWithSeries)
      themeManager.setTheme('test')

      const theme = themeManager.getCurrentTheme()
      expect(theme.series).toBeDefined()
      expect(theme.series?.line).toBeDefined()
      expect(theme.series?.line?.lineWidth).toBe(3)
    })
  })
})