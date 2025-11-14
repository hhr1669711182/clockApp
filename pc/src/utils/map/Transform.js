const xPI = (3.14159265358979324 * 3000.0) / 180.0;
const PI = 3.1415926535897932384626;
const a = 6378245.0;
const ee = 0.00669342162296594323;

const Transform = {
  bd09togcj02: function (lon, lat) {
    lon = +lon;
    lat = +lat;
    const x = lon - 0.0065;
    const y = lat - 0.006;
    const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * xPI);
    const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * xPI);
    const resultLng = z * Math.cos(theta);
    const resultLat = z * Math.sin(theta);
    return [resultLng, resultLat];
  },
  gcj02tobd09: function (lng, lat) {
    lat = +lat;
    lng = +lng;
    const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * xPI);
    const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * xPI);
    const resultLng = z * Math.cos(theta) + 0.0065;
    const resultLat = z * Math.sin(theta) + 0.006;
    return [resultLng, resultLat];
  },
  wgs84togcj02: function (lng, lat) {
    lat = +lat;
    lng = +lng;
    if (this.outOfchina(lng, lat)) {
      return [lng, lat];
    } else {
      let dlat = this.transformlat(lng - 105.0, lat - 35.0);
      let dlng = this.transformlng(lng - 105.0, lat - 35.0);
      const radlat = (lat / 180.0) * PI;
      let magic = Math.sin(radlat);
      magic = 1 - ee * magic * magic;
      const sqrtmagic = Math.sqrt(magic);
      dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * PI);
      dlng = (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * PI);
      const mglat = lat + dlat;
      const mglng = lng + dlng;
      return [mglng, mglat];
    }
  },
  gcj02towgs84: function (lng, lat) {
    lat = +lat;
    lng = +lng;
    if (this.outOfchina(lng, lat)) {
      return [lng, lat];
    } else {
      let dlat = this.transformlat(lng - 105.0, lat - 35.0);
      let dlng = this.transformlng(lng - 105.0, lat - 35.0);
      const radlat = (lat / 180.0) * PI;
      let magic = Math.sin(radlat);
      magic = 1 - ee * magic * magic;
      const sqrtmagic = Math.sqrt(magic);
      dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * PI);
      dlng = (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * PI);
      const mglat = lat + dlat;
      const mglng = lng + dlng;
      return [lng * 2 - mglng, lat * 2 - mglat];
    }
  },
  transformlat: function (lng, lat) {
    lat = +lat;
    lng = +lng;
    let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0;
    ret += ((20.0 * Math.sin(lat * PI) + 40.0 * Math.sin((lat / 3.0) * PI)) * 2.0) / 3.0;
    ret += ((160.0 * Math.sin((lat / 12.0) * PI) + 320 * Math.sin((lat * PI) / 30.0)) * 2.0) / 3.0;
    return ret;
  },
  transformlng: function (lng, lat) {
    lat = +lat;
    lng = +lng;
    let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0;
    ret += ((20.0 * Math.sin(lng * PI) + 40.0 * Math.sin((lng / 3.0) * PI)) * 2.0) / 3.0;
    ret += ((150.0 * Math.sin((lng / 12.0) * PI) + 300.0 * Math.sin((lng / 30.0) * PI)) * 2.0) / 3.0;
    return ret;
  },
  outOfchina: function (lng, lat) {
    lat = +lat;
    lng = +lng;
    // 纬度3.86~53.55,经度73.66~135.05
    return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
  },
  /**
   * 经纬度转为莫卡托坐标
   * @params lng 经度
   * @params lat 纬度
   * @returns mercator 返回空间对象
   *
   */
  lonlat2mercator: function (lng, lat) {
    lng = parseFloat(lng);
    lat = parseFloat(lat);
    const mercator = {
      x: 0,
      y: 0,
    };
    const x = (lng * 20037508.34) / 180;
    let y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
    y = (y * 20037508.34) / 180;
    mercator.x = x;
    mercator.y = y;
    return mercator;
  },
};

export { Transform };
