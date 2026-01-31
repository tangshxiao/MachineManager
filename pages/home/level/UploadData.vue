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
			<view >
				<image src="/static/icon_bg_update.png" mode="widthFix"alt=""class="Head-right" />
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
				<picker class="Content-picker" mode="selector" :range="checkInTypes" @change="onCheckInTypeChange">
					<view class="Content-picker-sele" style="display:flex;justify-content:space-between;align-items:center;width:100%;">
						<view class="Content-text-left-a">{{message}}</view>
						<image src="/static/icon_jt_xx.png" style="width:32rpx; height: 32rpx;flex-shrink:0;margin-right:16rpx;"></image>
				</view>
				</picker>
			</view>
			<view class="Content-text">
				当前时间:<view class="Content-text-left">
					{{  enterTime }}
				</view>
			</view>
			<!-- <view class="Content-text">
				操作人:<view class="Content-text-left">
					{{person}}
				</view>
			</view> -->
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
			<view class="Content-text qr-code-row">
				<view class="qr-code-label">设备二维码:</view>
				<view class="qr-code-container" v-if="qrCodeUrl">
					<image :src="qrCodeUrl" mode="aspectFit" class="qr-code-image" @click="previewQrCode"></image>
				</view>
				<view class="qr-code-placeholder" v-else>
					<text class="placeholder-text">暂无二维码</text>
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
				@click="submitCheckIn"
			>
				确认打卡
			</button>
		</view>
	</view>
