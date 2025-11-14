/*
 * @Description: GPS核心逻辑模块
 * @Author: liuyongkui
 * @Date: 2023-09-14 17:52:23
 * @LastEditors: liuyongkui
 * @LastEditTime: 2024-03-11 17:41:39
 */
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { GUID, validGis, coordsTransform, zoomToFeature, getTurfGeom, containsGeometry } from './mapCommon';
import { Style, Icon, Fill, Stroke, Text, Circle } from 'ol/style';
import { Transform } from './Transform';
import { getLjghInfo, getRegeo } from './AmapInterface';
import { Point, LineString } from 'ol/geom';
import { Feature, Overlay, Collection } from 'ol';
import { FeatureHandler } from './FeatureHandler';
import { nextTick } from 'vue';
import { Modify, Pointer } from 'ol/interaction';
import { getDistance, getLength } from 'ol/sphere';
import { transform } from 'ol/proj';
import * as turf from '@turf/turf';
import { ElMessage } from 'element-plus';
import GeoJSON from 'ol/format/GeoJSON';
import { AnimationCore } from './AnimationCore';
import { useCommonStore } from '@/store';
import { addHistory, addOrUpdateTag } from '@/service/api';

const carOffsetTolerance = 100; //车辆位置偏移容差值，单位米
const timingCalculate = 10; //车辆到场时间容差，单位秒

