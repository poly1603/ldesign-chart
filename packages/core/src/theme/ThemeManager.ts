/**
 * 主题管理器实现
 */

import type { Theme, IThemeManager } from './interface'
import { defaultTheme } from './themes/default'

/**
 * 主题管理器
 */
export class ThemeManager implements IThemeManager {
  private themes: Map<string, Theme> = new Map()
  private currentTheme: Theme

  constructor() {
    // 注册默认主题
    this.register('default', defaultTheme)
    this.currentTheme = defaultTheme
  }

  /**
   * 注册主题
   */
  register(name: string, theme: Theme): void {
    this.themes.set(name, theme)
  }

  /**
   * 获取主题
   */
  get(name: string): Theme | undefined {
    return this.themes.get(name)
  }

  /**
   * 设置当前主题
   */
  setTheme(name: string): void {
    const theme = this.themes.get(name)
    if (!theme) {
      console.warn(`Theme "${name}" not found, using current theme`)
      return
    }
    this.currentTheme = theme
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): Theme {
    return this.currentTheme
  }

  /**
   * 获取颜色
   */
  getColor(index: number): string {
    const palette = this.currentTheme.color.palette
    return palette[index % palette.length]!
  }

  /**
   * 获取调色板
   */
  getPalette(): string[] {
    return this.currentTheme.color.palette
  }
}