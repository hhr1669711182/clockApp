/*
 * @Author: huanghuanrong
 * @Date: 2025-10-31 11:18:47
 * @LastEditTime: 2025-11-10 19:37:32
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \app\src\router\index.ts
 */
/// <reference types="@uni-helper/vite-plugin-uni-pages/client" />
import { pages, subPackages } from 'virtual:uni-pages'

function generateRoutes() {
  const routes = pages.map((page) => {
    const newPath = `/${page.path}`
    return { ...page, path: newPath }
  })
  if (subPackages && subPackages.length > 0) {
    subPackages.forEach((subPackage) => {
      const subRoutes = subPackage.pages.map((page: any) => {
        const newPath = `/${subPackage.root}/${page.path}`
        return { ...page, path: newPath }
      })
      routes.push(...subRoutes)
    })
  }
  return routes
}

const router = createRouter({
  routes: generateRoutes(),
})

router.beforeEach((to, from, next) => {
  if (to.name !== 'login' && !useUserStore().token) {
    return next({ name: 'task' })
  }
  if (to.path && from.path) {
    console.log(`📍 导航: ${from.path} → ${to.path}`)
  }
  next()
})

// eslint-disable-next-line unused-imports/no-unused-vars
router.afterEach((to, from) => {})

export default router