export const gpsModel = {
  routesave: false,
  _requestExecuting: {}, //正在执行的路径规划请求
  option: {
    currentTrackSource: new VectorSource({ wrapX: false }), //实时轨迹
    map: null,
    dragTarget: null,
    interimOverlay: null,
  },
  isReciveGps:false,//是否收到监控车辆的gps数据
  currentAlarm: {}, //当前关注警情
  monitoredCars: {}, // 监控队列
  // {
  //     carId: {
  //         isAnaysis: true,  //boolean 必选  是否进行路径分析，同队站多辆车出动，只选择其中一辆车进行路径规划
  //         carId: '123',  //必选  车辆id
  //         organname: 'xx消防救援站', //必选  所属消防救援站
  //         cph: '粤X5594', // 必选  车牌号
  //         personInfos: [],  //必选  随车人员信息 带队干部联系方式
  //         alarmInfo: { id: '999', address: '广州南站', gisx: 113.26406478881833, gisy: 22.991286343439654 } //警情信息
  //     },
  // }
  gpsMsgObj: {}, //GPS车辆信息对象
  // {
  //     carId: {
  //         id: '671416807a194482905dc704e9f650d9', // 车辆id
  //         deviceType: '21010800', // 装备类型代码
  //         x: '109.25716', //经度
  //         y: '27.83848', //纬度carDetailsList
  //         direction: '0.0', //方向
  //         speed: '0.0', //速度
  //         name: '贵X6386应急', //车牌号
  //     },
  // },
  anaysisResultObj: {}, // 分析结果对象，以{carID:resultObj}键值对的格式存在，用于主副屏道路数据渲染
  /**
   * {
   *      alarmInfo:{'id':'','address':'','gisx':Number,'gisy',Number}, //必选 警情相关信息
   *      stations:{'id':'','address':'',carInfos:[{'carId':'','address':'','gisx':Number,'gisy',Number}]} //必选 调派队站相关信息，至少包含一个队站信息
   *      plans: [{'traffic_lights':红绿灯个数,'total_distance':总长度,'geometry':完整的几何要素,'minRenderUnit':最小渲染单元}]
   * }
   */

  /**
   * 初始化gps模块相关图层
   * @param {*} map
   */
  init: function (map, carGroup) {
    gpsModel.option.map = map;
    gpsModel.option.carGroup = carGroup;
    const currentTrackLayer = new VectorLayer({
      layerName: 'CurrentTrackLayer',
      source: this.option.currentTrackSource,
      zIndex: 10002,
    });
    // currentTrackLayer.setVisible(false);
    map.addLayer(currentTrackLayer);
    return currentTrackLayer;
  },

  /**
   * 多队站路径请求
   * @param {*} params
   * {
   *      alarmInfo:{'id':'','address':'','gisx':Number,'gisy',Number},
   *      carInfos:[{'carId':'','address':'','gisx':Number,'gisy',Number}]
   *      callback:  //必选 接收查询结果
   * }
   */
  multipStationRoute: function (params) {
    //如果请求队列不为空，需先停止所有异步请求
    if (Object.keys(gpsModel._requestExecuting).length > 0) {
      gpsModel.stopRequests();
    }
    if (!validGis(params.alarmInfo.gisx, params.alarmInfo.gisy)) {
      console.log('警情坐标缺失！分析终止');
      return;
    }
    if (params.stations.length > 0) {
      let queryEndTime = 0;
      let totalFeature = []; //所有需要渲染的要素
      params.stations.forEach((element, index) => {
        if (!validGis(element.carInfos[0].gisx, element.carInfos[0].gisy)) {
          console.log('车辆坐标缺失！分析终止');
          return;
        } else if (gpsModel.anaysisResultObj[element.carInfos[0].carId]) {
          //当前道路分析结果已存在，避免进行二次查询
          queryEndTime += 1;
          const fs = gpsModel.addAnaysisResultToMap(gpsModel.anaysisResultObj[element.carInfos[0].carId]);
          totalFeature = totalFeature.concat(fs);
          if (index == params.stations.length - 1) {
            zoomToFeature(gpsModel.option.map, totalFeature);
          }
          return;
        } else {
          const carInfo = gpsModel.monitoredCars[element.carInfos[0].carId]; //判断监控队列中是否存在这辆车的信息
          if (carInfo) {
            const consumeTime = 0;
            const jsonObject = {
              x: Number(element.carInfos[0].gisx),
              y: Number(element.carInfos[0].gisy),
              name: element.carInfos[0].cph,
              id: element.carInfos[0].carId,
              speed: 0,
              deviceType: element.carInfos[0].zblxdm,
              direction: 0,
              receiveTime: 0,
              consumeTime: consumeTime, //渲染这一次消息动画所消耗的时间
            };
            const obj = Object.assign(gpsModel.monitoredCars[element.carInfos[0].carId], jsonObject);
            gpsModel.routeAnalyse(
                {
                  nodes: [
                    [element.carInfos[0].gisx, element.carInfos[0].gisy],
                    [params.alarmInfo.gisx, params.alarmInfo.gisy],
                  ],
                  alarmInfo: params.alarmInfo,
                  carInfos: obj,
                  strategy: 32,
                },
                function (features) {
                  totalFeature = totalFeature.concat(features);
                  queryEndTime += 1;
                  if (queryEndTime === params.stations.length) {
                    console.log('多队站路径请求查询完成');
                    zoomToFeature(gpsModel.option.map, totalFeature);
                  }
                },
            );
          }
        }
      });
    }
  },
  /**
   * 路径分析
   * data：分析节点，分析模块，是否显示路书，是否为GPS跟踪模式
   *
   */
  routeAnalyse: async function (data, callback) {
    if (!data.nodes || data.nodes.length < 2) {
      //节点为空或者节点不足，直接返回
      return;
    }

    // const user = JSON.parse(useCommonStore().userInfo);
    const user={
      yhid: '1',
      xm: 'admin',
      ssjgid: '284659d0813d4a029f5f72e9fac756f3',
      ssjgidValue: '北京消防救援总队',
    }
    const almHistory = {};
    almHistory.yhid = user.yhid;
    almHistory.xm = user.xm;
    almHistory.ssjgid = user.ssjgid;
    almHistory.ssjgmc = user.ssjgidValue;
    almHistory.jjdid = data.alarmInfo.id;
    almHistory.groupid = data.carInfos.groupId;

    const coordsS = Transform.wgs84togcj02(data.nodes[0][0], data.nodes[0][1]);
    const coordsE = Transform.wgs84togcj02(data.nodes[1][0], data.nodes[1][1]);
    const startNode = coordsS.join(',');
    const endNodes = coordsE.join(',');
    const formData =
      'origin=' +
      startNode +
      '&destination=' +
      endNodes +
      '&strategy=' +
      data.strategy +
      '&show_fields=tmcs,polyline,cost';
    const res = await getLjghInfo(formData);

    if (res?.info === 'OK') {
      const resultPlans = [];
      // res.route?.paths?.forEach(item => {
      const item = res.route?.paths[0]; //默认取第一条路径规划结果
      let routeCoords = [];
      const minRenderUnit = []; // 最小渲染单元
      const polyline_reduce = []; //精简的线路节点,只取每段的终点
      const trafficLights_dispersion = []; //每段线路红绿灯分布情况
      const geomList = [];
      item.steps?.forEach(function (feature, index) {
        const geomObj = {};
        const geomTmcs = [];
        feature['tmcs']?.forEach(function (bItem) {});
        feature['tmcs']?.forEach(function (bItem) {
          const newCoor = coordsTransform(bItem['tmc_polyline']);
          const o = {
            tmc_status: bItem['tmc_status'],
            tmc_distance: bItem['tmc_distance'],
            tmc_polyline: newCoor,
          };
          geomTmcs.push(o);
          const segment = new LineString(newCoor).transform('EPSG:4326', 'EPSG:3857');
          bItem['tmc_polyline'] = segment;
          minRenderUnit.push(bItem);
        });
        geomObj.tmcs = geomTmcs;
        geomObj.traffic_lights = Number(feature.cost.traffic_lights);
        geomList.push(geomObj);
        const polyline = coordsTransform(feature['polyline']);
        routeCoords = routeCoords.concat(polyline);
        trafficLights_dispersion.push(Number(feature.cost.traffic_lights));
        polyline_reduce.push(polyline[polyline.length - 1]);
      });
      const wholeGeometry = new LineString(routeCoords);
      almHistory.almHistoryGeomDto = {};
      const geom = { cost: item.cost, steps: geomList };
      almHistory.almHistoryGeomDto.geom = JSON.stringify(geom);
      almHistory.almHistoryClxxDto = {};
      almHistory.almHistoryClxxDto.clxx = JSON.stringify(gpsModel.option.carGroup[data.carInfos.groupId]);
      //gpsModel.saveHistory(almHistory);
      const plan = {
        traffic_lights: item.cost.traffic_lights, //红绿灯数量
        total_time: item.cost.duration,
        /**
         * 备注：在高德路径规划中，返回的方案距离（distance）是基于导航算法计算得出的整体路径的长度。
         * 这个长度考虑了实际的道路网络以及路况等因素，是一个综合性的距离
         * 平台中使用的距离是根据简单的几何学原理进行计算，没有考虑到实际道路路况等因素的影响
         */
        total_distance: wholeGeometry.clone().transform('EPSG:4326', 'EPSG:3857').getLength(), // 总长度
        geometry: wholeGeometry, // 完整的路径要素
        minRenderUnit: minRenderUnit, // 最小渲染单元
        polyline_reduce: polyline_reduce,
        trafficLights_dispersion: trafficLights_dispersion,
      };
      resultPlans.push(plan);
      // console.log(plan);

      const carDetails = {
        totalTrafficLight: Number(plan.traffic_lights) + 0,
        trafficLights: plan.traffic_lights,
        totalTime: plan.total_time,
        totalDistance: plan.total_distance,
      };
      //更新车辆路径规划详情
      gpsModel.updateCarDetails(data.carInfos.groupId, carDetails);
      //设置车辆详情弹窗自动弹出
      const carFeature = gpsModel.option.currentTrackSource.getFeatureById(data.carInfos.carId);
      const position = new Point([data.nodes[0][0], data.nodes[0][1]])
        .transform('EPSG:4326', 'EPSG:3857')
        .getCoordinates();
      if(carFeature!=null){
        const overlay = carFeature.get('overlay');
        // const overlay = gpsModel.option.map.getOverlayById(data.carInfos.carId + '_detailsPanel');
        overlay.setPosition(position);
        gpsModel.showCarDetails(data.carInfos.carId, true);
      }

      // });
      if (callback) {
        const resultObj = {
          carInfos: data.carInfos,
          plans: resultPlans,
        };
        gpsModel.anaysisResultObj[data.carInfos.carId] = resultObj;
        const fs = gpsModel.addAnaysisResultToMap(resultObj);
        callback(fs);
      }
    } else {
      ElMessage({
        message: '路径分析请求结果失败！',
        type: 'error',
        customClass: 'elMessageInfo',
      });
    }

    // const startNode = coordsS[1]+","+coordsS[0]; //ysc-20231228-百度路径规划(维度在前面)
    // const endNodes= coordsE[1]+","+coordsE[0];
    // const formData =
    //     'origin=' +
    //     startNode +
    //     '&destination=' +
    //     endNodes;
    // const res = await getLjghInfo(formData);

    // if (res?.message === 'ok') {
    //     const resultPlans = [];
    //     // res.route?.paths?.forEach(item => {
    //     const item = res.result?.routes[0]; //默认取第一条路径规划结果
    //     var routeCoords = [];
    //     var minRenderUnit = []; // 最小渲染单元
    //     const polyline_reduce = []; //精简的线路节点,只取每段的终点
    //     const trafficLights_dispersion = []; //每段线路红绿灯分布情况
    //     item.steps?.forEach(function (feature, index) {
    //         feature['tmcs']?.forEach(function (bItem) {
    //             var newCoor = coordsTransform(bItem['tmc_polyline']);
    //             var segment = new LineString(newCoor).transform('EPSG:4326', 'EPSG:3857');
    //             bItem['tmc_polyline'] = segment;
    //             minRenderUnit.push(bItem);
    //         });
    //         const polyline = coordsTransform(feature['polyline']);
    //         routeCoords = routeCoords.concat(polyline);
    //         trafficLights_dispersion.push(Number(feature.cost.traffic_lights));
    //         polyline_reduce.push(polyline[polyline.length - 1]);
    //     });
    //     const wholeGeometry = new LineString(routeCoords);
    //     const plan = {
    //         traffic_lights: item.cost.traffic_lights, //红绿灯数量
    //         total_time: item.cost.duration,
    //         /**
    //          * 备注：在高德路径规划中，返回的方案距离（distance）是基于导航算法计算得出的整体路径的长度。
    //          * 这个长度考虑了实际的道路网络以及路况等因素，是一个综合性的距离
    //          * 平台中使用的距离是根据简单的几何学原理进行计算，没有考虑到实际道路路况等因素的影响
    //          */
    //         total_distance: wholeGeometry.clone().transform('EPSG:4326', 'EPSG:3857').getLength(), // 总长度
    //         geometry: wholeGeometry, // 完整的路径要素
    //         minRenderUnit: minRenderUnit, // 最小渲染单元
    //         polyline_reduce: polyline_reduce,
    //         trafficLights_dispersion: trafficLights_dispersion,
    //     };
    //     resultPlans.push(plan);
    //     // console.log(plan);

    //     const carDetails = {
    //         totalTrafficLight:Number(plan.traffic_lights)+0,
    //         trafficLights: plan.traffic_lights,
    //         totalTime: plan.total_time,
    //         totalDistance: plan.total_distance,
    //     };
    //     //更新车辆路径规划详情
    //     gpsModel.updateCarDetails(data.carInfos.groupId, carDetails);
    //     //设置车辆详情弹窗自动弹出
    //     const carFeature = gpsModel.option.currentTrackSource.getFeatureById(data.carInfos.carId);
    //     const position = new Point([data.nodes[0][0], data.nodes[0][1]])
    //         .transform('EPSG:4326', 'EPSG:3857')
    //         .getCoordinates();
    //     const overlay = carFeature.get('overlay');
    //     // const overlay = gpsModel.option.map.getOverlayById(data.carInfos.carId + '_detailsPanel');
    //     overlay.setPosition(position);
    //     gpsModel.showCarDetails(data.carInfos.carId, true);
    //     // });
    //     if (callback) {
    //         const resultObj = {
    //             carInfos: data.carInfos,
    //             plans: resultPlans,
    //         };
    //         gpsModel.anaysisResultObj[data.carInfos.carId] = resultObj;
    //         const fs = gpsModel.addAnaysisResultToMap(resultObj);
    //         callback(fs);
    //     }
    // } else {
    //     ElMessage({
    //         message: '路径分析请求结果失败！',
    //         type: 'error',
    //         customClass: 'elMessageInfo',
    //     });
    // }
  },
  saveHistory: async function (data) {
    if (!gpsModel.routesave) {
      return;
    }
    const res = await addHistory(data);
    if (res?.code === '1000') {
      // ElMessage({
      //     message: '历史记录' + tagObj.name + '保存成功',
      //     type: 'success',
      //     customClass: 'elMessageSuccess',
      // });
    } else {
      ElMessage({
        message: '历史记录保存失败',
        type: 'error',
        customClass: 'elMessageError',
      });
    }
  },
  /**
   * 停止所有正在进行的异步请求
   */
  stopRequests: function () {
    // console.log(gpsRoutAnaysis._requestExecuting);
    for (const key in gpsModel._requestExecuting) {
      gpsModel._requestExecuting[key].abort();
      delete gpsModel._requestExecuting[key]; //异步请求成功之后清除请求队列中的项
    }
  },
  /**
   * 将分析结果渲染到地图上
   * @param {*} resultObj
   */
  addAnaysisResultToMap: function (resultObj) {
    const start_point = gpsModel.addStartPoint(resultObj.carInfos);
    const route = gpsModel.addRoute(gpsModel.option.map, resultObj.plans[0], resultObj.carInfos.carId);
    return route;
  },

  /**
   * 警情位置上图
   * @param {*} alarmInfo //alarmInfo:{'id':'','address':'','gisx':Number,'gisy',Number}, //必选 警情相关信息
   * @returns
   */
  addAlarmToMap: function (alarmInfo) {
    let eFeature = gpsModel.option.currentTrackSource.getFeatureById(alarmInfo.id);
    if (!eFeature) {
      if (validGis(alarmInfo.gisx, alarmInfo.gisy)) {
        eFeature = new Feature({
          geometry: new Point([alarmInfo.gisx, alarmInfo.gisy]).transform('EPSG:4326', 'EPSG:3857'),
          type: 'AlarmPosition',
        });
        eFeature.setId(alarmInfo.id);
        eFeature.setStyle(FeatureHandler.getStyle(map, 'end'));
        gpsModel.option.currentTrackSource.addFeature(eFeature);
      } else {
        console.log('该警情坐标值不合法，具体坐标值为：' + alarmInfo.gisx + ',' + alarmInfo.gisy);
      }
    }
    return eFeature;
  },

  addAlarmToMap2: function (alarmInfo) {
    let eFeature = gpsModel.option.currentTrackSource.getFeatureById(alarmInfo.id);
    if (!eFeature) {
      if (validGis(alarmInfo.gisx, alarmInfo.gisy)) {
        eFeature = new Feature({
          geometry: new Point([alarmInfo.gisx, alarmInfo.gisy]).transform('EPSG:4326', 'EPSG:3857'),
          type: 'AlarmPosition',
        });
        eFeature.setId(alarmInfo.id);
        const address = alarmInfo.address;
        eFeature.setStyle(FeatureHandler.getStyle(map, 'end', address));

        gpsModel.option.currentTrackSource.addFeature(eFeature);
      } else {
        console.log('该警情坐标值不合法，具体坐标值为：' + alarmInfo.gisx + ',' + alarmInfo.gisy);
      }
    }
    return eFeature;
  },

  /**
   * 警情位置下图
   * @param {*} alarmInfo //alarmInfo:{'id':'','address':'','gisx':Number,'gisy',Number}, //必选 警情相关信息
   * @returns
   */
  remvoeAlarmFromMap: function (alarmInfo) {
    const eFeature = gpsModel.option.currentTrackSource.getFeatureById(alarmInfo.id);
    if (!eFeature) {
      console.log('该警情不存在');
    } else {
      gpsModel.option.currentTrackSource.removeFeature(eFeature);
    }
  },

  /**
   * 更新警情位置
   * @param {*} alarmInfo
   */
  updateAlarmPosition: function (alarmInfo) {
    const alarmFeature = gpsModel.option.currentTrackSource.getFeatureById(alarmInfo.jjdid);
    const geom = new Point([alarmInfo.gisX, alarmInfo.gisY]).transform('EPSG:4326', 'EPSG:3857');
    alarmFeature.setGeometry(geom);
  },
  /**
   * 添加路径规划起点到地图上
   * @param {*} stationInfo 车辆位置
   */
  addStartPoint: function (carInfo) {
    let sFeature = gpsModel.option.currentTrackSource.getFeatureById(carInfo.carId + '_Start');
    if (!sFeature) {
      sFeature = new Feature({
        geometry: new Point([carInfo.x, carInfo.y]).transform('EPSG:4326', 'EPSG:3857'),
      });
      sFeature.setId(carInfo.carId + '_Start');
      sFeature.setStyle(FeatureHandler.getStyle(map, 'start'));
      gpsModel.option.currentTrackSource.addFeature(sFeature);
    }
    return sFeature;
  },

  /**
   * 将车辆位置渲染到地图上
   * @param {*} carInfos
   */
  addCarToMap: async function (carInfo) {
    let carFeature = gpsModel.option.currentTrackSource.getFeatureById(carInfo.carId);
    if (carFeature==null) {
      carFeature = new Feature({
        geometry: new Point([carInfo.x, carInfo.y]).transform('EPSG:4326', 'EPSG:3857'),
        type: 'carFeature',
      });
      await nextTick();
      // console.log(gpsModel.option.carGroup);
      const container = document.getElementById(carInfo.groupId); // 初始弹出对象

      const overlay = new Overlay({
        id: carInfo.carId + '_passRoute',
        element: container,
        positioning: 'bottom-center',
        stopEvent: true,
        insertFirst: false,
        offset: [-10, -190],
      });
      carFeature.set('overlay', overlay);
      gpsModel.option.map.addOverlay(overlay);

      carFeature.setId(carInfo.carId);
      carFeature.setProperties(carInfo);
      carFeature.set('online', true);
      carFeature.setStyle(FeatureHandler.getStyle(gpsModel.option.map, 'track'));
      gpsModel.option.currentTrackSource.addFeature(carFeature);
    }
    //用于测试车辆实时位置上传进度
    // else {
    //     const feature = new Feature({
    //         geometry: new Point([carInfo.x, carInfo.y]).transform('EPSG:4326', 'EPSG:3857'),
    //     });
    //     feature.setId(GUID());
    //     feature.setStyle(FeatureHandler.getStyle(map, 'start'));
    //     gpsModel.option.currentTrackSource.addFeature(feature);
    // }
  },

  /**
   * 渲染路径规划结果
   * @param {*} map
   * @param {*} plan
   * @param {*} carId
   */
  addRoute: function (map, plan, carId) {
    const routeFeature = new Feature({
      geometry: plan.geometry.transform('EPSG:4326', 'EPSG:3857'),
    });
    routeFeature.setId(carId + '_route');
    // routeFeature.set('carId', carId);
    routeFeature.set('tmcs', plan.minRenderUnit);
    routeFeature.setStyle(FeatureHandler.getStyle(map, 'trackRouteArrow'));
    gpsModel.option.currentTrackSource.addFeature(routeFeature);
    return routeFeature;
  },
  /**
   * 清除所有渲染结果，仅限于主屏切换警情时使用
   */
  clearAllRenderResult: function () {
    const fs = gpsModel.option.currentTrackSource.getFeatures();
    if (fs.length > 0) {
      fs.forEach((item) => {
        item.get('overlay')?.setPosition(null);
      });
    }
    gpsModel.option.currentTrackSource.clear();
    // gpsModel.option.map.getOverlays()?.forEach(item => {
    //     item.setPosition(null);
    // });
  },
  /**
   * 根据警情id清除所有渲染结果
   * @param {*} alarmId
   */
  clearRenderResultByAlarmId: function (alarmId) {
    //删除警情图标
    const alarmFeature = gpsModel.option.currentTrackSource.getFeatureById(alarmId);
    if (alarmFeature) gpsModel.option.currentTrackSource.removeFeature(alarmFeature);
    //判定是否有被监控车辆
    if (Object.keys(gpsModel.monitoredCars).length > 0) {
      for (const key in gpsModel.monitoredCars) {
        if (gpsModel.monitoredCars[key].alarmInfo.id == alarmId) {
          //删除路径规划结果
          const routeFeature = gpsModel.option.currentTrackSource.getFeatureById(key + '_route');
          if (routeFeature) gpsModel.option.currentTrackSource.removeFeature(routeFeature);
          //删除起点图标
          const startFeature = gpsModel.option.currentTrackSource.getFeatureById(key + '_Start');
          if (startFeature) gpsModel.option.currentTrackSource.removeFeature(startFeature);
          //删除车辆上图结果
          // const carFeature = gpsModel.option.currentTrackSource.getFeatureById(key);
          // if (carFeature) gpsModel.option.currentTrackSource.removeFeature(carFeature);
          //车辆移除监控队列
          // gpsModel.cancelMonitor([key]);
        }
      }
    }
  },

  /**
   * 根据警情id清除所有渲染结果
   * @param {*} alarmId
   */
  clearAllRenderResultByAlarmId: function (alarmId) {
    //删除警情图标
    const alarmFeature = gpsModel.option.currentTrackSource.getFeatureById(alarmId);
    if (alarmFeature) gpsModel.option.currentTrackSource.removeFeature(alarmFeature);
    //判定是否有被监控车辆
    if (Object.keys(gpsModel.monitoredCars).length > 0) {
      for (const key in gpsModel.monitoredCars) {
        if (gpsModel.monitoredCars[key].alarmInfo.id == alarmId) {
          //删除路径规划结果
          const routeFeature = gpsModel.option.currentTrackSource.getFeatureById(key + '_route');
          if (routeFeature) gpsModel.option.currentTrackSource.removeFeature(routeFeature);
          //删除起点图标
          const startFeature = gpsModel.option.currentTrackSource.getFeatureById(key + '_Start');
          if (startFeature) gpsModel.option.currentTrackSource.removeFeature(startFeature);
          //删除车辆上图结果
          const carFeature = gpsModel.option.currentTrackSource.getFeatureById(key);
          if (carFeature) {
            gpsModel.option.currentTrackSource.removeFeature(carFeature);
            const overlay = carFeature.get('overlay');
            if (overlay) overlay.setPosition(null);
          }
          //车辆移除监控队列
          gpsModel.cancelMonitor([key]);
        }
      }
    }
  },

  /**
   * 跟踪目标
   * @param data 目标集合
   */
  addMonitor: function (data) {
    data?.forEach((item) => {
      gpsModel.monitoredCars[item.carId] = item;
    });
    gpsModel.creatCarDetailsPanel(data);
    // console.log(gpsModel.monitoredCars);
  },

  /**
   * 取消跟踪目标
   * @param carIds 车辆id集合
   */
  cancelMonitor: function (carIds) {
    carIds?.forEach((item) => {
      delete gpsModel.monitoredCars[item];
    });
  },

  /**
   * 更新车辆gps上图位置
   * @param carParams
   */
  updateGpsCarLocation: function (carParams, callback) {
    const carFeature = gpsModel.option.currentTrackSource.getFeatureById(carParams.id);
    if (carFeature) {
      const point = new Point([Number(carParams.x), Number(carParams.y)]).transform('EPSG:4326', 'EPSG:3857');
      carParams.lastTime = new Date();
      carFeature.setGeometry(point);
      const overlay = carFeature.get('overlay');
      const coordinate = point.clone().getCoordinates();
      if (overlay) overlay.setPosition(coordinate);
    } else {
      gpsModel.addCarToMap(carParams);
    }
  },

  /**
   * MQ接受消息回调函数
   * message消息对象
   */
  responseCallback2: function (message) {
    // ---接收消息
    message.carlist?.forEach((item, index) => {
      //终端状态位置信息通知
      if (validGis(item.x, item.y)) {
        const carInfo = gpsModel.monitoredCars[item.clid]; //判断监控队列中是否存在这辆车的信息
        if (carInfo) {
          const consumeTime = carInfo.receiveTime ? item.receiveTime - carInfo.receiveTime : 0;
          const jsonObject = {
            x: Number(item.x),
            y: Number(item.y),
            name: item.cph,
            id: item.clid,
            speed: item.sd,
            deviceType: item.zblxdm,
            direction: (item.fx - 90) * (Math.PI / 180),
            receiveTime: item.receiveTime,
            consumeTime: consumeTime, //渲染这一次消息动画所消耗的时间
          };
          const obj = Object.assign(gpsModel.monitoredCars[item.clid], jsonObject);
          gpsModel.addCarToMap(obj); //车辆实时位置上图
          //避免误操作使用清除工具，车辆位置信息上传路径规划结果没有终点
          const alarmFeature = gpsModel.option.currentTrackSource.getFeatureById(obj.alarmInfo.id);
          if (!alarmFeature) {
            gpsModel.addAlarmToMap(obj.alarmInfo);
          }
          const routeFeature = gpsModel.option.currentTrackSource.getFeatureById(item.clid + '_route');
          const carFeature = gpsModel.option.currentTrackSource.getFeatureById(item.clid);
          //收到gps进行路径分析的条件
          //1.调派车辆的警情时当前关注警情
          //2.之前没有路径规划结果
          //3.当前车辆是队站下唯一车辆或者队站下多个车辆中的头车，需要进行路径分析
          if (!routeFeature && carInfo.isAnaysis) {
            console.log('执行过路径分析的车辆信息：第' + (index + 1) + '辆车');
            console.log(obj);
            gpsModel.receiveMSG(obj);
          } else if (routeFeature) {
            gpsModel.carPositionAnalyse(routeFeature, carFeature, obj);
          }
        }
      }
    });
  },

  /**
   * MQ接受消息回调函数
   * message消息对象
   */
  responseCallback: function (message) {
    // ---接收消息
    message.carlist?.forEach((item, index) => {
      //终端状态位置信息通知
      if (validGis(item.x, item.y)) {
        // console.log(gpsModel.monitoredCars);
        const carInfo = gpsModel.monitoredCars[item.clid]; //判断监控队列中是否存在这辆车的信息
        if (carInfo) {
          const consumeTime = carInfo.receiveTime ? item.receiveTime - carInfo.receiveTime : 0;
          const jsonObject = {
            x: Number(item.x),
            y: Number(item.y),
            name: item.cph,
            id: item.clid,
            speed: item.sd,
            deviceType: item.zblxdm,
            direction: (item.fx - 90) * (Math.PI / 180),
            receiveTime: item.receiveTime,
            consumeTime: consumeTime, //渲染这一次消息动画所消耗的时间
          };
          const obj = Object.assign(gpsModel.monitoredCars[item.clid], jsonObject);
          if (obj.alarmInfo.id == gpsModel.currentAlarm.id) {
            gpsModel.addCarToMap(obj); //车辆实时位置上图
            //避免误操作使用清除工具，车辆位置信息上传路径规划结果没有终点
            const alarmFeature = gpsModel.option.currentTrackSource.getFeatureById(obj.alarmInfo.id);
            if (!alarmFeature) {
              gpsModel.addAlarmToMap(obj.alarmInfo);
            }
            const routeFeature = gpsModel.option.currentTrackSource.getFeatureById(item.clid + '_route');
            const carFeature = gpsModel.option.currentTrackSource.getFeatureById(item.clid);
            //收到gps进行路径分析的条件
            //1.调派车辆的警情时当前关注警情
            //2.之前没有路径规划结果
            //3.当前车辆是队站下唯一车辆或者队站下多个车辆中的头车，需要进行路径分析
            if (!routeFeature && carInfo.isAnaysis) {
              console.log('执行过路径分析的车辆信息：第' + (index + 1) + '辆车');
              console.log(obj);
              gpsModel.receiveMSG(obj);
            } else if (routeFeature) {
              gpsModel.carPositionAnalyse(routeFeature, carFeature, obj);
            }
          }
        }
      }
    });
  },

  /**
   * 车辆位置消息分析
   * @param {*} routeFeature
   * @param {*} carFeature
   * @param {*} carInfo
   */
  carPositionAnalyse: function (routeFeature, carFeature, carInfo) {
    const geo = routeFeature.getGeometry().clone().transform('EPSG:3857', 'EPSG:4326');
    const carId = carFeature.getId();
    const online = geo.intersectsExtent([Number(carInfo.x), Number(carInfo.y), Number(carInfo.x), Number(carInfo.y)]);
    //构建当前点位
    const endPoint = new Point([Number(carInfo.x), Number(carInfo.y)]);
    //点不在线上 判断是否在容差值范围内
    //这样可以接受容差值
    // const closestPoint = geo.getClosestPoint(endPoint.getCoordinates());
    //更改测量方法
    // const dist = getDistance(endPoint.getCoordinates(), closestPoint);
    const isInArea = gpsModel.carCompareWithArea(routeFeature, gpsModel.monitoredCars[carId]);
    if (isInArea) {
      // needAnalyse = false;
      const animationId = gpsModel.buildAnimationObj(carFeature, geo, endPoint.getCoordinates(), carInfo.consumeTime);
      if (animationId) {
        carFeature.set('animationId', animationId);
      }
    } else {
      ElMessage({
        message: '车辆实时位置偏移规划线路超过' + carOffsetTolerance + '米，重新规划路线',
        type: 'info',
        customClass: 'elMessageInfo',
      });
      gpsModel.speakUseSpeechSynthesis('车辆实时位置偏移,重新规划路线' + '。。。。' + '车辆实时位置偏移,重新规划路线');
      gpsModel.clearRenderResultByCarId(carId, false, true); // 清除车辆现有渲染结果
      //清除车辆动画
      const animationId = carFeature.get('animationId');
      if (animationId) {
        AnimationCore.remove(animationId);
        carFeature.set('animationId', null);
      }
      // gpsModel.receiveMSG(gpsModel.monitoredCars[carId]);
      //更新车辆位置到偏移位置
      const position = endPoint.clone().transform('EPSG:4326', 'EPSG:3857');
      carFeature.setGeometry(position);
      const overlay = carFeature.get('overlay');
      const coordinate = position.getCoordinates();
      if (overlay) overlay.setPosition(coordinate);
      const jsonObject = gpsModel.monitoredCars[carId];
      gpsModel.routeAnalyse(
        {
          nodes: [
            [jsonObject.x, jsonObject.y],
            [jsonObject.alarmInfo.gisx, jsonObject.alarmInfo.gisy],
          ],
          carInfos: jsonObject,
          strategy: 32,
        },
        function (route) {
          // console.log('路径分析执行完成');
          zoomToFeature(gpsModel.option.map, route);
          const geo = route.getGeometry().clone();
          geo.transform('EPSG:3857', 'EPSG:4326');
          // let lonlat = null;
          const passRouteCoords = carFeature.get('passRouteCoords');
          // if (passRouteCoords) {
          //     lonlat = transform(passRouteCoords[passRouteCoords.length - 1], 'EPSG:3857', 'EPSG:4326');
          // }
          // const startPoint = turf.point(lonlat);
          // const turfline = turf.lineString(geo.getCoordinates());
          // const endcoord = geo.getCoordinates()[geo.getCoordinates().length - 1];
          // //截取线
          // const sliced = turf.lineSlice(startPoint, turf.point(endcoord), turfline); //截取起点到新坐标点的位置
          // const olline = new LineString(sliced.geometry.coordinates);
          passRouteCoords.push(coordinate);
          carFeature.set('passRouteCoords', passRouteCoords);
          const animationId = gpsModel.buildAnimationObj(
            carFeature,
            geo,
            [Number(carInfo.x), Number(carInfo.y)],
            carInfo.consumeTime,
          );
          // olline.transform('EPSG:4326', 'EPSG:3857');
          // route.setGeometry(olline);
          if (animationId) {
            // AnimationCore.remove(animationId);
            // feature.set('animationId', null);
            let otherRoutes = carFeature.get('otherRoutes');
            if (!otherRoutes) {
              otherRoutes = [route];
            } else {
              otherRoutes.push(route);
            }
            carFeature.set('animationId', animationId);
            carFeature.set('otherRoutes', otherRoutes);
            //保留车辆行驶过的路径
            // KLD.slicedRouteByCarFeature(PS, lonlat, feature);
            // passRouteCoords.push(point.getCoordinates());
            // feature.set('passRouteCoords', passRouteCoords);
            // if (routesAnalyse && needAnalyse) {
            //     alarmRoutesAnalyse(carParams, GPSTrack.routeAddCallBack); //多路径分析
            // }
          }
        },
      );
    }
    // else {
    //     var time = Number(timingCalculate);
    //     //如果车辆不在容差范围内，定时规划路径的参数不为0
    //     if (time > 0) {
    //         var date2 = new Date();
    //         var date1 = carFeature.get('routetime');
    //         var detime = date2 - date1;
    //         //再次收到车辆GPS消息的时间达到定时规划时间，重新进行规划。
    //         if (detime > time) {
    //             carParams.routesAnalyse = routesAnalyse;
    //             //重新规划路径
    //             refAlarmroutesAnalyes(feature, carParams);
    //         } else {
    //             //如果没有超过定时规划时间，车辆继续在原来的路径上行驶
    //             needAnalyse = false;
    //             var animationId = gpsModel.buildAnimationObj(feature, geo, endPoint.getCoordinates());
    //             if (animationId) {
    //                 feature.set('animationId', animationId);
    //             }
    //         }
    //     }else {
    //         //如果没有定时规划参数，车辆超出容差即重新路径规划。
    //         carParams.routesAnalyse = routesAnalyse;
    //         refAlarmroutesAnalyes(feature, carParams);
    //     }
    // }
  },
  speakUseSpeechSynthesis: function (text) {
    if (text) {
      const u = new SpeechSynthesisUtterance();
      u.text = text;
      u.lang = 'zh-CN';
      u.rate = 0.7; // 语速
      u.volume = 1; // 声音的音量
      u.pitch = 0.5; // 音高
      // 移除语音播放队列
      window.speechSynthesis.cancel();
      // 增加到合成语音队列并播放
      window.speechSynthesis.speak(u);
    }
  },
  /**
   * 消息处理，执行路径分析
   * @param {*} jsonObject
   */
  receiveMSG: function (jsonObject) {
    if (validGis(jsonObject.x, jsonObject.y)) {
      gpsModel.routeAnalyse(
        {
          nodes: [
            [jsonObject.x, jsonObject.y],
            [jsonObject.alarmInfo.gisx, jsonObject.alarmInfo.gisy],
          ],
          carInfos: jsonObject,
          strategy: 32,
          alarmInfo: jsonObject.alarmInfo,
        },
        function (features) {
          console.log('路径分析执行完成');
          zoomToFeature(gpsModel.option.map, features);
        },
      );
    }
  },
  /**
   * 重置分析结果
   * @param {*} alarmInfo
   */
  reloadAnalyseResult: function (alarmInfo) {
    if (Object.keys(gpsModel.currentAlarm).length != 0) {
      if (gpsModel.currentAlarm.id === alarmInfo.id) {
        gpsModel.currentAlarm.cars.forEach((item) => {
          const obj = Object.assign(gpsModel.monitoredCars[item].alarmInfo, alarmInfo);
          gpsModel.receiveMSG(gpsModel.monitoredCars[item]);
        });
      }
    }
  },

  /**
   * 更新车辆详情数据
   * @param {*} groupId
   * @param {*} obj
   */
  updateCarDetails: (groupId, obj) => {
    const carGroup = gpsModel.option.carGroup[groupId];
    if (carGroup) {
      for (const key in carGroup.details) {
        const newDetails = Object.assign(gpsModel.option.carGroup[groupId].details[key], obj);
      }
    }
    // console.log(gpsModel.option.carGroup);
  },

  /**
   * 更新所有被监控车辆详情信息
   */
  updateAllCarDetails: () => {
    gpsModel.currentAlarm.cars.forEach((item) => {
      const carInfo = gpsModel.monitoredCars[item];
      Object.assign(gpsModel.option.carGroup[carInfo.groupId].details[item], carInfo);
    });
  },
  /**
   * 根据车辆id获取需要同步更新数据的车辆信息
   * @param {*} carId
   * @returns
   */
  getSynchronizationUpdateCars: (carId) => {
    if (gpsModel.monitoredCars[carId]) {
      const groupId = gpsModel.monitoredCars[carId].groupId;
      const carIds = [];
      for (const key in gpsModel.monitoredCars) {
        if (gpsModel.monitoredCars[key].groupId === groupId) {
          carIds.push(key);
        }
      }
      return carIds;
    } else {
      return [];
    }
  },
  //创建车辆详情面板
  creatCarDetailsPanel: (carInfos) => {
    carInfos?.forEach((item) => {
      if (gpsModel.option.carGroup[item.groupId]) {
        if (gpsModel.option.carGroup[item.groupId].details[item.carId]) {
          Object.assign(gpsModel.option.carGroup[item.groupId].details[item.carId], item);
        } else {
          gpsModel.option.carGroup[item.groupId].details[item.carId] = item;
        }
        // gpsModel.option.carGroup[item.groupId].show = false;
      } else {
        gpsModel.option.carGroup[item.groupId] = {
          details: { [item.carId]: item },
          show: false,
        };
      }
    });
  },

  //弹出显示车辆详情弹窗
  showCarDetails: (carId, status) => {
    const groupId = gpsModel.monitoredCars[carId].groupId;
    gpsModel.option.carGroup[groupId].show = status;
  },

  /**
   * 根据新的车辆监控队列更新分析结果
   * @param {*} newCarMonitroList
   */
  updateAnalyseResult: (data) => {
    const newCarMonitroList = [];
    data?.forEach((item) => {
      newCarMonitroList[item.carId] = item;
    });
    for (const key in gpsModel.monitoredCars) {
      if (!newCarMonitroList[key]) {
        gpsModel.clearRenderResultByCarId(key, true, false);
      }
    }
  },
  /**
   * 根据车辆id清除所有渲染结果
   * @param {*} carId
   * @param {*} isDeleteCar 是否清除这辆车
   * @param {*} monitorStatus 是否继续监控这辆车
   */
  clearRenderResultByCarId: function (carId, isDeleteCar, monitorStatus) {
    //删除路径规划结果
    const routeFeature = gpsModel.option.currentTrackSource.getFeatureById(carId + '_route');
    if (routeFeature) gpsModel.option.currentTrackSource.removeFeature(routeFeature);
    //删除起点图标
    const startFeature = gpsModel.option.currentTrackSource.getFeatureById(carId + '_Start');
    if (startFeature) gpsModel.option.currentTrackSource.removeFeature(startFeature);
    if (isDeleteCar) {
      //删除车辆上图结果及弹窗
      const carFeature = gpsModel.option.currentTrackSource.getFeatureById(carId);
      if (carFeature) {
        gpsModel.option.currentTrackSource.removeFeature(carFeature);
        const overlay = carFeature.get('overlay');
        overlay.setPosition(null);
        gpsModel.showCarDetails(carId, false);
      }
    }
    if (!monitorStatus) {
      //车辆信息移除弹窗列表
      const groupId = gpsModel.monitoredCars[carId].groupId;
      delete gpsModel.option.carGroup[groupId].details[carId];
      //车辆移除监控队列
      gpsModel.cancelMonitor([carId]);
    }
    //用于测试缓冲带，判断是否越界
    // const routeBuffer = gpsModel.option.currentTrackSource.getFeatureById('buffer');
    // if (routeBuffer) gpsModel.option.currentTrackSource.removeFeature(routeBuffer);
  },
  /**
   * 修改警情位置
   * @param {*} alarmId
   */
  modifyFeature: function (alarmInfo, callback) {
    const alarmFeature = gpsModel.option.currentTrackSource.getFeatureById(alarmInfo.id);
    if (alarmFeature) {
      const dragInteraction = gpsModel.option.map
        .getInteractions()
        .getArray()
        .find((interaction) => {
          return interaction.get('name') === 'Pointer';
        });
      if (!dragInteraction) {
        gpsModel.option.dragTarget = new Pointer({
          handleDownEvent: function (e) {
            // 检查是否点击在要素上，如果是则启动拖动操作
            const feature = map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
              const prop = feature.getProperties();
              if (prop?.type === 'AlarmPosition') {
                // 限制只允许拖拽更改终点（警情）图标位置
                return feature;
              }
            });
            if (feature) {
              this.feature = feature;
              this.coordinate = e.coordinate;
            }
            return !!feature;
          },
          handleDragEvent: function (e) {
            // 移动要素的位置
            const deltaX = e.coordinate[0] - this.coordinate[0];
            const deltaY = e.coordinate[1] - this.coordinate[1];
            this.coordinate = e.coordinate;
            const geometry = this.feature.getGeometry();
            geometry.translate(deltaX, deltaY);
          },
          handleUpEvent: async function () {
            // 移动结束后续操作
            gpsModel.clearEditStatus();
            const coor = this.feature.getGeometry().clone().transform('EPSG:3857', 'EPSG:4326').getCoordinates();
            const coor_gcj02 = Transform.wgs84togcj02(coor[0], coor[1]);
            const formData = 'location=' + coor_gcj02.toString();
            const res = await getRegeo(formData);
            if (res?.info === 'OK') {
              const formatInfo = {
                id: alarmInfo.id,
                oldgisx: alarmInfo.gisx,
                oldgisy: alarmInfo.gisy,
                gisx: coor[0],
                gisy: coor[1],
                formattedAddress: res.regeocode?.formatted_address,
              };
              console.log(res);
              callback(formatInfo);
            } else {
              ElMessage({
                message: '查询位置信息失败！',
                type: 'error',
                customClass: 'elMessageError',
              });
            }
            // 重置拖动数据
            this.feature = null;
            this.coordinate = null;
            return false;
          },
        });
        gpsModel.option.map.addInteraction(gpsModel.option.dragTarget);
      }
    }
  },

  /**
   * 清除编辑状态
   */
  clearEditStatus: function () {
    if (gpsModel.option.dragTarget) {
      gpsModel.option.map.removeInteraction(gpsModel.option.dragTarget);
      gpsModel.option.dragTarget = null;
    }
  },

  /**
   * 更新导航结果详情
   * @param {*} carId
   * @param {*} plan 导航方案
   * @param {*} location 车辆实时位置
   */
  updateNavigationDetails: function (carId, plan, location) {
    // 获取实时位置离轨迹最近的节点
    const coords = plan.geometry.clone().transform('EPSG:3857', 'EPSG:4326').getCoordinates();
    const polylind_index = gpsModel.getMinDistanceNodeIndex(coords, location);
    const new_coords = coords.slice(polylind_index, coords.length);
    // 计算节点与终点之间的沿线距离
    const surplus_distance = new LineString(new_coords).transform('EPSG:4326', 'EPSG:3857').getLength();
    const surplus_time = plan.total_time * (surplus_distance / plan.geometry.clone().getLength());
    // 同样的方法查找红绿灯个数
    const index = gpsModel.getMinDistanceNodeIndex(plan.polyline_reduce, location);
    const trafficLight_arr = plan.trafficLights_dispersion.slice(index, plan.trafficLights_dispersion.length);
    const surplus_trafficLight = trafficLight_arr.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);
    const carDetails = {
      trafficLights: surplus_trafficLight,
      totalTime: surplus_time,
      totalDistance: surplus_distance,
    };
    // console.log(carDetails);
    //更新车辆路径规划详情
    if (gpsModel.monitoredCars[carId]) {
      gpsModel.updateCarDetails(gpsModel.monitoredCars[carId].groupId, carDetails);
    }
  },
  /**
   * 获取最近节点索引号
   * @param {*} coordinates
   * @param {*} location
   * @returns
   */
  getMinDistanceNodeIndex: function (coordinates, location) {
    let closestNode;
    let minDistance = Infinity;
    coordinates.forEach((item, index) => {
      const distance = Math.sqrt(Math.pow(item[0] - location[0], 2) + Math.pow(item[1] - location[1], 2));

      if (distance < minDistance) {
        minDistance = distance;
        closestNode = index;
      }
    });
    return closestNode;
  },

  /**
   * 取消二次定位时警情位置复原
   * @param {*} alarmInfo
   */
  restoreAlarmAddress: function (alarmInfo) {
    const alarmFeature = gpsModel.option.currentTrackSource.getFeatureById(alarmInfo.id);
    if (alarmFeature) {
      const position = new Point([alarmInfo.oldgisx, alarmInfo.oldgisy]).transform('EPSG:4326', 'EPSG:3857');
      alarmFeature.setGeometry(position);
    }
  },

  /**
   *车辆为到场状态或返回状态，根据发送的gps坐标生成车辆的行驶路径
   *
   */
  buildAnimationObj: function (feature, line, endPoint, consumeTime) {
    //点在线上 截取线
    let animationId = feature.get('animationId');
    const passRouteCoords = feature.get('passRouteCoords') || [];
    let totalPointCount = 0;
    let lonlat = null;
    if (passRouteCoords.length != 0) {
      totalPointCount = passRouteCoords.length + 1;
      lonlat = transform(passRouteCoords[passRouteCoords.length - 1], 'EPSG:3857', 'EPSG:4326');
    } else {
      lonlat = line.getCoordinates()[0];
      totalPointCount = 1;
    }
    const startPoint = turf.point(lonlat);
    const turfline = turf.lineString(line.getCoordinates());
    //截取线
    const sliced = turf.lineSlice(startPoint, turf.point(endPoint), turfline); //截取起点到新坐标点的位置
    const olline = new LineString(sliced.geometry.coordinates);
    const lastcoord = olline.getCoordinates()[olline.getCoordinates().length - 1];
    const dist = getDistance(lastcoord, lonlat);
    if (dist < 1) {
      const ollineList = olline.getCoordinates().reverse();
      olline.setCoordinates(ollineList);
    }
    olline.transform('EPSG:4326', 'EPSG:3857');
    passRouteCoords.push(olline.getCoordinates()[olline.getCoordinates().length - 1]);
    feature.set('passRouteCoords', passRouteCoords);
    const distance = getLength(olline);
    if (animationId) {
      const animationObj = AnimationCore.find(animationId);
      const newolLine = {
        line: olline,
        distance: distance,
        consumeTime: consumeTime,
      };
      if (animationObj) {
        animationObj.params.ollines.push(newolLine);
        animationObj.params.totalPointCount = totalPointCount;
        animationObj.params.pasue = false;
      }
    } else {
      const params = {
        index: 0,
        pickLine: 0,
        ollines: [
          {
            line: olline,
            distance: distance,
            consumeTime: consumeTime,
          },
        ],
        totalPointCount: totalPointCount,
      };
      animationId = AnimationCore.add({
        id: animationId,
        feature: feature,
        stop: false,
        animation: gpsModel.carMoveAnimation,
        params: params,
      });
    }
    return animationId;
  },

  /**
   * 车辆移动动画回调
   * @param {*} feature
   * @param {*} params
   */
  carMoveAnimation: function (fps, delta, feature, params) {
    const location = feature.clone().getGeometry().transform('EPSG:3857', 'EPSG:4326').getCoordinates();
    const carId = feature.getId();
    const plan = gpsModel.anaysisResultObj[carId].plans[0];
    gpsModel.updateNavigationDetails(carId, plan, location); //更新路径规划结果--剩余距离，时间，红绿灯
    const pickline = params.pickLine;
    if (params.ollines[pickline]) {
      const ollineObj = params.ollines[pickline];
      const Otrlines = params.ollines.length - pickline - 1;
      const distance = parseInt(ollineObj.distance);
      if (distance >= 0 && distance < 10 && params.index == 0) {
        params.speed = 1;
      } else if (distance >= 10 && distance < 50 && params.index == 0) {
        if (Otrlines == 0) {
          params.speed = 5;
        } else if (Otrlines >= 1 && Otrlines < 3) {
          params.speed = 3;
        } else if (Otrlines >= 3 && Otrlines < 6) {
          params.speed = 1;
        } else if (Otrlines >= 6) {
          params.speed = 0.5;
        }
      } else if (distance >= 50 && distance < 100 && params.index == 0) {
        if (Otrlines == 0) {
          params.speed = 8;
        } else if (Otrlines >= 1 && Otrlines < 3) {
          params.speed = 5;
        } else if (Otrlines >= 3 && Otrlines < 6) {
          params.speed = 2;
        } else if (Otrlines >= 6) {
          params.speed = 1;
        }
      } else if (distance >= 100 && distance < 200 && params.index == 0) {
        if (Otrlines == 0) {
          params.speed = 11;
        } else if (Otrlines >= 1 && Otrlines < 3) {
          params.speed = 8;
        } else if (Otrlines >= 3 && Otrlines < 6) {
          params.speed = 5;
        } else if (Otrlines >= 6) {
          params.speed = 1;
        }
      } else if (distance >= 200 && distance < 300 && params.index == 0) {
        if (Otrlines == 0) {
          params.speed = 14;
        } else if (Otrlines >= 1 && Otrlines < 3) {
          params.speed = 11;
        } else if (Otrlines >= 3 && Otrlines < 6) {
          params.speed = 8;
        } else if (Otrlines >= 6) {
          params.speed = 5;
        }
      } else if (distance >= 300 && distance < 600 && params.index == 0) {
        if (Otrlines == 0) {
          params.speed = 18;
        } else if (Otrlines >= 1 && Otrlines < 3) {
          params.speed = 14;
        } else if (Otrlines >= 3 && Otrlines < 6) {
          params.speed = 11;
        } else if (Otrlines >= 6) {
          params.speed = 8;
        }
      } else if (distance >= 600 && params.index == 0) {
        if (Otrlines == 0) {
          params.speed = 20;
        } else if (Otrlines >= 1 && Otrlines < 3) {
          params.speed = 18;
        } else if (Otrlines >= 3 && Otrlines < 6) {
          params.speed = 14;
        } else if (Otrlines >= 6) {
          params.speed = 11;
        }
      }
      // params.speed = ollineObj.consumeTime != 0 ? (distance * 1000) / ollineObj.consumeTime : 1;
      // var coorindex = (1 / (params.speed * fps)) * params.index;
      let coorindex = (35 / ollineObj.consumeTime) * params.index; //固定渲染30帧
      // console.log(params.speed, ollineObj.consumeTime, params.index, coorindex);
      if (distance == 0) coorindex = 1;
      if (coorindex > 1) coorindex = 1;
      const allCoords = ollineObj.line.getCoordinates();
      const pointCoords = ollineObj.line.getCoordinateAt(coorindex);
      const startCoords = ollineObj.line.getCoordinateAt(
        (35 / ollineObj.consumeTime) * (params.index > 0 ? params.index - 1 : params.index),
      );

      const point = new Point(pointCoords);
      const endCoords = point.clone().transform('EPSG:3857', 'EPSG:4326');
      const start = new Point(startCoords).transform('EPSG:3857', 'EPSG:4326').getCoordinates();
      const end = endCoords.getCoordinates();

      //更新动画帧数
      if (
        pointCoords[0] == allCoords[allCoords.length - 1][0] &&
        pointCoords[1] == allCoords[allCoords.length - 1][1]
      ) {
        //到达该线段终点
        //params.stop = true;
        params.pickLine += 1;
        if (params.ollines[params.pickLine]) {
          params.index = 0;
        } else {
          params.index = 0;
          params.pasue = true;
        }
      } else {
        params.index = params.index + 1;
      }
      // 同一个调派单的车辆同步更新位置
      const feaId = feature.getId();
      const carIds = gpsModel.getSynchronizationUpdateCars(feaId);
      carIds?.forEach((item) => {
        const carFeature = gpsModel.option.currentTrackSource.getFeatureById(item);
        if (carFeature) {
          carFeature.getGeometry().setCoordinates(pointCoords);
          let realPassRoute = carFeature.get('realPassRoute');
          if (!realPassRoute) {
            realPassRoute = [];
          }
          if (coorindex != 0 && coorindex != 1) {
            realPassRoute.push(pointCoords);
          }
          carFeature.set('realPassRoute', realPassRoute);
          if (carFeature.getStyle()) {
            const dx = end[0] - start[0];
            // var dy = end[1] - start[1];
            const dy = start[1] - end[1];
            const rotation = Math.atan2(dy, dx);
            if (rotation != 0) {
              carFeature.set('direction', rotation);
            }
          }
          // var feStyle = getStyle("track",feature.get("name"));
          // feature.setStyle(feStyle);

          // KLD.updatePassRoute(PS, feature.getId(), realPassRoute);
          const overlay = carFeature.get('overlay');
          if (overlay) {
            try {
              overlay.setPosition(point.getCoordinates());
            } catch (error) {
              // 处理报错
              console.error('Overlay位置计算出错：', error);
            }
          }
        }
      });
    }
  },
  /**
   * 通过标注找到标注到的关联警情
   */
  pointToAlarmId: function (distance, point) {
    const jjdids = [];
    // const routeKey = [];
    const obj = gpsModel.anaysisResultObj;
    if (obj) {
      const currentAlarmid = [];
      const fts = gpsModel.option.currentTrackSource.getFeatures();
      if (fts) {
        fts.forEach((d) => {
          const id = d.get('type') == 'AlarmPosition' ? d.getId() : '';
          if (id) {
            currentAlarmid.push(id);
          }
        });
      }
      for (const key in obj) {
        try {
          const p = obj[key]?.plans;
          const jjdid = obj[key]?.carInfos?.alarmInfo?.id;
          if (p[0] && jjdid && currentAlarmid.indexOf(jjdid) > -1) {
            let routeBuffer = p[0].routeBuffer;

            const geom = p[0].geometry.clone().transform('EPSG:3857', 'EPSG:4326');
            const turfGeom = getTurfGeom(geom);
            const zqExtent = turf.buffer(turfGeom, distance, { units: 'meters' });
            const jsonFormat = new GeoJSON();
            routeBuffer = jsonFormat.readFeature(zqExtent);
            if (routeBuffer) {
              const isInArea = containsGeometry(point, routeBuffer.getGeometry());
              if (isInArea && jjdids.indexOf(jjdid) <= -1) {
                jjdids.push(jjdid);
              }
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    console.log('标注点位所在警情路线:' + jjdids.join(','));
    return jjdids;
  },
  /** 判断车辆是否出界
   * @param routeFeature 路径
   * @param carInfo 车辆位置
   */
  carCompareWithArea: function (routeFeature, carInfo) {
    const carPt = new Point([carInfo.x, carInfo.y]);
    let routeBuffer = gpsModel.anaysisResultObj[carInfo.carId]?.plans[0]?.routeBuffer;
    if (!routeBuffer) {
      const geom = routeFeature.clone().getGeometry().transform('EPSG:3857', 'EPSG:4326');
      const turfGeom = getTurfGeom(geom);
      const zqExtent = turf.buffer(turfGeom, carOffsetTolerance, { units: 'meters' });
      const jsonFormat = new GeoJSON();
      routeBuffer = jsonFormat.readFeature(zqExtent);
      //模拟缓冲带位置，用于判断是否越界
      // const buffer = gpsModel.option.currentTrackSource.getFeatureById('buffer');
      // if (!buffer) {
      //     const routeBuffer1 = routeBuffer.clone();
      //     const routeBuffer2 = routeBuffer1.getGeometry().transform('EPSG:4326', 'EPSG:3857');
      //     routeBuffer1.setId('buffer');
      //     routeBuffer1.setStyle(FeatureHandler.getStyle(gpsModel.option.map, 'drawtool_area'));
      //     gpsModel.option.currentTrackSource.addFeature(routeBuffer1);
      // }
      gpsModel.anaysisResultObj[carInfo.carId].plans[0]['routeBuffer'] = routeBuffer;
    }
    const isInArea = containsGeometry(carPt, routeBuffer.getGeometry());
    return isInArea;
  },
};
