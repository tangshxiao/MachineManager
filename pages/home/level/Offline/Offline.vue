<template>
  <view class="container">
    
    <!-- 网络恢复提示 -->
    <view class="network-notice" v-if="showNetworkNotice && hasPendingRecords">
      <text>已检测到网络，可上传缓存数据</text>
      <view class="notice-upload-btn" @click="uploadAll">立即上传</view>
    </view>

    <!-- 无网络提示 -->
    <view class="offline-notice" v-if="!isOnline && hasPendingRecords">
      <text>当前无网络，数据已本地缓存，已缓存数据{{ stats.pending }}条</text>
    </view>

    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-num blue">{{ stats.total }}</text>
        <text class="stat-label">总缓存记录</text>
      </view>
      <view class="stat-item">
        <text class="stat-num orange">{{ stats.pending }}</text>
        <text class="stat-label">未上传</text>
      </view>
      <view class="stat-item">
        <text class="stat-num green">{{ stats.success }}</text>
        <text class="stat-label">已上传</text>
      </view>
      <view class="stat-item">
        <text class="stat-num gray">{{ stats.corrupted }}</text>
        <text class="stat-label">损坏</text>
      </view>
    </view>

    <view class="upload-all-card" @click="uploadAll">
      <view class="cloud-icon">&#xe663;️</view> <text>立即上传全部</text>
    </view>

    <scroll-view scroll-y class="list-container">
      <view class="record-card" v-for="(item, index) in listData" :key="item.id">
        
        <view class="select-area" v-if="isSelectMode">
          <checkbox :checked="item.selected" @click="toggleItemSelect(index)" color="#196AD4" style="transform:scale(0.8)"/>
        </view>

        <view class="card-content">
          <view class="card-header">
            <view class="header-left">
              <text class="device-name">{{ item.deviceName }}</text>
              <text class="device-no">({{ item.deviceNo }})</text>
              <view class="tag" :class="getTagClass(item.tag)">{{ item.tag }}</view>
            </view>
            <view class="header-right">
              <text v-if="item.status === 'corrupted'" class="status-text red">● 数据损坏</text>
              <text v-else-if="item.status === 'success'" class="status-text green">● 已上传</text>
              <text v-else class="status-text gray">● 未上传</text>
            </view>
          </view>
          
          <view class="time-text">{{ item.time }}</view>

          <view class="card-body">
            <image :src="item.imgUrl" mode="aspectFill" class="thumb-img"></image>
            <view class="location-info">
              <text class="iconfont-location-icon">&#xe847;</text>
              <text>{{ item.location }}</text>
            </view>
          </view>

          <view class="card-actions">
            <template v-if="item.status === 'corrupted'">
              <view class="btn delete-btn" @click.stop="handleCorruptedDelete(index)">删除</view>
              <view class="btn primary-btn" @click.stop="goToDetail(item)">查看详情</view>
            </template>
            <template v-else-if="item.status === 'success'">
              <view class="btn primary-btn" @click.stop="goToDetail(item)">查看详情</view>
            </template>
            
            <template v-else>
              <view class="btn outline-btn" @click.stop="reUploadOne(item)">重新上传</view>
              <view class="btn primary-btn" @click.stop="goToDetail(item)">查看详情</view>
            </template>
          </view>
        </view>
      </view>

      <view style="height: 120rpx;"></view>
    </scroll-view>

    <view class="bottom-notice" v-if="!isSelectMode && uploadResult">
      <text>{{ uploadResult.total }}条记录中{{ uploadResult.success }}条上传成功，<text class="red-text">{{ uploadResult.failed }}条失败</text>。</text>
      <view class="notice-btn" @click="clearUploadResult">查看详情</view>
    </view>

    <view class="bottom-action-bar" v-if="isSelectMode && hasSelectedItems">
      <view class="action-btn" @click="uploadSelectedItems">选中数据重新上传</view>
    </view>

    <!-- 详情对话框 -->
    <view class="modal-mask" v-if="showDetailModal" @tap="closeDetailModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">缓存记录详情</text>
          <view class="modal-close" @tap="closeDetailModal">
            <text class="close-icon">×</text>
          </view>
        </view>
        
        <view class="modal-body" v-if="currentDetail">
          <view class="detail-item">
            <text class="detail-label">设备编号</text>
            <text class="detail-value">{{ currentDetail.deviceNo || '-' }}</text>
          </view>
          
          <view class="detail-item">
            <text class="detail-label">设备名称</text>
            <text class="detail-value">{{ currentDetail.deviceName || '-' }}</text>
          </view>
          
          <view class="detail-item">
            <text class="detail-label">打卡类型</text>
            <text class="detail-value">{{ currentDetail.tag || '-' }}</text>
          </view>
          
          <view class="detail-item">
            <text class="detail-label">打卡时间</text>
            <text class="detail-value">{{ currentDetail.time || '-' }}</text>
          </view>
          
          <view class="detail-item">
            <text class="detail-label">位置</text>
            <text class="detail-value">{{ currentDetail.address || '-' }}</text>
          </view>
          
          <view class="detail-item">
            <text class="detail-label">GPS坐标</text>
            <text class="detail-value">{{ getGpsCoordinate(currentDetail.lng, currentDetail.lat) }}</text>
          </view>
          
          <view class="detail-item" v-if="currentDetail.images && currentDetail.images.length > 0">
            <text class="detail-label">图片</text>
            <view class="detail-images">
              <image 
                v-for="(img, imgIndex) in currentDetail.images" 
                :key="imgIndex"
                class="detail-img" 
                :src="img" 
                mode="aspectFill"
                @tap="previewDetailImages(imgIndex)"
              ></image>
            </view>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="modal-close-btn" @tap="closeDetailModal">关闭</button>
        </view>
      </view>
    </view>
	 
  </view>
