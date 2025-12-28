// 离线缓存管理工具
const OFFLINE_CACHE_KEY = 'OFFLINE_CACHE_RECORDS'
const MAX_CACHE_SIZE = 50 // 最大缓存条数

/**
 * 获取所有离线缓存记录
 */
export function getAllCacheRecords() {
  try {
    const records = uni.getStorageSync(OFFLINE_CACHE_KEY)
    return records ? JSON.parse(records) : []
  } catch (e) {
    console.error('获取离线缓存失败:', e)
    return []
  }
}

/**
 * 保存离线缓存记录
 */
export function saveCacheRecord(record) {
  try {
    // 检查存储空间
    const storageInfo = uni.getStorageInfoSync()
    if (storageInfo.keys.length > 1000) {
      // 如果存储key过多，提示存储空间不足
      return { success: false, error: '存储空间不足，请清理空间后重试' }
    }

    const records = getAllCacheRecords()
    
    // 生成唯一ID
    const id = Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    const cacheRecord = {
      id,
      ...record,
      createTime: new Date().toISOString(),
      uploadStatus: 'pending', // pending: 未上传, success: 已上传, failed: 上传失败, corrupted: 损坏
      uploadTime: null,
      uploadError: null
    }

    // 检查是否超过最大缓存数
    if (records.length >= MAX_CACHE_SIZE) {
      return { success: false, error: '缓存记录已达到上限，请先清理后再试' }
    }

    records.unshift(cacheRecord) // 新记录添加到最前面
    uni.setStorageSync(OFFLINE_CACHE_KEY, JSON.stringify(records))
    
    return { success: true, id }
  } catch (e) {
    console.error('保存离线缓存失败:', e)
    // 检查是否是存储空间不足
    if (e.errMsg && e.errMsg.includes('space')) {
      return { success: false, error: '存储空间不足，无法缓存打卡数据，请清理空间后重试' }
    }
    return { success: false, error: '保存缓存失败' }
  }
}

/**
 * 删除缓存记录
 */
export function deleteCacheRecord(id) {
  try {
    const records = getAllCacheRecords()
    const newRecords = records.filter(r => r.id !== id)
    uni.setStorageSync(OFFLINE_CACHE_KEY, JSON.stringify(newRecords))
    return { success: true }
  } catch (e) {
    console.error('删除缓存记录失败:', e)
    return { success: false, error: '删除失败' }
  }
}

/**
 * 标记记录为已上传
 */
export function markRecordUploaded(id, success = true, error = null) {
  try {
    const records = getAllCacheRecords()
    const index = records.findIndex(r => r.id === id)
    if (index !== -1) {
      records[index].uploadStatus = success ? 'success' : 'failed'
      records[index].uploadTime = new Date().toISOString()
      if (error) {
        records[index].uploadError = error
      }
      uni.setStorageSync(OFFLINE_CACHE_KEY, JSON.stringify(records))
    }
    return { success: true }
  } catch (e) {
    console.error('标记记录上传状态失败:', e)
    return { success: false }
  }
}

/**
 * 标记记录为损坏
 */
export function markRecordCorrupted(id) {
  try {
    const records = getAllCacheRecords()
    const index = records.findIndex(r => r.id === id)
    if (index !== -1) {
      records[index].uploadStatus = 'corrupted'
      uni.setStorageSync(OFFLINE_CACHE_KEY, JSON.stringify(records))
    }
    return { success: true }
  } catch (e) {
    console.error('标记记录损坏失败:', e)
    return { success: false }
  }
}

/**
 * 获取统计信息
 */
export function getCacheStats() {
  const records = getAllCacheRecords()
  return {
    total: records.length,
    pending: records.filter(r => r.uploadStatus === 'pending').length,
    success: records.filter(r => r.uploadStatus === 'success').length,
    failed: records.filter(r => r.uploadStatus === 'failed').length,
    corrupted: records.filter(r => r.uploadStatus === 'corrupted').length
  }
}

/**
 * 验证记录数据完整性
 */
export function validateRecord(record) {
  try {
    // 检查必要字段
    if (!record.deviceId && !record.deviceNo) {
      return { valid: false, error: '缺少设备信息' }
    }
    if (!record.time) {
      return { valid: false, error: '缺少时间信息' }
    }
    // 尝试解析JSON数据（如果有）
    if (record.data && typeof record.data === 'string') {
      JSON.parse(record.data)
    }
    return { valid: true }
  } catch (e) {
    return { valid: false, error: '数据格式错误' }
  }
}

/**
 * 检测并修复损坏的记录
 */
export function checkAndFixCorruptedRecords() {
  const records = getAllCacheRecords()
  let hasCorrupted = false
  
  records.forEach(record => {
    const validation = validateRecord(record)
    if (!validation.valid && record.uploadStatus !== 'corrupted') {
      markRecordCorrupted(record.id)
      hasCorrupted = true
    }
  })
  
  return hasCorrupted
}

