import type { RouteLocationNormalized } from 'vue-router'

export function usePageTitle(route: RouteLocationNormalized) {
  const title = route.meta.title
  document.title = title ? `${title} - Tiger Stocks` : 'Tiger Stocks'
}
