/**
 * 模拟 WebSocket 实时数据服务
 * 支持自动推送K线更新、逐笔成交和订单簿变化
 */

const subscribers = new Map()

// 行情波动模型
class PriceModel {
  constructor(symbol, basePrice) {
    this.symbol = symbol
    this.price = basePrice
    this.volatility = 0.02
    this.trend = 0.0001
    this.lastUpdate = Date.now()
  }

  next() {
    const now = Date.now()
    const deltaTime = (now - this.lastUpdate) / 1000
    this.lastUpdate = now

    const random = (Math.random() - 0.5) * 2
    const drift = this.trend * deltaTime * 60
    const shock = this.volatility * Math.sqrt(deltaTime) * random

    this.price *= Math.exp(drift + shock)
    return this.price
  }
}

// 生成实时订单簿快照
function generateOrderBook(symbolModel) {
  const price = symbolModel.price
  return {
    bids: Array.from({ length: 5 }, (_, i) => ({
      price: price * (1 - (i + 1) * 0.001),
      volume: Math.round(1000 + Math.random() * 5000),
    })),
    asks: Array.from({ length: 5 }, (_, i) => ({
      price: price * (1 + (i + 1) * 0.001),
      volume: Math.round(1000 + Math.random() * 5000),
    })),
  }
}

// 主模拟引擎
export class MockWebSocket {
  constructor(url) {
    this.url = url
    this.symbol = url.split('=')[1]
    this.interval = null
    this.messageQueue = []
    this.priceModel = new PriceModel(this.symbol, 100 + Math.random() * 50)
    this.orderBook = generateOrderBook(this.priceModel)
  }

  connect() {
    setTimeout(() => this.onopen(), 50)
    this.interval = setInterval(() => this.pushData(), 1000)
  }

  pushData() {
    const newPrice = this.priceModel.next()
    const timestamp = Date.now()

    // K线更新
    const klineUpdate = {
      type: 'kline',
      symbol: this.symbol,
      data: [
        timestamp,
        newPrice,
        newPrice + (Math.random() - 0.5) * 0.1,
        newPrice - Math.random() * 0.2,
        newPrice + Math.random() * 0.2,
        Math.round(10000 + Math.random() * 50000),
      ],
    }

    // 订单簿更新
    const bookUpdate = {
      type: 'orderbook',
      symbol: this.symbol,
      data: generateOrderBook(this.priceModel),
    }

    // 逐笔成交
    const tradeUpdate = {
      type: 'trade',
      symbol: this.symbol,
      data: {
        price: newPrice,
        volume: Math.round(100 + Math.random() * 500),
        side: Math.random() > 0.5 ? 'BUY' : 'SELL',
        timestamp,
      },
    }

    const message = JSON.stringify([klineUpdate, bookUpdate, tradeUpdate])
    this.onmessage({ data: message })
  }

  close() {
    clearInterval(this.interval)
    this.onclose()
  }

  // 事件处理器
  onopen = () => {}
  onmessage = () => {}
  onclose = () => {}
  onerror = () => {}
}

// 创建模拟 WebSocket 连接
export function createMockWebSocket(symbol) {
  const ws = new MockWebSocket(`wss://mock.api.com/ws?symbol=${symbol}`)

  return {
    connect: () => ws.connect(),
    close: () => ws.close(),
    on: (event, callback) => {
      ws[`on${event}`] = callback
    },
    send: (data) => {
      console.log('Mock WS send:', data)
    },
  }
}

// 全局模拟控制
export const mockWebSocket = {
  startAll() {
    Array.from(subscribers.keys()).forEach((symbol) => {
      subscribers.get(symbol).connect()
    })
  },

  stopAll() {
    Array.from(subscribers.values()).forEach((ws) => ws.close())
  },

  subscribe(symbol, callback) {
    const ws = createMockWebSocket(symbol)
    ws.on('message', callback)
    ws.connect()
    subscribers.set(symbol, ws)
    return () => this.unsubscribe(symbol)
  },

  unsubscribe(symbol) {
    const ws = subscribers.get(symbol)
    if (ws) {
      ws.close()
      subscribers.delete(symbol)
    }
  },
}