</template>

<script>
import { 
  getAllCacheRecords, 
  deleteCacheRecord, 
  markRecordUploaded,
  updateCacheRecord,
  getCacheStats,
  checkAndFixCorruptedRecords
} from '@/utils/offlineCache.js'
import http from '@/utils/request.js'
import API_ENDPOINTS from '@/config/api.js'

export default {
	
  data() {
    return {
      listData: [],
      stats: {
        total: 0,
        pending: 0,
        success: 0,
        corrupted: 0
      },
      isSelectMode: false,
      showNetworkNotice: false,
      uploadResult: null,
      uploading: false,
      isOnline: true, // 网络状态
      showDetailModal: false, // 是否显示详情对话框
      currentDetail: null, // 当前详情数据
      qrDeviceInfoMap: {} // qrNo -> { deviceNo, deviceName }
    };
  },
  
  computed: {
    // 检查是否有选中的项
    hasSelectedItems() {
      return this.listData.some(item => item.selected);
    },
    // 是否有待上传的记录
    hasPendingRecords() {
      return this.stats.pending > 0;
    }
  },
  
  async onLoad() {
    await this.loadCacheData();
    await this.checkNetworkStatus();
  },
  
  async onShow() {
    // 页面显示时刷新数据
    await this.loadCacheData();
    await this.checkNetworkStatus();
  },
  methods: {
    // 是否为可用文本（排除占位值）
    isValidDeviceText(val) {
      const txt = (val == null ? '' : String(val)).trim();
      if (!txt) return false;
      if (txt === '-' || txt === '--') return false;
      if (txt === '未知设备' || txt === '未知') return false;
      return true;
    },

    // 通过 qrNo 查询设备信息（用于离线列表展示）
    async fetchDeviceInfoByQrNo(qrNo) {
      if (!qrNo) return null;
      if (this.qrDeviceInfoMap[qrNo]) return this.qrDeviceInfoMap[qrNo];

      try {
        const detail = await http.post(API_ENDPOINTS.DEVICE_QR_DETAILS_API, { qrNo });
        const info = {
          deviceNo: (detail && detail.deviceNo) || '',
          deviceName: (detail && detail.deviceName) || (detail && detail.name) || ''
        };
        this.qrDeviceInfoMap[qrNo] = info;
        return info;
      } catch (e) {
        return null;
      }
    },

    // 批量补齐离线记录中的设备信息（在线时）
    async enrichDeviceInfoByQrNo(records) {
      if (!this.isOnline || !records || records.length === 0) return records;

      const enriched = await Promise.all(records.map(async (record) => {
        // 只有设备编号/名称都无效时才查询，避免占位值阻断接口请求
        const hasValidNo = this.isValidDeviceText(record.deviceNo);
        const hasValidName = this.isValidDeviceText(record.deviceName);
        if ((hasValidNo && hasValidName) || !record.qrNo) return record;
        const deviceInfo = await this.fetchDeviceInfoByQrNo(record.qrNo);
        if (!deviceInfo) return record;
        return {
          ...record,
          deviceNo: hasValidNo ? record.deviceNo : (deviceInfo.deviceNo || ''),
          deviceName: hasValidName ? record.deviceName : (deviceInfo.deviceName || '')
        };
      }));

      return enriched;
    },

    // 加载缓存数据
    async loadCacheData() {
      await this.checkNetworkStatus();
      // 检查并修复损坏的记录
      checkAndFixCorruptedRecords();
      
      // 获取所有记录
      let records = getAllCacheRecords();
      records = await this.enrichDeviceInfoByQrNo(records);
      
      // 转换为列表数据格式
      this.listData = records
        .filter(record => record.uploadStatus !== 'deleted') // 保留成功记录，除非显式删除
        .map(record => ({
          id: record.id,
          deviceName: this.isValidDeviceText(record.deviceName) ? record.deviceName : '未知设备',
          deviceNo: this.isValidDeviceText(record.deviceNo) ? record.deviceNo : '-',
          tag: record.tag || '未知',
          time: record.time || '',
          status: record.uploadStatus === 'corrupted'
            ? 'corrupted'
            : (record.uploadStatus === 'success' ? 'success' : 'normal'),
          location: record.address || '未知地址',
          imgUrl: record.images && record.images.length > 0 ? record.images[0] : '/static/leaf.jpg',
          selected: false,
          rawData: record // 保存原始数据用于上传
        }));
      
      // 更新统计数据
      this.stats = getCacheStats();
    },
    
    // 检测网络状态
    async checkNetworkStatus() {
      return new Promise((resolve) => {
        uni.getNetworkType({
          success: (res) => {
            const isOnline = res.networkType !== 'none' && res.networkType !== 'unknown';
            this.isOnline = isOnline;
            this.showNetworkNotice = isOnline && this.hasPendingRecords;
            resolve(isOnline);
          },
          fail: () => {
            this.isOnline = false;
            this.showNetworkNotice = false;
            resolve(false);
          }
        });
      });
    },
    
    // 单选切换
    toggleItemSelect(index) {
      this.listData[index].selected = !this.listData[index].selected;
    },
    
    // 获取标签样式
    getTagClass(tag) {
      if (tag === '异常上报') return 'tag-red';
      if (tag === '进场') return 'tag-green';
      return 'tag-blue'; // 默认退场
    },
    
    // 查看详情
    async goToDetail(item) {
      // 从原始数据中提取详情信息
      const rawData = item.rawData || {};
      
      // 先尝试从 data JSON 字符串中解析（这是最完整的数据）
      let parsedData = {};
      if (rawData.data) {
        try {
          parsedData = JSON.parse(rawData.data);
          console.log('解析的缓存数据:', parsedData);
        } catch (e) {
          console.warn('解析缓存数据失败:', e);
        }
      }

      // 详情兜底：设备编号/名称缺失时，按 qrNo 再查询一次
      let detailQrInfo = null;
      const fallbackQrNo = rawData.qrNo || parsedData.qrNo || '';
      const needDeviceNo = !this.isValidDeviceText(parsedData.deviceNo) && !this.isValidDeviceText(rawData.deviceNo) && !this.isValidDeviceText(item.deviceNo);
      const needDeviceName = !this.isValidDeviceText(parsedData.deviceName) && !this.isValidDeviceText(rawData.deviceName) && !this.isValidDeviceText(item.deviceName);
      if (fallbackQrNo && (needDeviceNo || needDeviceName)) {
        detailQrInfo = await this.fetchDeviceInfoByQrNo(fallbackQrNo);
      }
      
      // 构建详情数据：设备信息仅接受有效值，避免 "--" 覆盖接口真实值
      const deviceNoCandidates = [
        parsedData.deviceNo,
        rawData.deviceNo,
        item.deviceNo,
        detailQrInfo && detailQrInfo.deviceNo
      ];
      const deviceNameCandidates = [
        parsedData.deviceName,
        rawData.deviceName,
        item.deviceName,
        detailQrInfo && detailQrInfo.deviceName
      ];
      const finalDeviceNo = deviceNoCandidates.find(v => this.isValidDeviceText(v)) || '-';
      const finalDeviceName = deviceNameCandidates.find(v => this.isValidDeviceText(v)) || '-';

      let detailData = {
        deviceNo: finalDeviceNo,
        deviceName: finalDeviceName,
        tag: rawData.tag || item.tag || '-',
        time: parsedData.time || rawData.time || item.time || '-',
        // 位置信息：优先从 parsedData 读取，其次从 rawData 读取，最后从 item.location 读取
        address: parsedData.address || rawData.address || item.location || '-',
        // GPS坐标：优先从 parsedData 读取，其次从 rawData 读取
        lng: parsedData.lng || rawData.lng || '',
        lat: parsedData.lat || rawData.lat || '',
        images: rawData.images || (item.imgUrl ? [item.imgUrl] : [])
      };
      
      // 调试信息：打印实际读取到的位置和坐标
      console.log('详情数据:', {
        address: detailData.address,
        lng: detailData.lng,
        lat: detailData.lat,
        rawDataAddress: rawData.address,
        rawDataLng: rawData.lng,
        rawDataLat: rawData.lat,
        parsedDataAddress: parsedData.address,
        parsedDataLng: parsedData.lng,
        parsedDataLat: parsedData.lat
      });
      
      this.currentDetail = detailData;
      this.showDetailModal = true;
    },
    
    // 关闭详情对话框
    closeDetailModal() {
      this.showDetailModal = false;
      this.currentDetail = null;
    },
    
    // 获取GPS坐标字符串
    getGpsCoordinate(lng, lat) {
      if (lng && lat) {
        return `${lng}, ${lat}`;
      }
      return '-';
    },
    
    // 预览详情图片
    previewDetailImages(currentIndex) {
      if (this.currentDetail && this.currentDetail.images && this.currentDetail.images.length > 0) {
        uni.previewImage({
          urls: this.currentDetail.images,
          current: this.currentDetail.images[currentIndex]
        });
      }
    },

    // 处理损坏数据删除
    handleCorruptedDelete(index) {
      const item = this.listData[index];
      uni.showModal({
        title: '提示',
        content: '此条缓存数据已损坏，无法上传，请重新打卡',
        confirmText: '删除损坏数据',
        confirmColor: '#E02020',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            const result = deleteCacheRecord(item.id);
            if (result.success) {
              this.loadCacheData(); // 重新加载数据
              uni.showToast({ title: '已删除', icon: 'success' });
            } else {
              uni.showToast({ title: '删除失败', icon: 'none' });
            }
          }
        }
      });
    },

    // 重新上传单个
    async reUploadOne(item) {
      if (this.uploading) return;
      
      const isOnline = await this.checkNetworkStatus();
      if (!isOnline) {
        uni.showToast({
          title: '当前无网络，无法上传',
          icon: 'none'
        });
        return;
      }
      
      await this.uploadRecords([item]);
    },

    // 上传全部
    async uploadAll() {
      if (this.uploading) return;
      
      const isOnline = await this.checkNetworkStatus();
      if (!isOnline) {
        uni.showToast({
          title: '当前无网络，无法上传',
          icon: 'none'
        });
        return;
      }
      
      const pendingRecords = this.listData.filter(
        item => item.status !== 'corrupted' && item.status !== 'success'
      );
      if (pendingRecords.length === 0) {
        uni.showToast({
          title: '没有可上传的记录',
          icon: 'none'
        });
        return;
      }
      
      await this.uploadRecords(pendingRecords);
    },

    // 批量上传选中项
    async uploadSelectedItems() {
      if (this.uploading) return;
      
      const selectedItems = this.listData.filter(
        item => item.selected && item.status !== 'corrupted' && item.status !== 'success'
      );
      if (selectedItems.length === 0) {
        uni.showToast({
          title: '请选择要上传的记录',
          icon: 'none'
        });
        return;
      }
      
      const isOnline = await this.checkNetworkStatus();
      if (!isOnline) {
        uni.showToast({
          title: '当前无网络，无法上传',
          icon: 'none'
        });
        return;
      }
      
      await this.uploadRecords(selectedItems);
    },
    
    // 离线上报时获取经纬度（仅在缓存中没有经纬度时调用）
    async getLocationForUpload() {
      return new Promise((resolve) => {
        uni.getLocation({
          type: 'gcj02',
          timeout: 20000,
          success: (res) => {
            const lng = res.longitude != null ? String(res.longitude) : '';
            const lat = res.latitude != null ? String(res.latitude) : '';
            console.log('离线上报重新获取到经纬度:', { lng, lat });
            resolve({ lng, lat });
          },
          fail: (err) => {
            console.error('离线上报获取经纬度失败:', err);
            resolve({ lng: '', lat: '' });
          }
        });
      });
    },
    
    // 上传记录（核心上传逻辑）
    async uploadRecords(records) {
      this.uploading = true;
      uni.showLoading({
        title: '上传中...',
        mask: true
      });
      
      let successCount = 0;
      let failedCount = 0;
      
      for (const item of records) {
        try {
          const rawData = item.rawData;
          if (!rawData || !rawData.data) {
            markRecordUploaded(item.id, false, '数据格式错误');
            failedCount++;
            continue;
          }
          
          // 解析提交数据
          let submitData;
          try {
            submitData = JSON.parse(rawData.data);
          } catch (e) {
            markRecordUploaded(item.id, false, '数据解析失败');
            failedCount++;
            continue;
          }
          
          // 如果缓存的数据中没有经纬度，上报前再重新获取一次经纬度
          if ((!submitData.lng || !submitData.lat) && rawData.type === 'attendance') {
            try {
              const { lng, lat } = await this.getLocationForUpload();
              if (lng && lat) {
                submitData.lng = submitData.lng || lng;
                submitData.lat = submitData.lat || lat;
              }
            } catch (locErr) {
              console.error('重新获取经纬度时出错:', locErr);
              // 获取失败则继续使用原来的数据（可能没有经纬度）
            }
          }

          // 离线上报前，用缓存的 qrNo 再做一次设备校验
          if (rawData.type === 'attendance' && rawData.qrNo) {
            try {
              const qrDetails = await http.post(API_ENDPOINTS.DEVICE_QR_DETAILS_API, {
                qrNo: rawData.qrNo
              });

              if (!qrDetails || qrDetails.status !== 1) {
                // status === 0: 未绑定，提示并可跳转绑定页
                if (qrDetails && qrDetails.status === 0) {
                  const qrCodeForBind = rawData.scanRawResult || JSON.stringify({ qrNo: rawData.qrNo });
                  uni.showModal({
                    title: '提示',
                    content: '该设备未绑定，是否前往绑定设备？',
                    confirmText: '去绑定',
                    cancelText: '取消',
                    success: (res) => {
                      if (res.confirm) {
                        uni.navigateTo({
                          url: '/pages/home/level/BindDevice?qrCode=' + encodeURIComponent(qrCodeForBind)
                        });
                      }
                    }
                  });
                  markRecordUploaded(item.id, false, '设备未绑定');
                } else {
                  markRecordUploaded(item.id, false, '设备未绑定或二维码无效');
                }
                failedCount++;
                continue;
              }

              // 若缓存时没拿到 deviceId，这里补齐后再提交
              if ((!submitData.deviceId || submitData.deviceId === 0) && qrDetails.deviceId) {
                submitData.deviceId = qrDetails.deviceId;
              }
              if ((!submitData.deviceNo || !this.isValidDeviceText(submitData.deviceNo)) && qrDetails.deviceNo) {
                submitData.deviceNo = qrDetails.deviceNo;
              }
              if (qrDetails.deviceName && !this.isValidDeviceText(rawData.deviceName)) {
                rawData.deviceName = qrDetails.deviceName;
              }

              // 重新上传时同步回写缓存中的设备信息，确保列表/详情立即可见
              const nextRawData = {
                ...rawData,
                deviceId: submitData.deviceId || rawData.deviceId || 0,
                deviceNo: submitData.deviceNo || rawData.deviceNo || '',
                deviceName: rawData.deviceName || '',
                data: JSON.stringify({
                  ...submitData,
                  deviceId: submitData.deviceId || 0,
                  deviceNo: submitData.deviceNo || ''
                })
              };
              updateCacheRecord(item.id, nextRawData);
            } catch (qrErr) {
              console.error('离线上报二维码校验失败:', qrErr);
              markRecordUploaded(item.id, false, (qrErr && qrErr.msg) || '二维码校验失败');
              failedCount++;
              continue;
            }
          }
          
          // 如果有本地图片，先上传图片
          if (rawData.images && rawData.images.length > 0 && !submitData.imgs) {
            try {
              const uploadPromises = rawData.images.map(filePath => {
                return http.upload(filePath, {
                  url: API_ENDPOINTS.UPLOAD_API,
                  name: 'file',
                  showLoading: false
                }).catch(err => {
                  console.error('图片上传失败:', err);
                  return null;
                });
              });
              
              const results = await Promise.all(uploadPromises);
              const successUrls = results.filter(url => url !== null);
              submitData.imgs = successUrls.join(',');
            } catch (imgError) {
              console.error('图片上传失败:', imgError);
              // 继续提交，但不包含图片
            }
          }
          
          // 提交数据
          await http.post(API_ENDPOINTS.ATTENDANCE_ADD_API, submitData, {
            header: {
              'Content-Type': 'application/json'
            }
          });
          
          // 标记为已上传
          markRecordUploaded(item.id, true);
          successCount++;
          
        } catch (error) {
          console.error('上传失败:', error);
          markRecordUploaded(item.id, false, error.message || '上传失败');
          failedCount++;
        }
      }
      
      uni.hideLoading();
      this.uploading = false;
      
      // 显示上传结果
      this.uploadResult = {
        total: records.length,
        success: successCount,
        failed: failedCount
      };
      
      if (successCount > 0) {
        uni.showToast({
          title: `成功上传${successCount}条记录`,
          icon: 'success'
        });
      }
      
      // 重新加载数据
      this.loadCacheData();
      this.checkNetworkStatus();
    },
    
    // 清除上传结果
    clearUploadResult() {
      this.uploadResult = null;
    }
  }
};
</script>

