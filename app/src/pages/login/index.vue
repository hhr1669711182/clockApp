<!--
 * @Author: huanghuanrong
 * @Date: 2025-10-31 15:09:00
 * @LastEditTime: 2025-11-07 14:05:45
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \app\src\pages\login\index.vue
-->
<script setup lang="ts">
import { onGetPhoneNumber } from '@/api/wx/wxLogin'

definePage({
  name: 'login',
  style: {
    navigationBarTitleText: '登录',
  },
})

const userStore = useUserStore()
const router = useRouter()
const toast = useToast()

const loginForm = ref<any>()

const form = reactive({
  userPhone: userStore.userInfo.phone,
  code: '',
})

const rules = {
  userPhone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号', trigger: 'blur', required: false },
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
  ],
}

const codeLoading = ref(false)
const loading = ref(false)
const tipsShow = ref(false)
const tipsType: any = ref('user')
const tipsText = ref({
  user: '欢迎使用维保管理系统！为保障您的合法权益，请您在注册、登录或使用本系统前，务必仔细阅读并充分理解《用户协议》（以下简称“本协议”）各条款内容，特别是免除或限制责任的条款、法律适用及争议解决条款。一旦您点击“登录”或实际使用本系统，即视为您已阅读并同意接受本协议全部约束。\n\n一、协议范围\n1.1 本协议由您与维保管理系统运营方（以下简称“本公司”）共同缔结，适用于您访问、登录、使用本系统及其相关服务的全部行为。\n1.2 本协议内容同时包括本公司已发布或未来可能发布的各类规则、声明、隐私政策、操作指引等，一经公示即为本协议不可分割的组成部分，与本协议具有同等法律效力。\n\n二、账号注册与使用\n2.1 您确认，在完成注册或实际使用本系统时，应具备中华人民共和国法律规定的与您行为相适应的民事行为能力。若您不具备前述资格，请在监护人陪同下使用，否则本公司有权随时暂停或终止服务，相关法律责任由您及您的监护人承担。\n2.2 您应保证所填写及提供的用户名、密码、手机号码、电子邮箱等信息真实、准确、完整、合法有效；如信息发生变更，及时在系统内更新。因信息不真实、不完整或未及时更新导致的任何损失或不利后果，由您自行承担。\n2.3 您应妥善保管账号及密码，并对通过该账号进行的所有活动（包括但不限于信息发布、任务处理、数据修改、费用结算等）承担全部责任。如发现任何未经授权的使用或账号安全漏洞，您应立即通知本公司；因您保管不当或未及时通知导致的损失，本公司不承担任何责任。\n2.4 您不得以任何方式转让、出租、出借、继承、赠与、共享账号，亦不得将账号用于非法目的或侵犯他人合法权益。否则本公司有权立即封禁或注销该账号，并保留追究法律责任的权利。\n\n三、服务内容与使用规范\n3.1 本系统向维保业务相关方提供设备管理、任务派发、进度跟踪、数据报表、消息通知等功能。具体服务内容以系统实时展示为准，本公司保留随时新增、变更、中断或终止部分或全部服务的权利，且无需对任何用户或第三方承担额外责任。\n3.2 您承诺在使用本系统过程中，严格遵守国家法律法规、行业规范及本协议约定，不得实施下列行为：\n  a) 发布、传输、传播含有反对宪法、危害国家安全、泄露国家秘密、颠覆国家政权、破坏国家统一、损害国家荣誉和利益的内容；\n  b) 发布、传输、传播含有煽动民族仇恨、民族歧视、破坏民族团结、破坏国家宗教政策、宣扬邪教和封建迷信的内容；\n  c) 发布、传输、传播含有淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的内容；\n  d) 发布、传输、传播含有侮辱或者诽谤他人、侵害他人知识产权、商业秘密、隐私权等合法权益的内容；\n  e) 未经授权收集、存储、披露他人个人信息或商业数据；\n  f) 对本系统进行反向工程、反向汇编、反向编译或以其他方式尝试获取系统源代码；\n  g) 通过非法手段侵入、干扰、破坏本系统正常运行，包括但不限于使用外挂、病毒、木马、爬虫、自动化脚本等；\n  h) 利用本系统从事任何可能侵犯第三方合法权益或给本公司带来不利影响的行为；\n  i) 其他违反法律法规、公序良俗或本公司合理判断认为不当的行为。\n3.3 若您违反上述承诺，本公司有权采取包括但不限于删除/屏蔽相关内容、暂停或终止服务、封禁/注销账号、保存有关记录、向主管部门报告等措施；如因此给本公司或第三方造成损失的，您应承担全部赔偿责任，包括合理的律师费、调查费、差旅费等。\n\n四、数据保护与隐私政策\n4.1 本公司重视用户个人信息与数据安全，具体保护政策详见《隐私政策》。您同意本公司有权按照《隐私政策》之约定收集、使用、存储、共享及披露您的相关信息。\n4.2 您理解并同意，因设备维修、网络故障、第三方服务瑕疵、不可抗力等因素导致的数据延迟、丢失、错误、泄露等风险，本公司在法律允许范围内免责；但本公司将尽合理努力保障数据安全与业务连续性。\n\n五、知识产权声明\n5.1 本系统所包含的全部技术、程序、页面、文字、图片、音频、视频、图表、界面设计、版面安排、商标、标识、数据等知识产权（包括但不限于著作权、专利权、商标权、商业秘密等）均归本公司或相关权利人所有，受中华人民共和国及相关国际条约保护。\n5.2 未经本公司书面许可，任何单位或个人不得以任何形式复制、传播、改编、下载或以其他方式使用上述知识产权。对于未经授权的使用，本公司有权追究法律责任并索赔全部损失。\n\n六、费用与结算\n6.1 本系统当前向用户提供免费基础服务，但保留未来对特定功能或服务收取费用的权利。具体收费标准、方式、规则将提前以公告、站内信、弹窗等形式通知，您有权选择是否继续使用；若您继续使用，则视为接受收费政策。\n6.2 如因您使用第三方服务产生费用（如通信运营商流量费、短信费等），由您自行与第三方结算，本公司不承担任何额外费用。\n\n七、责任限制与免责条款\n7.1 您理解并同意，本系统服务按“现状”和“可得到”基础提供，本公司对服务之及时性、安全性、准确性、完整性、适用性、可靠性不作任何明示或默示担保。对于因下列原因导致的任何直接、间接、偶然、特殊、后续或衍生损失（包括但不限于利润损失、商业中断、数据丢失、业务信息泄露等），本公司不承担任何责任：\n  a) 系统停机维护或升级；\n  b) 台风、地震、洪水、火灾、战争、政府行为、司法行政命令等不可抗力事件；\n  c) 第三方原因（包括但不限于通信线路故障、网络或设备故障、计算机病毒、黑客攻击、第三方服务瑕疵等）；\n  d) 您操作不当、未按照本公司指引使用服务或账号信息保管不当；\n  e) 其他非因本公司过错或无法控制的情形。\n7.2 在任何情况下，本公司对您承担的赔偿责任上限不超过您因使用本系统而实际向本公司支付的费用总额（如有）。若您未支付任何费用，则本公司对您不承担任何金钱赔偿责任。\n\n八、协议终止\n8.1 您有权随时停止使用本系统，并通过系统内“联系客服”或拨打客服电话申请注销账号；经本公司审核通过后，将在15个工作日内完成注销，但法律法规另有规定或双方另有约定的除外。\n8.2 如您违反本协议约定，本公司有权无需事先通知即可立即终止本协议、暂停或终止向您提供服务、封禁/注销账号，并保留追究法律责任的权利。\n8.3 本协议终止后，您无权要求本公司继续提供服务，亦无权要求本公司返还任何数据或信息，但本协议中有关知识产权、保密、违约责任、争议解决、法律适用等条款在终止后仍然有效。\n\n九、法律适用与争议解决\n9.1 本协议之订立、生效、履行、解释、争议解决均适用中华人民共和国大陆地区法律（不含冲突规范）。\n9.2 因本协议引起的或与本协议有关的任何争议，双方应首先友好协商解决；协商不成的，任何一方均可向本公司所在地有管辖权的人民法院提起诉讼。\n\n十、通知与送达\n10.1 本公司可通过系统公告、站内信、弹窗、电子邮件、短信、电话、即时通讯工具等一种或多种方式向您发送通知，该等通知一经发送即视为送达。\n10.2 您确认，您提供的联系方式（包括手机号码、电子邮箱、通讯地址等）真实有效，如发生变更及时更新；因您未及时更新导致未能收到通知的，视为已送达，由此产生的不利后果由您自行承担。\n\n十一、其他条款\n11.1 本协议标题仅为阅读方便而设，不影响本协议任何条款的含义或解释。\n11.2 本协议任一条款被认定无效或不可执行，不影响其他条款之效力，双方应尽最大努力将该无效条款替换为合法有效且最能实现原条款目的的新条款。\n11.3 本协议最终解释权归本公司所有。如您对本协议有任何疑问、意见或建议，欢迎通过系统内“联系客服”或拨打客服电话与我们联系。\n\n再次感谢您的信任与支持，祝您使用愉快！',
  privacy: '我们非常重视您的隐私保护。本隐私政策旨在说明我们如何收集、使用、存储和保护您的个人信息。\n\n1. 信息收集：\n- 登录时仅收集必要的用户名与密码，用于身份验证。\n- 不会主动收集与维保业务无关的个人信息。\n\n2. 信息使用：\n- 仅用于系统登录验证、权限管理及维保任务分派。\n- 未经您同意，不会向任何第三方共享、转让或公开披露您的个人信息。\n\n3. 信息存储：\n- 数据存储于公司自有服务器，采用加密与访问控制措施。\n- 保存期限为实现上述目的所必需的最短时间，到期后安全删除或匿名化处理。\n\n4. 信息安全：\n- 采取符合业界标准的安全防护措施，防止数据遭到未经授权的访问、泄露、使用、修改、损坏或丢失。\n- 定期进行安全风险评估与应急演练。\n\n5. 您的权利：\n- 有权访问、更正、删除您的个人信息，或注销账户。\n- 可通过系统内“联系客服”或拨打客服电话提交请求，我们将在15个工作日内回复。\n\n6. 政策更新：\n- 随着业务发展与法律法规变化，本政策可能适时更新，更新后的条款将于公布时即时生效并替代原条款。\n\n如您对本政策有任何疑问、意见或投诉，请通过系统内“联系客服”与我们取得联系。',
}) as any

