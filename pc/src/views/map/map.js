import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import TileGrid from 'ol/tilegrid/TileGrid';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON.js';
import Modify from 'ol/interaction/Modify.js';
import Snap from 'ol/interaction/Snap.js';
import {bbox as bboxStrategy} from 'ol/loadingstrategy.js';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import Circle from 'ol/geom/Circle';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';
import Text from 'ol/style/Text';
import Draw from 'ol/interaction/Draw';
import { getWidth } from 'ol/extent';
import { get as getProjection } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';
import { CoordinateUtil, convertUp } from './to'
import { useMapDrawing } from './map-draw'
/**
 * 统一的地图模块
 * 整合了原有的地图功能，提供完整的图层管理、标记控制、交互操作等
 * 坐标系统一处理：所有地图相关经纬度输入均视为 GCJ-02, 数据源为wgs84，内部统一转换为 EPSG:3857
 */
export class FireMap {
  constructor() {
    // 地图实例
    this.map = null;
    this.mapContainer = null;
    this.view = null;
    this.center = null;
    this.overlay = null;
    this.base = null;

    // 图层管理
    this.layers = {};
    this.markers = new Map();
    this.overlays = new Map();
    this.routes = {};
    this.centerMarker = null;
    this.drawInteraction = null;
    this.drawType = '';
    this.currentFeature = null;
    this.currentRadius = null;
    this.currentArea = 0;

    this.currentCenter = '';
    this.currentPolygon = '';
    // Modified by YeFeng
    this.currentGeom = undefined;
    this.fenceFeatureLayer = undefined
    this.fenceFeatureSource = undefined
    this.dwFeatureLayer = undefined
    this.dwFeatureSource = undefined
    this.modifyInteraction = null;
    this.snapInteraction = null;

    this.ORDOS_CENTER = [108.319, 22.811]; // 南宁坐标

    // 地图配置
    this.config = {
      center: this.ORDOS_CENTER, // GCJ-02
      zoom: 15,
      minZoom: 3,
      maxZoom: 18
    };

    // 样式定义
    this.styles = {
      centerMarker: new Style({
        image: new CircleStyle({
          radius: 9,
          fill: new Fill({ color: "rgba(239,68,68,0.95)" }),
          stroke: new Stroke({ color: "blue", width: 3 }),
        }),
      }),
      drawSource: new Style({
        stroke: new Stroke({
          color: "blue",
          width: 2,
        }),
        fill: new Fill({
          color: "rgba(0, 0, 255, 0.1)",
        }),
      }),
    };

    // 事件监听器
    this.eventListeners = new Map();
  }

  /**
   * 设置参数
   */
  setParams(params = {}) {
    if (typeof params !== 'object') return;
    Object.keys(params).forEach((key) => {
      this[key] = params[key];
    });
  }

  /**
   * 初始化地图
   */
  init(props, containerId = 'main-map') {
    try {
      this.mapContainer = document.getElementById(containerId);
      if (!this.mapContainer) {
        throw new Error(`Map container not found: ${containerId}`);
      }

      // 创建地图实例
      this.createMap(props);

      // 初始化图层
      this.initLayers(props);

      // 初始化draw数据
      // this.initDrawData();

      // 设置draws
      // this.setDrawInteraction();

      // 设置事件监听
      this.setupEventListeners();

      // 通知地图已准备就绪
      // this.notifyMapReady();

      console.log('🗺️ FireMap 初始化完成');

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize FireMap:', error);
      return false;
    }
  }

  /**
   * 创建地图实例 offline
   */
  createMap(props) {
    // 创建基础地图图层（高德地图）改为离线地图
    this.base = new TileLayer({
      source: new XYZ({
        url: 'https://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}',
        projection: 'EPSG:3857',
        tileGrid: new TileGrid({
          origin: window.MAPCONFIG?.offlineMap_Offset || [-20038195.342789244, 20037310.342789244], // 脱离环境时需调用bMapOffset/findBMapOffset
          resolutions: Array.from({ length: this.config.maxZoom }, (_, z) => getWidth(getProjection('EPSG:3857').getExtent()) / 256 / Math.pow(2, z)),
        }),
      }),
    });

    if(props.row.dljd && props.row.dlwd) {
      this.config.center[0] = props.row.dljd
      this.config.center[1] = props.row.dlwd
    }
    // 创建视图
    this.center = CoordinateUtil?.wgs84To3857(this.config.center[0], this.config.center[1]) || [12958388, 4852834];
    this.view = new View({
      center: this.center,
      zoom: this.config.zoom,
      minZoom: this.config.minZoom,
      maxZoom: this.config.maxZoom,
    });

    this.map = new Map({
      target: this.mapContainer,
      view: this.view,
      controls: defaultControls({
        zoom: true,
        attribution: false,
      }),
    });

    // 添加基础图层
    this.map.addLayer(this.base);

    // 设置地图事件
    this.setupMapEvents();
  }

