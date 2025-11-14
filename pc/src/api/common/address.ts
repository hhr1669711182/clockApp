/*
 * @Author: huanghuanrong
 * @Date: 2025-11-11 17:09:11
 * @LastEditTime: 2025-11-12 16:24:38
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \pc\src\api\common\address.ts
 */
export const SERVICES = {
  TWMS_BRACE_CONFIG: 'twms-brace-config',
  TWMS_BRACE_SSO: 'twms-brace-sso',
  TWMS_WEB_SSO: 'twms-web-sso',
  TWMS_WEB_ALARM_MANAGER: 'twms-web-alarmmanager',
  TWMS_SERVICE_BASE_DATA: 'twms-service-basedata',
  TWMS_SERVICE_STANDBY: 'twms-service-standby',
  TWMS_SERVICE_DATA_QUALITY: 'twms-service-dataquality',
  TWMS_SERVICE_TWGIS: 'twms-service-twgis',
  TWMS_SERVICE_TWAC: 'twms-service-twac',
  TWMS_SERVICE_ALARM: 'twms-service-alarm',
  TWMS_SERVICE_DISPATCH_CALC: 'twms-service-dispatchcalc',
  TWMS_SERVICE_MONITOR: 'twms-service-monitor',
  TWMS_SERVICE_SPEECH: 'twms-service-speech',
  TWMS_SERVICE_CTI: 'twms-service-cti',
  TWMS_SERVICE_SMTS: 'twms-service-smts',
  TWMS_BRACE_FILES: 'twms-brace-files',
  TWMS_TWZNBB: 'twms-twznbb',
  TWMS_SERVICE_COMPLEX: 'twms-service-complex',
  TWMS_SERVICE_REMOTE_SUPERVISION: 'twms-service-remotesupervision',
} as const;

export type ServiceKey = keyof typeof SERVICES;
export type ServiceValue = typeof SERVICES[ServiceKey];
