/**
 * 统一主题系统
 * 整合分散的颜色定义到统一接口
 */

import type { Theme } from '../theme/interface'

// ============== 调色板 ==============

/**
 * 默认系列调色板
 */
export const DEFAULT_PALETTE: readonly string[] = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#3b82f6', // Blue
] as const

/**
 * ECharts 风格调色板
 */
export const ECHARTS_PALETTE: readonly string[] = [
  '#5470c6',
  '#91cc75',
  '#fac858',
  '#ee6666',
  '#73c0de',
  '#3ba272',
  '#fc8452',
  '#9a60b4',
  '#ea7ccc',
] as const

// ============== 主题颜色 ==============

/**
 * 亮色主题颜色
 */
export const LIGHT_COLORS = {
  // 背景
  background: '#ffffff',

  // 文本
  text: '#1e293b',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',

  // 边框和分割线
  border: '#e2e8f0',
  divider: '#f1f5f9',

  // 网格
  grid: 'rgba(0, 0, 0, 0.06)',
  gridLine: '#e2e8f0',

  // 坐标轴
  axisLine: '#cbd5e1',
  axisTick: '#cbd5e1',
  axisLabel: '#64748b',

  // 提示框
  tooltipBg: 'rgba(255, 255, 255, 0.98)',
  tooltipBorder: '#e2e8f0',
  tooltipText: '#1e293b',
  tooltipShadow: 'rgba(0, 0, 0, 0.1)',

  // 交互状态
  hover: 'rgba(0, 0, 0, 0.04)',
  active: 'rgba(0, 0, 0, 0.08)',
  selected: 'rgba(99, 102, 241, 0.1)',
} as const

/**
 * 暗色主题颜色
 */
export const DARK_COLORS = {
  // 背景
  background: '#1e293b',

  // 文本
  text: '#e2e8f0',
  textPrimary: '#e2e8f0',
  textSecondary: '#94a3b8',
  textTertiary: '#64748b',

  // 边框和分割线
  border: '#334155',
  divider: '#1e293b',

  // 网格
  grid: 'rgba(51, 65, 85, 0.5)',
  gridLine: '#334155',

  // 坐标轴
  axisLine: '#475569',
  axisTick: '#475569',
  axisLabel: '#94a3b8',

  // 提示框
  tooltipBg: 'rgba(15, 23, 42, 0.95)',
  tooltipBorder: '#334155',
  tooltipText: '#e2e8f0',
  tooltipShadow: 'rgba(0, 0, 0, 0.3)',

  // 交互状态
  hover: 'rgba(255, 255, 255, 0.04)',
  active: 'rgba(255, 255, 255, 0.08)',
  selected: 'rgba(99, 102, 241, 0.2)',
} as const

export interface ThemeColors {
  background: string
  text: string
  textPrimary: string
  textSecondary: string
  textTertiary: string
  border: string
  divider: string
  grid: string
  gridLine: string
  axisLine: string
  axisTick: string
  axisLabel: string
  tooltipBg: string
  tooltipBorder: string
  tooltipText: string
  tooltipShadow: string
  hover: string
  active: string
  selected: string
}

// ============== 主题定义 ==============

/**
 * 完整的亮色主题
 */
export const lightTheme: Theme = {
  name: 'light',
  color: {
    palette: [...DEFAULT_PALETTE],
    backgroundColor: LIGHT_COLORS.background,
    textColor: LIGHT_COLORS.text,
    borderColor: LIGHT_COLORS.border,
    splitLineColor: LIGHT_COLORS.divider,
    gridLineColor: LIGHT_COLORS.gridLine,
  },
  component: {
    title: {
      textStyle: {
        color: LIGHT_COLORS.textPrimary,
        fontSize: 18,
        fontWeight: 'bold',
      },
      subtextStyle: {
        color: LIGHT_COLORS.textSecondary,
        fontSize: 12,
      },
    },
    legend: {
      textStyle: {
        color: LIGHT_COLORS.textSecondary,
        fontSize: 12,
      },
      itemGap: 16,
      itemWidth: 16,
      itemHeight: 10,
    },
    axis: {
      axisLine: {
        lineStyle: {
          color: LIGHT_COLORS.axisLine,
          width: 1,
        },
      },
      axisTick: {
        lineStyle: {
          color: LIGHT_COLORS.axisTick,
          width: 1,
        },
      },
      axisLabel: {
        textStyle: {
          color: LIGHT_COLORS.axisLabel,
          fontSize: 11,
        },
      },
      splitLine: {
        lineStyle: {
          color: LIGHT_COLORS.gridLine,
          width: 1,
          type: 'solid',
        },
      },
    },
    tooltip: {
      backgroundColor: LIGHT_COLORS.tooltipBg,
      borderColor: LIGHT_COLORS.tooltipBorder,
      borderWidth: 1,
      textStyle: {
        color: LIGHT_COLORS.tooltipText,
        fontSize: 12,
      },
    },
  },
  series: {
    line: {
      lineWidth: 2,
      smooth: false,
      showSymbol: true,
      symbolSize: 6,
    },
    bar: {
      borderRadius: 4,
      barGap: 0.2,
    },
    scatter: {
      symbolSize: 10,
    },
    area: {
      lineWidth: 2,
      smooth: false,
      opacity: 0.3,
    },
  },
}

