<!--
 * @Author: huanghuanrong
 * @Date: 2025-10-30 15:34:59
 * @LastEditTime: 2025-10-30 20:25:47
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \pc\src\views\attachment\index.vue
-->
<template>
  <div class="flex flex-row gap-4">
    <div class="w-[20%] min-w-[100px]">
      <Tree v-bind="orgTreeProps" />
    </div>
    <div class="w-auto">
      <Search v-bind="searchForm" />
      <Table v-bind="tableProps" />
    </div>
  </div>
</template>

<script lang="tsx" setup>
import { TableColumn } from '@/components/Table'
import { FormSchema } from '@/components/Form'

const orgTreeProps = reactive({
  data: [
    {
      id: 1,
      name: '单位1',
      children: [
        {
          id: 2,
          name: '单位1-1'
        }
      ],
      key: 1,
      isLeaf: false,
      scopedSlots: {
        title: 'customTitle'
      }
    },
    {
      id: 3,
      name: '单位2'
    },
    {
      id: 4,
      name: '单位3'
    },
    {
      id: 5,
      name: '单位4'
    },
    {
      id: 6,
      name: '单位5'
    }
  ],
  treeProps: {
    props: {
      children: 'children',
      label: 'name',
      key: 'id'
    },
    defaultExpandedKeys: [1, 2],
    onCheckChange: (checkedKeys: number[], checkedNodes: any[]) => {
      console.log(checkedKeys, checkedNodes)
    }
  },
  height: '100%',
  width: '100%'
})

const searchForm = reactive({
  isCol: false,
  schema: [
    {
      field: 'unitName',
      label: '单位名称',
      component: 'Input'
    },
    {
      field: 'type',
      label: '单位类型',
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '文件',
            value: 'file'
          },
          {
            label: '图片',
            value: 'image'
          }
        ]
      }
    },
    {
      field: 'unit',
      label: '维保单位',
      component: 'Input'
    },
    {
      field: 'unitUser',
      label: '维保人员',
      component: 'Input'
    },
    {
      field: 'textArea',
      label: '所在区域',
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '区域A',
            value: 'areaA'
          },
          {
            label: '区域B',
            value: 'areaB'
          },
          {
            label: '区域C',
            value: 'areaC'
          }
        ]
      }
    }
  ] as FormSchema[]
})

const tableProps = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
  border: false,
  cardWrapClass: 'w-[100%]',
  // headerAlign: 'center',
  columns: [
    {
      headerAlign: 'center',
      align: 'center',
      field: 'index',
      label: '序号',
      width: 80
    },
    {
      field: 'unitName',
      label: '单位名称'
    },
    {
      field: 'unitType',
      label: '单位类型',
      width: 150,
      slots: {
        default: (data) => {
          return (
            <ElTag type={data.row.unitType === 'file' ? 'primary' : 'success'}>
              {data.row.unitType === 'file' ? '文件' : '图片'}
            </ElTag>
          )
        }
      }
    },
    {
      field: 'maintenanceUnit',
      label: '维保单位名称'
    },
    {
      field: 'maintenanceUser',
      label: '维保人员'
    },
    {
      field: 'attachmentInfo',
      label: '附件信息',
      slots: {
        default: (data) => {
          return <a href="#" target="_blank">{`${data.row.attachmentInfo}`}</a>
        }
      }
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
            <ElButton link type="primary">
              查看
            </ElButton>
          )
        }
      }
    }
  ] as TableColumn[],
  data: [
    {
      index: 1,
      unitName: 'XX大厦',
      unitType: 'file',
      maintenanceUnit: 'XX维保公司',
      maintenanceUser: '张三',
      attachmentInfo: '3个附件'
    },
    {
      index: 2,
      unitName: 'YY商场',
      unitType: 'image',
      maintenanceUnit: 'YY维保公司',
      maintenanceUser: '李四',
      attachmentInfo: '5个附件'
    },
    {
      index: 3,
      unitName: 'ZZ医院',
      unitType: 'file',
      maintenanceUnit: 'ZZ维保公司',
      maintenanceUser: '王五',
      attachmentInfo: '2个附件'
    }
  ]
})
</script>

<style lang="less" scoped></style>
