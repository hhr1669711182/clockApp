<!--
 * @Description: 框架头部页面
 * @Author: wudan
 * @Date: 2023-09-14 13:52:51
 * @LastEditors: huanghuanrong
 * @LastEditTime: 2025-07-07 17:00:55
-->
<template>
    <div class="tw-bottom">
     
    </div>
  </template>
  
  <script setup>
  </script>
  
  <style scoped lang="scss">
  
  .tw-bottom {
    &::before {
      z-index: 9;
      bottom: 0;
      top: 0;
      left: 0;
      right: 0;
      content: "";
      position: absolute;
      width: 2704px;
      height: 100%;
      margin: 0 auto;
      background: url("@/assets/index/bottomBg.png") center / 100% 100% no-repeat;
      display: block;
      pointer-events: none;
    }
  }
  </style>
  