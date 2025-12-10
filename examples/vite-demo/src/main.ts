/**
 * LDesign Chart 示例 - 主入口（模块化版本）
 * 展示所有图表类型
 * 支持 URL 路由和浅色/深色主题切换
 */

import {
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Target,
  Gauge,
  Filter,
  CircleDot,
  TrendingUp,
  Flame,
  Network,
  GitBranch,
  Workflow,
  BarChart2,
  Layers,
  Home,
  LayoutGrid,
  ScatterChart,
  RefreshCw,
  Code,
} from 'lucide'
import { createElement } from 'lucide'

// 主题管理
type Theme = 'light' | 'dark'

function getStoredTheme(): Theme {
  return (localStorage.getItem('chart-theme') as Theme) || 'dark'
}

function setTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('chart-theme', theme)
}

function getCurrentTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') as Theme || 'dark'
}

// 获取当前主题的颜色配置
export function getThemeColors() {
  const isDark = getCurrentTheme() === 'dark'
  return {
    textColor: isDark ? '#e2e8f0' : '#334155',
    gridColor: isDark ? '#334155' : '#e2e8f0',
    bgColor: isDark ? '#1e293b' : '#ffffff',
  }
}

// 导入图表模块
import {
  // 折线图
  initLineChart,
  initSmoothLineChart,
  initDashedLineChart,
  initNullLineChart,
  initMultiStyleLineChart,
  initCustomSymbolLineChart,
  initStepLineChart,
  initStackedLineChart,
  initStackedAreaChart,
  initGradientAreaChart,
  initConfidenceBandChart,
  initDualAxisChart,
  initLineWithMarklineChart,
  initBumpChart,
  initNegativeAreaChart,
  initLargeScaleLineChart,
  // 新增折线图
  initTemperatureChart,
  initComparisonChart,
  initRealtimeChart,
  initMultiRangeChart,
  initMarkedLineChart,
  initPercentageChart,
  // 更多场景折线图
  initStockTrendChart,
  initTrafficChart,
  initSalesTrendChart,
  initBudgetActualChart,
  initUserGrowthChart,
  initMoMGrowthChart,
  initMultiMetricChart,
  initCyclicDataChart,
  initGoalProgressChart,
  initSeasonalTrendChart,
  initConversionLineChart,
  initLogGrowthChart,
  initVolatilityChart,
  initIntradayChart,
  initEnergyChart,
  initRegionCompareChart,
  initForecastChart,
  initHealthMetricChart,
  initCompetitorChart,
  initExpandAnimationChart,
  initGrowAnimationChart,
  initHorizontalLineChart,
  disposeAllLineCharts,
  // 柱状图
  initBarChart,
  initStackedBarChart,
  initGroupedBarChart,
  initHorizontalBarChart,
  initNegativeBarChart,
  initWaterfallChart,
  initGradientBarChart,
  initPolarBarChart,
  // 新增柱状图
  initRankingBarChart,
  initPercentStackBarChart,
  initBidirectionalBarChart,
  initMultiSeriesBarChart,
  initSalesBarChart,
  initBudgetBarChart,
  initYoYGrowthBarChart,
  initHistogramChart,
  initBackgroundBarChart,
  initRangeBarChart,
  initMonthlyBarChart,
  initCategoryBarChart,
  initGoalBarChart,
  initMoMChangeBarChart,
  initProfitBarChart,
  initYearlyTrendBarChart,
  initUserDistBarChart,
  initOrderStatusBarChart,
  // 动画示例柱状图
  initExpandAnimationBarChart,
  initGrowAnimationBarChart,
  initFadeAnimationBarChart,
  initLargeDataBarChart,
  initTemperatureBarChart,
  initRatingBarChart,
  initInventoryBarChart,
  initEnergyBarChart,
  initProjectProgressBarChart,
  // 更多柱状图
  initHorizontalStackedBarChart,
  initPopulationPyramidChart,
  initMixedStackBarChart,
  initComparisonBarChart,
  initWaterfallDetailChart,
  initGroupedStackBarChart,
  initRoundedBarChart,
  initThinBarChart,
  initQuarterlyBarChart,
  initBalanceBarChart,
  initHorizontalGroupedBarChart,
  initMarkedBarChart,
  initGradientColorBarChart,
  initMultiLayerStackBarChart,
  initDepartmentBarChart,
  initWeeklyDataBarChart,
  disposeAllBarCharts,
  // 饼图
  initPieChart,
  initDonutChart,
  initRoseChart,
  initHalfPieChart,
  initNestedPieChart,
  disposeAllPieCharts,
  // 散点图
  initScatterChart,
  initBubbleChart,
  initMultiScatterChart,
  initQuadrantScatterChart,
  disposeAllScatterCharts,
  // 混合图表
  initBasicMixedChart,
  initDualAxisMixedChart,
  initSalesProfitMixedChart,
  initMultiBarLineMixedChart,
  initWeatherMixedChart,
  initInventoryMixedChart,
  initTrafficConversionMixedChart,
  initAreaBarMixedChart,
  disposeAllMixedCharts,
} from './charts'

