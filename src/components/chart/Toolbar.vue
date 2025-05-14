<template>
  <div class="toolbar-container">
    <!-- 左侧时间周期选择 -->
    <div class="timeframe-group">
      <button
        v-for="tf in timeframes"
        :key="tf.value"
        :class="['timeframe-btn', { active: currentTimeframe === tf.value }]"
        @click="handleTimeframeChange(tf.value)"
      >
        {{ tf.label }}
      </button>
    </div>

    <!-- 中间技术指标选择 -->
    <div class="indicator-group">
      <div class="indicator-selector">
        <button class="indicator-trigger" @click="showIndicatorPanel = !showIndicatorPanel">
          <i class="icon-indicator"></i>
          技术指标 ({{ activeIndicators.length }})
        </button>

        <transition name="fade">
          <div v-show="showIndicatorPanel" class="indicator-panel">
            <div
              v-for="indicator in allIndicators"
              :key="indicator.value"
              class="indicator-item"
              @click="toggleIndicator(indicator.value)"
            >
              <div class="indicator-checkbox">
                <div :class="['checkmark', { active: isIndicatorActive(indicator.value) }]"></div>
              </div>
              <span class="indicator-label">{{ indicator.label }}</span>
              <span class="indicator-shortcut">{{ indicator.shortcut }}</span>
            </div>
          </div>
        </transition>
      </div>

      <!-- 常用指标快捷按钮 -->
      <button
        v-for="quick in quickIndicators"
        :key="quick.value"
        :class="['quick-indicator', { active: isIndicatorActive(quick.value) }]"
        @click="toggleIndicator(quick.value)"
      >
        {{ quick.label }}
      </button>
    </div>

    <!-- 右侧工具按钮 -->
    <div class="tool-group">
      <button
        class="chart-type-btn"
        :class="{ active: isCandle }"
        @click="emitChartTypeChange('candlestick')"
      >
        K线
      </button>
      <button
        class="chart-type-btn"
        :class="{ active: !isCandle }"
        @click="emitChartTypeChange('line')"
      >
        分时
      </button>

      <button class="tool-btn" @click="toggleFullscreen">
        <i class="icon-fullscreen"></i>
      </button>

      <button class="tool-btn" @click="showSettings">
        <i class="icon-settings"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps({
  activeIndicators: {
    type: Array,
    default: () => [],
  },
  currentTimeframe: {
    type: String,
    default: '1d',
  },
  chartType: {
    type: String,
    default: 'candlestick',
  },
})

const emit = defineEmits([
  'timeframe-change',
  'indicator-change',
  'chart-type-change',
  'fullscreen-toggle',
])

// 时间周期配置
const timeframes = ref([
  { label: '1分', value: '1m' },
  { label: '5分', value: '5m' },
  { label: '15分', value: '15m' },
  { label: '30分', value: '30m' },
  { label: '1小时', value: '1h' },
  { label: '日线', value: '1d' },
  { label: '周线', value: '1w' },
])

// 技术指标配置
const allIndicators = ref([
  { label: 'MA 移动平均线', value: 'MA', shortcut: 'MA' },
  { label: 'BOLL 布林线', value: 'BOLL', shortcut: 'BOLL' },
  { label: 'MACD 指数平滑异同平均线', value: 'MACD', shortcut: 'MACD' },
  { label: 'RSI 相对强弱指数', value: 'RSI', shortcut: 'RSI' },
  { label: 'KDJ 随机指标', value: 'KDJ', shortcut: 'KDJ' },
])

const quickIndicators = ref([
  { label: 'MA5', value: 'MA5' },
  { label: 'MA10', value: 'MA10' },
  { label: 'VOL', value: 'VOL' },
])

const showIndicatorPanel = ref(false)
const isCandle = computed(() => props.chartType === 'candlestick')

const handleTimeframeChange = (tf) => {
  emit('timeframe-change', tf)
}

const toggleIndicator = (indicator) => {
  const current = [...props.activeIndicators]
  const index = current.indexOf(indicator)

  if (index === -1) {
    current.push(indicator)
  } else {
    current.splice(index, 1)
  }

  emit('indicator-change', current)
}

