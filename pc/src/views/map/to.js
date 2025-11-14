
/**
 * 坐标转换工具
 */
import { toLonLat, fromLonLat } from 'ol/proj';

export const CoordinateUtil = {
    // 判断是否在中国范围内
    outOfChina(lng, lat) {
        return (
            lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271
        );
    },

    // WGS84 -> GCJ-02
    wgs84Togcj02(lng, lat) {
        if (this.outOfChina(lng, lat)) {
            return [lng, lat];
        }
        const a = 6378245.0;
        const ee = 0.00669342162296594323;
        const transformLat = (x, y) => {
            let ret =
                -100.0 +
                2.0 * x +
                3.0 * y +
                0.2 * y * y +
                0.1 * x * y +
                0.2 * Math.sqrt(Math.abs(x));
            ret +=
                ((20.0 * Math.sin(6.0 * x * Math.PI) +
                    20.0 * Math.sin(2.0 * x * Math.PI)) *
                    2.0) /
                3.0;
            ret +=
                ((20.0 * Math.sin(y * Math.PI) +
                    40.0 * Math.sin((y / 3.0) * Math.PI)) *
                    2.0) /
                3.0;
            ret +=
                ((160.0 * Math.sin((y / 12.0) * Math.PI) +
                    320 * Math.sin((y * Math.PI) / 30.0)) *
                    2.0) /
                3.0;
            return ret;
        };
        const transformLng = (x, y) => {
            let ret =
                300.0 +
                x +
                2.0 * y +
                0.1 * x * x +
                0.1 * x * y +
                0.1 * Math.sqrt(Math.abs(x));
            ret +=
                ((20.0 * Math.sin(6.0 * x * Math.PI) +
                    20.0 * Math.sin(2.0 * x * Math.PI)) *
                    2.0) /
                3.0;
            ret +=
                ((20.0 * Math.sin(x * Math.PI) +
                    40.0 * Math.sin((x / 3.0) * Math.PI)) *
                    2.0) /
                3.0;
            ret +=
                ((150.0 * Math.sin((x / 12.0) * Math.PI) +
                    300.0 * Math.sin((x / 30.0) * Math.PI)) *
                    2.0) /
                3.0;
            return ret;
        };
        let dLat = transformLat(lng - 105.0, lat - 35.0);
        let dLng = transformLng(lng - 105.0, lat - 35.0);
        const radLat = (lat / 180.0) * Math.PI;
        let magic = Math.sin(radLat);
        magic = 1 - ee * magic * magic;
        const sqrtMagic = Math.sqrt(magic);
        dLat =
            (dLat * 180.0) /
            (((a * (1 - ee)) / (magic * sqrtMagic)) * Math.PI);
        dLng =
            (dLng * 180.0) /
            ((a / sqrtMagic) * Math.cos(radLat) * Math.PI);
        const mgLat = lat + dLat;
        const mgLng = lng + dLng;
        return [mgLng, mgLat];
    },

    // GCJ-02 -> WGS84
    gcj02Towgs84(lng, lat) {
        if (this.outOfChina(lng, lat)) {
            return [lng, lat];
        }
        const a = 6378245.0;
        const ee = 0.00669342162296594323;
        const transformLat = (x, y) => {
            let ret =
                -100.0 +
                2.0 * x +
                3.0 * y +
                0.2 * y * y +
                0.1 * x * y +
                0.2 * Math.sqrt(Math.abs(x));
            ret +=
                ((20.0 * Math.sin(6.0 * x * Math.PI) +
                    20.0 * Math.sin(2.0 * x * Math.PI)) *
                    2.0) /
                3.0;
            ret +=
                ((20.0 * Math.sin(y * Math.PI) +
                    40.0 * Math.sin((y / 3.0) * Math.PI)) *
                    2.0) /
                3.0;
            ret +=
                ((160.0 * Math.sin((y / 12.0) * Math.PI) +
                    320 * Math.sin((y * Math.PI) / 30.0)) *
                    2.0) /
                3.0;
            return ret;
        };
        const transformLng = (x, y) => {
            let ret =
                300.0 +
                x +
                2.0 * y +
                0.1 * x * x +
                0.1 * x * y +
                0.1 * Math.sqrt(Math.abs(x));
            ret +=
                ((20.0 * Math.sin(6.0 * x * Math.PI) +
                    20.0 * Math.sin(2.0 * x * Math.PI)) *
                    2.0) /
                3.0;
            ret +=
                ((20.0 * Math.sin(x * Math.PI) +
                    40.0 * Math.sin((x / 3.0) * Math.PI)) *
                    2.0) /
                3.0;
            ret +=
                ((150.0 * Math.sin((x / 12.0) * Math.PI) +
                    300.0 * Math.sin((x / 30.0) * Math.PI)) *
                    2.0) /
                3.0;
            return ret;
        };
        let dLat = transformLat(lng - 105.0, lat - 35.0);
        let dLng = transformLng(lng - 105.0, lat - 35.0);
        const radLat = (lat / 180.0) * Math.PI;
        let magic = Math.sin(radLat);
        magic = 1 - ee * magic * magic;
        const sqrtMagic = Math.sqrt(magic);
        dLat =
            (dLat * 180.0) /
            (((a * (1 - ee)) / (magic * sqrtMagic)) * Math.PI);
        dLng =
            (dLng * 180.0) /
            ((a / sqrtMagic) * Math.cos(radLat) * Math.PI);
        const mgLat = lat + dLat;
        const mgLng = lng + dLng;
        return [lng * 2 - mgLng, lat * 2 - mgLat];
    },

    // GCJ-02 -> EPSG:3857
    gcj02To3857(lon, lat) {
        const [wgsLon, wgsLat] = this.gcj02Towgs84(lon, lat);
        return new fromLonLat([wgsLon, wgsLat]);
    },

    // WGS84 -> EPSG:3857 
    wgs84To3857(lon, lat) {
        return new fromLonLat([lon, lat]);
    },

    //EPSG:3857  -> WGS84
    epsg3857ToWgs84(lon, lat) {
        return new toLonLat([lon, lat]);
    },
};

