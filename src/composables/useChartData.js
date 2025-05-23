import { ref, watch, computed } from 'vue'
import { useChartStore } from '@/stores/chart.store'
import { calculateMA, calculateMACD, calculateBOLL } from '@/utils/chart/calculator'
import { generateKLineData } from '@/utils/mock/kline'
import { useWebSocket } from './useWebSocket'

export function useChartData(symbol, timeframe) {
  const _store = useChartStore()
  const loading = ref(false)
  const error = ref(null)
  const klineData = ref([])

  // 计算属性优化指标计算
  const indicators = computed(() => ({
    ma5: calculateMA(5, klineData.value),
    ma10: calculateMA(10, klineData.value),
    boll: calculateBOLL(klineData.value),
    macd: calculateMACD(klineData.value),
  }))

  // 历史数据获取
  const fetchHistoricalData = async () => {
    try {
      loading.value = true
      const data = await mockFetchKLine(symbol.value, timeframe.value)
      klineData.value = normalizeData(data)
    } catch (err) {
      error.value = err.message
      console.error('数据获取失败:', err)
    } finally {
      loading.value = false
    }
  }

  // WebSocket实时数据处理
  const { connect, close } = useWebSocket(symbol, (newData) => {
    klineData.value = mergeNewData(newData)
  })

  // 数据合并策略
  const mergeNewData = (newPoint) => {
    const last = klineData.value[klineData.value.length - 1]

    // 同一时间周期合并
    if (sameTimeframe(last, newPoint)) {
      return [...klineData.value.slice(0, -1), mergeCandle(last, newPoint)]
    }

    return [...klineData.value.slice(1), newPoint]
  }

  // 数据标准化
  const normalizeData = (data) => {
    return data.map((item) => ({
      time: item[0],
      open: item[1],
      close: item[2],
      low: item[3],
      high: item[4],
      volume: item[5],
    }))
  }

  // 时间周期变更监听
  watch(
    [symbol, timeframe],
    ([newSymbol, newTf]) => {
      if (newSymbol && newTf) {
        close()
        fetchHistoricalData()
        connect(newSymbol, newTf)
      }
    },
    { immediate: true },
  )

  // 模拟API请求
  const mockFetchKLine = async (symbol, timeframe) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateKLineData(symbol, timeframe, 300))
      }, 500)
    })
  }

  return {
    klineData,
    indicators,
    loading,
    error,
    refresh: fetchHistoricalData,
  }
}

// 工具函数
const sameTimeframe = (a, b) => {
  return a && b && a.time === b.time
}

const mergeCandle = (existing, update) => ({
  time: existing.time,
  open: existing.open,
  close: update.close,
  high: Math.max(existing.high, update.high),
  low: Math.min(existing.low, update.low),
  volume: existing.volume + update.volume,
})
