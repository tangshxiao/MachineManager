<template>
  <view class="container">
    <scroll-view scroll-y class="content-area">
      
      <view class="card" v-for="(item, index) in list" :key="index">
        
        <view class="card-header">
          <view class="header-left">
            <text class="device-name">{{ item.name }}</text>
            <view class="status-tag">
              <text class="tag-text">{{ item.status }}</text>
            </view>
          </view>
        </view>

        <view class="info-row">
          <text class="info-text">{{ item.deviceId }}</text>
        </view>
        <view class="info-row">
          <text class="info-text">{{ item.time }}</text>
        </view>

        <view class="media-section">
          <image class="record-img" :src="item.img" mode="aspectFill"></image>
          <view class="location-box">
            <text class="loc-icon">&#xe847;</text> 
            <text class="loc-text">{{ item.location }}</text>
          </view>
        </view>
        
        <view class="divider"></view>

        <view class="card-footer">
          <button class="detail-btn" hover-class="btn-hover">查看详情</button>
        </view>
      </view>
      
      <view class="bottom-spacer"></view>
    </scroll-view>

    <custom-tab-bar />

  </view>
</template>

<script>
	import CustomTabBar from '@/components/custom-tab-bar.vue'
export default {
  components: {
     CustomTabBar
   },
  
  data() { 
    return {
      list: [
        {
          name: '设备W',
          status: '退场',
          deviceId: 'DEV822',
          time: '2025-11-10 14:20',
          location: '工作A区',
          // 使用占位图，实际请替换为你的图片链接
          img: 'https://images.unsplash.com/photo-1596706062103-3a85ecb0a514?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
        },
        {
          name: '设备W',
          status: '退场',
          deviceId: 'DEV822',
          time: '2025-11-10 14:20',
          location: '工作A区',
          img: 'https://images.unsplash.com/photo-1596706062103-3a85ecb0a514?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
        }
      ]
    }
  },
  methods: {
    // 页面逻辑
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
  background-color: #E6F7FF; /* 浅蓝色背景 */
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.tag-text {
  font-size: 24rpx;
  color: #1890FF; /* 蓝色文字 */
  font-weight: 500;
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
  display: flex;
  justify-content: space-between;
  align-items: flex-end; /* 底部对齐 */
}

.record-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background-color: #eee;
}

.location-box {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx; /* 微调位置 */
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