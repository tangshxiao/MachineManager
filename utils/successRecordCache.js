const SUCCESS_RECORD_CACHE_KEY = 'ATTENDANCE_SUCCESS_RECORDS'
const MAX_SUCCESS_RECORDS = 200

function readRecords() {
  try {
    const raw = uni.getStorageSync(SUCCESS_RECORD_CACHE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.error('读取成功打卡缓存失败:', e)
    return []
  }
}

function writeRecords(records) {
  try {
    uni.setStorageSync(SUCCESS_RECORD_CACHE_KEY, JSON.stringify(records))
    return true
  } catch (e) {
    console.error('写入成功打卡缓存失败:', e)
    return false
  }
}

function normalizeRecord(record = {}) {
  const localImages = Array.isArray(record.localImages)
    ? record.localImages.filter(Boolean)
    : (Array.isArray(record.images) ? record.images.filter(Boolean) : [])

  return {
    id: record.id || ('local_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)),
    deviceId: record.deviceId || 0,
    deviceNo: record.deviceNo || '',
    name: record.name || record.deviceName || '',
    deviceName: record.deviceName || record.name || '',
    type: typeof record.type === 'number' ? record.type : 1,
    time: record.time || '',
    address: record.address || '',
    lng: record.lng || '',
    lat: record.lat || '',
    imgs: record.imgs || '',
    localImages,
    qrNo: record.qrNo || '',
    source: record.source || 'unknown',
    saveTime: Date.now()
  }
}

function isSameRecord(a, b) {
  if (!a || !b) return false
  const sameByQrAndTime = a.qrNo && b.qrNo && a.time && b.time && a.qrNo === b.qrNo && a.time === b.time
  const sameByDeviceAndTime = a.deviceNo && b.deviceNo && a.time && b.time && a.deviceNo === b.deviceNo && a.time === b.time
  return sameByQrAndTime || sameByDeviceAndTime
}

export function saveSuccessRecord(record = {}) {
  const nextRecord = normalizeRecord(record)
  const records = readRecords()
  const existedIndex = records.findIndex(item => isSameRecord(item, nextRecord))

  if (existedIndex !== -1) {
    records[existedIndex] = {
      ...records[existedIndex],
      ...nextRecord,
      saveTime: Date.now()
    }
  } else {
    records.unshift(nextRecord)
  }

  if (records.length > MAX_SUCCESS_RECORDS) {
    records.length = MAX_SUCCESS_RECORDS
  }

  return writeRecords(records)
}

export function getSuccessRecords() {
  return readRecords()
}

export function clearSuccessRecords() {
  try {
    uni.removeStorageSync(SUCCESS_RECORD_CACHE_KEY)
    return true
  } catch (e) {
    console.error('清空成功打卡缓存失败:', e)
    return false
  }
}
