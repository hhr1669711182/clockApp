<script setup lang="ts">
import { dayjs } from 'wot-design-uni'

definePage({
  name: 'index',
})

// const router = useRouter()
const route = useRoute()
const toast = useGlobalToast()

const startTimestamp = Date.now() - (22 * 60 + 42) * 1000
const startTime = ref(formatTime(startTimestamp))
const finishTime = ref<string | null>(null)

const elapsedSeconds = ref(Math.floor((Date.now() - startTimestamp) / 1000))
let timer: number | null = null

const state = reactive({
  id: '', // 任务id
  inRegion: true, // 已进入维保区域
  finished: false, // 是否已结束维保
  cardInfo: {
    siteStatus: '',
    status: 2, // 1结束  0开始  2不在范围内 3无法连接
    iconStatus: ['location', 'location', 'warning', 'loading'],
    iconColor: ['#4979FF', '#00D0A9', '#F47700', '#ff0b4e'],
    bgColor: ['#E7F0FF', '#E2FFF6', '#FFF1E2', '#EAEFF3'],
    legal: '',
    siteName: '', // 维保地址
    btnTitle: '',
    btnSubtitle: '',
  },
  taskInfo: {},
  clockInfo: {},
  isArea: false,
  isAuthLocal: false,
  localInterval: null,
  updateTime: 10 * 1000,
}) as any

const mapInfo = ref({
  lat: 0,
  lon: 0,
})

const statusMap = {
  0: '维保进行中',
  1: '当前维保单位',
  2: '不在维保区域',
  3: '无法连接',
} as any

const legalMap = {
  0: '已进入维保区域',
  1: '不在打卡范围',
  2: '无法连接到服务器，请检查网络设置',
} as any

const btnMap = {
  0: '开始维保',
  1: '结束维保',
  2: '无法开始',
} as any

const historyRecords = ref([]) as any

const sliderValue = ref<any>(0)

onMounted(() => {
  const id = route?.query?.id as string
  if (id) {
    state.id = id
    getDetail(id)
    getCurrRecord(id)
    getHistoryRecord()
  }

  uni.authorize({
    scope: 'scope.userLocation',
    success() {
      state.isAuthLocal = true
      getLocation()

      setTimeout(() => {
        state.localInterval = setInterval(() => {
          getLocation()
        }, state.updateTime)
      }, state.updateTime)
    },
    fail(res) {
      state.isAuthLocal = false
      console.log('定位授权失败', res)
      uni.showModal({
        title: '定位权限未开启',
        content: '维保打卡需要获取您的位置信息，请在设置中手动开启定位权限',
        confirmText: '去设置',
        cancelText: '取消',
        success: (modalRes) => {
          if (modalRes.confirm) {
            uni.openSetting({
              success: (settingRes) => {
                if (settingRes.authSetting['scope.userLocation']) {
                  getLocation()
                  state.isAuthLocal = true
                }
                else {
                  state.isAuthLocal = false
                  toast.info('定位权限仍未开启，无法打卡')
                }
              },
              fail: () => toast.info('打开设置失败，请手动前往系统设置开启定位权限'),
            })
          }
        },
      })
    },
  })

  timer = setInterval(() => {
    if (!state.finished) {
      elapsedSeconds.value = Math.floor((Date.now() - startTimestamp) / 1000)
    }
  }, 1000) as unknown as number
})

onUnmounted(() => {
  clearAll()
})

onShow(() => {
  if (state.isAuthLocal) {
    state.localInterval = setInterval(() => {
      getLocation()
    }, state.updateTime)

    // timer
  }
})

onHide(() => {
  clearAll()
})

onUnload(() => {
  clearAll()
})

function clearAll() {
  if (timer)
    clearInterval(timer)
  if (state.localInterval)
    clearInterval(state.localInterval)
}

// onReachBottom(loadMore)
// onPullDownRefresh(async () => {
//   await loadInitial()
//   uni.stopPullDownRefresh()
// })

async function getDetail(rwid: string) {
  const { code, data }: any = await Apis.general.getMaintenanceTaskByIdUsingGET({ params: { rwid } })
  if (code === '1000') {
    state.taskInfo = data
    const status: number = Number(data.rwclzt) ?? 2
    console.log('🚀 ~ file: index.vue:161 ~ data.rwclzt:', data.rwclzt)

    state.cardInfo = {
      ...state.cardInfo,
      ...{
        siteName: data.dwmc,
        btnTitle: btnMap[status] || '',
        siteStatus: statusMap[status] || '',
        btnSubtitle: status === 1 ? finishTime.value : '',
        status,
      },
    }
  }
}

