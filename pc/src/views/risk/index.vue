<!--
 * @Author: huanghuanrong
 * @Date: 2025-10-30 15:34:59
 * @LastEditTime: 2025-11-13 11:02:03
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \pc\src\views\risk\index.vue
-->
<template>
  <Search v-bind="searchForm" @search="search" @reset="reset" />
  <Table v-bind="tableProps" />

  <Dialog v-bind="dialogProps">
    <ImageViewer
      :urlList="dialogProps.data.filter((item: any) => ['png', 'jpg', 'jpeg'].includes(item.url.split('.').pop() || '')).map((item: any) => item.url)"
    />
    <template
      v-for="(item, i) in dialogProps.data.filter((item: any) => ['pdf', 'view'].findIndex((type) => item.url.includes(type)) > -1)"
      :key="i"
    >
      <iframe :src="item.url" frameborder="0" class="mb-2 w-full h-full min-h-[600px]"></iframe>
    </template>
  </Dialog>

  <detailDialog
    v-model="dialogShow"
    :id="currentId"
    :title="'详情'"
    ref="editRef"
    @refresh="onRefresh"
  />
</template>

<script lang="tsx" setup>
import { TableColumn } from '@/components/Table'
import { FormSchema } from '@/components/Form'
import { useTable } from '@/hooks/web/useTable'
import { MaintenancedeptRef } from '@/api/fx/MaintenancedeptRef'
import detailDialog from '@/views/risk/edit.vue'
import { getFileEnclosuresByGlid } from '@/api/common'
import { axiosResponseStructData } from '@/utils/common'

const zts = ref([
   { label: '维保中', value: 0 },
   { label: '已签发', value: 1 },
   { label: '已删除', value: 2 },
   { label: '待维保人员签字', value: 4 },
   { label: '待甲方签字', value: 5 },
   { label: '完成维保检查', value: 6 },
])

const fxdjs = ref([
  { label: '高风险', value: 2 },
  { label: '中风险', value: 3 },
  { label: '低风险', value: 4 },
])

const searchForm = reactive({
  isCol: false,
  labelWidth: '100px',
  schema: [
    {
      field: 'zddwmc',
      label: '单位名称',
      component: 'Input',
    },
    {
      field: 'startTime',
      label: '维保开始时间',
      component: 'DatePicker',
      componentProps: {
        type: 'date',
        valueFormat: 'YYYY-MM-DD',
      },
    },
    {
      field: 'endTime',
      label: '维保结束时间',
      component: 'DatePicker',
      componentProps: {
        type: 'date',
        valueFormat: 'YYYY-MM-DD',
      },
    },
    {
      // field: 'zt',
      // label: '维保状态',
      field: 'fxdj',
      label: '风险等级',
      component: 'Select',
      componentProps: {
        options: fxdjs.value,
      },
    },
  ] as FormSchema[],
})

const {
  tableMethods,
  tableState: { currentPage, pageSize, total, dataList, loading },
} = useTable({
  fetchDataApi: (p) => new MaintenancedeptRef().wbfxglPageUsingPost(p),
  queryParams: {
    bgid: '',
    cjryhzh: '',
    cjsj: '',
    dljd: 0,
    dlwd: 0,
    endTime: '',
    fjglidList: [],
    // fxdj: '',
    fxsbx: '',
    jlzt: 1,
    qyid: '',
    refId: '',
    sfyfsdx: null,
    sfzxbgbz: null,
    ssxfjgid: '',
    // startTime: '',
    wbdwid: '',
    // wbdwmc: '',
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
  immediate: true,
})

const tableProps = reactive({
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
      field: 'wbsj',
      label: '维保时间',
    },
    {
      field: 'wbdwmc',
      label: '维保公司',
    },
    {
      field: 'wbry',
      label: '维保人员',
    },
    {
      field: 'attachmentInfo',
      label: '维保附件',
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
    {
      field: 'fxsbx',
      label: '风险识别项',
    },
    {
      headerAlign: 'center',
      align: 'center',
      width: 200,
      field: 'action',
      label: '操作',
      slots: {
        default: (data) => {
          return (
            <span>
              <ElButton
                type={data.row.sfyfsdx === 0 ? 'primary' : 'info'}
                onClick={() => sendMsg(data.row.zddwid)}
              >
                {data.row.sfyfsdx !== 0 && <Icon size={18} icon="vi-ant-design-check-outlined" />}
                {data.row.sfyfsdx === 0 ? '发送' : '已发送'}
              </ElButton>
              {/* <ElButton link type="primary" onClick={() => onDetail(data.row)}>
                详情
              </ElButton> */}
            </span>
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

const dialogShow = ref(false)
const currentId = ref('')
const editRef = ref<any>()

const search = (model: any) => {
  tableMethods.getList(model)
}

const reset = (model: any) => {
  tableMethods.getList(model)
}

const onDetail = (row: any) => {
   dialogShow.value = true
}

const sendMsg = (zddwid: string) => {
  if (!zddwid) return
  new MaintenancedeptRef().sendMsgByZddwIdUsingGet({ zddwid }).then((r: any) => {
    const res: any = axiosResponseStructData(r)
    if (res.code === '1000' && res.data) {
      ElMessage.success('发送成功')
      tableMethods.getList()
    }
  })
}

// 发送刷新
const onRefresh = () => {
  currentId.value = ''
  tableMethods.getList()
}

const onAttch = (fjglidList: string[] | string) => {
  if (!fjglidList) return

  if (Array.isArray(fjglidList) && fjglidList?.length > 0) {
    // TODO 抽组件
    getFileEnclosuresByGlid(fjglidList[0]).then((res: any) => {
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
</script>

<style lang="less" scoped></style>
