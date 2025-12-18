// 业务接口封装

import http from '../utils/request.js'
import API_ENDPOINTS from '../config/api.js'

// 登录（账号密码暂时写死）
export const login = () => {
  return http.post(API_ENDPOINTS.LOGIN_API, {
    username: 'test',
    password: '123456'
  })
}

// 获取项目列表（分页）
export const fetchProjectList = (pageNum = 1, pageSize = 10) => {
  return http.post(API_ENDPOINTS.PROJECT_LIST_API, {
    pageNum,
    pageSize
  })
}

export default {
  login,
  fetchProjectList
}
