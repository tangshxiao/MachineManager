<template>
  <view class="container">
    <view class="header-section">
      <view class="device-card">
        <view class="dc-row-top">
          <view class="dc-info">
            <text class="dc-code-name">{{ deviceInfo.deviceNo || 'EQ-xxxx-xxxx' }} {{ deviceInfo.name || deviceInfo.deviceName || '设备名称' }}</text>
          </view>
          <view class="dc-status" :class="getStatusClass(deviceInfo.status)">
            <text>{{ getStatusText(deviceInfo.status) }}</text>
          </view>
        </view>
        <view class="dc-row-bottom">
          <image src="/static/icon_time_img.png" class="time-icon"></image>
          <text class="dc-time-label">最后打卡时间：</text>
          <text class="dc-time-value">{{ formatTime(deviceInfo.lastTime) || '--' }}</text>
        </view>
      </view>
    </view>

    <view class="history-section">
      <view class="section-header">
        <text class="section-title">历史打卡记录</text>
        <view class="filter-btn" @tap="handleFilter">
          <!-- <text class="iconfont filter-icon">&#xe693;</text> <text>筛选</text> -->
        </view>
      </view>

      <view class="record-list">
        <!-- 加载状态 -->
        <view v-if="loading && list.length === 0" class="loading-box">
          <text class="loading-text">加载中...</text>
        </view>
        
        <view v-if="!loading && list.length === 0" class="empty-box">
          <image src="/static/empty.png" mode="aspectFit" class="empty-img"></image>
          <text class="empty-text">暂无数据</text>
        </view>

        <view class="record-item" v-for="(item, index) in list" :key="index" @click="showRecordDetail(item)">
          <view class="ri-content">
            <view class="ri-left">
              <view class="user-info">
                <text class="user-name">{{ item.userName }}</text>
                <text class="record-time">{{ formatTime(item.createTime || item.time) }}</text>
              </view>
            </view>
            
            <view class="ri-right">
              <view class="type-tag" :class="getRecordStatusClass(item.type)">
                <text>{{ getRecordStatusText(item.type) }}</text>
              </view>
            </view>
          </view>
          
          <view class="ri-middle" v-if="getImageList(item.imgs || item.imgUrl).length > 0">
            <view class="images-container">
              <image 
                v-for="(img, imgIndex) in getImageList(item.imgs || item.imgUrl)" 
                :key="imgIndex"
                class="site-img"
                :src="img" 
                mode="aspectFill"
                @tap="previewImages(item.imgs || item.imgUrl, imgIndex)"
              ></image>
            </view>
          </view>

          <view class="ri-location" v-if="item.address">
            <text class="loc-icon">&#xe847;</text>
            <text class="loc-text">{{ item.address }}</text>
          </view>
        </view>
        
        <view class="loading-more" v-if="list.length > 0">
           <text class="loading-text">{{ loading ? '加载中...' : (hasMore ? '上拉加载更多' : '没有更多数据了') }}</text>
        </view>

      </view>
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
            <text class="detail-value">{{ currentDetail.deviceNo || deviceInfo.deviceNo || '-' }}</text>
          </view>
          
          <view class="detail-item">
            <text class="detail-label">设备名称</text>
            <text class="detail-value">{{ currentDetail.name || deviceInfo.name || deviceInfo.deviceName || '-' }}</text>
          </view>
          
          <view class="detail-item">
            <text class="detail-label">打卡类型</text>
            <text class="detail-value">{{ getRecordStatusText(currentDetail.type) }}</text>
          </view>
          
          <view class="detail-item">
            <text class="detail-label">打卡时间</text>
            <text class="detail-value">{{ formatTime(currentDetail.createTime || currentDetail.time) || '-' }}</text>
          </view>
          
          <view class="detail-item">
            <text class="detail-label">位置</text>
            <text class="detail-value">{{ currentDetail.address || '-' }}</text>
          </view>
          
          <view class="detail-item">
            <text class="detail-label">GPS坐标</text>
            <text class="detail-value">{{ getGpsCoordinate(currentDetail.lng, currentDetail.lat) }}</text>
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

