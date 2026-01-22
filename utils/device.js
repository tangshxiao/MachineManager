export const getDeviceIdentifier = () => {
  // 1. 优先尝试获取存储在本地的 ID（避免每次 ID 变动）
  let deviceId = uni.getStorageSync('device_id');
  
  if (deviceId) {
    return deviceId;
  }

  // 2. 如果没有，获取系统信息的 deviceId
  const res = uni.getSystemInfoSync();
  deviceId = res.deviceId;

  // 3. 如果系统也没取到（比如Web端），生成一个随机UUID作为替补
  if (!deviceId) {
     deviceId = 'web_dev_' + Date.now() + Math.random().toString(36).substr(2);
  }

  // 4. 存入缓存，保证下次还是它
  uni.setStorageSync('device_id', deviceId);
  return deviceId;
}