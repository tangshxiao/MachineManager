// 通用网络请求工具（uni-app）
import logger from './logger.js'

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

  // 处理 Content-Type，优先使用传入的 header 中的 Content-Type
  const contentType = header['Content-Type'] || 'application/x-www-form-urlencoded'
  let requestData = data

  // 如果是 application/json，需要序列化数据
  if (contentType === 'application/json' && typeof data === 'object' && data !== null) {
    requestData = JSON.stringify(data)
  }

  // 生成请求ID，用于关联请求和响应
  const requestId = Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  const startTime = Date.now()

  // 记录请求日志
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
        const { statusCode, data, header } = res

        // 记录响应日志
        logger.addLog(logger.formatResponseLog({
          statusCode,
          data,
          header
        }, requestId, duration, url))

        if (statusCode === 200) {
          // 按常见后端返回结构：{ code, data, msg }
          // 只有 code === 0 才是正常
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

// 文件上传方法（form-data）
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
          const data = JSON.parse(res.data)
          
          // 记录上传响应日志
          logger.addLog(logger.formatResponseLog({
            statusCode: 200,
            data,
            header: res.header || {}
          }, requestId, duration, url))
          
          // 只有 code === 0 才是正常
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
        
        uni.showToast({
          title: '上传失败，请检查网络',
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

export default {
  request,
  get,
  post,
  upload
}
