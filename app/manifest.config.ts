/*
 * @Author: huanghuanrong
 * @Date: 2025-10-31 11:18:47
 * @LastEditTime: 2025-11-14 14:29:47
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \app\manifest.config.ts
 */
import { defineManifestConfig } from '@uni-helper/vite-plugin-uni-manifest'

export default defineManifestConfig({
  'name': '打卡小程序',
  'appid': '__UNI__10C1231',
  'description': '维保打卡',
  'versionName': '1.0.0',
  'versionCode': '100',
  'transformPx': false,
  /* 5+App特有相关 */
  'app-plus': {
    usingComponents: true,
    nvueStyleCompiler: 'uni-app',
    compilerVersion: 3,
    splashscreen: {
      alwaysShowBeforeRender: true,
      waiting: true,
      autoclose: true,
      delay: 0,
    },
    /* 模块配置 */
    modules: {},
    /* 应用发布信息 */
    distribute: {
      /* android打包配置 */
      android: {
        permissions: [
          '<uses-permission android:name="android.permission.CHANGE_NETWORK_STATE"/>',
          '<uses-permission android:name="android.permission.MOUNT_UNMOUNT_FILESYSTEMS"/>',
          '<uses-permission android:name="android.permission.VIBRATE"/>',
          '<uses-permission android:name="android.permission.READ_LOGS"/>',
          '<uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>',
          '<uses-feature android:name="android.hardware.camera.autofocus"/>',
          '<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>',
          '<uses-permission android:name="android.permission.CAMERA"/>',
          '<uses-permission android:name="android.permission.GET_ACCOUNTS"/>',
          '<uses-permission android:name="android.permission.READ_PHONE_STATE"/>',
          '<uses-permission android:name="android.permission.CHANGE_WIFI_STATE"/>',
          '<uses-permission android:name="android.permission.WAKE_LOCK"/>',
          '<uses-permission android:name="android.permission.FLASHLIGHT"/>',
          '<uses-feature android:name="android.hardware.camera"/>',
          '<uses-permission android:name="android.permission.WRITE_SETTINGS"/>',
        ],
      },
      /* ios打包配置 */
      ios: {},
      /* SDK配置 */
      sdkConfigs: {},
    },
  },
  /* 快应用特有相关 */
  'quickapp': {},
  /* 小程序特有相关 */
  'mp-weixin': {
    optimization: {
      subPackages: true,
    },
    appid: 'wx8cf26d39f894b3fc',
    setting: {
      urlCheck: false,
    },
    usingComponents: true,
    darkmode: true,
    themeLocation: 'theme.json',
    requiredPrivateInfos: ['getLocation', 'chooseLocation', 'startLocationUpdate', 'startLocationUpdateBackground'],
    permission: {
      'scope.userLocation': {
        desc: '您的位置信息将用于小程序位置打卡',
      },
    },
  },
  'mp-alipay': {
    usingComponents: true,
    compileOptions: {
      globalObjectMode: 'enable',
      treeShaking: true,
    },
  },
  'mp-baidu': {
    usingComponents: true,
  },
  'mp-toutiao': {
    usingComponents: true,
  },
  'h5': {
    darkmode: true,
    themeLocation: 'theme.json',
  },
  'uniStatistics': {
    enable: false,
  },
  'vueVersion': '3',
})
