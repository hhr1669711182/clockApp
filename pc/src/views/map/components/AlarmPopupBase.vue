<!--
 * @Description: file information
 * @Author: liuyongkui
 * @Date: 2023-09-19 15:25:41
 * @LastEditors: zenghaoming
 * @LastEditTime: 2024-08-20 09:49:35
-->
<template>
  <div v-show="details?.visible" id="popup" ref="popupRef" class="popup">
    <!-- <div class="title_bg"></div> -->
    <div class="title">{{ details?.title }}</div>
    <!-- <img src="@/assets/index/pop_close.png" alt="" @click="close" /> -->
    <a @click="close">×</a>
    <div class="contentBox">
      <div v-show="details?.type === 'alarm'" ref="contentRef" class="itemCont">
        <div class="row">
          <span class="t">报警时间：</span>
          <span class="value">{{ details?.info?.alarmTime }}</span>
        </div>
        <div class="row">
          <span class="t">灾害类型：</span>
          <span class="value">{{ details?.info?.typeName }}</span>
        </div>
        <div class="row">
          <span class="t">灾害等级：</span>
          <span class="value" :class="details?.info?.levelClass">{{ details?.info?.zhdjmc }}</span>
        </div>
        <div class="row">
          <span class="t">灾情状态：</span>
          <span class="value" :class="details?.info?.ztzt_class">{{ details?.info?.zqztmc }}</span>
        </div>

        <div class="row">
          <span class="t">主管队站：</span>
          <span class="value">{{ details?.info?.xfzOrgName }}</span>
        </div>
        <div class="row">
          <span class="t">灾害地址：</span>
          <span :title="details?.info?.ddmc" class="value">{{ details?.info?.alarmAddress }}</span>
        </div>
      </div>

      <div v-show="details?.type === 'org'" ref="contentRef" class="itemCont">
        <div class="row">
          <span class="t">机构名称：</span>
          <span class="value">{{ details?.info?.name }}</span>
        </div>
        <div class="row">
          <span class="t">机构地址：</span>
          <span :title="details?.info?.address" class="value">{{ details?.info?.address }}</span>
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
const carDetails = ref({
  // organname: '',
  // personInfos: '',
  // cph: '',
  // totalDistance: '',
  // totalTime: '',
  // trafficLights: '',
});
const navHeight = ref('100%');
onMounted(async () => {
  // const len = Object.keys(props.details).length;
  // if (len >= 1) {
  //   carDetails.value = props.details[Object.keys(props.details)[0]];
  // }
  // await nextTick(() => {
  //     console.log(contentRef?.value?.clientHeight);
  //     navHeight.value = contentRef.value?.clientHeight;
  // });
});

const currentIndex = ref(0);
const showDetail = (k, i) => {
  currentIndex.value = i;
  carDetails.value = props.details[k];
};
const emits = defineEmits(['update:visible']);
const isOpen = ref(false);
const handle = async () => {
  const oldHeight = popupRef.value?.clientHeight;
  isOpen.value = !isOpen.value;
  nextTick(async () => {
    console.log(contentRef.value?.clientHeight);
    if (isOpen.value) {
      const newHeight = popupRef.value?.clientHeight;
      marginTopValue.value = newHeight - oldHeight;
      navHeight.value = contentRef.value?.clientHeight;
    } else {
      marginTopValue.value = 0;
      navHeight.value = 0;
      await nextTick();
      navHeight.value = contentRef.value?.clientHeight;
    }
  });
};

const close = () => {
  isOpen.value = false;
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
  display: block !important;
  width: 353px;
  background: rgba(11, 34, 69, 0.95);
  box-shadow: inset 0px 0px 33px 0px rgba(115, 174, 255, 0.6);
  border: 1px solid #099cff;
  border-radius: 4px;
  color: #fff;

  &::after {
    display: block;
    content: '';
    width: 0;
    height: 0;
    position: absolute;
    border: solid 12px transparent;
    border-top-color: rgba(11, 34, 69, 0.95);
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
  }

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
          // width: calc(100% - 100px);
          width: 270px;
          flex: 0 0 auto;
          display: inline-block;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .alarmLevel1 {
          color: #48dc5f !important;
        }

        .alarmLevel2 {
          color: #439cff !important;
        }

        .alarmLevel3 {
          color: #ffce36 !important;
        }

        .alarmLevel4 {
          color: #ff7536 !important;
        }

        .alarmLevel5 {
          color: #ff3636 !important;
        }

        .zqzt_class1 {
          width: 62px;
          height: 30px;
          background: rgba(245, 50, 50, 0.3);
          border-radius: 6px;
          border: 1px solid #f53232;
          display: flex;
          align-items: center;
          justify-content: center;

          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          font-size: 14px;
          color: #ffffff;
        }

        .zqzt_class2 {
          width: 62px;
          height: 30px;
          background: rgba(59, 183, 90, 0.3);
          border-radius: 6px;
          border: 1px solid rgba(59, 183, 90, 1);
          display: flex;
          align-items: center;
          justify-content: center;

          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          font-size: 14px;
          color: #ffffff;
        }

        .zqzt_class3 {
          width: 62px;
          height: 30px;
          background: rgba(245, 161, 50, 0.3);
          border-radius: 6px;
          border: 1px solid rgba(245, 161, 50, 1);
          display: flex;
          align-items: center;
          justify-content: center;

          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          font-size: 14px;
          color: #ffffff;
        }

        .zqzt_class4 {
          width: 62px;
          height: 30px;
          background: rgba(156, 172, 197, 0.3);
          border-radius: 6px;
          border: 1px solid rgba(156, 172, 197, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          font-size: 14px;
          color: #ffffff;
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
