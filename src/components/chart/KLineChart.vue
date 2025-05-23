<template>
  <div ref="containerRef" class="kline-chart" />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, ref, type Ref } from 'vue'
import {
  createChart,
  type IChartApi,
  type CandlestickData,
  //type CandlestickSeriesOptions,
} from 'lightweight-charts'

// props 接收 K 线数据和可选主题
const props = defineProps<{
  data: CandlestickData[]
  theme?: 'light' | 'dark'
}>()

// refs
const containerRef = ref<HTMLElement | null>(null)
const chartRef = ref<IChartApi | null>(null)
const candleSeriesRef: Ref<ReturnType<IChartApi['addCandlestickSeries']> | null> = ref(null)
let resizeObserver: ResizeObserver | null = null

// 创建图表
const initChart = () => {
  if (!containerRef.value) return

  // 图表背景与文字颜色设置
  const isDark = props.theme === 'dark'
  const backgroundColor = isDark ? '#1e1e1e' : '#ffffff'
  const textColor = isDark ? '#d1d1d1' : '#333333'

  chartRef.value = createChart(containerRef.value, {
    width: containerRef.value.clientWidth,
    height: containerRef.value.clientHeight,
    layout: {
      background: { type: 'solid', color: backgroundColor },
      textColor,
    },
    grid: {
      vertLines: { color: '#eee' },
      horzLines: { color: '#eee' },
    },
    timeScale: {
      borderColor: '#cccccc',
    },
    priceScale: {
      borderColor: '#cccccc',
    },
    crosshair: {
      mode: 1,
    },
  })

  candleSeriesRef.value = chartRef.value.addCandlestickSeries()
  candleSeriesRef.value.setData(props.data)

  resizeObserver = new ResizeObserver(() => {
    const width = containerRef.value?.clientWidth || 0
    const height = containerRef.value?.clientHeight || 0
    chartRef.value?.resize(width, height)
  })

  resizeObserver.observe(containerRef.value)
}

// 初始化
onMounted(() => {
  initChart()
})

// 响应式数据变化
watch(
  () => props.data,
  (newData) => {
    if (candleSeriesRef.value && newData?.length) {
      candleSeriesRef.value.setData(newData)
    }
  },
  { immediate: true },
)

watch(
  () => props.theme,
  () => {
    if (!chartRef.value) return
    initChart()
  },
)

// 清理
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  chartRef.value?.remove()
  chartRef.value = null
  candleSeriesRef.value = null
})
</script>

<style scoped>
.kline-chart {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
