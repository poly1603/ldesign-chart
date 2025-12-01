/**
 * 主题系统接口定义
 */

import type { TextStyle } from '../types'

/**
 * 颜色主题
 */
export interface ColorTheme {
  /** 主色板 */
  palette: string[]
  /** 背景色 */
  backgroundColor?: string
  /** 文本颜色 */
  textColor?: string
  /** 边框颜色 */
  borderColor?: string
  /** 分割线颜色 */
  splitLineColor?: string
  /** 网格线颜色 */
  gridLineColor?: string
}

/**
 * 组件主题
 */
export interface ComponentTheme {
  /** 标题主题 */
  title?: {
    textStyle?: Partial<TextStyle>
    subtextStyle?: Partial<TextStyle>
  }
  /** 图例主题 */
  legend?: {
    textStyle?: Partial<TextStyle>
    itemGap?: number
    itemWidth?: number
    itemHeight?: number
  }
  /** 坐标轴主题 */
  axis?: {
    axisLine?: {
      lineStyle?: {
        color?: string
        width?: number
      }
    }
    axisTick?: {
      lineStyle?: {
        color?: string
        width?: number
      }
    }
    axisLabel?: {
      textStyle?: Partial<TextStyle>
    }
    splitLine?: {
      lineStyle?: {
        color?: string
        width?: number
        type?: 'solid' | 'dashed' | 'dotted'
      }
    }
  }
  /** 提示框主题 */
  tooltip?: {
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    textStyle?: Partial<TextStyle>
  }
}

/**
 * 系列主题
 */
export interface SeriesTheme {
  /** 折线图主题 */
  line?: {
    lineWidth?: number
    smooth?: boolean
    showSymbol?: boolean
    symbolSize?: number
  }
  /** 柱状图主题 */
  bar?: {
    borderRadius?: number
    barWidth?: number
    barGap?: number
  }
  /** 散点图主题 */
  scatter?: {
    symbolSize?: number
  }
  /** 面积图主题 */
  area?: {
    lineWidth?: number
    smooth?: boolean
    opacity?: number
  }
}

/**
 * 完整主题配置
 */
export interface Theme {
  /** 主题名称 */
  name: string
  /** 颜色主题 */
  color: ColorTheme
  /** 组件主题 */
  component?: ComponentTheme
  /** 系列主题 */
  series?: SeriesTheme
}

/**
 * 主题管理器接口
 */
export interface IThemeManager {
  /**
   * 注册主题
   */
  register(name: string, theme: Theme): void

  /**
   * 获取主题
   */
  get(name: string): Theme | undefined

  /**
   * 设置当前主题
   */
  setTheme(name: string): void

  /**
   * 获取当前主题
   */
  getCurrentTheme(): Theme

  /**
   * 获取颜色
   */
  getColor(index: number): string

  /**
   * 获取调色板
   */
  getPalette(): string[]
}