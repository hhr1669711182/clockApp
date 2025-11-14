/*
 * @Author: huanghuanrong
 * @Date: 2025-10-30 14:05:57
 * @LastEditTime: 2025-11-03 17:39:27
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \pc\src\directives\index.ts
 */
import type { App } from 'vue'
import { setupPermissionDirective } from './permission/hasPermi'

/**
 * @methods hasAuth 按钮权限，用法: v-hasAuth
 */
export const setupPermission = (app: App<Element>) => {
  setupPermissionDirective(app)
}