import type { AnimationType } from '@ldesign/chart-core'

// 存储每个图表的动画类型
const chartAnimationTypes = new Map<string, AnimationType>()

// 获取图表的动画类型
export function getChartAnimationType(chartId: string): AnimationType {
  return chartAnimationTypes.get(chartId) || 'rise'
}

// 类型定义
interface ChartConfig {
  id: string
  title: string
  subtitle?: string
  description?: string
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'mixed'
  icon?: unknown
  init: () => void
}

interface NavItem {
  id: string
  label: string
  icon: unknown
}

interface NavSection {
  title: string
  items: NavItem[]
}

// 导航配置
const navSections: NavSection[] = [
  { title: '概览', items: [{ id: 'all', label: '所有图表', icon: Home }] },
  {
    title: '基础图表',
    items: [
      { id: 'line', label: '折线图', icon: LineChart },
      { id: 'bar', label: '柱状图', icon: BarChart3 },
      { id: 'area', label: '面积图', icon: Activity },
      { id: 'scatter', label: '散点图', icon: ScatterChart },
    ],
  },
  {
    title: '比例图表',
    items: [
      { id: 'pie', label: '饼图 / 环形图', icon: PieChart },
      { id: 'funnel', label: '漏斗图', icon: Filter },
    ],
  },
  {
    title: '高级图表',
    items: [
      { id: 'radar', label: '雷达图', icon: Target },
      { id: 'gauge', label: '仪表盘', icon: Gauge },
      { id: 'progress', label: '环形进度', icon: CircleDot },
    ],
  },
  {
    title: '统计图表',
    items: [
      { id: 'candlestick', label: 'K线图', icon: TrendingUp },
      { id: 'heatmap', label: '热力图', icon: Flame },
    ],
  },
  {
    title: '关系图表',
    items: [
      { id: 'graph', label: '关系图', icon: Network },
      { id: 'tree', label: '树图', icon: GitBranch },
      { id: 'sankey', label: '桑基图', icon: Workflow },
    ],
  },
  {
    title: '组合图表',
    items: [
      { id: 'mixed', label: '图表组合', icon: Layers },
    ],
  },
  {
    title: '特殊图表',
    items: [
      { id: 'pictorial', label: '象形柱图', icon: BarChart2 },
    ],
  },
]

