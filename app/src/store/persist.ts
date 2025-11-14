/*
 * @Author: huanghuanrong
 * @Date: 2025-10-31 11:18:47
 * @LastEditTime: 2025-11-14 14:52:23
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \app\src\store\persist.ts
 */
import type { PiniaPluginContext } from 'pinia'

/**
 * 持久化
 * @param context pinia
 * @param excludedIds 排除列表，默认排除temp
 */
function persist({ store }: PiniaPluginContext, excludedIds: string[]) {
  const isExcluded = excludedIds.includes(store.$id)
  if (isExcluded)
    return

  // 暂存State
  let persistState = CommonUtil.deepClone(store.$state)
  const storageState = uni.getStorageSync(store.$id)
  if (storageState) {
    persistState = storageState
  }
  store.$state = persistState
  store.$subscribe(() => {
    // 在存储变化的时候将store缓存
    uni.setStorageSync(store.$id, CommonUtil.deepClone(store.$state))
  })
}

export function persistPlugin(context: PiniaPluginContext) {
  persist(context, ['temp'])
}
