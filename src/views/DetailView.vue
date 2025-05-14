<template>
  <div class="detail-container">
    <!-- 头部信息栏 -->
    <div class="header-section">
      <div class="stock-basic">
        <h1 class="symbol">{{ stockInfo.symbol }}</h1>
        <div class="name">{{ stockInfo.name }}</div>
        <div class="exchange">{{ stockInfo.exchange }}</div>
      </div>

      <div class="price-info">
        <div class="current" :style="{ color: priceColor }">
          {{ Formatters.formatPrice(stockInfo.price) }}
        </div>
        <div class="change" :class="changeDirection">
          {{ Formatters.formatChange(stockInfo.change, stockInfo.previousClose) }}
        </div>
      </div>
    </div>

    <!-- 关键指标看板 -->
    <div class="metric-dashboard">
      <div class="metric-card" v-for="m in mainMetrics" :key="m.label">
        <div class="metric-label">{{ m.label }}</div>
        <div class="metric-value">{{ m.value }}</div>
        <div class="metric-trend" v-if="m.trend">
          <TrendArrow :direction="m.trend" />
        </div>
      </div>
    </div>

    <!-- 分时走势图 -->
    <div class="mini-chart">
      <LineChart :data="intradayData" :color="priceColor" height="120px" />
    </div>

    <!-- 标签页导航 -->
    <nav class="tab-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </nav>

    <!-- 标签内容 -->
    <div class="tab-content">
      <!-- 公司简介 -->
      <div v-show="activeTab === 'profile'" class="profile-section">
        <h2>公司简介</h2>
        <p>{{ stockInfo.profile }}</p>
        <div class="industry-tags">
          <span v-for="tag in stockInfo.industryTags" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- 财务数据 -->
      <FinancialTable v-show="activeTab === 'financial'" :data="financialData" />

      <!-- 新闻动态 -->
      <NewsFeed v-show="activeTab === 'news'" :items="newsItems" />

      <!-- 分析师评级 -->
      <AnalystRatings v-show="activeTab === 'ratings'" :ratings="analystRatings" />
    </div>

    <!-- 返回按钮 -->
    <TButton class="back-button" icon="arrow-left" @click="$router.go(-1)"> 返回行情列表 </TButton>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStockStore } from '@/stores/stock.store'
import { Formatters, Calculators } from '@/utils/helpers'
import LineChart from '@/components/chart/LineChart.vue'
import FinancialTable from '@/components/detail/FinancialTable.vue'
import NewsFeed from '@/components/detail/NewsFeed.vue'
import AnalystRatings from '@/components/detail/AnalystRatings.vue'
import TrendArrow from '@/components/ui/TrendArrow.vue'
import TButton from '@/components/ui/TButton.vue'

const route = useRoute()
const stockStore = useStockStore()

// 响应式状态
const stockInfo = ref({})
const intradayData = ref([])
const financialData = ref({})
const newsItems = ref([])
const analystRatings = ref([])
const activeTab = ref('profile')

// 标签页配置
const tabs = [
  { id: 'profile', label: '公司概况' },
  { id: 'financial', label: '财务数据' },
  { id: 'news', label: '最新动态' },
  { id: 'ratings', label: '分析师评级' },
]

// 计算属性
const priceColor = computed(() =>
  Calculators.getChangeColor(stockInfo.value.price, stockInfo.value.previousClose),
)

const changeDirection = computed(() =>
  stockInfo.value.price > stockInfo.value.previousClose ? 'up' : 'down',
)

const mainMetrics = computed(() => [
  { label: '市值', value: Formatters.formatLargeNumber(stockInfo.value.marketCap) },
  { label: '市盈率', value: stockInfo.value.peRatio },
  { label: '股息率', value: `${stockInfo.value.dividendYield}%` },
  { label: '52周波动', value: `${stockInfo.value.volatility}%` },
])

// 生命周期钩子
onMounted(async () => {
  await loadData(route.params.symbol)
})

// 数据加载
const loadData = async (symbol) => {
  try {
    const data = await stockStore.fetchStockDetail(symbol)
    stockInfo.value = data.stockInfo
    intradayData.value = data.intraday
    financialData.value = data.financials
    newsItems.value = data.news
    analystRatings.value = data.ratings
  } catch (error) {
    console.error('Failed to load stock details:', error)
  }
}
</script>

<style lang="scss" scoped>
.detail-container {
  @apply max-w-6xl mx-auto p-4 bg-[var(--bg-color)];

  .header-section {
    @apply flex flex-col md:flex-row justify-between items-start md:items-center
           mb-6 p-4 rounded-xl bg-[var(--card-bg)] shadow-sm;

    .stock-basic {
      @apply mb-4 md:mb-0;

      .symbol {
        @apply text-3xl font-bold text-[var(--text-primary)];
      }

      .name {
        @apply text-lg text-[var(--text-secondary)];
      }

      .exchange {
        @apply text-sm text-[var(--text-tertiary)];
      }
    }

    .price-info {
      @apply text-right;

      .current {
        @apply text-3xl font-bold;
      }

      .change {
        @apply text-lg px-3 py-1 rounded-lg;

        &.up {
          @apply bg-green-500/20 text-green-400;
        }
        &.down {
          @apply bg-red-500/20 text-red-400;
        }
      }
    }
  }

  .metric-dashboard {
    @apply grid grid-cols-2 md:grid-cols-4 gap-4 mb-6;

    .metric-card {
      @apply p-4 rounded-lg bg-[var(--card-bg)] transition-all hover:shadow-lg;

      .metric-label {
        @apply text-sm text-[var(--text-secondary)] mb-1;
      }

      .metric-value {
        @apply text-xl font-semibold text-[var(--text-primary)];
      }
    }
  }

  .mini-chart {
    @apply h-32 mb-6 bg-[var(--card-bg)] rounded-xl p-2;
  }

  .tab-nav {
    @apply flex border-b border-[var(--border-color)] mb-4;

    button {
      @apply px-6 py-3 -mb-px font-medium transition-colors
             text-[var(--text-secondary)] hover:text-[var(--primary-color)];

      &.active {
        @apply border-b-2 border-[var(--primary-color)] text-[var(--primary-color)];
      }
    }
  }

  .back-button {
    @apply mt-6 fixed bottom-4 right-4 shadow-lg;
  }

  .industry-tags {
    @apply flex flex-wrap gap-2 mt-4;

    .tag {
      @apply px-3 py-1 rounded-full text-sm bg-[var(--tag-bg)] text-[var(--tag-text)];
    }
  }
}

@media (max-width: 640px) {
  .detail-container {
    @apply p-2;

    .header-section {
      @apply p-3;

      .price-info .current {
        @apply text-2xl;
      }
    }

    .metric-dashboard {
      @apply grid-cols-2 gap-2;
    }
  }
}
</style>
