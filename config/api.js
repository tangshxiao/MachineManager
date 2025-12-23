// API接口配置文件

const API_BASE_URL = 'http://115.190.149.36:8000';

export const API_ENDPOINTS = {
  // 项目相关接口
  LOGIN_API: `${API_BASE_URL}/user/login`,
  PROJECT_LIST_API: `${API_BASE_URL}/project/list`,
  ATTENDANCE_LIST_API: `${API_BASE_URL}/attendance/list`,
  ATTENDANCE_ADD_API: `${API_BASE_URL}/attendance/add`,
  DEVICE_LIST_API: `${API_BASE_URL}/device/list`,
  UPLOAD_API: `${API_BASE_URL}/upload/upload`,
};

export default API_ENDPOINTS;