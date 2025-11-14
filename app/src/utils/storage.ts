/*
 * @Author: huanghuanrong
 * @Date: 2025-11-05 15:22:44
 * @LastEditTime: 2025-11-05 16:49:06
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \app\src\utils\storage.ts
 */
interface AsyncStorage { getItem: (k: string) => Promise<string | null>, setItem: (k: string, v: string) => Promise<void>, removeItem: (k: string) => Promise<void>, clear: () => Promise<void> }
interface SyncStorage { getItem: (k: string) => string | null, setItem: (k: string, v: string) => void, removeItem: (k: string) => void, clear: () => void }

const isUni = typeof uni !== 'undefined'
const isWeb = typeof window !== 'undefined'
const isNode = typeof globalThis !== 'undefined'

const isSession = false
const driver = (type: 'sync' | 'async' = 'async'): AsyncStorage | SyncStorage => {
  if (isUni) {
    if (type === 'sync') {
      return {
        getItem: (k: string) => {
          try {
            const v = uni.getStorageSync(k)
            return v ?? null
          }
          catch {
            return null
          }
        },
        setItem: (k: string, v: string) => {
          try {
            uni.setStorageSync(k, v)
          }
          catch {}
        },
        removeItem: (k: string) => {
          try {
            uni.removeStorageSync(k)
          }
          catch {}
        },
        clear: () => {
          try {
            uni.clearStorageSync()
          }
          catch {}
        },
      } as SyncStorage
    }
    return {
      getItem: async (k: string) => {
        try {
          const res = await uni.getStorage({ key: k })
          return res.data ?? null
        }
        catch {
          return null
        }
      },
      setItem: async (k: string, v: string) => {
        await uni.setStorage({ key: k, data: v })
      },
      removeItem: async (k: string) => {
        await uni.removeStorage({ key: k })
      },
      clear: async () => {
        await uni.clearStorage()
      },
    } as AsyncStorage
  }
  else if (isWeb) {
    return isSession ? window.sessionStorage : window.localStorage
  }
  else if (isNode) {
    const store: Record<string, string> = {}
    return {
      getItem: k => store[k] ?? null,
      setItem: (k, v) => (store[k] = v),
      removeItem: k => delete store[k],
      clear: () => Object.keys(store).forEach(k => delete store[k]),
    }
  }
  throw new Error('unsupported')
}

const enc = (v: any) => (typeof v === 'string' ? v : JSON.stringify(v))
const dec = (v: string | null) => {
  if (v === null)
    return null
  try {
    return JSON.parse(v)
  }
  catch {
    return v
  }
}
export const storage = {
  get: async (k: string) => dec(await (driver('async') as AsyncStorage).getItem(k)),
  set: (k: string, v: any) => (driver('async') as AsyncStorage).setItem(k, enc(v)),
  remove: (k: string) => (driver('async') as AsyncStorage).removeItem(k),
  clear: () => (driver('async') as AsyncStorage).clear(),
  getSync: (k: string) => dec((driver('sync') as SyncStorage).getItem(k)),
  setSync: (k: string, v: any) => (driver('sync') as SyncStorage).setItem(k, enc(v)),
  removeSync: (k: string) => (driver('sync') as SyncStorage).removeItem(k),
  clearSync: () => (driver('sync') as SyncStorage).clear(),
}

// DB
const persistDriver: AsyncStorage | SyncStorage = (() => {
  if (isUni && typeof plus !== 'undefined' && plus.storage) {
    return {
      getItem: async (k: string) => plus.storage.getItem(k) ?? null,
      setItem: async (k: string, v: string) => plus.storage.setItem(k, v),
      removeItem: async (k: string) => plus.storage.removeItem(k),
      clear: async () => plus.storage.clear(),
    }
  }
  return driver('sync')
})()

export const persistStorage = {
  get: async (k: string) => dec(await (persistDriver as AsyncStorage).getItem(k)),
  set: (k: string, v: any) => persistDriver.setItem(k, enc(v)),
  remove: (k: string) => persistDriver.removeItem(k),
  clear: () => persistDriver.clear(),
  // getSync: (k: string) => dec((persistDriver as SyncStorage).getItem(k)),
  // setSync: (k: string, v: any) => (persistDriver as SyncStorage).setItem(k, enc(v)),
  // removeSync: (k: string) => (persistDriver as SyncStorage).removeItem(k),
  // clearSync: () => (persistDriver as SyncStorage).clear(),
}
