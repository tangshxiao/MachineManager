<template>
  <view class="page-container">
    <!-- 搜索框 -->
    <view class="search-box" style="position:relative;padding: 20rpx 30rpx 20rpx 0;" >
       <image src="/static/icon_secrch_img.png" style="width:28rpx;height:28rpx;position:absolute;left:58rpx;z-index:1;"></image>
        <input 
          type="text" 
          placeholder="输入设备编号或名称搜索" 
          v-model="keyword"
          @input="onSearch"
          style="flex:1;padding-left:66rpx;margin-left:30rpx;"
        />
	  <!-- <view class="search-box-btn" @click="newly">
	  	<image src="/static/icon_add_devices.png" style="width:40rpx;height:40rpx; "></image>
	  	添加设备
	  </view> -->
    </view>

    <!-- 分类筛选 -->
    <view class="filter-tabs">
      <view 
        v-for="tab in tabs" 
        :key="tab.value" 
        :class="['filter-item', currentTab === tab.value ? 'active' : '']"
        @tap="chooseTab(tab.value)"
      >
        {{ tab.label }}
      </view>
    </view>

    <!-- 设备列表 -->
    <view class="list">
      <view 
        class="device-item" 
        v-for="item in filteredList" 
        :key="item.id"
        @click="goToDeviceDetail(item)"
      >
	  <view class="device-item-box">
			  <view class="device-item-left">
				   <view class="device-item-text">
						<text class="device-no">{{ item.deviceNo }}</text>
						<text class="device-name">{{ item.name }}</text>
					</view>
					<view class="device-item-time">
						<image src="/static/icon_time_img.png" style="width: 22rpx; height: 22rpx;"></image>
						<text>最后打卡时间:{{ item.lastTime }}</text>
					</view>
			   </view>
			   <view class="device-item-right">
				   <view :class="['status-tag', getStatusClass(item.status)]">
						{{ getStatusText(item.status) }}
				   </view>
				   <!-- <view class="status-buttons">
					   <view 
						   class="status-btn using-btn" 
						   :class="{ active: item.status === 1 }"
						   @click.stop="updateDeviceStatus(item, 1)"
					   >
						   在用
					   </view>
					   <view 
						   class="status-btn maintenance-btn" 
						   :class="{ active: item.status === 2 }"
						   @click.stop="updateDeviceStatus(item, 2)"
					   >
						   维修
					   </view>
				   </view> -->
			   </view>
	   </view>
      </view>
      <view v-if="filteredList.length === 0 && !loading" class="empty">
        没有找到匹配的设备
      </view>
      
      <!-- 加载状态 -->
      <view class="loading-more" v-if="loading">
        <text class="loading-text">加载中...</text>
    </view>

      <!-- 没有更多数据 -->
      <view class="no-more" v-if="!hasMore && deviceList.length > 0">
        <text class="no-more-text">没有更多数据了</text>
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
      keyword: "",        // 搜索关键字
      currentTab: "all",  // 当前分类
      tabs: [
        { label: "全部", value: "all" },
        { label: "在用", value: "在用" },
        { label: "维修", value: "维修" }
      ],
      // 设备列表（后端接口返回）
      deviceList: [],
      // 分页参数
      deviceCurrent: 1,
      deviceSize: 10,
      total: 0,
      loading: false,
      hasMore: true,
	  finallys:[
			{date:"",time:""},
		  ],
    };
  },
  mounted() {
	this.loadDeviceList(true);
  },
  // 下拉刷新（页面级生命周期）
  onPullDownRefresh() {
    this.onRefresh();
  },
  // 上拉加载更多（页面级生命周期）
  onReachBottom() {
    this.onLoadMore();
  },
  computed: {
    filteredList() {
      return this.deviceList.filter(item => {
        // 仅按关键字在前端过滤，状态由接口的 status 参数控制
        const matchKeyword = !this.keyword 
          || (item.deviceNo && item.deviceNo.includes(this.keyword))
          || (item.name && item.name.includes(this.keyword));
        return matchKeyword;
      });
    }
  },
  methods: {
	onSearch() {
	  this.deviceCurrent = 1;
	  this.loadDeviceList(true);
	},
    chooseTab(tabValue) {
      this.currentTab = tabValue;
	  this.deviceCurrent = 1;
	  this.loadDeviceList(true);
    },
	// 下拉刷新
	async onRefresh() {
	  if (this.loading) {
		uni.stopPullDownRefresh();
		return;
	  }
	  
	  this.deviceCurrent = 1;
	  await this.loadDeviceList(true);
	  uni.stopPullDownRefresh();
	},
	// 上拉加载更多
	async onLoadMore() {
	  if (this.loading || !this.hasMore) {
		return;
	  }
	  await this.loadDeviceList(false);
    },
	async loadDeviceList(reset = false) {
	  if (this.loading) return;
	  
	  if (!reset && !this.hasMore) {
		return;
	  }
	  
	  this.loading = true;
	  
	  try {
		const statusMap = {
		  '在用': 1,
		  '维修': 2
		};
		const status = statusMap[this.currentTab];
		const nextPage = reset ? 1 : this.deviceCurrent + 1;
		
		// 获取项目ID
		const selectedProjectIds = uni.getStorageSync('selectedProjectIds');
		if (!selectedProjectIds) {
		  uni.showToast({
			title: '请先选择项目',
			icon: 'none'
		  }); 
		  return;
		}
		// 取第一个项目ID作为pid
		const pid = selectedProjectIds.split(',')[0];
		
		const params = {
		  sort: 0,
		  current: nextPage,
		  size: this.deviceSize,
		  keyword: this.keyword,
		  pid: pid
		};
		// 全部时不传 status，其他状态传 1/2
		if (status !== undefined) {
		  params.status = status;
		}
		const res = await http.post(API_ENDPOINTS.DEVICE_LIST_API, params);
		const records = (res && res.records) || [];
		
		// 保留原始的 status 数值（0进场 1在用 2维修 3退场）
		// 不需要转换，直接使用原始数据
		const mappedRecords = records.map(item => {
		  return {
			...item,
			// status 保持原始值 0/1/2/3
		  };
		});
		
		if (reset) {
		  this.deviceList = mappedRecords;
		  this.deviceCurrent = 1;
		} else {
		  this.deviceList = this.deviceList.concat(mappedRecords);
		}
		
		this.deviceCurrent = res.current || nextPage;
		this.deviceSize = res.size || this.deviceSize;
		this.total = res.total || 0;
		
		// 判断是否还有更多数据
		this.hasMore = this.deviceList.length < this.total && records.length >= this.deviceSize;
		
	  } catch (e) {
		console.error('获取设备列表失败:', e);
		if (!reset) {
		uni.showToast({
			title: '加载失败',
		  icon: 'none'
		});
		}
	  } finally {
		this.loading = false;
	  }
	},
	newly (){
		  uni.navigateTo({
			  url:'/pages/home/level/Newly'
		  });
	},
	// 获取状态文字
	getStatusText(status) {
	  const statusMap = {
		0: '进场',
		1: '在用',
		2: '维修',
		3: '退场'
	  };
	  return statusMap[status] || '';
	},
	// 获取状态样式类
	getStatusClass(status) {
	  const statusMap = {
		0: 'entry',      // 进场
		1: 'using',      // 在用
		2: 'maintenance', // 维修
		3: 'exit'        // 退场
	  };
	  return statusMap[status] || '';
	},
	// 跳转到设备详情
	goToDeviceDetail(item) {
	  if (!item.id) {
		uni.showToast({
		  title: '设备信息错误',
		  icon: 'none'
		})
		return
	  }
	  uni.navigateTo({
		url: `/pages/home/level/record/device-detail/device-detail?id=${item.id}`
	  })
	},
	// 更新设备状态
	async updateDeviceStatus(item, status) {
	  if (!item.id) {
		uni.showToast({
		  title: '设备信息错误',
		  icon: 'none'
		})
		return
	  }
	  
	  // 如果状态相同，不需要更新
	  if (item.status === status) {
		return
	  }
	  
	  uni.showLoading({
		title: '更新中...',
		mask: true
	  })
	  
	  try {
		// 调用更新设备状态的接口
		// 使用DEVICE_ADD_API，通常这个接口在传入id时会更新设备信息
		const updateData = {
		  id: item.id,
		  status: status
		}
		
		await http.post(API_ENDPOINTS.DEVICE_ADD_API, updateData, {
		  header: {
			'Content-Type': 'application/json'
		  }
		})
		
		// 更新本地列表中的状态
		const index = this.deviceList.findIndex(d => d.id === item.id)
		if (index !== -1) {
		  // 直接更新 status 数值
		  this.deviceList[index].status = status
		}
		
		uni.hideLoading()
		uni.showToast({
		  title: '更新成功',
		  icon: 'success'
		})
		
		// 如果当前筛选的不是"全部"，可能需要刷新列表
		if (this.currentTab !== 'all') {
		  // 可以选择刷新列表或移除不符合筛选条件的项
		  this.loadDeviceList(true)
		}
		
	  } catch (error) {
		console.error('更新设备状态失败:', error)
		uni.hideLoading()
		uni.showToast({
		  title: error.msg || '更新失败，请重试',
		  icon: 'none'
		})
	  }
	}
  }
};
</script>

