import { createRouter, createWebHistory } from 'vue-router'
import { useChartStore } from '@/stores/chart.store'
import { defineAsyncComponent } from 'vue'

// 异步加载组件提升性能
const AnalysisView = defineAsyncComponent(() => import('@/views/AnalysisView.vue'))
const PortfolioView = defineAsyncComponent(() => import('@/views/PortfolioView.vue'))

const routes = [
  {
    path: '/',
    name: 'Analysis',
    component: AnalysisView,
    props: (route) => ({
      symbol: route.query.s || 'AAPL', // 从URL参数获取股票代码
      timeframe: route.query.t || '1d', // 时间周期参数
      indicators: route.query.i?.split(',') || [], // 技术指标参数
    }),
    meta: {
      title: '实时行情分析',
      requiresAuth: false,
      keepAlive: true,
    },
  },
  {
    path: '/portfolio',
    name: 'Portfolio',
    component: PortfolioView,
    meta: {
      title: '我的自选股',
      requiresAuth: true,
      keepAlive: true,
    },
    beforeEnter: (to, from, next) => {
      // 自选股页面访问权限检查
      const store = useChartStore()
      store.isLoggedIn ? next() : next('/login')
    },
  },
  {
    path: '/:symbol',
    redirect: (to) => ({
      path: '/',
      query: { s: to.params.symbol },
    }),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 保持滚动位置用于深度分析场景
    return savedPosition || { top: 0, behavior: 'smooth' }
  },
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const store = useChartStore()

  // 更新页面标题
  document.title = to.meta.title ? `${to.meta.title} - Tiger Stocks` : 'Tiger Stocks'

  // 同步股票代码到store
  if (to.query.s) {
    store.setSymbol(to.query.s.toUpperCase())
  }

  next()
})

// 数据预取示例
router.beforeResolve(async (to) => {
  if (to.name === 'Analysis') {
    const store = useChartStore()
    try {
      await store.fetchInitialData({
        symbol: to.query.s,
        timeframe: to.query.t,
      })
    } catch (error) {
      console.error('数据预取失败:', error)
      return false
    }
  }
})

export default router
