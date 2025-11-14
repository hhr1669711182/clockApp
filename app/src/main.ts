/*
 * @Author: huanghuanrong
 * @Date: 2025-10-31 11:18:47
 * @LastEditTime: 2025-10-31 16:35:22
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \app\src\main.ts
 */
import { createSSRApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'uno.css'
import '@/styles/index.scss'

const pinia = createPinia()
pinia.use(persistPlugin)
export function createApp() {
  const app = createSSRApp(App)
  app.use(router)
  app.use(pinia)
  return {
    app,
  }
}
