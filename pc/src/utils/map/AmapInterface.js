/*
 * @Description: 高德接口调用
 * @Author: liuyongkui
 * @Date: 2023-09-14 17:00:39
 * @LastEditors: yangshaochun yang_sx@126.com
 * @LastEditTime: 2023-12-28 10:13:57
 */

// import { request } from '@/service/index';
const gdKey = '50b926f6f8bec7119d0695ee72ad1315'; // 高德官方密钥
const bdKey = 'CeKP7sytU3WUe3f0x9rmTQGDNFdwXYYq'; //百度密钥

// 获取高德路径规划数据
export const getLjghInfo = (data) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: 'https://restapi.amap.com/v5/direction/driving?key=' + gdKey + '&' + data,
      type: 'get',
      contentType: 'application/x-www-form-urlencoded',
      async: false,
      complete: function (result) {
        if (result.status == 200) {
          resolve(result.responseJSON);
        } else {
          reject(result);
        }
      },
    });
  });
};

// 高德天气获取数据
export const getWeather = (data) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: 'https://restapi.amap.com/v3/weather/weatherInfo?key=' + gdKey + '&' + data,
      type: 'get',
      contentType: 'application/x-www-form-urlencoded',
      async: false,
      complete: function (result) {
        if (result.status == 200) {
          resolve(result.responseJSON);
        } else {
          reject(result);
        }
      },
    });
  });
};

// 高德逆地址获取数据
export const getRegeo = (data) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: 'https://restapi.amap.com/v3/geocode/regeo?key=' + gdKey + '&' + data,
      type: 'get',
      contentType: 'application/x-www-form-urlencoded',
      async: false,
      complete: function (result) {
        if (result.status == 200) {
          resolve(result.responseJSON);
        } else {
          reject(result);
        }
      },
    });
  });
};

// 获取百度路径规划数据
export const getBDLjghInfo = (data) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: 'https://api.map.baidu.com/directionlite/v1/driving?coord_type=gcj02&steps_info=1&ak=' + bdKey + '&' + data,
      type: 'get',
      contentType: 'application/x-www-form-urlencoded',
      async: false,
      complete: function (result) {
        if (result.status == 200) {
          resolve(result.responseJSON);
        } else {
          reject(result);
        }
      },
    });
  });
};