async function getCurrRecord(rwid: string) {
  const { code, data }: any = await Apis.general.currRecordUsingGET({ params: { rwid } })
  if (code === '1000') {
    state.clockInfo = data || {}
  }
}
// 历史维保记录
async function getHistoryRecord(page?: { current: number, size: number }) {
  const { code, data: { records = [] } }: any = await Apis.general.getMyRecordsUsingGET({ params: { size: 2000, current: 1, ...page } })
  if (code === '1000') {
    historyRecords.value = records
  }
}

function getLocation() {
  uni.getLocation({
    type: 'gcj02',
    success(res) {
      const { latitude: lat, longitude: lon /* speed, accuracy */ }: any = res
      console.log(lon, '🚀 ~ file: index.vue:225 ~ lat:', lat)
      // test
      const latitude = 22.823300
      const longitude = 108.350900

      if (latitude && longitude) {
        mapInfo.value.lat = latitude
        mapInfo.value.lon = longitude
        checkPoi({ latitude, longitude, rwid: state.id })
      }
      else {
        toast.info('定位失败，请检查网络设置')
      }
    },
  })
}

function showMap() {
  uni.openLocation({
    latitude: mapInfo.value.lat,
    longitude: mapInfo.value.lon,
    success() {
      console.log('success')
    },
  })
}

async function checkPoi(params: { latitude: number, longitude: number, rwid: string }) {
  const { code, data }: any = await Apis.general.checkClockRangeUsingPOST({ data: params })
  if (code === '1000') {
    state.isArea = Boolean(data)
    state.cardInfo.status = !data ? 2 : 0
    state.cardInfo.legal = legalMap[!data ? 1 : 0] || ''
  }
}

