<!--
 * @Author: huanghuanrong
 * @Date: 2025-10-31 11:18:47
 * @LastEditTime: 2025-11-07 18:59:03
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \app\src\layouts\default.vue
-->
<script lang="ts" setup>
</script>

<script lang="ts">
export default {
  options: {
    addGlobalClass: true,
    virtualHost: true,
    styleIsolation: 'shared',
  },
}
</script>

<template>
  <!-- #ifdef MP-WEIXIN -->
  <!-- camera -->
  <!-- v-if="!noScrollViewPages.includes($route.path)" -->
  <scroll-view scroll-y enhanced :show-scrollbar="false" style="height: 100vh;">
    <slot />
  </scroll-view>

  <!-- <view v-else style="height: 100vh;">
    <slot />
  </view> -->
  <!-- #endif -->

  <!-- #ifndef MP-WEIXIN -->
  <div class="no-scrollbar" style="height: 100vh; overflow: auto; -webkit-overflow-scrolling: touch;">
    <slot />
  </div>
  <!-- #endif -->
</template>