// 图表配置列表
const chartConfigs: ChartConfig[] = [
  // 折线图系列 (16种)
  { id: 'line-chart', title: '基础折线图', subtitle: '多系列数据对比', icon: LineChart, type: 'line', init: initLineChart },
  { id: 'smooth-line-chart', title: '平滑折线图', subtitle: '贝塞尔曲线平滑', icon: LineChart, type: 'line', init: initSmoothLineChart },
  { id: 'stacked-line-chart', title: '堆叠折线图', subtitle: '多系列堆叠展示', icon: LineChart, type: 'line', init: initStackedLineChart },
  { id: 'stacked-area-chart', title: '堆叠面积图', subtitle: '区域填充堆叠', icon: LineChart, type: 'line', init: initStackedAreaChart },
  { id: 'gradient-area-chart', title: '渐变面积图', subtitle: '渐变填充效果', icon: LineChart, type: 'line', init: initGradientAreaChart },
  { id: 'step-line-chart', title: '阶梯折线图', subtitle: '阶梯状连接', icon: LineChart, type: 'line', init: initStepLineChart },
  { id: 'dashed-line-chart', title: '虚线折线图', subtitle: '实际值+预测值', icon: LineChart, type: 'line', init: initDashedLineChart },
  { id: 'null-line-chart', title: '空值折线图', subtitle: '数据断点处理', icon: LineChart, type: 'line', init: initNullLineChart },
  { id: 'multi-style-line-chart', title: '多样式折线图', subtitle: '实线/虚线/点线', icon: LineChart, type: 'line', init: initMultiStyleLineChart },
  { id: 'custom-symbol-line-chart', title: '自定义点样式', subtitle: '圆形/方形/三角', icon: LineChart, type: 'line', init: initCustomSymbolLineChart },
  { id: 'dual-axis-chart', title: '双Y轴折线图', subtitle: '双坐标轴展示', icon: LineChart, type: 'line', init: initDualAxisChart },
  { id: 'line-markline-chart', title: '标记线折线图', subtitle: '平均值/最大值标记', icon: LineChart, type: 'line', init: initLineWithMarklineChart },
  { id: 'bump-chart', title: '排名变化图', subtitle: 'Bump Chart', icon: LineChart, type: 'line', init: initBumpChart },
  { id: 'negative-area-chart', title: '正负区域图', subtitle: '正负值分色填充', icon: LineChart, type: 'line', init: initNegativeAreaChart },
  { id: 'large-scale-line-chart', title: '大数据量折线图', subtitle: '200个数据点', icon: LineChart, type: 'line', init: initLargeScaleLineChart },
  { id: 'confidence-band-chart', title: '置信区间图', subtitle: '上下界区间带', icon: LineChart, type: 'line', init: initConfidenceBandChart },
  // 新增折线图 (6种)
  { id: 'temperature-chart', title: '温度变化图', subtitle: '一日温度曲线', icon: LineChart, type: 'line', init: initTemperatureChart },
  { id: 'comparison-chart', title: '多系列对比图', subtitle: '本周/上周/目标对比', icon: LineChart, type: 'line', init: initComparisonChart },
  { id: 'realtime-chart', title: '实时数据图', subtitle: 'CPU监控模拟', icon: LineChart, type: 'line', init: initRealtimeChart },
  { id: 'multi-range-chart', title: '多年度折线图', subtitle: '年度数据对比', icon: LineChart, type: 'line', init: initMultiRangeChart },
  { id: 'marked-line-chart', title: '带标记折线图', subtitle: '平均值/最大值标记', icon: LineChart, type: 'line', init: initMarkedLineChart },
  { id: 'percentage-chart', title: '百分比折线图', subtitle: '完成率趋势', icon: LineChart, type: 'line', init: initPercentageChart },
  // 更多场景折线图 (18种)
  { id: 'stock-trend-chart', title: '股票走势图', subtitle: '分时价格走势', icon: LineChart, type: 'line', init: initStockTrendChart },
  { id: 'traffic-chart', title: '网站流量图', subtitle: 'PV/UV统计', icon: LineChart, type: 'line', init: initTrafficChart },
  { id: 'sales-trend-chart', title: '销售趋势图', subtitle: '年度销售额', icon: LineChart, type: 'line', init: initSalesTrendChart },
  { id: 'budget-actual-chart', title: '预算实际对比', subtitle: '预算vs实际', icon: LineChart, type: 'line', init: initBudgetActualChart },
  { id: 'user-growth-chart', title: '用户增长图', subtitle: '新增/活跃用户', icon: LineChart, type: 'line', init: initUserGrowthChart },
  { id: 'mom-growth-chart', title: '环比增长图', subtitle: '月度环比变化', icon: LineChart, type: 'line', init: initMoMGrowthChart },
  { id: 'multi-metric-chart', title: '多指标监控', subtitle: 'CPU/内存/磁盘', icon: LineChart, type: 'line', init: initMultiMetricChart },
  { id: 'cyclic-data-chart', title: '周期性数据图', subtitle: '24小时周期', icon: LineChart, type: 'line', init: initCyclicDataChart },
  { id: 'goal-progress-chart', title: '目标达成图', subtitle: '周度目标追踪', icon: LineChart, type: 'line', init: initGoalProgressChart },
  { id: 'seasonal-trend-chart', title: '季节性趋势图', subtitle: '年度对比', icon: LineChart, type: 'line', init: initSeasonalTrendChart },
  { id: 'conversion-line-chart', title: '转化漏斗图', subtitle: '用户转化率', icon: LineChart, type: 'line', init: initConversionLineChart },
  { id: 'log-growth-chart', title: '指数增长图', subtitle: '爆发式增长', icon: LineChart, type: 'line', init: initLogGrowthChart },
  { id: 'volatility-chart', title: '波动范围图', subtitle: '高低收盘价', icon: LineChart, type: 'line', init: initVolatilityChart },
  { id: 'intraday-chart', title: '分时走势图', subtitle: '价格与均价', icon: LineChart, type: 'line', init: initIntradayChart },
  { id: 'energy-chart', title: '能耗监控图', subtitle: '用电量预警', icon: LineChart, type: 'line', init: initEnergyChart },
  { id: 'region-compare-chart', title: '区域对比图', subtitle: '多区域销售', icon: LineChart, type: 'line', init: initRegionCompareChart },
  { id: 'forecast-chart', title: '预测区间图', subtitle: '预测上下界', icon: LineChart, type: 'line', init: initForecastChart },
  { id: 'health-metric-chart', title: '健康指标图', subtitle: '步数追踪', icon: LineChart, type: 'line', init: initHealthMetricChart },
  { id: 'competitor-chart', title: '竞品对比图', subtitle: '市场份额对比', icon: LineChart, type: 'line', init: initCompetitorChart },
  { id: 'expand-animation-chart', title: '展开动画图', subtitle: '从左到右展开', icon: LineChart, type: 'line', init: initExpandAnimationChart },
  { id: 'grow-animation-chart', title: '生长动画图', subtitle: '点依次出现', icon: LineChart, type: 'line', init: initGrowAnimationChart },
  { id: 'horizontal-line-chart', title: '水平折线图', subtitle: 'X轴显示值', icon: LineChart, type: 'line', init: initHorizontalLineChart },

  // 柱状图系列 (26种)
  { id: 'bar-chart', title: '基础柱状图', subtitle: '圆角柱形展示', icon: BarChart3, type: 'bar', init: initBarChart },
  { id: 'stacked-bar-chart', title: '堆叠柱状图', subtitle: '多系列堆叠', icon: BarChart3, type: 'bar', init: initStackedBarChart },
  { id: 'grouped-bar-chart', title: '分组柱状图', subtitle: '多年度对比', icon: BarChart3, type: 'bar', init: initGroupedBarChart },
  { id: 'horizontal-bar-chart', title: '横向柱状图', subtitle: '水平条形展示', icon: BarChart3, type: 'bar', init: initHorizontalBarChart },
  { id: 'negative-bar-chart', title: '正负柱状图', subtitle: '正负值分色', icon: BarChart3, type: 'bar', init: initNegativeBarChart },
  { id: 'waterfall-chart', title: '瀑布图', subtitle: '累积变化展示', icon: BarChart3, type: 'bar', init: initWaterfallChart },
  { id: 'gradient-bar-chart', title: '渐变柱状图', subtitle: '渐变填充柱形', icon: BarChart3, type: 'bar', init: initGradientBarChart },
  { id: 'polar-bar-chart', title: '极坐标柱状图', subtitle: '环形扇形柱', icon: BarChart3, type: 'bar', init: initPolarBarChart },
  // 新增柱状图 (18种)
  { id: 'ranking-bar-chart', title: '排行榜柱状图', subtitle: '销量排名展示', icon: BarChart3, type: 'bar', init: initRankingBarChart },
  { id: 'percent-stack-bar-chart', title: '百分比堆叠图', subtitle: '占比堆叠展示', icon: BarChart3, type: 'bar', init: initPercentStackBarChart },
  { id: 'bidirectional-bar-chart', title: '双向柱状图', subtitle: '人口金字塔', icon: BarChart3, type: 'bar', init: initBidirectionalBarChart },
  { id: 'multi-series-bar-chart', title: '多系列对比图', subtitle: '区域销售对比', icon: BarChart3, type: 'bar', init: initMultiSeriesBarChart },
  { id: 'sales-bar-chart', title: '销售业绩图', subtitle: '员工业绩排名', icon: BarChart3, type: 'bar', init: initSalesBarChart },
  { id: 'budget-bar-chart', title: '预算对比图', subtitle: '预算vs实际', icon: BarChart3, type: 'bar', init: initBudgetBarChart },
  { id: 'yoy-growth-bar-chart', title: '同比增长图', subtitle: '年度对比', icon: BarChart3, type: 'bar', init: initYoYGrowthBarChart },
  { id: 'histogram-chart', title: '直方图', subtitle: '频次分布', icon: BarChart3, type: 'bar', init: initHistogramChart },
  { id: 'background-bar-chart', title: '完成度图', subtitle: '进度展示', icon: BarChart3, type: 'bar', init: initBackgroundBarChart },
  { id: 'range-bar-chart', title: '区间柱状图', subtitle: '任务持续时间', icon: BarChart3, type: 'bar', init: initRangeBarChart },
  { id: 'monthly-bar-chart', title: '月度数据图', subtitle: '12月销量', icon: BarChart3, type: 'bar', init: initMonthlyBarChart },
  { id: 'category-bar-chart', title: '分类对比图', subtitle: '线上线下对比', icon: BarChart3, type: 'bar', init: initCategoryBarChart },
  { id: 'goal-bar-chart', title: '目标完成图', subtitle: '团队目标达成', icon: BarChart3, type: 'bar', init: initGoalBarChart },
  { id: 'mom-change-bar-chart', title: '环比变化图', subtitle: '月度环比', icon: BarChart3, type: 'bar', init: initMoMChangeBarChart },
  { id: 'profit-bar-chart', title: '利润分析图', subtitle: '收入成本分析', icon: BarChart3, type: 'bar', init: initProfitBarChart },
  { id: 'yearly-trend-bar-chart', title: '年度趋势图', subtitle: '多年营收', icon: BarChart3, type: 'bar', init: initYearlyTrendBarChart },
  { id: 'user-dist-bar-chart', title: '用户分布图', subtitle: '年龄性别分布', icon: BarChart3, type: 'bar', init: initUserDistBarChart },
  { id: 'order-status-bar-chart', title: '订单状态图', subtitle: '订单分类统计', icon: BarChart3, type: 'bar', init: initOrderStatusBarChart },
  // 动画示例柱状图
  { id: 'expand-animation-bar-chart', title: '展开动画柱状图', subtitle: '从左到右展开', icon: BarChart3, type: 'bar', init: initExpandAnimationBarChart },
  { id: 'grow-animation-bar-chart', title: '生长动画柱状图', subtitle: '依次生长', icon: BarChart3, type: 'bar', init: initGrowAnimationBarChart },
  { id: 'fade-animation-bar-chart', title: '淡入动画柱状图', subtitle: '渐显效果', icon: BarChart3, type: 'bar', init: initFadeAnimationBarChart },
  { id: 'large-data-bar-chart', title: '大数据量柱状图', subtitle: '50个数据点', icon: BarChart3, type: 'bar', init: initLargeDataBarChart },
  { id: 'temperature-bar-chart', title: '温度柱状图', subtitle: '高低温对比', icon: BarChart3, type: 'bar', init: initTemperatureBarChart },
  { id: 'rating-bar-chart', title: '评分柱状图', subtitle: '星级评价分布', icon: BarChart3, type: 'bar', init: initRatingBarChart },
  { id: 'inventory-bar-chart', title: '库存柱状图', subtitle: '出入库统计', icon: BarChart3, type: 'bar', init: initInventoryBarChart },
  { id: 'energy-bar-chart', title: '能耗柱状图', subtitle: '能源消耗堆叠', icon: BarChart3, type: 'bar', init: initEnergyBarChart },
  { id: 'project-progress-bar-chart', title: '项目进度图', subtitle: '完成度展示', icon: BarChart3, type: 'bar', init: initProjectProgressBarChart },
  // 更多柱状图
  { id: 'horizontal-stacked-bar-chart', title: '水平堆叠图', subtitle: '横向堆叠展示', icon: BarChart3, type: 'bar', init: initHorizontalStackedBarChart },
  { id: 'population-pyramid-chart', title: '人口金字塔', subtitle: '双向水平柱状', icon: BarChart3, type: 'bar', init: initPopulationPyramidChart },
  { id: 'mixed-stack-bar-chart', title: '正负堆叠图', subtitle: '收支堆叠展示', icon: BarChart3, type: 'bar', init: initMixedStackBarChart },
  { id: 'comparison-bar-chart', title: '对比柱状图', subtitle: '今年vs去年', icon: BarChart3, type: 'bar', init: initComparisonBarChart },
  { id: 'waterfall-detail-chart', title: '详细瀑布图', subtitle: '累计变化展示', icon: BarChart3, type: 'bar', init: initWaterfallDetailChart },
  { id: 'grouped-stack-bar-chart', title: '分组堆叠图', subtitle: '多组堆叠对比', icon: BarChart3, type: 'bar', init: initGroupedStackBarChart },
  { id: 'rounded-bar-chart', title: '圆角柱状图', subtitle: '大圆角样式', icon: BarChart3, type: 'bar', init: initRoundedBarChart },
  { id: 'thin-bar-chart', title: '细柱状图', subtitle: '密集数据展示', icon: BarChart3, type: 'bar', init: initThinBarChart },
  { id: 'quarterly-bar-chart', title: '季度对比图', subtitle: '四季度对比', icon: BarChart3, type: 'bar', init: initQuarterlyBarChart },
  { id: 'balance-bar-chart', title: '收支平衡图', subtitle: '正负值展示', icon: BarChart3, type: 'bar', init: initBalanceBarChart },
  { id: 'horizontal-grouped-bar-chart', title: '水平分组图', subtitle: '横向分组对比', icon: BarChart3, type: 'bar', init: initHorizontalGroupedBarChart },
  { id: 'marked-bar-chart', title: '带标记柱状图', subtitle: '数据标记展示', icon: BarChart3, type: 'bar', init: initMarkedBarChart },
  { id: 'gradient-color-bar-chart', title: '渐变色柱状图', subtitle: '单色渐变', icon: BarChart3, type: 'bar', init: initGradientColorBarChart },
  { id: 'multi-layer-stack-bar-chart', title: '多层堆叠图', subtitle: '五层堆叠', icon: BarChart3, type: 'bar', init: initMultiLayerStackBarChart },
  { id: 'department-bar-chart', title: '部门业绩图', subtitle: '目标vs实际', icon: BarChart3, type: 'bar', init: initDepartmentBarChart },
  { id: 'weekly-data-bar-chart', title: '周数据图', subtitle: '多指标对比', icon: BarChart3, type: 'bar', init: initWeeklyDataBarChart },

  // 饼图系列 (5种)
  { id: 'pie-chart', title: '饼图', subtitle: '数据占比分析', icon: PieChart, type: 'pie', init: initPieChart },
  { id: 'donut-chart', title: '环形图', subtitle: '中空饼图展示', icon: PieChart, type: 'pie', init: initDonutChart },
  { id: 'rose-chart', title: '玫瑰图', subtitle: '南丁格尔图', icon: PieChart, type: 'pie', init: initRoseChart },
  { id: 'half-pie-chart', title: '半圆饼图', subtitle: '半环形展示', icon: PieChart, type: 'pie', init: initHalfPieChart },
  { id: 'nested-pie-chart', title: '嵌套饼图', subtitle: '多层级嵌套', icon: PieChart, type: 'pie', init: initNestedPieChart },

  // 散点图系列 (4种)
  { id: 'scatter-chart', title: '散点图', subtitle: '多维数据展示', icon: ScatterChart, type: 'scatter', init: initScatterChart },
  { id: 'bubble-chart', title: '气泡图', subtitle: '三维数据展示', icon: ScatterChart, type: 'scatter', init: initBubbleChart },
  { id: 'multi-scatter-chart', title: '多系列散点图', subtitle: '分类散点对比', icon: ScatterChart, type: 'scatter', init: initMultiScatterChart },
  { id: 'quadrant-scatter-chart', title: '象限散点图', subtitle: '四象限分析', icon: ScatterChart, type: 'scatter', init: initQuadrantScatterChart },

  // 组合图表系列 (8种) - 使用 MixedChart 灵活组合 line + bar 系列
  // 核心理念：一个图表，多种系列类型，通过 series.type 指定
  { id: 'basic-mixed-chart', title: '基础组合图', subtitle: 'bar + line 组合', icon: Layers, type: 'mixed', init: initBasicMixedChart },
  { id: 'dual-axis-mixed-chart', title: '双Y轴组合图', subtitle: '不同量级双轴', icon: Layers, type: 'mixed', init: initDualAxisMixedChart },
  { id: 'sales-profit-mixed-chart', title: '销售利润分析', subtitle: '销售额 + 利润率', icon: Layers, type: 'mixed', init: initSalesProfitMixedChart },
  { id: 'multi-bar-line-mixed-chart', title: '多系列组合图', subtitle: '多柱 + 趋势线', icon: Layers, type: 'mixed', init: initMultiBarLineMixedChart },
  { id: 'weather-mixed-chart', title: '气象数据图', subtitle: '降水量 + 温度', icon: Layers, type: 'mixed', init: initWeatherMixedChart },
  { id: 'inventory-mixed-chart', title: '库存周转图', subtitle: '库存量 + 周转率', icon: Layers, type: 'mixed', init: initInventoryMixedChart },
  { id: 'traffic-conversion-mixed-chart', title: '流量转化图', subtitle: 'UV + 转化率', icon: Layers, type: 'mixed', init: initTrafficConversionMixedChart },
  { id: 'area-bar-mixed-chart', title: '面积柱状组合', subtitle: '预算 vs 实际', icon: Layers, type: 'mixed', init: initAreaBarMixedChart },
]

