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
				<img src="/static/icon_bg_update.png" alt="" />
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
				证明材料:
			</view>
			<view v-if="!images.length" class="photo" @click="upload">
				<view class="photo-tb" >
				   <image src="/static/icon_phone_img.png"></image>
				</view>
				<view class="">
					拍照/从相机选择
				</view>
			</view>
			<view v-else class="photo-row">
				<view class="photo-slot" v-for="(item, index) in images" :key="item">
					<image class="thumb-img" :src="item" mode="aspectFill" @click.stop="previewImage(index)"></image>
					<view class="delete-btn" @click.stop="removeImage(index)">删除</view>
				</view>
				<view
					class="photo-slot add-slot"
					v-if="images.length < 5"
					@click="upload"
				>
					<text class="add-icon">+</text>
				</view>
			</view>
			<view class="photo-text">
				支持JPG/PNG格式，最多上传5张（已选 {{ images.length }} 张）
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
			person:"老周",
			images:[]
	    }
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
	     },
		 upload(){
		 	if (this.images.length >= 5) {
		 	  uni.showToast({
		 	    title: "最多上传5张图片",
		 	    icon: "none",
		 	  });
		 	  return;
		 	}
		 	const remain = 5 - this.images.length;
		 	uni.chooseImage({
		 	  count: remain,
		 	  sizeType: ["original", "compressed"],
		 	  sourceType: ["camera", "album"],
		 	  success: (res) => {
		 	    const paths = res.tempFilePaths || [];
		 	    const validExt = [".jpg", ".jpeg", ".png"];
		 	    const newImages = [];
		 	    paths.forEach((p) => {
		 	      const lower = String(p).toLowerCase();
		 	      const ok = validExt.some((ext) => lower.endsWith(ext));
		 	      if (ok) {
		 	        newImages.push(p);
		 	      }
		 	    });
		 	    if (newImages.length < paths.length) {
		 	      uni.showToast({
		 	        title: "仅支持JPG/PNG格式",
		 	        icon: "none",
		 	      });
		 	    }
		 	    this.images = this.images.concat(newImages).slice(0, 5);
		 	  },
		 	});
		 },
		 removeImage(index){
		 	this.images.splice(index,1)
		 },
		 previewImage(index){
		 	uni.previewImage({
		 	  urls: this.images,
		 	  current: this.images[index],
		 	});
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
	.photo{
		height: 200rpx; 
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		color: #808080;
		background-color: #FFFFFF;
		border-radius:16rpx;
	}
	.photo-disabled{
		opacity: 0.5;
	}
	.photo-tb{
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 10rpx;
	}
	.photo-tb image{
		width: 58rpx;
		height: 52rpx;
	}
	.photo-text{
		font-size: 28rpx;
		color: #808080;
	}
	.photo-row{
		min-height: 200rpx;
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		background-color: #FFFFFF;
		border-radius: 16rpx;
		padding: 16rpx 20rpx;
	}
	.photo-slot{
		position: relative;
		width: 30%;
		height: 170rpx;
		border-radius: 12rpx;
		overflow: hidden;
		background-color: #F5F9FC;
		margin-right: 3%;
		margin-bottom: 16rpx;
	}
	.photo-slot:nth-child(3n){
		margin-right: 0;
	}
	.delete-btn{
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 40rpx;
		line-height: 40rpx;
		text-align: center;
		font-size: 24rpx;
		color: #FFFFFF;
		background: rgba(0,0,0,0.45);
	}
	.add-slot{
		justify-content: center;
		align-items: center;
		display: flex;
		border: 2rpx dashed #CCCCCC;
		background-color: transparent;
	}
	.add-icon{
		font-size: 56rpx;
		color: #FF5A5A;
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