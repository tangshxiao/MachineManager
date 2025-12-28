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
      
      <!-- Devices Page - 已改为独立页面，点击标签时跳转到 /pages/home/level/DevicesMang -->
      
      <!-- Mine Page -->
      <view v-if="currentTab === 4" class="page-content">
        <MineContent />
      </view>
    </view>
    
  </view>
</template>

<script>
import HomeContent from './home/home.vue'
import ReportContent from './Report.vue'
import ScanContent from './UploadData.vue'
// import DevicesContent from './DevicesMang.vue' // 已改为独立页面
import MineContent from './MineContent.vue'

export default {
  components: {
    HomeContent,
    ReportContent,
    ScanContent,
    // DevicesContent, // 已改为独立页面
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
    // 注意：使用原生 tabBar 后，页面切换由系统自动处理
    // 如果需要特殊处理，可以在各个页面的 onLoad 或 onShow 中处理
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
  position: relative;
}

.page-content {
  height: 100%;
  overflow-y: auto;
}


.scan-page {
  background: transparent;
}
</style>
