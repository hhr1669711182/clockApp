/*
 * @Description: file information
 * @Author: liuyongkui
 * @Date: 2023-01-10 15:09:33
 * @LastEditors: liuyongkui
 * @LastEditTime: 2024-03-08 15:39:01
 */
import { GUID } from './mapCommon';
import { getVectorContext } from 'ol/render';

/**
 * 公用动画元素驱动核心
 * 用于统一管理页面元素动画效果
 * @param {*} options
 * @param {Array} options.animationObjs //需要管理的动画元素集合
 *
 *
 * animationObj = {
 *      id: xxxx, ------全局ID。用于元素管理
 *      feature: ol.Feature, ------需要动画的元素
 *      animation: Funciton, ------动画方法，该元素具体动画的实现逻辑
 *      params: Object   ------任何结构类型的参数,用于在动画方法内驱动动画  内部如果有stop属性 则可以控制动画停止(停止后本对象从动画数组中删除) pasue属性可以令动画暂停(但不会删除)
 * }
 */

const AnimationCore = {
  animationObjs: [],
  _pasue: false,
  _start: null,
  _fps: 33,
  _interval: 30, //毫秒数
  _map: null,
  _vectorLayer: null,
  _speed: null,
  _pasueCallback: null,

  init: function (options) {
    this.animationObjs = options.animationObjs || [];
    this._pasue = false;
    this._start = Date.now();
    this._speed = 60;
    this._fps = 33; // 默认渲染40帧
    this._interval = 1000 / this._fps; //时间间隔 1秒多少帧 修改fps 参数可控制运动速率
    this._map = options.map;
    this._pasueCallback = options.pasueCallback || null;
  },

  pasue: function (bool) {
    if (typeof bool !== 'boolean') {
      return;
    }
    this._pasue = bool;
  },

  stop: function (bool) {
    if (typeof bool !== 'boolean') {
      return;
    }
    this._pasue = bool;
  },

  clear: function () {
    this.animationObjs = [];
    AnimationCore._map.un('postrender', this.moveFeature);
  },

  add: function (obj) {
    const id = GUID();
    if (!obj?.id) {
      obj.id = id; //添加id属性
    }
    obj.params.startTime = Date.now();
    this.animationObjs.push(obj);
    this._map.on('postrender', this.moveFeature); //ol5.0只支持vectorlayer的postcompose事件，如果是ol6.0可以使用postrender事件
    return id;
  },

  find: function (id) {
    return this.animationObjs.find((item) => item.id === id);
  },

  remove: function (id) {
    this.animationObjs.forEach(function (item, index) {
      if (item.id === id) {
        AnimationCore.animationObjs.splice(index, 1);
      }
    });
    if (AnimationCore.animationObjs.length == 0) {
      AnimationCore._map.un('postrender', this.moveFeature);
    }
  },

  moveFeature: function (event) {
    const now = Date.now();
    const delta = now - AnimationCore._start;
    if (delta > AnimationCore._interval) {
      AnimationCore._start = now;
      if (!AnimationCore._pasue) {
        AnimationCore.animationObjs.forEach(function (item, index) {
          if (item.params.stop && item.params.stop == true) {
            AnimationCore.animationObjs.splice(index, 1); //主动停止动画，从循环中删除本对象
            return;
          }
          if (item.params.pasue && item.params.pasue == true) {
            //仅仅暂停
            if (AnimationCore._pasueCallback) {
              AnimationCore._pasueCallback(item);
            }
            return;
          }
          item.animation(AnimationCore._fps, delta, item.feature, item.params); //调用对应元素的动画方法， 将该元素及参数传入方法
        });
      }
    }
    AnimationCore._map.render();
  },
};

export { AnimationCore };
