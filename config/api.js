// API接口配置文件
// 正式
// const API_BASE_URL = 'https://ceec.chidi.com.cn:8182/app';
// 测试
 const API_BASE_URL = 'https://machine.tool.zhishanglianpin.com/app';

export const TIANDITU_GEOCODER_URL = 'https://api.tianditu.gov.cn/geocoder'
export const TIANDITU_GEOCODER_KEY = '11f6f9b0f31e532ebfdba06dc8fb36ef'
export const QQ_MAP_GEOCODER_URL = 'https://apis.map.qq.com/ws/geocoder/v1/'
export const QQ_MAP_GEOCODER_KEY = 'RDHBZ-5RAYI-4UGGB-U5IIX-LRRRS-RQFMH'

/** 接口域名，用于拼接后端返回的相对路径图片地址 */
export function getApiOrigin() {
  try {
    return new URL(API_BASE_URL).origin
  } catch (e) {
    return ''
  }
}

export const API_ENDPOINTS = {
  // 项目相关接口
  LOGIN_API: `${API_BASE_URL}/user/login`,
  PROJECT_LIST_API: `${API_BASE_URL}/project/list`,
  ATTENDANCE_LIST_API: `${API_BASE_URL}/attendance/list`,
  ATTENDANCE_CHECK_API: `${API_BASE_URL}/attendance/check`,
  ATTENDANCE_ADD_API: `${API_BASE_URL}/attendance/add`,
  DEVICE_LIST_API: `${API_BASE_URL}/device/list`,
  DEVICE_ADD_API: `${API_BASE_URL}/device/add`,
  DEVICE_DETAILS_API: `${API_BASE_URL}/device/details`, 
  DEVICE_QR_DETAILS_API: `${API_BASE_URL}/device/qrDetails`,
  DEVICE_BIND_QRCODE_API: `${API_BASE_URL}/device/bindQrcode`,
  UPLOAD_API: `${API_BASE_URL}/upload/upload`,
  APP_UPDATE_API: `${API_BASE_URL}/app/last`,
  DICT_LIST_API: `${API_BASE_URL}/dict/list`,
  REPORT_SAVE_API: `${API_BASE_URL}/report/save`,
  PROJECT_BIND_API: `${API_BASE_URL}/project/bind`,
  QQ_MAP_GEOCODER_URL,
  QQ_MAP_GEOCODER_KEY,
};

export default API_ENDPOINTS;