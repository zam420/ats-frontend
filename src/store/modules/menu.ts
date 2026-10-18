// MenuStore
import { defineStore } from 'pinia'
import { MenuState } from '@/store/interface'
import piniaPersistConfig from '@/config/piniaPersist'

export const useMenuStore = defineStore({
  id: 'MenuState',
  state: (): MenuState => ({
    isCollapse: false,
    menuList: []
  }),
  getters: {},
  actions: {
    async setCollapse() {
      this.isCollapse = !this.isCollapse
    },
    async setMenuList(menuList: Menu.MenuOptions[]) {
      this.menuList = menuList
    }
  },
  persist: piniaPersistConfig('MenuState')
})