// 初始化 UI
function initUI(): void {
  // Logo 图标
  const logoIcon = document.getElementById('logo-icon')
  if (logoIcon) {
    logoIcon.appendChild(createElement(LayoutGrid))
  }

  // 导航
  const navContainer = document.getElementById('nav-container')
  if (navContainer) {
    navSections.forEach((section) => {
      const sectionEl = document.createElement('div')
      sectionEl.className = 'nav-section'
      sectionEl.innerHTML = `<div class="nav-title">${section.title}</div>`

      section.items.forEach((item) => {
        const itemEl = document.createElement('a')
        itemEl.href = `#${item.id}`
        itemEl.className = 'nav-item'
        itemEl.innerHTML = `<span class="nav-icon"></span>${item.label}`
        itemEl.querySelector('.nav-icon')?.appendChild(createElement(item.icon as Parameters<typeof createElement>[0]))

        itemEl.addEventListener('click', (e) => {
          e.preventDefault()
          setHash(item.id)
          filterCharts(item.id)
          updateNavActive(item.id)
        })

        sectionEl.appendChild(itemEl)
      })

      navContainer.appendChild(sectionEl)
    })
  }

  // 图表网格
  const chartsGrid = document.getElementById('charts-grid')
  if (chartsGrid) {
    chartConfigs.forEach((config) => {
      const card = document.createElement('div')
      card.className = 'chart-card'
      card.setAttribute('data-type', config.type)
      card.setAttribute('data-chart-id', config.id)
      // 折线图和柱状图显示动画选择器
      const animationSelector = (config.type === 'line' || config.type === 'bar') ? `
            <select class="animation-select" data-chart-id="${config.id}" title="动画类型">
              <option value="rise">升起</option>
              <option value="expand">展开</option>
              <option value="grow">生长</option>
              <option value="fade">淡入</option>
              <option value="none">无</option>
            </select>
      ` : ''

      card.innerHTML = `
        <div class="chart-header">
          <div class="chart-header-left">
            <div class="chart-icon"></div>
            <div class="chart-info">
              <div class="chart-title">${config.title}</div>
              <div class="chart-subtitle">${config.subtitle}</div>
            </div>
          </div>
          <div class="chart-header-right">
            ${animationSelector}
            <button class="chart-action-btn" data-action="refresh" title="刷新图表">
              <span class="action-icon refresh-icon"></span>
            </button>
            <button class="chart-action-btn" data-action="code" title="查看代码">
              <span class="action-icon code-icon"></span>
            </button>
          </div>
        </div>
        <div class="chart-container" id="${config.id}"></div>
      `
      card.querySelector('.chart-icon')?.appendChild(createElement(config.icon as Parameters<typeof createElement>[0]))
      card.querySelector('.refresh-icon')?.appendChild(createElement(RefreshCw))
      card.querySelector('.code-icon')?.appendChild(createElement(Code))

      // 绑定按钮事件
      const refreshBtn = card.querySelector('[data-action="refresh"]')
      refreshBtn?.addEventListener('click', () => {
        refreshSingleChart(config.id)
      })

      const codeBtn = card.querySelector('[data-action="code"]')
      codeBtn?.addEventListener('click', () => {
        showChartCode(config.id, config.title)
      })

      // 绑定动画选择器事件
      const animationSelect = card.querySelector('.animation-select') as HTMLSelectElement | null
      if (animationSelect) {
        animationSelect.addEventListener('change', () => {
          const animationType = animationSelect.value as 'rise' | 'expand' | 'grow' | 'fade' | 'none'
          chartAnimationTypes.set(config.id, animationType)
          refreshSingleChart(config.id)
        })
      }

      chartsGrid.appendChild(card)
    })
  }
}

