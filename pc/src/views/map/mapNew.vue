<template>
  <div class="left">
    <div class="map-wrap">
      <div id="main-map" style="width: 100%; height: 100%; border: 0"></div>

      <!-- 地图工具栏 -->
      <div class="map-tools" :class="'map-tools--summary'">
        <el-tooltip content="图层" placement="bottom" :show-after="500">
          <img class="tool-icon" src="./assets/img/mapTool/layers.png" alt="" @click="openLayer" />
        </el-tooltip>
        <el-tooltip content="回到维保中心" placement="bottom" :show-after="500">
          <img class="tool-icon" src="./assets/img/mapTool/local.png" alt="" @click="resetMap" />
        </el-tooltip>
        <el-tooltip content="放大地图" placement="bottom" :show-after="500">
          <img class="tool-icon" src="./assets/img/mapTool/jia.png" alt="" @click="zoomIn" />
        </el-tooltip>
        <el-tooltip content="缩小地图" placement="bottom" :show-after="500">
          <img class="tool-icon" src="./assets/img/mapTool/jian.png" alt="" @click="zoomOut" />
        </el-tooltip>

        <el-checkbox-group
          v-model="activeChecks"
          style="margin-bottom: 30px; box-shadow: 0 0 6px rgba(0, 0, 0, 0.5)"
        >
          <el-checkbox-button
            v-for="check in checkList.filter(({ type }) => type == 'check')"
            :value="check.value"
            :key="check.value"
            :label="check.label"
            @change="(bol: any) => onChange(check.value, bol)"
          >
            <template #default>
              <div class="flexSC">
                <div>
                  <component
                    :is="check.iconComponent"
                    :style="{
                      width: '1em',
                      height: '1em',
                      color: activeChecks.includes(check.value) ? '#fff' : '#59e4f3',
                    }"
                  />
                </div>
                <span>{{ check.label }}</span>
              </div>
            </template>
          </el-checkbox-button>
        </el-checkbox-group>

        <el-button-group>
          <el-button
            v-for="check in checkList.filter(({ type }) => type == 'button')"
            :value="check.value"
            :key="check.value"
            :label="check.label"
            @click="() => onChange(check.value, true)"
          >
            <template #default>
              <div class="flexSC">
                <div>
                  <component :is="check.iconComponent" :style="{ width: '1em', height: '1em' }" />
                </div>
                <span>{{ check.label }}</span>
              </div>
            </template>
          </el-button>
        </el-button-group>
      </div>
    </div>
  </div>

  <div class="right">
    <div class="configPanel">
      <el-tabs v-model="activeKey">
        <el-tab-pane label="围栏信息配置" name="1">
          <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            class="config-content-attrs"
            label-position="top"
          >
            <!-- <el-form-item label="维保单位" prop="maintenanceUnit" required>
              <el-select
                v-model="formData.maintenanceUnit"
                placeholder="请选择维保单位"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="单位类型" prop="unitType">
              <el-select
                v-model="formData.unitType"
                placeholder="请选择单位类型"
                style="width: 100%"
              />
            </el-form-item> -->
            <el-form-item label="围栏类型" prop="fenceType">
              <el-select
                v-model="formData.fenceType"
                :disabled="!selectedElement"
                placeholder="请选择围栏类型"
                style="width: 100%"
                @change="onFenceTypeChange"
              >
                <el-option
                  v-for="(item, index) in list.fenceType"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <!-- <el-form-item v-if="formData.fenceType === 1" label="围栏半径（米）" prop="fenceRadius">
              <el-input
                v-model="formData.fenceRadius"
                placeholder="请输入围栏半径"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="备注说明" prop="remark">
              <el-input
                v-model="formData.remark"
                style="width: 100%"
                :rows="3"
                type="textarea"
                placeholder="请输入备注说明"
              />
            </el-form-item> -->
            <div class="config-fence-info p-6">
              <el-descriptions title="围栏信息" :column="1">
                <el-descriptions-item
                  v-for="(item, index) in fenceInfo"
                  v-show="!item.hide"
                  :key="index"
                  :label="item.key + ': '"
                >
                  {{ item.value }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <div class="config-actions p-6">
        <el-button :disabled="!selectedElement" type="primary" @click="onSave">保存围栏</el-button>
        <el-button :disabled="!selectedElement" @click="onReset">取消</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import fireMap from './map'
import { useMapDrawing } from './map-draw'  
import { useEventBus } from '@/hooks/event/useEventBus'
import Feature from 'ol/Feature';
import MultiPolygon from 'ol/geom/MultiPolygon';
import WFS from 'ol/format/WFS';

const props = defineProps({
  row: {
    type: Object,
    required: true,
    default: () => {},
  },
})

const mapState = reactive({
  showLayer: true,
  layers: {
    vehicle: false,
    fireStation: true,
    xfy: false,
    monitoring: false,
  },
})

const checkList = [
  { label: '绘制围栏', value: 'draw', iconComponent: 'EditPen', color: '#59e4f3', type: 'check' },
  { label: '移动地图', value: 'move', iconComponent: 'Pointer', color: '#59e4f3', type: 'check' },
  // {
  //   label: '添加顶点',
  //   value: 'add',
  //   iconComponent: 'AddLocation',
  //   color: '#59e4f3',
  //   type: 'button',
  // },
  // {
  //   label: '删除顶点',
  //   value: 'del',
  //   iconComponent: 'DeleteLocation',
  //   color: '#59e4f3',
  //   type: 'button',
  // },
  { label: '清除全部', value: 'clear', iconComponent: 'Delete', color: '#59e4f3', type: 'button' },
]

const activeChecks = ref<string[]>([])
const activeKey = ref('1')

const formRef = ref()
const selectedElement = ref(true)
const formData = reactive({
  maintenanceUnit: '',
  unitType: '',
  fenceType: 1 as 1 | 2 | 3, // 1 圆形 2 矩形 3 多边形
  fenceRadius: '' as string | number,
  remark: '',
})
const formRules = {
  maintenanceUnit: [{ required: true, message: '请选择维保单位', trigger: 'blur' }],
}

const list = {
  fenceType: [
    { label: '圆形', value: 1 },
    //{ label: '矩形', value: 2 },
    { label: '多边形', value: 3 },
  ],
}

const fenceInfo = reactive<{ key: string; value: any; hide?: boolean }[]>([
  { key: '类型', value: '圆形' },
  { key: '中心点', value: '' },
  { key: '半径', value: null, hide: false },
  { key: '覆盖面积', value: `` },
])

// 初始化地图与绘制模块
const drawing = useMapDrawing(fireMap)

onMounted(() => {
  fireMap.init(props, 'main-map')

  useEventBus().on('updateFenceInfo', ({ center, radius, area }) => { 
      fenceInfo[1].value = center
      fenceInfo[2].value = radius
      fenceInfo[3].value = area
    })
})

function openLayer() {
  mapState.showLayer = !mapState.showLayer
}

function resetMap() {
  // fireMap.resetView()
}

function zoomIn() {
  fireMap.zoomIn()
}

function zoomOut() {
  fireMap.zoomOut()
}

function onFenceTypeChange() {
  const typeLabel = { 1: '圆形', 2: '矩形', 3: '多边形' }[formData.fenceType]
  fenceInfo[0].value = typeLabel
  drawing.setDrawType(formData.fenceType)
}

function onChange(type: string, value: boolean) {
  switch (type) {
    case 'draw':
      if (value) {
        fireMap.setDrawInteraction(formData.fenceType)
      } else {
        fireMap.removeDrawInteraction()
      }
      break
    case 'add':
      fireMap.addCenterMarker()
      break
    case 'del':
      fireMap.removeCenterMarker()
      break
    case 'clear':
      fireMap.clearAll()
      break
    default:
      console.warn(`Unknown type: ${type}`)
  }
}

function onSave() {
 // Modified by YeFeng
 /*  const info = drawing.getCurrentInfo()
  fenceInfo[1].value = info.center?.join(',') || ''
  fenceInfo[2].value = info.radius ?? null
  fenceInfo[3].value = info.area ? `约${info.area.toFixed(2)}平方米` : '' */
 
  const points = fireMap.currentGeom.transform("EPSG:3857", "EPSG:4326").getCoordinates().slice();
  points[0].forEach(i => [i[0],i[1]] = [i[1],i[0]]) 
  const feature = new Feature({   
              geom: new MultiPolygon([points]) 
          });
  feature.setGeometryName("geom");
  const attributes = new Object();
  attributes["dwid"] = props.row.zddwid;
  attributes["cjryhzh"] = "Test"; 
  feature.setProperties(attributes);  

  const wfsWriter = new WFS();
  const node = wfsWriter.writeTransaction([feature], null, null, {
    featureNS: 'http://www.telewave.com.cn/gis',   
    featurePrefix:'',
    nativeElements:[],  
    featureType: 'gis:srvc_electronic_fence',       
    srsName: 'EPSG:4326'                   
  });

  const serializer = new XMLSerializer();
  const featString = serializer.serializeToString(node); 
  fetch('http://192.168.170.222:8083/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature', { 
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
    },
    body: featString
  })
  .then(response => response.text())
  .then(data => {
    fireMap?.fenceFeatureSource?.clear(); 
    fireMap?.fenceFeatureSource?.refresh(); 
    fireMap.layers.drawSource.getSource().clear();
    console.log('success:', data)
    })
  .catch((error) => console.error('error:', error)); 
}

function onReset() {
  drawing.clearAll()
  fenceInfo[1].value = ''
  fenceInfo[2].value = null
  fenceInfo[3].value = ''
}
</script>

<style scoped lang="less">
.left,
.right {
  display: inline-block;
  vertical-align: top;
  height: 100%;
}
.left {
  width: 70%;
}
.right {
  width: 30%;
  padding: 12px;
}

.map-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.map-tools {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 8px;
}
.layer-controls {
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  padding: 8px;
  border-radius: 6px;
}
.layer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.flexSC {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
