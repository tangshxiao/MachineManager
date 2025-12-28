// 网络请求日志工具
// 用于记录和查看网络请求日志，支持在打包后的 APK 中查看

const LOG_STORAGE_KEY = 'NETWORK_REQUEST_LOGS'
const MAX_LOG_COUNT = 200 // 最多保存200条日志

// 获取日志列表
const getLogs = () => {
  try {
    const logs = uni.getStorageSync(LOG_STORAGE_KEY)
    return logs ? JSON.parse(logs) : []
  } catch (e) {
    console.error('获取日志失败:', e)
    return []
  }
}

// 保存日志列表
const saveLogs = (logs) => {
  try {
    // 只保留最新的日志
    if (logs.length > MAX_LOG_COUNT) {
      logs = logs.slice(-MAX_LOG_COUNT)
    }
    uni.setStorageSync(LOG_STORAGE_KEY, JSON.stringify(logs))
  } catch (e) {
    console.error('保存日志失败:', e)
  }
}

// 添加日志
const addLog = (logData) => {
  try {
    const logs = getLogs()
    const log = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleString('zh-CN'),
      ...logData
    }
    logs.push(log)
    saveLogs(logs)
    
    // 输出到控制台，方便调试
    printConsoleLog(log)
    return log
  } catch (e) {
    console.error('添加日志失败:', e)
  }
}

// 格式化控制台输出（兼容不支持 console.group 的环境）
const printConsoleLog = (log) => {
  // 检查是否支持 console.group
  const hasGroup = typeof console.group === 'function' && typeof console.groupEnd === 'function'
  
  if (log.type === 'request') {
    const prefix = `🚀 [请求] ${log.method} ${log.url}`
    if (hasGroup) {
      console.group(prefix)
    } else {
      console.log('='.repeat(60))
      console.log(prefix)
      console.log('-'.repeat(60))
    }
    console.log('请求ID:', log.requestId)
    console.log('请求头:', log.requestHeader)
    if (log.requestData) {
      try {
        const data = typeof log.requestData === 'string' ? JSON.parse(log.requestData) : log.requestData
        console.log('请求数据:', data)
      } catch (e) {
        console.log('请求数据:', log.requestData)
      }
    }
    if (hasGroup) {
      console.groupEnd()
    } else {
      console.log('='.repeat(60))
    }
  } else if (log.type === 'response') {
    const statusIcon = log.statusCode === 200 ? '✅' : '❌'
    const prefix = `${statusIcon} [响应] ${log.statusCode} ${log.url || ''}`
    if (hasGroup) {
      console.group(prefix)
    } else {
      console.log('='.repeat(60))
      console.log(prefix)
      console.log('-'.repeat(60))
    }
    console.log('请求ID:', log.requestId)
    if (log.statusCode) {
      console.log('状态码:', log.statusCode)
    }
    if (log.duration) {
      console.log('耗时:', log.duration)
    }
    if (log.responseHeader) {
      console.log('响应头:', log.responseHeader)
    }
    if (log.responseData) {
      try {
        const data = typeof log.responseData === 'string' ? JSON.parse(log.responseData) : log.responseData
        console.log('响应数据:', data)
      } catch (e) {
        console.log('响应数据:', log.responseData)
      }
    }
    if (hasGroup) {
      console.groupEnd()
    } else {
      console.log('='.repeat(60))
    }
  } else if (log.type === 'error') {
    const prefix = `❌ [错误] ${log.url || ''}`
    if (hasGroup) {
      console.group(prefix)
    } else {
      console.log('='.repeat(60))
      console.log(prefix)
      console.log('-'.repeat(60))
    }
    console.log('请求ID:', log.requestId)
    console.error('错误信息:', log.error)
    if (log.duration) {
      console.log('耗时:', log.duration)
    }
    if (hasGroup) {
      console.groupEnd()
    } else {
      console.log('='.repeat(60))
    }
  } else {
    console.log('📡 网络日志:', log)
  }
}

