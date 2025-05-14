/**
 * 金融分析工具函数集合
 * 包含数据处理、格式转换、计算校验等实用方法
 */

// ======================== 数据格式化工具 ========================
export const Formatters = {
  /**
   * 价格格式化（保留有效小数位）
   * @param {number} value - 原始价格
   * @param {number} [precision=2] - 小数精度
   * @returns {string} 格式化后的价格
   * @example formatPrice(123.4567) => "123.46"
   */
  formatPrice: (value, precision = 2) => {
    if (typeof value !== 'number') return '--'
    return value.toLocaleString(undefined, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    })
  },

  /**
   * 涨跌幅格式化
   * @param {number} change - 涨跌值
   * @param {number} close - 收盘价
   * @returns {string} 带符号的百分比
   * @example formatChange(1.5, 100) => "+1.50%"
   */
  formatChange: (change, close) => {
    if (close === 0 || isNaN(change) || isNaN(close)) return '0.00%'
    const percentage = ((change / close) * 100).toFixed(2)
    return `${percentage >= 0 ? '+' : ''}${percentage}%`
  },

  /**
   * 大数字缩写格式化
   * @param {number} num - 原始数字
   * @returns {string} 格式化后的字符串
   * @example formatLargeNumber(1234567) => "1.23M"
   */
  formatLargeNumber: (num) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
    return num.toFixed(2)
  },
}

// ======================== 计算工具 ========================
export const Calculators = {
  /**
   * 计算移动平均线
   * @param {Array} data - K线数据数组
   * @param {number} period - 周期
   * @param {string} [field='close'] - 计算字段
   */
  calculateMA: (data, period, field = 'close') => {
    if (!data || data.length < period) return []
    return data.map((_, index) => {
      if (index < period - 1) return null
      const sum = data
        .slice(index - period + 1, index + 1)
        .reduce((acc, cur) => acc + cur[field], 0)
      return sum / period
    })
  },

  /**
   * 计算涨跌颜色
   * @param {number} current - 当前值
   * @param {number} previous - 前值
   * @returns {string} 颜色代码
   */
  getChangeColor: (current, previous) => {
    if (current > previous) return '#00b07c' // 涨
    if (current < previous) return '#ff4445' // 跌
    return '#cccccc' // 平
  },
}

// ======================== 数据校验工具 ========================
export const Validators = {
  isStockSymbol: (symbol) => /^[A-Z0-9.]{1,10}$/.test(symbol),
  isKLineData: (data) => Array.isArray(data) && data.every((d) => 'time' in d && 'high' in d),
}

// ======================== 性能优化工具 ========================
export const Performance = {
  /**
   * 防抖函数
   * @param {Function} fn - 目标函数
   * @param {number} delay - 延迟时间(ms)
   */
  debounce: (fn, delay = 300) => {
    let timer
    return (...args) => {
      clearTimeout(timer)
      timer = setTimeout(() => fn.apply(this, args), delay)
    }
  },

  /**
   * 节流函数
   * @param {Function} fn - 目标函数
   * @param {number} threshold - 执行阈值(ms)
   */
  throttle: (fn, threshold = 250) => {
    let lastExecTime = 0
    return (...args) => {
      const now = Date.now()
      if (now - lastExecTime > threshold) {
        fn.apply(this, args)
        lastExecTime = now
      }
    }
  },
}

// ======================== 浏览器存储工具 ========================
export const Storage = {
  get: (key, isSession = false) => {
    const storage = isSession ? sessionStorage : localStorage
    const data = storage.getItem(key)
    try {
      return data ? JSON.parse(data) : null
    } catch {
      return data
    }
  },

  set: (key, value, isSession = false) => {
    const storage = isSession ? sessionStorage : localStorage
    storage.setItem(key, JSON.stringify(value))
  },

  remove: (key, isSession = false) => {
    const storage = isSession ? sessionStorage : localStorage
    storage.removeItem(key)
  },
}

// ======================== 数据处理工具 ========================
export const DataUtils = {
  /**
   * 安全的深拷贝方法
   * @param {Object} obj - 需要拷贝的对象
   */
  deepClone: (obj) => JSON.parse(JSON.stringify(obj)),

  /**
   * 合并K线数据（用于实时更新）
   * @param {Array} existingData - 现有数据
   * @param {Array} newData - 新数据
   */
  mergeKLineData: (existingData, newData) => {
    const lastExisting = existingData[existingData.length - 1]
    const firstNew = newData[0]

    if (lastExisting && firstNew.time === lastExisting.time) {
      return [...existingData.slice(0, -1), ...newData]
    }
    return [...existingData, ...newData]
  },
}

// ======================== 类型检查工具 ========================
export const TypeCheck = {
  isFunction: (obj) => typeof obj === 'function',
  isNumber: (obj) => typeof obj === 'number' && !isNaN(obj),
  isObject: (obj) => obj !== null && typeof obj === 'object' && !Array.isArray(obj),
}

// ======================== 时间处理工具 ========================
export const TimeUtils = {
  /**
   * 转换时间戳为本地时间字符串
   * @param {number} timestamp - Unix时间戳(秒)
   */
  timestampToLocal: (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  },

  /**
   * 根据时间框架生成时间格式
   * @param {string} timeframe - 时间框架(1m/5m/1H等)
   */
  getTimeFormat: (timeframe) => {
    const formats = {
      '1m': 'HH:mm',
      '5m': 'HH:mm',
      '15m': 'HH:mm',
      '1H': 'MM-DD HH:mm',
      '1D': 'YYYY-MM-DD',
      '1W': 'YYYY-MM-DD',
    }
    return formats[timeframe] || 'YYYY-MM-DD HH:mm'
  },
}

// ======================== DOM操作工具 ========================
export const DomUtils = {
  /**
   * 安全获取元素尺寸
   * @param {HTMLElement} el - DOM元素
   */
  getElementSize: (el) => ({
    width: el ? el.clientWidth : 0,
    height: el ? el.clientHeight : 0,
  }),

  /**
   * 监听元素尺寸变化
   * @param {HTMLElement} element - 目标元素
   * @param {Function} callback - 回调函数
   */
  observeResize: (element, callback) => {
    if (!element) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        callback(entry.contentRect)
      }
    })

    resizeObserver.observe(element)
    return () => resizeObserver.unobserve(element)
  },
}

// ======================== 错误处理工具 ========================
export const ErrorHandler = {
  /**
   * 封装try-catch逻辑
   * @param {Function} fn - 需要执行的函数
   * @param {string} context - 错误上下文信息
   */
  safeExecute: async (fn, context = '') => {
    try {
      return await fn()
    } catch (error) {
      console.error(`[Error${context ? ` in ${context}` : ''}]`, error)
      throw error
    }
  },
}
