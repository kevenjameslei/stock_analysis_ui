import { defineStore } from 'pinia'

export const useScrollStore = defineStore('scroll', {
  state: () => ({
    positions: new Map(), // 存储路由路径和滚动位置
  }),
  actions: {
    savePosition(path, position) {
      this.positions.set(path, position)
    },
    getPosition(path) {
      return this.positions.get(path)
    },
  },
})
