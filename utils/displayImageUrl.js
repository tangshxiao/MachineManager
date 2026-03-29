import { getApiOrigin } from '@/config/api.js'

function hasUrlProtocol(s) {
  return /^https?:\/\//i.test(s) || s.startsWith('//') || /^(file|blob|data|wxfile):/i.test(s)
}

/**
 * 列表/预览用图片地址：补全后端返回的相对路径，便于 <image> 与 uni.previewImage 加载
 */
export function normalizeDisplayImgUrl(u) {
  const s = String(u || '').trim()
  if (!s) return s
  if (/^https?:\/\//i.test(s)) return s
  if (s.startsWith('//')) return `https:${s}`
  if (s.startsWith('file:') || s.startsWith('blob:') || s.startsWith('data:') || /^wxfile:\/\//i.test(s)) {
    return s
  }
  if (s.startsWith('/static')) return s
  const origin = getApiOrigin()
  if (!origin) return s
  if (s.startsWith('/')) return origin + s
  // 无协议相对路径：upload/xxx.jpg、app/upload/...
  if (!hasUrlProtocol(s) && (s.includes('/') || /\.(jpe?g|png|gif|webp|bmp)(\?|#|$)/i.test(s))) {
    return `${origin}/${s.replace(/^\//, '')}`
  }
  return s
}

/**
 * 判断是否像可加载的图片地址（用于区分「有 imgs 字段但全是垃圾/无效」与真实 URL）
 */
export function isProbablyDisplayableImageUrl(u) {
  const s = normalizeDisplayImgUrl(u)
  const t = String(s || '').trim()
  if (!t) return false
  const low = t.toLowerCase()
  if (low === 'null' || low === 'undefined') return false
  if (/^https?:\/\//i.test(t)) return true
  if (t.startsWith('//')) return true
  if (/^(file|blob|data|wxfile):/i.test(t)) return true
  if (t.startsWith('/static')) return true
  if (t.startsWith('/') && getApiOrigin()) return true
  return false
}
