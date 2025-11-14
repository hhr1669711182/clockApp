/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import {
  _2,
  _5,
  _7,
  GetWbfxInfoUsingGetParams,
  IPage2,
  List,
  SendMsgByZddwIdUsingGetParams,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class 维保附件查询<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description 完成维保检查
   *
   * @tags 维保附件查询
   * @name CompleteMaintenanceInspectionUsingPut
   * @summary 完成维保检查
   * @request PUT:/maintenancedeptRef/completeMaintenanceInspection
   */
  completeMaintenanceInspectionUsingPut = (
    bgid: string,
    params: RequestParams = {},
  ) =>
    this.request<_5, any>({
      path: `/maintenancedeptRef/completeMaintenanceInspection`,
      method: "PUT",
      body: bgid,
      type: ContentType.Json,
      ...params,
    });
  /**
   * @description 地图--根据单位id获取该单位维保风险信息
   *
   * @tags 维保附件查询
   * @name GetWbfxInfoUsingGet
   * @summary 地图--根据单位id获取该单位维保风险信息
   * @request GET:/maintenancedeptRef/getWbfxInfo
   */
  getWbfxInfoUsingGet = (
    query: GetWbfxInfoUsingGetParams,
    params: RequestParams = {},
  ) =>
    this.request<_7, any>({
      path: `/maintenancedeptRef/getWbfxInfo`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * @description 提供地图使用维保信息列表
   *
   * @tags 维保附件查询
   * @name MapDataListUsingGet
   * @summary 提供地图使用维保信息列表
   * @request GET:/maintenancedeptRef/mapDataList
   */
  mapDataListUsingGet = (params: RequestParams = {}) =>
    this.request<List, any>({
      path: `/maintenancedeptRef/mapDataList`,
      method: "GET",
      ...params,
    });
  /**
   * @description 维保附件查询分页查询
   *
   * @tags 维保附件查询
   * @name PageUsingPost1
   * @summary 维保附件查询分页查询
   * @request POST:/maintenancedeptRef/page
   */
  pageUsingPost1 = (requestPage: _2, params: RequestParams = {}) =>
    this.request<IPage2, any>({
      path: `/maintenancedeptRef/page`,
      method: "POST",
      body: requestPage,
      type: ContentType.Json,
      ...params,
    });
  /**
   * @description 地图--发送短信
   *
   * @tags 维保附件查询
   * @name SendMsgByZddwIdUsingGet
   * @summary 地图--发送短信
   * @request GET:/maintenancedeptRef/sendMsgByZddwId
   */
  sendMsgByZddwIdUsingGet = (
    query: SendMsgByZddwIdUsingGetParams,
    params: RequestParams = {},
  ) =>
    this.request<_5, any>({
      path: `/maintenancedeptRef/sendMsgByZddwId`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * @description 指定维保单位历史记录查询
   *
   * @tags 维保附件查询
   * @name WbdwPageUsingPost
   * @summary 指定维保单位历史记录查询
   * @request POST:/maintenancedeptRef/wbdwPage
   */
  wbdwPageUsingPost = (requestPage: _2, params: RequestParams = {}) =>
    this.request<IPage2, any>({
      path: `/maintenancedeptRef/wbdwPage`,
      method: "POST",
      body: requestPage,
      type: ContentType.Json,
      ...params,
    });
  /**
   * @description 维保风险管理分页查询
   *
   * @tags 维保附件查询
   * @name WbfxglPageUsingPost
   * @summary 维保风险管理分页查询
   * @request POST:/maintenancedeptRef/wbfxglPage
   */
  wbfxglPageUsingPost = (requestPage: _2, params: RequestParams = {}) =>
    this.request<IPage2, any>({
      path: `/maintenancedeptRef/wbfxglPage`,
      method: "POST",
      body: requestPage,
      type: ContentType.Json,
      ...params,
    });
}
