<template>
  <div class="analysis-container">
    <!-- 头部工具栏 -->
    <ChartToolbar
      :symbol="currentSymbol"
      :timeframe="activeTimeframe"
      @timeframe-change="handleTimeframeChange"
      @toggle-fullscreen="toggleFullscreen"
      @screenshot="handleScreenshot"
      @add-indicator="showIndicatorPanel = true"
    />

    <!-- 主图表区 -->
    <div class="chart-area" ref="chartArea">
      <KLineChart
        :symbol="currentSymbol"
        :timeframe="activeTimeframe"
        :indicators="activeIndicators"
        @chart-ready="handleChartReady"
      />

      <!-- 实时数据状态栏 -->
      <div class="status-bar">
        <div class="price-display">
          <span :style="{ color: priceColor }">{{ formattedLatestPrice }}</span>
          <span :class="['change', changeDirection]">{{ formattedChange }}</span>
        </div>
        <div class="market-time">
          {{ marketTime }}
        </div>
      </div>
    </div>

    <!-- 指标面板 -->
    <IndicatorPanel
      v-if="showIndicatorPanel"
      :active-indicators="activeIndicators"
      @add-indicator="addTechnicalIndicator"
      @close="showIndicatorPanel = false"
    />

    <!-- 时间周期选择 -->
    <TimeScale :active-timeframe="activeTimeframe" @select="handleTimeframeSelect" />

    <!-- 移动端手势检测层 -->
    <div
      v-if="isMobile"
      class="gesture-layer"
      @touchstart="handleTouchStart"
      @touchmove.passive="handleTouchMove"
      @touchend="handleTouchEnd"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStockStore } from '@/stores/stock.store'
import { useWebSocket } from '@/composables/useWebSocket'
import { Formatters, Calculators } from '@/utils/helpers'
import ChartToolbar from '@/components/chart/Toolbar.vue'
import KLineChart from '@/components/chart/KLineChart.vue'
import IndicatorPanel from '@/components/chart/IndicatorPanel.vue'
import TimeScale from '@/components/chart/TimeScale.vue'
import { useChartActions } from '@/composables/useChartActions'

const stockStore = useStockStore()
const { connect, send } = useWebSocket(import.meta.env.VITE_WS_URL)
const { exportAsImage } = useChartActions()

// 响应式状态
const currentSymbol = ref('AAPL') // 默认股票代码
const activeTimeframe = ref('1D') // 默认时间周期
const activeIndicators = ref(['MA5', 'MA10', 'VOL']) // 默认指标
const showIndicatorPanel = ref(false)
const chartArea = ref(null)
const isFullscreen = ref(false)
const _lastPrice = ref(0)
const isMobile = ref(window.innerWidth < 768)

// 计算属性
const formattedLatestPrice = computed(() => Formatters.formatPrice(stockStore.latestPrice))

const formattedChange = computed(() =>
  Formatters.formatChange(stockStore.priceChange, stockStore.previousClose),
)

const priceColor = computed(() =>
  Calculators.getChangeColor(stockStore.latestPrice, stockStore.previousClose),
)

const changeDirection = computed(() =>
  stockStore.latestPrice > stockStore.previousClose ? 'up' : 'down',
)

const marketTime = computed(() => new Date().toLocaleTimeString('en-US', { hour12: false }))

// 事件处理
const handleTimeframeChange = (tf) => {
  activeTimeframe.value = tf
  stockStore.fetchKLineData(currentSymbol.value, tf)
}

const handleChartReady = (_chartInstance) => {
  // 初始化WebSocket
  connect()
  send({
    action: 'subscribe',
    symbol: currentSymbol.value,
    timeframe: activeTimeframe.value,
  })
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    chartArea.value?.requestFullscreen()
  } else if (document.fullscreenElement) {
    document.exitFullscreen()
  }
}

const handleScreenshot = async () => {
  await exportAsImage(chartArea.value, `${currentSymbol.value}_${Date.now()}`)
}

const addTechnicalIndicator = (indicator) => {
  if (!activeIndicators.value.includes(indicator)) {
    activeIndicators.value.push(indicator)
  }
}

// 移动端手势处理
const touchStartX = ref(0)
const handleTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX
}

const handleTouchMove = (e) => {
  const diff = e.touches[0].clientX - touchStartX.value
  if (Math.abs(diff) > 50) {
    // 实现左右滑动切换时间周期
    const timeframes = ['1m', '5m', '15m', '1H', '1D', '1W']
    const currentIndex = timeframes.indexOf(activeTimeframe.value)
    const newIndex =
      diff > 0 ? Math.max(0, currentIndex - 1) : Math.min(timeframes.length - 1, currentIndex + 1)
    activeTimeframe.value = timeframes[newIndex]
    touchStartX.value = e.touches[0].clientX
  }
}

// 生命周期钩子
onMounted(() => {
  window.addEventListener('resize', handleResize)
  stockStore.fetchInitialData(currentSymbol.value)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (document.fullscreenElement) {
    document.exitFullscreen()
  }
})

// 工具方法
const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

const handleTimeframeSelect = (timeframe) => {
  activeTimeframe.value = timeframe
  stockStore.fetchKLineData(currentSymbol.value, timeframe)
}
</script>

<style lang="scss" scoped>
.analysis-container {
  @apply h-screen flex flex-col bg-[var(--chart-bg)];

  .chart-area {
    @apply flex-1 relative;
    height: calc(100vh - 120px);

    &:fullscreen {
      @apply bg-[var(--chart-bg)] p-4;
      height: 100vh;
    }
  }

  .status-bar {
    @apply absolute bottom-2 left-2 right-2 flex justify-between items-center
           bg-[var(--chart-status-bg)] px-4 py-2 rounded-lg shadow-lg;

    .price-display {
      @apply flex items-center gap-3;

      span:first-child {
        @apply text-2xl font-bold;
      }

      .change {
        @apply text-sm px-2 py-1 rounded;

        &.up {
          @apply bg-green-500/20 text-green-400;
        }
        &.down {
          @apply bg-red-500/20 text-red-400;
        }
      }
    }

    .market-time {
      @apply text-sm text-gray-400;
    }
  }

  .gesture-layer {
    @apply absolute inset-0 z-50 lg:hidden;
  }
}

// 移动端优化
@media (max-width: 768px) {
  .analysis-container {
    .status-bar {
      @apply bottom-1 left-1 right-1 px-2 py-1 text-sm;

      .price-display span:first-child {
        @apply text-xl;
      }
    }

    .time-scale {
      @apply bottom-1;
    }
  }
}
</style>
