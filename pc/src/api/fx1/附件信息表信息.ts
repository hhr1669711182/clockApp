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
  GetFileEnclosuresByGlidUsingGetParams,
  SrvcFileEnclosure,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class 附件信息表信息<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description 附件信息表详情信息
   *
   * @tags 附件信息表信息
   * @name GetFileEnclosuresByGlidUsingGet
   * @summary 附件信息表详情信息
   * @request GET:/srvcFileEnclosure/getFileEnclosuresByGlid/{glid}
   */
  getFileEnclosuresByGlidUsingGet = (
    { glid, ...query }: GetFileEnclosuresByGlidUsingGetParams,
    params: RequestParams = {},
  ) =>
    this.request<SrvcFileEnclosure, any>({
      path: `/srvcFileEnclosure/getFileEnclosuresByGlid/${glid}`,
      method: "GET",
      ...params,
    });
}