<style lang="scss" scoped>
	/* 在线链接服务仅供平台体验和调试使用，平台不承诺服务的稳定性，企业客户需下载字体包自行发布使用并做好备份。 */
	@font-face {
	  font-family: 'iconfont';  /* Project id 5080572 */
	  src: url('https://at.alicdn.com/t/c/font_5080572_jslpii6sv5d.woff2?t=1766145792837') format('woff2'),
	       url('https://at.alicdn.com/t/c/font_5080572_jslpii6sv5d.woff?t=1766145792837') format('woff'),
	       url('https://at.alicdn.com/t/c/font_5080572_jslpii6sv5d.ttf?t=1766145792837') format('truetype');
	}
/* 全局背景 */
.container {
  background-color: #F5F7FA;
  min-height: 100vh;
  padding-bottom: 50px;
  position: relative;
}


.inner-dot {
  width: 20rpx;
  height: 20rpx;
  background: #fff;
  border-radius: 50%;
  border: 4rpx solid #0F58B6;
}
.inner-dot.active {
    background: #4cd964; /* 激活时变色示意 */
}

/* 蓝色背景装饰 */
.blue-bg {
  background-color: #0F58B6;
  height: 120rpx;
  width: 100%;
  border-bottom-left-radius: 30rpx;
  border-bottom-right-radius: 30rpx;
  position: absolute;
  top: calc(88rpx + var(--status-bar-height));
  z-index: 0;
}

