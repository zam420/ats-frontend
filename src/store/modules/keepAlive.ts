import { defineStore } from 'pinia'
import { KeepAliveState } from '../interface'

export const useKeepAliveStore = defineStore({
  id: 'keepAliveStore',
  state: (): KeepAliveState => ({
    keepAliveName: []
  }),
  actions: {
    // 添加 keepAliveName
    async addKeepAliveName(name: string) {
      !this.keepAliveName.includes(name) && this.keepAliveName.push(name)
    },
    // 移除 keepAliveName
    async removeKeepAliveName(name: string) {
      this.keepAliveName = this.keepAliveName.filter(item => item !== name)
    },
    // 设置 keepAliveName
    async setKeepAliveName(keepAliveName: string[] = []) {
      this.keepAliveName = keepAliveName
    }
  }
})
