<template>
  <view class="container">
    <view class="content-area">
      
      <view class="card" v-for="(item, index) in list" :key="item.id || index">
        
        <view class="card-header">
          <view class="header-left">
            <text class="device-name">{{ item.name || item.deviceName || '设备名称' }}</text>
            <view class="status-tag" :class="getStatusClass(item.type)">
              <text class="tag-text">{{ getStatusText(item.type) }}</text>
            </view>
          </view>
          <view class="header-right">
            <text class="upload-status" :class="getUploadStatusClass(item.uploadStatus)">{{ getUploadStatusText(item.uploadStatus) }}</text>
          </view>
        </view>

        <view class="info-row">
          <text class="info-text">{{ item.deviceNo || item.deviceId || '-' }}</text>
        </view>
        <view class="info-row">
          <text class="info-text">{{ item.time || '-' }}</text>
        </view>

        <view class="media-section" v-if="hasAnyImages(item)">
          <view class="images-container">
            <image 
              v-for="(img, imgIndex) in getImageList(item.images)" 
              :key="imgIndex"
              class="record-img" 
              :src="img" 
              mode="aspectFill"
              @tap="previewImages(item.images, imgIndex)"
            ></image>
          </view>
          <view class="location-box" v-if="item.address">
            <text class="loc-icon">&#xe847;</text> 
            <text class="loc-text">{{ item.address }}</text>
          </view>
        </view>
        
        <view class="divider"></view>

        <view class="card-footer">
          <button
            v-if="item.canReupload"
            class="reupload-btn"
            hover-class="btn-hover"
            @click="reUploadOne(item)"
          >重新上传</button>
          <button class="detail-btn" hover-class="btn-hover" @click="Details(item)">查看详情</button>
        </view>
      </view>
      
      <!-- 加载状态 -->
      <view class="loading-more" v-if="loading">
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 没有更多数据 -->
      <view class="no-more" v-if="!hasMore && list.length > 0">
        <text class="no-more-text">没有更多数据了</text>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="!loading && list.length === 0">
        <text class="empty-text">暂无打卡记录</text>
      </view>
      
      <view class="bottom-spacer"></view>
    </view>
    
    <!-- 详情对话框 -->
    <view class="modal-mask" v-if="showDetailModal" @tap="closeDetailModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">设备详情</text>
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
            <text class="detail-value">{{ currentDetail.name || '-' }}</text>
          </view>
          
          <view class="detail-item">
            <text class="detail-label">打卡类型</text>
            <text class="detail-value">{{ getStatusText(currentDetail.type) }}</text>
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
import http from '@/utils/request.js'
import API_ENDPOINTS from '@/config/api.js'
import { normalizeDisplayImgUrl } from '@/utils/displayImageUrl.js'
import { mergeImagesLikeOfflineRecord } from '@/utils/mergeOfflineImages.js'
import { getSuccessRecords } from '@/utils/successRecordCache.js'
import { saveSuccessRecord } from '@/utils/successRecordCache.js'
import { getAllCacheRecords, markRecordUploaded, updateCacheRecord, isAwaitingUpload, getCachedRecordAddress } from '@/utils/offlineCache.js'
import { ensureAddressForUpload } from '@/utils/locationAddress.js'
import { ensureAttendanceSubmitPid } from '@/utils/attendancePid.js'

