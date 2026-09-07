/**
 * RSA 加解密工具（纯 RSA，长文本分段）
 * 对齐后端 RSAUtils.java：
 * - RSA/ECB/PKCS1Padding
 * - 4096-bit：明文块 ≤501 字节，密文块 512 字节
 * - 分段后密文字节拼接，再整体 Base64
 */
import JSEncrypt from 'jsencrypt'

/** 总开关：false 时不做任何加解密，便于联调回退 */
export const RSA_ENABLED = true

/** 加解密日志开关：控制台打印加密前/后、解密前/后（完整不截断） */
export const RSA_LOG_ENABLED = true

/** 与后端 RSAUtils.MAX_ENCRYPT_BLOCK / MAX_DECRYPT_BLOCK 一致（4096-bit） */
const MAX_ENCRYPT_BLOCK = 501
const MAX_DECRYPT_BLOCK = 512

function logRsa(tag, value) {
  if (!RSA_LOG_ENABLED) return
  if (value != null && typeof value === 'object') {
    try {
      console.log(`[RSA] ${tag}`, JSON.stringify(value))
      return
    } catch (e) {}
  }
  console.log(`[RSA] ${tag}`, value)
}

const PUBLIC_KEY_BODY =
  'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAxANbTN6QPaQZhvhdWFbZYNuXgXH18WRsfFvJDO30SyU9Zpf6vvSR6LkPynj0QX/lfonK1KmlVKg9R/vLPRVEyWLSJZLkTPXoG+tOjUtn70Ghd78YEW9cuDby7PuFSJKBgCwopWsiCndsP20gPy5+JUhOHonsBZmNntsGKbTdrMiZxlLb98lVwjRGAJAz7gGtOanonaF9rVfrMywMFau5OUGSAcK5HevEOauas8mKnAFw9iUKXSzuqG4jRkwnDEBn+TpYpt2FX/w11mVcAPELWfJPaan85So3YC4SShHl8AuuoGzuwizMB5iwF+iAwTGOD6jnmQ/QNQrGNafincRkl7Ep8Wft7mGvrjdUaZD/933Gdbe0csRLytHPGnoOclUEuA7NuRoT/7HeWkTjNpu0VFdXGzKzSP+90IH2fu4WMYcCvDv+5EMd2WB9Y9o3g1FSOM13LEefERQ72iDx+WPGYMzsteYrsuTbmP5q1tVrKt4U6QcHiog82KYETnBP2G5DQTnQMfnl2cuNpbTRZapM12iugECkC5LFbEGM6g+GVWaZq/8hA0oocoe1Z663DdgWjPDuEvmyaNlkYsNlP4A5Cx15DF3vXyVGgQ3DqAmj04JkjlRatIQ1mzVVFXmgbA2amezv/EGo8QfICLytLFHGD6hKT//TXDrOjQX7gZIg10ECAwEAAQ=='