// 清除日志
const clearLogs = () => {
  try {
    uni.removeStorageSync(LOG_STORAGE_KEY)
    console.log('日志已清除')
  } catch (e) {
    console.error('清除日志失败:', e)
  }
}

// 格式化请求日志
const formatRequestLog = (options, requestId) => {
  const { url, method = 'GET', data = {}, header = {} } = options
  
  return {
    type: 'request',
    requestId,
    url,
    method,
    requestHeader: header,
    requestData: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
    requestDataRaw: data
  }
}

// 格式化响应日志
const formatResponseLog = (response, requestId, duration, url) => {
  const { statusCode, data, header } = response
  
  return {
    type: 'response',
    requestId,
    url: url || '', // 添加URL信息
    statusCode,
    responseHeader: header || {},
    responseData: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
    responseDataRaw: data,
    duration: duration + 'ms'
  }
}

// 格式化错误日志
const formatErrorLog = (error, requestId, duration, url) => {
  return {
    type: 'error',
    requestId,
    url: url || '', // 添加URL信息
    error: error.message || String(error),
    errorRaw: error,
    duration: duration + 'ms'
  }
}

// 导出日志为文本
const exportLogs = () => {
  try {
    const logs = getLogs()
    let text = '网络请求日志\n'
    text += '='.repeat(50) + '\n\n'
    
    logs.forEach((log, index) => {
      text += `[${index + 1}] ${log.timestamp}\n`
      text += `类型: ${log.type}\n`
      text += `请求ID: ${log.requestId}\n`
      
      if (log.type === 'request') {
        text += `URL: ${log.url}\n`
        text += `方法: ${log.method}\n`
        text += `请求头: ${JSON.stringify(log.requestHeader, null, 2)}\n`
        text += `请求数据: ${log.requestData}\n`
      } else if (log.type === 'response') {
        if (log.url) {
          text += `URL: ${log.url}\n`
        }
        text += `状态码: ${log.statusCode}\n`
        text += `响应头: ${JSON.stringify(log.responseHeader, null, 2)}\n`
        text += `响应数据: ${log.responseData}\n`
        text += `耗时: ${log.duration}\n`
      } else if (log.type === 'error') {
        if (log.url) {
          text += `URL: ${log.url}\n`
        }
        text += `错误: ${log.error}\n`
        text += `耗时: ${log.duration}\n`
      }
      
      text += '\n' + '-'.repeat(50) + '\n\n'
    })
    
    return text
  } catch (e) {
    console.error('导出日志失败:', e)
    return ''
  }
}

// 保存日志到文件（Android）
const saveLogsToFile = () => {
  // #ifdef APP-PLUS
  try {
    const logsText = exportLogs()
    const fileManager = uni.getFileSystemManager()
    const fileName = `network_logs_${Date.now()}.txt`
    const filePath = `${plus.io.convertLocalFileSystemURL('_doc/')}${fileName}`
    
    fileManager.writeFile({
      filePath: filePath,
      data: logsText,
      encoding: 'utf8',
      success: () => {
        uni.showToast({
          title: `日志已保存: ${fileName}`,
          icon: 'success'
        })
        console.log('日志文件路径:', filePath)
      },
      fail: (err) => {
        console.error('保存文件失败:', err)
        uni.showToast({
          title: '保存文件失败',
          icon: 'none'
        })
      }
    })
  } catch (e) {
    console.error('保存日志到文件失败:', e)
  }
  // #endif
  
  // #ifndef APP-PLUS
  // 非 APP 环境，复制到剪贴板
  const logsText = exportLogs()
  uni.setClipboardData({
    data: logsText,
    success: () => {
      uni.showToast({
        title: '日志已复制到剪贴板',
        icon: 'success'
      })
    }
  })
  // #endif
}

export default {
  getLogs,
  addLog,
  clearLogs,
  formatRequestLog,
  formatResponseLog,
  formatErrorLog,
  exportLogs,
  saveLogsToFile
}

