/*
 * @Author: huanghuanrong
 * @Date: 2025-10-30 14:05:57
 * @LastEditTime: 2025-11-03 17:39:55
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \pc\src\directives\permission\hasPermi.ts
 */
import type { App, Directive, DirectiveBinding } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import router from '@/router'

const { t } = useI18n()

const hasPermission = (value: string): boolean => {
  const permission = (router.currentRoute.value.meta.permission || []) as string[]
  if (!value) {
    throw new Error(t('permission.hasPermission'))
  }
  if (permission.includes(value)) {
    return true
  }
  return false
}
function hasPermi(el: Element, binding: DirectiveBinding) {
  const value = binding.value

  const flag = hasPermission(value)
  if (!flag) {
    el.parentNode?.removeChild(el)
  }
}
const mounted = (el: Element, binding: DirectiveBinding<any>) => {
  hasPermi(el, binding)
}

const permiDirective: Directive = {
  mounted
}

export const setupPermissionDirective = (app: App<Element>) => {
  app.directive('hasAuth', permiDirective)
}

export default permiDirective
