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
	  <view class="search-box-btn" @click="newly">
	  	<image src="/static/icon_add_devices.png" style="width:40rpx;height:40rpx; "></image>
	  	添加设备
	  </view>
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
      >
	  <view class="device-item-box">
			  <view class="">
				   <view class="device-item-text">
						<view class="">
							{{ item.deviceNo }}
						</view>
						<view class="">
							{{ item.name }}
						</view>
					</view>
					<view class="device-item-time">
						<image src="/static/icon_time_img.png" style="width: 22rpx; height: 22rpx;"></image>
            最后打卡时间:{{ item.lastTime }}
					</view>
			   </view>
			   <view :class="['status-tag', item.statuss]">
					{{ item.statuss === 'normal'?'正常': item.statuss==='warning'?'警告':'故障'}}
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
        { label: "正常", value: "正常" },
        { label: "警告", value: "警告" },
        { label: "故障", value: "故障" }
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
		  '正常': 0,
		  '警告': 1,
		  '故障': 2
		};
		const status = statusMap[this.currentTab];
		const nextPage = reset ? 1 : this.deviceCurrent + 1;
		
		const params = {
		  sort: 0,
		  current: nextPage,
		  size: this.deviceSize,
		  keyword: this.keyword
		};
		// 全部时不传 status，其他状态传 0/1/2
		if (status !== undefined) {
		  params.status = status;
		}
		const res = await http.post(API_ENDPOINTS.DEVICE_LIST_API, params);
		const records = (res && res.records) || [];
		
		// 将后端返回的 status(0/1/2) 转成页面展示需要的字段
		const statusDisplayMap = {
		  0: { text: '正常', cls: 'normal' },
		  1: { text: '警告', cls: 'warning' },
		  2: { text: '故障', cls: 'error' }
		};
		
		const mappedRecords = records.map(item => {
		  const s = statusDisplayMap[item.status];
		  if (s) {
			return {
			  ...item,
			  status: s.text,
			  statuss: s.cls
			};
		  }
		  return item;
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
}

.device-item-text{
	 display: flex;
	padding-bottom: 16rpx;;
}

.empty {
  text-align: center;
  color: #999;
  margin-top: 50rpx;
}
.device-item-box{
	width: 100%;
	display: flex;
	  justify-content: center; 
	  align-items: center;    
	  justify-content: space-between;
	  padding: 0 34rpx;
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
.status-tag.normal{
	background-color: #39CCA6;
}
.status-tag.warning{
	background-color: #FFB138;
}
.status-tag.error{
	background-color: #E55762;
}

.device-item-time{
	color: #AEB0B9;
	font-size: 28rpx;
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