<style>
	/* 在线链接服务仅供平台体验和调试使用，平台不承诺服务的稳定性，企业客户需下载字体包自行发布使用并做好备份。 */
	@font-face {
	  font-family: 'iconfont';  /* Project id 5080572 */
	  src: url('//at.alicdn.com/t/c/font_5080572_fn371rvffq4.woff2?t=1765706049164') format('woff2'),
	       url('//at.alicdn.com/t/c/font_5080572_fn371rvffq4.woff?t=1765706049164') format('woff'),
	       url('//at.alicdn.com/t/c/font_5080572_fn371rvffq4.ttf?t=1765706049164') format('truetype');
	}
page {
	background-color: #F5F8FC; 
	 font-family: 'iconfont'; 
	padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
}


.search-box {
	display: flex;
	justify-content: space-between;
  margin-bottom: 20rpx;
  background-color: #ffffff; 
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx 20rpx 30rpx;
}
.search-box input {
  width: 460rpx;
  height: 80rpx;
  padding: 0 28rpx;
  border-radius: 50rpx;
  background-color:#F5F8FC ;
  font-size: 28rpx;
}

.search-box-btn{
	width: 200rpx;
	height: 80rpx;
	border-radius: 50rpx;
	background-color:#004CA2 ;
	font-size: 28rpx;
	color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
}

