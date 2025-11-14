<!--
 * @Author: huanghuanrong
 * @Date: 2025-11-12 17:55:02
 * @LastEditTime: 2025-11-12 20:06:14
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \pc\src\views\keyword\edit.vue
-->
<template>
  <Dialog v-bind="{ ...dialogProps, ...props, modelValue: show }">
    <div class="p-40px">
      <Form v-bind="formProps" @register="formRegister" />
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <ElButton @click="show = false">取消</ElButton>
        <ElButton type="primary" @click="() => submit()">确定</ElButton>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { FormProps } from '@/components/Form'
import { MaintenanceKeyword } from '@/api/fx/MaintenanceKeyword'
import { axiosResponseStructData } from '@/utils/common'
import { useForm } from '@/hooks/web/useForm'
import dayjs from 'dayjs'
import { _3 } from '@/api/fx/data-contracts'

const { formMethods, formRegister } = useForm()
const { getElFormExpose, getFormData } = formMethods

const show = defineModel({
  type: Boolean,
  default: false,
})

const props = defineProps({
  title: {
    type: String,
    default: '新增',
  },
  id: {
    type: String,
    default: '',
  },
})

const emits = defineEmits(['refresh'])

const dialogProps = reactive({
  title: '新增',
  width: '40%',
  // maxHeight: '100%',
  draggable: false,
  onClose: () => {
    formProps.model = {}
    show.value = false
  },
  data: [] as any[],
})

const formProps = reactive<FormProps>({
  model: {},
  isCol: false,
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
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: '启用', value: 1 },
          { label: '停用', value: 0 },
        ],
      },
    },
  ],
  rules: {
    gjc: [{ required: true, message: '请输入关键字', trigger: ['blur'] }],
    fxdj: [{ required: true, message: '请选择风险等级', trigger: ['blur'] }],
    sfzdfsdx: [{ required: true, message: '请选择是否发送短信', trigger: ['blur'] }],
    zt: [{ required: true, message: '请选择状态', trigger: ['blur'] }],
  },
  validateOnRuleChange: true,
})

watch(
  () => show.value,
  (v) => {
    v && props.id && getDetail()
  },
)

const getDetail = async () => {
  const res: any = await new MaintenanceKeyword().keyUsingGet(props.id)
  const { data = {} } = axiosResponseStructData(res)
  formProps.model = data
}

const submit = async () => {
  const elFormExpose = await getElFormExpose()
  elFormExpose?.validate().then(async (valid) => {
    if (valid) {
      const p = {
            fxdj: 0,
            zt: 0,
            sfzdfsdx: 0,
            cjsj: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            // -----------------
            cjryhzh: '',
            gjc: '',
            gjcid: '',
            jlzt: 1,
            ywxtly: '',
            // xgryhzh: '',
            // zhgxsj: '',
            ...(await getFormData()),
          }

          updateData(p, props.id ? 'edit' : 'add')
    }
  })
}

const updateData = async (p: _3, type: 'add' | 'edit', isDialog = true) => {
  const api =
    type === 'edit' ? new MaintenanceKeyword().editUsingPost : new MaintenanceKeyword().addUsingPost
  const res: any = await api(p)
  emits('refresh')
  isDialog && (show.value = false)
}

defineExpose({
  updateData,
})
</script>

<style scoped></style>
