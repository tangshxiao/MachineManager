// API接口配置文件

const API_BASE_URL = 'https://bt.dslove.fun:10000';

export const API_ENDPOINTS = {
  // 项目相关接口
  LOGIN_API: `${API_BASE_URL}/user/login`,
  PROJECT_LIST_API: `${API_BASE_URL}/project/list`,
  ATTENDANCE_LIST_API: `${API_BASE_URL}/attendance/list`,
  ATTENDANCE_ADD_API: `${API_BASE_URL}/attendance/add`,
  DEVICE_LIST_API: `${API_BASE_URL}/device/list`,
  DEVICE_ADD_API: `${API_BASE_URL}/device/add`,
  UPLOAD_API: `${API_BASE_URL}/upload/upload`,
};

export default API_ENDPOINTS;