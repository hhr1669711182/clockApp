<script setup lang="ts">
import { dayjs } from 'wot-design-uni'
import { onGetPhoneNumber } from '@/api/wx/wxLogin'

definePage({
  name: 'task',
})

const router = useRouter()
// const toast = useGlobalToast()

const userStore = useUserStore()
const isLogin = computed(() => !!userStore.token)

const loading = ref(false)

const stats = ref({
  pending: 0,
  processing: 0,
  done: 0,
})

type TaskStatus = '待处理' | '处理中' | '已完成'
interface TaskItem {
  id: string
  name: string
  dispatchTime: string
  units: string[]
  address: string
  status: TaskStatus
}

const pendingTasks = ref<TaskItem[]>([])

function statusClass(s: TaskStatus) {
  if (s === '待处理')
    return 'status-badge warn'
  if (s === '处理中')
    return 'status-badge process'
  if (s === '已完成')
    return 'status-badge success'
  return 'status-badge'
}

onMounted(() => {
  init()

  console.log(123, isLogin.value)
})

function init() {
  if (isLogin.value)
    getStatic()
  getData()
}

async function getStatic() {
  const { code, data }: any = await Apis.general.getTaskStatisticsUsingGET()
  if (code === '1000') {
    stats.value = {
      pending: data.pendingCount || 0,
      processing: data.processingCount || 0,
      done: data.completedCount || 0,
    }
  }
}

async function getData() {
  const { code, data }: any = await Apis.general.getMyMaintenanceTasksUsingGET({
    params: {
      current: 1,
      size: 2000,
    },
  })

  if (code === '1000' && data && data.records && data.records.length > 0) {
    pendingTasks.value = data.records.map((item: any) => ({
      id: item.rwid,
      name: item.dwmc,
      dispatchTime: dayjs(item.dxxfsj).format('YYYY-MM-DD HH:mm'),
      units: item.zddwlxList.reduce((prev: string[], cur: number) => {
        const unit = ['高层建筑', '地下建筑', '大型综合体', '大型化工单位', '住宅小区', '自建房', '重点单位', '其他'][Number(cur) - 1]
        if (unit)
          prev.push(unit)
        return prev
      }, []), // [1高层建筑，2地下建筑，3大型综合体，4大型化工单位，5住宅小区，6自建房，7重点单位，8其他]
      address: item.wbdz,
      status: ['待处理', '处理中', '已完成'][Number(item.rwclzt)], // 任务处理状态：0待处理, 1处理中, 2已完成
    }))
  }
}

function onClick(task: TaskItem) {
  // const { name, dispatchTime, units, address, status } = task
  const { id } = task
  router.push({
    path: `/pages/index/index`,
    query: {
      id,
    },
  })
}

function toLogin() {
  router.push({
    path: '/pages/login/index',
  })
}

onUnmounted(() => { })
</script>

