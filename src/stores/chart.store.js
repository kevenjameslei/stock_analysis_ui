import { defineStore } from 'pinia'
import { useWebSocket } from '@/composables/useWebSocket'
import { useIndicator } from '@/composables/useIndicator'

export const useChartStore = defineStore('chart', {
  state: () => ({
    // 核心状态
    currentSymbol: 'AAPL',
    timeframe: '1d',
    chartType: 'candlestick',

    // 数据相关
    rawData: [],
    indicators: {
      active: ['MA(5)', 'BOLL(20,2)'],
      configs: {},
    },

    // 系统状态
    loading: false,
    error: null,
    lastUpdated: null,

    // 界面设置
    layout: {
      darkMode: true,
      priceScale: 'right',
      volumeVisible: true,
    },

    // 性能缓存
    _dataCache: new Map(),
    _indicatorCache: new Map(),
  }),

  getters: {
    // 加工后的图表数据
    processedData: (state) => {
      const { indicators } = useIndicator(state.rawData, state.indicators.active)
      return {
        candles: state.rawData,
        indicators: indicators.value,
      }
    },

    // 当前指标配置
    currentIndicators: (state) => {
      return state.indicators.active.map((item) => {
        const [name, ...params] = item.split(/[()]/).filter(Boolean)
        return { name, params: params[0]?.split(',').map(Number) || [] }
      })
    },

    // 分页数据视图
    visibleData: (state) => {
      const pageSize = 200
      return state.rawData.slice(-pageSize)
    },
  },

  actions: {
    // 初始化数据加载
    async initialize() {
      try {
        this.loading = true
        await this.loadHistoricalData()
        this.setupRealtime()
      } catch (error) {
        this.handleError(error)
      } finally {
        this.loading = false
      }
    },

    // 加载历史数据
    async loadHistoricalData() {
      const cacheKey = `${this.currentSymbol}_${this.timeframe}`

      if (this._dataCache.has(cacheKey)) {
        this.rawData = this._dataCache.get(cacheKey)
        return
      }

      const data = await this.fetchKLineData({
        symbol: this.currentSymbol,
        interval: this.timeframe,
        limit: 1000,
      })

      this.rawData = data
      this._dataCache.set(cacheKey, data)
      this.lastUpdated = Date.now()
    },

    // 设置实时更新
    setupRealtime() {
      const { connect, subscribe } = useWebSocket({
        urlBuilder: () => this.wsEndpoint,
        onMessage: this.handleRealtimeData,
      })

      connect()
      subscribe(this.currentSymbol, this.timeframe)
    },

    // 处理实时数据
    handleRealtimeData(newData) {
      const lastCandle = this.rawData[this.rawData.length - 1]

      if (this.isSameCandlePeriod(lastCandle, newData)) {
        this.updateLastCandle(newData)
      } else {
        this.addNewCandle(newData)
      }

      this.trimData()
      this.updateIndicators()
    },

    // 指标管理
    addIndicator(indicator) {
      if (!this.validateIndicator(indicator)) return

      this.indicators.active = [...this.indicators.active, indicator]
      this.saveIndicatorConfig(indicator)
      this.updateIndicators()
    },

    removeIndicator(indicator) {
      this.indicators.active = this.indicators.active.filter((i) => i !== indicator)
      this.updateIndicators()
    },

    // 工具方法
    updateIndicators() {
      const { indicators } = useIndicator(this.rawData, this.indicators.active)
      this.indicators.configs = indicators.value
    },

    validateIndicator(indicator) {
      const [name] = indicator.split('(')
      return Object.keys(INDICATOR_CONFIG).includes(name)
    },

    // 错误处理
    handleError(error) {
      this.error = {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        timestamp: Date.now(),
      }
      console.error('[Chart Store Error]', error)
    },

    // 重置状态
    reset() {
      this._dataCache.clear()
      this._indicatorCache.clear()
      this.$reset()
    },
  },

  // 持久化配置
  persist: {
    paths: ['currentSymbol', 'timeframe', 'layout', 'indicators.active'],
    storage: sessionStorage,
  },
})

// 常量定义
const INDICATOR_CONFIG = {
  MA: {
    /* ... */
  },
  BOLL: {
    /* ... */
  },
  // 其他指标配置
}