onMounted(() => {
  const loginInfo = storage.getSync('loginInfo') ?? {}
  if (loginInfo.userPhone)
    form.userPhone = loginInfo.userPhone
})

async function onLogin() {
  await loginForm.value?.validate().then(async ({ valid }: any) => {
    if (!valid)
      return
    loading.value = true

    return router.push({ name: 'task' })

    try {
      // #ifdef MP-WEIXIN
      // 微信小程序登录流程
      const wxLoginRes = await uni.login({ provider: 'weixin' })
      if (wxLoginRes.errMsg !== 'login:ok')
        throw new Error('微信登录失败')

      const code = wxLoginRes.code
      const res: any = await uni.request({
        url: '/login/wxMiniProgramLogin',
        method: 'POST',
        data: { wxCode: code, phone: form.userPhone, smsCode: form.code },
      })

      if (res.code !== 200)
        throw new Error(res.message || '登录失败')

      userStore.setToken(res.data.token)
      userStore.setUserInfo(res.data.userInfo)
      storage.setSync('loginInfo', { userPhone: form.userPhone })
      toast.success('登录成功')
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push({ name: 'task' })
      // #endif

      // #ifndef MP-WEIXIN
      toast.success('登录成功')
      storage.setSync('loginInfo', form)
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push({ name: 'task' })
      // #endif
    }
    catch (error: any) {
      toast.error(error.message || '登录失败')
    }
    finally {
      loading.value = false
    }
  })
}