const isIndicatorActive = (indicator) => {
  return props.activeIndicators.includes(indicator)
}

const emitChartTypeChange = (type) => {
  emit('chart-type-change', type)
}

const toggleFullscreen = () => {
  emit('fullscreen-toggle')
}

const showSettings = () => {
  // 预留设置面板逻辑
  console.log('打开设置面板')
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/_variables.scss' as *;

.toolbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  padding: 0 15px;
  background: $tiger-bg-header;
  border-bottom: 1px solid $tiger-border;
}

.timeframe-group {
  display: flex;
  gap: 4px;

  .timeframe-btn {
    padding: 4px 10px;
    border: 1px solid $tiger-border;
    border-radius: 3px;
    background: $tiger-bg-dark;
    color: $tiger-text-secondary;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: $tiger-primary;
      color: $tiger-text-primary;
    }

    &.active {
      background: $tiger-primary;
      border-color: $tiger-primary;
      color: white;
    }
  }
}

.indicator-group {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;

  .indicator-selector {
    position: relative;

    .indicator-trigger {
      padding: 4px 12px;
      background: $tiger-bg-dark;
      border: 1px solid $tiger-border;
      border-radius: 3px;
      color: $tiger-text-secondary;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;

      &:hover {
        border-color: $tiger-primary;
        color: $tiger-text-primary;
      }

      .icon-indicator {
        display: inline-block;
        width: 12px;
        height: 12px;
        background: url('@/assets/icons/indicator.svg') no-repeat center;
      }
    }

    .indicator-panel {
      position: absolute;
      top: 30px;
      left: 0;
      z-index: 100;
      background: $tiger-bg-dark;
      border: 1px solid $tiger-border;
      border-radius: 4px;
      padding: 8px;
      min-width: 180px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

      .indicator-item {
        display: flex;
        align-items: center;
        padding: 6px 8px;
        cursor: pointer;
        border-radius: 3px;
        transition: background 0.2s;

        &:hover {
          background: rgba($tiger-primary, 0.1);
        }

        .indicator-checkbox {
          width: 14px;
          height: 14px;
          border: 1px solid $tiger-border;
          border-radius: 3px;
          margin-right: 8px;
          position: relative;

          .checkmark {
            position: absolute;
            top: 1px;
            left: 1px;
            width: 10px;
            height: 10px;
            background: $tiger-primary;
            border-radius: 2px;
            opacity: 0;
            transition: opacity 0.2s;

            &.active {
              opacity: 1;
            }
          }
        }

        .indicator-label {
          flex: 1;
          font-size: 12px;
          color: $tiger-text-primary;
        }

        .indicator-shortcut {
          font-size: 11px;
          color: $tiger-text-secondary;
          padding-left: 10px;
        }
      }
    }
  }

  .quick-indicator {
    padding: 4px 8px;
    border: 1px solid $tiger-border;
    border-radius: 3px;
    background: $tiger-bg-dark;
    color: $tiger-text-secondary;
    font-size: 12px;
    cursor: pointer;

    &.active {
      border-color: $tiger-primary;
      color: $tiger-primary;
    }

    &:hover {
      border-color: $tiger-primary;
    }
  }
}

.tool-group {
  display: flex;
  gap: 6px;

  .chart-type-btn {
    padding: 4px 12px;
    border: 1px solid $tiger-border;
    border-radius: 3px;
    background: $tiger-bg-dark;
    color: $tiger-text-secondary;
    font-size: 12px;
    cursor: pointer;

    &.active {
      background: $tiger-primary;
      color: white;
      border-color: $tiger-primary;
    }
  }

  .tool-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid $tiger-border;
    border-radius: 3px;
    background: $tiger-bg-dark;
    color: $tiger-text-secondary;
    cursor: pointer;

    &:hover {
      border-color: $tiger-primary;
      color: $tiger-primary;
    }

    .icon-fullscreen,
    .icon-settings {
      display: inline-block;
      width: 14px;
      height: 14px;
      background-size: contain;
    }

    .icon-fullscreen {
      background-image: url('@/assets/icons/fullscreen.svg');
    }

    .icon-settings {
      background-image: url('@/assets/icons/settings.svg');
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