  /**
   * 初始化业务图层
   */
  initFencePoint(props) {   
    if(!props.row.dljd || !props.row.dlwd) return

    let dwFeatures= []
    let data =[
      {
        name: props.row.zddwmc,
        x: props.row.dljd,
        y: props.row.dlwd
      }    
    ]
    data.forEach(item => {       
        let point = new Point([item.x, item.y])   
        const feature = new Feature({        
              geometry: point.transform("EPSG:4326", "EPSG:3857")
          });
        const attributes = new Object();       
        attributes["name"] = item.name; 
        feature.setProperties(attributes);
        dwFeatures.push(feature)
    })
    this.dwFeatureSource = new VectorSource({
          features: dwFeatures     
        })

    const pointStyle = new Style({   
      image: new CircleStyle({
        radius: 8, 
        fill: new Fill({ color: 'rgba(255, 0, 0, 0.8)' }), 
        stroke: new Stroke({ color: 'rgba(0, 255, 0, 0.8)', width: 1 }) 
      })
    });

    this.dwFeatureLayer = new VectorLayer({
        layerName:"dwFeatureLayer",
        source: this.dwFeatureSource,
        style: pointStyle,  
        zIndex:1000,
    });
    this.map.addLayer(this.dwFeatureLayer);
  }

  initLayers(props) {
    // Modified by YeFeng
    this.initFencePoint(props)
    this.fenceFeatureSource = new VectorSource({
          format: new GeoJSON(),
          url: function (extent) {
            return (
              'http://192.168.170.222:8083/geoserver/wfs?service=WFS&' +
              'version=1.0.0&request=GetFeature&typename=gis:srvc_electronic_fence&' +
              'outputFormat=application/json&srsname=EPSG:3857&' +
              'bbox=' +
              extent.join(',') +
              ',EPSG:3857'
            );
          },
          strategy: bboxStrategy,
        })
    this.fenceFeatureLayer = new VectorLayer({
        layerName:"fenceFeatureLayer",
        source: this.fenceFeatureSource,
        style: {
          'stroke-width': 0.75,
          'stroke-color': 'blue',
          'fill-color': 'rgba(100,100,100,0.5)',
        },
        minResolution: 0,   
        maxResolution: 100 , //12
        zIndex:1000,
    });
    this.map.addLayer(this.fenceFeatureLayer);

    const layerNames = [
      'drawSource', 'centerMarker'
    ];

    layerNames.forEach((layerName, index) => {
      this.layers[layerName] = new VectorLayer({
        source: new VectorSource(),
        visible: true,
        zIndex: 1000 + index,
        layerName: layerName,
        style: this.styles[layerName],
      });
      this.map.addLayer(this.layers[layerName]);
    });
    console.log('📍 地图图层初始化完成:', Object.keys(this.layers));
    this.map.on('click', (event) => {  
      const features = this.map.getFeaturesAtPixel(event.pixel, {
        layers: [this.dwFeatureLayer],
        //hitTolerance: 10
      });
      if (features && features.length > 0) {      
        const feature = features[0];
        const resolution = this.map.getView().getResolution();    
      } 
    });
  }

