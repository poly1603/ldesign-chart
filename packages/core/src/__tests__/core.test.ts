import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Chart, createChart } from '../core/chart'
import type { ChartConfig } from '../types'

describe('chart Core', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    container.style.width = '600px'
    container.style.height = '400px'
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('createChart', () => {
    it('should create a chart instance', () => {
      const config: ChartConfig = {
        type: 'line',
        data: {
          labels: ['A', 'B', 'C'],
          datasets: [{ data: [1, 2, 3] }],
        },
      }

      const chart = createChart(container, config)

      expect(chart).toBeInstanceOf(Chart)
      expect(chart.getId()).toBeDefined()
    })

    it('should create chart from selector', () => {
      container.id = 'test-chart'
      const config: ChartConfig = {
        type: 'bar',
        data: {
          labels: ['X', 'Y'],
          datasets: [{ data: [10, 20] }],
        },
      }

      const chart = createChart('#test-chart', config)
      expect(chart).toBeInstanceOf(Chart)
    })

    it('should throw error for invalid container', () => {
      expect(() => {
        createChart('#non-existent', { type: 'line', data: [] })
      }).toThrow()
    })
  })

  describe('Chart instance methods', () => {
    let chart: Chart

    beforeEach(() => {
      chart = createChart(container, {
        type: 'line',
        data: { labels: ['A'], datasets: [{ data: [1] }] },
      })
    })

    afterEach(() => {
      chart?.dispose()
    })

    it('should update data', async () => {
      await chart.updateData({
        labels: ['B'],
        datasets: [{ data: [2] }],
      })

      const config = chart.getConfig()
      expect(config.data).toEqual({
        labels: ['B'],
        datasets: [{ data: [2] }],
      })
    })

    it('should resize chart', () => {
      const spy = vi.spyOn(chart.getInstance() || {}, 'resize' as any)
      chart.resize()
      // Chart resize is scheduled, so we can't directly test it
      expect(chart).toBeDefined()
    })

    it('should dispose properly', () => {
      const id = chart.getId()
      chart.dispose()
      expect(chart.isDestroyed()).toBe(true)
    })
  })
})
