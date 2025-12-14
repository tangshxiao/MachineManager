<template>
	<view class="root">
		<view class="Head">
			<view class="Head-left">
				<view class="Head-left-text">
					新能源建设机具
				</view>
				<view class="Head-left-text-daka">
					扫码打卡
				</view>
			</view>
			<view class="Head-right">
				<img src="/static/image@2x.png" alt="" />
			</view>
		</view>
	
	<view class="Content">
		<view class="">
			<view class="Content-text">设备编号:
				<view class="Content-text-left">
					{{shebei}}
				</view>
			</view>
			<view class="Content-text">设备名称:
				<view class="Content-text-left">
					{{shengchan}}
				</view>
			</view>
			<view class="Content-text">打卡类型:
				<view class="Content-text-left-a">
					{{message}}
				</view>
			</view>
			<view class="Content-text">
				当前时间:<view class="Content-text-left">
					{{ enterTime }}
				</view>
			</view>
			<view class="Content-text">
				操作人:<view class="Content-text-left">
					{{person}}
				</view>
			</view>
			<view class="Content-text">
				设备二维码:
				 <view class="">
					
				 </view>
			</view>
		</view>
		<view class="Content-btn">
			<button 
				class="Content-btn-left" 
				hover-class="btn-left-hover"
				hover-stay-time="100"
			>
				重新扫码
			</button>
			<button 
				class="Content-btn-right" 
				hover-class="btn-right-hover"
				hover-stay-time="100"
			>
				确认打卡
			</button>
		</view>
	</view>
</view>
</template>
<script>

	export default {
	  data() {
	    return {
			shebei:"DEVOOOO3",
			shengchan:"生产线B设备",
			message: "进场",
			enterTime:"",
			person:"老周"
	    }
	  },
	   // 页面加载触发（只执行一次）
	   onLoad() {
	      this.getEnterTime()
	    },
	 methods: {
		  // 获取当前时间并格式化
	     getEnterTime() {
			   // 创建时间对象
	       const now = new Date()
			// 获取年月日时分秒，并补零
	       const y = now.getFullYear()
	       const m = String(now.getMonth() + 1).padStart(2, '0')
	       const d = String(now.getDate()).padStart(2, '0')
	       const h = String(now.getHours()).padStart(2, '0')
	       const min = String(now.getMinutes()).padStart(2, '0')
	       const s = String(now.getSeconds()).padStart(2, '0')
	 
	        // 拼接成想要的格式
	       this.enterTime = `${y}-${m}-${d} ${h}:${min}:${s}`
	     }
	   },
	   
	}
</script>
<style>
	.root{
		padding-left: 36rpx;
		padding-right: 34rpx;
		background-color:#F6F7FD;
	}
	.Head{
		display: flex;
		height: 278rpx;
		
		align-items: center;  
		justify-content: space-between;
	}
	.Head-right{
		width: 318rpx;

	}
	.Head-right img{
		position: relative;
		width: 100%;
		height: 100%;
		top: 12px;
	}
	.Head-left-text{
		font-size: 36rpx;
		 font-family: "微软雅黑", "Microsoft YaHei", sans-serif;
		 font-weight: bold;
	}
	.Head-left-text-daka{
		color: #B9BCC7;
	}
	.Content{
		display: flex;
		flex-direction: column;
		justify-content: space-between; 
		padding-top: 50rpx;
		padding-left: 30rpx;
		padding-bottom: 50rpx;
		padding-right: 30rpx;
		height: 774rpx;
		position: relative;
		background-color: #ffffff;
		z-index: 10;
		border-radius: 30rpx;
		transition: all 0.3s ease;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.2);
		justify-content: space-between;
	}
	.Content-btn{
		display: flex;
	}
	.Content-btn-left{
		background-color: #E4F1FF;
		width: 290rpx;
		height: 90rpx;
		line-height: 90rpx;
		border-radius: 198rpx;
		color: #004ca2;
		font-size: 30rpx; 
		transition: all 0.2s ease;
	}
	
	
	.Content-btn-right{
		background-color: #004ca2;
		width: 290rpx;
		height: 90rpx;
		line-height: 90rpx;
		border-radius: 198rpx;
		color: #ffffff;
		font-size: 30rpx; 
		transition: all 0.2s ease;
	}
	


	.Content-text {
		display: flex;
		padding: 20rpx 0;
		border-radius: 10rpx;
	}
	
	.Content-text-left{
		padding: 0 10rpx;
	}
	.Content-text-left-a{
		padding: 0 10rpx;
		color: #50B0F9;
		font-weight: bold;
	}
	.Content-btn-left:hover {
		background-color: #c2dfff;
		transform: translateY(-2px);
		box-shadow: 0 4rpx 12rpx rgba(0, 76, 162, 0.2);
	}
	
	.Content-btn-right:hover {
		background-color: #003d82;
		transform: translateY(-2px);
		box-shadow: 0 4rpx 12rpx rgba(0, 76, 162, 0.3);
	}
	
</style>