/*
 * @Author: huanghuanrong
 * @Date: 2025-10-14 18:11:33
 * @LastEditTime: 2025-11-03 14:42:30
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \pc\src\store\useMapStore.ts
 */
import { defineStore } from 'pinia'
import { onBeforeMount, onMounted, onUnmounted } from 'vue'
// import { getAlarmThreshold } from '@/service/system'
import a00036 from '@/style/images/mapAlarm/alarmFps/min/C_00036.png'
// import { FeatureHandler, getAlarmStyle } from '@/utils/map/FeatureHandler'

// 类型定义
interface SubDivision {
  name: string
  code: string
}

interface AlarmNums {
  alarm: number
  qxjy: number
  shjz: number
}

interface MapState {
  mapBaseUrl: string
  divisionCode: string
  subDivisionCodes: SubDivision[]
  alarmNumTatol: AlarmNums
  alarmNumThreshold: number
  isMergeCluster: boolean
  updateTimer: number | null
  svgFrames: string[]
  currentFrameIndex: number
  currentFrame: string
  defStyleFn: Function | null
}

export const useMapStore = defineStore('map', () => {
  const state = reactive<MapState>({
    mapBaseUrl: '',
    divisionCode: '110000‌',
    subDivisionCodes: [
      { name: '东城区', code: '110101' },
      { name: '西城区', code: '110102' },
      { name: '朝阳区', code: '110105' },
      { name: '丰台区', code: '110106' },
      { name: '石景山区', code: '110107' },
      { name: '海淀区', code: '110108' },
      { name: '门头沟区', code: '110109' },
      { name: '房山区', code: '110111' },
      { name: '通州区', code: '110112' },
      { name: '顺义区', code: '110113' },
      { name: '昌平区', code: '110114' },
      { name: '大兴区', code: '110115' },
      { name: '怀柔区', code: '110116' },
      { name: '平谷区', code: '110117' },
      { name: '密云区', code: '110118' },
      { name: '延庆区', code: '110119' },
      { name: '开发区', code: '110115403' }
    ],
    alarmNumTatol: {
      alarm: 0,
      qxjy: 0,
      shjz: 0
    },
    alarmNumThreshold: 1000,
    isMergeCluster: true,

    updateTimer: null,
    svgFrames: [],
    currentFrameIndex: 0,
    currentFrame: a00036,
    defStyleFn: null
  })

  const startAnimation = async (
    map: any,
    vectorLayer: any,
    source: any,
    delay = 0
  ): Promise<any> => {
    if (delay === 10) return
    if (state.svgFrames.length < 60) {
      return setTimeout(() => startAnimation(map, vectorLayer, source, delay + 1), 500)
    }
    state.updateTimer = window.setInterval(() => {
      state.currentFrameIndex = (state.currentFrameIndex + 1) % state.svgFrames.length
      state.currentFrame = state.svgFrames[state.currentFrameIndex]
      const features = vectorLayer.getSource().getFeatures()
      features.forEach((feature: any) => {
        if (feature.get('features')) {
          //   const style = FeatureHandler.getStyle(map, 'fireCluster_new', feature)
          //   feature.setStyle(style)
        }
      })
      vectorLayer.changed()
    }, 1000 / 60)
  }

  const stopAnimation = (): void => {
    if (state.updateTimer !== null) {
      clearInterval(state.updateTimer)
      state.updateTimer = null
    }
  }

  const loadSvgFrames = async (): Promise<void> => {
    const frames: string[] = []
    const version = 'v1.0.0'
    const modules = import.meta.glob(`@/style/images/mapAlarm/alarmFps/min/*.png`, {
      as: 'url'
    })
    const keys = Object.keys(modules).sort()
    for (const path of keys) {
      const svg = await modules[path]()
      frames.push(`${svg}?v=${version}`)
    }
    state.svgFrames = frames
    if (frames.length) state.currentFrame = state.svgFrames[0]
  }

  onBeforeMount(() => {
    loadSvgFrames()
  })

  onMounted(() => {
    // getAlarmThreshold().then(({ data: { records = [] as any[] } }) => {
    //   if (records && records.length > 0) {
    //     state.alarmNumThreshold = Number(records[0]?.value || 0)
    //   }
    // })
  })

  onUnmounted(() => stopAnimation())

  const setConfig = (config: Partial<MapState>): void => {
    Object.assign(state, config)
  }

  const setIsMergeCluster = (alarmNums: Partial<AlarmNums>): void => {
    if (!alarmNums || typeof alarmNums !== 'object' || !Object.keys(alarmNums).length) return
    const n = Object.keys(alarmNums).reduce(
      (total, key) => total + Number(alarmNums[key as keyof AlarmNums]),
      0
    )
    Object.assign(state.alarmNumTatol, alarmNums)
    state.isMergeCluster = n <= state.alarmNumThreshold
  }

  return {
    ...toRefs(state),
    setConfig,
    setIsMergeCluster,
    startAnimation,
    stopAnimation
  }
})
