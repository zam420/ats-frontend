// CVFilterStore
import { defineStore } from 'pinia'
import { CVFilterState } from '@/store/interface'

interface ExpiryItem<T> {
  value: T
  expiry: number
}

// 设置带有效期的数据到localStorage
function setItemWithExpiry<T>(
  key: string,
  value: T,
  ttl: number,
  compareExisting: boolean = false // 默认值为false
): void {
  const now = new Date()

  // 如果需要对比则获取当前key的现有值，主要针对page/pagesize这种刷新就需要更新的字段，因为查不出数据的时候这两个值会变需要实时设置
  if (compareExisting) {
    const existingItemStr = localStorage.getItem(key)
    
    if (existingItemStr) {
      const existingItem: ExpiryItem<T> = JSON.parse(existingItemStr)
      
      // 如果现有值和新值相同，不更新有效期
      if (JSON.stringify(existingItem.value) === JSON.stringify(value)) {
        return // 值相同，不做任何操作
      }
    }
  }

  // 更新value和expiry
  const item: ExpiryItem<T> = {
    value: value,
    expiry: now.getTime() + ttl // ttl 是有效期（以毫秒为单位）
  }
  localStorage.setItem(key, JSON.stringify(item))
}

// 从localStorage读取带有效期的数据
function getItemWithExpiry<T>(key: string): T | null {
  const itemStr = localStorage.getItem(key)

  if (!itemStr) {
    return null
  }

  const item: ExpiryItem<T> = JSON.parse(itemStr)
  const now = new Date()

  // 检查是否过期
  if (now.getTime() > item.expiry) {
    // 如果已过期，移除该项目并返回 null
    localStorage.removeItem(key)
    return null
  }

  return item.value
}

export const useCVFilterStore = defineStore({
  id: 'CVFilterState',
  state: (): CVFilterState => ({
    selectTab: 'all',
    page: 1,
    pageSize: 100,
    filterParam: {}
  }),
  getters: {},
  actions: {
    async setSelectTab(data: number | string) {
      this.selectTab = data
      setItemWithExpiry<string | number>('selectTab', data, 172800000) // 缓存2天
    },
    async setPage(data: number) {
      this.page = data
      setItemWithExpiry<number>('page', data, 172800000, true) // 缓存2天
    },
    async setPageSize(data: number) {
      this.pageSize = data
      setItemWithExpiry<number>('pageSize', data, 172800000, true) // 缓存2天
    },
    async setFilterParam(data: Record<string, any>) {
      this.filterParam = data
      setItemWithExpiry<Record<string, any>>('filterParam', data, 172800000) // 缓存2天
    },
    async restoreState() {
      this.selectTab = getItemWithExpiry<string | number>('selectTab') || 'all'
      this.page = getItemWithExpiry<number>('page') || 1
      this.pageSize = getItemWithExpiry<number>('pageSize') || 100
      this.filterParam = getItemWithExpiry<Record<string, any>>('filterParam') || {}
    }
  }
})