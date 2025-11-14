<!--
 * @Author: huanghuanrong
 * @Date: 2025-10-30 14:05:57
 * @LastEditTime: 2025-10-30 18:25:45
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \pc\src\components\base\themeConfig\index.vue
-->
<script setup lang="ts">
// import { Icon } from '@/components/Icon'
import { propTypes } from '@/utils/propTypes'
import { useDesign } from '@/hooks/web/useDesign'
import { useEventBus } from '@/hooks/event/useEventBus'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('screenfull')

defineProps({
  color: propTypes.string.def('')
})

const setThemeConfig = () => {
  useEventBus().emit('setThemeConfig', true)
}
</script>

<template>
  <div :class="prefixCls" @click="setThemeConfig">
    <Icon :size="18" :icon="'vi-mi-settings'" :color="color" />
  </div>
</template>
