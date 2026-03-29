/**
 * 将拍照/选图得到的临时路径转为本地持久路径，降低被系统回收后离线预览失败的概率。
 * 说明：无法禁止系统清理临时目录；saveFile 会把文件存到用户目录（小程序为 USER_DATA_PATH 等），一般可长期保留直至用户清数据/卸载。
 */

function isRemoteOrSpecialUrl(p) {
  const s = String(p || '').trim()
  if (!s) return true
  if (/^https?:\/\//i.test(s)) return true
  if (/^data:/i.test(s)) return true
  if (s.startsWith('blob:')) return true
  return false
}

/**
 * 单张本地图持久化；已是网络地址或 saveFile 不可用时原样返回
 */
export function persistLocalImagePath(filePath) {
  const p = String(filePath || '').trim()
  if (!p || isRemoteOrSpecialUrl(p)) {
    return Promise.resolve(p)
  }
  if (typeof uni.saveFile !== 'function') {
    return Promise.resolve(p)
  }
  return new Promise((resolve) => {
    uni.saveFile({
      tempFilePath: p,
      success: (res) => resolve(res.savedFilePath || p),
      fail: (err) => {
        console.warn('persistLocalImagePath: saveFile 失败，保留原路径', err)
        resolve(p)
      }
    })
  })
}

/**
 * 批量持久化；用于离线缓存 record.images
 */
export async function persistLocalImagePaths(paths) {
  if (!Array.isArray(paths) || paths.length === 0) return []
  return Promise.all(paths.map((x) => persistLocalImagePath(x)))
}

/**
 * 拷贝 record，将其中的 images 数组替换为持久化后的路径（无 images 则原样返回）
 */
export async function withPersistedLocalImages(record) {
  if (!record || !Array.isArray(record.images) || record.images.length === 0) {
    return record
  }
  const persisted = await persistLocalImagePaths(record.images)
  return { ...record, images: persisted }
}
