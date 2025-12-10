import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/line',
  },
  {
    path: '/line',
    name: 'Line',
    component: () => import('@/views/LineChart.vue'),
    meta: { title: '折线图', icon: 'line' },
  },
  {
    path: '/bar',
    name: 'Bar',
    component: () => import('@/views/BarChart.vue'),
    meta: { title: '柱状图', icon: 'bar' },
  },
  {
    path: '/pie',
    name: 'Pie',
    component: () => import('@/views/PieChart.vue'),
    meta: { title: '饼图', icon: 'pie' },
  },
  {
    path: '/scatter',
    name: 'Scatter',
    component: () => import('@/views/ScatterChart.vue'),
    meta: { title: '散点图', icon: 'scatter' },
  },
  {
    path: '/candlestick',
    name: 'Candlestick',
    component: () => import('@/views/CandlestickChart.vue'),
    meta: { title: 'K线图', icon: 'candlestick' },
  },
  {
    path: '/radar',
    name: 'Radar',
    component: () => import('@/views/RadarChart.vue'),
    meta: { title: '雷达图', icon: 'radar' },
  },
  {
    path: '/heatmap',
    name: 'Heatmap',
    component: () => import('@/views/HeatmapChart.vue'),
    meta: { title: '热力图', icon: 'heatmap' },
  },
  {
    path: '/graph',
    name: 'Graph',
    component: () => import('@/views/GraphChart.vue'),
    meta: { title: '关系图', icon: 'graph' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
export { routes }