.filter-tabs {
  flex-direction: row;
  display: flex;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  padding: 0 30rpx;
}

.filter-item {
  padding: 5rpx 20rpx;
  border-radius: 50rpx;

  background-color: #FFFFFF;
  color: #666;
  margin-right: 20rpx;
}

.filter-item.active {
  background-color: #ffffff;
  color: #007AFF;
}

.list {
  margin-top: 10rpx;
  padding: 0 30rpx 0 30rpx;
}

.device-item {
  padding: 15rpx;
  display: flex;
  justify-content: space-between;
  border-bottom: 1rpx solid #eee;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  cursor: pointer;
}

.device-item-left {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.device-item-text{
	display: flex;
	align-items: center;
	margin-bottom: 16rpx;
	gap: 20rpx;
	flex-wrap: nowrap;
}

.device-no {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
	white-space: nowrap;
}

.device-name {
	font-size: 28rpx;
	color: #333;
	white-space: nowrap;
}

.empty {
  text-align: center;
  color: #999;
  margin-top: 50rpx;
}
.device-item-box{
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding: 0 34rpx;
}

.device-item-right {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 20rpx;
	flex-shrink: 0;
}

.status-buttons {
	display: flex;
	gap: 20rpx;
}

.status-btn {
	width: 100rpx;
	height: 60rpx;
	border-radius: 50rpx;
	font-size: 26rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2rpx solid #E0E0E0;
	background-color: #FFFFFF;
	color: #666;
	white-space: nowrap;
	transition: all 0.2s ease;
}

.status-btn.using-btn {
	border-color: #39CCA6;
	color: #39CCA6;
}

.status-btn.using-btn.active {
	background-color: #39CCA6;
	color: #FFFFFF;
	border-color: #39CCA6;
}

.status-btn.maintenance-btn {
	border-color: #FFB138;
	color: #FFB138;
}

.status-btn.maintenance-btn.active {
	background-color: #FFB138;
	color: #FFFFFF;
	border-color: #FFB138;
}

.status-tag{
	width: 120rpx;
	height: 60rpx;
	border-radius: 50px;
	color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
}
.status-tag.entry{
	background-color: #3AA7F9; /* 进场-蓝色 */
}
.status-tag.using{
	background-color: #39CCA6; /* 绿色 */
}
.status-tag.maintenance{
	background-color: #E55762; /* 红色 */
}
.status-tag.exit{
	background-color: #FFB138; /* 黄色 */
}

.device-item-time{
	color: #AEB0B9;
	font-size: 24rpx;
	display: flex;
	align-items: center;
	gap: 8rpx;
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
</style>

