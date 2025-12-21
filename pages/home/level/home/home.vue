<template>
	 <view class="page">

		<view class="status-bar" style="height:80px;background:#004CA2;display:block;"></view>
		<view class="user-card" style="margin-top: 80px;">
			<view class="user-card-button">
				<button class="user-card-btn"@click="daka" style="display:flex;align-items:center;justify-content:center;">
					<image src="/static/icon_scan_img.png" mode="aspectFill" style="width:40rpx;height:40rpx;margin-right:10rpx;"></image>
					扫码打卡
				</button>
			</view>
			<view class="user-card-Function">
				<view class="user-card-Record-text">
					<view class="user-card-Record-text-img">
					</view>
					功能菜单
				</view>
				<view class="user-card-Function-img">
					<view class="user-card-Function-imga" @click="yichang">
						<image src="/imgs/shouyetu1.png" alt="" />
						<view class="user-card-Function-text">
							异常上报
						</view>
					</view>
					<view class="user-card-Function-imga" @click="devices">
						<image src="/imgs/shouyetu2.png" alt="" />
						<view class="user-card-Function-text" >
							我的设备
						</view>
					</view>
					<view class="user-card-Function-imga">
						<image src="/imgs/shouyetu3.png" alt="" />
						<view class="user-card-Function-text">
							离线存储
						</view>
					</view>
					<view class="user-card-Function-imga">
						<image src="/imgs/shouyetu4.png" alt="" />
						<view class="user-card-Function-text">
							更多功能
						</view>
					</view>
				</view>
			</view>
			<view class="user-card-Record">
				<view class="user-card-Record-text">
					<view class="user-card-Record-text-img">
					</view>
					最近打卡纪录
				</view>
					
						<view class="user-card-Record-Hide">
							<view
								class="user-card-Record-Component"
								v-for="item in attendanceList"
								:key="item.id"
							>
								<view class="user-card-Record-Component-text">
									<view class="record-info">
										<view>{{ item.name || '设备名称' }}</view>
										<view>{{ item.deviceNo || '-' }}</view>
									</view>
									<button
										class="user-card-Record-Component-btn"
										v-if="item.type === 0"
									>
										进场
									</button>
									<button
										class="user-card-Record-Component-btnt"
										v-else
									>
										退场
									</button>
								</view>
								<view class="record-time">
									<image src="/static/icon_time_img.png" style="width: 22rpx; height: 22rpx; margin-right: 8rpx;"></image>
									打卡时间{{ item.time || '' }}
									<view class="record-time-rigth">
										{{ item.address || '' }}
									</view>
								</view>
							</view>
							<view v-if="attendanceList.length === 0" class="user-card-Record-Component" style="text-align:center;color:#999;">
								暂无打卡记录
							</view>
						</view>	
			</view>
			<view class="user-card-Equipment">
				<view class="user-card-Equipment-text">
					<view class="user-card-Record-text-img">
					</view>
					常用设备
				</view>
				
						<view class="user-card-Equipment-Hide">
							<view
								class="user-card-Equipment-Component1"
								v-for="item in deviceList"
								:key="item.id"
							>
								<view class="user-card-Equipment-Component-text">
									<view class="record-info">
										<view>{{ item.deviceNo || '-' }} {{ item.name || '' }}</view>
									</view>
									<button class="user-card-Equipment-Component-btn1" v-if="item.status === 0">正常</button>
									<button class="user-card-Record-Component-btnt2" v-else-if="item.status === 1">警告</button>
									<button class="user-card-Record-Component-btnt3" v-else>故障</button>
								</view>
									<view class="record-time">
										<image src="/static/icon_time_img.png" style="width: 22rpx; height: 22rpx; margin-right: 8rpx;"></image>
										最后打卡时间{{ item.lastTime || '' }}
										<view class="record-time-rigth">
										</view>
									</view>
							</view>
							<view v-if="deviceList.length === 0" class="user-card-Equipment-Component1" style="text-align:center;color:#999;">
								暂无常用设备
							</view>
						</view>	
			</view>
		</view>
	   <!-- 自定义 tabbar 固定在底部 -->
    	<custom-tab-bar />
	</view>
</template>