/**
 * 单位转换：米、平方米、立方米
 * @param {number} value      - 需要转换的数值
 * @param {string} dimension  - 维度标识：'length'|'area'|'volume'
 * @param {number} step       - 转换步长，默认1000
 * @returns {number}          转换后的数值，保留 6 位小数；非法输入返回 0
 */
export const convertUp = (value, dimension = 'length', configs = {}) => {
    const config = {
        step: 1000,
        point: 2,
        prefixText: '约 ',
        oUnit: '米',
        tUnit: '千',
        pUnit: '',
        showSuffix: true,
        showPrefix: true,
        ...configs,
    };
    let { step, point, prefixText, oUnit, tUnit, pUnit, showSuffix, showPrefix } = config;

    if (typeof value !== 'number' || isNaN(value) || value < 0) return 0;
    if (typeof step !== 'number' || isNaN(step) || step <= 0) return 0;

    let factor;
    switch (dimension) {
        case 'length':               // 米 → 千米
            factor = step;
            pUnit = '';
            break;
        case 'area':                 // 平方米 → 平方千米
            factor = step * step;
            pUnit = '平';
            break;
        case 'volume':               // 立方米 → 立方千米
            factor = step * step * step;
            pUnit = '立';
            break;
        default:
            return 0;
    }
    let suffixUnit = pUnit + oUnit;
    let val = value.toFixed(point)
    if (value < factor) return showPrefix ? val + suffixUnit : val;

    val = Number((value / factor).toFixed(point));
    suffixUnit = pUnit + tUnit + oUnit;
    if (showSuffix && showPrefix) {
        return prefixText + val + suffixUnit;
    } else if (showSuffix) {
        return val + suffixUnit;
    } else if (showPrefix) {
        return oUnit + val;
    }

    return val;
}