function formatTime(ts: number) {
  const d = new Date(ts)
  const pad = (n: number) => `${n}`.padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const durationText = computed(() => {
  const h = Math.floor(elapsedSeconds.value / 3600)
  const m = Math.floor((elapsedSeconds.value % 3600) / 60)
  const s = elapsedSeconds.value % 60
  const pad = (n: number) => `${n}`.padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
})

const setIconTextsColor = computed(() => {
  return state.cardInfo.iconColor[state.cardInfo.status] ?? '#ff0b4e'
})
const setBgColor = computed(() => {
  return state.cardInfo.bgColor[state.cardInfo.status] ?? '#EAEFF3'
})

function onClick() {
  if (state.finished)
    return
  state.finished = true
  finishTime.value = formatTime(Date.now())
  if (timer)
    clearInterval(timer)
  if (state.id && mapInfo.value.lat && mapInfo.value.lon) {
    setClock('start', state.id)
  }
}

function onSliderDragEnd({ value }: any) {
  if (value < 10)
    return nextTick(() => { sliderValue.value = 0 })
  else
    // handleStartMaintenance()
    if (state.clockInfo.dkid)
      setClock('end', state.clockInfo.dkid)
}

async function setClock(type: 'start' | 'end', id: string) {
  const apis: any = type === 'start' ? Apis.general.startMaintenanceUsingPOST({ data: { rwid: id, latitude: mapInfo.value.lat, longitude: mapInfo.value.lon } }) : Apis.general.endMaintenanceUsingPOST({ data: { dkid: id } })
  const { code, data }: any = await apis
  if (code === '1000') {
    state.clockInfo = data
    getDetail(state.id)
    // toast.success('打卡成功')
  }
}
</script>

<template>
  <UserInfo>
    <div class="panel status-card min-h-[980rpx]">
      <div class="status-title">
        <div class="title-left">
          <div class="status-tip">
            {{ state.cardInfo.siteStatus }}
          </div>
          <div class="site">
            {{ state.cardInfo.siteName }}
          </div>
          <div class="region">
            <wd-icon :name="state.cardInfo.iconStatus[state.cardInfo.status]" size="16" :color="setIconTextsColor" />
            <span class="region-text">{{ state.cardInfo.legal }}</span>
          </div>
        </div>
        <!-- <div class="title-right">
            <wd-tag type="success" size="small">
              {{ finished ? '已结束' : '进行中' }}
            </wd-tag>
          </div> -->
      </div>

      <div class="time-grid">
        <div class="time-item">
          <div class="time-label">
            <wd-icon name="clock" size="14" />
            <span>开始时间</span>
          </div>
          <div class="time-value">
            {{ startTime }}
          </div>
        </div>
        <div class="time-item">
          <div class="time-label">
            <wd-icon name="calendar" size="14" />
            <span>结束时间</span>
          </div>
          <div class="time-value">
            {{ finishTime || '—' }}
          </div>
        </div>
      </div>

      <div class="circle-wrap">
        <button :class="`circle-btn a${state.cardInfo.status}`" :disabled="!state.isArea" @click="onClick">
          <div class="circle-text">
            <div class="btn-title">
              {{ state.cardInfo.btnTitle }}
            </div>
            <div class="btn-time">
              {{ state.cardInfo.status === 1 ? state.cardInfo.btnSubtitle : durationText }}
            </div>
          </div>
        </button>
      </div>

      <div class="tips">
        <div class="tip-muted start" :class="[sliderValue === 10 && 'end']">
          <wd-slider
            v-if="state.cardInfo.status === 1" v-model="sliderValue" :hide-label="true" :hide-min-max="true"
            inactive-color="#D0E1F2" :min="0" :max="10" :step="1" active-color="#00B474" @dragend="onSliderDragEnd"
          />
          <span v-else>
            {{ ['点击按钮开始维保打卡', '点击按钮完成维保打卡', '在维保现场范围才能开始', '请返回维保现场才能结束打卡'][state.cardInfo.status]
            }}
            <text class="flex pl-10rpx font-size-32rpx c-#3579FF" @click="showMap">
              <wd-icon name="location" size="16" />
              位置验证
            </text>
          </span>
        </div>
        <div class="tip-list">
          <div class="tip-item">
            请确认所有维保工作已完成
          </div>
          <div class="tip-item">
            结束打卡后将无法修改
          </div>
          <div class="tip-item">
            系统将自动记录维保时长
          </div>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="history-title">
        <wd-icon name="note" size="16" color="#4a8cf1" />
        <span>历史维保记录</span>
      </div>
      <div class="w-full flex flex-col gap-20rpx overflow-hidden">
        <div v-for="(rec, idx) in historyRecords" :key="idx" class="historyCard">
          <span class="font-500">{{ rec.dwmc }}</span>
          <span class="font-size-28rpx">{{ `${dayjs(rec.wbkssj).format('YYYY-MM-DD HH:mm')} 至
            ${dayjs(rec.wbjssj).format('YYYY-MM-DD HH:mm')}` }}</span>
          <span class="c-#0063FF">
            {{
              (() => {
                const start = dayjs(rec.wbkssj)
                const end = dayjs(rec.wbjssj)
                const days = end.diff(start, 'day')
                const hours = end.diff(start, 'hour') % 24
                const minutes = end.diff(start, 'minute') % 60
                let text = ''
                if (days) text += `${days}天`
                if (hours) text += `${hours}时`
                if (minutes) text += `${minutes}分`
                return text || '0分'
              })()
            }}
          </span>
        </div>
      </div>
    </div>
  </UserInfo>
</template>

<style lang="scss" scoped>
.start {
  :deep(.wd-slider) {
    margin: auto;
    width: 85%;
    height: 72rpx;
    border-radius: 72rpx;

    .wd-slider__bar-wrapper {
      margin: 0 !important;
      border: 1px solid #D0E1F2;
      border-radius: 72rpx;
      background: linear-gradient(90deg, #F4FAFF 0%, #ECF6FF 100%);

      &::before {
        content: '拖动滑块至最右侧确认结束维保检查';
        position: absolute;
        left: 80rpx;
        top: 50%;
        transform: translateY(-50%);
        font-weight: 400;
        font-size: 28rpx;
        color: #8592B6;
        line-height: 40rpx;
        text-align: left;
      }
    }

    .wd-slider__bar {
      height: 72rpx;
      border-radius: 72rpx 0rpx 0rpx 72rpx;
      opacity: 1;
    }

    .wd-slider__button-wrapper {
      top: 50%;
      transform: translateY(-50%);
    }
  }

  :deep(.wd-slider__button) {
    width: 108rpx;
    height: 108rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: url('/static/slider.png') no-repeat center / contain;
    background-size: 100% 100%;
    box-shadow: none;
    border: 0;
  }
}

.end {
  :deep(.wd-slider__button) {
    background: url('/static/slider-success.png') no-repeat center / contain;

    &::after {
      content: '维保完成';
      position: absolute;
      left: -280rpx;
      top: 50%;
      transform: translateY(-50%);
      font-weight: 400;
      font-size: 28rpx;
      color: #fff;
      line-height: 40rpx;
      text-align: left;
    }
  }
}

.panel {
  position: relative;
  background: #FFFFFF;
  border-radius: 48rpx;
  margin: 20rpx;
  border: 2rpx solid;
  z-index: 2;
  padding: 18rpx 20rpx;
}

.status-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: v-bind(setBgColor);
  border-radius: 24rpx;
  padding: 20rpx 35rpx;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 14rpx;
    height: 100%;
    border-radius: 31rpx 0rpx 0rpx 31rpx;
    background: v-bind(setIconTextsColor);
  }
}

