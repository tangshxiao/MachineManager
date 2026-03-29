/**
 * 当前选中的项目 ID（与首页 selectedProjectIds 一致，取第一个），用于 attendance/add 的 pid
 */
export function getSelectedProjectIdForApi() {
  try {
    const ids = uni.getStorageSync('selectedProjectIds')
    if (ids == null || ids === '') return 0
    const first = String(ids).split(',')[0].trim()
    const n = Number(first)
    return Number.isFinite(n) ? n : 0
  } catch (e) {
    return 0
  }
}

/**
 * 上报前补全 pid：优先 submitData，其次离线缓存根字段，再回退当前选中项目
 */
export function ensureAttendanceSubmitPid(submitData, rawRecord = {}) {
  if (!submitData || typeof submitData !== 'object') return submitData
  const pidFromSubmit = Number(submitData.pid)
  if (Number.isFinite(pidFromSubmit) && pidFromSubmit > 0) {
    submitData.pid = pidFromSubmit
    return submitData
  }
  let pid = 0
  if (rawRecord.pid != null && rawRecord.pid !== '') {
    pid = Number(rawRecord.pid) || 0
  }
  if (!pid) pid = getSelectedProjectIdForApi()
  submitData.pid = pid
  return submitData
}
