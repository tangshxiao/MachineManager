<template>
  <view class="custom-tab-bar">
    <view class="tab-bar">
      <view 
        v-for="(item, index) in list" 
        :key="index" 
        class="tab-bar-item" 
        :class="{ active: current === index }"
        @click="switchTab"
      >
        <view class="tab-bar-icon" :class="{ 'center': index === 2 }">
          <image 
            :src="current === index ? item.selectedIconPath : item.iconPath" 
            mode="aspectFit"
            :class="{
              'center-icon': index === 2,
              'normal-icon': index !== 2
            }"
          />
        </view>
        <text v-if="index !== 2" class="tab-bar-text">{{ item.text }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      current: 0,
      list: [
        {
          pagePath: "/pages/home/level/home/home",
          text: "首页",
          iconPath: "/static/icon_home_def.png",
          selectedIconPath: "/static/icon_home_sel.png"
        },
        {
          pagePath: "/pages/home/level/Report",
          text: "上报",
          iconPath: "/static/icon_upload_def.png",
          selectedIconPath: "/static/icon_upload_sel.png"
        },
        {
          pagePath: "/pages/home/level/UploadData",
          text: "",
          iconPath: "/static/icon_home_scan.png",
          selectedIconPath: "/static/icon_home_scan.png"
        },
        {
          pagePath: "/pages/home/level/DevicesMang",
          text: "设备",
          iconPath: "/static/icon_device_def.png",
          selectedIconPath: "/static/icon_device_sel.png"
        },
        {
          pagePath: "/pages/home/level/Mine",
          text: "我的",
          iconPath: "/static/icon_mine_def.png",
          selectedIconPath: "/static/icon_mine_sel.png"
        }
      ]
    };
  },
  created() {
    this.updateCurrentPage();
  },
  mounted() {
    this.updateCurrentPage();
    console.log('CustomTabBar mounted, current:', this.current);
  },
  methods: {
    updateCurrentPage() {
      const pages = getCurrentPages();
      if (pages && pages.length > 0) {
        const currentPage = pages[pages.length - 1].route;
        this.current = this.list.findIndex(item => item.pagePath.includes(currentPage));
        if (this.current === -1) this.current = 0;
      }
    },
    switchTab(index, url) {

      if (this.current === index) return;
      this.current = index;
      
      // 使用 switchTab 来切换页面，流畅无闪烁
       // if (url) {
       //   uni.switchTab({
       //     url: url,
       //     fail: (err) => {
        //      console.error('switchTab 失败:', err);
        //    }
        //  });
      //  }

      uni.scanCode({
      	success: (jieguo) => {
      		console.log('扫码成功,内容:', jieguo.result);
      		
      		// 2. 扫码成功后，才执行跳转
      		// 注意：这里需要加 "?result=" 来告诉下一个页面参数的名字
      		uni.navigateTo({
      			url: '/pages/home/level/UploadData?result=' + encodeURIComponent(jieguo.result)
      		});
      	},
      	fail: (err) => {
      		console.log('扫码失败', err);
      	}
      });

    }
  }
};
</script>

<style>
.custom-tab-bar {
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  height: 100rpx !important;
  background: #FFFFFF !important;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 99999 !important;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.tab-bar {
  display: flex;
  height: 100%;
  position: relative;
  align-items: flex-end;
  padding-bottom: 10rpx;
}

.tab-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 100%;
}

.tab-bar-icon {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
  transition: all 0.3s;
}

.tab-bar-icon.center {
  width: 110rpx;
  height: 110rpx;
  margin-top: -50rpx;
  background: #1A73E8;
  border-radius: 50%;
  padding: 12rpx;
  box-sizing: border-box;
  box-shadow: 0 4rpx 12rpx rgba(26, 115, 232, 0.3);
}

.normal-icon {
  width: 44rpx;
  height: 44rpx;
}

.center-icon {
  width: 100%;
  height: 100%;
}

.tab-bar-text {
  font-size: 20rpx;
  color: #999999;
  margin-top: 4rpx;
  transition: color 0.3s;
}

.tab-bar-item.active .tab-bar-text {
  color: #1A73E8;
}

/* 添加底部安全区域 */
.safe-area-inset-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>