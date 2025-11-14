/*
 * @Author: huanghuanrong
 * @Date: 2025-10-31 11:18:47
 * @LastEditTime: 2025-11-06 15:48:40
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \app\pages.config.ts
 */
import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  pages: [],
  globalStyle: {
    navigationStyle: 'custom',
    // 导航栏配置
    navigationBarBackgroundColor: '@navBgColor',
    navigationBarTextStyle: '@navTxtStyle',
    navigationBarTitleText: '维保管理系统',

    // 页面背景配置
    backgroundColor: '@bgColor',
    backgroundTextStyle: '@bgTxtStyle',
    backgroundColorTop: '@bgColorTop',
    backgroundColorBottom: '@bgColorBottom',

    // 下拉刷新配置
    enablePullDownRefresh: false,
    onReachBottomDistance: 50,

    // 动画配置
    animationType: 'pop-in',
    animationDuration: 300,

    rpxCalcBaseDeviceWidth: 750,
    dynamicRpx: true,
  },
  tabBar: {
    custom: true,
    // #ifdef MP-ALIPAY
    // customize: true,
    // overlay: true,
    // #endif
    height: '0',
    color: '@tabColor',
    selectedColor: '@tabSelectedColor',
    backgroundColor: '@tabBgColor',
    borderStyle: '@tabBorderStyle',
    list: [
      {
        pagePath: 'pages/base/switch1',
      },
      {
        pagePath: 'pages/base/switch2',
      },
    ],
  },
})
