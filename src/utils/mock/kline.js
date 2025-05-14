/**
 * 股票K线模拟数据生成器
 * 支持多周期、趋势控制和波动率调节
 */

// 基础价格生成配置
const BASE_CONFIG = {
  volatility: 0.02, // 基础波动率
  volumeBase: 10000, // 基础成交量
  seedPrice: 100, // 初始价格
  trend: 0.0005, // 趋势因子（正数看涨，负数看跌）
}

// 时间周期毫秒映射
const TIMEFRAME_MS = {
  '1m': 60000,
  '5m': 300000,
  '15m': 900000,
  '30m': 1800000,
  '1h': 3600000,
  '4h': 14400000,
  '1d': 86400000,
  '1w': 604800000,
}

export function generateKLineData(options = {}) {
  const config = { ...BASE_CONFIG, ...options }
  const {
    count = 200,
    timeframe = '1d',
    seedPrice = 100,
    volatility = 0.02,
    volumeBase = 10000,
    trend = 0.0005,
  } = config

  const data = []
  let currentPrice = seedPrice
  let currentTime = Date.now() - count * TIMEFRAME_MS[timeframe]

  for (let i = 0; i < count; i++) {
    // 生成价格波动
    const fluctuation = (Math.random() * 2 - 1) * volatility
    const trendEffect = trend * i
    const priceChange = currentPrice * (fluctuation + trendEffect)

    // 计算OHLC
    const open = currentPrice
    const close = open + priceChange
    const high = open + Math.abs(priceChange) * (1 + Math.random() * 0.3)
    const low = open - Math.abs(priceChange) * (1 + Math.random() * 0.3)

    // 修正极值
    const [finalHigh, finalLow] = [Math.max(open, close, high), Math.min(open, close, low)]

    // 生成成交量（与波动率正相关）
    const volume = volumeBase * (1 + Math.abs(fluctuation) * 5 + Math.random() * 2)

    data.push([
      currentTime, // 时间戳
      parseFloat(open.toFixed(4)),
      parseFloat(close.toFixed(4)),
      parseFloat(finalLow.toFixed(4)),
      parseFloat(finalHigh.toFixed(4)),
      Math.round(volume), // 成交量
    ])

    // 递增时间和价格
    currentTime += TIMEFRAME_MS[timeframe]
    currentPrice = close
  }

  return data
}

/**
 * 生成分时数据（基于日线扩展）
 */
export function generateTimeShareData(baseData) {
  const dayData = baseData || generateKLineData({ timeframe: '1d', count: 30 })

  return dayData.flatMap((daily, index) => {
    const [timestamp, open] = daily
    const dayTrend = daily[2] - daily[1] // 当日涨跌

    return Array.from({ length: 240 }, (_, i) => {
      const minute = i + 1
      const progress = minute / 240 // 当日交易进度
      const volatility = Math.sin(Math.PI * progress) * 0.015

      const price = open + dayTrend * progress + open * volatility * (Math.random() - 0.5)

      return [
        timestamp + minute * 60000, // 按分钟递增
        parseFloat(price.toFixed(4)),
        parseFloat((price + (Math.random() - 0.5) * open * 0.002).toFixed(4)),
        parseFloat((price - Math.random() * open * 0.005).toFixed(4)),
        parseFloat((price + Math.random() * open * 0.005).toFixed(4)),
        Math.round(volumeBase * (0.5 + Math.random() * 0.5)),
      ]
    })
  })
}

/**
 * 生成带突发事件的数据
 */
export function generateEventData(baseData, event) {
  const { dayIndex, impact } = event
  const index = Math.min(dayIndex, baseData.length - 1)
  const base = baseData[index]

  const newClose = base[2] * (1 + impact)
  const amplitude = Math.abs(impact) * 2

  baseData[index] = [
    base[0],
    base[1],
    parseFloat(newClose.toFixed(4)),
    parseFloat((newClose * (1 - amplitude)).toFixed(4)),
    parseFloat((newClose * (1 + amplitude)).toFixed(4)),
    base[5] * 5,
  ]

  // 影响后续数据
  for (let i = index + 1; i < baseData.length; i++) {
    baseData[i][1] = baseData[i - 1][2] // 开盘价继承前日收盘
    baseData[i][2] *= 1 + impact * 0.2
    baseData[i][3] *= 1 + impact * 0.2
    baseData[i][4] *= 1 + impact * 0.2
  }

  return baseData
}

// 辅助函数：生成随机股票代码数据
export function generateSymbolData(count = 50) {
  const symbols = []
  const industries = ['科技', '金融', '消费', '医疗', '能源']

  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).toUpperCase().substr(2, 4)
    symbols.push({
      symbol: code,
      name: `${code}公司`,
      price: (Math.random() * 500 + 10).toFixed(2),
      change: (Math.random() * 0.1 - 0.05).toFixed(4),
      volume: Math.round(Math.random() * 1e6 + 1e5),
      industry: industries[Math.floor(Math.random() * industries.length)],
    })
  }

  return symbols
}
