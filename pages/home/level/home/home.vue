<template>
		<view class="user-card">
			<view class="user-card-button">
				<button class="user-card-btn">
					<text class="iconfont">&#xe600;</text>
					扫码打卡
				</button>
			</view>
			<view class="user-card-Function">
				<view class="user-card-Function-text">
					功能菜单
				</view>
			</view>
			<view class="">
				最近打卡纪录
			</view>
			<view class="">
				常用设备
			</view>
		</view>
</template>

<script>
</script>

<style>
	.user-card{
		padding: 10rpx;
		background-color: #F5F8FC;
		min-height: 100vh;
		
	}
	
	@font-face {
	  font-family: 'iconfont';  /* Project id 5080572 */
	  src: url('//at.alicdn.com/t/c/font_5080572_4c1ie2j8r3q.woff2?t=1764817678307') format('woff2'),
	       url('//at.alicdn.com/t/c/font_5080572_4c1ie2j8r3q.woff?t=1764817678307') format('woff'),
	       url('//at.alicdn.com/t/c/font_5080572_4c1ie2j8r3q.ttf?t=1764817678307') format('truetype');
	}
	
	.user-card-btn{
		background-color: #004ca2;
		width: 640rpx;
		height: 90rpx;
		line-height: 90rpx;
		border-radius: 198rpx;
		color: white;
		font-size: 30rpx; 
		font-family: "iconfont";
	}

	.user-card-Function{
		height: 266rpx;
		background-color: #aa5500;
		border-radius: 16rpx;
	}
	.user-card-Function-text{
		padding-left: 48rpx;
		padding-top: 28rpx;
	}
</style>