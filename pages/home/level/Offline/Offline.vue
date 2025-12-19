<template>
  <view class="container">
    
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-num blue">9</text>
        <text class="stat-label">总缓存记录</text>
      </view>
      <view class="stat-item">
        <text class="stat-num orange">7</text>
        <text class="stat-label">未上传</text>
      </view>
      <view class="stat-item">
        <text class="stat-num green">2</text>
        <text class="stat-label">已上传</text>
      </view>
      <view class="stat-item">
        <text class="stat-num gray">1</text>
        <text class="stat-label">损坏</text>
      </view>
    </view>

    <view class="upload-all-card" @click="uploadAll">
      <view class="cloud-icon">&#xe663;️</view> <text>立即上传全部</text>
    </view>

    <scroll-view scroll-y class="list-container">
      <view class="record-card" v-for="(item, index) in listData" :key="item.id">
        
        <view class="select-area" v-if="isSelectMode">
          <checkbox :checked="item.selected" @click="toggleItemSelect(index)" color="#196AD4" style="transform:scale(0.8)"/>
        </view>

        <view class="card-content">
          <view class="card-header">
            <view class="header-left">
              <text class="device-name">{{ item.deviceName }}</text>
              <view class="tag" :class="getTagClass(item.tag)">{{ item.tag }}</view>
            </view>
            <view class="header-right">
              <text v-if="item.status === 'corrupted'" class="status-text red">● 数据损坏</text>
              <text v-else class="status-text gray">● 未上传</text>
            </view>
          </view>
          
          <view class="time-text">{{ item.time }}</view>

          <view class="card-body">
            <image :src="item.imgUrl" mode="aspectFill" class="thumb-img"></image>
            <view class="location-info">
              <text class="iconfont-location-icon">&#xe847;</text>
              <text>{{ item.location }}</text>
            </view>
          </view>

          <view class="card-actions">
            <template v-if="item.status === 'corrupted'">
              <view class="btn delete-btn" @click="handleCorruptedClick(index)">删除</view>
              <view class="btn primary-btn" @click="handleCorruptedClick(index)">查看详情</view>
            </template>
            
            <template v-else>
              <view class="btn outline-btn" @click="reUploadOne(item)">重新上传</view>
              <view class="btn primary-btn" @click="goToDetail(item)">查看详情</view>
            </template>
          </view>
        </view>
      </view>

      <view style="height: 120rpx;"></view>
    </scroll-view>

    <view class="bottom-notice" v-if="!isSelectMode">
      <text>5条记录中3条上传成功，<text class="red-text">2条失败</text>。</text>
      <view class="notice-btn">查看详情</view>
    </view>

    <view class="bottom-action-bar" v-if="isSelectMode && hasSelectedItems">
      <view class="action-btn" @click="uploadSelectedItems">选中数据重新上传</view>
    </view>

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
    
      listData: [
        {
          id: 1,
          deviceName: '设备W',
          tag: '退场',
          time: '2025-11-10 14:20',
          status: 'normal',
          location: '工作A区',
          imgUrl: '/static/leaf.jpg', // 请替换为本地图片路径
          selected: false
        },
        {
          id: 2,
          deviceName: '设备W',
          tag: '进场',
          time: '2025-11-10 14:20',
          status: 'normal',
          location: '工作A区',
          imgUrl: '/static/leaf.jpg',
          selected: false
        },
        {
          id: 3,
          deviceName: '设备W',
          tag: '异常上报', // 对应红色标签
          time: '2025-11-10 14:20',
          status: 'normal',
          location: '未知地址',
          imgUrl: '/static/leaf.jpg',
          selected: false
        },
        {
          id: 4,
          deviceName: '设备W',
          tag: '退场',
          time: '2025-11-10 14:20',
          status: 'corrupted', // 逻辑4: 损坏状态
          location: '质检部',
          imgUrl: '/static/leaf.jpg',
          selected: false
        }
      ]
    };
  },
  computed: {
    // 检查是否有选中的项
    hasSelectedItems() {
      return this.listData.some(item => item.selected);
    }
  },
  methods: {
    
    // 单选切换
    toggleItemSelect(index) {
      this.listData[index].selected = !this.listData[index].selected;
    },
    // 获取标签样式
    getTagClass(tag) {
      if (tag === '异常上报') return 'tag-red';
      if (tag === '进场') return 'tag-green';
      return 'tag-blue'; // 默认退场
    },
    
    // 逻辑3: 跳转详情页
    goToDetail(item) {
      uni.navigateTo({
        url: `/pages/cacheDetail/cacheDetail?id=${item.id}`,
        success: () => console.log('跳转至缓存详情页')
      });
    },

    // 逻辑4: 处理损坏数据点击
    handleCorruptedClick(index) {
      uni.showModal({
        title: '提示',
        content: '此条缓存数据已损坏，无法上传，请重新打卡',
        confirmText: '删除损坏数据',
        confirmColor: '#E02020',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 执行删除逻辑
            this.listData.splice(index, 1);
            uni.showToast({ title: '已删除', icon: '' });
          }
        }
      });
    },

    // 重新上传单个
    reUploadOne(item) {
      uni.showLoading({ title: '上传中...' });
      setTimeout(() => uni.hideLoading(), 1000);
    },

    // 上传全部
    uploadAll() {
      uni.showToast({ title: '开始上传全部...', icon: '' });
    },

    // 逻辑1: 批量上传
    uploadSelectedItems() {
      const selectedIds = this.listData.filter(i => i.selected).map(i => i.id);
      uni.showToast({ title: `正在重新上传 ${selectedIds.length} 条数据`, icon: 'none' });
    }
  }
};
</script>