// 刷新单个图表
function refreshSingleChart(chartId: string): void {
  const config = chartConfigs.find(c => c.id === chartId)
  if (config) {
    // 获取对应的销毁和初始化函数
    config.init()
  }
}

// 显示图表代码
function showChartCode(chartId: string, title: string): void {
  // 创建代码弹窗
  const modal = document.createElement('div')
  modal.className = 'code-modal'
  modal.innerHTML = `
    <div class="code-modal-overlay"></div>
    <div class="code-modal-content">
      <div class="code-modal-header">
        <h3>${title} - 示例代码</h3>
        <button class="code-modal-close">&times;</button>
      </div>
      <div class="code-modal-body">
        <pre><code>// 查看 src/charts 目录下的 ${chartId.replace(/-/g, '_')}.ts 文件
// 或访问文档获取完整示例代码
import { LineChart } from '@ldesign/chart-core'

const chart = new LineChart('#${chartId}', {
  renderer: 'canvas', // 或 'svg'
  xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  series: [
    { name: 'Data', data: [120, 200, 150, 80, 70] }
  ]
})</code></pre>
      </div>
    </div>
  `
  document.body.appendChild(modal)

  // 关闭弹窗
  modal.querySelector('.code-modal-overlay')?.addEventListener('click', () => modal.remove())
  modal.querySelector('.code-modal-close')?.addEventListener('click', () => modal.remove())
}

