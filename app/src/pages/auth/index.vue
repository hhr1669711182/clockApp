<script setup lang="ts">
definePage({ name: 'auth' })

const router = useRouter()
const percent = ref(75)
const actionText = '眨眼睛'

const size = 240
const stroke = 10
const radius = (size - stroke) / 2
const circumference = 2 * Math.PI * radius
const dashOffset = computed(() => circumference * (1 - percent.value / 100))
</script>

<template>
  <wd-navbar
    :bordered="false" left-arrow title="身份验证" custom-class="auth-navbar c-[#48668D]!"
    custom-style="color: #48668D; background-color: transparent !important; border-bottom: 0rpx"
    @click-left="router.back()"
  />
  <div class="auth">
    <div class="desc">
      请正对摄像头<br>
      <span class="font-size-[28rpx]">确保「张维保」本人操作</span>
    </div>

    <div class="rings">
      <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
        <circle :cx="size / 2" :cy="size / 2" :r="radius" :stroke-width="stroke" stroke="#E6EEFA" fill="none" />
        <circle
          :cx="size / 2" :cy="size / 2" :r="radius" :stroke-width="stroke" stroke="#5E7CFF" fill="none"
          stroke-linecap="round" :stroke-dasharray="circumference" :stroke-dashoffset="dashOffset"
          :transform="`rotate(-90 ${size / 2} ${size / 2})`"
        />
      </svg>
      <div class="ring-text">
        {{ actionText }}
      </div>
    </div>

    <div class="tips">
      <div class="tip">
        <wd-img custom-class="img" src="@/static/auth/left.png" alt="面部在框内">
          <span>保持面部在框内</span>
        </wd-img>
      </div>
      <div class="tip">
        <wd-img custom-class="img" src="@/static/auth/center.png" alt="光线充足">
          <span>保证光线充足</span>
        </wd-img>
      </div>
      <div class="tip">
        <wd-img custom-class="img" src="@/static/auth/right.png" alt="摘下口罩帽子">
          <span>摘下口罩墨镜帽子</span>
        </wd-img>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth {
  padding: 32rpx;
  text-align: center;
  color: #1f2f50;
}

.title {
  font-size: 34rpx;
  font-weight: 600;
}

.desc {
  margin-top: 16rpx;
  font-size: 32rpx;
  color: #4F668A;
  line-height: 1.6;
}

.rings {
  margin: 36rpx auto 24rpx;
  width: 240px;
  height: 240px;
  position: relative;
}

.ring-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #fff;
  pointer-events: none;
}

.tips {
  margin-top: 102rpx;
  display: flex;
  gap: 16rpx;
  justify-content: center;
}

.tip {
  width: 32%;
  min-width: 160rpx;
  padding: 16rpx 0;
  border: 1rpx dashed #e6eefa;
  border-radius: 16rpx;
  background: #f7faff;

  .img {
    width: 132rpx;
    height: 132rpx;
  }
}

.tip img {
  width: 100rpx;
  height: 100rpx;
}

.tip span {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #6b7a90;

  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 24rpx;
  color: #48668D;
  line-height: 33rpx;
}
</style>
