<!--
 * @Description: 
 * @Version: 1.0.0
 * @Autor: zenghaoming
 * @Date: 2024-08-15 14:23:22
 * @LastEditors: zenghaoming
 * @LastEditTime: 2024-08-15 14:27:44
-->
<template v-for="(item, index) in tagList" :key="index">
  <div v-if="isJsonString(item.bz)" :id="item.id" class="tagText">
    <template v-if="item?.isPerson">
      {{ JSON.parse(item.bz)?.ssjgid }}{{ JSON.parse(item.bz)?.gddh }}
      <br v-if="JSON.parse(item.bz)?.ssjgid" />
      {{ JSON.parse(item.bz)?.xm }} {{ JSON.parse(item.bz)?.sj }}
    </template>
    <template v-else>
      {{ item.bz }}
    </template>
  </div>
  <div v-else :id="item.id" class="tagText">{{ item.bz }}</div>
</template>

<script setup>
defineProps(['tagList']);

//
const isJsonString = (str) => {
  try {
    const obj = JSON.parse(str);
    return typeof obj === 'object' && obj !== null;
  } catch (e) {
    return false;
  }
};
</script>

<style lang="scss" scoped>
.tagText {
  color: #fff;
  padding: 0 10px;
  display: flex;
  align-items: center;
  height: 0.16667rem;
  background: #1a2c50;
  border: 1px solid #128ae1;
  border-radius: 4px;
  text-align: center;
  font-size: 12px;
}
</style>
