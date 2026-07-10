import { TIANDITU_GEOCODER_KEY, TIANDITU_GEOCODER_URL, QQ_MAP_GEOCODER_KEY, QQ_MAP_GEOCODER_URL } from '@/config/api.js'

const DEFAULT_TIMEOUT = 8000

export async function getLocationForUpload(timeout = 20000) {
  return new Promise((resolve) => {
    uni.getLocation({
      type: 'gcj02',
      timeout,
      success: (res) => {
        const lng = res.longitude != null ? String(res.longitude) : ''
        const lat = res.latitude != null ? String(res.latitude) : ''
        resolve({ lng, lat })
      },
      fail: () => resolve({ lng: '', lat: '' })
    })
  })
}

function pickTianDiTuAddress(data) {
  return (
    data?.result?.formatted_address ||
    data?.result?.address ||
    data?.result?.pois?.[0]?.address ||
    ''
  )
}

function pickTencentAddress(data) {
  return data?.result?.address || data?.result?.formatted_addresses?.recommend || ''
}

function requestJson(url, data, timeout = DEFAULT_TIMEOUT) {
  return new Promise((resolve) => {
    uni.request({
      url,
      method: 'GET',
      data,
      timeout,
      success: (res) => resolve(res),
      fail: (err) => resolve({ fail: true, err })
    })
  })
}

async function reverseGeocodeByTianDiTu(lng, lat) {
  if (!lng || !lat) return ''
  console.log('[逆地理编码] 尝试使用天地图', { lng, lat, url: TIANDITU_GEOCODER_URL })
  const res = await requestJson(TIANDITU_GEOCODER_URL, {
    postStr: JSON.stringify({ lon: Number(lng), lat: Number(lat), ver: 1 }),
    type: 'geocode',
    tk: TIANDITU_GEOCODER_KEY,
    showLocation: 'false'
  })
  const data = res?.data || {}
  if (res?.statusCode === 200 && (data?.status === '0' || data?.status === 0)) {
    const address = pickTianDiTuAddress(data)
    console.log('[逆地理编码] 天地图成功', { address, rawStatus: data?.status, rawMsg: data?.msg })
    return address
  }
  console.warn('[逆地理编码] 天地图失败，准备回退腾讯', {
    statusCode: res?.statusCode,
    status: data?.status,
    msg: data?.msg,
    result: data?.result
  })
  return ''
}

async function reverseGeocodeByTencent(lng, lat) {
  if (!lng || !lat) return ''
  console.log('[逆地理编码] 尝试使用腾讯', { lng, lat, url: QQ_MAP_GEOCODER_URL })
  const res = await requestJson(QQ_MAP_GEOCODER_URL, {
    location: `${lat},${lng}`,
    key: QQ_MAP_GEOCODER_KEY,
    get_poi: 1
  })
  const data = res?.data || {}
  if (res?.statusCode === 200 && data?.status === 0) {
    const address = pickTencentAddress(data)
    console.log('[逆地理编码] 腾讯成功', { address, rawStatus: data?.status, rawMsg: data?.message })
    return address
  }
  console.warn('[逆地理编码] 腾讯失败', {
    statusCode: res?.statusCode,
    status: data?.status,
    message: data?.message,
    result: data?.result
  })
  return ''
}

export async function reverseGeocodeByLngLat(lng, lat) {
  const tianDiTuAddress = await reverseGeocodeByTianDiTu(lng, lat)
  if (tianDiTuAddress) return tianDiTuAddress
  return await reverseGeocodeByTencent(lng, lat)
}

export async function reverseGeocodeByLngLatTencentOnly(lng, lat) {
  return await reverseGeocodeByTencent(lng, lat)
}

export async function ensureAddressForUpload({
  address = '',
  lng = '',
  lat = '',
  needLocateWhenMissing = true
} = {}) {
  let nextLng = lng || ''
  let nextLat = lat || ''
  let nextAddress = address || ''

  if ((!nextLng || !nextLat) && needLocateWhenMissing) {
    const loc = await getLocationForUpload()
    nextLng = nextLng || loc.lng
    nextLat = nextLat || loc.lat
  }

  if ((!nextAddress || String(nextAddress).trim() === '') && nextLng && nextLat) {
    const geoAddress = await reverseGeocodeByLngLat(nextLng, nextLat)
    if (geoAddress) {
      nextAddress = geoAddress
    }
  }

  return {
    lng: nextLng,
    lat: nextLat,
    address: nextAddress
  }
}
