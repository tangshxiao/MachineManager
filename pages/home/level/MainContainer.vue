<template>
  <view class="main-container">
    <!-- Content Area -->
    <view class="content-area">
      <!-- Home Page -->
      <view v-if="currentTab === 0" class="page-content">
        <HomeContent />
      </view>
      
      <!-- Report Page -->
      <view v-if="currentTab === 1" class="page-content">
        <ReportContent />
      </view>
      
      <!-- Scan Page -->
      <view v-if="currentTab === 2" class="page-content scan-page">
      </view>
      
      <!-- Devices Page -->
      <view v-if="currentTab === 3" class="page-content">
        <DevicesContent />
      </view>
      
      <!-- Mine Page -->
      <view v-if="currentTab === 4" class="page-content">
        <MineContent />
      </view>
    </view>
    
    <!-- Fixed TabBar -->
    <custom-tab-bar @tab-change="handleTabChange" />
  </view>
</template>

<script>
import CustomTabBar from '@/components/custom-tab-bar.vue'
import HomeContent from './home/home.vue'
import ReportContent from './Report.vue'
import ScanContent from './UploadData.vue'
import DevicesContent from './DevicesMang.vue'
import MineContent from './MineContent.vue'

export default {
  components: {
    CustomTabBar,
    HomeContent,
    ReportContent,
    ScanContent,
    DevicesContent,
    MineContent
  },
  data() {
    return {
      currentTab: 0,
      ids: []
    }
  },
  onLoad(options) {
    const idsStr = decodeURIComponent((options && options.ids) || '')
    console.log('MainContainer 收到的 ids 字符串:', idsStr)
    this.ids = idsStr ? idsStr.split(',') : []
    console.log('MainContainer 拆分后的 ids 数组:', this.ids)
  },
  mounted() {
    console.log('MainContainer mounted, currentTab:', this.currentTab);
  },
  methods: {
    handleTabChange(index) {
      console.log('Tab changed to:', index);
      this.currentTab = index;
      
      // 当切换到扫码页面时，直接触发扫码
      if (index === 2) {
        uni.scanCode({
          scanType: ['barCode', 'qrCode'],
          success: function (res) {
            console.log('条码类型：' + res.scanType);
            console.log('条码内容：' + res.result);
            uni.showToast({
              title: '扫码成功：' + res.result,
              icon: 'success'
            });
          },
          fail: (err) => {
            console.error('扫码失败:', err);
            uni.showToast({
              title: '扫码失败',
              icon: 'none'
            });
            this.currentTab = 0; // 回到首页
          }
        });
      }
    }
  }
}
</script>

<style>
.main-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-area {
  flex: 1;
  overflow: hidden;
  padding-bottom: 100rpx;
}

.page-content {
  height: 100%;
  overflow-y: auto;
}

.scan-page {
  background: transparent;
}
</style>