.status-tip {
  font-size: 28rpx;
  color: #8592B6;
  line-height: 40rpx;
  text-align: left;
}

.site {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2f50;
  font-weight: 500;
  font-size: 32rpx;
  color: #4F668A;
  line-height: 45rpx;
  text-align: left;
  font-style: normal;
}

.region {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-family: PingFangSC, PingFang SC;
  font-weight: 500;
  font-size: 32rpx;
  color: v-bind(setIconTextsColor);
  line-height: 45rpx;
  text-align: left;
  font-style: normal;
}

.region-text {
  font-size: 24rpx;
}

.time-grid {
  margin-top: 20rpx;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12rpx;
}

.time-item {
  border-radius: 16rpx;
  padding: 10rpx 20rpx;
  background: #F7F7F7;
}

.time-label {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  color: #8592B6;
}

.time-value {
  margin-top: 8rpx;
  font-size: 28rpx;
  color: #4F668A;
}

.circle-wrap {
  display: flex;
  justify-content: center;
  margin: 24rpx 0;
}

.circle-btn {
  width: 324rpx;
  height: 324rpx;
  border-radius: 50%;
  background: url("@/static/btn1.svg") no-repeat center center;
  background-size: 100% 100%;
  border: none;
  position: relative;
  cursor: pointer;
  color: #fff;

  &.a1 {
    background: url("@/static/btn0.svg") no-repeat center center;
    background-size: 100% 100%;
  }

  &.a2 {
    background: url("@/static/btn2.svg") no-repeat center center;
    background-size: 100% 100%;
  }

  &.a3 {
    background: url("@/static/btn3.svg") no-repeat center center;
    background-size: 100% 100%;
  }

}

.circle-btn:disabled {
  opacity: 0.7;
  filter: grayscale(0.1);
  cursor: not-allowed;
}

.circle-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.btn-title {
  font-size: 40rpx;
  line-height: 56rpx;
  font-weight: 500;
}

.btn-time {
  font-size: 42rpx;
  line-height: 59rpx;
}

.tips {
  margin-top: 25rpx;
  color: #8a93a6;
  font-size: 24rpx;

  .tip-muted {
    text-align: center;
    color: #9aa3b2;
    font-family: PingFangSC, PingFang SC;
    font-weight: 400;
    font-size: 32rpx;
    color: #B8CDE4;
    line-height: 45rpx;
    font-style: normal;
  }

  .tip-list {
    height: 135rpx;
    margin-top: 46rpx;

    .tip-item {
      line-height: 45rpx;
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 32rpx;
      color: #8FABCA;
      padding-left: 42rpx;
      text-align: left;
      font-style: normal;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: 22rpx;
        width: 12rpx;
        height: 12rpx;
        border-radius: 50%;
        background: #8FABCA;
      }
    }
  }
}

.history-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
  font-family: PingFangSC, PingFang SC;
  font-weight: 600;
  font-size: 28rpx;
  color: #4F668A;
  line-height: 40rpx;
  text-align: left;
  font-style: normal;
}

.historyCard {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12rpx;
  padding: 20rpx;
  height: 182rpx;
  background: linear-gradient(180deg, #E3EFFF 0%, #F6FAFF 100%);
  border-radius: 15rpx;
  font-size: 32rpx;
  color: #4F668A;
  line-height: 45rpx;
  text-align: left;
  font-style: normal;
  font-weight: 400;
}
</style>
