const QQ_MAP_KEY = 'OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77'

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

export async function reverseGeocodeByLngLat(lng, lat) {
  if (!lng || !lat) return ''
  return new Promise((resolve) => {
    uni.request({
      url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${lat},${lng}&key=${QQ_MAP_KEY}&get_poi=1`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.status === 0) {
          resolve((res.data.result && res.data.result.address) || '')
          return
        }
        resolve('')
      },
      fail: () => resolve('')
    })
  })
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