// 统计栏渲染
function renderStatsBar(type: string): void {
  const statsBar = document.getElementById('stats-bar')
  if (!statsBar) return

  // 计算各类型数量
  const totalCharts = chartConfigs.length
  const lineCount = chartConfigs.filter(c => c.type === 'line').length
  const barCount = chartConfigs.filter(c => c.type === 'bar').length
  const pieCount = chartConfigs.filter(c => c.type === 'pie').length
  const scatterCount = chartConfigs.filter(c => c.type === 'scatter').length
  const mixedCount = chartConfigs.filter(c => c.type === 'mixed').length

  // 当前显示的图表数量
  let visibleCount: number
  let categoryLabel: string

  if (type === 'all') {
    visibleCount = totalCharts
    categoryLabel = '所有图表'
  } else if (type === 'line') {
    visibleCount = lineCount
    categoryLabel = '折线图'
  } else if (type === 'bar') {
    visibleCount = barCount
    categoryLabel = '柱状图'
  } else if (type === 'pie') {
    visibleCount = pieCount
    categoryLabel = '饼图'
  } else if (type === 'scatter') {
    visibleCount = scatterCount
    categoryLabel = '散点图'
  } else if (type === 'mixed') {
    visibleCount = mixedCount
    categoryLabel = '组合图'
  } else {
    visibleCount = 0
    categoryLabel = type
  }

  statsBar.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon blue">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect width="18" height="18" x="3" y="3" rx="2"/>
          <path d="M3 9h18"/>
          <path d="M9 21V9"/>
        </svg>
      </div>
      <div class="stat-info">
        <h3>${visibleCount}</h3>
        <p>${categoryLabel}</p>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon green">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 3v18h18"/>
          <path d="m19 9-5 5-4-4-3 3"/>
        </svg>
      </div>
      <div class="stat-info">
        <h3>${lineCount}</h3>
        <p>折线图</p>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon yellow">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 3v18h18"/>
          <rect width="4" height="7" x="7" y="10" rx="1"/>
          <rect width="4" height="12" x="15" y="5" rx="1"/>
        </svg>
      </div>
      <div class="stat-info">
        <h3>${barCount}</h3>
        <p>柱状图</p>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon red">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
          <path d="M22 12A10 10 0 0 0 12 2v10z"/>
        </svg>
      </div>
      <div class="stat-info">
        <h3>${pieCount + scatterCount + mixedCount}</h3>
        <p>其他图表</p>
      </div>
    </div>
  `
}

// 筛选图表
function filterCharts(type: string): void {
  const cards = document.querySelectorAll('.chart-card')
  cards.forEach((card) => {
    const cardType = card.getAttribute('data-type')
    if (type === 'all' || cardType === type) {
      (card as HTMLElement).style.display = 'block'
    } else {
      (card as HTMLElement).style.display = 'none'
    }
  })

  // 更新统计栏
  renderStatsBar(type)
}

// 更新导航高亮状态
function updateNavActive(type: string): void {
  document.querySelectorAll('.nav-item').forEach((el) => {
    el.classList.remove('active')
    if (el.getAttribute('href') === `#${type}`) {
      el.classList.add('active')
    }
  })
}

