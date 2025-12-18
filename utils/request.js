// 通用网络请求工具（uni-app）

// 核心请求方法
const request = (options = {}) => {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    showLoading = true
  } = options

  if (!url) {
    console.error('request: url 不能为空')
    return Promise.reject(new Error('url 不能为空'))
  }

  if (showLoading) {
    uni.showLoading({
      title: '加载中...',
      mask: true
    })
  }

  const token = uni.getStorageSync('token') || ''

  return new Promise((resolve, reject) => {
    uni.request({
      // 这里假设传入的 url 已经是完整地址（在 config/api.js 中配置）
      url,
      method,
      data,
      header: {
        // 改为 x-www-form-urlencoded，后端按表单方式接收参数
        'Content-Type': 'application/x-www-form-urlencoded',
        // 后端如果使用 Authorization 或 token 任一字段，都可以从这里取到
        'Authorization': token ? `Bearer ${token}` : '',
        'token': token || '',
        ...header
      },
      success: (res) => {
        const { statusCode, data } = res

        if (statusCode === 200) {
          // 按常见后端返回结构：{ code, data, msg }
          if (data && (data.code === 0 || data.code === 200 || data.code === '0')) {
            resolve(data.data)
          } else {
            uni.showToast({
              title: (data && data.msg) || '请求失败',
              icon: 'none'
            })
            reject(data)
          }
        } else {
          uni.showToast({
            title: '网络错误：' + statusCode,
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '请求失败，请检查网络',
          icon: 'none'
        })
        reject(err)
      },
      complete: () => {
        if (showLoading) {
          uni.hideLoading()
        }
      }
    })
  })
}

// GET 便捷方法
const get = (url, params = {}, config = {}) => {
  return request({
    url,
    method: 'GET',
    data: params,
    ...config
  })
}

// POST 便捷方法
const post = (url, data = {}, config = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...config
  })
}

export default {
  request,
  get,
  post
}
