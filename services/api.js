import http from '../utils/request.js'
import API_ENDPOINTS from '../config/api.js'
// 👇 1. 引入获取设备ID的方法
import { getDeviceIdentifier } from '../utils/device.js'

// 2. 修改登录方法：不再写死账号密码，而是上传设备ID
export const login = () => {
  // 获取当前手机的设备ID (例如: e28e441df25476c9)
  const deviceId = getDeviceIdentifier();
  
  console.log('正在使用设备ID进行登录验证:', deviceId);

  // 发送 POST 请求
  // 注意：这里参数名 'account' 是根据你之前提供的 Knife4j 接口文档确定的
  return http.post(API_ENDPOINTS.LOGIN_API, {
    account: deviceId
  })
}

// 获取项目列表（保持不变，但在调用前必须先 login 成功）
export const fetchProjectList = (pageNum = 1, pageSize = 10) => {
  // 注意：后端通常要求 current 和 size，建议改为后端通用的参数名
  return http.post(API_ENDPOINTS.PROJECT_LIST_API, {
    current: pageNum, // 映射 pageNum -> current
    size: pageSize    // 映射 pageSize -> size
  })
}

export default {
  login,
  fetchProjectList
}