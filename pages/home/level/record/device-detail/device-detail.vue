<template>
  <view class="container">
    <view class="header-section">
      <view class="device-card">
        <view class="dc-row-top">
          <view class="dc-info">
            <text class="dc-code">{{ deviceInfo.deviceNo || 'EQ-xxxx-xxxx' }}</text>
            <text class="dc-name">{{ deviceInfo.deviceName || '设备名称' }}</text>
          </view>
          <view class="dc-status" :class="deviceInfo.status === 1 ? 'status-normal' : 'status-abnormal'">
            <text>{{ deviceInfo.status === 1 ? '正常' : '异常' }}</text>
          </view>
        </view>
        <view class="dc-row-bottom">
          <text class="dc-time-label">&#x101eb;最后打卡时间：</text>
          <text class="dc-time-value">{{ deviceInfo.lastTime || '--' }}</text>
        </view>
      </view>
    </view>

    <view class="history-section">
      <view class="section-header">
        <text class="section-title">历史打卡记录</text>
        <view class="filter-btn" @tap="handleFilter">
          <text class="iconfont filter-icon">&#xe693;</text> <text>筛选</text>
        </view>
      </view>

      <view class="record-list">
        
        <view v-if="!loading && list.length === 0" class="empty-box">
          <image src="/static/empty.png" mode="aspectFit" class="empty-img"></image>
          <text class="empty-text">暂无数据</text>
        </view>

        <view class="record-item" v-for="(item, index) in list" :key="index">
          <view class="ri-header">
            <view class="user-info">
              <text class="user-name">{{ item.userName }}</text>
              <text class="record-time">{{ item.createTime }}</text>
            </view>
            <view class="type-tag" :class="item.type === 0 ? 'tag-in' : 'tag-out'">
              <text>{{ item.type === 0 ? '进场' : '离场' }}</text>
            </view>
          </view>

          <view class="ri-media" v-if="item.imgUrl">
            <image 
              :src="item.imgUrl" 
              mode="aspectFill" 
              class="site-img"
              @tap="previewImage(item.imgUrl)"
            ></image>
          </view>

          <view class="ri-location" v-if="item.address">
            <text class="iconfont loc-icon">&#xe847;</text>
            <text class="loc-text">{{ item.address }}</text>
          </view>
        </view>
        
        <view class="loading-more" v-if="list.length > 0">
           <text class="loading-text">{{ loading ? '加载中...' : '没有更多数据了' }}</text>
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
        deviceNo: '',
        deviceName: '挖掘机',
        lastTime: '2025-11-10 14:20',
        status: 1
      },
      query: {
        current: 1,
        size: 10
      },
      list: [
        {
          id: 1,
          userName: '老周',
          createTime: '2025-11-10 14:20',
          type: 0, // 0进场
          imgUrl: 'https://via.placeholder.com/300x300/409EFF/ffffff?text=Site+Image', // 替换为真实图片
          address: '工作A区'
        },
        {
          id: 2,
          userName: '老周',
          createTime: '2025-11-10 10:00',
          type: 0, 
          imgUrl: 'https://via.placeholder.com/300x300/67C23A/ffffff?text=Leaf',
          address: '工作A区'
        }
      ]
    }
  },
  onLoad(options) {

    if (options.id || options.deviceNo) {
      this.deviceId = options.id
      this.deviceNo = options.deviceNo
      
      this.getDeviceInfo()
      this.getHistoryList(true)
    }
  },

  onPullDownRefresh() {
    this.getDeviceInfo()
    this.getHistoryList(true)
  },

  onReachBottom() {

    // this.query.current++
    // this.getHistoryList()
  },
  methods: {

    async getDeviceInfo() {

      // const res = await http.get(`/api/device/${this.deviceId}`)
      // this.deviceInfo = res.data
      

      uni.setNavigationBarTitle({
        title: '设备详情'
      })
    },


    async getHistoryList(reset = false) {
      if(reset) {
        this.query.current = 1
        this.loading = true
      }

      // const res = await http.post(API_ENDPOINTS.HISTORY_API, { ...this.query, deviceId: this.deviceId })
      // if (reset) this.list = res.records
      // else this.list = [...this.list, ...res.records]
      
      setTimeout(() => {
        this.loading = false
        uni.stopPullDownRefresh()
      }, 500)
    },


    previewImage(url) {
      uni.previewImage({
        urls: [url]
      })
    },


    handleFilter() {
      uni.showToast({
        title: '打开筛选弹窗',
        icon: 'none'
      })
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
  background-color: #EFFFF5;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.02);
}

.dc-row-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.dc-info {
  display: flex;
  flex-direction: column;
}

.dc-code {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
  font-family: monospace; 
}

.dc-name {
  font-size: 28rpx;
  color: #666;
}


.dc-status {
  padding: 6rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.status-normal {
  background-color: #19BE6B;
  color: #fff;
}

.status-abnormal {
  background-color: #FF9900;
  color: #fff;
}

.dc-row-bottom {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #999;
}

.dc-time-label {
  margin-right: 10rpx;
  font-family: 'iconfont'; 
  
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
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.03);
}

.ri-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 6rpx;
}

.record-time {
  font-size: 24rpx;
  color: #999;
}

.type-tag {
  padding: 6rpx 24rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
}

.tag-in {
  background-color: #409EFF; 
  color: #fff;
}

.tag-out {
  background-color: #909399;
  color: #fff;
}


.ri-media {
  margin-bottom: 16rpx;
}

.site-img {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  background-color: #eee;
}


.ri-location {
  display: flex;
  justify-content: flex-end; 
  align-items: center;
}

.loc-icon {
  font-size: 28rpx;
  color: #999;
  margin-right: 6rpx;
}

.loc-text {
  font-size: 24rpx;
  color: #999;
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
</style>