import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 按需引入ECharts核心模块
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { CandlestickChart, LineChart, BarChart, EffectScatterChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  VisualMapComponent,
  AxisPointerComponent,
  LegendComponent,
} from 'echarts/components'

// 全局样式
import '@/assets/styles/chart.scss'

// 注册ECharts必要组件
echarts.use([
  CanvasRenderer,
  CandlestickChart,
  LineChart,
  BarChart,
  EffectScatterChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  VisualMapComponent,
  AxisPointerComponent,
  LegendComponent,
])

// 初始化Vue应用
const app = createApp(App)

// 配置全局属性
app.config.globalProperties.$echarts = echarts // 将ECharts实例挂载到全局
app.config.errorHandler = (err) => {
  console.error('[Global Error Handler]', err)
  // 这里可以接入错误监控系统
}

// 安装插件
app.use(createPinia())
app.use(router)

// 生产环境配置
if (import.meta.env.PROD) {
  app.config.performance = false
  app.config.warnHandler = () => {} // 禁用生产环境警告
}

// 添加水印功能
app.directive('watermark', {
  mounted(el, binding) {
    const watermark = document.createElement('div')
    watermark.style.position = 'absolute'
    watermark.style.opacity = '0.2'
    watermark.style.pointerEvents = 'none'
    watermark.textContent = binding.value || 'Tiger Chart'
    el.appendChild(watermark)
  },
})

// 挂载应用
app.mount('#app')

// 开发环境调试配置
if (import.meta.env.DEV) {
  window.$app = app // 暴露app实例到全局方便调试
  console.log('[DEV MODE] ECharts version:', echarts.version)

  const measure = (name, fn) => {
    performance.mark(`${name}-start`)
    fn()
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
  }

  measure('App Init', () => app.mount('#app'))
}