/* 统计卡片 */
.stats-card {
  margin: 20rpx 30rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx 0;
  display: flex;
  justify-content: space-around;
  position: relative;
  z-index: 1;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-num {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}
.stat-label {
  font-size: 24rpx;
  color: #999;
}
.blue { color: #196AD4; }
.orange { color: #FF9800; }
.green { color: #4CD964; }
.gray { color: #999; }

/* 立即上传全部 */
.upload-all-card {
  margin: 0 30rpx 20rpx;
  background: #fff;
  border-radius: 20rpx;
  height: 100rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 26rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}
.cloud-icon {
	font-family: 'iconfont';
	font-size: 40rpx;
	color: #196AD4;
	margin-bottom: 5rpx;
}

/* 网络提示条 */
.network-notice {
  margin: 20rpx 30rpx;
  background: #FFF8E1;
  border: 2rpx solid #FFC107;
  border-radius: 16rpx;
  padding: 20rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 26rpx;
  color: #F57C00;
}

.notice-upload-btn {
  background: #FF9800;
  color: #fff;
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
}

/* 无网络提示条 */
.offline-notice {
  margin: 20rpx 30rpx;
  background: #FFF3E0;
  border: 2rpx solid #FF9800;
  border-radius: 16rpx;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #E65100;
  text-align: center;
}

/* 列表卡片 */
.record-card {
  margin: 0 30rpx 20rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
}
.select-area {
  margin-right: 20rpx;
}
.card-content {
  flex: 1;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}
.header-left {
  display: flex;
  align-items: center;
}
.device-name {
  font-size: 32rpx;
  font-weight: bold;
  margin-right: 15rpx;
}
.device-no {
  font-size: 24rpx;
  color: #666;
  margin-right: 15rpx;
}
.tag {
  font-size: 20rpx;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
}
.tag-blue { background: #E6F0FC; color: #196AD4; }
.tag-green { background: #E8F5E9; color: #4CD964; }
.tag-red { background: #FFEBEE; color: #E02020; }

.status-text {
  font-size: 24rpx;
}
.status-text.gray { color: #999; }
.status-text.red { color: #E02020; }

.time-text {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.card-body {
  position: relative;
  margin-bottom: 20rpx;
}

.iconfont-location-icon{
	font-family: 'iconfont';
}
.thumb-img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  background: #eee;
}
.location-info {
  position: absolute;
  right: 0;
  bottom: 10rpx;
  font-size: 24rpx;
  color: #666;
  display: flex;
  align-items: center;
}
.location-icon { margin-right: 6rpx; }

/* 按钮组 */
.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
}
.btn {
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
}
.primary-btn {
  background: #0F58B6;
  color: #fff;
}
.outline-btn {
  background: #E6F0FC;
  color: #0F58B6;
}
.delete-btn {
  background: #F5F7FA;
  color: #999;
}

/* 底部通知条 */
.bottom-notice {
  position: fixed;
  bottom: 20rpx; /* Tabbar高度之上 */
  left: 30rpx;
  right: 30rpx;
  background: #E6F0FC;
  padding: 20rpx 30rpx;
  border-radius: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 24rpx;
  color: #333;
}
.red-text { color: #E02020; }
.notice-btn {
  background: #0F58B6;
  color: #fff;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

/* 底部批量操作栏 (选中时出现) */
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100rpx;
  background: #fff;
  box-shadow: 0 -4rpx 10rpx rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.action-btn {
  width: 80%;
  height: 80rpx;
  background: #0F58B6;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
  font-size: 30rpx;
}

/* 模拟 Tabbar */
.tab-bar {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 100rpx;
  background: #fff;
  display: flex;
  border-top: 1rpx solid #eee;
  z-index: 90;
}
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: #999;
}
.tab-item.active { color: #0F58B6; }
.tab-icon { font-size: 36rpx; margin-bottom: 4rpx; }
.center-icon {
  background: #0F58B6;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -30rpx;
  border: 6rpx solid #fff;
}

/* 详情对话框样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 600rpx;
  max-height: 80vh;
  background: #fff;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f5f5f5;
}

.close-icon {
  font-size: 40rpx;
  color: #999;
  line-height: 1;
}

.modal-body {
  padding: 30rpx;
  overflow-y: auto;
  flex: 1;
}

.detail-item {
  margin-bottom: 30rpx;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.detail-value {
  display: block;
  font-size: 28rpx;
  color: #333;
  word-break: break-all;
}

.detail-images {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 10rpx;
}

.detail-img {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
}

.modal-footer {
  padding: 30rpx;
  border-top: 1rpx solid #eee;
}

.modal-close-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background: #0F58B6;
  color: #fff;
  border-radius: 40rpx;
  font-size: 30rpx;
  border: none;
}
</style>