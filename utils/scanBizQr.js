/**
 * 统一业务二维码扫码入口
 * - 仅允许扫码二维码
 * - 优先只从相机扫码
 * - 增强：autoZoom / autoDecodeCharset（平台不支持会自动忽略）
 * - 严格校验：内容必须为 JSON 且包含 qrNo
 */

function normalizeErrMsg(err) {
  if (!err) return ''
  if (typeof err === 'string') return err
  return String(err.errMsg || err.message || '')
}

export function parseBizQrResult(rawText) {
  const text = String(rawText || '').trim()
  // 快速特征过滤：必须像 JSON，且包含 qrNo（减少误识别进入 JSON.parse）
  if (!text.startsWith('{') || text.length < 10 || !text.includes('qrNo')) {
    return { ok: false, code: 'NOT_BIZ_QR', message: '非业务二维码' }
  }

  let data = null
  try {
    data = JSON.parse(text)
  } catch (e) {
    return { ok: false, code: 'INVALID_JSON', message: '二维码格式错误' }
  }

  if (!data || !data.qrNo) {
    return { ok: false, code: 'MISSING_QRNO', message: '非业务二维码' }
  }

  return { ok: true, text, data }
}

/**
 * 扫描业务二维码，成功返回 { text, data, scanType, charSet, raw }
 */
export function scanBizQrCode(options = {}) {
  const {
    onlyFromCamera = true,
    showFailToast = true,
    // uni.scanCode 原生配置透传
    scanCodeOptions = {}
  } = options

  return new Promise((resolve, reject) => {
    uni.scanCode({
      onlyFromCamera,
      scanType: ['qrCode'],
      // App 端可用：自动识别字符集、自动放大（Android）
      autoDecodeCharset: true,
      autoZoom: true,
      ...scanCodeOptions,
      success: (res) => {
        // 如果平台返回 scanType，则要求必须是 qrCode（部分端 scanType 可能为空）
        const st = String(res && res.scanType ? res.scanType : '').toLowerCase()
        if (st && !st.includes('qr')) {
          const err = { code: 'NOT_QR', message: '请扫描设备二维码', raw: res }
          if (showFailToast) uni.showToast({ title: err.message, icon: 'none' })
          reject(err)
          return
        }

        const parsed = parseBizQrResult(res && res.result)
        if (!parsed.ok) {
          const err = { code: parsed.code, message: parsed.message, raw: res }
          if (showFailToast) uni.showToast({ title: err.message, icon: 'none' })
          reject(err)
          return
        }

        resolve({
          text: parsed.text,
          data: parsed.data,
          scanType: res.scanType,
          charSet: res.charSet,
          raw: res
        })
      },
      fail: (err) => {
        const msg = normalizeErrMsg(err)
        // 用户取消不提示
        if (showFailToast && msg && !msg.includes('cancel')) {
          uni.showToast({ title: '扫码失败', icon: 'none' })
        }
        reject(err)
      }
    })
  })
}

