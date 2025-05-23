import type { Router } from 'vue-router'
import { usePageTitle } from '@/composables/usePageTitle'
import { useUserStore } from '@/stores/user'
import { useChartStore } from '@/stores/chart'

export function setupGuards(router: Router) {
  // 设置页面标题
  router.afterEach((to) => {
    usePageTitle(to)
  })

  // 权限控制
  router.beforeEach((to) => {
    const userStore = useUserStore()
    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
      return { name: 'Login' }
    }
    return true
  })

  // 数据预取（示例：同步 query 参数）
  router.beforeResolve(async (to) => {
    if (to.name === 'Analysis' && to.query.symbol) {
      const chartStore = useChartStore()
      try {
        await chartStore.fetchData(String(to.query.symbol))
      } catch (err) {
        console.error('数据加载失败：', err)
        return false
      }
    }
    return true
  })
}
