<!--
 * @Description: file information
 * @Author: liuyongkui
 * @Date: 2023-09-19 15:25:41
 * @LastEditors: zenghaoming
 * @LastEditTime: 2024-08-20 09:49:35
-->
<template>
  <div id="orgPopup" ref="popupRef" class="popup">
    <div class="title">消防机构详情</div>
    <a @click="close">×</a>
    <div class="contentBox">
      <div ref="contentRef" class="itemCont">
        <div class="row">
          <span class="t">机构名称：</span>
          <span class="value">{{ details?.name }}</span>
        </div>
        <div class="row">
          <span class="t">机构地址：</span>
          <span class="value">{{ details?.address }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue';
const props = defineProps({
  id: String,
  details: Object,
  visible: {
    type: Boolean,
    default: true,
  },
});

const popupRef = ref(null);
const contentRef = ref(null);
const marginTopValue = ref(0);

onMounted(async () => {});

const emits = defineEmits(['hidePopup']);
const isOpen = ref(false);
const close = () => {
  emits('hidePopup', false);
};
</script>

<style lang="scss" scoped>
.minpopup {
  width: 280px !important;
}
.popup {
  position: fixed;
  // left: 50%;
  // top: 50%;
  // display: block !important;
  width: 353px;
  background: rgba(11, 34, 69, 0.95);
  box-shadow: inset 0px 0px 33px 0px rgba(115, 174, 255, 0.6);
  border: 1px solid #099cff;
  border-radius: 4px;
  color: #fff;
  &.openstyle {
    margin-top: -80px;
  }
  a {
    position: absolute;
    right: 11px;
    top: 0;
    color: #0994ea;
    font-size: 26px;
    line-height: 35px;
    cursor: pointer;
  }

  .title {
    background: rgba(11, 34, 69, 0.95);
    box-shadow: inset 0px 0px 33px 0px rgba(115, 174, 255, 0.6);
    border-radius: 4px 4px 0px 0px;
    border-bottom: 1px solid #099cff;
    line-height: 34px;
    text-align: left;
    padding-left: 22px;
    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 500;
    font-size: 16px;
    color: #ffffff;
  }

  .title_bg {
    width: 186px;
    height: 3px;
    background: url('@/assets/index/pop_header.png');
    background-size: 100% 100%;
    position: absolute;

    top: -2px;
    left: 2px;
    .title {
      margin: 22px 7px;
      float: left;
      line-height: 34px;
    }
  }
  .contentBox {
    padding: 8px 6px;
    display: flex;
    .navList {
      width: 70px;
      flex: 0 0 auto;
      overflow: auto;
      border-right: 1px solid #6688a8;
      .navItem {
        width: calc(100% - 4px - 5px);
        padding: 5px 2px;
        border-radius: 2px;
        color: #fff;
        cursor: pointer;
        &.active,
        &:hover {
          color: #088fea;
        }
      }
    }
    .itemCont {
      flex: 1 1 auto;
      padding-left: 5px;
      .row {
        margin: 8px 0;
        word-wrap: break-word;
        display: flex;
        align-items: baseline;
        color: #96c2e0;
        font-size: 14px;
        .t {
          min-width: 70px;
          flex: 0 0 auto;
        }
        .value {
          width: calc(100% - 75px);
          flex: 0 0 auto;
          display: inline-block;
          color: #fff;
        }
        .value_number {
          width: calc(100% - 75px - 50px);
          flex: 0 0 auto;
          display: inline-block;
          color: #fff;
        }
        .valueBox {
          width: calc(100% - 75px);
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          .dh {
            color: #fff;
            margin: 2px 0;
          }
        }
      }
    }
  }
  .btnBox {
    position: relative;
    height: 24px;
    background: rgba(0, 0, 0, 0.28);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 12px;
    color: #fff;
    .icon_up {
      display: inline-block;
      width: 12px;
      height: 12px;
      background: url('@/assets/index/icon_up.png');
      background-size: 100% 100%;
      margin-right: 4px;
    }
    .icon_down {
      display: inline-block;
      width: 12px;
      height: 12px;
      background: url('@/assets/index/icon_down.png');
      background-size: 100% 100%;
      margin-right: 4px;
    }
  }
  .text-ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
  }
}
.commandTag {
  width: 50px;
  height: 25px;
  background: url('@/style/images/commandTag.png');
  background-size: 100% 100%;
  margin-right: 4px;
  position: relative;
  top: 7px;
}
.mainStation {
  width: 68px;
  height: 38px;
  background: url('@/style/images/mainStation.png');
  background-size: 100% 100%;
  right: 0;
  position: absolute;
  top: -12px;
  margin: 0;
}
</style>