// 从 URL hash 获取当前类型
function getHashType(): string {
  const hash = window.location.hash.slice(1)
  return hash || 'all'
}

// 设置 URL hash
function setHash(type: string): void {
  window.history.pushState(null, '', `#${type}`)
}

// 初始化所有图表
function initCharts(): void {
  chartConfigs.forEach((config) => {
    try {
      config.init()
    } catch (error) {
      console.error(`Failed to initialize chart: ${config.id}`, error)
    }
  })
}

// 销毁所有图表实例
function disposeAllCharts(): void {
  disposeAllLineCharts()
  disposeAllBarCharts()
  disposeAllPieCharts()
  disposeAllScatterCharts()
  disposeAllMixedCharts()
}

// 重新初始化所有图表（用于主题切换）
function reinitCharts(): void {
  // 先销毁所有图表实例
  disposeAllCharts()
  // 重新初始化
  initCharts()
}

// 渲染模式管理
type RendererMode = 'canvas' | 'svg'
let currentRenderer: RendererMode = 'canvas'

function getStoredRenderer(): RendererMode {
  return (localStorage.getItem('chart-renderer') as RendererMode) || 'canvas'
}

function setRenderer(mode: RendererMode): void {
  currentRenderer = mode
  localStorage.setItem('chart-renderer', mode)
  const btn = document.getElementById('renderer-toggle')
  if (btn) {
    btn.textContent = mode === 'canvas' ? 'Canvas' : 'SVG'
    btn.title = mode === 'canvas' ? '当前: Canvas 渲染' : '当前: SVG 渲染 (开发中)'
  }
}