export default {
  data() {
    return {
      deviceId: '',
      deviceNo: '',
      loading: false,
      deviceInfo: {
        id: '',
        name: '',
        deviceNo: '',
        type: 0,
        model: '',
        attr: '',
        factory: '',
        productTime: '',
        buyTime: '',
        warrantyStartTime: '',
        warrantyEndTime: '',
        address: '',
        driver: '',
        qrStatus: 0,
        directorName: '',
        phone: '',
        remark: '',
        lastTime: '',
        companyName: '',
        verifyStatus: 0,
        status: 0
      },
      query: {
        current: 1,
        size: 10
      },
      list: [],
      hasMore: true,
      showDetailModal: false, // 是否显示详情对话框
      currentDetail: null // 当前详情数据
    }
  },
  onLoad(options) {
    if (options.id) {
      this.deviceId = options.id
      this.getDeviceInfo()
      // 注意：历史记录会在 getDeviceInfo 成功后自动调用
    } else {
      uni.showToast({
        title: '缺少设备ID参数',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  },

  onPullDownRefresh() {
    this.getDeviceInfo()
    this.getHistoryList(true)
  },

  onReachBottom() {
    // 上拉加载更多历史记录
    if (!this.loading && this.hasMore && this.list.length > 0) {
      this.query.current++
      this.getHistoryList(false)
    }
  },
  methods: {
    // 获取设备详情
    async getDeviceInfo() {
      if (!this.deviceId) {
        return
      }
      
      try {
        // 使用 POST 方式，Content-Type 为 application/x-www-form-urlencoded
        // http.post 默认会显示 loading，所以不需要手动设置 loading 状态
        const res = await http.post(API_ENDPOINTS.DEVICE_DETAILS_API, {
          id: this.deviceId
        }, {
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        
        if (res) {
          this.deviceInfo = {
            id: res.id || '',
            name: res.name || '',
            deviceNo: res.deviceNo || '',
            type: res.type !== undefined ? res.type : 0,
            model: res.model || '',
            attr: res.attr || '',
            factory: res.factory || '',
            productTime: res.productTime || '',
            buyTime: res.buyTime || '',
            warrantyStartTime: res.warrantyStartTime || '',
            warrantyEndTime: res.warrantyEndTime || '',
            address: res.address || '',
            driver: res.driver || '',
            qrStatus: res.qrStatus !== undefined ? res.qrStatus : 0,
            directorName: res.directorName || '',
            phone: res.phone || '',
            remark: res.remark || '',
            lastTime: res.lastTime || '',
            companyName: res.companyName || '',
            verifyStatus: res.verifyStatus !== undefined ? res.verifyStatus : 0,
            status: res.status !== undefined ? res.status : 0
          }
          
          // 如果deviceId还没有设置，使用返回的id
          if (!this.deviceId && this.deviceInfo.id) {
            this.deviceId = this.deviceInfo.id
          }
          
          // 设置导航栏标题
          uni.setNavigationBarTitle({
            title: this.deviceInfo.name || '设备详情'
          })
          
          // 获取设备详情后，获取历史记录
          this.getHistoryList(true)
        }
      } catch (e) {
        console.error('获取设备详情失败:', e)
        uni.showToast({
          title: '获取设备详情失败',
          icon: 'none'
        })
      } finally {
        uni.stopPullDownRefresh()
      }
    },
    
    // 获取状态文本：0进场 1在用 2维修 3退场
    getStatusText(status) {
      const statusMap = {
        0: '进场',
        1: '在用',
        2: '维修',
        3: '退场'
      }
      return statusMap[status] || '未知'
    },
    
    // 获取状态样式类
    getStatusClass(status) {
      // 0进场-蓝色, 1在用-绿色, 2维修-红色, 3退场-黄色
      if (status === 0) return 'status-entry'      // 进场-蓝色
      if (status === 1) return 'status-using'     // 在用-绿色
      if (status === 2) return 'status-maintenance' // 维修-红色
      if (status === 3) return 'status-exit'      // 退场-黄色
      return 'status-entry'
    },
    
    // 获取打卡记录类型文本：0进场 1在用 2维修 3退场
    getRecordStatusText(type) {
      const statusMap = {
        0: '进场',
        1: '在用',
        2: '维修',
        3: '退场'
      }
      return statusMap[type] || '未知'
    },
    
    // 获取打卡记录类型样式类
    getRecordStatusClass(type) {
      // 0进场-蓝色, 1在用-绿色, 2维修-红色, 3退场-黄色
      if (type === 0) return 'tag-entry'      // 进场-蓝色
      if (type === 1) return 'tag-using'      // 在用-绿色
      if (type === 2) return 'tag-maintenance' // 维修-红色
      if (type === 3) return 'tag-exit'       // 退场-黄色
      return 'tag-entry'
    },
    
    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return '--'
      // 如果是完整的日期时间字符串，只显示日期和时间部分
      const date = new Date(timeStr)
      if (isNaN(date.getTime())) return timeStr
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    },


    async getHistoryList(reset = false) {
      // 使用设备详情返回的id作为deviceId
      const deviceId = this.deviceInfo.id || this.deviceId
      if (!deviceId) {
        console.warn('设备ID不存在，无法获取历史记录')
        return
      }
      
      if (reset) {
        this.query.current = 1
        this.list = []
        this.hasMore = true
      }
      
      // 防止重复请求
      if (this.loading) {
        return
      }
      
      this.loading = true
      
      try {
        const res = await http.post(API_ENDPOINTS.ATTENDANCE_LIST_API, {
          deviceId: deviceId,
          current: this.query.current,
          size: this.query.size
        })
        
        const records = (res && res.records) || []
        
        if (reset) {
          this.list = records
        } else {
          this.list = [...this.list, ...records]
        }
        
        // 更新分页信息
        if (res.current) {
          this.query.current = res.current
        }
        if (res.size) {
          this.query.size = res.size
        }
        
        // 判断是否还有更多数据
        const total = res.total || 0
        this.hasMore = this.list.length < total && records.length >= this.query.size
        
        // 如果没有更多数据，可以在这里处理（可选）
        if (!this.hasMore && this.list.length > 0) {
          console.log('已加载全部数据')
        }
      } catch (e) {
        console.error('获取历史记录失败:', e)
        if (reset) {
          uni.showToast({
            title: '获取历史记录失败',
            icon: 'none'
          })
        }
      } finally {
        this.loading = false
        uni.stopPullDownRefresh()
      }
    },


    // 获取图片列表
    getImageList(imgs) {
      if (!imgs) return []
      // 如果是字符串，可能是逗号分隔的多个URL
      if (typeof imgs === 'string') {
        return imgs.split(',').map(img => img.trim()).filter(img => img)
      }
      // 如果是数组，直接返回
      if (Array.isArray(imgs)) {
        return imgs.filter(img => img)
      }
      return []
    },
    
    // 预览图片
    previewImages(imgs, currentIndex) {
      const imgList = this.getImageList(imgs)
      if (imgList.length > 0) {
        uni.previewImage({
          urls: imgList,
          current: currentIndex
        })
      }
    },


    handleFilter() {
      uni.showToast({
        title: '打开筛选弹窗',
        icon: 'none'
      })
    },
    
    // 显示打卡记录详情
    showRecordDetail(item) {
      // 显示详情对话框
      this.currentDetail = item
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
    }
  }
}
</script>

<style lang="scss">
	/* 在线链接服务仅供平台体验和调试使用，平台不承诺服务的稳定性，企业客户需下载字体包自行发布使用并做好备份。 */
	@font-face {
	  font-family: 'iconfont';  /* Project id 5080572 */
	  src: url('https://at.alicdn.com/t/c/font_5080572_jslpii6sv5d.woff2?t=1766145792837') format('woff2'),
	       url('https://at.alicdn.com/t/c/font_5080572_jslpii6sv5d.woff?t=1766145792837') format('woff'),
	       url('https://at.alicdn.com/t/c/font_5080572_jslpii6sv5d.ttf?t=1766145792837') format('truetype');
	}
	
page {
  background-color: #F5F7FA;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
	
}

.container {
  padding-bottom: 40rpx;
}


.header-section {
  background-color: #fff; 
  padding: 24rpx;
}

.device-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.dc-row-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.dc-info {
  flex: 1;
}

.dc-code-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
}

.dc-status {
  padding: 8rpx 24rpx;
  border-radius: 40rpx;
  font-size: 24rpx;
  font-weight: 500;
  white-space: nowrap;
}

.status-entry {
  background-color: #3AA7F9; /* 进场-蓝色 */
  color: #fff;
}

.status-using {
  background-color: #39CCA6; /* 在用-绿色 */
  color: #fff;
}

.status-maintenance {
  background-color: #E55762; /* 维修-红色 */
  color: #fff;
}

.status-exit {
  background-color: #FFB138; /* 退场-黄色 */
  color: #fff;
}

.dc-row-bottom {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #999;
}

.time-icon {
  width: 22rpx;
  height: 22rpx;
  margin-right: 8rpx;
}

.dc-time-label {
  margin-right: 8rpx;
}

.dc-time-value {
  color: #666;
}


.history-section {
  padding: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.filter-btn {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 26rpx;
}

.filter-icon {
  font-size: 28rpx;
  margin-right: 6rpx;
}


.record-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.ri-content {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.ri-left {
  flex: 1;
  min-width: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.record-time {
  font-size: 24rpx;
  color: #999;
}

.ri-middle {
  width: 100%;
  margin-bottom: 16rpx;
}

.images-container {
  display: flex;
  flex-wrap: wrap;
  margin-right: -12rpx;
}

.site-img {
  width: calc(33.333% - 12rpx);
  height: 200rpx;
  border-radius: 8rpx;
  background-color: #eee;
  margin-right: 12rpx;
  margin-bottom: 12rpx;
  flex-shrink: 0;
}

.ri-right {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
}

.type-tag {
  padding: 8rpx 24rpx;
  border-radius: 40rpx;
  font-size: 24rpx;
  white-space: nowrap;
}

.tag-entry {
  background-color: #3AA7F9; /* 进场-蓝色 */
  color: #fff;
}

.tag-using {
  background-color: #39CCA6; /* 在用-绿色 */
  color: #fff;
}

.tag-maintenance {
  background-color: #E55762; /* 维修-红色 */
  color: #fff;
}

.tag-exit {
  background-color: #FFB138; /* 退场-黄色 */
  color: #fff;
}

.ri-location {
  display: flex;
  justify-content: flex-end; 
  align-items: center;
}

.loc-icon {
  font-size: 24rpx;
  color: #999;
  margin-right: 6rpx;
  font-family: 'iconfont';
}

.loc-text {
  font-size: 24rpx;
  color: #999;
}


.loading-box {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60rpx 0;
}

.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}

.empty-img {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  color: #ccc;
  font-size: 26rpx;
}

.loading-more {
  text-align: center;
  padding: 20rpx 0;
}

.loading-text {
  color: #ccc;
  font-size: 24rpx;
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