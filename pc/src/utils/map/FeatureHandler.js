// src/utils/map/FeatureHandler.js

import { Style, Icon, Fill, Stroke, Text, Circle } from 'ol/style';
import { Point, LineString, Polygon, MultiPolygon } from 'ol/geom';
import { useMapStore } from "@/store/useMapStore";

// 图标资源导入
import arrowIcon from '@/style/images/arrow.png';
import trackIcon from '@/style/images/track.png';
import trackDisableIcon from '@/style/images/track-disable.png';
import commandCarIcon from '@/style/images/commandCar.png';
import startPointIcon from '@/style/images/start_point.png';
import endPointIcon from '@/style/images/end_point.png';
import policeIcon from '@/style/images/police.png';
import eventIcon from '@/style/images/event.png';

// 报警图标导入
import hzpjIcon from '@/style/images/svg/hzpj.svg';
import hzpj_eIcon from '@/style/images/svg/hzpj_e.svg';
import qxjyIcon from '@/style/images/svg/qxjy.svg';
import qxjy_eIcon from '@/style/images/svg/qxjy_e.svg';
import fkpbIcon from '@/style/images/svg/fkpb.svg';
import fkpb_eIcon from '@/style/images/svg/fkpb_e.svg';
import gwzqIcon from '@/style/images/svg/gwzq.svg';
import gwzq_eIcon from '@/style/images/svg/gwzq_e.svg';
import shjzIcon from '@/style/images/svg/shjz.svg';
import shjz_eIcon from '@/style/images/svg/shjz_e.svg';
import qtjyIcon from '@/style/images/svg/qtjy.svg';
import qtjy_eIcon from '@/style/images/svg/qtjy_e.svg';

// 历史|今日报警（抢险救援、社会救助、着火点）图标导入
// import zhdAlarm from '@/style/images/mapAlarm/alarm.svg';
import zhdAlarm from '@/style/images/mapAlarm/zhd.png';
import zhdAlarmMerge from '@/style/images/mapAlarm/zhd_merge.png';
import _qxjyAlarm from '@/style/images/mapAlarm/qxjy.png';
import _qxjyAlarmMerge from '@/style/images/mapAlarm/qxjy_merge.png';
import _shjzAlarm from '@/style/images/mapAlarm/shjz.png';
import _shjzAlarmMerge from '@/style/images/mapAlarm/shjz_merge.png';

// 聚合图标导入
import m1Icon from '@/style/images/m1.png';
import m2Icon from '@/style/images/m2.png';
import m3Icon from '@/style/images/m3.png';
import m4Icon from '@/style/images/m4.png';
import hzpjAlarm from '@/style/images/alarm/hzpj.png';
import qxjyAlarm from '@/style/images/alarm/qxjy.png';
import fkpbAlarm from '@/style/images/alarm/fkpb.png';
import gwzqAlarm from '@/style/images/alarm/gwzq.png';
import shjzAlarm from '@/style/images/alarm/shjz.png';
import qtjyAlarm from '@/style/images/alarm/qtjy.png';

import { ref } from 'vue';

const alarmZoomIcons = [m1Icon, m2Icon, m3Icon, m4Icon];
let indexAlarmIcon = ref({});
const interval = 1000;
const setIntervals = ref({});
const intVal = (feature) => {
  setTimeout(() => {
    if (!feature.getStyle()) return;
    const icon = feature.getStyle()?.getImage();
    if (!indexAlarmIcon.value[feature.getId()]) {
      indexAlarmIcon.value[feature.getId()] = 0;
    }
    setIntervals.value[feature.getId()] = setInterval(() => {
      if (icon && typeof icon.setSrc === 'function') {
        indexAlarmIcon.value[feature.getId()] = (indexAlarmIcon.value[feature.getId()] + 1) % alarmZoomIcons.length;
        feature.getStyle()?.getImage().setSrc(alarmZoomIcons[indexAlarmIcon.value[feature.getId()]]);
      }
    }, interval)
  }, 500);
};