<style lang="scss" scoped>
	/* 在线链接服务仅供平台体验和调试使用，平台不承诺服务的稳定性，企业客户需下载字体包自行发布使用并做好备份。 */
	@font-face {
	  font-family: 'iconfont';  /* Project id 5080572 */
	  src: url('https://at.alicdn.com/t/c/font_5080572_jslpii6sv5d.woff2?t=1766145792837') format('woff2'),
	       url('https://at.alicdn.com/t/c/font_5080572_jslpii6sv5d.woff?t=1766145792837') format('woff'),
	       url('https://at.alicdn.com/t/c/font_5080572_jslpii6sv5d.ttf?t=1766145792837') format('truetype');
	}
/* 全局背景 */
.container {
  background-color: #F5F7FA;
  min-height: 100vh;
  padding-bottom: 50px;
  position: relative;
}


.inner-dot {
  width: 20rpx;
  height: 20rpx;
  background: #fff;
  border-radius: 50%;
  border: 4rpx solid #0F58B6;
}
.inner-dot.active {
    background: #4cd964; /* 激活时变色示意 */
}

/* 蓝色背景装饰 */
.blue-bg {
  background-color: #0F58B6;
  height: 120rpx;
  width: 100%;
  border-bottom-left-radius: 30rpx;
  border-bottom-right-radius: 30rpx;
  position: absolute;
  top: calc(88rpx + var(--status-bar-height));
  z-index: 0;
}

/* 统计卡片 */
.stats-card {
  margin: 20rpx 30rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx 0;
  display: flex;
  justify-content: space-around;
  position: relative;
  z-index: 1;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-num {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}
.stat-label {
  font-size: 24rpx;
  color: #999;
}
.blue { color: #196AD4; }
.orange { color: #FF9800; }
.green { color: #4CD964; }
.gray { color: #999; }

/* 立即上传全部 */
.upload-all-card {
  margin: 0 30rpx 20rpx;
  background: #fff;
  border-radius: 20rpx;
  height: 100rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 26rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}
.cloud-icon {
	font-family: 'iconfont';
	font-size: 40rpx;
	color: #196AD4;
	margin-bottom: 5rpx;
}

/* 列表卡片 */
.record-card {
  margin: 0 30rpx 20rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
}
.select-area {
  margin-right: 20rpx;
}
.card-content {
  flex: 1;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}
.header-left {
  display: flex;
  align-items: center;
}
.device-name {
  font-size: 32rpx;
  font-weight: bold;
  margin-right: 15rpx;
}
.tag {
  font-size: 20rpx;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
}
.tag-blue { background: #E6F0FC; color: #196AD4; }
.tag-green { background: #E8F5E9; color: #4CD964; }
.tag-red { background: #FFEBEE; color: #E02020; }

.status-text {
  font-size: 24rpx;
}
.status-text.gray { color: #999; }
.status-text.red { color: #E02020; }

.time-text {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.card-body {
  position: relative;
  margin-bottom: 20rpx;
}

.iconfont-location-icon{
	font-family: 'iconfont';
}
.thumb-img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  background: #eee;
}
.location-info {
  position: absolute;
  right: 0;
  bottom: 10rpx;
  font-size: 24rpx;
  color: #666;
  display: flex;
  align-items: center;
}
.location-icon { margin-right: 6rpx; }

/* 按钮组 */
.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
}
.btn {
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
}
.primary-btn {
  background: #0F58B6;
  color: #fff;
}
.outline-btn {
  background: #E6F0FC;
  color: #0F58B6;
}
.delete-btn {
  background: #F5F7FA;
  color: #999;
}

/* 底部通知条 */
.bottom-notice {
  position: fixed;
  bottom: 120rpx; /* Tabbar高度之上 */
  left: 30rpx;
  right: 30rpx;
  background: #E6F0FC;
  padding: 20rpx 30rpx;
  border-radius: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 24rpx;
  color: #333;
}
.red-text { color: #E02020; }
.notice-btn {
  background: #0F58B6;
  color: #fff;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

/* 底部批量操作栏 (选中时出现) */
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100rpx;
  background: #fff;
  box-shadow: 0 -4rpx 10rpx rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.action-btn {
  width: 80%;
  height: 80rpx;
  background: #0F58B6;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
  font-size: 30rpx;
}

/* 模拟 Tabbar */
.tab-bar {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 100rpx;
  background: #fff;
  display: flex;
  border-top: 1rpx solid #eee;
  z-index: 90;
}
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: #999;
}
.tab-item.active { color: #0F58B6; }
.tab-icon { font-size: 36rpx; margin-bottom: 4rpx; }
.center-icon {
  background: #0F58B6;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -30rpx;
  border: 6rpx solid #fff;
}
</style>