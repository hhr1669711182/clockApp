/**
 * 高德地图接口
 *
 * @author 刘永奎
 * @time 2023年06月26日 下午16:00:43
 */

import Projection from 'ol/proj/Projection';
import { addProjection, addCoordinateTransforms } from 'ol/proj';
import { XYZ } from 'ol/source';
import Attribution from 'ol/control/Attribution';
// import { openMapServer } from '@/service/address'

const openMapServer = '/dev/tile'; // geoserver地址

// var ol = require('openlayers');
class AMap extends XYZ {
  constructor(options) {
    const forEachPoint = function (func) {
      return function (input, optOutput, optDimension) {
        const len = input.length;
        const dimension = optDimension || 2;
        let output;
        if (optOutput) {
          output = optOutput;
        } else {
          if (dimension !== 2) {
            output = input.slice();
          } else {
            output = new Array(len);
          }
        }
        for (let offset = 0; offset < len; offset += dimension) {
          func(input, output, offset);
        }
        return output;
      };
    };
    const gcj02 = {};
    const PI = Math.PI;
    const AXIS = 6378245.0;
    const OFFSET = 0.00669342162296594323; // (a^2 - b^2) / a^2

    function delta(wgLon, wgLat) {
      let dLat = transformLat(wgLon - 105.0, wgLat - 35.0);
      let dLon = transformLon(wgLon - 105.0, wgLat - 35.0);
      const radLat = (wgLat / 180.0) * PI;
      let magic = Math.sin(radLat);
      magic = 1 - OFFSET * magic * magic;
      const sqrtMagic = Math.sqrt(magic);
      dLat = (dLat * 180.0) / (((AXIS * (1 - OFFSET)) / (magic * sqrtMagic)) * PI);
      dLon = (dLon * 180.0) / ((AXIS / sqrtMagic) * Math.cos(radLat) * PI);
      return [dLon, dLat];
    }

    function outOfChina(lon, lat) {
      if (lon < 72.004 || lon > 137.8347) {
        return true;
      }
      if (lat < 0.8293 || lat > 55.8271) {
        return true;
      }
      return false;
    }

    function transformLat(x, y) {
      let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
      ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
      ret += ((20.0 * Math.sin(y * PI) + 40.0 * Math.sin((y / 3.0) * PI)) * 2.0) / 3.0;
      ret += ((160.0 * Math.sin((y / 12.0) * PI) + 320 * Math.sin((y * PI) / 30.0)) * 2.0) / 3.0;
      return ret;
    }

    function transformLon(x, y) {
      let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
      ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
      ret += ((20.0 * Math.sin(x * PI) + 40.0 * Math.sin((x / 3.0) * PI)) * 2.0) / 3.0;
      ret += ((150.0 * Math.sin((x / 12.0) * PI) + 300.0 * Math.sin((x / 30.0) * PI)) * 2.0) / 3.0;
      return ret;
    }

    gcj02.toWGS84 = forEachPoint(function (input, output, offset) {
      let lng = input[offset];
      let lat = input[offset + 1];
      if (!outOfChina(lng, lat)) {
        const deltaD = delta(lng, lat);
        lng = lng - deltaD[0];
        lat = lat - deltaD[1];
      }
      output[offset] = lng;
      output[offset + 1] = lat;
    });

    gcj02.fromWGS84 = forEachPoint(function (input, output, offset) {
      let lng = input[offset];
      let lat = input[offset + 1];
      if (!outOfChina(lng, lat)) {
        const deltaD = delta(lng, lat);
        lng = lng + deltaD[0];
        lat = lat + deltaD[1];
      }
      output[offset] = lng;
      output[offset + 1] = lat;
    });

    const sphericalMercator = {};

    const RADIUS = 6378137;
    const MAX_LATITUDE = 85.0511287798;
    const RAD_PER_DEG = Math.PI / 180;

    sphericalMercator.forward = forEachPoint(function (input, output, offset) {
      const lat = Math.max(Math.min(MAX_LATITUDE, input[offset + 1]), -MAX_LATITUDE);
      const sin = Math.sin(lat * RAD_PER_DEG);

      output[offset] = RADIUS * input[offset] * RAD_PER_DEG;
      output[offset + 1] = (RADIUS * Math.log((1 + sin) / (1 - sin))) / 2;
    });

    sphericalMercator.inverse = forEachPoint(function (input, output, offset) {
      output[offset] = input[offset] / RADIUS / RAD_PER_DEG;
      output[offset + 1] = (2 * Math.atan(Math.exp(input[offset + 1] / RADIUS)) - Math.PI / 2) / RAD_PER_DEG;
    });

    const projzh = {};
    projzh.ll2gmerc = function (input, optOutput, optDimension) {
      const output = gcj02.fromWGS84(input, optOutput, optDimension);
      return projzh.ll2smerc(output, output, optDimension);
    };
    projzh.gmerc2ll = function (input, optOutput, optDimension) {
      const output = projzh.smerc2ll(input, input, optDimension);
      return gcj02.toWGS84(output, optOutput, optDimension);
    };
    projzh.smerc2gmerc = function (input, optOutput, optDimension) {
      let output = projzh.smerc2ll(input, input, optDimension);
      output = gcj02.fromWGS84(output, output, optDimension);
      return projzh.ll2smerc(output, output, optDimension);
    };
    projzh.gmerc2smerc = function (input, optOutput, optDimension) {
      let output = projzh.smerc2ll(input, input, optDimension);
      output = gcj02.toWGS84(output, output, optDimension);
      return projzh.ll2smerc(output, output, optDimension);
    };

    projzh.ll2smerc = sphericalMercator.forward;
    projzh.smerc2ll = sphericalMercator.inverse;

    const gcj02Extent = [-20037508.342789244, -20037508.342789244, 20037508.342789244, 20037508.342789244];
    const gcjMecator = new Projection({
      code: 'GCJ-02',
      extent: gcj02Extent,
      units: 'm',
    });
    addProjection(gcjMecator);
    addCoordinateTransforms('EPSG:4326', gcjMecator, projzh.ll2gmerc, projzh.gmerc2ll);
    addCoordinateTransforms('EPSG:3857', gcjMecator, projzh.smerc2gmerc, projzh.gmerc2smerc);
    const option = options || {};
    //   let attributions
    let corss = 'anonymous';
    //   if (option.attributions !== undefined) {
    //     attributions = option.attributions
    //   } else {
    //     attributions = [AMap.ATTRIBUTION]
    //   }
    let url;
    switch (option.mapType) {
      case 'img':
      case 'sat':
        url = 'http://wprd0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}';
        break;
      case 'base':
        url = 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cnzh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}';
        break;
      case 'traffic':
        url = 'http://tm.amap.com/trafficengine/mapabc/traffictile?v=1.0&;t=1&x={x}&y={y}&z={z}';
        corss = null;
        break;
      case 'offlinev2':
        url = openMapServer + 'tile/baseMap/{z}/{x}/{y}.png';
        corss = null;
        break;
      case 'offlinev11':
        url = option.mapUrl + 'tile/baseMapnn/{z}/{x}/{y}.png';
        corss = null;
        break;
      case 'dark':
        url =
          // 'https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}';
          'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}';
        corss = null;
        break;
    }
    if (option.mapType === 'offlinev') {
      super({
        // cacheSize: option.cacheSize,
        // projection:gcjMecator,//离线地图切片文件的坐标系就是web墨卡托（3857）不用做偏移校正也不用做坐标系转换
        tileUrlFunction: function (tileCoord) {
          const z = tileCoord[0];
          const x = tileCoord[1];
          const y = Math.pow(2, z) + tileCoord[2] - 1;
          return openMapServer + 'tile/baseMap/' + z + '/' + x + '/' + (y + 1) + '.png';
        },
        wrapX: option.wrapX !== undefined ? option.wrapX : true,
      });
    }
    else if (option.mapType === 'offlinev1') {
      super({
        cacheSize: option.cacheSize,
        projection: gcjMecator,
        tileUrlFunction: function (tileCoord) {
          const z = tileCoord[0];
          const x = tileCoord[1];
          const y = Math.pow(2, z) - tileCoord[2] - 1;
          return option.mapUrl + 'tile/baseMap/' + z + '/' + x + '/' + y + '.png';
        },
        tileLoadFunction: function (image, src) {
          const img = new Image();
          img.setAttribute('crossOrigin', 'anonymous');
          img.onload = function () {
            const canvas = document.createElement('canvas');
            const w = img.width;
            const h = img.height;
            canvas.width = w;
            canvas.height = h;
            const context = canvas.getContext('2d');
            context.filter =
              'grayscale(80%) invert(100%) sepia(65%) hue-rotate(180deg) saturate(1600%) brightness(50%) contrast(95%)';
            // context.filter = 'sepia(100%)'
            context.drawImage(img, 0, 0, w, h, 0, 0, w, h);
            image.getImage().src = canvas.toDataURL('image/png');
          };
          img.src = src;
        },
        wrapX: options.wrapX !== undefined ? options.wrapX : true,
        crossOrigin: 'anonymous'  //跨域
      });
    }
    else {
      super({
        crossOrigin: corss, // 跨域
        cacheSize: option.cacheSize,
        projection: gcjMecator,
        url: url,
        tileLoadFunction: function (image, src) {
          if (option.mapType == 'dark') {
            // 使用滤镜 将白色修改为深色
            const img = new Image();
            // img.crossOrigin = ''
            // 设置图片不从缓存取，从缓存取可能会出现跨域，导致加载失败
            img.setAttribute('crossOrigin', 'anonymous');
            img.onload = function () {
              const canvas = document.createElement('canvas');
              const w = img.width;
              const h = img.height;
              canvas.width = w;
              canvas.height = h;
              const context = canvas.getContext('2d');
              context.filter =
               'grayscale(80%) invert(100%) sepia(65%) hue-rotate(160deg) saturate(1600%) brightness(70%) contrast(85%)';
                // 'grayscale(80%) invert(100%) sepia(65%) hue-rotate(180deg) saturate(1600%) brightness(90%) contrast(85%)';
              // context.filter = 'grayscale(100%) invert(150%) brightness(150%) hue-rotate(180deg) opacity(100%) sepia(20%) saturate(100%) hue-rotate(100deg) brightness(0.6) hue-rotate(220deg) saturate(150%)';
              context.drawImage(img, 0, 0, w, h, 0, 0, w, h);
              image.getImage().src = canvas.toDataURL('image/png');
            };
            img.src = src;
          } else if (option.mapType === 'traffic') {
            image.getImage().src = src + '&&t=' + new Date().getTime();
          } else {
            image.getImage().src = src;
          }

          // if (option.mapType === 'dark') {
          //     if (image.getTileCoord()[0] < 18) {
          //         image.getImage().src = src;
          //       } else {
          //         image.getImage().src = image.getImage().src;
          //     }
          // }

          // image.getImage().onerror = function (e) {
          //     console.log(this);
          //     // 图片加载失败时触发回调
          //     console.log('Tile loading failed:', src);
          //     // 进行二次请求加载
          //     const retrySrc = generateRetryURL(src);
          //     this.src = retrySrc;
          //     window.global.map.render();
          // };
        },
        wrapX: option.wrapX !== undefined ? option.wrapX : true,
      });
    }
    // 生成二次请求的加载URL，例如添加时间戳
    function generateRetryURL(src) {
      const timestamp = new Date().getTime() + 100;
      return src + '?timestamp=' + timestamp;
    }
  }
}
export default AMap;
// inherits(AMap, XYZ);
// AMap.ATTRIBUTION = new Attribution({
// html: '&copy; <a class="ol-attribution-amap" ' + 'href="http://ditu.amap.com/">' + '高德地图</a>',
// });
