<!--
 * @Author: huanghuanrong
 * @Date: 2025-10-30 14:05:57
 * @LastEditTime: 2025-10-30 17:33:15
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \pc\src\components\Screenfull\src\Screenfull.vue
-->
<script setup lang="ts">
import { Icon } from '@/components/Icon'
import { useFullscreen } from '@vueuse/core'
import { propTypes } from '@/utils/propTypes'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('screenfull')

defineProps({
  color: propTypes.string.def('')
})

const { toggle, isFullscreen } = useFullscreen()

const toggleFullscreen = () => {
  toggle()
}
</script>

<template>
  <div :class="prefixCls" @click="toggleFullscreen">
    <Icon
      :size="18"
      :icon="isFullscreen ? 'vi-zmdi:fullscreen-exit' : 'vi-zmdi:fullscreen'"
      :color="color"
    />
  </div>
</template>
