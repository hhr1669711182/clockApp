 
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

/** SrvcPersonDo */
export interface SrvcPersonDo {
  /**
   * 时长（单位秒）
   * @format int64
   */
  sc?: number;
  /** 维保人员ID */
  wbryid?: string;
  /** 维保人员名称 */
  wbrymc?: string;
}

/** IPage«维保关键词信息表(南宁维保模块)» */
export interface IPage {
  /** @format int64 */
  current?: number;
  /** @format int64 */
  pages?: number;
  records?: _3[];
  searchCount?: boolean;
  /** @format int64 */
  size?: number;
  /** @format int64 */
  total?: number;
}

/** IPage«维保单位、企业单位、高地大化重点单位关联表(南宁维保模块)» */
export interface IPage2 {
  /** @format int64 */
  current?: number;
  /** @format int64 */
  pages?: number;
  records?: _4[];
  searchCount?: boolean;
  /** @format int64 */
  size?: number;
  /** @format int64 */
  total?: number;
}

/** 分页查询«维保关键词信息表(南宁维保模块)» */
export interface _ {
  /**
   * 当前页码
   * @format int32
   * @min 1
   * @exclusiveMin false
   */
  currentPage?: number;
  /**
   * 页数据条数
   * @format int32
   * @min 0
   * @exclusiveMin false
   * @max 100
   * @exclusiveMax false
   */
  pageSize?: number;
  /** 查询条件 */
  query?: _3;
}

/** 分页查询«维保单位、企业单位、高地大化重点单位关联表(南宁维保模块)» */
export interface _2 {
  /**
   * 当前页码
   * @format int32
   * @min 1
   * @exclusiveMin false
   */
  currentPage?: number;
  /**
   * 页数据条数
   * @format int32
   * @min 0
   * @exclusiveMin false
   * @max 100
   * @exclusiveMax false
   */
  pageSize?: number;
  /** 查询条件 */
  query?: _4;
}

/** 维保关键词信息表(南宁维保模块) */
export interface _3 {
  /** 创建人用户帐号 */
  cjryhzh: string;
  /**
   * 创建时间
   * @format date-time
   */
  cjsj?: string;
  /**
   *  风险等级, 1低风险, 2中风险, 3高风险
   * @format int32
   */
  fxdj: number;
  /** 关键词 */
  gjc: string;
  /** 主键ID */
  gjcid: string;
  /**
   * 记录状态0: 已删除  1: 可用
   * @format int32
   * @example 1
   */
  jlzt: number;
  /**
   *  是否自动发送短信, 0否, 1是
   * @format int32
   */
  sfzdfsdx: number;
  /** 修改人用户账号 */
  xgryhzh?: string;
  /** 数据归属业务系统来源 */
  ywxtly: string;
  /** 数据最后更新时间 */
  zhgxsj?: string;
  /**
   *  启用状态, 0未启用, 1启用
   * @format int32
   */
  zt: number;
}

/** 维保单位、企业单位、高地大化重点单位关联表(南宁维保模块) */
export interface _4 {
  /** 报告ID，引用srvc_enterprise_info.qyid */
  bgid: string;
  /** 创建人用户帐号 */
  cjryhzh: string;
  /**
   * 创建时间
   * @format date-time
   */
  cjsj?: string;
  /** 高地大化重点单位_地理经度(wgs84) */
  dljd: number;
  /** 高地大化重点单位_地理纬度(wgs84) */
  dlwd: number;
  /** 结束维保时间 */
  endTime?: string;
  /** 附件关联id数组 */
  fjglidList?: string[];
  /** 风险等级, 1无风险, 2低风险, 3中风险, 4高风险 */
  fxdj?: string;
  /** 风险识别项 */
  fxsbx?: string;
  /**
   * 记录状态0: 已删除  1: 可用
   * @format int32
   * @example 1
   */
  jlzt: number;
  /** 企业单位ID，引用srvc_enterprise_info.qyid */
  qyid: string;
  /** 主键ID */
  refId: string;
  /**
   * 高地大化重点单位_短信发送状态
   * @format int32
   */
  sfyfsdx: number;
  /**
   * 是否最新报告标志, 0否，1是
   * @format int32
   */
  sfzxbgbz: number;
  /** 高地大化重点单位_所属消防机构ID */
  ssxfjgid: string;
  /** 开始维保时间 */
  startTime?: string;
  /** 维保单位ID */
  wbdwid: string;
  /** 维保单位名称 */
  wbdwmc?: string;
  /** 维保人员姓名 */
  wbry?: string;
  /** 人员打卡时长数组 */
  wbrydkscList?: SrvcPersonDo[];
  /** 维保人员id */
  wbryid?: string;
  /**
   * 维保时间
   * @format date-time
   */
  wbsj?: string;
  /** 修改人用户账号 */
  xgryhzh?: string;
  /** 数据归属业务系统来源 */
  ywxtly: string;
  /** 高地大化重点单位_所在行政区划代码 */
  zddwXzqhdm: string;
  /** 行政区划代码名称 */
  zddwXzqhdmValue?: string;
  /** 单位ID，引用接处警base模式下的高层建筑、地下建筑、大型综合体、大型化工单位、住宅小区、自建房、重点单位的ID */
  zddwid: string;
  /**
   * 高地大化重点单位自定义类型
   * @format int32
   */
  zddwlx: number;
  /** 高地大化及重点单位名称 */
  zddwmc: string;
  /** 数据最后更新时间 */
  zhgxsj?: string;
  /**
   * 高地大化重点单位_执勤_风险状态
   * @format int32
   */
  zqZt: number;
  /** 维保检查状态: 0维保中，1已签发，2已删除，4待维保人员签字，5待甲方签字，6完成维保检查 */
  zt?: string;
}

/** 返回结果 */
export interface _5 {
  /** 代码 */
  code?: string;
  /** 数据 */
  data?: object;
  /** 提示消息 */
  msg?: object;
}

/** 返回结果«IPage«维保关键词信息表(南宁维保模块)»» */
export interface IPage {
  /** 代码 */
  code?: string;
  /** 数据 */
  data?: IPage;
  /** 提示消息 */
  msg?: object;
}

/** 返回结果«IPage«维保单位、企业单位、高地大化重点单位关联表(南宁维保模块)»» */
export interface IPage2 {
  /** 代码 */
  code?: string;
  /** 数据 */
  data?: IPage2;
  /** 提示消息 */
  msg?: object;
}

/** 返回结果«List«维保单位、企业单位、高地大化重点单位关联表(南宁维保模块)»» */
export interface List {
  /** 代码 */
  code?: string;
  /** 数据 */
  data?: _4[];
  /** 提示消息 */
  msg?: object;
}

/** 返回结果«boolean» */
export interface Boolean {
  /** 代码 */
  code?: string;
  /** 数据 */
  data?: boolean;
  /** 提示消息 */
  msg?: object;
}

/** 返回结果«维保关键词信息表(南宁维保模块)» */
export interface _6 {
  /** 代码 */
  code?: string;
  /** 数据 */
  data?: _3;
  /** 提示消息 */
  msg?: object;
}

export interface SendMsgByZddwIdUsingGetParams {
  /** zddwid */
  zddwid?: string;
}

export interface DeleteUsingDeleteParams {
  /** 主键 */
  id: string;
}