export function getRendererMode(): RendererMode {
  return currentRenderer
}

// 初始化渲染模式切换
function initRendererToggle(): void {
  const toggleBtn = document.getElementById('renderer-toggle')
  if (!toggleBtn) return

  // 恢复保存的渲染模式
  const savedRenderer = getStoredRenderer()
  setRenderer(savedRenderer)
  toggleBtn.textContent = savedRenderer === 'canvas' ? 'Canvas' : 'SVG'
  toggleBtn.title = savedRenderer === 'canvas' ? 'Canvas 渲染模式' : 'SVG 渲染模式'

  toggleBtn.addEventListener('click', () => {
    const newMode: RendererMode = currentRenderer === 'canvas' ? 'svg' : 'canvas'
    setRenderer(newMode)
    toggleBtn.textContent = newMode === 'canvas' ? 'Canvas' : 'SVG'
    toggleBtn.title = newMode === 'canvas' ? 'Canvas 渲染模式' : 'SVG 渲染模式'
    // 重新初始化所有图表以应用新渲染模式
    reinitCharts()
  })
}

// 初始化主题切换
function initThemeToggle(): void {
  const toggleBtn = document.getElementById('theme-toggle')
  if (!toggleBtn) return

  // 恢复保存的主题
  const savedTheme = getStoredTheme()
  setTheme(savedTheme)

  toggleBtn.addEventListener('click', () => {
    const current = getCurrentTheme()
    const newTheme: Theme = current === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    // 重新绘制所有图表以应用新主题
    reinitCharts()
  })
}

// 初始化路由
function initRouter(): void {
  // 处理 hash 变化
  window.addEventListener('hashchange', () => {
    const type = getHashType()
    filterCharts(type)
    updateNavActive(type)
  })

  // 初始加载时应用 hash
  const initialType = getHashType()
  filterCharts(initialType)
  updateNavActive(initialType)
}

// 初始化 ResizeObserver 监听容器大小变化
function initResizeObserver(): void {
  // 使用防抖处理 resize 事件
  let resizeTimeout: number | null = null

  const resizeObserver = new ResizeObserver(() => {
    // 防抖处理，避免频繁重绘
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }
    resizeTimeout = window.setTimeout(() => {
      // 重新初始化所有图表
      reinitCharts()
    }, 200)
  })

  // 观察图表网格容器
  const chartsGrid = document.getElementById('charts-grid')
  if (chartsGrid) {
    resizeObserver.observe(chartsGrid)
  }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  initUI()
  initThemeToggle()
  initRendererToggle()
  initCharts()
  initRouter()
  initResizeObserver()
})
