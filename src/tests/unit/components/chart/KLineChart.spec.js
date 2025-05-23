// src/tests/unit/components/chart/KLineChart.spec.js

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import KLineChart from '@/components/chart/KLineChart.vue'
import { useStockStore } from '@/stores/stock.store'

// 模拟 lightweight-charts
vi.mock('lightweight-charts', () => ({
  createChart: vi.fn(() => ({
    addCandlestickSeries: vi.fn(() => ({
      setData: vi.fn(),
    })),
    timeScale: vi.fn(() => ({
      fitContent: vi.fn(),
    })),
    remove: vi.fn(),
  })),
}))

describe('KLineChart.vue', () => {
  let wrapper
  let stockStore

  const factory = (props = {}) => {
    return mount(KLineChart, {
      props: {
        symbol: 'AAPL',
        timeframe: '1D',
        ...props,
      },
      global: {
        plugins: [createPinia()],
      },
    })
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    stockStore = useStockStore()
    stockStore.klineData = [{ time: 1620000000, open: 100, high: 101, low: 99, close: 100.5 }]
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('正确渲染图表容器', async () => {
    wrapper = factory()
    await nextTick()

    expect(wrapper.find('.kline-chart-container').exists()).toBe(true)
    expect(wrapper.find('.loading-overlay').exists()).toBe(false)
  })

  it('显示加载状态', async () => {
    stockStore.klineData = []
    wrapper = factory()

    expect(wrapper.find('.loading-overlay').exists()).toBe(true)
  })

  it('初始化时创建图表实例', async () => {
    const { createChart } = await import('lightweight-charts')
    wrapper = factory()
    await nextTick()

    expect(createChart).toHaveBeenCalled()
    expect(wrapper.vm.chart).toBeTruthy()
  })

  it('正确响应数据更新', async () => {
    wrapper = factory()
    await nextTick()

    const newData = [{ time: 1620003600, open: 100.5, high: 102, low: 100, close: 101.2 }]
    await wrapper.setProps({ symbol: 'GOOGL' })
    stockStore.klineData = newData
    await nextTick()

    expect(wrapper.vm.candleSeries.setData).toHaveBeenCalledWith(newData)
  })

  it('时间框架变化时重新加载数据', async () => {
    wrapper = factory()
    await nextTick()

    stockStore.fetchKLineData = vi.fn()
    await wrapper.setProps({ timeframe: '1H' })

    expect(stockStore.fetchKLineData).toHaveBeenCalledWith('AAPL', '1H')
  })

  it('组件卸载时清理图表实例', async () => {
    wrapper = factory()
    await nextTick()
    const chartInstance = wrapper.vm.chart

    wrapper.unmount()
    await nextTick()

    expect(chartInstance.remove).toHaveBeenCalled()
  })

  it('处理空数据状态', async () => {
    stockStore.klineData = []
    wrapper = factory()
    await nextTick()

    expect(wrapper.find('.data-empty').exists()).toBe(true)
  })

  it('应用正确的图表主题', async () => {
    const { createChart } = await import('lightweight-charts')
    wrapper = factory()
    await nextTick()

    expect(createChart).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        layout: {
          background: { color: expect.any(String) },
          textColor: expect.any(String),
        },
      }),
    )
  })
})
