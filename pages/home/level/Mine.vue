<template>
  <view class="mine-container">
    <!-- Header -->
    <view class="header">
      <!-- <view class="header-title">个人中心</view> -->
      
    </view>

    <!-- User Info Card -->
   <!-- <view class="user-card">
      <view class="user-avatar">
        <image src="/static/avatar-placeholder.png" mode="aspectFill"></image>
      </view>
      <view class="user-info">
        <view class="user-name">老周</view>
        <view class="user-id">ID:USER0000001</view>
        <view class="user-role">角色: 操作员</view>
      </view>
      <button class="edit-btn">修改资料</button>
    </view> -->

    <!-- Menu Items -->
    <view class="menu-item" @click="selectProject" style="margin-top: 70rpx;">
      <view class="menu-left">
        <image src="/static/icon_sel_project.svg" mode="aspectFill" class="menu-icon"></image>
        <text class="menu-text">选择项目</text>
      </view>
      <image src="/static/icon_right_jt.png" mode="aspectFill" class="arrow-icon"></image>
    </view>
    
    <view class="menu-item" @click="bindDevice">
      <view class="menu-left">
        <image src="/static/icon_bind_dev.svg" mode="aspectFill" class="menu-icon"></image>
        <text class="menu-text">绑定设备</text>
      </view>
      <image src="/static/icon_right_jt.png" mode="aspectFill" class="arrow-icon"></image>
    </view>
    
    <view class="menu-item" @click="offline">
      <view class="menu-left">
        <image src="/static/icon_lx_leftimg.svg" mode="aspectFill" class="menu-icon"></image>
        <text class="menu-text">离线缓存记录</text>
      </view>
      <image src="/static/icon_right_jt.png" mode="aspectFill" class="arrow-icon"></image>
    </view>
    
    <view class="menu-item" @click="check">
      <view class="menu-left">
        <image src="/static/icon_dk_leftimg.svg" mode="aspectFill" class="menu-icon"></image>
        <text class="menu-text">所有打卡数据</text>
      </view>
      <image src="/static/icon_right_jt.png" mode="aspectFill" class="arrow-icon"></image>
    </view>

    <!-- Logout Button -->
    <view class="logout-btn" @click="handleLogout">
      <text>退出登录</text>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    navigateTo(page) {
      console.log('Navigate to:', page);
    },
	
	selectProject(){
		const that = this
		uni.showModal({
		  title: '提示',
		  content: '确定要重新选择项目吗？',
		  success: function (res) {
			if (res.confirm) {
			  console.log('用户确认重新选择项目')
			  // 清除选择的项目 IDs
			  uni.removeStorageSync('selectedProjectIds')
			  // 跳转到选择项目页面
			  uni.reLaunch({
				url: '/pages/index/index'
			  })
			}
		  }
		});
	},
	
	bindDevice(){
		// 先扫码，然后跳转到绑定设备页面
		uni.scanCode({
			scanType: ['barCode', 'qrCode'],
			success: (res) => {
				console.log('扫码成功，内容:', res.result);
				// 跳转到绑定设备页面，传递二维码内容
				uni.navigateTo({
					url: '/pages/home/level/BindDevice?qrCode=' + encodeURIComponent(res.result)
				});
			},
			fail: (err) => {
				console.error('扫码失败:', err);
				if (err.errMsg && !err.errMsg.includes('cancel')) {
					uni.showToast({
						title: '扫码失败',
						icon: 'none'
					});
				}
			}
		});
	},
	
	check(){
		uni.navigateTo({
		  url: '/pages/home/level/record/record'
		});
	},
	
	offline(){
		uni.navigateTo({
		  url: '/pages/home/level/Offline/Offline'
		});
	},
	
    handleLogout() {
      const that = this
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: function (res) {
          if (res.confirm) {
            console.log('用户确认退出登录')
            // 清除选择的项目 IDs
            uni.removeStorageSync('selectedProjectIds')
            // 清除 token
            uni.removeStorageSync('token')
            // 跳转到选择项目页面
            uni.reLaunch({
              url: '/pages/index/index'
            })
          }
        }
      });
    }
  }
}
</script>

<style>
.mine-container {
  padding: 30rpx;
  padding-bottom: calc(30rpx + 100rpx + env(safe-area-inset-bottom));
  min-height: 100vh;
  box-sizing: border-box;
  background: linear-gradient(to bottom, #e8f4fd, #ffffff);
  position: relative;
  overflow-y: auto;
}

/* Header Styles */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 80rpx 30rpx;
  margin-bottom: 30rpx;
  background: transparent;
  position: relative;
}

.header-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20rpx;
  z-index: 1;
}

.header-actions .iconfont {
  font-size: 40rpx;
  color: #666;
}

/* User Card Styles */
.user-card {
  background: transparent;
  padding: 15rpx;
  padding-top: 20rpx;
  margin-bottom: 30rpx;
  position: relative;
  height: 100rpx !important;
  max-height: 100rpx !important;
  min-height: 100rpx !important;
  overflow: visible;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f2f5;
  position: absolute;
  left: 15rpx;
  top: 50%;
  transform: translateY(-50%);
}

.user-avatar image {
  width: 100%;
  height: 100%;
}

.user-info {
  position: absolute;
  left: 159rpx;
  top: 50%;
  transform: translateY(-50%);
  right: 200rpx;
  z-index: 1;
}

.user-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 4rpx;
  line-height: 1.2;
}

.user-id,
.user-role {
  font-size: 26rpx;
  color: #8A8E9A;
  line-height: 1.2;
}

.edit-btn {
  font-size: 28rpx;
  color: #FFFFFF;
  background: #004CA2;
  border: none;
  border-radius: 176rpx;
  width: 152rpx;
  height: 60rpx;
  margin: 0;
  line-height: 60rpx;
  text-align: center;
  white-space: nowrap;
  position: absolute;
  right: 15rpx;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Menu Items */
.menu-item {
  background: #fff;
  border-radius: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  height: 90rpx;
  box-sizing: border-box;
}

.menu-left {
  display: flex;
  align-items: center;
}

.menu-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 20rpx;
}

.menu-text {
  font-size: 30rpx;
  color: #1A1A1A;
  font-weight: 400;
}

.arrow-icon {
  width: 28rpx;
  height: 28rpx;
}

/* Logout Button */
.logout-btn {
  background: #ffffff;
  color: #8A8E9A;
  font-size: 32rpx;
  font-weight: 500;
  text-align: center;
  padding: 30rpx 0;
  border-radius: 198rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  border: none;
  position: absolute;
  bottom: 110rpx;
  left: 30rpx;
  right: 30rpx;
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
