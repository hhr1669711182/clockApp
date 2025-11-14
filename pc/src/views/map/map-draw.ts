import Draw from 'ol/interaction/Draw.js'
import Feature from 'ol/Feature'
import Polygon from 'ol/geom/Polygon'
import CircleGeom from 'ol/geom/Circle'
import { unByKey } from 'ol/Observable'
import fireMap from './map'
import * as turf from '@turf/turf'
import { CoordinateUtil, convertUp } from './to'
import { useEventBus } from '@/hooks/event/useEventBus'

export type FenceType = 1 | 2 | 3 // 1 圆形，2 矩形，3 多边形

export function useMapDrawing(map?: any) {

  const drawInteraction: Draw | null = null
  let currentFeature: Feature | null = null
  let currentRadius: number | null = null
  let currentArea = 0
  let currentCenter: [number, number] | null = null
  let currentPolygon: number[][] | null = null

  function createBox() {
    return (coordinates: number[][], geometry?: any) => {
      if (!geometry) {
        geometry = new Polygon([])
      }
      const start = coordinates[0]
      const end = coordinates[1]
      const minX = Math.min(start[0], end[0])
      const maxX = Math.max(start[0], end[0])
      const minY = Math.min(start[1], end[1])
      const maxY = Math.max(start[1], end[1])
      const boxCoordinates = [
        [minX, minY],
        [minX, maxY],
        [maxX, maxY],
        [maxX, minY],
        [minX, minY]
      ]
      geometry.setCoordinates([boxCoordinates])
      return geometry
    }
  }

  // function removeDrawInteraction() {
  //   if (drawInteraction && fireMap.map) {
  //     fireMap.map.removeInteraction(drawInteraction)
  //   }
  //   drawInteraction = null
  // }

  // function setDrawType(type: FenceType) {
  //   removeDrawInteraction()
  //   if (!fireMap.map) return

  //   let geometryType: 'Circle' | 'Polygon' = 'Polygon'
  //   let geometryFunction: any = undefined

  //   switch (type) {
  //     case 1: // 圆形
  //       geometryType = 'Circle'
  //       break
  //     case 2: // 矩形
  //       geometryType = 'Circle'
  //       geometryFunction = createBox()
  //       break
  //     case 3: // 多边形
  //       geometryType = 'Polygon'
  //       break
  //   }

  //   drawInteraction = new Draw({
  //     source: fireMap.layers.drawSource.getSource()!,
  //     type: geometryType,
  //     geometryFunction
  //   })

  //   drawInteraction.on('drawstart', (evt) => {
  //     currentFeature = evt.feature
  //     currentRadius = null
  //     currentArea = 0
  //     currentCenter = null
  //     currentPolygon = null

  //     if (geometryType === 'Circle') {
  //       const geom = currentFeature.getGeometry() as CircleGeom
  //       // 半径动态更新（可选）
  //       geom.on('change', () => {
  //         currentRadius = geom.getRadius()
  //       })
  //     }
  //   })

  //   drawInteraction.on('drawend', handleDrawEnd)
  //   fireMap.map.addInteraction(drawInteraction)
  // }

  // 设置绘制类型
  function setDrawType(type) {
    fireMap.drawType = type;
    fireMap.setDrawInteraction();
  }

  // 处理绘制完成事件
  /**
   * 处理绘图结束事件
   * @param event 绘图事件对象
   */
  function handleDrawEnd(event: any): void {
    // 获取绘制的feature对象
    const feature: Feature = event.feature;
    handleFeatureEnd(feature, true)
  }  

  function handleFeatureEnd(feature: any, isDraw: any): void {
    // 移除feature上的监听器
    const listener = feature.get("listener");
    listener && unByKey(listener);

    // 获取几何图形并清空绘图源
    const geometry = feature.getGeometry();
    if(isDraw) fireMap.layers.drawSource.getSource().clear();
    // 设置当前feature和半径参数
    fireMap.setParams({ currentFeature: feature });
    const drawType = fireMap.drawType;
    fireMap.setParams({ currentRadius: null });

    // 根据绘图类型处理不同的几何图形
    if (drawType === "semicircle") {
      processSemicircle(geometry as CircleGeom);
    } else {
      calculateFeatureInfo(geometry as Polygon);
    }
  }

  function handleModifyEnd(event: any): void {
    let feature = undefined
    event.features.forEach(item => feature = item)
    if(feature) handleFeatureEnd(feature, false)
  }

  function processSemicircle(circleGeometry: CircleGeom): void {
    const center = circleGeometry.getCenter();
    const radius = circleGeometry.getRadius();
    fireMap.setParams({ currentRadius: radius });

    const semicircleCoords: number[][] = [];
    // Modified by YeFeng
    const steps = 60; //360

    for (let i = 0; i <= steps; i++) {
      const angle = ((2 * Math.PI) / steps) * i;
      const x = center[0] + radius * Math.cos(angle);
      const y = center[1] + radius * Math.sin(angle);
      semicircleCoords.push([x, y]);
    }
    const semicirclePolygon = new Polygon([semicircleCoords]);
    console.log("🚀 ~ file: map-draw.ts:139 ~ semicirclePolygon:", semicirclePolygon)
    //fireMap.currentFeature.setGeometry(semicirclePolygon);
    calculateFeatureInfo(semicirclePolygon);
  }

  // 计算要素信息
  function calculateFeatureInfo(geometry: Polygon): void {
    // 计算面积
    fireMap.currentArea = geometry?.getArea();

    // 计算中心点坐标
    const coords = geometry.getCoordinates()[0];
    const center = turf.center(turf.points(coords))?.geometry?.coordinates || [];``
    // fireMap.currentCenter = center;
    fireMap.setParams({ currentCenter: center });

    // 获取多边形坐标
    const coordinates = geometry.getCoordinates();   
    fireMap.currentPolygon = JSON.stringify(coordinates, null, 2);
    // Modified by YeFeng
    fireMap.currentGeom = geometry;

    // 更新围栏信息
    useEventBus().emit('updateFenceInfo', {
      center: CoordinateUtil.epsg3857ToWgs84(center[0], center[1]).join(','),
      radius: convertUp(fireMap.currentRadius) ?? '',
      area: convertUp(fireMap.currentArea, 'area') || ''
    })
    
    // fireMap.StateManager.state.data.replay.fenceInfo[1].value = fireMap.CoordinateUtil.epsg3857ToWgs84(center[0], center[1]).join(',');
    // fireMap.StateManager.state.data.replay.fenceInfo[2].value = fireMap.convertUp(fireMap.currentRadius) ?? '';
    // fireMap.StateManager.state.data.replay.fenceInfo[3].value = fireMap.convertUp(fireMap.currentArea, 'area') || '';
  }

  function clearAll() {
    fireMap.layers.drawSource.getSource()?.clear()
    fireMap.removeCenterMarker()
    currentFeature = null
    currentArea = 0
    currentRadius = null
    currentCenter = null
    currentPolygon = null
  }

  function getCurrentInfo() {
    return {
      feature: currentFeature,
      center: currentCenter,
      radius: currentRadius ?? undefined,
      area: currentArea || undefined,
      polygon: currentPolygon || undefined
    }
  }

  return {
    setDrawType,
    clearAll,
    getCurrentInfo,
    createBox,
    handleModifyEnd,
    handleDrawEnd
  }
}
