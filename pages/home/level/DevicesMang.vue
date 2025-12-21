<template>
  <view class="page-container">
<view class="status-bar" style="height:80px;background:#004CA2;display:block;"></view>
    <!-- 搜索框 -->
    <view class="search-box"  style="margin-top: 80px;position:relative;padding: 20rpx 30rpx 20rpx 0;" >
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
							{{ item.code }}
						</view>
						<view class="">
							{{ item.name }}
						</view>
					</view>
					<view class="device-item-time">
						<image src="/static/icon_time_img.png" style="width: 22rpx; height: 22rpx;"></image>
            最后打卡时间:{{ finallys[0].date }}{{ finallys[0].time }}
					</view>
			   </view>
			   <view :class="['status-tag', item.statuss]">
					{{ item.statuss === 'normal'?'正常': item.statuss==='warning'?'警告':'故障'}}
			   </view>
	   </view>
      </view>
      <view v-if="filteredList.length === 0" class="empty">
        没有找到匹配的设备
      </view>
    </view>

  </view>
</template>


<script>
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
      // 示例设备数据（后端可替换为 uni.request 获取）
      deviceList: [
        { id: 1, code: "EQ-2025-0001", name: "挖掘机", status: "正常" , statuss:"normal"},
        { id: 2, code: "EQ-2025-0002", name: "装载机", status: "警告" , statuss:"warning"},
        { id: 3, code: "EQ-2025-0003", name: "装载机", status: "故障" , statuss:"error"},
        { id: 4, code: "EQ-2025-0004", name: "装载机", status: "正常" , statuss:"normal"},
      ],
	  finallys:[
			{date:"2025-11-10",time:"14:20"},
		  ],
    };
  },
  computed: {
    filteredList() {
      return this.deviceList.filter(item => {
        // 分类筛选
        const matchTab = this.currentTab === "all" 
          || item.status === this.currentTab;
        // 关键字搜索（编号或名称）
        const matchKeyword = !this.keyword 
          || item.code.includes(this.keyword) 
          || item.name.includes(this.keyword);
        return matchTab && matchKeyword;
      });
    }
  },
  methods: {
    onSearch() {
      // 输入时自动触发过滤（computed 会自动更新）
    },
    chooseTab(tabValue) {
      this.currentTab = tabValue;
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
  .status-bar {
    height: 80px;
    height: env(safe-area-inset-top);
    width: 100%;
    background: #004CA2;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
  }

</style>

