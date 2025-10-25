/**
 * 模拟数据生成器
 */

/**
 * 生成 K线（蜡烛图）数据
 * @param count 数据点数量
 * @param basePrice 基础价格
 */
export function generateCandlestickData(count: number, basePrice = 2000) {
  let base = basePrice
  const data: number[][] = []

  for (let i = 0; i < count; i++) {
    const open = base + (Math.random() * 40 - 20)
    const close = open + (Math.random() * 60 - 30)
    const low = Math.min(open, close) - Math.random() * 20
    const high = Math.max(open, close) + Math.random() * 20

    data.push([
      Math.round(open * 100) / 100,
      Math.round(close * 100) / 100,
      Math.round(low * 100) / 100,
      Math.round(high * 100) / 100
    ])

    base = close
  }

  return data
}

/**
 * 生成热力图数据
 * @param xCount X轴数量
 * @param yCount Y轴数量
 */
export function generateHeatmapData(xCount: number, yCount: number) {
  return Array.from({ length: yCount }, (_, y) =>
    Array.from({ length: xCount }, (_, x) =>
      Math.floor(Math.random() * 100)
    )
  )
}

/**
 * 生成散点数据
 * @param count 数据点数量
 */
export function generateScatterData(count: number) {
  return Array.from({ length: count }, () => [
    Math.round(Math.random() * 100 * 100) / 100,
    Math.round(Math.random() * 100 * 100) / 100
  ])
}

/**
 * 生成气泡图数据（包含大小）
 * @param count 数据点数量
 */
export function generateBubbleData(count: number) {
  return Array.from({ length: count }, () => [
    Math.round(Math.random() * 100 * 100) / 100,
    Math.round(Math.random() * 100 * 100) / 100,
    Math.round(Math.random() * 30 + 5)  // 气泡大小 5-35
  ])
}

/**
 * 生成时间序列数据
 * @param count 数据点数量
 * @param baseValue 基准值
 */
export function generateTimeSeriesData(count: number, baseValue = 100) {
  let value = baseValue
  const data: number[] = []

  for (let i = 0; i < count; i++) {
    value = value + (Math.random() * 20 - 10)
    data.push(Math.round(value))
  }

  return data
}

/**
 * 生成随机整数
 */
export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}


