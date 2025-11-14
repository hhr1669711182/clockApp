/*
 * @Author: huanghuanrong
 * @Date: 2025-10-30 14:05:57
 * @LastEditTime: 2025-10-30 17:32:01
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \pc\src\hooks\web\usePageLoading.ts
 */
import { useAppStoreWithOut } from '@/store/modules/app'

export const usePageLoading = () => {
  const loadStart = () => {
    const appStore = useAppStoreWithOut()

    appStore.setPageLoading(true)
  }

  const loadDone = () => {
    const appStore = useAppStoreWithOut()
    appStore.setPageLoading(false)
  }

  return {
    loadStart,
    loadDone
  }
}
