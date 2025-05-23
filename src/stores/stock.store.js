import { defineStore } from 'pinia'
import { useWebSocket } from '@/composables/useWebSocket'
import { mockSearchStocks, mockGetQuote } from '@/utils/mockApi'

export const useStockStore = defineStore('stock', {
  state: () => ({
    // 核心数据状态
    watchlist: new Map(), // 自选股列表 <symbol, metadata>
    positions: new Map(), // 持仓信息 <symbol, position>
    marketData: new Map(), // 实时行情 <symbol, quote>
    historicalData: new Map(), // 历史数据 <symbol, data>

    // 用户配置
    alerts: new Set(), // 价格预警规则
    preferences: {
      defaultView: 'chart',
      showUniverse: true,
      heatmapMode: 'sector',
    },

    // 系统状态
    loadingSymbols: new Set(),
    lastUpdated: null,
    error: null,

    // 缓存管理
    _searchCache: new Map(), // 搜索缓存 <query, results>
    _quoteCache: new Map(), // 报价缓存 <symbol, quote>
  }),

  getters: {
    // 带实时报价的自选股列表
    enrichedWatchlist: (state) => {
      return Array.from(state.watchlist.values()).map((stock) => ({
        ...stock,
        quote: state.marketData.get(stock.symbol) || {},
      }))
    },

    // 持仓总价值
    totalPortfolioValue: (state) => {
      return Array.from(state.positions.values()).reduce((acc, position) => {
        const price = state.marketData.get(position.symbol)?.price || 0
        return acc + position.quantity * price
      }, 0)
    },

    // 分行业市场数据
    sectorHeatmapData: (state) => {
      const sectorMap = new Map()
      state.marketData.forEach((quote) => {
        const sector = quote.sector || 'Unknown'
        const entry = sectorMap.get(sector) || { count: 0, value: 0 }
        entry.count++
        entry.value += quote.marketCap || 0
        sectorMap.set(sector, entry)
      })
      return Array.from(sectorMap.entries())
    },
  },

  actions: {
    // 初始化实时数据连接
    async initialize() {
      const { connect, _subscribe } = useWebSocket({
        urlBuilder: () => 'wss://api.example.com/market-data',
        onMessage: this.handleMarketDataUpdate,
      })

      await connect()
      this.subscribeToWatchlist()
    },

    // 自选股管理
    async addToWatchlist(symbol) {
      if (this.watchlist.has(symbol)) return

      try {
        this.loadingSymbols.add(symbol)
        const stock = await this.fetchStockMetadata(symbol)
        this.watchlist.set(symbol, stock)
        this.subscribeToSymbol(symbol)
      } catch (error) {
        this.handleError(`添加失败: ${error.message}`)
      } finally {
        this.loadingSymbols.delete(symbol)
      }
    },

    removeFromWatchlist(symbol) {
      this.watchlist.delete(symbol)
      this.unsubscribeFromSymbol(symbol)
    },

    // 持仓管理
    updatePosition(symbol, positionData) {
      const current = this.positions.get(symbol) || {}
      this.positions.set(symbol, {
        ...current,
        ...positionData,
        updatedAt: Date.now(),
      })
    },

    // 市场数据操作
    async fetchQuote(symbol) {
      if (this._quoteCache.has(symbol)) {
        return this._quoteCache.get(symbol)
      }

      const quote = await mockGetQuote(symbol)
      this._quoteCache.set(symbol, quote)
      return quote
    },

    // 搜索功能
    async searchStocks(query) {
      if (this._searchCache.has(query)) {
        return this._searchCache.get(query)
      }

      const results = await mockSearchStocks(query)
      this._searchCache.set(query, results)
      return results
    },

    // 预警管理
    addPriceAlert(symbol, { condition, value }) {
      this.alerts.add(
        JSON.stringify({
          symbol,
          condition,
          value,
          created: Date.now(),
        }),
      )
    },

    // 内部方法
    async fetchStockMetadata(symbol) {
      const [quote, profile] = await Promise.all([
        this.fetchQuote(symbol),
        this.fetchCompanyProfile(symbol),
      ])

      return {
        symbol,
        name: profile.companyName,
        exchange: quote.primaryExchange,
        sector: profile.sector,
        industry: profile.industry,
        addedAt: Date.now(),
      }
    },

    handleMarketDataUpdate(update) {
      update.forEach(({ symbol, data }) => {
        this.marketData.set(symbol, {
          ...this.marketData.get(symbol),
          ...data,
          lastUpdated: Date.now(),
        })
      })
      this.checkAlerts()
      this.lastUpdated = Date.now()
    },

    checkAlerts() {
      this.alerts.forEach((alertStr) => {
        const alert = JSON.parse(alertStr)
        const quote = this.marketData.get(alert.symbol)
        if (!quote) return

        const currentPrice = quote.price
        const isTriggered = this.evaluateAlertCondition(alert, currentPrice)
        if (isTriggered) {
          this.triggerAlert(alert)
          this.alerts.delete(alertStr)
        }
      })
    },

    evaluateAlertCondition(alert, price) {
      switch (alert.condition) {
        case 'above':
          return price > alert.value
        case 'below':
          return price < alert.value
        case 'cross':
          return false // 需要更复杂的实现
        default:
          return false
      }
    },

    // 错误处理
    handleError(message) {
      this.error = {
        message,
        timestamp: Date.now(),
        stack: new Error().stack,
      }
      console.error(`[Stock Store Error] ${message}`)
    },
  },

  // 持久化配置
  persist: {
    paths: ['watchlist', 'positions', 'preferences', 'alerts'],
    storage: localStorage,
    serializer: {
      serialize: (value) =>
        JSON.stringify({
          ...value,
          watchlist: Array.from(value.watchlist.entries()),
          positions: Array.from(value.positions.entries()),
          alerts: Array.from(value.alerts),
        }),
      deserialize: (value) => {
        const data = JSON.parse(value)
        return {
          ...data,
          watchlist: new Map(data.watchlist),
          positions: new Map(data.positions),
          alerts: new Set(data.alerts),
        }
      },
    },
  },
})