const minUnitRouteColor = {
  未知: '#2899DA',
  畅通: '#179356',
  缓行: '#FFCA0C',
  拥堵: '#D12929',
  严重拥堵: '#870A0A',
};

const roadColorFill = {
  高速一大队: 'rgb(231,3,86,0.3)',
  高速二大队: 'rgba(204,204,2, 0.3)',
  高速三大队: 'rgba(169,81,205, 0.3)',
  高速五大队: 'rgba(51,41,255, 0.3)',
  环城大队: 'rgba(0,167,59, 0.3)',
};

const roadColorStroke = {
  高速一大队: 'rgb(231,3,86,1)',
  高速二大队: 'rgba(204,204,2, 1)',
  高速三大队: 'rgba(169,81,205, 1)',
  高速五大队: 'rgba(51,41,255, 1)',
  环城大队: 'rgba(0,167,59, 1)',
};

const styleCache = {};

export const FeatureHandler = {
  getStyle: function (map, type, name, otherParams = { src: '' }) {
    let style;
    switch (type) {
      case 'trackRouteArrow':
        {
          style = function (feature, resolution) {
            const geometry = feature.getGeometry();
            const length = geometry.getLength();
            const zindex = 3;
            const tmcs = feature.get('tmcs');
            const styles = [
              new Style({
                stroke: new Stroke({
                  color: '#00FFFF',
                  width: 10,
                }),
                zIndex: zindex,
              }),
            ];
            tmcs.forEach(function (item) {
              const arrowStyle = new Style({
                geometry: item['tmc_polyline'],
                stroke: new Stroke({
                  color: minUnitRouteColor[item['tmc_status']],
                  width: 8,
                }),
                zIndex: zindex + 1,
              });
              styles.push(arrowStyle);
            });

            resolution = map.getView().getResolution();
            const step_length = 60 * resolution;
            const totalCount = parseInt(length / step_length);
            const j = 1 / totalCount;
            const arr = [];
            for (let i = 0; i < totalCount; i++) {
              const coords = geometry.getCoordinateAt(j * i);
              arr.push(coords);
            }

            geometry.forEachSegment(function (start, end) {
              const dx = end[0] - start[0];
              const dy = end[1] - start[1];
              const rotation = Math.atan2(dy, dx);

              const line = new LineString([start, end]);
              for (let i = 0; i < arr.length; i++) {
                if (line.intersectsExtent([arr[i][0], arr[i][1], arr[i][0], arr[i][1]])) {
                  styles.push(
                    new Style({
                      geometry: new Point(arr[i]),
                      image: new Icon({
                        src: arrowIcon,
                        anchor: [0.75, 0.5],
                        rotateWithView: true,
                        rotation: -rotation,
                      }),
                      zIndex: zindex + 2,
                    }),
                  );
                }
              }
            });
            return styles;
          };
        }
        break;

      case 'track':
        {
          style = function (feature, resolution) {
            const direction = feature.get('direction') ? feature.get('direction') : 90;
            let src = feature.get('online') ? trackIcon : trackDisableIcon;
            if (feature.get('isHaveCommand')) {
              src = commandCarIcon;
            }
            const functionStyle = new Style({
              image: new Icon({
                opacity: 1,
                src: src,
                imgSize: [42, 42],
              }),
              fill: new Fill({
                color: 'rgba(255, 0, 0, 0.1)',
              }),
              stroke: new Stroke({
                color: 'rgba(255, 0, 0,0.6)',
                width: 2,
              }),
              zIndex: 10004,
            });
            if (direction) {
              functionStyle.getImage().setRotation(Number(direction));
            }
            return functionStyle;
          };
        }
        break;

      case 'start':
        {
          style = new Style({
            image: new Icon({
              anchor: [21, 42],
              anchorXUnits: 'pixels',
              anchorYUnits: 'pixels',
              opacity: 1,
              src: startPointIcon,
              imgSize: [42, 42],
            }),
            text: new Text({
              text: name,
              offsetY: -25,
              font: 'bold 13px sans-serif',
              backgroundFill: new Fill({
                color: '#1212de',
              }),
              backgroundStroke: new Stroke({
                color: '#ffffff',
                width: 1,
              }),
              fill: new Fill({
                color: '#fff',
                stroke: new Stroke({
                  color: '#fff',
                  width: 5,
                }),
              }),
            }),
            zIndex: 10005,
          });
        }
        break;

      case 'end':
        {
          style = new Style({
            image: new Icon({
              anchor: [21, 42],
              anchorXUnits: 'pixels',
              anchorYUnits: 'pixels',
              opacity: 1,
              src: endPointIcon,
              imgSize: [42, 42],
            }),
            text: new Text({
              text: name,
              offsetY: -50,
              backgroundFill: new Fill({
                color: '#1A2C50',
              }),
              textAlign: 'center',
              textBaseline: 'bottom',
              padding: [5, 5, 5, 5],
              font: 'normal 13px sans-serif',
              backgroundStroke: new Stroke({
                color: '#128ae1',
                width: 1,
              }),
              fill: new Fill({
                color: '#fff',
                stroke: new Stroke({
                  color: '#fff',
                  width: 5,
                }),
              }),
            }),
            zIndex: 10005,
          });
        }
        break;

      case 'police':
        {
          style = new Style({
            image: new Icon({
              anchor: [21, 42],
              anchorXUnits: 'pixels',
              anchorYUnits: 'pixels',
              opacity: 1,
              src: policeIcon,
              imgSize: [42, 42],
            }),
            zIndex: 10005,
          });
        }
        break;
      case 'zxcl':
        {
          style = new Style({
            image: new Icon({
              anchor: [21, 42],
              anchorXUnits: 'pixels',
              anchorYUnits: 'pixels',
              opacity: 1,
              src: trackIcon,
              imgSize: [59, 32],
            }),
            zIndex: 10005,
          });
        }
        break;
      case 'event':
        {
          style = new Style({
            image: new Icon({
              anchor: [21, 42],
              anchorXUnits: 'pixels',
              anchorYUnits: 'pixels',
              opacity: 1,
              src: eventIcon,
              imgSize: [42, 42],
            }),
            zIndex: 10005,
          });
        }
        break;

      case 'alarm':
        {
          let src;
          switch (name) {
            case '火灾扑救':
              src = hzpjIcon;
              break;
            case '火灾扑救e':
              src = hzpj_eIcon;
              break;
            case '抢险救援':
              src = qxjyIcon;
              break;
            case '抢险救援e':
              src = qxjy_eIcon;
              break;
            case '反恐排爆':
              src = fkpbIcon;
              break;
            case '公务执勤':
              src = gwzqIcon;
              break;
            case '社会救助':
              src = shjzIcon;
              break;
            case '其他':
              src = qtjyIcon;
              break;
            case '反恐排爆e':
              src = fkpb_eIcon;
              break;
            case '公务执勤e':
              src = gwzq_eIcon;
              break;
            case '社会救助e':
              src = shjz_eIcon;
              break;
            case '其他e':
              src = qtjy_eIcon;
              break;
          }

          style = new Style({
            image: new Icon({
              anchor: [21, 42],
              anchorXUnits: 'pixels',
              anchorYUnits: 'pixels',
              opacity: 1,
              src: src,
              imgSize: [79, 78],
            }),
            zIndex: 10005,
          });
        }
        break;

      case 'fireCluster':
        {
          var size = name.get('features').length;
          if (size == 1) {
            const type = name.get('features')[0].get('typeName');
            const hover = name.get('features')[0].get('hover');
            const focus = name.get('features')[0].get('focus');
            let scale = hover ? 1 : 0.8;
            if (focus) {
              scale = 1;
            }
            let src;
            switch (type) {
              case '火灾扑救':
                src = hzpjAlarm;
                break;
              case '抢险救援':
                src = qxjyAlarm;
                break;
              case '反恐排爆':
                src = fkpbAlarm;
                break;
              case '公务执勤':
                src = gwzqAlarm;
                break;
              case '社会救助':
                src = shjzAlarm;
                break;
              default:
                src = qtjyAlarm;
                break;
            }

            style = new Style({
              image: new Icon({
                anchor: [21, 42],
                anchorXUnits: 'pixels',
                anchorYUnits: 'pixels',
                opacity: 1,
                src: src,
                imgSize: [79, 78],
                scale: scale,
              }),
              zIndex: 10005,
            });
          } else {
            style = styleCache[size];
            if (!style) {
              let src;
              let p, p1, p2, p3;
              if (size >= 1000) {
                src = new URL('@/style/images/m4.png', import.meta.url).href;
                p = 90;
                p1 = 89;
                p2 = 45;
                p3 = 48;
              } else if (size >= 100 && size < 1000) {
                src = new URL('@/style/images/m3.png', import.meta.url).href;
                p = 78;
                p1 = 77;
                p2 = 39;
                p3 = 41;
              } else if (size >= 50 && size < 100) {
                src = new URL('@/style/images/m2.png', import.meta.url).href;
                p = 66;
                p1 = 65;
                p2 = 33;
                p3 = 35;
              } else if (size < 50) {
                src = new URL('@/style/images/m1.png', import.meta.url).href;
                p = 56;
                p1 = 55;
                p2 = 28;
                p3 = 29;
              }

              style = new Style({
                image: new Icon({
                  offset: [0, 0],
                  opacity: 1.0,
                  rotateWithView: true,
                  rotation: 0.0,
                  scale: 1.0,
                  size: [p, p1],
                  anchor: [p2, p3],
                  anchorXUnits: 'pixels',
                  anchorYUnits: 'pixels',
                  src: src,
                }),
                text: new Text({
                  text: size.toString(),
                  font: '14px Arial',
                  fill: new Fill({
                    color: '#000',
                  }),
                }),
              });
              styleCache[size] = style;
            }
          }
        }
        break;
      case 'fireCluster_new':
        {
          const size = name.get('features').length;
          const isSizeOne = size === 1;
          let type = name.get('features')[0].get('alarmType');
          const hover = name.get('features')[0].get('hover');
          const focus = name.get('features')[0].get('focus');
          let scale = hover ? 1.2 : 0.8;
          if (focus) scale = 1.2;
          let src = qtjyAlarm;

          // if (otherParams.src) {
          //   src = otherParams.src;
          //   type = 'xxxx';
          // }

          type = type.replace('e', '');
          switch (type) {
            case '10000':
              src = !isSizeOne ? zhdAlarmMerge : (useMapStore().currentFrame || zhdAlarm);
              break;
            case '20000':
              src = !isSizeOne ? _qxjyAlarmMerge : _qxjyAlarm;
              break;
            case '50000':
              src = !isSizeOne ? _shjzAlarmMerge : _shjzAlarm;
              break;
          }

          if (isSizeOne) {
            style = new Style({
              image: new Icon({
                anchor: [0.5, 1],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                opacity: 1,
                src: src,
                imgSize: [34, 65],
                scale: scale,
              }),
              zIndex: 10005,
            });
          } else {
            style = styleCache[size + type];
            if (!style) {
              let p, p1, p2, p3;
              p = 74;
              p1 = 65;
              p2 = 17;
              p3 = 55;

              style = new Style({
                image: new Icon({
                  offset: [0, 0],
                  opacity: 1.0,
                  rotateWithView: true,
                  rotation: 0.0,
                  scale: 1.0,
                  size: [p, p1],
                  anchor: [p2, p3],
                  anchorXUnits: 'pixels',
                  anchorYUnits: 'pixels',
                  src: src,
                }),
                text: new Text({
                  text: size.toString(),
                  font: '16px Arial',
                  fill: new Fill({
                    color: '#FFF',
                  }),
                  offsetX: 30,
                  offsetY: -37,
                }),
              });
              styleCache[size + type] = style;
            }
          }
        }
        break;
      case 'alarm_hot':
        {
          let type = name.get('features')[0].get('typeName');
          type = type.replace('e', '');
          let fillColor, strokeColor = '#0fbb1dff';
          switch (type) {
            case '火灾扑救':
              fillColor = '#FF0A4C';
              strokeColor = '#FF7BA0';
              break;
            case '抢险救援':
              fillColor = '#00A0FF';
              strokeColor = '#77CBFF';
              break;
            case '社会救助':
              fillColor = '#FFC500';
              strokeColor = '#FFDF77';
              break;
          }

          style = new Style({
            image: new Circle({
              radius: 4,
              fill: new Fill({ color: fillColor }),
              stroke: new Stroke({ color: strokeColor, width: 1 }),
            }),
            zIndex: 10009,
          });
        }
        break;
      case 'alarmCluster':
        {
          const { isMerge = false } = otherParams;
          let src;
          switch (name) {
            case '10000':
              src = isMerge ? zhdAlarmMerge : zhdAlarm;
              break;
            case '20000':
              src = isMerge ? _qxjyAlarmMerge : _qxjyAlarm;
              break;
            case '50000':
              src = isMerge ? _shjzAlarmMerge : _shjzAlarm;
              break;
          }

          if (isMerge) {
            new Style({
              image: new Circle({
                radius: 20,
                fill: new Fill({
                  color: 'rgba(255, 153, 0, 0.8)'
                }),
                stroke: new Stroke({
                  color: 'white',
                  width: 2
                })
              }),
              text: new Text({
                text: size.toString(),
                fill: new Fill({ color: 'white' }),
                font: 'bold 14px Arial'
              })
            });
          } else {
            style = new Style({
              image: new Icon({
                anchor: [21, 42],
                anchorXUnits: 'pixels',
                anchorYUnits: 'pixels',
                opacity: 1,
                src: src,
                imgSize: [79, 78],
              }),
              zIndex: 10009,
            });
          }


        }
        break;
    }
    return style;
  },
  alarmParse: function (data) {
    var typeName;
    var type = data.jqlbdm.substr(0, 1);
    switch (type) {
      case '1':
        typeName = '火灾扑救';
        break;
      case '2':
        typeName = '抢险救援';
        break;
      case '3':
        typeName = '反恐排爆';
        break;
      case '4':
        typeName = '公务执勤';
        break;
      case '5':
        typeName = '社会救助';
        break;
      case '6':
        typeName = '其他';
        break;
    }

    let zqztmc = '';
    switch (data.jqzt_lbdm) {
      case '01':
        zqztmc = '接警';
        break;
      case '02':
        zqztmc = '下达';
        break;
      case '03':
        zqztmc = '出动';
        break;
      case '04':
        zqztmc = '到场';
        break;
      case '05':
        zqztmc = '展开';
        break;
      case '06':
        zqztmc = '出水';
        break;
      case '07':
        zqztmc = '控制';
        break;
      case '08':
        zqztmc = '熄灭';
        break;
      case '09':
        zqztmc = '清理现场';
        break;
      case '10':
        zqztmc = '返回';
        break;
      case '11':
        zqztmc = '归队';
        break;
      case '12':
        zqztmc = '结案';
        break;
      case '99':
        zqztmc = '其他';
        break;
    }
    data.zqztmc = zqztmc;
  },
};

export function getAlarmStyle(feature, resolution) {
  let style = null;
  if (!useMapStore().isMergeCluster) {
    style = FeatureHandler.getStyle(map.value, "alarm_hot", feature);
    style = FeatureHandler.getStyle(map.value, "fireCluster_new", feature);
  } else {
    if (feature.get("features").length > 0) {
      style = FeatureHandler.getStyle(
        map.value,
        "fireCluster_new",
        feature
      );
    }
  }
  feature.setStyle(style);
  return style;
}

function getImgFactor(map) {
  const zoom = map.getView().getZoom();
  let factor;
  if (zoom > 10) {
    factor = 0.1 * (zoom - 10);
  } else {
    factor = 0.01 * zoom;
  }
  return factor;
}
