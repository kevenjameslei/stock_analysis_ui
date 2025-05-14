/**
 * 金融图表数据格式化工具
 * 包含时间、价格、成交量等专业格式化方法
 */

// 时间格式化配置
const TIME_FORMATS = {
  '1m': 'HH:mm',
  '5m': 'HH:mm',
  '15m': 'HH:mm',
  '30m': 'HH:mm',
  '1h': 'MM-DD HH:mm',
  '4h': 'MM-DD HH:mm',
  '1d': 'YYYY-MM-DD',
  '1w': 'YYYY-MM-DD',
  '1M': 'YYYY-MM',
}

// 价格格式化配置
const PRICE_PRECISION_MAP = {
  '0-10': 4, // 价格 < 10，显示4位小数
  '10-100': 3, // 10 ≤ 价格 < 100，显示3位小数
  '100-1000': 2, // 100 ≤ 价格 < 1000，显示2位小数
  default: 2, // 默认显示2位小数
}

// 指标显示名称映射
const INDICATOR_NAMES = {
  MA: '移动平均线',
  MA5: '5日均线',
  MA10: '10日均线',
  BOLL: '布林线',
  MACD: 'MACD指标',
  RSI: '相对强弱指数',
  KDJ: '随机指标',
  VOL: '成交量',
}

/**
 * 时间格式化（高性能实现）
 * @param {number} timestamp - 时间戳(毫秒)
 * @param {string} timeframe - 时间周期
 * @returns {string} 格式化后的时间字符串
 */
export const formatTime = (timestamp, timeframe = '1d') => {
  const date = new Date(timestamp)
  const format = TIME_FORMATS[timeframe] || 'YYYY-MM-DD'

  const pad = (n) => n.toString().padStart(2, '0')
  const maps = {
    YYYY: date.getFullYear(),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
  }

  return format.replace(/YYYY|MM|DD|HH|mm/g, (match) => maps[match])
}

/**
 * 价格格式化（支持智能精度和单位缩写）
 * @param {number} value - 原始数值
 * @param {boolean} withSymbol - 是否带货币符号
 * @returns {string} 格式化后的价格字符串
 */
export const formatPrice = (value, withSymbol = true) => {
  if (value === null || isNaN(value)) return '--'

  // 智能精度选择
  const getPrecision = () => {
    const absValue = Math.abs(value)
    for (const [range, precision] of Object.entries(PRICE_PRECISION_MAP)) {
      if (range === 'default') continue
      const [min, max] = range.split('-').map(Number)
      if (absValue >= min && absValue < max) return precision
    }
    return PRICE_PRECISION_MAP.default
  }

  // 大数缩写处理
  const formatLargeNumber = (val) => {
    const suffixes = ['', 'K', 'M', 'B']
    let suffixIndex = 0

    while (val >= 1000 && suffixIndex < suffixes.length - 1) {
      val /= 1000
      suffixIndex++
    }

    return {
      value: val.toFixed(getPrecision()),
      suffix: suffixes[suffixIndex],
    }
  }

  const { value: formattedVal, suffix } = formatLargeNumber(value)
  return `${withSymbol ? '$' : ''}${formattedVal}${suffix}`
}

/**
 * 成交量格式化（自动单位换算）
 * @param {number} volume - 原始成交量
 * @returns {string} 格式化后的成交量字符串
 */
export const formatVolume = (volume) => {
  if (!volume) return '0'

  const units = ['', 'K', 'M', 'B']
  let unitIndex = 0
  let formatted = volume

  while (formatted >= 1000 && unitIndex < units.length - 1) {
    formatted /= 1000
    unitIndex++
  }

  // 根据数量级决定小数位数
  const decimals = unitIndex > 1 ? 2 : unitIndex === 1 ? 1 : 0
  return `${formatted.toFixed(decimals)}${units[unitIndex]}`
}

/**
 * 涨跌幅格式化（带颜色标识）
 * @param {number} value - 涨跌幅百分比值（例如0.05表示5%）
 * @returns {object} 包含格式化文本和颜色的对象
 */
export const formatChange = (value) => {
  if (value === null || isNaN(value)) return { text: '--', color: '#666' }

  const isPositive = value >= 0
  const color = isPositive ? '#F6465D' : '#0ECB81'
  const symbol = isPositive ? '+' : ''
  const percent = (value * 100).toFixed(2)

  return {
    text: `${symbol}${percent}%`,
    color,
  }
}

/**
 * 技术指标名称格式化
 * @param {string} indicatorKey - 指标键名（如"MA5"）
 * @returns {string} 本地化后的指标名称
 */
export const formatIndicatorName = (indicatorKey) => {
  return INDICATOR_NAMES[indicatorKey] || indicatorKey
}

/**
 * 指标参数格式化（用于Tooltip显示）
 * @param {string} indicatorKey - 指标键名
 * @param {object} params - 指标参数
 * @returns {string} 格式化后的参数描述
 */
export const formatIndicatorParams = (indicatorKey, params) => {
  const maps = {
    MA: (p) => `${p.period}周期均线`,
    BOLL: (p) => `标准差倍数 ${p.multiplier}`,
    MACD: (p) => `(${p.short},${p.long},${p.signal})`,
    RSI: (p) => `${p.period}周期`,
    KDJ: (p) => `K${p.kPeriod}/D${p.dPeriod}`,
  }

  return maps[indicatorKey]?.(params) || ''
}

/**
 * 十字光标数值对齐格式化
 * @param {number} value - 原始数值
 * @param {string} type - 数据类型（price/volume）
 * @returns {string} 对齐后的固定宽度字符串
 */
export const formatCursorValue = (value, type = 'price') => {
  const fixedValue =
    type === 'price' ? Number(value).toFixed(4) : Math.floor(value).toLocaleString()

  return fixedValue.padStart(12, ' ').replace(/ /g, '&nbsp;')
}

// 千分位格式化（用于坐标轴标签）
export const formatThousands = (value) => {
  return value.toLocaleString('en-US', {
    maximumFractionDigits: 2,
    useGrouping: true,
  })
}
