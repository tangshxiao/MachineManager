import http from '@/utils/request.js'
import API_ENDPOINTS from '@/config/api.js'
import { getSelectedProjectIdForApi } from '@/utils/attendancePid.js'

/**
 * 校验设备是否属于当前选择项目（基于 qrNo 查询设备 pid）
 * - 无当前选择项目：放行
 * - 无 qrNo：放行（无法判断）
 * - 查询失败：放行（避免接口波动阻断提交流程）
 */
export async function ensureDeviceInSelectedProject({
  submitData = {},
  rawData = {},
  qrDetails = null,
  showToast = true
} = {}) {
  const selectedPid = String(getSelectedProjectIdForApi() || '').trim()
  if (!selectedPid) return true

  const qrNo = String(submitData.qrNo || rawData.qrNo || '').trim()
  if (!qrNo) return true

  let detail = qrDetails
  if (!detail) {
    try {
      detail = await http.post(
        API_ENDPOINTS.DEVICE_QR_DETAILS_API,
        { qrNo },
        { showLoading: false, suppressNoNetworkToast: true }
      )
    } catch (e) {
      return true
    }
  }

  const devicePid = detail && detail.pid != null ? String(detail.pid).trim() : ''
  if (devicePid && devicePid !== selectedPid) {
    if (showToast) {
      uni.showToast({
        title: '当前设备不在选择项目内，请切换项目后重新打卡',
        icon: 'none'
      })
    }
    return false
  }
  return true
}
