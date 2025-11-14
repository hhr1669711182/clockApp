<!--
 * @Author: huanghuanrong
 * @Date: 2025-10-30 15:34:59
 * @LastEditTime: 2025-11-13 10:28:41
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \pc\src\views\fence\index.vue
-->
<template>
  <div class="flex flex-row gap-4 h-full">
    <div class="w-[20%] min-w-[100px] h-full">
      <orgTree ref="orgTreeRef" @nodeClick="onNodeClick" />
    </div>
    <div class="w-[80%] h-full overflow-auto">
      <Search v-bind="searchForm" @search="search" @reset="reset" />
      <Table v-bind="tableProps" />
    </div>
  </div>

  <Dialog v-bind="dialogProps">
    <mapNew :row="rowData" />
  </Dialog>
</template>

<script lang="tsx" setup>
import { TableColumn } from '@/components/Table'
import { FormSchema } from '@/components/Form'
import orgTree from '@/views/components/orgTree.vue'
import mapNew from '@/views/map/mapNew.vue'
import { useTable } from '@/hooks/web/useTable'
import { MaintenancedeptRef } from '@/api/fx/MaintenancedeptRef'
import { useCommonStore } from '@/store/useCommonStore'

const commonStore = useCommonStore()
const orgTreeRef = ref<typeof orgTree>()

const dwTypes = ref([
  {
    label: '高层建筑',
    value: 1,
  },
  {
    label: '地下建筑',
    value: 2,
  },
  {
    label: '大型综合体',
    value: 3,
  },
  {
    label: '大型化工单位',
    value: 4,
  },
  {
    label: '住宅小区',
    value: 5,
  },
  {
    label: '自建房',
    value: 6,
  },
  {
    label: '重点单位',
    value: 7,
  },
])

const searchForm = reactive({
  isCol: false,
  schema: [
    {
      field: 'wbdwmc',
      label: '单位名称',
      component: 'Input',
    },
    {
      field: 'zddwlx',
      label: '单位类型',
      component: 'Select',
      componentProps: {
        options: dwTypes.value,
      },
    },
  ] as FormSchema[],
})

const {
  tableMethods,
  tableState: { currentPage, pageSize, total, dataList, loading },
} = useTable({
  fetchDataApi: (p) => new MaintenancedeptRef().pageUsingPost1(p),
  queryParams: {
    bgid: '',
    cjryhzh: '',
    cjsj: '',
    dljd: 0,
    dlwd: 0,
    endTime: '',
    fjglidList: [],
    fxdj: '',
    fxsbx: '',
    jlzt: 1,
    qyid: '',
    refId: '',
    sfyfsdx: null,
    sfzxbgbz: null,
    ssxfjgid: '',
    startTime: '',
    wbdwid: '',
    wbdwmc: '',
    wbry: '',
    wbrydkscList: [
      {
        sc: 0,
        wbryid: '',
        wbrymc: '',
      },
    ],
    wbryid: '',
    wbsj: '',
    xgryhzh: '',
    ywxtly: '',
    zddwXzqhdm: '',
    zddwXzqhdmValue: '',
    zddwid: '',
    zddwlx: null,
    zddwmc: '',
    zhgxsj: '',
    zqZt: null,
    zt: '',
  },
  immediate: false,
})

const tableProps = reactive({
  height: 'calc(100vh - 300px)',
  currentPage: currentPage,
  pageSize: pageSize,
  loading: loading,
  pagination: {
    total: total,
    onSizeChange: (val) => {
      pageSize.value = val
    },
    onChange: (val) => {
      currentPage.value = val
    },
  },
  border: false,
  cardWrapClass: 'w-[100%]',
  // headerAlign: 'center',
  columns: [
    {
      headerAlign: 'center',
      align: 'center',
      field: 'index',
      label: '序号',
      width: 80,
    },
    {
      field: 'wbdwmc',
      label: '维保单位名称',
    },
    {
      field: 'unitType',
      label: '单位类型',
      width: 150,
      slots: {
        default: (data) => {
          return (
            <ElTag
              type={
                (['primary', 'success', 'info', 'warning', 'danger'][
                  dwTypes.value.findIndex((item) => item.value === data.row.zddwlx) - 1
                ] as any) || 'primary'
              }
            >
              {dwTypes.value.find((item) => item.value === data.row.zddwlx)?.label || ''}
            </ElTag>
          )
        },
      },
    },
    {
      field: 'zddwXzqhdmValue',
      label: '所在区域',
    },
    {
      field: 'cjsj',
      label: '创建时间',
    },
    {
      headerAlign: 'center',
      align: 'center',
      width: 150,
      field: 'action',
      label: '操作',
      slots: {
        default: (data) => {
          return (
            <ElButton link type="primary" onClick={() => onSetMask(data.row)}>
              调整范围
            </ElButton>
          )
        },
      },
    },
  ] as TableColumn[],
  data: dataList,
})

const dialogProps = reactive({
  title: '设置地图',
  modelValue: false,
  width: '80%',
  maxHeight: '80vh',
  draggable: false,
  onClose: () => {
    rowData.value = {}
    dialogProps.modelValue = false
  },
})

const rowData = ref<any>()

const onNodeClick = (data: any) => {
  const id = data.xfjgid
  id && tableMethods.getList({ xfjgid: id })
}

const search = (model: any) => {
  tableMethods.getList(model)
}

const reset = (model: any) => {
  tableMethods.getList(model)
}

const onSetMask = (row: any) => {
  rowData.value = row
  dialogProps.modelValue = true
}

onMounted(() => {
  tableMethods.getList()
})
</script>

<style lang="less" scoped></style>
