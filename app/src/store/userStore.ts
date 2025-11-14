/*
 * @Author: huanghuanrong
 * @Date: 2025-10-31 15:58:48
 * @LastEditTime: 2025-11-14 13:49:21
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \app\src\store\userStore.ts
 */
export const useUserStore = defineStore('user', () => {
  // 用户基本信息
  const userInfo = ref({
    id: '',
    name: '',
    phone: '',
    avatar: '',
    roles: [] as string[],
    permissions: [] as string[],
    loginInfo: {},
  }) as any

  // 登录状态
  const isLogin = ref(false)
  // 登录 token
  const token = ref('')

  const isAdmin = computed(() => userInfo.value.roles.includes('admin'))

  onMounted(() => {
    token.value = storage.getSync('Token') || ''
    userInfo.loginInfo = storage.getSync('UserInfo')
  })

  // 设置用户信息
  function setUserInfo(info: Partial<typeof userInfo.value>) {
    userInfo.value = { ...userInfo.value, ...info }
  }

  // 设置登录状态
  function setLoginStatus(status: boolean) {
    isLogin.value = status
  }

  // 设置 token
  function setToken(newToken: string) {
    token.value = newToken
  }

  function removeToken() {
    token.value = ''
    storage.removeSync('Token')
    clearUser()
  }

  function clearUser() {
    userInfo.value = {}
    isLogin.value = false
    token.value = ''
  }

  return {
    // ...toRefs(userInfo),
    userInfo,
    isLogin,
    token,
    isAdmin,
    setUserInfo,
    setLoginStatus,
    setToken,
    removeToken,
    clearUser,
  }
})
