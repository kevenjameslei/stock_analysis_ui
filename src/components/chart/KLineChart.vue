<template>
  <div class="kline-container">
    <!-- 图表工具栏 -->
    <ChartToolbar
      :active-indicators="activeIndicators"
      @timeframe-change="handleTimeframeChange"
      @indicator-change="toggleIndicator"
    />

    <!-- 主K线区域 -->
    <div ref="klineDom" class="kline-main"></div>

    <!-- 成交量副图 -->
    <div v-show="showVolume" ref="volumeDom" class="kline-volume"></div>

    <!-- 指标参数面板 -->
    <IndicatorPanel
      v-if="showIndicatorSettings"
      :active-indicators="activeIndicators"
      @close="showIndicatorSettings = false"
    />

    <!-- 加载状态 -->
    <div v-show="loading" class="kline-loading">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'
import { useChartStore } from '@/stores/chart.store'
import { calculateMA, calculateMACD, calculateBOLL } from '@/utils/chart/calculator'
import { formatTime } from '@/utils/formatter'
import { useWebSocket } from '@/composables/useWebSocket'

const props = defineProps({
  symbol: {
    type: String,
    required: true,
  },
  timeframe: {
    type: String,
    default: '1d',
  },
})

const store = useChartStore()
const klineDom = ref(null)
const volumeDom = ref(null)
const klineChart = ref(null)
const volumeChart = ref(null)
const activeIndicators = ref(['MA5', 'VOL'])
const showVolume = ref(true)
const loading = ref(false)
const showIndicatorSettings = ref(false)

// 初始化图表
const initCharts = () => {
  if (!klineDom.value || !volumeDom.value) return

  klineChart.value = echarts.init(klineDom.value, 'dark')
  volumeChart.value = echarts.init(volumeDom.value, 'dark')

  // 窗口大小变化监听
  window.addEventListener('resize', handleResize)
}

// 核心K线配置
const getKlineOption = (data) => ({
  backgroundColor: 'transparent',
  grid: {
    left: '3%',
    right: '1%',
    top: '10%',
    height: '60%',
  },
  xAxis: {
    type: 'category',
    axisLine: { lineStyle: { color: '#3A3F4B' } },
    axisLabel: {
      color: '#7F848E',
      formatter: (value) => formatTime(value, props.timeframe),
    },
    splitLine: { show: false },
  },
  yAxis: {
    scale: true,
    position: 'right',
    axisLine: { show: false },
    splitLine: { lineStyle: { color: '#2A2E3A' } },
    axisLabel: {
      color: '#7F848E',
      inside: true,
      formatter: (value) => value.toFixed(2),
    },
  },
  dataZoom: [
    {
      type: 'inside',
      xAxisIndex: [0, 1],
      start: 80,
      end: 100,
    },
  ],
  series: [
    {
      type: 'candlestick',
      data: data,
      itemStyle: {
        color: '#0ECB81', // 涨
        color0: '#F6465D', // 跌
        borderColor: null,
        borderColor0: null,
      },
      emphasis: {
        itemStyle: {
          borderWidth: 2,
          shadowBlur: 10,
          shadowColor: 'rgba(255,255,255,0.1)',
        },
      },
    },
    ...generateIndicatorSeries(data),
  ],
})

// 生成指标系列
const generateIndicatorSeries = (data) => {
  const series = []

  if (activeIndicators.value.includes('MA5')) {
    series.push({
      name: 'MA5',
      type: 'line',
      data: calculateMA(5, data),
      smooth: true,
      lineStyle: { width: 1, color: '#FF9800' },
      symbol: 'none',
    })
  }

  if (activeIndicators.value.includes('BOLL')) {
    const { upper, mid, lower } = calculateBOLL(data)
    series.push(
      { name: 'BOLL Upper', type: 'line', data: upper, ...bollStyle('#4CAF50') },
      { name: 'BOLL Mid', type: 'line', data: mid, ...bollStyle('#2196F3') },
      { name: 'BOLL Lower', type: 'line', data: lower, ...bollStyle('#E91E63') },
    )
  }

  return series
}

const bollStyle = (color) => ({
  lineStyle: { width: 1, color },
  symbol: 'none',
  smooth: true,
})

// 处理实时数据
const { connect, close } = useWebSocket(props.symbol, (data) => {
  store.updateKlineData(data)
  updateCharts()
})

// 更新图表数据
const updateCharts = () => {
  if (!klineChart.value) return

  const option = getKlineOption(store.klineData)
  klineChart.value.setOption(option)

  // 更新成交量
  if (volumeChart.value) {
    volumeChart.value.setOption(getVolumeOption(store.klineData))
  }
}

// 生命周期管理
onMounted(async () => {
  initCharts()
  loading.value = true
  await store.fetchKlineData(props.symbol, props.timeframe)
  updateCharts()
  connect()
  loading.value = false
})

onBeforeUnmount(() => {
  close()
  window.removeEventListener('resize', handleResize)
  klineChart.value?.dispose()
  volumeChart.value?.dispose()
})

// 响应式更新
watch(
  () => props.timeframe,
  async (newTf) => {
    loading.value = true
    await store.fetchKlineData(props.symbol, newTf)
    updateCharts()
    loading.value = false
  },
)

watch(activeIndicators, () => {
  updateCharts()
})

// 事件处理
const handleTimeframeChange = (tf) => {
  store.setTimeframe(tf)
}

const toggleIndicator = (indicator) => {
  const index = activeIndicators.value.indexOf(indicator)
  index === -1 ? activeIndicators.value.push(indicator) : activeIndicators.value.splice(index, 1)
}

const handleResize = () => {
  klineChart.value?.resize()
  volumeChart.value?.resize()
}
</script>

<style scoped>
.kline-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: #1e222d;
}

.kline-main {
  height: calc(70% - 40px);
}

.kline-volume {
  height: 30%;
}

.kline-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: grid;
  place-items: center;
  z-index: 100;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #f6465d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