async function getCode() {
  if (!form.userPhone || !/^1[3-9]\d{9}$/.test(form.userPhone)) {
    return toast.error('请输入正确的手机号')
  }
  codeLoading.value = true
  // #ifdef MP-WEIXIN
  wx.requestSubscribeMessage({
    tmplIds: ['请填写您在微信公众平台申请的验证码模板ID'],
    success: async (res) => {
      console.log('🚀 ~ file: index.vue:103 ~ res:', res)
      if (res['请填写您在微信公众平台申请的验证码模板ID'] === 'accept') {
        try {
          const smsRes: any = await uni.request({
            url: '/login/getCode',
            method: 'POST',
            data: { userPhone: form.userPhone },
          })
          if (smsRes.code === 200) {
            toast.success('验证码发送成功')
          }
          else {
            throw new Error(smsRes.message || '发送失败')
          }
        }
        catch (err: any) {
          toast.error(err.message || '发送失败')
        }
        finally {
          codeLoading.value = false
        }
      }
      else {
        toast.error('请允许接收验证码消息')
        codeLoading.value = false
      }
    },
    fail: () => {
      toast.error('订阅消息失败')
      codeLoading.value = false
    },
  })
  // #endif

  // #ifndef MP-WEIXIN
  try {
    const smsRes: any = await uni.request({
      url: '/login/getCode',
      method: 'POST',
      data: { userPhone: form.userPhone },
    })
    if (smsRes.code === 200) {
      toast.success('验证码发送成功')
    }
    else {
      throw new Error(smsRes.message || '发送失败')
    }
  }
  catch (err: any) {
    toast.error(err.message || '发送失败')
  }
  finally {
    codeLoading.value = false
  }
  // #endif
}