</view>
</template>
<script>
import http from '@/utils/request.js'
import API_ENDPOINTS from '@/config/api.js'
import { saveCacheRecord } from '@/utils/offlineCache.js'

	export default {
	  data() {
	    return {
			shebei:"DEVOOOO3",
			shengchan:"生产线B设备",
			message: "在用",
			checkInTypes: ["在用", "维修"],
			enterTime:"",
			person:"老周",
			images:[],
			// 打卡相关字段
			deviceId: 0,
			// 位置信息
			address: "",
			lng: "",
			lat: "",
			// 提交状态
			submitting: false,
			// 二维码图片URL
			qrCodeUrl: ""
	    }
	  },
	  
	  onLoad() {
		// 页面加载时获取当前时间
		this.getEnterTime();
	  },
	  onShow() {
		// 每次显示页面时触发扫码
		this.scanCode();
	  },
	 // methods: {
		//   // 扫码功能
		//   scanCode() {
		// 	uni.scanCode({
		// 	  scanType: ['barCode', 'qrCode'],
		// 	  success: (res) => {
		// 		console.log('条码类型：' + res.scanType);
		// 		console.log('条码内容：' + res.result);
		// 		// 这里可以根据扫码结果更新页面数据
		// 		// 例如：this.shebei = res.result;
		// 		uni.showToast({
		// 		  title: '扫码成功',
		// 		  icon: 'success'
		// 		});
		// 	  },
		// 	  fail: (err) => {
		// 		console.error('扫码失败:', err);
		// 		// 扫码失败时不显示错误提示，避免影响用户体验
		// 		// 如果用户主动取消扫码，不需要提示
		// 		if (err.errMsg && !err.errMsg.includes('cancel')) {
		// 		  uni.showToast({
		// 			title: '扫码失败',
		// 			icon: 'none'
		// 		  });
		// 		}
		// 	  }
		// 	});
		//   },
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

	  
	  onLoad(options) {
	  			this.getEnterTime();
	  
	  			if (options && options.result) {
	  							// 因为首页传过来时可能 encode 了，这里最好 decode 一下
	  							const resultStr = decodeURIComponent(options.result);
	  							this.handleScanData(resultStr);
	  						}
	  		},
	  
	 methods: {
		 // 打卡类型选择变化
		 onCheckInTypeChange(e) {
			 const index = e.detail.value;
			 this.message = this.checkInTypes[index];
		 },
		 async handleScanData(jsonStr) {
		 				try {
		 					// 将 JSON 字符串转换为对象
		 					const qrData = JSON.parse(jsonStr);
		 					
		 					// 提取qrNo
		 					if (!qrData.qrNo) {
		 						uni.showToast({
		 							title: '二维码格式错误',
		 							icon: 'none'
		 						});
		 						return;
		 					}
		 					
		 					// 调用二维码详情接口获取设备信息
		 					uni.showLoading({
		 						title: '加载中...',
		 						mask: true
		 					});
		 					
		 					const qrDetails = await http.post(API_ENDPOINTS.DEVICE_QR_DETAILS_API, {
		 						qrNo: qrData.qrNo
		 					});
		 					
		 					uni.hideLoading();
		 					
		 					console.log('二维码详情数据:', qrDetails);
		 					
		 					if (qrDetails) {
		 						// 1. 反显设备编号 (deviceNo -> shebei)
		 						if (qrDetails.deviceNo) {
		 							this.shebei = qrDetails.deviceNo;
		 						}
		 
		 						// 2. 反显设备名称 (deviceName -> shengchan)
		 						if (qrDetails.deviceName) {
		 							this.shengchan = qrDetails.deviceName;
		 						}
		 						
		 						// 3. 保存设备ID，用于提交打卡
		 						if (qrDetails.deviceId) {
		 							this.deviceId = qrDetails.deviceId;
		 						}
		 						
		 						// 4. 保存二维码图片URL
		 						if (qrDetails.url) {
		 							this.qrCodeUrl = qrDetails.url;
		 						}
		 						
		 						uni.showToast({
		 							title: '设备信息加载成功',
		 							icon: 'success'
		 						});
		 					} else {
		 						uni.showToast({
		 							title: '获取设备信息失败',
		 							icon: 'none'
		 						});
		 					}
		 
		 				} catch (e) {
		 					uni.hideLoading();
		 					console.error("处理二维码失败", e);
		 					if (e.msg) {
		 						uni.showToast({
		 							title: e.msg,
		 							icon: 'none'
		 						});
		 					} else {
		 						uni.showToast({
		 							title: '二维码格式错误',
		 							icon: 'none'
		 						});
		 					}
		 					// 容错：清空设备信息
		 					this.shebei = '';
		 					this.shengchan = '';
		 					this.deviceId = 0;
		 					this.qrCodeUrl = '';
		 				}
		 			},
		 
		 // 预览二维码图片
		 previewQrCode() {
			 if (this.qrCodeUrl) {
				 uni.previewImage({
					 urls: [this.qrCodeUrl],
					 current: this.qrCodeUrl
				 });
			 }
		 },
		 
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
		 },
		 
		 // 获取位置信息
		 async getLocation() {
			 return new Promise((resolve, reject) => {
				 uni.getLocation({
					 type: 'gcj02',
					 success: (res) => {
						 this.lng = String(res.longitude);
						 this.lat = String(res.latitude);
						 
						 // 逆地理编码获取地址
						 uni.request({
							 url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${res.latitude},${res.longitude}&key=OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77&get_poi=1`,
							 success: (addrRes) => {
								 if (addrRes.data && addrRes.data.result) {
									 this.address = addrRes.data.result.address || '';
								 }
								 resolve({ lng: this.lng, lat: this.lat, address: this.address });
							 },
							 fail: () => {
								 this.address = '';
								 resolve({ lng: this.lng, lat: this.lat, address: '' });
							 }
						 });
					 },
					 fail: (err) => {
						 console.error('获取位置失败:', err);
						 this.lng = '';
						 this.lat = '';
						 this.address = '';
						 resolve({ lng: '', lat: '', address: '' });
					 }
				 });
			 });
		 },
		 
		 // 上传图片
		 async uploadImages() {
			 if (!this.images || this.images.length === 0) {
				 return '';
			 }
			 
			 const uploadPromises = this.images.map(filePath => {
				 return http.upload(filePath, {
					 url: API_ENDPOINTS.UPLOAD_API,
					 name: 'file',
					 showLoading: false
				 }).catch(err => {
					 console.error('图片上传失败:', err);
					 return null;
				 });
			 });
			 
			 const results = await Promise.all(uploadPromises);
			 // 过滤掉上传失败的，并用逗号连接
			 const successUrls = results.filter(url => url !== null);
			 return successUrls.join(',');
		 },
		 
		 // 检测网络状态
		 async checkNetworkStatus() {
			 return new Promise((resolve) => {
				 uni.getNetworkType({
					 success: (res) => {
						 // networkType: wifi/2g/3g/4g/5g/unknown/none
						 resolve(res.networkType !== 'none' && res.networkType !== 'unknown')
					 },
					 fail: () => {
						 resolve(false) // 获取失败时认为离线
					 }
				 })
			 })
		 },
		 
		 // 提交打卡
		 async submitCheckIn() {
			 // 表单验证
			 if (!this.deviceId || this.deviceId === 0) {
				 uni.showToast({
					 title: '请先扫码获取设备信息',
					 icon: 'none'
				 });
				 return;
			 }
			 
			 if (!this.shebei || !this.shebei.trim()) {
				 uni.showToast({
					 title: '设备编号不能为空',
					 icon: 'none'
				 });
				 return;
			 }
			 
			 if (!this.message || (this.message !== '在用' && this.message !== '维修')) {
				 uni.showToast({
					 title: '请选择打卡类型',
					 icon: 'none'
				 });
				 return;
			 }
			 
			 if (!this.enterTime) {
				 uni.showToast({
					 title: '时间信息错误',
					 icon: 'none'
				 });
				 return;
			 }
			 
			 // 防止重复提交
			 if (this.submitting) {
				 return;
			 }
			 
			 this.submitting = true;
			 
			 try {
				 uni.showLoading({
					 title: '提交中...',
					 mask: true
				 });
				 
				 // 1. 获取位置信息
				 await this.getLocation();
				 
				 // 2. 上传图片（离线时也上传，如果失败则在离线数据中保存图片路径）
				 let imgs = '';
				 try {
					 imgs = await this.uploadImages();
				 } catch (imgError) {
					 console.warn('图片上传失败，将在离线数据中保存图片路径', imgError);
				 }
				 
				 // 3. 确定类型：1在用 2维修
				 const type = this.message === "在用" ? 1 : 2;
				 
				 // 4. 格式化时间，确保格式为 YYYY-MM-DD HH:mm:ss
				 let timeStr = this.enterTime;
				 if (!timeStr.includes(':')) {
					 timeStr = timeStr + ' 00:00:00';
				 } else if (timeStr.split(':').length === 2) {
					 timeStr = timeStr + ':00';
				 }
				 
				 // 5. 构建提交数据
				 const submitData = {
					 deviceId: this.deviceId,
					 deviceNo: this.shebei || "", // 设备编号
					 type: type, // 1在用 2维修
					 address: this.address || "",
					 lng: this.lng || "",
					 lat: this.lat || "",
					 imgs: imgs || "",
					 remark: "",
					 time: timeStr,
					 status: 0 // 0正常 1异常
				 };
				 
				 // 6. 检测网络状态
				 const isOnline = await this.checkNetworkStatus();
				 
				 if (!isOnline) {
					 // 离线状态，保存到本地缓存
					 uni.hideLoading();
					 
					 const cacheData = {
						 type: 'attendance', // 打卡类型
						 deviceId: this.deviceId,
						 deviceNo: this.shebei,
						 deviceName: this.shengchan,
						 tag: this.message, // 在用 或 维修
						 time: timeStr,
						 address: this.address || "",
						 lng: this.lng || "",
						 lat: this.lat || "",
						 imgs: imgs || "",
						 images: this.images || [], // 保存本地图片路径
						 remark: "",
						 status: 0,
						 data: JSON.stringify(submitData) // 保存完整提交数据
					 };
					 
					 const result = saveCacheRecord(cacheData);
					 
					 if (result.success) {
						 // 显示黄色提示
						 uni.showToast({
							 title: '当前无网络，数据已本地缓存',
							 icon: 'none',
							 duration: 3000,
							 mask: true
						 });
						 
						 // 延迟返回上一页
						 setTimeout(() => {
							 uni.navigateBack();
						 }, 1500);
					 } else {
						 // 存储失败（可能是空间不足）
						 uni.showModal({
							 title: '提示',
							 content: result.error || '缓存失败，请重试',
							 showCancel: false,
							 confirmText: '确定',
							 confirmColor: '#E02020'
						 });
					 }
					 return;
				 }
				 
				 // 在线状态，正常提交
				 const result = await http.post(API_ENDPOINTS.ATTENDANCE_ADD_API, submitData, {
					 header: {
						 'Content-Type': 'application/json'
					 }
				 });
				 
				 uni.hideLoading();
				 uni.showToast({
					 title: "打卡成功",
					 icon: "success"
				 });
				 
				 // 提交成功后，延迟返回上一页
				 setTimeout(() => {
					 uni.navigateBack();
				 }, 1500);
				 
			 } catch (error) {
				 console.error('提交打卡失败:', error);
				 uni.hideLoading();
				 
				 // 如果网络请求失败，尝试保存到离线缓存
				 try {
					 const cacheData = {
						 type: 'attendance',
						 deviceId: this.deviceId,
						 deviceNo: this.shebei,
						 deviceName: this.shengchan,
						 tag: this.message, // 在用 或 维修
						 time: this.enterTime,
						 address: this.address || "",
						 lng: this.lng || "",
						 lat: this.lat || "",
						 imgs: "",
						 images: this.images || [],
						 remark: "",
						 status: 0,
						 data: JSON.stringify({
							 deviceId: this.deviceId,
							 deviceNo: this.shebei || "",
							 type: this.message === "在用" ? 1 : 2, // 1在用 2维修
							 address: this.address || "",
							 lng: this.lng || "",
							 lat: this.lat || "",
							 imgs: "",
							 remark: "",
							 time: this.enterTime,
							 status: 0
						 })
					 };
					 
					 const cacheResult = saveCacheRecord(cacheData);
					 if (cacheResult.success) {
						 uni.showToast({
							 title: '提交失败，数据已缓存',
							 icon: 'none',
							 duration: 3000
						 });
						 setTimeout(() => {
							 uni.navigateBack();
						 }, 1500);
					 } else {
						 uni.showToast({
							 title: "提交失败，请重试",
							 icon: "none"
						 });
					 }
				 } catch (cacheError) {
					 uni.showToast({
						 title: "提交失败，请重试",
						 icon: "none"
					 });
				 }
			 } finally {
				 this.submitting = false;
			 }
		 }
	   },
	   
	 }
</script>
<style>
	.root{
		padding-left: 36rpx;
		padding-right: 34rpx;
		padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
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
		min-height: 774rpx;
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
		align-items: center;
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
	.Content-picker{
		flex: 1;
		height: 90rpx;
		display: flex;
		align-items: center;
		padding: 0 0 0 10rpx;
		background-color: #FFFFFF;
		border-radius: 16rpx;
		margin-left: 20rpx;
	}
	.Content-picker-sele{
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
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
	
	/* 二维码行布局 */
	.qr-code-row {
		justify-content: flex-start;
		align-items: center;
	}
	
	.qr-code-label {
		font-size: 28rpx;
		color: #333;
		flex-shrink: 0;
	}
	
	/* 二维码容器 */
	.qr-code-container {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-shrink: 0;
		margin-left: 20rpx;
	}
	
	.qr-code-image {
		width: 200rpx;
		height: 200rpx;
		border-radius: 12rpx;
		background-color: #F5F9FC;
		border: 2rpx solid #E0E0E0;
	}
	
	/* 二维码占位符 */
	.qr-code-placeholder {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 200rpx;
		height: 200rpx;
		background-color: #F5F9FC;
		border-radius: 12rpx;
		border: 2rpx dashed #CCCCCC;
		flex-shrink: 0;
		margin-left: 20rpx;
	}
	
	.placeholder-text {
		font-size: 26rpx;
		color: #999;
	}
	
</style>