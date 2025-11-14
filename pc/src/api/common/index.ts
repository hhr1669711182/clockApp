/*
 * @Author: huanghuanrong
 * @Date: 2025-10-30 14:05:55
 * @LastEditTime: 2025-11-12 16:24:47
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \pc\src\api\common\index.ts
 */
import request from '@/axios'
import { SERVICES } from './address'
// 获取所有组织部门
export const getOrgDeptApi = () => {
  return request.get({ url: SERVICES.TWMS_SERVICE_BASE_DATA + '/baseOrgDept/key' })
}

// 获取配置信息
export const getConfig = (params: Record<string, any>) => {
  return request.post({
    url: SERVICES.TWMS_BRACE_CONFIG + '/configProperties/getConfigs',
    data: params
  })
}


// 获取行政机构
export const getOrg = (data: string) =>
  request.get({
    url: SERVICES.TWMS_SERVICE_BASE_DATA + '/baseOrgDept/key/' + data,
  });

// 获取机构列表
export const getOrgList = (orgId: string) => {
  return request.get({
    url: SERVICES.TWMS_SERVICE_STANDBY + '/baseOrgDept/queryById/' + orgId,
  });
};

// 获取当前机构的部门列表
export const getDeptsByMySelfOrgId = (orgId: string) => {
  return request.get({
    url: `${SERVICES.TWMS_SERVICE_BASE_DATA}/baseOrgDept/getDeptsByMySelfOrgId/${orgId}`,
  });
};

// 获取父级机构的部门列表
export const getDeptsByFatherOrgId = (orgId: string) => {
  return request.get({
    url: `${SERVICES.TWMS_SERVICE_BASE_DATA}/baseOrgDept/getDeptsByFatherOrgId/${orgId}`,
  });
};

// 查询中队
export const getXqzdjgidValue = (data: string) =>
  request.get({
    url: SERVICES.TWMS_SERVICE_BASE_DATA + '/baseOrgDept/key/' + data,
  });

// 获取标题详情
export const modifyTitleInfo = (data: any) =>
  request.post({
    url: SERVICES.TWMS_BRACE_CONFIG + '/configProperties/edit',
    data,
  });

// 获取字典数据
export const getZhcsData = (params: string[]) => {
  return request.get({
    url: `${SERVICES.TWMS_SERVICE_STANDBY}/baseDictMaster/listByZddms?zddmsStr=${params.join(',')}`,
  });
};

// 获取行政区划列表
export const getXzqhList = (xzqhdm: string) => {
  return request.get({
    url: `${SERVICES.TWMS_SERVICE_STANDBY}/baseArea/getNextXzqhsByXzqhId/${xzqhdm}`,
  });
};

// 获取行政机构顶级节点
export const getXzqhByXzqhbm = (xzqhdm: string) => {
  return request.get({
    url: `${SERVICES.TWMS_SERVICE_STANDBY}/baseArea/getXzqhByXzqhbm/${xzqhdm}`,
  });
};

// 获取行政机构下的所有子机构
export const getXzqhChildren = (xzqhdm: string) => {
  return request.get({
    url: `${SERVICES.TWMS_SERVICE_STANDBY}/baseArea/getNextXzqhsByXzqhbm/${xzqhdm}`,
  });
};

// 获取维保附件列表
export const getFileEnclosuresByGlid = (glid: string) => {
  return request.get({
    url: `${SERVICES.TWMS_SERVICE_REMOTE_SUPERVISION}/srvcFileEnclosure/getFileEnclosuresByGlid/${glid}`,
  });
};