function onShowTips(type: 'user' | 'privacy') {
  tipsType.value = type
  tipsShow.value = true
}

function onClose() {
  tipsShow.value = false
}
</script>

<template>
  <div class="login-container">
    <div class="login-title-box">
      <div class="login-title">
        {{ '维保管理系统' }}
      </div>
      <div class="login-subTitle">
        {{ '专业的设备维保管理平台' }}
      </div>
    </div>
    <div class="login-bg">
      <wd-img src="/static/login/bgRen.svg" height="303rpx" width="233rpx" />
    </div>
    <div class="login-form">
      <div class="form-title">
        欢迎登录
      </div>
      <!-- <div class="form-code" @click="handleConcat">
        忘记密码
      </div> -->
      <div class="ml-[5%] mr-[5%] h-[60%] w-[90%]">
        <wd-form ref="loginForm" :model="form" :rules="rules">
          <wd-form-item prop="userPhone" class="error-top-right">
            <view class="text-left font-size-[32rpx] c-[#4979FF]">
              手机号
            </view>
            <wd-input
              v-model="form.userPhone" placeholder="请输入手机号" prefix-icon="user-circle" clearable
              :no-border="true" size="large" class="border-[2rpx] border-[#4979FF]"
            />
          </wd-form-item>

          <wd-form-item prop="code" class="error-top-right">
            <view class="text-left c-[#8592B6]">
              验证码
            </view>
            <view class="flex items-center gap-[20rpx]">
              <wd-input
                v-model="form.code" size="large" :no-border="true" placeholder="请输入验证码" prefix-icon="lock-on"
                clearable @keyup.enter="onLogin"
              />
              <wd-button size="large" custom-class="login-btn w-[60%]" :loading="codeLoading" @click="getCode">
                {{ codeLoading ? '' : '获取验证码' }}
              </wd-button>
            </view>
          </wd-form-item>
          <wd-form-item prop="btn">
            <div class="form-agreement start flex gap-[10rpx]">
              <span class="c-[#8592B6]">登录即表示同意</span>
              <navigator class="c-[#4979FF]" @click="onShowTips('user')">
                《用户协议》
              </navigator>和
              <navigator class="c-[#4979FF]" @click="onShowTips('privacy')">
                《隐私政策》
              </navigator>
            </div>
            <!-- #ifdef MP-WEIXIN -->
            <wd-button size="large" :loading="loading" custom-class="login-btn mt-[20rpx] w-[100%] " @click="onLogin">
              登录
            </wd-button>
            <button
              class="h-[68rpx] w-[99%] c-[#4979FF] line-height-[68rpx]" open-type="getPhoneNumber" :loading="loading"
              @getphonenumber="(e) => onGetPhoneNumber(e, toRef(loading))"
            >
              一键登录
            </button>

            <!-- #endif -->
            <!-- #ifndef MP-WEIXIN -->
            <wd-button size="large" :loading="loading" custom-class="login-btn mt-[30rpx] w-[100%]" @click="onLogin">
              登录
            </wd-button>
            <!-- #endif -->
          </wd-form-item>
        </wd-form>
      </div>
    </div>
    <div class="login-version position-absolute bottom-[24rpx] font-size-[24rpx] c-[#ACD0FF]">
      V 1.2.0.0
    </div>
  </div>

  <wd-popup
    v-model="tipsShow" position="bottom" :safe-area-inset-bottom="true"
    custom-style="height: 60%; padding: 60rpx;" @close="onClose"
  >
    <text class="color-[#4F668A]">
      {{ tipsText[tipsType] }}
    </text>
  </wd-popup>
