<!--
 * @Description:
 * @Version: 1.0.0
 * @Autor: zenghaoming
 * @Date: 2024-08-15 14:23:22
 * @LastEditors: huanghuanrong
 * @LastEditTime: 2025-10-22 19:12:48
-->
<template>
  <div class="mark-tool">
    <div
      v-for="item in list"
      :key="item.id"
      class="tool-item"
      :class="{
        active: item.active,
        disabled: item.disabled,
      }"
      @click="clickItem(item)"
    >
      <div class="tool-img">
        <img :src="item.active ? item.iconActive : item.icon" alt="" />
      </div>
      <div class="tool-title">{{ item.name }}</div>
      <div class="tool-value">（{{ item.count ?? 0 }}）</div>
    </div>
    <div class="tool-item" style="border: none">
      <tw-popover v-model="showFilter" title="车辆状态过滤" width="220">
        <template #reference>
          <div class="params-item" @click="onCarStatusFilter">
            <elIconFilter class="icon"></elIconFilter>
          </div>
        </template>
        <template #default>
          <div class="car-check">
            <el-checkbox
              class="car-checkbox-item"
              v-model="checkAll"
              :indeterminate="isIndeterminate"
              @change="onCheckAllChange"
            >
              全部
            </el-checkbox>
            <el-checkbox-group
              class="car-checkbox"
              v-model="carCheckboxGroup"
              @change="onCheckedChange"
            >
              <el-checkbox-button
                class="car-checkbox-item"
                v-for="(p, i) in carStatusList"
                :label="p.label"
                :value="p.value"
                :disabled="p.disabled"
              >
              </el-checkbox-button>
            </el-checkbox-group>
          </div>
        </template>
      </tw-popover>
    </div>
  </div>

  <Bottom class="bottom" />
</template>

<script setup>
import EventBus from "@/utils/EventBus";
import { ref, onMounted, watch, watchEffect } from "vue";
import Bottom from "./bottom.vue";
import xfjgIcon from "@/assets/image/xfjg-icon.svg";
import wzIcon from "@/assets/image/wz-icon.svg";
import xhsIcon from "@/assets/image/xhs-icon.svg";
import zddwIcon from "@/assets/image/zddw-icon.svg";
import xfclIcon from "@/assets/image/xfcl-icon.svg";
import qbjqIcon from "@/assets/image/qbjq-icon.svg";
import hzpjIcon from "@/assets/image/hzpj.png";
import shjzIcon from "@/assets/image/shjz.png";
import qxjyIcon from "@/assets/image/qxjy.png";
import zxclIcon from "@/assets/image/zxcl.png";
import zxclIconActive from "@/assets/image/zxcl-active.svg";
import hzpjIconActive from "@/assets/image/hzpj-active.svg";
import shjzIconActive from "@/assets/image/shjz-active.svg";
import qxjyIconActive from "@/assets/image/qxjy-active.svg";
import xfjgIconActive from "@/assets/image/xfjg-icon-active.svg";
import wzIconActive from "@/assets/image/wz-icon-active.svg";
import xhsIconActive from "@/assets/image/xhs-icon-active.svg";
import zddwIconActive from "@/assets/image/zddw-icon-active.svg";
import xfclIconActive from "@/assets/image/xfcl-icon-active.svg";
import qbjqIconActive from "@/assets/image/qbjq-icon-active.svg";
import { getLayerCount } from "@/layout/center/map/common";
import { useMapStore } from "@/store/useMapStore";
import { storage } from "@/utils/cache";
import { getCarStatus } from "@/service/system";

const mapStore = useMapStore();
const allChecked = ref(false);
//
const props = defineProps(["activeId"]);

const emits = defineEmits(["changeLayerVisible"]);

const activeId = ref(1);

const checkAll = ref(false);
const showFilter = ref(false);
const isIndeterminate = ref(true);
const carCheckboxGroup = ref([]);
const carStatusList = ref([]);