  /**
   * draw交互
   */
  setDrawInteraction(type) {
    this.removeDrawInteraction();
    this.drawType = ['', 'semicircle', 'rectangle', 'polygon'][type ?? 0];
    // this.drawType = ['', 'semicircle', 'rectangle', 'polygon'][window.StateManager?.state?.data?.replay?.formData?.fenceType ?? 0];

    let geometryType;
    switch (this.drawType) {
      case "semicircle":
        geometryType = "Circle";
        break;
      case "rectangle":
        geometryType = "Circle";
        break;
      case "polygon":
        geometryType = "Polygon";
        break;
      default:
        geometryType = "Polygon";
    }

    this.drawInteraction = new Draw({
      source: this.layers['drawSource'].getSource(),
      type: geometryType,
      geometryFunction: this.drawType === "rectangle" ? useMapDrawing(this.map).createBox?.() : undefined,
    });

    if (this.drawType === "semicircle") {
      this.drawInteraction.on("drawstart", (evt) => {
        const sketch = evt.feature;
        const listener = sketch.getGeometry().on("change", (e) => {
          const geom = e.target;
          const radius = geom.getRadius();
          if (window.StateManager?.state?.data?.replay?.fenceInfo?.[2]) {
            window.StateManager.state.data.replay.fenceInfo[2].value = convertUp(radius) ?? '';
          }
        });
        sketch.set("listener", listener);
      });
    }

    this.drawInteraction.on("drawend", useMapDrawing(this.map).handleDrawEnd);
    // Modified by YeFeng
    this.modifyInteraction = new Modify({source: this.layers['drawSource'].getSource()});
    this.modifyInteraction.on("modifyend", useMapDrawing(this.map).handleModifyEnd);
    this.map.addInteraction(this.modifyInteraction);
    this.map.addInteraction(this.drawInteraction);
    this.snapInteraction = new Snap({source: this.layers['drawSource'].getSource()});
    this.map.addInteraction(this.snapInteraction);
  }

  removeDrawInteraction() {
    if (this.drawInteraction) {
      this.map.removeInteraction(this.drawInteraction);
      // Modified by YeFeng
      this.map.removeInteraction(this.modifyInteraction);
      this.map.removeInteraction(this.snapInteraction);
      this.modifyInteraction = null;
      this.snapInteraction = null;
      this.drawInteraction = null;
    }
  }

  addCenterMarker() {
    const coordinate = this.map.getView().getCenter();
    if (this.centerMarker) {
      this.centerMarker.setGeometry(null);
      this.layers['centerMarker'].getSource().removeFeature(this.centerMarker);
    }
    this.centerMarker = new Feature({
      geometry: new Point(coordinate),
    });
    this.centerMarker.setStyle(this.styles['centerMarker']);
    this.layers['centerMarker'].getSource().addFeature(this.centerMarker);
  }

  removeCenterMarker() {
    if (this.centerMarker) {
      this.centerMarker.setGeometry(null);
      this.layers['centerMarker'].getSource().removeFeature(this.centerMarker);
      this.centerMarker = null;
    }
  }

  /**
   * 设置地图事件
   */
  setupMapEvents() {
    // 地图点击事件
    this.map.on('click', (evt) => {
      this.handleMapClick(evt);
    });

    // 地图hover事件
    this.map.on('pointermove', (evt) => {
      const pixel = this.map.getEventPixel(evt.originalEvent);
      const hit = this.map.hasFeatureAtPixel(pixel);
      this.map.getTarget().style.cursor = hit ? 'pointer' : '';
      if (hit) {
        const feature = this.map.forEachFeatureAtPixel(pixel, (feature) => feature);
        if (feature && !feature.get('eventPassthrough')) {
          // this.handleMapPointermove({
          //   feature: feature,
          //   coordinate: evt.coordinate
          // });
          // this.emit('feature-hover', {
          //   feature: feature,
          //   coordinate: evt.coordinate
          // });
        }
      }
    });
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 监听来自父页面的消息
    window.addEventListener('message', (event) => {
      this.handleParentMessage(event);
    });
  }

  /**
   * 处理地图点击
   */
  handleMapClick(evt) {
    const feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => feature);
  }

  /**
   * 销毁地图
   */
  destroy() {
    if (this.map) {
      this.map.setTarget(null);
      this.map = null;
    }

    // 清理引用
    this.layers = {};
    this.markers.clear();
    this.overlays.clear();
    this.routes = {};

    console.log('🗺️ FireMap destroyed');
  }

  // 放大地图
  zoomIn() {
    this.view.setZoom(this.view.getZoom() + 1);
  }

  // 缩小地图
  zoomOut() {
    this.view.setZoom(this.view.getZoom() - 1);
  }

  clearAll() {
    this.layers['drawSource'].getSource()?.clear()    
    //clearCenterMarker()
  }
}

// 默认导出实例
const fireMap = new FireMap();
export default fireMap;
