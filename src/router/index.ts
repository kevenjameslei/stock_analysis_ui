import { createRouter, createWebHistory } from 'vue-router'
import { setupGuards } from './guards'

// 异步组件加载
const Home = () => import('@/views/HomeView.vue')
const Analysis = () => import('@/views/AnalysisView.vue')
const Login = () => import('@/views/LoginView.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页' },
  },
  {
    path: '/analysis',
    name: 'Analysis',
    component: Analysis,
    meta: { title: '行情分析', requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// 挂载守卫（包括标题、权限、数据预取）
setupGuards(router)

export default router
