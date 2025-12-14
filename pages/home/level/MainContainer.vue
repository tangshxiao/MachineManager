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
      <view v-if="currentTab === 2" class="page-content">
        <ScanContent />
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
import DevicesContent from './Devices/Devices.vue'
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
      currentTab: 0
    }
  },
  mounted() {
    console.log('MainContainer mounted, currentTab:', this.currentTab);
  },
  methods: {
    handleTabChange(index) {
      console.log('Tab changed to:', index);
      this.currentTab = index;
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
</style>