</template>

<style lang="scss" scoped>
:deep(.wd-input) {
  border-radius: 16rpx;
  background-color: #F7F9FC !important;
  transition: border-color 0.2s;
}

:deep(.wd-input:focus-within) {
  border: 1rpx solid;
  border-color: #4979FF;
}

.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(180deg, #59ABFF 0%, #2D64FF 100%);
  position: relative;
}

.login-title-box {
  position: absolute;
  top: 143rpx;
  left: 69rpx;

  .login-title {
    font-size: 52rpx;
    font-weight: 600;
    color: #fff;
    margin-bottom: 10rpx;
  }

  .login-subTitle {
    font-size: 32rpx;
    color: #fff;
  }

}

.login-bg {
  position: absolute;
  top: 134rpx;
  right: 69rpx;
  z-index: 1;

  &::after {
    content: '';
    position: absolute;
    bottom: -4rpx;
    left: -4rpx;
    width: 259rpx;
    height: 80rpx;
    background: linear-gradient(180deg, rgba(134, 188, 255, 0.54) 0%, #55A2FF 100%);
    box-shadow: 0rpx 14rpx 18rpx 0rpx rgba(16, 28, 61, 0.06);
    border-radius: 0rpx 32rpx 0rpx 0rpx;
    border: 1rpx solid #ffffff34;
    backdrop-filter: blur(2rpx);
  }
}

.login-form {
  z-index: 2;
  width: 100%;
  height: 890rpx;
  margin-top: 232rpx;
  background: url('/static/login/bg.svg') no-repeat center center;
  background-size: 100% 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  .form-title {
    position: absolute;
    top: 53rpx;
    left: 69rpx;
    width: 208rpx;
    height: 73rpx;
    font-family: PingFangSC, PingFang SC;
    font-weight: 500;
    font-size: 52rpx;
    color: #4F668A;
    line-height: 73rpx;
    text-align: left;
    font-style: normal;
  }

  .form-code {
    position: absolute;
    top: 43rpx;
    right: 85rpx;

    width: 128rpx;
    height: 45rpx;
    font-family: PingFangSC, PingFang SC;
    font-weight: 500;
    font-size: 32rpx;
    color: #FFFFFF;
    line-height: 45rpx;
    text-align: right;
    font-style: normal;
  }
}

.error-top-right {
  position: relative;

  :deep(.wd-form-item__error-message),
  :deep(.wd-form-item__message),
  :deep(.wd-form-item__error) {
    position: absolute;
    right: 0;
    top: 0;
    font-size: 24rpx;
    line-height: 1;
    color: #ff4d4f;
    background: transparent;
    padding: 0;
    transform: translateY(50%);
    white-space: nowrap;
  }

  :deep(.wd-form-item__content) {
    padding-bottom: 0;
  }
}

.login-btn {
  height: 94rpx;
  background: linear-gradient(180deg, #2D64FF 0%, #468DFF 100%) !important;
  border-radius: 12rpx !important;
}
</style>
