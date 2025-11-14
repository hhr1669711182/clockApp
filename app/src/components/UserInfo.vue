<script setup lang="ts">
import router from '@/router'

// const toast = useGlobalToast()
const userStore = useUserStore()

const state = reactive({
  userInfo: {
    name: '',
    level: '',
    phone: '',
  },
})

onMounted(() => {
  state.userInfo = {
    name: userStore.userInfo.loginInfo?.user.wbryxm || '',
    level: userStore.userInfo.loginInfo?.user.zsdj || '',
    phone: userStore.userInfo.loginInfo?.purePhoneNumber || '',
  }
})

onUnmounted(() => { })

function onUserInfo() {
  //

  router.push({
    name: 'info',
  })
}

// function onAuth() {
//   uni.navigateTo({
//     url: '/pages/auth/index',
//   })
// }
</script>

<template>
  <div class="home">
    <div class="header mx-[68rpx] h-[232rpx] w-[100%] flex items-center justify-start gap-[20rpx]">
      <wd-img src="/static/avatar.png" :width="60" :height="60" custom-class="ml-[20rpx]" @click="onUserInfo" />
      <div class="mr-[20rpx]">
        <template v-if="userStore.token">
          <div class="title flex items-center gap-6rpx">
            <span class="font-size-52rpx">{{ state.userInfo.name }}</span>
            <span>
              <wd-tag
                round bg-color="rgba(255, 255, 255, 0.3)" color="#fff"
                class="inline-block min-w-[128rpx] text-center" size="small"
              >
                {{ state.userInfo.level }}
              </wd-tag>
            </span>
          </div>
          <div class="sub-title">
            {{ state.userInfo.phone }}
          </div>
        </template>
        <template v-else>
          <span class="font-size-52rpx">登录查看更多内容</span>
        </template>
      </div>
      <!-- <wd-icon custom-class="mt-[24rpx]" name="arrow-right" size="28" @click="onAuth" /> -->
    </div>

    <div class="content">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home {
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
    padding-top: 35rpx;
    /* #endif */
  }

  .content {
    top: 237rpx;
    position: absolute;
    box-sizing: border-box;
    min-height: calc(100% - 237rpx);
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

      min-height: 98ch;
    }
  }
}
</style>
