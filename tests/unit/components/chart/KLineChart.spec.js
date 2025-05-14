import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import KLineChart from '@/components/chart/KLineChart.vue'
import { useStockStore } from '@/stores/stock.store'

// 模拟 lightweight-charts 库
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

// 模拟 WebSocket 相关逻辑
vi.mock('@/composables/useWebSocket', () => ({
  useWebSocket: () => ({
    connect: vi.fn(),
    send: vi.fn(),
  }),
}))

describe('KLineChart.vue', () => {
  let wrapper
  let stockStore

  const defaultProps = {
    symbol: 'AAPL',
    timeframe: '1D',
  }

  beforeEach(async () => {
    wrapper = mount(KLineChart, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: false,
          }),
        ],
      },
      props: defaultProps,
    })
    stockStore = useStockStore()
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('正确渲染图表容器', () => {
    expect(wrapper.find('.kline-chart-container').exists()).toBe(true)
  })

  it('接收并验证 props', () => {
    expect(wrapper.props('symbol')).toBe('AAPL')
    expect(wrapper.props('timeframe')).toBe('1D')
  })

  it('初始化时创建图表实例', async () => {
    await wrapper.vm.$nextTick()
    const { createChart } = await import('lightweight-charts')
    expect(createChart).toHaveBeenCalled()
  })

  it('加载时显示 loading 状态', () => {
    expect(wrapper.find('.loading-overlay').exists()).toBe(true)
  })

  it('成功获取数据后隐藏 loading', async () => {
    stockStore.klineData = [{ time: 1620000000, open: 100, high: 101, low: 99, close: 100.5 }]
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.loading-overlay').exists()).toBe(false)
  })

  it('timeframe 变化时重新获取数据', async () => {
    await wrapper.setProps({ timeframe: '1H' })
    expect(stockStore.fetchKLineData).toHaveBeenCalledWith('AAPL', '1H')
  })

  it('销毁时清理图表实例', async () => {
    const chartInstance = wrapper.vm.chart
    wrapper.unmount()
    expect(chartInstance.remove).toHaveBeenCalled()
  })

  it('处理空数据场景', async () => {
    stockStore.klineData = []
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.data-empty').exists()).toBe(true)
  })

  it('正确格式化图表颜色主题', async () => {
    const { chartTheme } = await import('@/assets/styles/chart')
    expect(chartTheme).toMatchObject({
      background: expect.any(String),
      up: expect.any(String),
      down: expect.any(String),
    })
  })

  it('响应式调整图表尺寸', async () => {
    Object.defineProperty(wrapper.vm.$refs.chartContainer, 'clientWidth', {
      value: 800,
      writable: true,
    })
    window.dispatchEvent(new Event('resize'))
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.chart.resize).toHaveBeenCalled()
  })

  it('处理 WebSocket 实时数据更新', async () => {
    const testCandle = { time: 1620000000, open: 100, high: 101, low: 99, close: 100.5 }
    stockStore.updateRealtimeData(testCandle)
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.candleSeries.setData).toHaveBeenCalled()
  })

  it('验证技术指标计算逻辑', async () => {
    const testData = [{ close: 10 }, { close: 20 }, { close: 30 }, { close: 40 }, { close: 50 }]
    const ma3 = wrapper.vm.calculateMA(testData, 3)
    expect(ma3).toEqual([null, null, 20, 30, 40])
  })

  it('处理无效的 symbol 输入', async () => {
    await wrapper.setProps({ symbol: 'INVALID_SYMBOL' })
    expect(wrapper.emitted('error')).toBeTruthy()
  })

  it('显示网络错误状态', async () => {
    stockStore.fetchKLineData.mockRejectedValue(new Error('API error'))
    await wrapper.vm.loadData()
    expect(wrapper.find('.error-message').text()).toContain('数据加载失败')
  })
})
