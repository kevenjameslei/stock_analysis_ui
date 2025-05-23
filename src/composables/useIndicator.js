import { computed, watchEffect } from 'vue'
import {
  calculateMA,
  calculateMACD,
  calculateBOLL,
  calculateRSI,
  calculateKDJ,
} from '@/utils/chart/calculator'
import { useMemoize } from '@vueuse/core'

// 指标配置元数据
const INDICATOR_CONFIG = {
  MA: {
    params: [{ name: 'period', type: 'number', default: 5, min: 1 }],
    calculator: (data, params) => calculateMA(params.period, data),
  },
  MACD: {
    params: [
      { name: 'short', type: 'number', default: 12, min: 5 },
      { name: 'long', type: 'number', default: 26, min: 10 },
      { name: 'signal', type: 'number', default: 9, min: 5 },
    ],
    calculator: (data, params) => calculateMACD(data, params),
  },
  BOLL: {
    params: [
      { name: 'period', type: 'number', default: 20, min: 10 },
      { name: 'multiplier', type: 'number', default: 2, step: 0.1 },
    ],
    calculator: (data, params) => calculateBOLL(data, params),
  },
  RSI: {
    params: [{ name: 'period', type: 'number', default: 14, min: 5 }],
    calculator: (data, params) => calculateRSI(params.period, data),
  },
  KDJ: {
    params: [
      { name: 'kPeriod', type: 'number', default: 9, min: 5 },
      { name: 'dPeriod', type: 'number', default: 3, min: 2 },
    ],
    calculator: (data, params) => calculateKDJ(data, params),
  },
}

export function useIndicator(rawData, activeIndicators) {
  // 带缓存的指标计算
  const memoizedCalculate = useMemoize(
    (indicatorName, params) => {
      const config = INDICATOR_CONFIG[indicatorName]
      if (!config) {
        console.error(`未知指标: ${indicatorName}`)
        return []
      }

      try {
        validateParams(indicatorName, params)
        return config.calculator(rawData.value, params)
      } catch (error) {
        console.error(`[${indicatorName}] 计算失败:`, error)
        return []
      }
    },
    {
      getKey: (indicatorName, params) =>
        `${indicatorName}_${JSON.stringify(params)}_${rawData.value.length}`,
    },
  )

  // 指标参数验证
  const validateParams = (indicatorName, params) => {
    const config = INDICATOR_CONFIG[indicatorName]
    for (const param of config.params) {
      const value = params[param.name]
      if (typeof value !== param.type) {
        throw new Error(`参数 ${param.name} 类型错误，应为 ${param.type}`)
      }
      if (param.min !== undefined && value < param.min) {
        throw new Error(`参数 ${param.name} 不能小于 ${param.min}`)
      }
    }
  }

  // 合并指标数据
  const mergedIndicators = computed(() => {
    return activeIndicators.value.reduce((acc, curr) => {
      const { name, params } = parseIndicatorConfig(curr)
      const values = memoizedCalculate(name, params)

      return {
        ...acc,
        [name]: {
          params,
          data: values,
          meta: INDICATOR_CONFIG[name],
        },
      }
    }, {})
  })

  // 解析指标配置字符串（示例："MA(5)"）
  const parseIndicatorConfig = (indicatorStr) => {
    const [name, paramStr] = indicatorStr.split('(')
    const defaultParams = getDefaultParams(name)

    const params = paramStr
      ? paramStr
          .replace(')', '')
          .split(',')
          .reduce((acc, str, index) => {
            const paramConfig = INDICATOR_CONFIG[name].params[index]
            return {
              ...acc,
              [paramConfig.name]: parseParamValue(str.trim(), paramConfig.type),
            }
          }, {})
      : defaultParams

    return { name, params: { ...defaultParams, ...params } }
  }

  // 类型转换
  const parseParamValue = (value, type) => {
    if (type === 'number') return Number(value)
    return value
  }

  // 获取默认参数
  const getDefaultParams = (indicatorName) => {
    return INDICATOR_CONFIG[indicatorName].params.reduce(
      (acc, param) => ({
        ...acc,
        [param.name]: param.default,
      }),
      {},
    )
  }

  // 指标可见性管理
  const visibleIndicators = computed(() => {
    return Object.entries(mergedIndicators.value).filter(([name]) =>
      activeIndicators.value.some((a) => a.startsWith(name)),
    )
  })

  // 性能监控（开发环境）
  if (import.meta.env.DEV) {
    watchEffect(() => {
      console.table(
        Object.entries(mergedIndicators.value).map(([name, config]) => ({
          指标: name,
          参数: JSON.stringify(config.params),
          数据量: config.data.length,
          最新值: config.data[config.data.length - 1],
        })),
      )
    })
  }

  return {
    indicators: mergedIndicators,
    visibleIndicators,
    getIndicatorConfig: (name) => INDICATOR_CONFIG[name],
    validateIndicator: (indicatorStr) => {
      const [name] = indicatorStr.split('(')
      return !!INDICATOR_CONFIG[name]
    },
  }
}
