<template>
  <div class="portfolio-container">
    <!-- 组合概览头部 -->
    <div class="portfolio-header">
      <h2 class="title">我的自选股组合</h2>
      <div class="summary">
        <div class="summary-item">
          <span class="label">总市值</span>
          <span class="value">{{ formatCurrency(totalValue) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">当日盈亏</span>
          <span :class="['value', { positive: dailyChange >= 0, negative: dailyChange < 0 }]">
            {{ formatChange(dailyChange) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 自选股列表 -->
    <div class="portfolio-list">
      <div class="list-header">
        <div class="col name">股票名称</div>
        <div class="col price">最新价</div>
        <div class="col change">涨跌幅</div>
        <div class="col chart">分时走势</div>
        <div class="col action">操作</div>
      </div>

      <div class="list-body">
        <template v-if="loading">
          <div class="loading-indicator">
            <div class="spinner"></div>
            正在加载组合数据...
          </div>
        </template>

        <template v-else-if="portfolioItems.length === 0">
          <div class="empty-state">
            <i class="icon-empty"></i>
            <p>暂无自选股，点击添加关注股票</p>
          </div>
        </template>

        <template v-else>
          <div
            v-for="item in portfolioItems"
            :key="item.symbol"
            class="list-item"
            @click="handleSelectStock(item)"
          >
            <div class="col name">
              <span class="symbol">{{ item.symbol }}</span>
              <span class="name">{{ item.name }}</span>
            </div>
            <div class="col price">
              {{ formatPrice(item.lastPrice) }}
            </div>
            <div class="col change">
              <span
                :class="[
                  'change-badge',
                  { up: item.changePercent >= 0, down: item.changePercent < 0 },
                ]"
              >
                {{ formatPercent(item.changePercent) }}
              </span>
            </div>
            <div class="col chart">
              <MiniSparkline :data="item.sparkline" />
            </div>
            <div class="col action">
              <button class="btn-trade" @click.stop="openTradePanel(item)">交易</button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 交易面板 -->
    <TradePanel
      v-if="showTradePanel"
      :stock="selectedStock"
      @close="closeTradePanel"
      @submit="handleTradeSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStockStore } from '@/stores/stock.store.js'
import { Formatters } from '@/utils/helpers'
import MiniSparkline from '@/components/chart/MiniSparkline.vue'
import TradePanel from '@/components/portfolio/TradePanel.vue'

const stockStore = useStockStore()

// 响应式状态
const loading = ref(true)
const portfolioItems = ref([])
const selectedStock = ref(null)
const showTradePanel = ref(false)

// 计算属性
const totalValue = computed(() =>
  portfolioItems.value.reduce((sum, item) => sum + item.lastPrice * item.quantity, 0),
)

const dailyChange = computed(() =>
  portfolioItems.value.reduce((sum, item) => sum + item.dailyChange, 0),
)

// 格式化方法
const formatCurrency = Formatters.formatPrice
const formatPercent = (value) => Formatters.formatChange(value, 1)
const formatPrice = (value) => Formatters.formatPrice(value, 2)

// 初始化加载数据
onMounted(async () => {
  try {
    await stockStore.loadPortfolio()
    portfolioItems.value = stockStore.portfolio
  } catch (error) {
    console.error('加载组合数据失败:', error)
  } finally {
    loading.value = false
  }
})

// 事件处理
const handleSelectStock = (stock) => {
  router.push(`/stock/${stock.symbol}`)
}

const openTradePanel = (stock) => {
  selectedStock.value = stock
  showTradePanel.value = true
}

const closeTradePanel = () => {
  showTradePanel.value = false
  selectedStock.value = null
}

const handleTradeSubmit = (order) => {
  stockStore.executeTrade(order)
  closeTradePanel()
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/_variables.scss' as *;

.portfolio-container {
  padding: 20px;
  background: $tiger-bg-secondary;
  height: 100%;
}

.portfolio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: $tiger-bg-primary;
  border-radius: 8px;

  .title {
    color: $tiger-text-primary;
    font-size: 18px;
    margin: 0;
  }

  .summary {
    display: flex;
    gap: 32px;

    &-item {
      text-align: right;

      .label {
        display: block;
        color: $tiger-text-secondary;
        font-size: 12px;
        margin-bottom: 4px;
      }

      .value {
        font-size: 18px;
        font-weight: 500;

        &.positive {
          color: $tiger-up;
        }
        &.negative {
          color: $tiger-down;
        }
      }
    }
  }
}

.portfolio-list {
  background: $tiger-bg-primary;
  border-radius: 8px;
  overflow: hidden;

  .list-header {
    display: flex;
    padding: 12px 16px;
    background: $tiger-bg-header;
    font-size: 12px;
    color: $tiger-text-secondary;

    .col {
      padding: 0 8px;

      &.name {
        flex: 2;
      }
      &.price {
        flex: 1;
        text-align: right;
      }
      &.change {
        flex: 1;
        text-align: center;
      }
      &.chart {
        flex: 2;
      }
      &.action {
        flex: 1;
        text-align: center;
      }
    }
  }

  .list-body {
    max-height: 600px;
    overflow-y: auto;

    .list-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid $tiger-border;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: rgba($tiger-primary, 0.05);
      }

      .col {
        padding: 0 8px;

        &.name {
          .symbol {
            font-weight: 500;
            color: $tiger-text-primary;
          }
          .name {
            font-size: 12px;
            color: $tiger-text-secondary;
            margin-left: 8px;
          }
        }

        &.price {
          text-align: right;
          font-family: $tiger-number-font;
        }

        &.change {
          .change-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;

            &.up {
              background: rgba($tiger-up, 0.1);
              color: $tiger-up;
            }
            &.down {
              background: rgba($tiger-down, 0.1);
              color: $tiger-down;
            }
          }
        }
      }

      .btn-trade {
        padding: 6px 12px;
        background: rgba($tiger-primary, 0.1);
        border: none;
        border-radius: 4px;
        color: $tiger-primary;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: rgba($tiger-primary, 0.2);
        }
      }
    }
  }
}

.loading-indicator {
  padding: 32px;
  text-align: center;
  color: $tiger-text-secondary;

  .spinner {
    @include loading-spinner(24px);
    margin: 0 auto 12px;
  }
}

.empty-state {
  padding: 48px 24px;
  text-align: center;
  color: $tiger-text-secondary;

  .icon-empty {
    font-size: 48px;
    opacity: 0.5;
    margin-bottom: 16px;
  }
}
</style>
