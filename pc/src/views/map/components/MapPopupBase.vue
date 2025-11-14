<!--
 * @Description: file information
 * @Author: liuyongkui
 * @Date: 2023-09-19 15:25:41
 * @LastEditors: zenghaoming
 * @LastEditTime: 2024-08-20 09:49:35
-->
<template>
  <div
    v-show="props.visible"
    :id="props.id"
    ref="popupRef"
    :class="{
      'popup minpopup': Object.keys(props.details).length <= 1,
      popup: Object.keys(props.details).length > 1,
    }"
    :style="{ marginTop: '-' + marginTopValue + 'px' }"
  >
    <div class="title_bg"></div>
    <img src="@/assets/index/pop_close.png" alt="" @click="close" class="pop_close"/>
    <div class="contentBox">
      <div v-if="Object.keys(props.details).length > 1" class="navList" :style="{ height: navHeight + 'px' }">
        <div
          v-for="(item, value, index) in props?.details"
          :key="index"
          class="navItem text-ellipsis"
          :class="{
            active: index === currentIndex,
          }"
          :title="item.cph"
          @click="showDetail(value, index)"
        >
          {{ item.cph }}
        </div>
      </div>
      <div ref="contentRef" class="itemCont">
        <div v-show="isOpen">
          <!--
          <div class="row">
            <span class="t">所属单位：</span>
            <span class="value">{{ carDetails.organname }}</span>
          </div>
          <div class="row">
            <span class="t">带队干部：</span>
            <span class="valueBox">
            <span v-for="(item, index) in carDetails?.personInfos" :key="index" class="dh">{{ item }}</span>
            </span>
          </div>
          -->
          <div class="row">
            <span class="t">呼号：</span>
            <span class="value">{{ carDetails.dthh}}</span>
          </div>
          <div class="row">
            <span class="t">车牌号：</span>
            <span class="value_number">{{ carDetails.cph }}{{ carDetails.cllb }}</span>
            <div v-if="carDetails.commandCar === true" class="commandTag"></div>
          </div>
          <div class="row">
            <span class="t">剩余距离：</span>
            <span class="value">{{ ((carDetails?.totalDistance ?? '') / 1000).toFixed(2) }}公里</span>
          </div>
          <div  class="row">
            <span class="t">剩余时间：</span>
            <span class="value">{{ _formatSeconds(carDetails.totalTime) }}</span>
          </div>
          <div class="row">
            <span class="t">途经红绿灯总数：</span>
            <span class="value">{{ carDetails.totalTrafficLight }}<img class="trafficLight" src="@/assets/image/trafficLight.png"/></span>
          </div>
          <div class="row">
            <span class="t">剩余红绿灯数量：</span>
            <span class="value">{{ carDetails.trafficLights }}<img class="trafficLight" src="@/assets/image/trafficLight.png"/></span>
          </div>
        </div>
        <div v-show="!isOpen">
          <div class="row" style="border-bottom: 1px solid ">
            <span class="value">
              <span style="color: RGBA(255, 217, 0, 1)">{{ carDetails.dthh}}</span>&nbsp;&nbsp;
              <span class="value" :style="getRowStyle(carDetails.clztdmValue)">{{ carDetails.clztdmValue }}</span>
            </span>

          </div>
          <div class="row">
            <span class="value">{{ carDetails.cphsx}}&nbsp;&nbsp;{{ carDetails.cllb }}</span>
          </div>
          <div  class="row">
            <span class="value">S-{{ carDetails.zsl }};P-{{ carDetails.pml }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="btnBox" @click="handle">
      <i :class="{ icon_up: isOpen, icon_down: !isOpen }"></i>
      <span v-if="isOpen">折叠</span>
      <span v-else>展开</span>
      <div v-if="carDetails.isMainStation === true" class="mainStation"></div>
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
  const len = Object.keys(props.details).length;
  if (len >= 1) {
    carDetails.value = props.details[Object.keys(props.details)[0]];
  }
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

const getRowStyle=(item) => {
  if (item === "出动" || item === "执勤" || item === "公务"  || item === "宣传" || item === "临时停访") {
    return {
      'width':item.length>2?'77px':'44px',
      'background': 'rgba(0,71,191,0.78)',
      'border-radius': '10px',
      'border': '1px solid #3A83FF',
      'font-size': '16px',
      'color': '#FFFFFF',
      'line-height': '22px',
      'text-align': 'center',
    }
  } else if (item === "待命" || item === "训练" || item === "培训" || item === "演练") {
    return {
      'width':'44px',
      'background': 'rgba(0,191,29,0.78)',
      'border-radius': '10px',
      'border': '1px solid #3AFF71',
      'font-size': '16px',
      'color': '#FFFFFF',
      'line-height': '22px',
      'text-align': 'center',
    }
  }else if (item === "调研" || item === "试车" || item === "验收") {
    return {
      'width':'44px',
      'background': 'rgba(0,187,191,0.78)',
      'border-radius': '10px',
      'border': '1px solid #3AD9FF',
      'font-size': '16px',
      'color': '#FFFFFF',
      'line-height': '22px',
      'text-align': 'center',
    }
  }else if (item === "故障" || item === "修理" || item === "保障"  || item === "加油") {
    return {
      'width':'44px',
      'background': 'rgba(196,137,0,0.78)',
      'border-radius': '10px',
      'border': '1px solid #FFB63A',
      'font-size': '16px',
      'color': '#FFFFFF',
      'line-height': '22px',
      'text-align': 'center',
    }
  }
  return {
    'background': 'rgba(84,99,126,0.78)',
    'border-radius': '10px',
    'border': '1px solid #AAB5C8',
  }
}

const close = () => {
  emits('update:visible', false);
};

/**
 * 时间转换  秒转为 时 分 秒
 * @param {*} value
 */
const _formatSeconds = (value) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  let theTime = parseInt(value); // 秒
  let middle = 0; // 分
  let hour = 0; // 小时

  if (theTime > 60) {
    middle = parseInt(theTime / 60);
    theTime = parseInt(theTime % 60);
    if (middle > 60) {
      hour = parseInt(middle / 60);
      middle = parseInt(middle % 60);
    }
  }
  let result = '' + parseInt(theTime) + '秒';
  if (middle > 0) {
    result = '' + parseInt(middle) + '分' + result;
  }
  if (hour > 0) {
    result = '' + parseInt(hour) + '小时' + result;
  }
  return result;
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
  width: 350px;
  background: rgba(22, 48, 89, 0.9);
  box-shadow:
    0px 0px 14px 0px rgba(0, 0, 0, 0.44),
    inset 0px 0px 33px 0px rgba(115, 174, 255, 0.6);
  border-radius: 4px;
  color: #fff;
  &.openstyle {
    margin-top: -80px;
  }
  .pop_close {
    position: absolute;
    right: 0;
    top: 0;
  }
  .title_bg {
    width: 186px;
    height: 3px;
    background: url('@/assets/index/pop_header.png');
    background-size: 100% 100%;
    position: absolute;
    top: -2px;
    left: 2px;
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

.trafficLight{
  width: 14px;
  height: 14px;
}
</style>
