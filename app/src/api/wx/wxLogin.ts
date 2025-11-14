/*
 * @Author: huanghuanrong
 * @Date: 2025-11-07 11:24:39
 * @LastEditTime: 2025-11-14 15:09:31
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \app\src\api\wx\wxLogin.ts
 */
import { useUserStore } from '@/store/userStore'

export async function onGetPhoneNumber(e: any, loading: Ref<boolean>, cb?: () => void) {
  if (!e?.detail)
    return
  const { errMsg, encryptedData, iv } = e.detail
  if (errMsg !== 'getPhoneNumber:ok') {
    uni.showToast({ title: '用户未授权手机号', icon: 'none' })
    return
  }

  try {
    loading.value = true
    const loginRes = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({ success: resolve, fail: reject })
    })
    const loginCode = loginRes.code

    const res: any = await Apis.general.decodeUserUsingPOST({
      data: {
        code: loginCode,
        encryptedData,
        iv,
      },
    })

    if (res.code === '1000' && res.data?.token) {
      useUserStore().setUserInfo({ loginInfo: res.data })
      useUserStore().setToken(res.data.token)
      storage.setSync('Token', res.data.token)
      storage.setSync('UserInfo', res.data)
      if (cb)
        cb()
      // uni.switchTab({ url: '/pages/task/index' })
      // 仅在task使用 不跳转
    }
    else {
      throw new Error(res.msg || (res.message || '登录失败'))
    }
  }
  catch (err: any) {
    console.error('phoneLogin error:', err)
    uni.showToast({ title: err?.message || '登录失败，请重试', icon: 'none' })
  }
  finally {
    loading.value = false
  }
}