<script>
	import CustomTabBar from '@/components/custom-tab-bar.vue'
	import http from '@/utils/request.js'
	import API_ENDPOINTS from '@/config/api.js'
	
	export default {
 
 components: {
    CustomTabBar
  },
  data() {
    return {
      // 最近打卡记录分页
      attendanceList: [],
      attendanceCurrent: 1,
      attendanceSize: 10,
      // 常用设备分页
      deviceList: [],
      deviceCurrent: 1,
      deviceSize: 10
    }
  },

  mounted() {
    this.loadAttendanceList()
    this.loadDeviceList()
  },

  methods: {
    async loadAttendanceList() {
      try {
        const res = await http.post(API_ENDPOINTS.ATTENDANCE_LIST_API, {
          current: this.attendanceCurrent,
          size: this.attendanceSize
        })
        const records = (res && res.records) || []
        this.attendanceList = records
        this.attendanceCurrent = (res && res.current) || this.attendanceCurrent
        this.attendanceSize = (res && res.size) || this.attendanceSize
        console.log('最近打卡记录 attendanceList:', this.attendanceList)
      } catch (e) {
        console.error('获取最近打卡记录失败:', e)
        uni.showToast({
          title: '获取打卡记录失败',
          icon: 'none'
        })
      }
    },

    async loadDeviceList() {
      try {
        const res = await http.post(API_ENDPOINTS.DEVICE_LIST_API, {
          sort: 0,
          current: this.deviceCurrent,
          size: this.deviceSize
        })
        const records = (res && res.records) || []
        this.deviceList = records
        this.deviceCurrent = (res && res.current) || this.deviceCurrent
        this.deviceSize = (res && res.size) || this.deviceSize
        console.log('常用设备 deviceList:', this.deviceList)
      } catch (e) {
        console.error('获取常用设备失败:', e)
        uni.showToast({
          title: '获取常用设备失败',
          icon: 'none'
        })
      }
    },

    // 点击“打卡”跳转页面
    daka() {
      uni.navigateTo({
        url: '/pages/home/level/UploadData'
      });
    },

    // 异常跳转页面
    yichang() {
      uni.navigateTo({
        url: '/pages/home/level/Abnormal'
      });
    },
	
	devices() {
	  uni.navigateTo({
	    url: '/pages/home/level/Devices/Devices'
	  });
	}
  }
}

</script>
	
<style>
	.user-card{
		padding: 15rpx;
		background-color: #F5F8FC;
		min-height: 100vh;
		display: flex;        /* 激活弹性布局 */
		flex-direction: column;  /* 垂直排列 */
		gap: 20rpx;    
		font-family: "iconfont";
	}
	