const list = ref([
  {
    name: "消防机构",
    icon: xfjgIcon,
    iconActive: xfjgIconActive,
    id: 1,
    active: false,
    value: "view_strengthofduty",
  },
  {
    name: "微站",
    icon: wzIcon,
    iconActive: wzIconActive,
    id: 2,
    active: false,
    value: "view_minifirestation",
  },
  {
    name: "消防车辆",
    icon: xfclIcon,
    iconActive: xfclIconActive,
    id: 3,
    active: false,
    value: "view_base_firecarinfo",
  },
  {
    name: "消防栓",
    icon: xhsIcon,
    iconActive: xhsIconActive,
    id: 4,
    active: false,
    value: "view_xhssxxx",
  },
  {
    name: "重点单位",
    icon: zddwIcon,
    iconActive: zddwIconActive,
    id: 5,
    active: false,
    value: "obj_objectinfo",
  },
  {
    name: "火灾扑救",
    icon: hzpjIcon,
    iconActive: hzpjIconActive,
    id: 10000,
    active: false,
  },
  {
    name: "抢险救援",
    icon: qxjyIcon,
    iconActive: qxjyIconActive,
    id: 20000,
    active: false,
  },
  {
    name: "社会救助",
    icon: shjzIcon,
    iconActive: shjzIconActive,
    id: 50000,
    active: false,
  },
  {
    name: "全部警情",
    icon: qbjqIcon,
    iconActive: qbjqIconActive,
    id: 6,
    active: false,
  },
  {
    name: "在线车辆",
    icon: zxclIcon,
    iconActive: zxclIconActive,
    id: 7,
    active: false,
    // checkbox: true,
  },
]);

watchEffect(() => {
  if (mapStore.alarmNumTatol) {
    const { alarm, qxjy, shjz } = mapStore.alarmNumTatol;
    list.value[5].count = alarm;
    list.value[6].count = qxjy;
    list.value[7].count = shjz;
    list.value[8].count = shjz + alarm + qxjy;
  }
});

const clickItem = (item) => {
  // if (item.disabled) return;
  // activeId.value = item.id;
  item.active = !item.active;

  // 按钮联动
  // if (item.name === "全部警情") {
  //   list.value.forEach((p) => {
  //     if ([10000, 20000, 50000].includes(p.id)) {
  //       p.active = item.active;
  //     }
  //   });
  // } else if ([10000, 20000, 50000].includes(item.id)) {
  //   const isV = list.value
  //     .filter((d) => [10000, 20000, 50000].includes(d.id))
  //     .map((e) => e.active);
  //   list.value[8].active = isV.every((v) => v);
  // }

  if ([10000, 20000, 50000].includes(item.id) && list.value[8].active) return;

  emits("changeLayerVisible", item);
};

const initCarStatus = () => {
  getCarStatus().then(({ data: { records = [] } }) => {
    if (records && records.length > 0) {
      if (!records[0].value) return;
      carStatusList.value = JSON.parse(records[0].value).map(
        ({ dmz, dmmc }) => ({
          value: dmz,
          label: dmmc,
        })
      );
      carCheckboxGroup.value = storage.get("carMapStatus") || [];
      checkAll.value =
        carCheckboxGroup.value.length === carStatusList.value.length;
      EventBus.emit("carMapStatus", carCheckboxGroup.value);
    }
  });
};

const onCarStatusFilter = (e) => {
  // e.stopPropagation();
  showFilter.value = !showFilter.value;
};

const onCheckAllChange = (val) => {
  carCheckboxGroup.value = val
    ? carStatusList.value.map(({ value }) => value)
    : [];
  isIndeterminate.value = false;

  EventBus.emit("carStatusFilter", carCheckboxGroup.value);
};

