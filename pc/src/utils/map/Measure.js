import Draw from 'ol/interaction/Draw';
import { unByKey } from 'ol/Observable.js';
import Overlay from 'ol/Overlay';
import { getArea, getLength } from 'ol/sphere.js';
import { LineString, Polygon } from 'ol/geom.js';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import { GUID } from './mapCommon';
import { FeatureHandler } from './FeatureHandler';

const continuePolygonMsg = '继续点击绘制多边形';
/**
 * Message to show when the user is drawing a line.
 * @type {string}
 */
const continueLineMsg = '';

const Measure = {
  measureTooltipElement: null,
  helpTooltipElement: null,
  measureTooltip: null,
  helpTooltip: null,
  measure(map, drawLayer, measureType) {
    /**
     * Currently drawn feature.
     * @type {module:ol/Feature~Feature}
     */
    let sketch;
    const popupcloser = document.createElement('a');
    popupcloser.href = 'javascript:void(0);';
    popupcloser.classList.add('ol-popup-closer');

    const createHelpTooltip = function (map) {
      if (Measure.helpTooltipElement) {
        Measure.helpTooltipElement.parentNode.removeChild(Measure.helpTooltipElement);
      }
      Measure.helpTooltipElement = document.createElement('div');
      Measure.helpTooltipElement.className = 'ol-tooltip hidden';
      Measure.helpTooltip = new Overlay({
        element: Measure.helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left',
      });
      map.addOverlay(Measure.helpTooltip);
    };
    const createMeasureTooltip = function (map, id) {
      Measure.measureTooltipElement = document.createElement('div');
      Measure.measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
      popupcloser.id = id;
      // eslint-disable-next-line no-undef
      Measure.measureTooltip = new Overlay({
        id: id ? id : 'defaultId',
        element: Measure.measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center',
      });
      // eslint-disable-next-line no-undef
      map.addOverlay(Measure.measureTooltip);
    };

    createMeasureTooltip(map);
    createHelpTooltip(map);

    /**
     * Handle pointer move.
     * @param {module:ol/MapBrowserEvent~MapBrowserEvent} evt The event.
     */
    const pointerMoveHandler = function (evt) {
      if (evt.dragging) {
        return;
      }
      /** @type {string} */
      let helpMsg = '请点击开始绘制';
      if (sketch) {
        const geom = sketch.getGeometry();
        if (geom instanceof Polygon) {
          helpMsg = continuePolygonMsg;
        } else if (geom instanceof LineString) {
          helpMsg = continueLineMsg;
        }
      }
    };

    map.on('pointermove', pointerMoveHandler);

    map.getViewport().addEventListener('mouseout', function () {
      Measure.helpTooltipElement.classList.add('hidden');
    });

    let draw;
    const formatLength = function (line) {
      const length = getLength(line);
      let output = '';
      if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
      } else {
        output = Math.round(length * 100) / 100 + ' ' + 'm';
      }
      return output;
    };
    const formatArea = function (polygon) {
      const area = getArea(polygon);
      let output;
      if (area > 10000) {
        output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
      } else {
        output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
      }
      return output;
    };

    //clear
    popupcloser.onclick = function (e) {
      // map.getOverlays().clear(); //tjh 2021-09-26 不清除所有overlay,只清除显示测量结果的overlay
      const dom = e.currentTarget;
      const id = $(dom).attr('id');
      const measureOverlay = map.getOverlayById(id);
      const feature = drawLayer.getSource().getFeatureById(id);
      drawLayer.getSource().removeFeature(feature);
      map.removeOverlay(measureOverlay);
      // PS.drawAction = false; //关闭后，地图的绘制状态为false
    };

    function addInteraction() {
      const type = measureType == 'area' ? 'Polygon' : 'LineString';
      draw = new Draw({
        type: type,
        style: new Style({
          fill: new Fill({
            color: 'rgba(0, 166, 111, 0.20)',
          }),
          stroke: new Stroke({
            color: 'rgba(0, 166, 111, 1)',
            lineDash: [10, 10],
            width: 2,
          }),
        }),
      });
      map.addInteraction(draw);

      let listener;
      draw.on(
        'drawstart',
        function (evt) {
          // set sketch
          sketch = evt.feature;
          /** @type {module:ol/coordinate~Coordinate|undefined} */
          let tooltipCoord = evt.coordinate;
          listener = sketch.getGeometry().on('change', function (evt) {
            const geom = evt.target;
            let output;
            if (geom instanceof Polygon) {
              output = formatArea(geom);
              tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof LineString) {
              output = formatLength(geom);
              tooltipCoord = geom.getLastCoordinate();
            }
            Measure.measureTooltipElement.innerHTML = output;
            Measure.measureTooltip.setPosition(tooltipCoord);
          });
        },
        this,
      );
      draw.on(
        'drawend',
        function (e) {
          const id = GUID();
          e.feature.setId(id);
          let style = null;
          //删除默认overlay
          const overlay = map.getOverlayById('defaultId');
          if (overlay) {
            map.removeOverlay(overlay);
          }
          // unset sketch
          sketch = null;
          // unset tooltip so that a new one can be created
          Measure.measureTooltipElement = null;
          createMeasureTooltip(map, id);
          const geom = e.feature.getGeometry();
          let tooltipCoord = geom.getCoordinates();
          let output;
          if (geom instanceof Polygon) {
            style = FeatureHandler.getStyle(map, 'drawtool_area');
            output = formatArea(geom);
            tooltipCoord = geom.getInteriorPoint().getCoordinates();
          } else if (geom instanceof LineString) {
            style = FeatureHandler.getStyle(map, 'drawtool_distance');
            output = formatLength(geom);
            tooltipCoord = geom.getLastCoordinate();
          }
          e.feature.setStyle(style);
          e.feature.set('overlay', Measure.measureTooltip);
          drawLayer.getSource().addFeature(e.feature);
          Measure.measureTooltipElement.innerHTML = output;
          Measure.measureTooltipElement.appendChild(popupcloser);
          Measure.measureTooltip.setPosition(tooltipCoord);
          Measure.measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
          Measure.measureTooltip.setOffset([0, -7]);
          unByKey(listener);
          map.un('pointermove', pointerMoveHandler);
          map.removeInteraction(draw);
          Measure.helpTooltipElement.classList.add('hidden');
        },
        this,
      );
    }
    // 量测调用
    addInteraction();
  },
};
export { Measure };