<template>
  <UserInfo>
    <div class="panel stats-panel">
      <div class="stats-title">
        <wd-img src="/static/task/file.svg" width="20" height="20" />
        <span>待处理任务</span>
      </div>
      <div class="stats-grid">
        <div class="stat-card stat-pending">
          <div class="stat-top">
            <wd-img src="/static/task/2.svg" width="80rpx" height="80rpx" />
          </div>
          <div class="stat-num">
            {{ stats.pending }}
            <span class="font-size-24rpx">待处理</span>
          </div>
        </div>
        <div class="stat-card stat-processing">
          <div class="stat-top">
            <wd-img src="/static/task/1.svg" width="80rpx" height="80rpx" />
          </div>
          <div class="stat-num">
            {{ stats.processing }}
            <span class="font-size-24rpx">处理中</span>
          </div>
        </div>
        <div class="stat-card stat-done">
          <div class="stat-top">
            <wd-img src="/static/task/3.svg" width="80rpx" height="80rpx" />
          </div>
          <div class="stat-num">
            {{ stats.done }}
            <span class="font-size-24rpx">已完成</span>
          </div>
        </div>
      </div>

      <div v-if="isLogin" class="mt-20rpx w-full flex flex-col gap-20rpx overflow-hidden">
        <div v-for="(task, idx) in pendingTasks" :key="idx" class="taskCard" @click="onClick(task)">
          <div class="taskCard-header">
            <span class="task-name">{{ task.name }}</span>
            <span :class="statusClass(task.status)">{{ task.status }}</span>
          </div>

          <div class="taskCard-info">
            <div class="info-row">
              <wd-tag v-for="(unit, idx) in task.units" :key="idx" plain>
                {{ unit }}
              </wd-tag>
            </div>
            <div class="info-row">
              <span class="info-label">下发时间</span>
              <span class="info-value">{{ task.dispatchTime }}</span>
            </div>

            <div class="info-row">
              <span class="info-label">维保地址</span>
              <span class="info-value">{{ task.address }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="loginTip">
        <div class="flex flex-col items-center gap-10rpx">
          <div class="lb">
            当前未登陆
          </div>
          <div class="lSub">
            登录后可查看任务情况、进行维保
          </div>
        </div>
        <!-- #ifdef MP-WEIXIN -->
        <button
          class="w-300rpx color-[#FFFFFF] !bg-[#4A8CF1]" open-type="getPhoneNumber" :loading="loading"
          @getphonenumber="(e) => onGetPhoneNumber(e, toRef(loading), init)"
        >
          一键登录
        </button>
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <wd-button size="large" :round="false" custom-class="w-300rpx !bg-[#4A8CF1]" @click="toLogin">
          一键登录
        </wd-button>
        <!-- #endif -->
      </div>
    </div>
  </UserInfo>
</template>

<style lang="scss" scoped>
.panel {
  position: relative;
  background: #FFFFFF;
  border-radius: 48rpx;
  margin: 20rpx;
  border: 2rpx solid;
  z-index: 2;
  padding: 18rpx 20rpx;
}

/* 顶部统计 */
.stats-panel {
  padding-bottom: 28rpx;
}

.stats-title,
.list-title {
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

.stats-grid {
  display: flex;
  gap: 10rpx;
}

.stat-card {
  flex: 1;
  height: 120rpx;
  border-radius: 12rpx;
  padding: 0 20rpx;
  display: flex;
  justify-content: space-between;
}

.stat-top {
  display: flex;
  align-items: center;
  gap: 12rpx;
  color: #4F668A;
  font-size: 26rpx;
}

.stat-num {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8rpx;
  text-align: right;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1;
}

.stat-pending {
  background: linear-gradient(180deg, #FFE6D6 0%, #FFF2EA 100%);

  .stat-num {
    color: #FFA200;
  }
}

.stat-processing {
  background: linear-gradient(180deg, #B9DDFF 0%, #DAEDFF 100%);

  .stat-num {
    color: #4A8CF1;
  }
}

.stat-done {
  background: linear-gradient(180deg, #B5FAFF 0%, #E8FFFD 100%);

  .stat-num {
    color: #37C665;
  }
}

/* 任务卡片 */
.taskCard {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 20rpx;
  background: linear-gradient(180deg, #E3EFFF 0%, #F6FAFF 100%);
  border-radius: 15rpx;
  color: #4F668A;
  font-size: 28rpx;
}

.taskCard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.task-name {
  font-size: 32rpx;
  font-weight: 500;
}

.status-badge {
  position: absolute;
  right: -20rpx;
  top: 0;
  padding: 6rpx 16rpx;
  border-radius: 30rpx 0 0 30rpx;
  font-size: 24rpx;
  line-height: 1.6;
  // border: 2rpx solid transparent;
  opacity: 0.8;
}

.status-badge.warn {
  color: #FFA200;
  background: #FFF4E1;
  border-color: #FFD79A;
}

.status-badge.process {
  color: #4A8CF1;
  background: #eafaff;
  border-color: #BFD7FF;
}

.status-badge.success {
  color: #37C665;
  background: #EAF9F0;
  border-color: #BDEBD0;
}

.taskCard-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.info-row {
  display: flex;
  gap: 12rpx;
  font-size: 20rpx;
}

.info-label {
  font-size: 28rpx;
  color: #849CC0;
  min-width: 120rpx;
}

.info-value {
  font-size: 28rpx;
  color: #4F668A;
}

.loginTip {
  margin: 88rpx auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 80rpx;
  background: url('@/static/task/noLogin.svg') no-repeat center center;
  background-size: 100% 302rpx;
  width: 510rpx;
  height: 502rpx;

  .lb {
    margin-top: 200rpx;
    font-family: PingFangSC, PingFang SC;
    font-weight: 500;
    font-size: 32rpx;
    color: #4F668A;
    line-height: 45rpx;
  }

  .lSub {
    font-family: PingFangSC, PingFang SC;
    font-weight: 400;
    font-size: 28rpx;
    color: #4F668A;
    line-height: 40rpx;
  }
}
</style>
