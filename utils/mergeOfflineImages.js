/**
 * 与离线缓存列表一致：优先本地路径数组（record.images 或 record.localImages），否则用 imgs 逗号分隔
 */
export function mergeImagesLikeOfflineRecord(record) {
  if (!record) return []
  if (record.images && record.images.length > 0) {
    return record.images.filter(Boolean)
  }
  if (record.localImages && record.localImages.length > 0) {
    return record.localImages.filter(Boolean)
  }
  const imgs = record.imgs
  if (imgs && typeof imgs === 'string' && imgs.trim()) {
    return imgs.split(',').map((s) => s.trim()).filter(Boolean)
  }
  return []
}