@font-face {
  font-family: 'iconfont';  /* Project id 5080572 */
  src: url('//at.alicdn.com/t/c/font_5080572_5f7m0a6dndt.woff2?t=1764933184683') format('woff2'),
       url('//at.alicdn.com/t/c/font_5080572_5f7m0a6dndt.woff?t=1764933184683') format('woff'),
       url('//at.alicdn.com/t/c/font_5080572_5f7m0a6dndt.ttf?t=1764933184683') format('truetype');
}
	.user-card-btn{
		background-color: #004ca2;
		width: 640rpx;
		height: 90rpx;
		line-height: 90rpx;
		border-radius: 198rpx;
		color: white;
		font-size: 30rpx; 
	}

	.user-card-Function{
		height: 266rpx;
		background-color: #FFFFFF;
		border-radius: 16rpx;
		padding-left: 24rpx;
		padding-right: 24rpx;
		padding-top: 28rpx;
		 box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	}
	
	.user-card-Function-img{
		display: flex;
		flex-direction: row;
		gap: 74rpx;
		justify-content: center;
	}
	
	.user-card-Function-imga{
		 width: 120rpx;          /* 功能块总宽 */
		  display: flex;
		  flex-direction: column; /* 图片在上，文字在下 */
		  align-items: center;  
	}
	
	.user-card-Function-imga image{
		width: 80rpx;
		height: 80rpx;
		margin-bottom: 10rpx; 
	}
	
	.user-card-Function-text{
		width: 120rpx;
		font-size: 30rpx;
		color: #1A1A1A ;
		text-align: center;
	}
	
	.user-card-Record{
		height: 552rpx;
		background-color: #FFFFFF;
		border-radius: 16rpx;
		padding-left: 24rpx;
		padding-right: 24rpx;
		padding-top: 28rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	}
	
	.user-card-Record-Hide{
		border-radius: 16rpx;
		height: 450rpx;
		overflow: scroll;
	}
	
	.record-info {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}
	
	.record-time {
		margin-top: 20rpx;
		color: #666;
		font-size: 26rpx;
		display: flex;
		align-items: center;
	}
	
	.user-card-Record-text{
			display: flex;
		   font-family: 'PingFang SC', 'Helvetica Neue', 'Arial', sans-serif; /* 没有 PingFang 就用备选 */
		   font-weight: 600;  /* semibold */
		   font-size: 32rpx;
		   line-height: 44rpx;
		   color: #1A1A1A;
		   margin-bottom: 28rpx;
	}
	
	.user-card-Record-text-img{
		position: relative;
		top: 2px;
		margin-right: 24rpx;
		width: 8rpx;
		height: 32rpx;
		border-radius: 0rpx 10rpx 10rpx 0rpx;
		background-color:#4E83BE ;
	}
	
	.user-card-Record-Component{
		padding: 24rpx;
		display: flex; 
		background-color:#F5F8FC;
		flex-direction: column;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
	}
	
	.user-card-Record-Component-text{
		display: flex;
		justify-content: space-between;
		align-items: center; 
		margin-bottom: 10rpx;
	}
	
	
	.user-card-Record-Component-btn{
		margin-right: 5rpx; 
		background-color: #3AA7F9;
		width: 120rpx;
		height: 60rpx;
		line-height: 60rpx;
		border-radius: 176rpx;
		font-size: 28rpx; 
		color: white;
	}
	
	.user-card-Record-Component-btnt{
		margin-right: 5rpx; 
		background-color: #A4B6D3;
		width: 120rpx;
		height: 60rpx;
		line-height: 60rpx;
		border-radius: 176rpx;
		font-size: 28rpx; 
		color: white;
	}
	
	
	.user-card-Equipment{
		background-color: #FFFFFF;
		border-radius: 16rpx;
		padding-left: 24rpx;
		padding-right: 24rpx;
		padding-top: 28rpx;
		 box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	}
	
	.user-card-Equipment-text{
		display: flex;
		font-family: 'PingFang SC', 'Helvetica Neue', 'Arial', sans-serif; /* 没有 PingFang 就用备选 */
		font-weight: 600;  /* semibold */
		font-size: 32rpx;
		line-height: 44rpx;
		color: #1A1A1A;
		margin-bottom: 28rpx;
	}
	
	
	.user-card-Equipment-Component-text{
		display: flex;
		justify-content: space-between;
		align-items: center; 
		margin-bottom: 10rpx;
	}
	
	.user-card-Equipment-Component1{
		padding: 24rpx;
		display: flex; 
		background-color:#ECFAF3;
		flex-direction: column;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
	}
	
	.user-card-Equipment-Component2{
		padding: 24rpx;
		display: flex; 
		background-color:#FFF8F0;
		flex-direction: column;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
	}
	
	.user-card-Equipment-Component3{
		padding: 24rpx;
		display: flex; 
		background-color:#FFF2F0;
		flex-direction: column;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
	}
	
	.user-card-Equipment-Component-btn1{
		margin-right: 5rpx;
		background-color: #39CCA6;
		width: 120rpx;
		height: 60rpx;
		line-height: 60rpx;
		border-radius: 176rpx;
		font-size: 28rpx; 
		color: white;
	}
	.user-card-Record-Component-btnt2{
		margin-right: 5rpx;
		background-color: #FFB647;
		width: 120rpx;
		height: 60rpx;
		line-height: 60rpx;
		border-radius: 176rpx;
		font-size: 28rpx; 
		color: white;
	}
	.user-card-Record-Component-btnt3{
		margin-right: 5rpx;
		background-color: #E55762;
		width: 120rpx;
		height: 60rpx;
		line-height: 60rpx;
		border-radius: 176rpx;
		font-size: 28rpx; 
		color: white;
	}
	
	.page {
		background: linear-gradient(to bottom, #4E83BE, #ffffff);
		min-height: 100vh;
		box-sizing: border-box;
		padding-top: 44px;
		padding-top: env(safe-area-inset-top);
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