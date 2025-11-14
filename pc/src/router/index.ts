/*
 * @Author: huanghuanrong
 * @Date: 2025-10-30 14:05:57
 * @LastEditTime: 2025-11-12 16:45:00
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \pc\src\router\index.ts
 */
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'
import { Layout, getParentLayout } from '@/utils/routerHelper'
import { useI18n } from '@/hooks/web/useI18n'
import { NO_RESET_WHITE_LIST } from '@/constants'

const { t } = useI18n()

export const constantRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/attachment/index',
    name: 'home',
    meta: {
      hidden: true
    }
  },
  {
    path: '/redirect',
    component: Layout,
    name: 'RedirectWrap',
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'Redirect',
        component: () => import('@/views/Error/404.vue'),
        meta: {}
      }
    ],
    meta: {
      hidden: true,
      noTagsView: true
    }
  },
  // {
  //   path: '/login',
  //   component: () => import('@/views/Login/Login.vue'),
  //   name: 'Login',
  //   meta: {
  //     hidden: true,
  //     title: t('router.login'),
  //     noTagsView: true
  //   }
  // },
  {
    path: '/404',
    component: () => import('@/views/Error/404.vue'),
    name: 'NoFind',
    meta: {
      hidden: true,
      title: '404',
      noTagsView: true
    }
  }
]

export const asyncRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/attachment',
    component: Layout,
    name: 'attachment',
    redirect: '/attachment/index',
    meta: {
      title: '维保附件',
      alwaysShow: false
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/attachment/index.vue'),
        name: 'attachmentIndex',
        meta: {
          title: '维保附件',
          icon: 'vi-ant-design-book-outlined',
          noCache: true
        }
      }
    ]
  },
  {
    path: '/fence',
    component: Layout,
    name: 'fence',
    meta: {
      title: '电子围栏',
      alwaysShow: false
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/fence/index.vue'),
        name: 'fenceIndex',
        meta: {
          title: '电子围栏',
          icon: 'vi-ant-design:gateway-outlined',
          noCache: true
        }
      }
    ]
  },
  // {
  //   path: '/maintainFence',
  //   component: Layout,
  //   name: 'maintainFence',
  //   meta: {
  //     title: '维护电子围栏',
  //     alwaysShow: true
  //   },
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/maintainFence/index.vue'),
  //       name: 'maintainFenceIndex',
  //       meta: {
  //         title: '维护电子围栏',
  //         icon: 'vi-ant-design:edit-outlined',
  //         noCache: true
  //       }
  //     }
  //   ]
  // },
  {
    path: '/risk',
    component: Layout,
    name: 'risk',
    meta: {
      title: '风险管理',
      alwaysShow: false
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/risk/index.vue'),
        name: 'riskIndex',
        meta: {
          title: '风险管理',
          icon: 'vi-ant-design:warning-outlined',
          noCache: true
        }
      }
    ]
  },
  {
    path: '/keyword',
    component: Layout,
    name: 'keyword',
    meta: {
      title: '关键字维护',
      alwaysShow: false
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/keyword/index.vue'),
        name: 'KeywordIndex',
        meta: {
          title: '关键字维护',
          icon: 'vi-ant-design:key-outlined',
          noCache: true
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  strict: true,
  routes: constantRouterMap as RouteRecordRaw[],
  scrollBehavior: () => ({ left: 0, top: 0 })
})

export const resetRouter = (): void => {
  router.getRoutes().forEach((route) => {
    const { name } = route
    if (name && !NO_RESET_WHITE_LIST.includes(name as string)) {
      router.hasRoute(name) && router.removeRoute(name)
    }
  })
}

export const setupRouter = (app: App<Element>) => {
  app.use(router)
}

export default router
