import axios from '@/service/mapReq';
import * as ol from 'ol';
import { GeoJSON } from "ol/format";
import { MultiPolygon, Polygon } from 'ol/geom';
import { Style, Fill, Stroke } from 'ol/style';

// 获取图层数量
export const getLayerCount = async (layer, cql = {}) => {
  return new Promise((resolve, reject) => {
    axios({
      url: "/wfs",
      method: "GET",
      data: {
        service: "WFS",
        version: "1.0.0",
        request: "GetFeature",
        typeName: !layer.includes('gis:') ? `gis:${layer}` : layer,
        maxFeatures: 1,
        outputFormat: "application/json",
        ...cql,
      },
    }).then((res) => {
      resolve(res?.totalFeatures ?? 0)
    }).catch((err) => {
      reject(err);
    });
  });
};


/**
   * 获取行政区域描边points集合 或 当前行政区域行政中心点
   * @param {行政区域代码} code
   */
export const getXZCodePoints = async (code, type = 'points') => {
  const res = await axios({
    url: `ows?service=WFS&version=1.0.0&request=GetFeature&typeName=gis:b_county_polygon&maxFeatures=2&outputFormat=application%2Fjson&CQL_FILTER=admincode=%27${code}%27 or parentid=%27${code}%27`,
    method: "get",
    timeout: 15000,
    contentType: "application/json",
  });
  let jsonFormat = new GeoJSON();
  let features = jsonFormat.readFeatures(res);
  features.forEach((item) => {
    item.getGeometry().transform("EPSG:4326", "EPSG:3857");
  });
  if (type === 'points') {
    // 获取行政区描边集合
    return features.map(f => f.getGeometry().getCoordinates());
  } else if (type === 'code_point') {
    // 获取行政区中心点经纬度
    const extent = features[0].getGeometry().getExtent();
    return ol.extent.getCenter(extent);
  }
}

/**
 * 根据行政区域code进行描边颜色遮罩
 * @param {string} code 行政区域代码
 * @param {ol.layer.Vector} layer 目标图层
 * @param {string} [fillColor='rgba(255,0,0,0.1)'] 填充颜色
 * @param {string} [strokeColor='#00E7FF'] 描边颜色
 * @returns {Promise<Array<ol.Feature>>} 返回添加到图层的 feature 集合
 */
export const setXZQYMask = async (code, layer, fillColor = 'rgba(255,0,0,0)', strokeColor = '#00E7FF', width) => {
  if (!code || !layer) return [];
  try {
    const polygons = await getXZCodePoints(code);
    const features = [];
    polygons.forEach(coords => {
      let geometry;
      if (Array.isArray(coords[0][0])) {
        geometry = new MultiPolygon(coords);
      } else {
        geometry = new Polygon(coords);
      }
      const feature = new ol.Feature({ geometry });
      feature.setStyle(new Style({

        zIndex: 1003,
        stroke: new Stroke({
          color: strokeColor,
          width: width ? width : 4
        }),
        fill: new Fill({
          color: fillColor
        })
      }));
      layer.getSource().addFeature(feature);
      features.push(feature);
    });
    return features;
  } catch (e) {
    console.error('setXZQYMask error:', e);
    return [];
  }
};

// 分类加载警情数据上图
export const alarmAddFeatureByType = (layer, data) => {
  // data.forEach(item => {
  //   alarmAddFeature(layer, item);
  // });
}