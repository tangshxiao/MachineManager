// 通用网络请求工具（uni-app）
import logger from './logger.js'
import {
  RSA_ENABLED,
  encryptRequestData,
  decryptResponsePayload
} from './rsa.js'

// 统一无网络提示文案
const NO_NETWORK_MSG = '当前无网络，请检查网络连接'

// 显示无网络提示
function showNoNetworkToast() {
  // uni.showToast({
  //   title: NO_NETWORK_MSG,
  //   icon: 'none'
  // })
}

// 清理登录态，避免登录失效后继续携带旧 token
function clearAuthStorage() {
  uni.removeStorageSync('token')
  uni.removeStorageSync('Authorization')
  uni.removeStorageSync('selectedProjectIds')
}

// 核心请求方法
const request = (options = {}) => {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    showLoading = true,
    suppressNoNetworkToast = false
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

  // 处理 Content-Type，优先使用传入的 header 中的 Content-Type
  const contentType = header['Content-Type'] || header['content-type'] || 'application/x-www-form-urlencoded'
  let requestData = data

  // RSA：json 整包加密；form-urlencoded 对 value 加密（upload 不走此方法）
  if (RSA_ENABLED) {
    try {
      requestData = encryptRequestData(data, contentType)
    } catch (e) {
      console.error('RSA 请求加密失败:', e)
      if (showLoading) uni.hideLoading()
      return Promise.reject(e)
    }
  } else if (contentType === 'application/json' && typeof data === 'object' && data !== null) {
    // 未开启 RSA 时保持原逻辑：json 手动序列化
    requestData = JSON.stringify(data)
  }

  // 生成请求ID，用于关联请求和响应
  const requestId = Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  const startTime = Date.now()

  // 记录请求日志（加密开启时仅记录密文，避免明文落盘）
  logger.addLog(logger.formatRequestLog({
    url,
    method,
    data: requestData,
    header: {
      'Content-Type': contentType,
      'Authorization': token ? `Bearer ${token}` : '',
      'token': token || '',
      ...header
    }
  }, requestId))

  return new Promise((resolve, reject) => {
    // 先检测网络类型，无网络时直接提示并拒绝，避免发请求
    uni.getNetworkType({
      success: (netRes) => {
        if (netRes.networkType === 'none') {
          if (showLoading) uni.hideLoading()
          if (!suppressNoNetworkToast) {
            showNoNetworkToast()
          }
          reject(new Error(NO_NETWORK_MSG))
          return
        }
        doRequest()
      },
      fail: () => { doRequest() } // 获取失败时照常发请求，由 request fail 兜底
    })

    function doRequest() {
      uni.request({
        // 这里假设传入的 url 已经是完整地址（在 config/api.js 中配置）
        url,
        method,
        data: requestData,
        header: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          // 使用传入的 Content-Type 或默认值
          'Content-Type': contentType,
          // 后端如果使用 Authorization 或 token 任一字段，都可以从这里取到
          'Authorization': token ? `Bearer ${token}` : '',
          'token': token || '',
          ...header
        },
        success: (res) => {
          const duration = Date.now() - startTime
          const { statusCode, header: resHeader } = res
          let { data } = res

          // 响应解密（整包密文或 data 字段密文）
          if (RSA_ENABLED && data != null) {
            try {
              data = decryptResponsePayload(data)
            } catch (e) {
              console.error('RSA 响应解密失败:', e)
            }
          }

          // 记录响应日志
          logger.addLog(logger.formatResponseLog({
            statusCode,
            data,
            header: resHeader
          }, requestId, duration, url))

          if (statusCode === 200) {
            // 按常见后端返回结构：{ code, data, msg }
            // code === -1 表示登录失效，不提示，直接跳转登录（选择项目页）
            if (data && data.code === -1) {
              clearAuthStorage()
              uni.reLaunch({ url: '/pages/index/index' })
              reject(data)
              return
            }
            if (data && data.code === 0) {
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
          const duration = Date.now() - startTime

          // 记录错误日志
          logger.addLog(logger.formatErrorLog(err, requestId, duration, url))

          if (!suppressNoNetworkToast) {
            showNoNetworkToast()
          }
          reject(err)
        },
        complete: () => {
          if (showLoading) {
            uni.hideLoading()
          }
        }
      })
    }
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

// 文件上传方法（form-data）——请求体不做 RSA；响应需解密
const upload = (filePath, config = {}) => {
  const {
    url,
    name = 'file',
    formData = {},
    showLoading = true
  } = config

  if (!url) {
    console.error('upload: url 不能为空')
    return Promise.reject(new Error('url 不能为空'))
  }

  if (!filePath) {
    console.error('upload: filePath 不能为空')
    return Promise.reject(new Error('filePath 不能为空'))
  }

  if (showLoading) {
    uni.showLoading({
      title: '上传中...',
      mask: true
    })
  }

  const token = uni.getStorageSync('token') || ''

  // 生成请求ID
  const requestId = Date.now() + '_upload_' + Math.random().toString(36).substr(2, 9)
  const startTime = Date.now()

  // 记录上传请求日志
  logger.addLog(logger.formatRequestLog({
    url,
    method: 'UPLOAD',
    data: { filePath, name, formData },
    header: {
      'Authorization': token ? `Bearer ${token}` : '',
      'token': token || ''
    }
  }, requestId))

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url,
      filePath,
      name,
      formData,
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'token': token || ''
      },
      success: (res) => {
        const duration = Date.now() - startTime
        try {
          let data = JSON.parse(res.data)

          // 上传请求体不加密，但响应 data 仍需 RSA 解密
          if (RSA_ENABLED && data != null) {
            try {
              data = decryptResponsePayload(data)
            } catch (e) {
              console.error('RSA 上传响应解密失败:', e)
            }
          }

          // 记录上传响应日志（解密后）
          logger.addLog(logger.formatResponseLog({
            statusCode: 200,
            data,
            header: res.header || {}
          }, requestId, duration, url))

          // code === -1 表示登录失效，不提示，直接跳转登录（选择项目页）
          if (data && data.code === -1) {
            clearAuthStorage()
            uni.reLaunch({ url: '/pages/index/index' })
            reject(data)
            return
          }
          if (data && data.code === 0) {
            resolve(data.data)
          } else {
            uni.showToast({
              title: (data && data.msg) || '上传失败',
              icon: 'none'
            })
            reject(data)
          }
        } catch (e) {
          // 记录解析错误日志
          logger.addLog(logger.formatErrorLog(e, requestId, duration, url))

          uni.showToast({
            title: '上传响应解析失败',
            icon: 'none'
          })
          reject(e)
        }
      },
      fail: (err) => {
        const duration = Date.now() - startTime

        // 记录上传错误日志
        logger.addLog(logger.formatErrorLog(err, requestId, duration, url))

        showNoNetworkToast()
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

export default {
  request,
  get,
  post,
  upload
}