/**
 * 完整的暗色主题
 */
export const darkTheme: Theme = {
  name: 'dark',
  color: {
    palette: [...DEFAULT_PALETTE],
    backgroundColor: DARK_COLORS.background,
    textColor: DARK_COLORS.text,
    borderColor: DARK_COLORS.border,
    splitLineColor: DARK_COLORS.divider,
    gridLineColor: DARK_COLORS.gridLine,
  },
  component: {
    title: {
      textStyle: {
        color: DARK_COLORS.textPrimary,
        fontSize: 18,
        fontWeight: 'bold',
      },
      subtextStyle: {
        color: DARK_COLORS.textSecondary,
        fontSize: 12,
      },
    },
    legend: {
      textStyle: {
        color: DARK_COLORS.textSecondary,
        fontSize: 12,
      },
      itemGap: 16,
      itemWidth: 16,
      itemHeight: 10,
    },
    axis: {
      axisLine: {
        lineStyle: {
          color: DARK_COLORS.axisLine,
          width: 1,
        },
      },
      axisTick: {
        lineStyle: {
          color: DARK_COLORS.axisTick,
          width: 1,
        },
      },
      axisLabel: {
        textStyle: {
          color: DARK_COLORS.axisLabel,
          fontSize: 11,
        },
      },
      splitLine: {
        lineStyle: {
          color: DARK_COLORS.gridLine,
          width: 1,
          type: 'solid',
        },
      },
    },
    tooltip: {
      backgroundColor: DARK_COLORS.tooltipBg,
      borderColor: DARK_COLORS.tooltipBorder,
      borderWidth: 1,
      textStyle: {
        color: DARK_COLORS.tooltipText,
        fontSize: 12,
      },
    },
  },
  series: {
    line: {
      lineWidth: 2,
      smooth: false,
      showSymbol: true,
      symbolSize: 6,
    },
    bar: {
      borderRadius: 4,
      barGap: 0.2,
    },
    scatter: {
      symbolSize: 10,
    },
    area: {
      lineWidth: 2,
      smooth: false,
      opacity: 0.3,
    },
  },
}

// ============== 主题管理 ==============

/**
 * 内置主题映射
 */
const builtinThemes: Map<string, Theme> = new Map([
  ['light', lightTheme],
  ['dark', darkTheme],
  ['default', lightTheme],
])

/**
 * 自定义主题注册表
 */
const customThemes: Map<string, Theme> = new Map()

/**
 * 当前全局主题
 */
let currentThemeName: string = 'light'

/**
 * 注册自定义主题
 */
export function registerTheme(name: string, theme: Theme): void {
  customThemes.set(name, { ...theme, name })
}

/**
 * 获取主题
 */
export function getTheme(name: string): Theme {
  return customThemes.get(name) ?? builtinThemes.get(name) ?? lightTheme
}

/**
 * 设置全局默认主题
 */
export function setGlobalTheme(name: string): void {
  currentThemeName = name
}

/**
 * 获取当前全局主题名称
 */
export function getGlobalThemeName(): string {
  return currentThemeName
}

/**
 * 获取当前全局主题
 */
export function getGlobalTheme(): Theme {
  return getTheme(currentThemeName)
}

/**
 * 检测系统主题
 */
export function detectSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'

  // 优先检查 data-theme 属性
  const dataTheme = document.documentElement.getAttribute('data-theme')
  if (dataTheme === 'dark' || dataTheme === 'light') {
    return dataTheme
  }

  // 检查系统偏好
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

/**
 * 根据主题名称获取颜色集
 */
export function getThemeColors(theme: string | Theme): ThemeColors {
  const themeName = typeof theme === 'string' ? theme : theme.name
  return themeName === 'dark' ? DARK_COLORS : LIGHT_COLORS
}

/**
 * 获取系列颜色
 */
export function getSeriesColor(theme: Theme, index: number): string {
  const palette = theme.color.palette
  return palette[index % palette.length] ?? DEFAULT_PALETTE[0]!
}

/**
 * 颜色工具：添加透明度
 */
export function colorWithOpacity(color: string, opacity: number): string {
  if (opacity >= 1) return color
  if (opacity <= 0) return 'transparent'

  // rgba
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/, `${opacity})`)
  }

  // rgb
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`)
  }

  // hex
  if (color.startsWith('#')) {
    let hex = color.slice(1)
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('')
    }
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  return color
}
