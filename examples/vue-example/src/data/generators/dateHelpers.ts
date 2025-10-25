/**
 * 日期辅助函数
 */

/**
 * 生成日期范围
 * @param start 开始日期（YYYY-MM）
 * @param end 结束日期（YYYY-MM）
 * @param unit 单位（month/week/day）
 */
export function generateDateRange(
  start: string,
  end: string,
  unit: 'month' | 'week' | 'day' = 'month'
): string[] {
  const dates: string[] = []
  const startDate = new Date(start + '-01')
  const endDate = new Date(end + '-01')

  let current = new Date(startDate)

  while (current <= endDate) {
    if (unit === 'month') {
      dates.push(current.toISOString().substring(0, 7))
      current.setMonth(current.getMonth() + 1)
    } else if (unit === 'week') {
      dates.push(current.toISOString().substring(0, 10))
      current.setDate(current.getDate() + 7)
    } else {
      dates.push(current.toISOString().substring(0, 10))
      current.setDate(current.getDate() + 1)
    }
  }

  return dates
}

/**
 * 格式化日期
 */
export function formatDate(date: Date, format = 'YYYY-MM-DD'): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
}

/**
 * 生成最近N天的日期
 */
export function getRecentDays(count: number): string[] {
  const dates: string[] = []
  const today = new Date()

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(formatDate(date))
  }

  return dates
}


