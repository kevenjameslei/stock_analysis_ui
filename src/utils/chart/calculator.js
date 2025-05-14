/**
 * 金融技术指标计算工具集
 * 实现高效算法，优化计算性能
 */

// 移动平均线（支持SMA/EMA）
export const calculateMA = (period, data, type = 'SMA') => {
  if (period <= 0 || period > data.length) return []

  const results = []
  let sum = 0
  let emaPrev = 0
  const multiplier = 2 / (period + 1)

  data.forEach((item, index) => {
    const close = item[2] // 收盘价在data数组的第三位

    // 简单移动平均
    if (type === 'SMA') {
      sum += close
      if (index >= period) sum -= data[index - period][2]
      results.push(index >= period - 1 ? sum / period : null)
    }

    // 指数移动平均
    else if (type === 'EMA') {
      if (index === 0) {
        emaPrev = close
      } else {
        emaPrev = (close - emaPrev) * multiplier + emaPrev
      }
      results.push(index >= period - 1 ? emaPrev : null)
    }
  })

  return results
}

// 布林带计算（Bollinger Bands）
export const calculateBOLL = (data, period = 20, multiplier = 2) => {
  if (data.length < period) return { upper: [], mid: [], lower: [] }

  const mid = calculateMA(period, data)
  const stdValues = []
  const upper = []
  const lower = []

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1).map((d) => d[2])
    const avg = mid[i]
    const variance = slice.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / period
    const std = Math.sqrt(variance)

    stdValues.push(std)
    upper.push(avg + multiplier * std)
    lower.push(avg - multiplier * std)
  }

  return {
    upper: padStart(upper, period - 1),
    mid: mid,
    lower: padStart(lower, period - 1),
  }
}

// MACD指标计算
export const calculateMACD = (data, shortPeriod = 12, longPeriod = 26, signalPeriod = 9) => {
  const ema12 = calculateMA(shortPeriod, data, 'EMA')
  const ema26 = calculateMA(longPeriod, data, 'EMA')

  const dif = ema12.map((emaS, i) => (emaS !== null && ema26[i] !== null ? emaS - ema26[i] : null))

  const dea = calculateEMA(signalPeriod, dif.filter(Boolean))
  const macd = dif.map((d, i) => (d !== null && dea[i] !== null ? d - dea[i] : null))

  return {
    dif: padStart(dif, longPeriod - 1),
    dea: padStart(dea, longPeriod + signalPeriod - 2),
    macd: padStart(macd, longPeriod + signalPeriod - 2),
  }
}

// RSI相对强弱指数
export const calculateRSI = (period = 14, data) => {
  const changes = []
  const gains = []
  const losses = []

  // 计算价格变化
  for (let i = 1; i < data.length; i++) {
    const change = data[i][2] - data[i - 1][2]
    changes.push(change)
    gains.push(change > 0 ? change : 0)
    losses.push(change < 0 ? -change : 0)
  }

  // 计算初始平均值
  let avgGain = average(gains.slice(0, period))
  let avgLoss = average(losses.slice(0, period))
  const rsi = [avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)]

  // 迭代计算后续值
  for (let i = period; i < changes.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period
    const rs = avgGain / avgLoss
    rsi.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + rs))
  }

  return padStart(rsi, period + 1)
}

// KDJ随机指标
export const calculateKDJ = (data, period = 9, kPeriod = 3, dPeriod = 3) => {
  const kValues = []
  const dValues = []
  const jValues = []

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1)
    const high = Math.max(...slice.map((d) => d[4]))
    const low = Math.min(...slice.map((d) => d[3]))
    const close = data[i][2]

    const rsv = ((close - low) / (high - low)) * 100
    const k =
      kValues.length > 0 ? (rsv + (kPeriod - 1) * kValues[kValues.length - 1]) / kPeriod : rsv
    const d = dValues.length > 0 ? (k + (dPeriod - 1) * dValues[dValues.length - 1]) / dPeriod : k
    const j = 3 * k - 2 * d

    kValues.push(k)
    dValues.push(d)
    jValues.push(j)
  }

  return {
    k: padStart(kValues, period - 1),
    d: padStart(dValues, period - 1),
    j: padStart(jValues, period - 1),
  }
}

// 成交量计算（标准化处理）
export const calculateVOL = (data, maPeriod = 5) => {
  const volumes = data.map((d) => d[5])
  const maVol = calculateMA(
    maPeriod,
    data.map((d) => [0, 0, d[5]]),
  )
  return {
    volumes: volumes,
    maVol: maVol,
  }
}

// 工具函数
const padStart = (array, targetLength, fillValue = null) => {
  return Array(targetLength).fill(fillValue).concat(array)
}

const average = (arr) => {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

const calculateEMA = (period, data) => {
  const multiplier = 2 / (period + 1)
  let ema = data[0]
  return data.map((value, index) => {
    ema = index === 0 ? value : (value - ema) * multiplier + ema
    return index >= period - 1 ? ema : null
  })
}
