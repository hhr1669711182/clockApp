<!--
 * @Author: huanghuanrong
 * @Date: 2025-10-30 15:34:59
 * @LastEditTime: 2025-11-12 20:51:10
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \pc\src\views\attachment\index.vue
-->
<template>
  <div class="flex flex-row gap-4 h-full">
    <div class="w-[20%] min-w-[100px] h-full">
      <orgTree ref="orgTreeRef" @nodeClick="onNodeClick" />
    </div>
    <div class="w-auto h-full overflow-auto">
      <Search v-bind="searchForm" @search="search" @reset="reset" />
      <Table v-bind="tableProps" />
    </div>
  </div>

  <Dialog v-bind="dialogProps">
    <ImageViewer
      :urlList="dialogProps.data.filter((item: any) => ['png', 'jpg', 'jpeg'].includes(item.url.split('.').pop() || '')).map((item: any) => item.url)"
    />
    <template
      v-for="(item, i) in dialogProps.data.filter((item: any) => ['pdf', 'view'].findIndex((type) => item.url.includes(type)) > -1)"
      :key="i"
    >
      <iframe
        :src="item.url"
        frameborder="0"
        class="mb-2 w-full h-full min-h-[600px]"
      ></iframe>
    </template>
  </Dialog>

  <Dialog v-bind="detailDialogProps">
    <div class="flex gap-4 mb-6">
      <div class="flex flex-row gap-2">
        <span>单位名称：</span>
        <span>{{ detailDialogProps.rowData.wbdwmc }}</span>
      </div>
      <div class="flex flex-row gap-2">
        <span>单位类型：</span>
        <span>{{ dwTypes.find((item) => item.value === detailDialogProps.rowData.zddwlx)?.label || '未知' }}</span>
      </div>
    </div>
    <Search v-bind="detailDialogProps.searchForm" @search="lsSearch" @reset="lsReset" />
    <Table v-bind="detailDialogProps.tableProps" />
  </Dialog>
</template>

<script lang="tsx" setup>
import { TableColumn } from '@/components/Table'
import { FormSchema } from '@/components/Form'
import orgTree from '@/views/components/orgTree.vue'
import { useTable } from '@/hooks/web/useTable'
import { MaintenancedeptRef } from '@/api/fx/MaintenancedeptRef'
import { useCommonStore } from '@/store/useCommonStore'
import { getFileEnclosuresByGlid, getXzqhChildren } from '@/api/common'

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
    {
      field: 'wbdwmc',
      label: '维保单位',
      component: 'Input',
    },
    {
      field: 'wbry',
      label: '维保人员',
      component: 'Input',
    },
    {
      field: 'zddwXzqhdm',
      label: '所在区域',
      component: 'TreeSelect',
      componentProps: {
        checkStrictly: true,
        lazy: true,
        nodeKey: 'xzqhid',
        load: async (node: any, resolve: any) => {
          if (node.level === 0) {
            const xzqhList = [
              {
                label: commonStore.xzqhTopObj.mc,
                value: commonStore.xzqhTopObj.xzqhid,
                ...commonStore.xzqhTopObj,
              },
            ]
            resolve(xzqhList)
          } else {
            const { code, data = [] }: any = await getXzqhChildren(node.key)
            code !== '1000' && resolve([])
            const children = data?.map((item: any) => ({
              label: item.mc,
              value: item.xzqhid,
              ...item,
            }))
            resolve(children)
          }
        },
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

const zddwId = ref('')
const {
  tableMethods: lsTableMethods,
  tableState: {
    currentPage: lsCurrentPage,
    pageSize: lsPageSize,
    total: lsTotal,
    dataList: lsDataList,
    loading: lsLoading,
  },
} = useTable({
  fetchDataApi: (p) => new MaintenancedeptRef().wbdwPageUsingPost(p),
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
    zddwid: zddwId.value || '',
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
  columns: [
    {
      headerAlign: 'center',
      align: 'center',
      field: 'index',
      label: '序号',
      width: 80,
    },
    {
      field: 'zddwmc',
      label: '单位名称',
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
      field: 'wbdwmc',
      label: '维保单位名称',
    },
    {
      field: 'wbry',
      label: '维保人员',
    },
    {
      field: 'attachmentInfo',
      label: '附件信息',
      width: 150,
      slots: {
        default: (data) => {
          return (
            // <a
            //   style="cursor: pointer;"
            //   href="javascript:void(0);"
            //   onClick={() => onAttch(data.row.fjglidList)}
            // >{`${data.row.fjglidList?.length || 0}个附件`}</a>

            <div class="flex flex-wrap gap-2">
              {data.row.fjglidList?.map((fjglid: string, idx: number) => (
                <a
                  key={idx}
                  style="cursor: pointer;"
                  href="javascript:void(0);"
                  onClick={() => onAttch([fjglid])}
                >{`附件${idx + 1}`}</a>
              ))}
            </div>
          )
        },
      },
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
            <ElButton link type="primary" onClick={() => onDetail(data.row)}>
              查看
            </ElButton>
          )
        },
      },
    },
  ] as TableColumn[],
  data: dataList,
})

