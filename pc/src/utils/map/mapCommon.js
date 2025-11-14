/*
 * @Description: 地图公共方法
 * @Author: liuyongkui
 * @Date: 2023-09-14 21:10:47
 * @LastEditors: liuyongkui
 * @LastEditTime: 2024-03-07 16:05:34
 */

import { Transform } from './Transform';
import * as turf from '@turf/turf';
import GeoJSON from 'ol/format/GeoJSON';
/**
 * 判断坐标值是否合法
 * @param {*} gisx
 * @param {*} gisy
 * @returns
 */
export const validGis = function (gisx, gisy) {
  let result = true;
  const matchLon =
    // eslint-disable-next-line
    /^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,20})\.\d{0,20})|(\d|[1-9]\d|1[0-7]\d|0{1,20})|180\.0{0,20}|180)$/;
  // eslint-disable-next-line
  const matchLat = /^(\-|\+)?([0-8]?\d{1}\.\d{0,20}|90\.0{0,20}|[0-8]?\d{1}|90)$/;
  if (!gisx || !gisy) {
    return !result;
  }

  let result1 = true;
  let result2 = true;
  if (isNaN(gisx) || isNaN(gisy) || !matchLon.test(gisx) || !matchLat.test(gisy)) {
    result1 = false;
  }

  if (gisx > 135.5 || gisx < 73.1 || gisy < 18 || gisy > 53.5) {
    result2 = false;
  }
  result = result1 && result2;
  return result;
};

/**
 * 生成GUID
 *
 * @returns
 */
export const GUID = function () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * 字符串类型坐标串转换成数值类型并进行坐标系转换
 * @param {*} string
 * @returns
 */
export const coordsTransform = function (string) {
  const newCoor = [];
  if (typeof string === 'string') {
    const array = string.split(';');
    array.forEach(function (item) {
      const baseCoor = item.split(',');
      const coor = Transform.gcj02towgs84(Number(baseCoor[0]), Number(baseCoor[1]));
      newCoor.push(coor);
    });
  } else if (Array.isArray(string)) {
    string.forEach(function (item) {
      const coor = Transform.gcj02towgs84(Number(item[0]), Number(item[1]));
      newCoor.push(coor);
    });
  }

  return newCoor;
};

/**
 * 缩放到制定空间要素
 * @params mode
 * @params feature 要素(也可以是多个要素组成的数组)
 *
 */
export const zoomToFeature = function (map, feature) {
  let extent = null;
  if (!feature || !map) {
    //判断是否
    return;
  }
  if (Object.prototype.toString.call(feature) === '[object Array]') {
    extent = getUnionedExtent(feature);
  } else {
    extent = feature.getGeometry().getExtent();
  }
  if (extent[0] == Infinity) {
    return;
  } else {
    // extent = [extent[0] - 2000, extent[1] - 800, extent[2] + 800, extent[3] + 800];
  }
  let resolution = map.getView().getResolutionForExtent(extent);
  map.getView().fit(extent, {
    duration: 1000,//动画持续时间（毫秒），实现平滑过渡效果‌
    nearest: true,//当设为true时，优先选择最接近的缩放级别而非包含整个范围，适用于低分辨率设备适配‌
    constrainResolution: false,//默认为true，若设为false允许非整数缩放级别，实现更精确的范围适配‌
    resolution: resolution,//避免因分辨率限制导致的适配异常‌
    padding: [150, 100, 200, 100],//设置视图边距（像素数组，顺序为[上,右,下,左]），避免要素紧贴地图边缘‌
  });
};
//计算最小范围
export const getUnionedExtent = function (features) {
  if (features?.length > 0) {
    let extent = null;
    features.forEach(function (feature) {
      const geomExtent = feature.getGeometry().getExtent();
      if (!extent) {
        extent = {
          xmin: geomExtent[0],
          ymin: geomExtent[1],
          xmax: geomExtent[2],
          ymax: geomExtent[3],
        };
      } else {
        if (extent.xmin > geomExtent[0]) extent.xmin = geomExtent[0];
        if (extent.ymin > geomExtent[1]) extent.ymin = geomExtent[1];
        if (extent.xmax < geomExtent[2]) extent.xmax = geomExtent[2];
        if (extent.ymax < geomExtent[3]) extent.ymax = geomExtent[3];
      }
    });
    return [extent.xmin, extent.ymin, extent.xmax, extent.ymax];
  }
};
/**
 * 按照属性排序
 * @param {*} list
 */
export const sortByAttribute = function (list, attribute) {
  const sortedArray = list.sort(compare(attribute));
  return sortedArray;
};
// 排序方法
export const compare = function (property) {
  //property:根据什么属性排序
  return function (a, b) {
    const value1 = a[property];
    const value2 = b[property];
    /*
     * value2 - value1; ——> 降序
     * value1 - value2; ——> 升序
     */
    return value1 - value2; //升序排序
  };
};
export const sortByCllx = function (list) {
  const sortedArray = list.sort(compareCllx());
  return sortedArray;
};
// 排序方法
export const compareCllx = function () {
  //property:根据什么属性排序
  return function (a, b) {
    let result = 1;
    if (a?.cllxdm == '21010313' || a?.cllxdm == '21010311') {
      result = -1;
    } else if (a?.cllxdm == b?.cllxdm) {
      result = 0;
    }
    return result; //升序排序
  };
};

/**
 * 几何图形比较，判断一个几何图形是否在另一个几何图形内
 * @param geomA
 * @param geomB
 * @returns {*}
 */
export const containsGeometry = function (geomA, geomB) {
  const coor = geomA.getCoordinates();
  return geomB.containsXY(coor[0], coor[1]);
};

/** 线路所经辖区
 * @param {线路坐标} lineCoords
 * @param {辖区列表} xqList
 */
export const intersectXQ = function (lineCoords, xqList) {
  const xqIdList = [];
  const turfLine = turf.lineString(lineCoords);
  xqList.forEach((item) => {
    const baseGeom = item.getGeometry().clone();
    baseGeom.transform('EPSG:3857', 'EPSG:4326');
    for (let i = 0; i < lineCoords.length; i++) {
      if (baseGeom.intersectsCoordinate(lineCoords[i])) {
        const xqid = item.getProperties().ssjgid;
        if (!xqIdList.includes(xqid)) {
          xqIdList.push(xqid);
        }
        break;
      }
    }
  });
  return xqIdList;
};
/**
 * 获取turf格式geom
 * @param {*} geom
 * @returns
 */
export const getTurfGeom = function (geom) {
  const geomType = geom.getType();
  let turfGeom = '';
  switch (geomType) {
    case 'Point':
      turfGeom = turf.point(geom.getCoordinates());
      break;
    case 'LineString':
      turfGeom = turf.lineString(geom.getCoordinates());
      break;
    case 'MultiPolygon':
      turfGeom = turf.polygon(geom.getPolygons()[0].getCoordinates()[0]);
    case 'Polygon':
      turfGeom = turf.polygon(geom.getCoordinates());
      break;
  }
  return turfGeom;
};

/**
 * 计算最小的时间戳
 * @param {*} dateStrings
 * @returns
 */
export const getMinTimestamp = function (dateStrings) {
  // 初始值设为 Infinity，确保比较时能找到较小的值
  let minTimestamp = Infinity;

  // 遍历日期时间字符串数组
  for (let i = 0; i < dateStrings.length; i++) {
    // 转换为时间戳
    const timestamp = new Date(dateStrings[i]).getTime();

    // 更新最小时间戳
    if (timestamp < minTimestamp) {
      minTimestamp = timestamp;
    }
  }

  return minTimestamp;
};
