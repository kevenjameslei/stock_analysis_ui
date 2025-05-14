<template>
  <!-- 老虎证券风格的主容器 -->
  <div class="tiger-app">
    <!-- 顶部导航栏 -->
    <header class="tiger-header">
      <div class="header-left">
        <h1 class="logo">🐯 Tiger Stocks</h1>
        <div class="symbol-selector">
          <input v-model="symbolInput" placeholder="输入股票代码" @keyup.enter="changeSymbol" />
          <button @click="changeSymbol">
            <i class="icon-search"></i>
          </button>
        </div>
      </div>
      <nav class="tiger-nav">
        <router-link to="/">K线分析</router-link>
        <router-link to="/portfolio">自选股</router-link>
      </nav>
    </header>

    <!-- 主内容区 -->
    <main class="tiger-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="$route.path" />
        </transition>
      </router-view>
    </main>

    <!-- 全局加载状态 -->
    <div v-if="loading" class="global-loading">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useChartStore } from '@/stores/chart.store'

const router = useRouter()
const chartStore = useChartStore()

// 当前输入的股票代码
const symbolInput = ref('AAPL')
const loading = ref(false)

// 切换股票
const changeSymbol = () => {
  if (!symbolInput.value.trim()) return
  loading.value = true
  chartStore.setSymbol(symbolInput.value.toUpperCase())

  // 模拟数据加载
  setTimeout(() => {
    loading.value = false
    if (router.currentRoute.value.path !== '/') {
      router.push('/')
    }
  }, 800)
}

// 监听store中的symbol变化
watch(
  () => chartStore.currentSymbol,
  (newVal) => {
    symbolInput.value = newVal
  },
  { immediate: true },
)
</script>

<style lang="scss">
@use '@/assets/styles/_variables.scss' as *;

.tiger-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $tiger-bg-dark; // 使用全局变量
  color: $tiger-text-primary;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.tiger-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: $tiger-bg-header;
  border-bottom: 1px solid $tiger-border;

  .header-left {
    display: flex;
    align-items: center;
    gap: 30px;
  }

  .logo {
    font-size: 20px;
    font-weight: 700;
    color: $tiger-primary;
    margin: 0;
  }

  .symbol-selector {
    display: flex;
    align-items: center;

    input {
      width: 120px;
      padding: 6px 12px;
      background: $tiger-bg-input;
      border: 1px solid $tiger-border;
      border-radius: 4px 0 0 4px;
      color: $tiger-text-primary;
      outline: none;

      &:focus {
        border-color: $tiger-primary;
      }
    }

    button {
      padding: 6px 10px;
      background: $tiger-primary;
      border: none;
      border-radius: 0 4px 4px 0;
      color: white;
      cursor: pointer;

      &:hover {
        opacity: 0.9;
      }
    }
  }
}

.tiger-nav {
  display: flex;
  gap: 20px;

  a {
    color: $tiger-text-secondary;
    text-decoration: none;
    padding: 5px 0;
    position: relative;

    &.router-link-exact-active {
      color: $tiger-primary;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: $tiger-primary;
      }
    }

    &:hover {
      color: $tiger-text-primary;
    }
  }
}

.tiger-main {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: grid;
  place-items: center;
  z-index: 1000;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: $tiger-primary;
    animation: spin 1s ease-in-out infinite;
  }
}

// 路由过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