const dialogProps = reactive({
  title: '附件查看',
  modelValue: false,
  width: '60%',
  maxHeight: '100%',
  draggable: false,
  onClose: () => {
    dialogProps.modelValue = false
  },
  data: [] as any[],
})

const detailDialogProps = reactive({
  title: '单位维保历史记录',
  modelValue: false,
  width: '80%',
  maxHeight: '70vh',
  draggable: false,
  onClose: () => {
    detailDialogProps.modelValue = false
    detailDialogProps.rowData = {} as Recordable
    zddwId.value = ''
  },
  rowData: {} as Recordable,
  searchForm: {
    isCol: false,
    schema: [
      {
        field: 'startTime',
        label: '维保开始时间',
        component: 'DatePicker',
        componentProps: {
          type: 'date',
          valueFormat: 'YYYY-MM-DD',
          // format: 'yyyy-MM-dd',
        },
      },
      {
        field: 'endTime',
        label: '维保结束时间',
        component: 'DatePicker',
        componentProps: {
          type: 'date',
          valueFormat: 'YYYY-MM-DD',
          // format: 'yyyy-MM-dd',
        },
      },
    ] as FormSchema[],
  },
  tableProps: {
    height: '100%',
    currentPage: lsCurrentPage,
    pageSize: lsPageSize,
    loading: lsLoading,
    pagination: {
      total: lsTotal,
      onSizeChange: (val) => {
        lsPageSize.value = val
      },
      onChange: (val) => {
        lsCurrentPage.value = val
      },
    },
    border: false,
    cardWrapClass: 'w-[100%]',
    columns: [
      {
        headerAlign: 'center',
        align: 'center',
        field: 'index',
        label: '序号',
        width: 80,
      },
      {
        field: 'wbsj',
        label: '维保时间',
      },
      {
        field: 'wbdwmc',
        label: '维保单位',
      },
      {
        field: 'wbry',
        label: '维保人员',
      },
      {
        field: 'attachmentInfo',
        label: '附件信息',
        width: 150,
        slots: {
          default: (data) => {
            return (
              <div class="flex flex-wrap gap-2">
                {data.row.fjglidList?.map((fjglid: string, idx: number) => (
                  <a
                    key={idx}
                    style="cursor: pointer;"
                    href="javascript:void(0);"
                    onClick={() => onAttch([fjglid])}
                  >{`附件${idx + 1}`}</a>
                ))}
              </div>
            )
          },
        },
      },
    ] as TableColumn[],
    data: lsDataList,
  },
})

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

const onAttch = (fjglidList: string[] | string) => {
  if (!fjglidList) return

  if (Array.isArray(fjglidList) && fjglidList?.length > 0) {
    // TODO
    getFileEnclosuresByGlid(fjglidList[0]).then((res: any) => {
      if (res.code === '1000') {
        const { data = [] } = res
        const fileList = data?.map((item: any) => ({
          name: item.fjmc,
          url: item.fjlj,
        }))
        dialogProps.modelValue = true
        dialogProps.data = fileList
        // fileList.length && openFilePreview(fileList)
      }
    })
  } else {
    getFileEnclosuresByGlid(fjglidList as string).then((res: any) => {
      if (res.code === '1000') {
        const { data = [] } = res
        const fileList = data?.map((item: any) => ({
          name: item.fjmc,
          url: item.fjlj,
        }))
        dialogProps.modelValue = true
        dialogProps.data = fileList
      }
    })
  }
}

const onDetail = (row: any) => {
  detailDialogProps.modelValue = true
  detailDialogProps.rowData = row
  zddwId.value = row.zddwid
  lsTableMethods.setQueryParams({ zddwid: row.zddwid })
  lsTableMethods.getList({ zddwid: row.zddwid })
}

const lsSearch = (model: any) => {
  // TODO rule
  lsTableMethods.getList(model)
}

const lsReset = (model: any) => {
  lsTableMethods.getList(model)
}

onMounted(() => {
  tableMethods.getList()
})
</script>

<style lang="less" scoped></style>
