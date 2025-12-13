<template>

 <view class="page">

  <view class="mine-container">
    <!-- Header -->
    <view class="header">
      <view class="header-title">个人中心</view>
      <view class="header-actions">
        <text class="iconfont">&#xe61a;</text>
        <text class="iconfont">&#xe60c;</text>
      </view>
    </view>

    <!-- User Info Card -->
    <view class="user-card">
      <view class="user-avatar">
        <image src="/static/avatar-placeholder.png" mode="aspectFill"></image>
      </view>
      <view class="user-info">
        <view class="user-name">老周</view>
        <view class="user-id">ID:USER0000001</view>
        <view class="user-role">角色: 操作员</view>
      </view>
      <button class="edit-btn">修改资料</button>
    </view>

    <!-- Menu Items -->
    <view class="menu-list">
      <view class="menu-item" @click="navigateTo('offline')">
        <text class="menu-text">离线缓存记录</text>
        <text class="iconfont arrow">&#xe65e;</text>
      </view>
      <view class="menu-item" @click="navigateTo('records')">
        <text class="menu-text">所有打卡数据</text>
        <text class="iconfont arrow">&#xe65e;</text>
      </view>
    </view>

    <!-- Logout Button -->
    <view class="logout-btn" @click="handleLogout">
      <text>退出登录</text>
    </view>
  </view>

   <!-- 自定义 tabbar 固定在底部 -->
    	<custom-tab-bar />

  </view>
</template>

<script>

  import CustomTabBar from '@/components/custom-tab-bar.vue'

export default {
   components: {
      CustomTabBar
    },
  methods: {
    navigateTo(page) {
      // 这里添加页面跳转逻辑
      console.log('Navigate to:', page);
    },
    handleLogout() {
      // 这里添加退出登录逻辑
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定');
            // 执行退出登录操作
            // uni.redirectTo({
            //   url: '/pages/login/login'
            // });
          }
        }
      });
    }
  }
}
</script>

<style>
page {
  background-color: #f5f7fa;
}

.mine-container {
  padding: 30rpx;
  min-height: 100vh;
  box-sizing: border-box;
}

/* Header Styles */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  margin-bottom: 30rpx;
}

.header-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
  text-align: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.header-actions .iconfont {
  font-size: 40rpx;
  color: #666;
}

/* User Card Styles */
.user-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 30rpx;
  display: flex;
  align-items: center;
  position: relative;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 24rpx;
  background-color: #f0f2f5;
}

.user-avatar image {
  width: 100%;
  height: 100%;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
}

.user-id,
.user-role {
  font-size: 24rpx;
  color: #999;
  line-height: 1.5;
}

.edit-btn {
  position: absolute;
  right: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24rpx;
  color: #666;
  background: #f5f7fa;
  border: 1rpx solid #e0e0e0;
  border-radius: 30rpx;
  padding: 6rpx 20rpx;
  margin: 0;
  line-height: 1.5;
}

/* Menu List Styles */
.menu-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-text {
  font-size: 30rpx;
  color: #333;
}

.arrow {
  color: #999;
  font-size: 28rpx;
}

/* Logout Button */
.logout-btn {
  background: #fff;
  color: #ff4d4f;
  font-size: 32rpx;
  text-align: center;
  padding: 28rpx 0;
  border-radius: 16rpx;
  margin-top: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

/* Icon Font */
@font-face {
  font-family: 'iconfont';
  src: url('https://at.alicdn.com/t/font_1234567_abcdefghijk.eot');
  src: url('https://at.alicdn.com/t/font_1234567_abcdefghijk.eot?#iefix') format('embedded-opentype'),
    url('https://at.alicdn.com/t/font_1234567_abcdefghijk.woff2') format('woff2'),
    url('https://at.alicdn.com/t/font_1234567_abcdefghijk.woff') format('woff'),
    url('https://at.alicdn.com/t/font_1234567_abcdefghijk.ttf') format('truetype'),
    url('https://at.alicdn.com/t/font_1234567_abcdefghijk.svg#iconfont') format('svg');
}

.iconfont {
  font-family: 'iconfont' !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
