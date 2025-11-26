/**
 * 主题系统
 */

import type { ThemeOptions } from '../types'

/** 默认主题 */
export const defaultTheme: Required<ThemeOptions> = {
  name: 'default',
  colors: [
    '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
    '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#48b8d0',
  ],
  backgroundColor: 'transparent',
  textColor: '#333',
  axisColor: '#333',
  splitLineColor: '#eee',
  tooltip: {
    backgroundColor: 'rgba(50, 50, 50, 0.9)',
    borderColor: '#333',
    textStyle: { color: '#fff' },
  },
  title: {
    textStyle: { color: '#333', fontSize: 18, fontWeight: 'bold' },
    subtextStyle: { color: '#666', fontSize: 12 },
  },
  legend: {
    textStyle: { color: '#333', fontSize: 12 },
  },
}

/** 暗色主题 */
export const darkTheme: Required<ThemeOptions> = {
  name: 'dark',
  colors: [
    '#4992ff', '#7cffb2', '#fddd60', '#ff6e76', '#58d9f9',
    '#05c091', '#ff8a45', '#8d48e3', '#dd79ff', '#37a2da',
  ],
  backgroundColor: '#100c2a',
  textColor: '#eee',
  axisColor: '#eee',
  splitLineColor: '#333',
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderColor: '#555',
    textStyle: { color: '#eee' },
  },
  title: {
    textStyle: { color: '#eee', fontSize: 18, fontWeight: 'bold' },
    subtextStyle: { color: '#aaa', fontSize: 12 },
  },
  legend: {
    textStyle: { color: '#eee', fontSize: 12 },
  },
}

/** 主题注册表 */
const themes: Map<string, ThemeOptions> = new Map([
  ['default', defaultTheme],
  ['dark', darkTheme],
])

/**
 * 注册主题
 */
export function registerTheme(name: string, theme: ThemeOptions): void {
  themes.set(name, { ...theme, name })
}

/**
 * 获取主题
 */
export function getTheme(name: string): ThemeOptions | undefined {
  return themes.get(name)
}

/**
 * 获取所有主题名称
 */
export function getThemeNames(): string[] {
  return Array.from(themes.keys())
}
