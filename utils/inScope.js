/** 后端 inScope：0 范围外，1 范围内 */
export const IN_SCOPE_OUT = 0
export const IN_SCOPE_IN = 1

/**
 * 规范化为 0 | 1 | null（null 表示未知/待判定）
 */
export function normalizeInScope(value) {
  if (value === 1 || value === '1' || value === true) return IN_SCOPE_IN
  if (value === 0 || value === '0' || value === false) return IN_SCOPE_OUT
  return null
}

export function getInScopeLabel(inScope) {
  const n = normalizeInScope(inScope)
  if (n === IN_SCOPE_IN) return '范围内'
  if (n === IN_SCOPE_OUT) return '范围外'
  return '待判定'
}

export function getInScopeTagClass(inScope) {
  const n = normalizeInScope(inScope)
  if (n === IN_SCOPE_IN) return 'in-scope-tag in-scope-in'
  if (n === IN_SCOPE_OUT) return 'in-scope-tag in-scope-out'
  return 'in-scope-tag in-scope-unknown'
}

/**
 * 从列表项 / 离线缓存记录 / submitData 中解析 inScope
 */
export function resolveInScopeFromRecord(record = {}) {
  if (!record || typeof record !== 'object') return null

  const direct = normalizeInScope(record.inScope)
  if (direct !== null) return direct

  if (record.data) {
    try {
      const parsed = typeof record.data === 'string' ? JSON.parse(record.data) : record.data
      const fromData = normalizeInScope(parsed && parsed.inScope)
      if (fromData !== null) return fromData
    } catch (e) {
      // ignore parse error
    }
  }

  return null
}

export function assignInScopeToPayload(payload, inScope) {
  if (!payload || typeof payload !== 'object') return payload
  const normalized = normalizeInScope(inScope)
  if (normalized !== null) {
    payload.inScope = normalized
  }
  return payload
}