const onCheckedChange = (values) => {
  const checkedCount = values.length;
  checkAll.value = checkedCount === carStatusList.value.length;
  isIndeterminate.value =
    checkedCount > 0 && checkedCount < carStatusList.value.length;
  EventBus.emit("carStatusFilter", carCheckboxGroup.value);
};

//选中所有图层
const checkAllItem = () => {
  console.log(allChecked.value);
};

onMounted(() => {
  activeId.value = props?.activeId || 1;
  // onwatchAction();

  initCarStatus();

  // wms num total && show
  list.value.forEach((item) => {
    item.value &&
      getLayerCount(item.value).then((res) => {
        item.count = res;
      });

    const savedList = storage.get("mapMarkToolList") || [];
    const savedItem = savedList.find((d) => d.id === item.id);
    item.active = savedItem ? savedItem.active : false;
    item.active && nextTick(() => emits("changeLayerVisible", item));
  });
});

window.addEventListener("beforeunload", () => {
  storage.set(
    "mapMarkToolList",
    list.value.map(({ active, id }) => ({ active, id })),
    {
      expire: 3600000 * 24,
    }
  );
  storage.set("carMapStatus", carCheckboxGroup.value);
});

const onwatchAction = () => {
  watch(allChecked, (newValue, oldValue) => {
    list.value.forEach((item) => {
      item.active = allChecked.value;
      emits("changeLayerVisible", item);
    });
  });
};

//接收在线车辆总数事件
EventBus.on("ZxclEvent", (v) => {
  // console.log("在线车辆总数", v);
  const idx = list.value.findIndex((p) => p.name === "在线车辆");
  if (idx > -1) {
    list.value[idx].count = v;
  }
});
</script>

<style lang="scss" scoped>
:deep .el-checkbox-button .el-checkbox-button__inner {
  background: url("@/assets/svg/carStatusTag.svg") center no-repeat !important;
  background-size: 100% 100%;
}
:deep .el-checkbox-button.is-checked .el-checkbox-button__inner {
  background: url("@/assets/svg/carStatusTagActive.svg") center no-repeat !important;
  background-size: 100% 100%;
}

.car-checkbox {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  height: 100%;
}

.car-checkbox-item {
  display: flex;
  justify-content: center;

  :deep .el-checkbox-button__inner {
    border: none !important;
    box-shadow: none !important;
  }
}
.bottom {
  height: 105px;
  position: absolute;
  bottom: 0;
  z-index: 9;
  left: 0;
  right: 0;
  margin: auto;
}

.mark-tool {
  z-index: 99;
  position: absolute;
  bottom: 23px;
  left: 0;
  right: 0;
  margin: auto;
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 734px;
  height: 76px;

  .tool-item {
    width: 56px;
    height: 69px;
    margin: 5px;
    color: #54bdff;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .params-item {
      box-shadow: inset 0px 0px 5px 0px rgba(77, 209, 255, 1);
      background-color: rgba(13, 39, 69, 1);
      border-radius: 2px;
      width: 32px;
      height: 32px;
      border: 1px solid rgba(3, 157, 209, 1);
      margin-bottom: 7px;
      text-align: center;
      line-height: 28px;

      .icon {
        width: 1em;
        height: 1em;
      }
    }

    cursor: pointer;

    .tool-img {
      width: 32px;
      height: 32px;
      margin: auto;
      text-align: center;

      img {
        margin-bottom: 8px;
        width: 100%;
        height: 100%;
      }
    }

    .tool-title {
      width: 100%;
      height: 14px;
      line-height: 12px;
      text-align: center;
      font-family: AlibabaPuHuiTi_3_55_Regular;
      font-size: 12px;
      font-style: normal;
    }
  }

  .active {
    color: #ffffff;
    background-repeat: no-repeat;
    background: rgba(0, 32, 72, 0.5);
    box-shadow: inset 0px -10px 8px 0px #30bcff;
    border: 1px solid #c1e2ff;
  }

  .disabled {
    background: #737982;
    border-color: #5e6367;
  }
}
</style>
