<!--
 * @Author: huanghuanrong
 * @Date: 2025-11-11 19:15:48
 * @LastEditTime: 2025-11-12 11:35:42
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \pc\src\views\components\orgTree.vue
-->
<template>
  <div class="h-full overflow-auto">
    <Tree v-bind="orgTreeProps" @nodeClick="onNodeClick" />
  </div>
</template>

<script setup lang="ts">
import { getDeptsByFatherOrgId } from '@/api/common'
import { useCommonStore } from '@/store/useCommonStore'
const commonStore = useCommonStore()
const emits = defineEmits(['nodeClick'])

const orgTreeProps = reactive<any>({
  data: [],
  treeProps: {
    props: {
      children: 'children',
      label: 'jgjc',
      key: 'xfjgid',
      isLeaf: 'isLeaf',
    },
    nodeKey: 'xfjgid',
    defaultExpandedKeys: ['df2002b61f49448f9efc71af447dc505'],
    expandOnClickNode: false,
    highlightCurrent: true,
    lazy: true,
    ref: 'orgTreeRef',
    load: (node: any, resolve: (data: any[]) => void) => {
      if (node.level === 0) {
        resolve(commonStore.orgTreeData)
        setDefaultExpandedKeys(commonStore.orgTreeData) // TODO
        emits('nodeClick', commonStore.orgTreeData[0])
      } else {
        getDeptsByFatherOrgId(node.data.xfjgid).then(({ data }: any) => {
          resolve(data || [])
        })
      }
    },
  },
  height: '100%',
  width: '100%',
})

const state = reactive({
  currentNode: null,
})

onMounted(() => {})

const onNodeClick = (data: any, node: any, TreeNode: any, event: any) => {
  emits('nodeClick', data, node, TreeNode, event)
}

const setDefaultExpandedKeys = (data: any[], level: number = 1) => {
  if (level <= 0) return
  data.forEach((item: any) => {
    if (!orgTreeProps.treeProps.defaultExpandedKeys.includes(item.xfjgid)) {
      orgTreeProps.treeProps.defaultExpandedKeys.push(item.xfjgid)
    }
    if (!item.isLeaf && item.children?.length > 0) {
      setDefaultExpandedKeys(item.children, --level)
    }
  })
}

defineExpose({
  ...toRefs(state),
})
</script>

<style scoped></style>
