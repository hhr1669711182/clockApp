/**
 * 创建并返回一个可复用的聚合数据源 hooks
 * @param {ol/Map} map - openlayers 地图实例
 * @param {Array<ol/Feature>} features - 原始要素数组
 * @param {Object} [options] - 可选配置
 * @param {number} [options.initDistance=40] - 初始聚合距离
 * @param {'step'|'linear'|'exponential'} [options.strategy='step'] - 动态距离计算策略
 * @returns {{ clusterSource: ol/source/Cluster, destroy: Function }}
 */
export function useClusterSource(map, features, options = {}) {
    const {
        initDistance = 40,
        strategy = 'step'
    } = options;
    if (!map || !features) return null;

    // 1. 创建聚合数据源
    const clusterSource = new ol.source.Cluster({
        distance: initDistance,
        source: new ol.source.Vector({ features })
    });

    // 2. 策略函数：阶梯式
    function getStepDistance(zoom) {
        if (zoom >= 15) return 20;
        if (zoom >= 10) return 40;
        if (zoom >= 5) return 60;
        return 80;
    }

    // 3. 策略函数：线性插值（基于分辨率）
    function getLinearDistance(resolution) {
        const minDistance = 10;
        const maxDistance = 100;
        const minResolution = 0.1;
        const maxResolution = 100;
        const normalized = (resolution - minResolution) / (maxResolution - minResolution);
        const distance = minDistance + (maxDistance - minDistance) * normalized;
        return Math.max(minDistance, Math.min(maxDistance, distance));
    }

    // 4. 策略函数：指数衰减（基于 zoom）
    function getExponentialDistance(zoom) {
        const minZoom = 1;
        const maxZoom = 20;
        const minDistance = 15;
        const maxDistance = 120;
        const normalizedZoom = (zoom - minZoom) / (maxZoom - minZoom);
        const distance = maxDistance * Math.pow(0.5, normalizedZoom * 3);
        return Math.max(minDistance, Math.min(maxDistance, distance));
    }

    // 5. 选择策略
    const strategyFn = {
        step: () => getStepDistance(map.getView().getZoom()),
        linear: () => getLinearDistance(map.getView().getResolution()),
        exponential: () => getExponentialDistance(map.getView().getZoom())
    }[strategy];

    // 6. 监听分辨率变化，动态更新聚合距离
    function onResolutionChange() {
        const newDistance = strategyFn();
        clusterSource.setDistance(newDistance);
    }

    map.getView().on('change:resolution', onResolutionChange);

    // 7. 销毁函数：移除监听
    function destroy() {
        map.getView().un('change:resolution', onResolutionChange);
    }

    return { clusterSource, destroy };
}


/**
 * 使用示例：
 * 
 * import { useClusterSource } from '@/utils/map/Cluster';
 * 
 * // 1. 准备原始要素（假设已有）
 * const features = [
 *   new ol.Feature(new ol.geom.Point([116.4, 39.9])),
 *   new ol.Feature(new ol.geom.Point([116.41, 39.91])),
 *   ...
 * ];
 * 
 * // 2. 创建聚合数据源（阶梯策略）
 * const { clusterSource, destroy } = useClusterSource(map, features, {
 *   initDistance: 40,
 *   strategy: 'step'
 * });
 * 
 * // 3. 创建聚合图层并添加到地图
 * const clusterLayer = new ol.layer.Vector({
 *   source: clusterSource,
 *   style: (feature) => {
 *     const size = feature.get('features').length;
 *     return new ol.style.Style({
 *       image: new ol.style.Circle({
 *         radius: 10 + size * 2,
 *         stroke: new ol.style.Stroke({ color: '#fff', width: 2 }),
 *         fill: new ol.style.Fill({ color: '#3399CC' })
 *       }),
 *       text: new ol.style.Text({
 *         text: size.toString(),
 *         fill: new ol.style.Fill({ color: '#fff' })
 *       })
 *     });
 *   }
 * });
 * 
 * map.addLayer(clusterLayer);
 * 
 * // 4. 组件卸载时销毁
 * // destroy();
 */