const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
${PUBLIC_KEY_BODY}
-----END PUBLIC KEY-----`

const B64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

let encryptor = null

function getEncryptor() {
  if (!encryptor) {
    encryptor = new JSEncrypt()
    encryptor.setPublicKey(PUBLIC_KEY_PEM)
  }
  return encryptor
}

function getKey() {
  return getEncryptor().getKey()
}

function utf8ByteLength(ch) {
  const code = ch.codePointAt(0)
  if (code <= 0x7f) return 1
  if (code <= 0x7ff) return 2
  if (code <= 0xffff) return 3
  return 4
}

/** 按 UTF-8 字节切分，块大小对齐后端 MAX_ENCRYPT_BLOCK=501 */
function splitByUtf8Bytes(text, maxBytes) {
  const chunks = []
  let current = ''
  let currentBytes = 0

  for (const ch of String(text)) {
    const size = utf8ByteLength(ch)
    if (currentBytes + size > maxBytes) {
      if (current) chunks.push(current)
      current = ch
      currentBytes = size
    } else {
      current += ch
      currentBytes += size
    }
  }

  if (current) chunks.push(current)
  return chunks.length ? chunks : ['']
}

function hex2b64(h) {
  let i
  let c
  let ret = ''
  for (i = 0; i + 3 <= h.length; i += 3) {
    c = parseInt(h.substring(i, i + 3), 16)
    ret += B64_MAP.charAt(c >> 6) + B64_MAP.charAt(c & 63)
  }
  if (i + 1 === h.length) {
    c = parseInt(h.substring(i, i + 1), 16)
    ret += B64_MAP.charAt(c << 2)
  } else if (i + 2 === h.length) {
    c = parseInt(h.substring(i, i + 2), 16)
    ret += B64_MAP.charAt(c >> 2) + B64_MAP.charAt((c & 3) << 4)
  }
  while ((ret.length & 3) > 0) ret += '='
  return ret
}

function b64tohex(s) {
  let ret = ''
  let i
  let k = 0
  let slop = 0
  for (i = 0; i < s.length; ++i) {
    if (s.charAt(i) === '=') break
    const v = B64_MAP.indexOf(s.charAt(i))
    if (v < 0) continue
    if (k === 0) {
      ret += int2char(v >> 2)
      slop = v & 3
      k = 1
    } else if (k === 1) {
      ret += int2char((slop << 2) | (v >> 4))
      slop = v & 0xf
      k = 2
    } else if (k === 2) {
      ret += int2char(slop)
      ret += int2char(v >> 2)
      slop = v & 3
      k = 3
    } else {
      ret += int2char((slop << 2) | (v >> 4))
      ret += int2char(v & 0xf)
      k = 0
    }
  }
  if (k === 1) ret += int2char(slop << 2)
  return ret
}

function int2char(n) {
  return '0123456789abcdefghijklmnopqrstuvwxyz'.charAt(n)
}

function padHexToKeySize(hex, keyBytes) {
  let out = hex
  const targetLen = keyBytes * 2
  while (out.length < targetLen) {
    out = '0' + out
  }
  return out
}

function parseBigIntHex(hex) {
  const key = getKey()
  return new key.n.constructor(hex, 16)
}

/**
 * PKCS#1 unpad（兼容 type1 私钥加密 / type2 公钥加密）
 */
function pkcs1Unpad(bi) {
  const bytes = bi.toByteArray()
  let i = 0
  while (i < bytes.length && bytes[i] === 0) i++

  const type = bytes[i]
  if (type !== 1 && type !== 2) return null
  i++

  while (i < bytes.length && bytes[i] !== 0) {
    i++
  }
  if (i >= bytes.length) return null
  i++

  let ret = ''
  while (i < bytes.length) {
    const c = bytes[i] & 255
    if (c < 128) {
      ret += String.fromCharCode(c)
    } else if (c > 191 && c < 224 && i + 1 < bytes.length) {
      ret += String.fromCharCode(((c & 31) << 6) | (bytes[i + 1] & 63))
      i++
    } else if (i + 2 < bytes.length) {
      ret += String.fromCharCode(
        ((c & 15) << 12) | ((bytes[i + 1] & 63) << 6) | (bytes[i + 2] & 63)
      )
      i += 2
    }
    i++
  }
  return ret
}

/**
 * 公钥加密 —— 对齐 RSAUtils.encryptByPublicKey
 * 分段加密 → 密文字节拼接 → 整体 Base64
 */
export function rsaEncrypt(plainText) {
  if (plainText == null) return ''
  const text = String(plainText)
  const key = getKey()
  const chunks = splitByUtf8Bytes(text, MAX_ENCRYPT_BLOCK)

  let hexAll = ''
  for (let i = 0; i < chunks.length; i++) {
    const hex = key.encrypt(chunks[i])
    if (!hex) {
      throw new Error('RSA 加密失败')
    }
    hexAll += padHexToKeySize(hex, MAX_DECRYPT_BLOCK)
  }

  return hex2b64(hexAll)
}

/**
 * 公钥解密 —— 对齐 RSAUtils.decryptByPublicKey（响应：私钥加密 → 公钥解密）
 * 整体 Base64 解码 → 按 512 字节切块解密 → 拼接明文
 */
export function rsaDecrypt(cipherText) {
  if (cipherText == null || cipherText === '') return cipherText
  let text = String(cipherText).replace(/\s/g, '')
  if (text.charAt(0) === '"' && text.charAt(text.length - 1) === '"') {
    try {
      text = JSON.parse(text)
    } catch (e) {}
  }

  const key = getKey()
  const hexAll = b64tohex(text)
  const blockHexLen = MAX_DECRYPT_BLOCK * 2

  if (!hexAll || hexAll.length % blockHexLen !== 0) {
    return null
  }

  let plain = ''
  for (let i = 0; i < hexAll.length; i += blockHexLen) {
    const blockHex = hexAll.substring(i, i + blockHexLen)
    const c = parseBigIntHex(blockHex)
    const m = key.doPublic(c)
    if (!m) return null
    const part = pkcs1Unpad(m)
    if (part == null) return null
    plain += part
  }
  return plain
}

/**
 * 加密请求体
 * - application/json：整段 JSON 字符串加密，发裸密文
 * - form / x-www-form-urlencoded：每个 value 加密，key 保持明文
 */
export function encryptRequestData(data, contentType = '') {
  if (!RSA_ENABLED) return data

  const type = (contentType || '').toLowerCase()
  const mode = type.includes('application/json') ? 'json整包' : 'form-value'

  logRsa(`加密前 (${mode})`, data)
  if (type.includes('application/json')) {
    const jsonStr = typeof data === 'string' ? data : JSON.stringify(data ?? {})
    logRsa('加密前-JSON字符串', jsonStr)
  }

  let encryptedResult

  if (type.includes('application/json')) {
    const jsonStr = typeof data === 'string' ? data : JSON.stringify(data ?? {})
    encryptedResult = rsaEncrypt(jsonStr)
    logRsa('加密后 (json整包-裸密文)', encryptedResult)
    logRsa('加密后-信息', {
      plainLength: jsonStr.length,
      cipherLength: String(encryptedResult).length,
      maxEncryptBlock: MAX_ENCRYPT_BLOCK,
      maxDecryptBlock: MAX_DECRYPT_BLOCK
    })
  } else if (data && typeof data === 'object' && !Array.isArray(data)) {
    const encrypted = {}
    Object.keys(data).forEach((k) => {
      const value = data[k]
      if (value === undefined || value === null) {
        encrypted[k] = rsaEncrypt('')
      } else if (typeof value === 'object') {
        encrypted[k] = rsaEncrypt(JSON.stringify(value))
      } else {
        encrypted[k] = rsaEncrypt(String(value))
      }
    })
    encryptedResult = encrypted
    logRsa(`加密后 (${mode})`, encryptedResult)
  } else if (typeof data === 'string') {
    encryptedResult = rsaEncrypt(data)
    logRsa(`加密后 (${mode})`, encryptedResult)
  } else {
    encryptedResult = data
    logRsa(`加密后 (${mode})`, encryptedResult)
  }

  return encryptedResult
}

/**
 * 解密响应：支持整包密文字符串，或 { code, data, msg } 中 data 为密文
 */
export function decryptResponsePayload(payload) {
  if (!RSA_ENABLED || payload == null) return payload

  logRsa('解密前', payload)

  if (typeof payload === 'string') {
    const decrypted = rsaDecrypt(payload)
    if (decrypted == null) {
      logRsa('解密后 (跳过: 非密文或解密失败)', payload)
      return payload
    }
    let result = decrypted
    try {
      result = JSON.parse(decrypted)
    } catch (e) {}
    logRsa('解密后', result)
    return result
  }

  if (typeof payload === 'object' && typeof payload.data === 'string') {
    const decrypted = rsaDecrypt(payload.data)
    if (decrypted == null) {
      logRsa('解密后 (跳过: data 非密文或解密失败)', payload)
      return payload
    }

    let data = decrypted
    try {
      data = JSON.parse(decrypted)
    } catch (e) {}

    const result = {
      ...payload,
      data
    }
    logRsa('解密后', result)
    return result
  }

  logRsa('解密后 (跳过: 无需解密)', payload)
  return payload
}

export default {
  RSA_ENABLED,
  RSA_LOG_ENABLED,
  rsaEncrypt,
  rsaDecrypt,
  encryptRequestData,
  decryptResponsePayload
}
