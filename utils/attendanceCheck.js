import http from '@/utils/request.js'
import API_ENDPOINTS from '@/config/api.js'

function parseCheckResult(res) {
  if (typeof res === 'boolean') return res
  if (res && typeof res === 'object') {
    if (typeof res.pass === 'boolean') return res.pass
    if (typeof res.inRange === 'boolean') return res.inRange
    if (typeof res.result === 'boolean') return res.result
    if (typeof res.data === 'boolean') return res.data
  }
  return false
}

export async function checkAttendanceInRange(payload, options = {}) {
  const { showErrorToast = true } = options
  const res = await http.post(API_ENDPOINTS.ATTENDANCE_CHECK_API, payload, {
    header: { 'Content-Type': 'application/json' },
    showLoading: false
  })
  const ok = parseCheckResult(res)
  if (!ok && showErrorToast) {
    const confirmContinue = await new Promise((resolve) => {
      uni.showModal({
        title: '提示',
        content: '当前没有在打卡范围内，是否继续打卡。',
        confirmText: '确认',
        cancelText: '取消',
        success: (modalRes) => resolve(!!modalRes.confirm),
        fail: () => resolve(false)
      })
    })
    return confirmContinue
  }
  return ok
}
