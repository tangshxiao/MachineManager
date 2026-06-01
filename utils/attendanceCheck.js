import http from '@/utils/request.js'
import API_ENDPOINTS from '@/config/api.js'
import { IN_SCOPE_IN, IN_SCOPE_OUT, assignInScopeToPayload } from '@/utils/inScope.js'

function parseCheckInRange(res) {
  if (typeof res === 'boolean') return res
  if (res && typeof res === 'object') {
    if (typeof res.pass === 'boolean') return res.pass
    if (typeof res.inRange === 'boolean') return res.inRange
    if (typeof res.result === 'boolean') return res.result
    if (typeof res.data === 'boolean') return res.data
  }
  return false
}

/**
 * 校验是否在打卡范围内
 * @returns {{ allowed: boolean, inScope: 0|1|null }}
 *   - allowed: 是否允许继续提交（范围内，或范围外但用户确认）
 *   - inScope: 1 范围内，0 范围外；用户取消时为 0 且 allowed=false
 */
export async function checkAttendanceInRange(payload, options = {}) {
  const { showErrorToast = true } = options
  const res = await http.post(API_ENDPOINTS.ATTENDANCE_CHECK_API, payload, {
    header: { 'Content-Type': 'application/json' },
    showLoading: false
  })
  const inRange = parseCheckInRange(res)
  if (inRange) {
    return { allowed: true, inScope: IN_SCOPE_IN }
  }

  if (showErrorToast) {
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
    return { allowed: confirmContinue, inScope: IN_SCOPE_OUT }
  }

  return { allowed: false, inScope: IN_SCOPE_OUT }
}

/**
 * 校验范围并将 inScope 写入 submitData（attendance/add 必填字段）
 */
export async function resolveAttendanceScope(submitData, options = {}) {
  const result = await checkAttendanceInRange(submitData, options)
  if (result.allowed && result.inScope !== null) {
    assignInScopeToPayload(submitData, result.inScope)
  }
  return result
}
