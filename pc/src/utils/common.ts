/*
 * @Author: huanghuanrong
 * @Date: 2025-11-12 18:15:13
 * @LastEditTime: 2025-11-12 18:47:22
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \pc\src\utils\common.ts
 */
/**
 * 接口请求数据转换
 */
export function axiosResponseStructData(response: {
  status: number;
  data: Record<string, any>;
  [key: string]: any;
}): any {
  const { status, data, ...rest } = response;
  if (status === 200 && data) return data;
  if (response.blob) return data;
  return rest;
}

/**
 * 分页list接口数据结构转换
 * */ 
export function parseNestedPageData(res: {
    code: string;
    data: Record<string, any>;
    msg: string;
    [key: string]: any;
}): { records: any[]; total: number, [key: string]: any; } {
  let records: any[] = []
  let total = 0

  const { status, code, data, ...rest } = res;

  const target = res?.status === 200 ? res.data?.data : res?.code === '1000' ? res.data : null;
  records = target?.records || [];
  total   = target?.total   || 0;
  return { records, total, ...rest }
}

/**
 * list数据加页码
 * */ 
export function attachIndexToList(
  list: any[],
  currentPage: number,
  pageSize: number
): any[] {
  return list.map((item, idx) => ({
    ...item,
    index: (currentPage - 1) * pageSize + idx + 1,
  }))
}
