<template>
  <div ref="chartContainer" class="sparkline-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { createChart, LineStyle } from 'lightweight-charts'
import type { ISeriesApi, LineData } from 'lightweight-charts'

const props = defineProps<{
  data: { time: string; value: number }[]
  color?: string
  height?: number
}>()

const chartContainer = ref<HTMLElement | null>(null)
let chart: ReturnType<typeof createChart> | null = null
let lineSeries: ISeriesApi<'Line'> | null = null

onMounted(() => {
  if (!chartContainer.value) return

  chart = createChart(chartContainer.value, {
    width: chartContainer.value.clientWidth,
    height: props.height || 40,
    layout: {
      background: { type: 'solid', color: 'transparent' },
      textColor: '#999',
    },
    grid: {
      vertLines: { visible: false },
      horzLines: { visible: false },
    },
    timeScale: {
      visible: false,
    },
    rightPriceScale: {
      visible: false,
    },
    crosshair: {
      vertLine: { visible: false },
      horzLine: { visible: false },
    },
  })

  lineSeries = chart.addLineSeries({
    color: props.color || '#4caf50',
    lineWidth: 2,
    lineStyle: LineStyle.Solid,
  })

  lineSeries.setData(props.data as LineData[])
})

onUnmounted(() => {
  chart?.remove()
})

watch(
  () => props.data,
  (newData) => {
    lineSeries?.setData(newData)
  },
)
</script>

<style scoped>
.sparkline-container {
  width: 100%;
  height: 100%;
}
</style>
