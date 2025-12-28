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
        </view>

        <view class="info-row">
          <text class="info-text">{{ item.deviceNo || item.deviceId || '-' }}</text>
        </view>
        <view class="info-row">
          <text class="info-text">{{ item.time || '-' }}</text>
        </view>

        <view class="media-section" v-if="item.imgs">
          <view class="images-container">
            <image 
              v-for="(img, imgIndex) in getImageList(item.imgs)" 
              :key="imgIndex"
              class="record-img" 
              :src="img" 
              mode="aspectFill"
              @tap="previewImages(item.imgs, imgIndex)"
            ></image>
          </view>
          <view class="location-box" v-if="item.address">
            <text class="loc-icon">&#xe847;</text> 
            <text class="loc-text">{{ item.address }}</text>
          </view>
        </view>
        
        <view class="divider"></view>

        <view class="card-footer">
          <button class="detail-btn" hover-class="btn-hover">查看详情</button>
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
  </view>
</template>

<script>
import http from '@/utils/request.js'
import API_ENDPOINTS from '@/config/api.js'

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
      loadMoreTimer: null // 防抖定时器
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
    // 加载打卡记录列表
    async loadAttendanceList(reset = false) {
      if (this.loading) return
      
      this.loading = true
      
      try {
        const nextPage = reset ? 1 : this.current + 1
        
        const res = await http.post(API_ENDPOINTS.ATTENDANCE_LIST_API, {
          current: nextPage,
          size: this.size
        })
        
        const records = (res && res.records) || []
        
        if (reset) {
          this.list = records
        } else {
          this.list = this.list.concat(records)
        }
        
        this.current = res.current || nextPage
        this.size = res.size || this.size
        this.total = res.total || 0
        
        // 判断是否还有更多数据
        this.hasMore = this.list.length < this.total && records.length >= this.size
        
      } catch (e) {
        console.error('获取打卡记录失败:', e)
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
      // type: 0进场 1离场
      const statusMap = {
        0: '进场',
        1: '离场'
      }
      return statusMap[type] || '未知'
    },
    
    // 获取状态样式类
    getStatusClass(type) {
      // 0进场-绿色, 1离场-蓝色
      return type === 0 ? 'status-in' : 'status-out'
    },
    
    // 获取图片列表
    getImageList(imgs) {
      if (!imgs) return []
      const imgArray = typeof imgs === 'string' ? imgs.split(',').map(img => img.trim()).filter(img => img) : imgs
      return imgArray || []
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

</style>