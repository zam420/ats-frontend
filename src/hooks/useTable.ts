import { SortColumn } from '@/api/interface'
import { isEmpty } from '@/utils'
/**
 * @description table 页面操作方法封装
 * @param apiUrl 获取表格数据 apiUrl(必传)
 * @param initParam 获取数据初始化参数（不必传，默认为{}）
 * @param isPageable 是否分页（不必传， 默认为true）
 * @param isFrontPagination 是否前端分页（不必传， 默认为true）
 * @param pageSearch 是否进入页面就查询（不必传， 默认为true）
 */

export const useTable = (
  apiUrl?: (params: any) => Promise<any>,
  initParam: Record<string, any> = {},
  isPageable: boolean = true,
  isFrontPagination: boolean = true,
  pageSearch: boolean = true,
  formatTable?: (tableData: any) => any,
  tableTabs: Form.FormSelect[] = [],
  statusKey: string = 'status',
  tabNeedFresh?: boolean,
  refreshCallback?: (pageable: {page_num: number, page_size: number, total_count: number}, searchParam: {[key: string]: any}) => {}
) => {
  const state = reactive<Table.TableStateProps>({
    // 缓存未排序的数据
    tableTotalOdlData: [],
    // 表格总数据
    tableTotalData: [],
    // 表格过滤后数据
    tableData: [],
    // 是否展开更多搜索框
    searchShow: false,
    // 分页数据
    pageable: {
      // 当前页数
      page_num: 1,
      // 每页显示条数
      page_size: 100,
      // 总条数
      total_count: 0
    },
    // 查询参数(只包括查询)
    searchParam: {},
    // 初始化默认的查询参数
    initSearchParam: {},
    // 总参数(包含分页和查询参数)
    totalParam: {},
    // 排序参数
    sortColumn: {},
    tableTabs: []
  })
  let curTabKey: number | string = 'all'
  /**
   * @description 分页查询数据
   */
  const pageParam = computed({
    get: () => {
      return {
        page_num: state.pageable.page_num,
        page_size: state.pageable.page_size
      }
    },
    set: (newVal: any) => {
      console.log('我是分页更新之后的值', newVal)
    }
  })
  // 初始化的时候需要做的事情就是 设置表单查询默认值 && 获取表格数据
  onMounted(() => {
    // 第一次进页面的时候传入是否默认查询列表参数
    getTableList(pageSearch, true)
  })
  /**
   * @description 获取表格数据
   * @return void
   */
  const getTableList = async (canSearch: boolean, isFirst?: boolean) => {
    try {
      updatedTotalParam()
      // 第一次进页面需要获取initParam初始化参数，后续筛选变化根据 searchList 实时更新不需要再获取 initParam
      if (isFirst) {
        state.searchParam = initParam
        Object.assign(state.totalParam, initParam)
      }
      const param = state.sortColumn
        ? Object.assign(state.totalParam, state.sortColumn)
        : state.totalParam
      if (apiUrl && canSearch) {
        const res = await apiUrl(param)
        const result = res?.result
        if (formatTable) {
          if (isPageable && !isFrontPagination) {
            const dataList = formatTable(result?.data_list ?? [])
            result.data_list = dataList
            initTableList(result, true)
          } else {
            initTableList(formatTable(result), true)
          }
          if (refreshCallback) {
            refreshCallback(state.pageable, state.searchParam)
          }
          return
        }
        initTableList(result, true)
        if (refreshCallback) {
          refreshCallback(state.pageable, state.searchParam)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }
  /**
   * @description 根据是否前端分页初始化表格数据
   * @return void
   */
  const initTableList = (result: any, isInitTabs: boolean = false) => {
    const total_count = result?.total_count ?? 0
    let dataList = result?.data_list ?? []
    dataList = !isEmpty(result?.total_count) ? dataList : result
    const { page_size, page_num } = state.pageable
    state.tableTotalData = dataList || []
    if (!isPageable) {
      state.tableData = state.tableTotalData
    } else if (!isFrontPagination) {
      state.tableData = state.tableTotalData
      isPageable && updatePageable({ page_num, page_size, total_count })
    } else {
      isPageable &&
        updatePageable({
          page_num: 1,
          page_size: 100,
          total_count: state.tableTotalData.length as number
        })
      initFrontTable()
    }
    if (tableTabs?.length && isInitTabs) {
      initTabsData()
    }
  }
  /**
   * @description 初始化 Tabs 数据
   * @return void
   */
  const initTabsData = (tableList: any[] = [], isParam: boolean = false) => {
    state.tableTabs = []
    const tab: Record<string, number> = {}
    if (tableTabs?.length) {
      tableTabs.forEach(item => {
        tab[item.value as string] = 0
      })
      if (isFrontPagination) {
        let tableTotalData = state.tableTotalData
        if (isParam) {
          tableTotalData = tableList
        }

        tableTotalData.forEach(item => {
          const status = item?.[statusKey] as string
          if (!isEmpty(status) && tab[status] >= 0) {
            tab[status] += 1
          }
        })
        tableTabs = tableTabs.map(item => {
          if (item.value === 'all') {
            item.count = tableTotalData.length
          } else {
            item.count = tab[item.value as string]
          }
          return item
        })
      }
      state.tableTabs = tableTabs
    }
  }

  /**
   * @description change tab
   * @return void
   */
  const changeTabsData = (val: number | string, needRefresh: boolean) => {
    if (isFrontPagination) {
      curTabKey = val
      const searchParam = needRefresh ? { ...state.searchParam, [statusKey]: val === 'all' ? '' : val } : state.searchParam
      search(searchParam, needRefresh)
      return
    }
    search({ ...state.searchParam, [statusKey]: val === 'all' ? '' : val })
  }
  /**
   * @description 前端分页初始化表格数据
   * @return void
   */
  const initFrontTable = () => {
    const { page_num, page_size } = state.pageable
    const props = Object.keys(state.searchParam)
    const list: any = []
    let tableTotalData = state.tableTotalData
    if (tableTabs.length) {
      if (curTabKey !== 'all' && !tabNeedFresh) {
        tableTotalData = tableTotalData.filter(item => item?.[statusKey]?.toString() === curTabKey)
      }
    }
    tableTotalData.forEach(data => {
      // 如果没有搜索条件则查全部,或者tab作为搜索条件的时候查全部
      let hasMatchedData = props.length === 0 || tabNeedFresh
      props.forEach(prop => {
        if (
          (typeof(state.searchParam[prop]) === 'number' && data[prop] === state.searchParam[prop]) ||
          (typeof(state.searchParam[prop]) !== 'number' && 
          data[prop]
            ?.toString()
            ?.toLowerCase()
            .indexOf(state.searchParam[prop]?.toString()?.toLowerCase()) > -1) ||
          !state.searchParam[prop]
        ) {
          hasMatchedData = true
        }
      })
      if (hasMatchedData) {
        list.push(data)
      }
    })

    state.pageable.total_count = list.length as number
    state.tableData = list?.slice((page_num - 1) * page_size, page_num * page_size) ?? []
  }
  /**
   * @description 更新查询参数
   * @param resPageable 后台返回的分页数据
   * @return void
   * */
  const updatedTotalParam = () => {
    state.totalParam = {}
    const nowSearchParam: { [propName: string]: any } = {}
    // 防止手动清空输入框携带参数（可以自定义查询参数前缀）
    for (const [key, value] of Object.entries(state.searchParam)) {
      // * 某些情况下参数为 false/0 也应该携带参数
      if (value || value === false || value === 0) {
        nowSearchParam[key] = value
      }
    }
    Object.assign(
      state.totalParam,
      nowSearchParam,
      isPageable && !isFrontPagination ? pageParam.value : {}
    )
  }

  /**
   * @description 更新分页信息
   * @param resPageable 后台返回的分页数据
   * @return void
   * */
  const updatePageable = (resPageable: Table.Pageable) => {
    Object.assign(state.pageable, resPageable)
  }

  /**
   * @description 表格数据查询
   * @return void
   * */
  const search = (
    searchParam: any,
    refreshApi: boolean = false,
    initTabParam: Record<string, any> = {},
    isSort?: boolean
  ) => {
    state.searchParam = searchParam
    state.pageable.page_num = searchParam?.page_num ?? 1
    state.pageable.page_size = searchParam?.page_size ?? 100
    // 前端分页的搜索是前端模糊搜索
    if (isFrontPagination && !refreshApi) {
      let list: Record<string, any>[] = []
      const props = Object.keys(searchParam)
      if (props.length && !isSort) {
        state.tableTotalData.forEach(data => {
          // 如果没有搜索条件则查全部
          if (
            props.every(
              prop =>
              (typeof(state.searchParam[prop]) === 'number' && data[prop] === state.searchParam[prop]) ||
              (typeof(state.searchParam[prop]) !== 'number' && 
                data[prop]
                  ?.toString()
                  ?.toLowerCase()
                  .indexOf(state.searchParam[prop]?.toString()?.toLowerCase()) > -1) ||
                !state.searchParam[prop]
            )
          ) {
            list.push(data)
          }
        })
      } else {
        list = state.tableTotalData
      }

      if (tableTabs?.length && Object.keys(initTabParam).length) {
        const tabProps = Object.keys(initTabParam)
        initTabsData(
          list.filter(item =>
            tabProps.some(
              prop =>
              (typeof(initTabParam[prop]) === 'number' && item[prop] === initTabParam[prop]) ||
              (typeof(initTabParam[prop]) !== 'number' && 
                item[prop]
                  ?.toString()
                  ?.toLowerCase()
                  .indexOf(initTabParam[prop]?.toString()?.toLowerCase()) > -1) ||
                !initTabParam[prop]
            )
          ),
          true
        )
      }

      if (tableTabs.length && curTabKey !== 'all' && !tabNeedFresh) {
        list =
          list.filter((item: any) => item[statusKey]?.toString() === curTabKey?.toString()) ?? []
      }

      state.pageable.total_count = list.length as number
      state.tableData =
        list?.slice(
          (state.pageable.page_num - 1) * state.pageable.page_size,
          state.pageable.page_num * state.pageable.page_size
        ) ?? []
      return
    }
    getTableList(true)
  }

  /**
   * @description 表格数据重置
   * @return void
   * */
  const reset = () => {
    state.pageable.page_num = 1
    state.searchParam = {}
    for (const [key, value] of Object.entries(state.initSearchParam)) {
      state.searchParam[key] = value
    }
    getTableList(true)
  }

  /**
   * @description 每页条数改变
   * @param val 当前条数
   * @return void
   * */
  const handleSizeChange = (val: number) => {
    state.pageable.page_num = 1
    state.pageable.page_size = val
    if (isFrontPagination) {
      initFrontTable()
      return
    }
    getTableList(true)
  }

  /**
   * @description 当前页改变
   * @param val 当前页
   * @return void
   * */
  const handleCurrentChange = (val: number) => {
    state.pageable.page_num = val
    if (isFrontPagination) {
      initFrontTable()
      return
    }
    getTableList(true)
  }
  /**
   * @description 表格排序
   * @param val 当前页
   * @return void
   * */
  const sortTable = (column: any) => {
    const { prop, order } = column
    if (isFrontPagination) {
      if (order && state.tableTotalOdlData.length === 0) {
        state.tableTotalOdlData = [...state.tableTotalData]
      }
      if (order === 'ascending') {
        state.tableTotalData.sort((a, b) => (a?.[prop!] > b?.[prop!] ? 1 : -1))
      } else if (order === 'descending') {
        state.tableTotalData.sort((a, b) => (a?.[prop!] < b?.[prop!] ? 1 : -1))
      } else {
        state.tableTotalData = [...state.tableTotalOdlData]
        state.tableTotalOdlData = []
      }
      if (isPageable) {
        search(state.searchParam, false, {}, true)
        // const pageNum = state.pageable.page_num
        // const pageSize = state.pageable.page_size
        // state.tableData = state.tableTotalData.slice((pageNum - 1) * pageSize, pageNum * pageSize)
        return
      }
      state.tableData = state.tableTotalData
      return
    }
    const param: SortColumn = {
      order_by: column?.column?.sortBy ?? column.prop,
      order: column.order === 'ascending' ? 1 : 0
    }
    state.sortColumn = column.order ? param : null
    getTableList(true)
  }
  return {
    ...toRefs(state),
    getTableList,
    search,
    reset,
    initTableList,
    handleSizeChange,
    handleCurrentChange,
    sortTable,
    changeTabsData
  }
}