export default {
  data() { 
    return {
      list: [],
      current: 1,
      size: 10,
      total: 0,
      loading: false,
      refreshing: false,
      hasMore: true,
      loadMoreTimer: null, // 防抖定时器
      showDetailModal: false, // 是否显示详情对话框
      currentDetail: null, // 当前详情数据
      isOnline: true,
      onlyLocalCacheMode: true // true: 仅显示本地成功缓存；false: 按网络状态走接口/缓存
    }
  },
  
  onLoad() {
    this.loadAttendanceList(true)
  },
  // 下拉刷新
  onPullDownRefresh() {
    this.onRefresh()
  },
  // 上拉加载更多
  onReachBottom() {
    this.onLoadMore()
  },
  methods: {
	  
	  Details(item) {
	    // 显示详情对话框
	    this.currentDetail = {
        ...item,
        images: this.getImageList(item.images)
      }
	    this.showDetailModal = true
	  },
	  
	  // 关闭详情对话框
	  closeDetailModal() {
	    this.showDetailModal = false
	    this.currentDetail = null
	  },
	  
	  // 获取GPS坐标字符串
	  getGpsCoordinate(lng, lat) {
	    if (lng && lat) {
	      return `${lng}, ${lat}`
	    }
	    return '-'
	  },
	  
    // 加载打卡记录列表
    async loadAttendanceList(reset = false) {
      if (this.loading) return
      
      this.loading = true
      
      try {
        const nextPage = reset ? 1 : this.current + 1
        const isOnline = this.onlyLocalCacheMode ? false : await this.checkNetworkStatus()
        this.isOnline = isOnline

        if (!isOnline) {
          const localAll = this.getLocalSuccessRecords()
          const start = (nextPage - 1) * this.size
          const end = start + this.size
          const pageRecords = localAll.slice(start, end)

          if (reset) {
            this.list = pageRecords
          } else {
            this.list = this.list.concat(pageRecords)
          }

          this.current = nextPage
          this.total = localAll.length
          this.hasMore = end < localAll.length
          return
        }
        
        const res = await http.post(API_ENDPOINTS.ATTENDANCE_LIST_API, {
          current: nextPage,
          size: this.size
        })
        
        const records = (res && res.records) || []
        const mapped = records.map((r) => this.normalizeAttendanceListItem(r))

        if (reset) {
          this.list = mapped
        } else {
          this.list = this.list.concat(mapped)
        }
        
        this.current = res.current || nextPage
        this.size = res.size || this.size
        this.total = res.total || 0
        
        // 判断是否还有更多数据
        this.hasMore = this.list.length < this.total && mapped.length >= this.size
        
      } catch (e) {
        console.error('获取打卡记录失败:', e)
        // request.js 已经显示了接口返回的 msg（如果 code !== 0）
        // 如果是接口返回的错误，不需要额外处理
        if (e && typeof e === 'object' && e.code !== undefined && e.code !== 0) {
          // 接口返回的错误，request.js 已经显示了 msg
          this.loading = false
          return
        }
        // 其他错误（如网络错误）才显示通用错误提示
        if (!reset) {
          uni.showToast({
            title: '加载失败',
            icon: 'none'
          })
        }
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },
    
    // 下拉刷新
    async onRefresh() {
      this.refreshing = true
      await this.loadAttendanceList(true)
      // 停止下拉刷新动画
      uni.stopPullDownRefresh()
    },
    
    // 上拉加载更多（添加防抖和更严格的判断）
    onLoadMore() {
      // 如果正在加载、正在刷新或没有更多数据，直接返回
      if (this.loading || this.refreshing || !this.hasMore) {
        return
      }
      
      // 清除之前的定时器
      if (this.loadMoreTimer) {
        clearTimeout(this.loadMoreTimer)
        this.loadMoreTimer = null
      }
      
      // 防抖：延迟执行，避免频繁触发
      this.loadMoreTimer = setTimeout(() => {
        // 再次检查状态，确保在延迟期间状态没有改变
        if (!this.loading && !this.refreshing && this.hasMore) {
          this.loadAttendanceList(false)
        }
        this.loadMoreTimer = null
      }, 300)
    },
    
    // 获取状态文本
    getStatusText(type) {
      // type: 0进场 1在用 2维修 3退场
      const statusMap = {
        0: '进场',
        1: '在用',
        2: '维修',
        3: '退场'
      }
      return statusMap[type] || '未知'
    },
    
    // 获取状态样式类
    getStatusClass(type) {
      // 0进场-绿色, 1离场-蓝色
      return type === 0 ? 'status-in' : 'status-out'
    },

    getUploadStatusText(status) {
      const map = {
        pending: '未上传',
        failed: '上传失败',
        corrupted: '数据异常',
        success: '已上传'
      }
      return map[status] || '已上传'
    },

    getUploadStatusClass(status) {
      const map = {
        pending: 'status-pending',
        failed: 'status-failed',
        corrupted: 'status-failed',
        success: 'status-success'
      }
      return map[status] || 'status-success'
    },
    
    // 接口列表项：统一 imgs / 本地图字段名，避免服务端字段与本地缓存不一致
    normalizeAttendanceListItem(r) {
      if (!r || typeof r !== 'object') return r
      const raw = r.imgs ?? r.imgUrls ?? r.imgUrl ?? r.image ?? r.img ?? r.photo ?? r.pictures ?? r.files ?? ''
      let imgs = ''
      if (Array.isArray(raw)) {
        imgs = raw.map((x) => String(x).trim()).filter(Boolean).join(',')
      } else {
        imgs = String(raw || '')
      }
      const base = {
        ...r,
        imgs,
        localImages: Array.isArray(r.localImages) ? r.localImages : []
      }
      return {
        ...base,
        images: mergeImagesLikeOfflineRecord(base)
      }
    },

    // 与离线列表一致：对合并后的 images 做 URL 规范化
    getImageList(images) {
      let list = []
      if (Array.isArray(images)) list = images.filter(Boolean)
      else if (typeof images === 'string') {
        list = images.split(',').map((img) => img.trim()).filter(Boolean)
      }
      return list.map((u) => normalizeDisplayImgUrl(u))
    },

    previewImages(images, currentIndex) {
      const imgList = this.getImageList(images)
      if (imgList.length > 0) {
        uni.previewImage({
          urls: imgList,
          current: imgList[currentIndex] || imgList[0]
        })
      }
    },

    previewDetailImages(currentIndex) {
      if (this.currentDetail && this.currentDetail.images && this.currentDetail.images.length > 0) {
        uni.previewImage({
          urls: this.currentDetail.images,
          current: this.currentDetail.images[currentIndex] || this.currentDetail.images[0]
        })
      }
    },

    hasAnyImages(item) {
      return this.getImageList(item.images).length > 0
    },

    async checkNetworkStatus() {
      return new Promise(resolve => {
        uni.getNetworkType({
          success: (res) => {
            const online = res.networkType !== 'none' && res.networkType !== 'unknown'
            this.isOnline = online
            resolve(online)
          },
          fail: () => {
            this.isOnline = false
            resolve(false)
          }
        })
      })
    },

    parseTimeToTs(timeStr) {
      if (!timeStr) return 0
      const normalized = String(timeStr).replace(/-/g, '/')
      const ts = new Date(normalized).getTime()
      return Number.isNaN(ts) ? 0 : ts
    },

    buildOfflineItem(record) {
      return {
        id: record.id,
        sourceType: 'offline_cache',
        uploadStatus: record.uploadStatus || 'pending',
        canReupload: isAwaitingUpload(record),
        rawData: record,
        qrNo: record.qrNo || '',
        name: record.deviceName || '设备名称',
        deviceName: record.deviceName || '',
        deviceNo: record.deviceNo || '-',
        type: typeof record.type === 'number' ? record.type : 1,
        time: record.time || '-',
        address: getCachedRecordAddress(record) || '',
        lng: record.lng || '',
        lat: record.lat || '',
        imgs: record.imgs || '',
        localImages: Array.isArray(record.images) ? record.images : [],
        images: mergeImagesLikeOfflineRecord(record),
        sortTs: this.parseTimeToTs(record.time) || this.parseTimeToTs(record.createTime)
      }
    },

    buildSuccessItem(item) {
      const imgs = item.imgs || ''
      const localImages = Array.isArray(item.localImages) ? item.localImages : []
      return {
        id: item.id || ('local_' + Date.now()),
        sourceType: 'success_cache',
        uploadStatus: 'success',
        canReupload: false,
        qrNo: item.qrNo || '',
        name: item.name || item.deviceName || '设备名称',
        deviceName: item.deviceName || item.name || '',
        deviceNo: item.deviceNo || '-',
        type: typeof item.type === 'number' ? item.type : 1,
        time: item.time || '-',
        address: item.address || '',
        lng: item.lng || '',
        lat: item.lat || '',
        imgs,
        localImages,
        images: mergeImagesLikeOfflineRecord({ imgs, localImages, images: item.images }),
        sortTs: this.parseTimeToTs(item.time) || Number(item.saveTime || 0)
      }
    },

    getDedupKey(item) {
      const time = String(item.time || '').trim()
      const qrNo = item.qrNo || (item.rawData && item.rawData.qrNo) || ''
      if (qrNo) return `qr:${qrNo}_${time}`
      if (item.deviceNo && item.deviceNo !== '-') return `dev:${item.deviceNo}_${time}`
      return `${item.sourceType || 'unknown'}:${item.id}`
    },

    getLocalSuccessRecords() {
      const offlineRecords = getAllCacheRecords().map(record => this.buildOfflineItem(record))
      const successRecords = getSuccessRecords().map(record => this.buildSuccessItem(record))

      const mergedMap = new Map()
      offlineRecords.forEach(item => {
        mergedMap.set(this.getDedupKey(item), item)
      })

      successRecords.forEach(item => {
        const key = this.getDedupKey(item)
        if (!mergedMap.has(key)) {
          mergedMap.set(key, item)
        } else {
          const existed = mergedMap.get(key)
          // 同一条记录发生冲突时，优先保留 success 态，避免成功后出现重复
          if (!existed || (item.uploadStatus === 'success' && existed.uploadStatus !== 'success')) {
            mergedMap.set(key, item)
          }
        }
      })

      return Array.from(mergedMap.values()).sort((a, b) => (b.sortTs || 0) - (a.sortTs || 0))
    },

    async reUploadOne(item) {
      if (!item || !item.canReupload || !item.rawData) return
      const isOnline = await this.checkNetworkStatus()
      if (!isOnline) {
        uni.showToast({
          title: '当前无网络，无法上传',
          icon: 'none'
        })
        return
      }

      uni.showLoading({
        title: '上传中...',
        mask: true
      })

      try {
        const rawData = item.rawData
        let submitData = {}
        try {
          submitData = rawData.data ? JSON.parse(rawData.data) : {}
        } catch (e) {
          throw new Error('缓存数据解析失败')
        }

        if (rawData.images && rawData.images.length > 0 && !submitData.imgs) {
          const uploadPromises = rawData.images.map(filePath => {
            return http.upload(filePath, {
              url: API_ENDPOINTS.UPLOAD_API,
              name: 'file',
              showLoading: false
            }).catch(() => null)
          })
          const uploadResult = await Promise.all(uploadPromises)
          const urls = uploadResult.filter(Boolean)
          if (urls.length > 0) {
            submitData.imgs = urls.join(',')
          }
        }

        // 统一补齐地址：有经纬度直接反查，没经纬度则先定位再反查
        const fixedLocation = await ensureAddressForUpload({
          address: submitData.address || rawData.address || '',
          lng: submitData.lng || rawData.lng || '',
          lat: submitData.lat || rawData.lat || '',
          needLocateWhenMissing: true
        })
        submitData.address = submitData.address || fixedLocation.address || ''
        submitData.lng = submitData.lng || fixedLocation.lng || ''
        submitData.lat = submitData.lat || fixedLocation.lat || ''
        // 业务要求：有经纬度就必须有反地理地址
        if (!submitData.address && submitData.lng && submitData.lat) {
          throw new Error('反地理编码失败，请稍后重试')
        }

        ensureAttendanceSubmitPid(submitData, rawData)

        // 离线缓存重新上报时，attendance/add 约定 status=1
        submitData.status = 1
        await http.post(API_ENDPOINTS.ATTENDANCE_ADD_API, submitData, {
          header: {
            'Content-Type': 'application/json'
          }
        })

        markRecordUploaded(rawData.id, true)
        updateCacheRecord(rawData.id, {
          address: submitData.address || rawData.address || '',
          lng: submitData.lng || rawData.lng || '',
          lat: submitData.lat || rawData.lat || '',
          imgs: submitData.imgs || rawData.imgs || '',
          data: JSON.stringify(submitData),
          pid: submitData.pid,
          deviceId: submitData.deviceId || rawData.deviceId,
          deviceNo: submitData.deviceNo || rawData.deviceNo || '',
          deviceName: rawData.deviceName || submitData.deviceName || ''
        })

        saveSuccessRecord({
          id: rawData.id,
          deviceId: submitData.deviceId || rawData.deviceId || 0,
          deviceNo: submitData.deviceNo || rawData.deviceNo || '',
          deviceName: rawData.deviceName || '',
          name: rawData.deviceName || '',
          type: submitData.type,
          time: submitData.time || rawData.time || '',
          address: submitData.address || rawData.address || '',
          lng: submitData.lng || rawData.lng || '',
          lat: submitData.lat || rawData.lat || '',
          imgs: submitData.imgs || rawData.imgs || '',
          localImages: rawData.images || [],
          qrNo: rawData.qrNo || submitData.qrNo || '',
          source: 'record_reupload'
        })

        uni.showToast({
          title: '上传成功',
          icon: 'success'
        })
        await this.loadAttendanceList(true)
      } catch (e) {
        const errMsg = (e && (e.msg || e.message)) || '上传失败'
        markRecordUploaded(item.rawData.id, false, errMsg)
        uni.showToast({
          title: errMsg,
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    }
  }
}
</script>

<style lang="scss">
	
/* 在线链接服务仅供平台体验和调试使用，平台不承诺服务的稳定性，企业客户需下载字体包自行发布使用并做好备份。 */
@font-face {
  font-family: 'iconfont';  /* Project id 5080572 */
  src: url('https://at.alicdn.com/t/c/font_5080572_fn371rvffq4.woff2?t=1765706049164') format('woff2'),
       url('https://at.alicdn.com/t/c/font_5080572_fn371rvffq4.woff?t=1765706049164') format('woff'),
       url('https://at.alicdn.com/t/c/font_5080572_fn371rvffq4.ttf?t=1765706049164') format('truetype');
}
/* 全局背景 */
page {
  background-color: #F5F7FA;
	font-family: 'iconfont'; 
}

.container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-area {
  flex: 1;
  padding: 20rpx 24rpx;
  box-sizing: border-box;
}

/* --- 卡片样式 --- */
.card {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.upload-status {
  font-size: 24rpx;
}

.upload-status.status-pending {
  color: #fa8c16;
}

.upload-status.status-failed {
  color: #ff4d4f;
}

.upload-status.status-success {
  color: #52c41a;
}

.header-left {
  display: flex;
  align-items: center;
}

.device-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-right: 16rpx;
}

.status-tag {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.status-tag.status-in {
  background-color: #F6FFED; /* 浅绿色背景 */
}

.status-tag.status-out {
  background-color: #E6F7FF; /* 浅蓝色背景 */
}

.tag-text {
  font-size: 24rpx;
  font-weight: 500;
}

.status-tag.status-in .tag-text {
  color: #52C41A; /* 绿色文字 */
}

.status-tag.status-out .tag-text {
  color: #1890FF; /* 蓝色文字 */
}

.info-row {
  margin-bottom: 8rpx;
}

.info-text {
  font-size: 26rpx;
  color: #999999;
}

.media-section {
  margin-top: 20rpx;
  position: relative;
}

.images-container {
  display: flex;
  flex-wrap: wrap;
  margin-right: -12rpx;
  margin-bottom: 16rpx;
}

.record-img {
  width: calc(33.333% - 12rpx);
  height: 220rpx;
  border-radius: 12rpx;
  background-color: #eee;
  flex-shrink: 0;
  margin-right: 12rpx;
  margin-bottom: 12rpx;
}

.location-box {
  display: flex;
  align-items: center;
  margin-top: 10rpx;
}

.loc-icon {
  font-size: 28rpx;
  margin-right: 4rpx;
  color: #666;
  font-family: 'iconfont';
}

.loc-text {
  font-size: 26rpx;
  color: #666666;
}

/* 分割线与底部按钮 */
.divider {
  height: 1rpx;
  background-color: #F0F0F0;
  margin: 24rpx 0;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  align-items: center;
}

.detail-btn {
  margin: 0;
  background-color: #0052D9; /* 腾讯蓝/深蓝色 */
  color: #FFFFFF;
  font-size: 26rpx;
  padding: 0 32rpx;
  height: 60rpx;
  line-height: 60rpx;
  border-radius: 30rpx; /* 圆角胶囊形状 */
}

.reupload-btn {
  margin: 0;
  background-color: #fff;
  color: #0052D9;
  border: 2rpx solid #0052D9;
  font-size: 26rpx;
  padding: 0 24rpx;
  height: 60rpx;
  line-height: 56rpx;
  border-radius: 30rpx;
}

.btn-hover {
  opacity: 0.9;
}

.bottom-spacer {
  height: 180rpx; /* 留出底部导航栏的高度 */
}

/* 加载状态 */
.loading-more {
  padding: 30rpx 0;
  text-align: center;
}

.loading-text {
  font-size: 26rpx;
  color: #999;
}

/* 没有更多 */
.no-more {
  padding: 30rpx 0;
  text-align: center;
}

.no-more-text {
  font-size: 26rpx;
  color: #999;
}

/* 空状态 */
.empty-state {
  padding: 200rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* --- 自定义底部导航栏样式 --- */
.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100rpx; /* 增加高度适配 iPhone X */
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  border-top: 1rpx solid #EEEEEE;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 999;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.center-item {
  position: relative;
}

/* 简单的 CSS 图标模拟，实际请用 iconfont 或 image */
.tab-icon {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #999;
  border-radius: 6rpx;
  margin-bottom: 6rpx;
}
/* 选中状态 */
.tab-item.active .tab-icon {
  border-color: #0052D9;
}
.tab-item.active .tab-text {
  color: #0052D9;
}

.tab-text {
  font-size: 20rpx;
  color: #999999;
}

/* 中间突出的圆形按钮 */
.center-btn {
  width: 90rpx;
  height: 90rpx;
  background-color: #0052D9;
  border-radius: 50%;
  position: absolute;
  top: -40rpx; /* 向上突出的关键 */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 -2rpx 10rpx rgba(0, 82, 217, 0.2);
}

.camera-icon {
  width: 40rpx;
  height: 30rpx;
  border: 4rpx solid #fff;
  border-radius: 4rpx;
}

/* 详情对话框样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 640rpx;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 32rpx 24rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.modal-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.close-icon {
  font-size: 48rpx;
  color: #999999;
  line-height: 1;
}

.modal-body {
  padding: 32rpx;
  flex: 1;
  overflow-y: auto;
}

.detail-item {
  margin-bottom: 32rpx;
  display: flex;
  flex-direction: column;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: 26rpx;
  color: #999999;
  margin-bottom: 12rpx;
}

.detail-value {
  font-size: 28rpx;
  color: #333333;
  word-break: break-all;
}

.detail-images {
  display: flex;
  flex-wrap: wrap;
  margin-right: -12rpx;
}

.detail-img {
  width: calc(33.333% - 12rpx);
  height: 180rpx;
  border-radius: 10rpx;
  margin-right: 12rpx;
  margin-bottom: 12rpx;
  background: #f2f2f2;
}

.modal-footer {
  padding: 24rpx 32rpx 32rpx;
  border-top: 1rpx solid #F0F0F0;
}

.modal-close-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background-color: #F5F5F5;
  color: #333333;
  font-size: 32rpx;
  border-radius: 44rpx;
  border: none;
  margin: 0;
  padding: 0;
}

.modal-close-btn:active {
  opacity: 0.8;
}

</style>