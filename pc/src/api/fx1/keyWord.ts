/*
 * @Author: huanghuanrong
 * @Date: 2025-11-10 16:20:46
 * @LastEditTime: 2025-11-10 16:40:43
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \pc\src\api\fx\keyWord.ts
 */
import { _, _3, _6, Boolean, IPage, KeyUsingGetParams } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";
// import request  from "@/axios";

export class KeyWord<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description 关键字新增
   *
   * @tags 关键字
   * @name AddUsingPost
   * @summary 关键字新增
   * @request POST:/maintenanceKeyword/add
   */
  addUsingPost = (srvcMaintenanceKeywordDto: _3, params: RequestParams = {}) =>
    this.request<Boolean, any>({
      path: `/maintenanceKeyword/add`,
      method: "POST",
      body: srvcMaintenanceKeywordDto,
      type: ContentType.Json,
      ...params,
    });
  /**
   * @description 关键字编辑
   *
   * @tags 关键字
   * @name EditUsingPost
   * @summary 关键字编辑
   * @request POST:/maintenanceKeyword/edit
   */
  editUsingPost = (srvcMaintenanceKeywordDto: _3, params: RequestParams = {}) =>
    this.request<Boolean, any>({
      path: `/maintenanceKeyword/edit`,
      method: "POST",
      body: srvcMaintenanceKeywordDto,
      type: ContentType.Json,
      ...params,
    });
  /**
   * @description 关键字详情信息
   *
   * @tags 关键字
   * @name KeyUsingGet
   * @summary 关键字详情信息
   * @request GET:/maintenanceKeyword/key/{id}
   */
  keyUsingGet = (
    { id, ...query }: KeyUsingGetParams,
    params: RequestParams = {},
  ) =>
    this.request<_6, any>({
      path: `/maintenanceKeyword/key/${id}`,
      method: "GET",
      ...params,
    });
  /**
   * @description 分页查询
   *
   * @tags 关键字
   * @name PageUsingPost
   * @summary 分页查询
   * @request POST:/maintenanceKeyword/page
   */
  pageUsingPost = (requestPage: _, params: RequestParams = {}) =>
    this.request<IPage, any>({
      path: `/maintenanceKeyword/page`,
      method: "POST",
      body: requestPage,
      type: ContentType.Json,
      ...params,
    });
}


export default new KeyWord();


