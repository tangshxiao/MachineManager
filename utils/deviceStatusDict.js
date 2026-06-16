import http from '@/utils/request.js'
import API_ENDPOINTS from '@/config/api.js'

let cachedStatusOptions = null
let cachedStatusMap = null
let loadingPromise = null

const DEFAULT_STATUS_OPTIONS = [
  { label: '进场', value: '0' },
  { label: '在用', value: '1' },
  { label: '维修', value: '2' },
  { label: '退场', value: '3' }
]

function normalizeOptions(records = []) {
  return records
    .map(item => ({
      label: item && (item.label || item.dictLabel || item.name || ''),
      value: item && (item.value ?? item.id ?? '')
    }))
    .filter(item => item.label !== '')
}

function buildStatusMap(options = []) {
  const map = {}
  options.forEach(item => {
    if (item && item.value !== undefined && item.value !== null && item.value !== '') {
      map[String(item.value)] = item.label
    }
  })
  return map
}

export async function fetchDeviceStatusOptions(force = false) {
  if (!force && cachedStatusOptions) {
    return cachedStatusOptions
  }
  if (!force && loadingPromise) {
    return loadingPromise
  }

  loadingPromise = (async () => {
    try {
      const res = await http.post(API_ENDPOINTS.DICT_LIST_API, {
        code: 'device_status'
      })
      const records = Array.isArray(res) ? res : ((res && (res.records || res.data || res.list)) || [])
      const options = normalizeOptions(records)
      cachedStatusOptions = options.length ? options : DEFAULT_STATUS_OPTIONS
      cachedStatusMap = buildStatusMap(cachedStatusOptions)
      return cachedStatusOptions
    } catch (e) {
      cachedStatusOptions = DEFAULT_STATUS_OPTIONS
      cachedStatusMap = buildStatusMap(cachedStatusOptions)
      return cachedStatusOptions
    } finally {
      loadingPromise = null
    }
  })()

  return loadingPromise
}

export function getDeviceStatusLabel(status) {
  const key = String(status)
  if (cachedStatusMap && cachedStatusMap[key] !== undefined) {
    return cachedStatusMap[key]
  }
  const fallback = {
    0: '进场',
    1: '在用',
    2: '维修',
    3: '退场',
    4: '停工'
  }
  return fallback[key] || '未知'
}

export function getDeviceStatusClass(status) {
  const key = String(status)
  const map = {
    0: 'status-entry',
    1: 'status-using',
    2: 'status-maintenance',
    3: 'status-exit',
    4: 'status-stop'
  }
  return map[key] || 'status-entry'
}

export function getRecordStatusClass(status) {
  const key = String(status)
  const map = {
    0: 'tag-entry',
    1: 'tag-using',
    2: 'tag-maintenance',
    3: 'tag-exit',
    4: 'tag-stop'
  }
  return map[key] || 'tag-entry'
}

export function getCheckInTypeOptions(allOptions = []) {
  return (allOptions || []).filter(item => item && item.label !== '进场' && item.label !== '退场')
}

export function getCheckInTypeLabelByValue(value, options = []) {
  const item = (options || []).find(opt => String(opt.value) === String(value))
  return item ? item.label : ''
}
