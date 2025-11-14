<!--
 * @Author: huanghuanrong
 * @Date: 2025-10-30 15:34:59
 * @LastEditTime: 2025-11-13 17:10:13
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \pc\src\views\keyword\index.vue
-->
<template>
  <div class="flex flex-row gap-4">
    <div class="w-100% position-relative">
      <ElButton class="absolute top-0 right-0" type="primary" @click="onAdd">新增</ElButton>
      <Search v-bind="searchForm" @search="search" @reset="reset" />
      <Table v-bind="tableProps" />
    </div>
  </div>

  <editDialog v-model="dialogShow" :id="currentId" :title="currentId ? '编辑' : '新增'" ref="editRef" @refresh="onRefresh" />
</template>

<script lang="tsx" setup>
import { TableColumn } from '@/components/Table'
import { FormSchema } from '@/components/Form'
import { useTable } from '@/hooks/web/useTable'
import { MaintenanceKeyword } from '@/api/fx/MaintenanceKeyword'
import editDialog from '@/views/keyword/edit.vue'

const searchForm = reactive({
  isCol: false,
  labelWidth: '100px',
  schema: [
    {
      field: 'gjc',
      label: '关键字',
      component: 'Input',
    },
    {
      field: 'fxdj',
      label: '风险等级',
      component: 'Select',
      componentProps: {
        options: [
          { label: '低风险', value: 1 },
          { label: '中风险', value: 2 },
          { label: '高风险', value: 3 },
        ],
      },
    },
    {
      field: 'sfzdfsdx',
      label: '是否发送短信',
      component: 'Select',
      componentProps: {
        options: [
          { label: '是', value: 1 },
          { label: '否', value: 0 },
        ],
      },
    },
    {
      field: 'zt',
      label: '状态',
      component: 'Select',
      componentProps: {
        options: [
          { label: '启用', value: 1 },
          { label: '未启用', value: 0 },
        ],
      },
    },
  ] as FormSchema[],
})

const {
  tableMethods,
  tableState: { currentPage, pageSize, total, dataList, loading },
} = useTable({
  fetchDataApi: (p) => new MaintenanceKeyword().pageUsingPost(p),
  queryParams: {
    cjryhzh: '',
    cjsj: '',
    // fxdj: 0,
    gjc: '',
    gjcid: '',
    jlzt: 1,
    // sfzdfsdx: 0,
    xgryhzh: '',
    ywxtly: '',
    zhgxsj: '',
    // zt: 0,
  },
  immediate: true,
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
      field: 'gjc',
      label: '关键字',
    },
    {
      field: 'fxdj',
      label: '风险等级',
      width: 150,
      slots: {
        default: (data) => {
          return (
            <ElTag type={(['success', 'info', 'danger'][data.row.fxdj - 1] as any) ?? 'primary'}>
              {['低风险', '中风险', '高风险'][data.row.fxdj - 1]}
            </ElTag>
          )
        },
      },
    },
    {
      field: 'sfzdfsdx',
      label: '是否自动发送短信',
      width: 200,
      slots: {
        default: (data) => {
          return (
            <ElTag type={data.row.sfzdfsdx ? 'success' : 'danger'}>
              {data.row.sfzdfsdx === 1 ? '是' : '否'}
            </ElTag>
          )
        },
      },
    },
    {
      field: 'zt',
      label: '状态',
      slots: {
        default: (data) => {
          return (
            <ElTag type={data.row.zt ? 'success' : 'danger'}>
              {data.row.zt === 1 ? '启用' : '未启用'}
            </ElTag>
          )
        },
      },
    },
    {
      field: 'cjsj',
      label: '创建时间',
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
              <ElButton link type={data.row.zt === 1 ? 'danger' : 'success'} onClick={() => setStatus(data.row)}>
                {{ default: () => (data.row.zt === 1 ? '禁用' : '启用') }}
              </ElButton>
              <ElButton link type="primary" onClick={() => onEdit(data.row)}>
                编辑
              </ElButton>
              <ElButton link type="danger" onClick={() => onDelete(data.row)}>
                删除
              </ElButton>
            </span>
          )
        },
      },
    },
  ] as TableColumn[],
  data: dataList,
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

const onEdit = (row: any) => {
  dialogShow.value = true
  currentId.value = row.gjcid
}

const onDelete = async (row: any) => {
  await new MaintenanceKeyword().deleteUsingDelete({ id: row.gjcid })
  tableMethods.getList()
}

const setStatus = (row: any) => {
  row.zt = row.zt === 1 ? 0 : 1
  editRef.value.updateData(row, 'edit', false)
}

const onAdd = () => {
  currentId.value = ''
  dialogShow.value = true
}

const onRefresh = () => {
  currentId.value = ''
  tableMethods.getList()
}
</script>

<style lang="less" scoped></style>
