<script setup lang="ts">
import { dayjs } from 'wot-design-uni'
import { onGetPhoneNumber } from '@/api/wx/wxLogin'

definePage({
  name: 'info',
})

const router = useRouter()
const userStore = useUserStore()

const state = reactive({
  userInfo: {
    name: '张伟保',
    level: '',
    phone: '13800000000',
  },
  stats: {
    monthUndone: 0,
    monthDone: 0,
    yearDone: 0,
    yearHours: 0,
    monthHours: 0,
  },

})

onMounted(() => {
  state.userInfo = {
    name: userStore.userInfo.loginInfo?.user.wbryxm || '',
    level: userStore.userInfo.loginInfo?.user.zsdj || '',
    phone: userStore.userInfo.loginInfo?.purePhoneNumber || '',
  }
})

const isLogin = computed(() => !!userStore.token)

onMounted(() => {
  init()
})

function init() {
  if (isLogin.value)
    getStatic()
}

async function getStatic() {
  const { code, data }: any = await Apis.general.getStatisticsUsingGET()
  if (code === '1000') {
    state.stats = {
      monthUndone: data.monthUncompletedCount || 0,
      monthDone: data.monthCompletedCount || 0,
      yearDone: data.yearCompletedCount || 0,
      yearHours: data.yearClockHours || 0,
      monthHours: data.monthClockHours || 0,
    }
  }
}

function logout() {
  userStore.removeToken()
  nextTick(() => {
    router.push({
      path: '/pages/task/index',
    })
  })
}
</script>

<template>
  <div class="home">
    <div class="header mx-[68rpx] h-[397rpx] p-[30rpx]">
      <div class="h-[80rpx] pl-[20rpx] bg-transparent! c-[#fff]!" @click="router.back()">
        <wd-icon name="arrow-left" size="28" />
      </div>
      <div class="flex items-center justify-around">
        <wd-img src="/static/avatar.png" :width="60" :height="60" />
        <div class="flex flex-col items-center">
          <span class="font-size-52rpx">{{ state.stats.monthUndone }}</span>
          <span class="font-size-28rpx">本月未完成</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="font-size-52rpx">{{ state.stats.monthDone }}</span>
          <span class="font-size-28rpx">本月已完成</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="font-size-52rpx">{{ state.stats.yearDone }}</span>
          <span class="font-size-28rpx">本年完成</span>
        </div>
      </div>
      <div class="flex items-center justify-between p-[30rpx]">
        <div>
          <div class="title flex items-center gap-6rpx">
            <span class="font-size-52rpx">{{ state.userInfo.name }}</span>
          </div>
          <div class="sub-title">
            {{ state.userInfo.phone }}
          </div>
        </div>
        <wd-button
          icon="edit" plain hairline type="info" :round="false" :border="false"
          custom-class="w-[170rpx] h-[80rpx] font-size-32rpx color-[#FFFFFF]! bg-[#fff]! bg-opacity-20!"
        >
          编辑资料
        </wd-button>
      </div>
    </div>

    <div class="content">
      <div class="panel stats-panel">
        <div class="stats-grid">
          <div class="stat-card stat-processing">
            <div class="stat-num">
              <span class="font-size-32rpx">本月打卡时长</span>
              <div>
                <span class="font-size-70rpx">{{ state.stats.monthHours }}</span> 小时
              </div>
            </div>
          </div>
          <div class="stat-card stat-done">
            <div class="stat-num">
              <span class="font-size-32rpx">本年打卡时长</span>
              <div>
                <span class="font-size-70rpx">{{ state.stats.yearHours }}</span> 小时
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel">
        <wd-cell-group>
          <wd-cell custom-class="c-[#4F668A]! !font-size-32rpx" title="用户服务协议" is-link to="*" />
          <wd-cell custom-class="c-[#4F668A]! !font-size-32rpx" title="关于我们们" is-link to="*" />
        </wd-cell-group>
      </div>

      <div class="panel grid place-items-center">
        <wd-button type="text" custom-class="c-[#D36344]" @click="logout">
          退出登录
        </wd-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
  color: #fff;

  .header {
    width: 100%;
    position: absolute;
    top: 0;
    background: linear-gradient(190deg, #497AFF 0%, #49ABFF 100%);

    /* #ifdef MP-WEIXIN */
    padding-top: 55rpx;
    /* #endif */
  }

  .content {
    top: 417rpx;
    position: absolute;
    box-sizing: border-box;
    min-height: calc(100% - 417rpx);
    height: auto;
    width: 100%;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 247rpx;
      border: 1rpx solid #ffffff;
      box-sizing: border-box;
      border-bottom: none;
      border-radius: 48rpx 48rpx 0rpx 0rpx;
      background: linear-gradient(180deg, #74AEFF 0%, #D0E5FF 100%);
      backdrop-filter: blur(5px);
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: calc(100% - 247rpx);
      background: linear-gradient(180deg, #D0E5FF 0%, #F8FBFF 100%), #ECF0F5;
      z-index: 0;
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

.stats-panel {
  padding-bottom: 28rpx;
  background: transparent !important;
  border: none !important;
  margin: 0 !important;
}

.stats-grid {
  display: flex;
  gap: 10rpx;
}

.stat-card {
  flex: 1;
  height: 200rpx;
  border-radius: 26rpx;
  padding: 0 20rpx;
  display: flex;
  justify-content: space-between;
}

.stat-num {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8rpx;
  row-gap: 10rpx;
  text-align: left;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1;
  color: #fff;
  z-index: 1;
}

.stat-processing {
  background: linear-gradient(143deg, #76AEFF 0%, #5897FF 100%);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 258rpx;
    height: 165rpx;
    background: url('@/static/info_year.svg') no-repeat center center;
    background-size: 100% 100%;
    z-index: 0;
  }
}

.stat-done {
  background: linear-gradient(180deg, #40E8DF 0%, #00D3DA 100%);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 258rpx;
    height: 165rpx;
    background: url('@/static/info_month.svg') no-repeat center center;
    background-size: 100% 100%;
    z-index: 0;
  }
}
</style>
