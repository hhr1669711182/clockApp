import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableExpose, TableProps, TableSetProps, TableColumn } from '@/components/Table'
import { ElTable, ElMessageBox, ElMessage } from 'element-plus'
import { ref, watch, unref, nextTick, onMounted } from 'vue'
import { axiosResponseStructData, attachIndexToList, parseNestedPageData } from '@/utils/common'

const { t } = useI18n()

interface UseTableConfig {
  /**
   * 构建请求参数
   */
  buildParams?: (params: {
    currentPage: number
    pageSize: number
    query?: Record<string, any>
  }) => Record<string, any>
  queryParams?: Record<string, any>
  /**
   * 是否初始化的时候请求一次
   */
  immediate?: boolean
  fetchDataApi: (params?: any) => Promise<any>
  fetchDelApi?: () => Promise<boolean>
}

export const useTable = (config: UseTableConfig) => {
  const { immediate = true } = config

  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref<number>(0)
  const dataList = ref<any[]>([])
  let isPageSizeChange = false

  watch(
    () => currentPage.value,
    () => {
      if (!isPageSizeChange) methods.getList()
      isPageSizeChange = false
    }
  )

  watch(
    () => pageSize.value,
    () => {
      if (unref(currentPage) === 1) {
        methods.getList()
      } else {
        currentPage.value = 1
        isPageSizeChange = true
        methods.getList()
      }
    }
  )

  onMounted(() => {
    if (immediate) {
      methods.getList()
    }
  })

  // Table实例
  const tableRef = ref<typeof Table & TableExpose>()

  // ElTable实例
  const elTableRef = ref<ComponentRef<typeof ElTable>>()

  const queryParams = ref<Record<string, any>>({ ...config.queryParams || {} })

  const register = (ref: typeof Table & TableExpose, elRef: ComponentRef<typeof ElTable>) => {
    tableRef.value = ref
    elTableRef.value = unref(elRef)
  }

  const getTable = async () => {
    await nextTick()
    const table = unref(tableRef)
    if (!table) {
      console.error('The table is not registered. Please use the register method to register')
    }
    return table
  }

  const methods = {
    /**
     * 获取表单数据
     */
    getList: async (params?: Record<string, any>) => {
      loading.value = true
      try {
        const baseParams = config.buildParams
          ? config.buildParams({
            currentPage: unref(currentPage),
            pageSize: unref(pageSize),
            query: unref({ ...queryParams.value, ...params })
          })
          : {
            currentPage: unref(currentPage),
            pageSize: unref(pageSize),
            query: unref({ ...queryParams.value, ...params })
          }
        // const finalParams = { ...baseParams, ...(params || {}) }

        const res = await config?.fetchDataApi(baseParams)
        if (!res.status) return
        const { records = [], total: t = 0 } = res.status === 200 ? parseNestedPageData(axiosResponseStructData(res)) : parseNestedPageData(res)
        dataList.value = attachIndexToList(records, currentPage.value, pageSize.value)
        total.value = t

        // if (res.status && res.status === 200 && res.data.data) {
        //   const { data: { data: { records = [], total: t = 0 } } } = res
        //   dataList.value = records.map((item, index) => ({ ...item, index: (currentPage.value - 1) * pageSize.value + index + 1 }))
        //   total.value = t
        // } else if (res.code && res.code === '1000' && res.data) {
        //   const { data: { records = [], total: t = 0 } } = res
        //   dataList.value = records.map((item, index): any => ({ ...item, index: (currentPage.value - 1) * pageSize.value + index + 1 }))
        //   total.value = t
        // }

      } catch (err) {
        console.log('fetchDataApi error', err)
      } finally {
        loading.value = false
      }
    },

    setQueryParams: (query: Record<string, any>, options: { immediate?: boolean, resetQuery?: boolean } = {}) => {
      queryParams.value = { ...queryParams.value, ...query }
      if (options.resetQuery ?? false) {
        queryParams.value = { ...query }
      }
      if (options.immediate ?? false) {
        methods.getList()
      }
    },

    /**
     * @description 设置table组件的props
     * @param props table组件的props
     */
    setProps: async (props: TableProps = {}) => {
      const table = await getTable()
      table?.setProps(props)
    },

    /**
     * @description 设置column
     * @param columnProps 需要设置的列
     */
    setColumn: async (columnProps: TableSetProps[]) => {
      const table = await getTable()
      table?.setColumn(columnProps)
    },

    /**
     * @description 新增column
     * @param tableColumn 需要新增数据
     * @param index 在哪里新增
     */
    addColumn: async (tableColumn: TableColumn, index?: number) => {
      const table = await getTable()
      table?.addColumn(tableColumn, index)
    },

    /**
     * @description 删除column
     * @param field 删除哪个数据
     */
    delColumn: async (field: string) => {
      const table = await getTable()
      table?.delColumn(field)
    },

    /**
     * @description 获取ElTable组件的实例
     * @returns ElTable instance
     */
    getElTableExpose: async () => {
      await getTable()
      return unref(elTableRef)
    },

    refresh: () => {
      methods.getList()
    },
    // 删除数据-批量
    delList: async (idsLength: number) => {
      const { fetchDelApi } = config
      if (!fetchDelApi) {
        console.warn('fetchDelApi is undefined')
        return
      }
      ElMessageBox.confirm(t('common.delMessage'), t('common.delWarning'), {
        confirmButtonText: t('common.delOk'),
        cancelButtonText: t('common.delCancel'),
        type: 'warning'
      }).then(async () => {
        const res = await fetchDelApi()
        if (res) {
          ElMessage.success(t('common.delSuccess'))

          // 计算出临界点
          const current =
            unref(total) % unref(pageSize) === idsLength || unref(pageSize) === 1
              ? unref(currentPage) > 1
                ? unref(currentPage) - 1
                : unref(currentPage)
              : unref(currentPage)

          currentPage.value = current
          methods.getList()
        }
      })
    }
  }

  return {
    tableRegister: register,
    tableMethods: methods,
    tableState: {
      currentPage,
      pageSize,
      total,
      dataList,
      loading,
      queryParams
    }
  }
}
