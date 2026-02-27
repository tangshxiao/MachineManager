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
				<image src="/static/icon_bg_update.png" mode="widthFix" alt="" class="Head-right" />
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
				@click="scanCode"
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
			shebei: "DEVOOOO3",
			shengchan: "生产线B设备",
			message: "在用",
			checkInTypes: ["在用", "维修"],
			enterTime: "",
			person: "老周",
			images: [],
			deviceId: 0,
			address: "",
			lng: "",
			lat: "",
			submitting: false,
			qrCodeUrl: ""
		}
	},
	  
	onLoad(options) {
		this.getEnterTime();
		if (options && options.result) {
			const resultStr = decodeURIComponent(options.result);
			this.handleScanData(resultStr);
		}
	},

	onShow() {
		// 每次显示页面时触发扫码
		// this.scanCode(); // 如果不想每次切回来都强行扫码，可以注释掉这行
	},
	  
	methods: {
		// 获取当前时间并格式化
		getEnterTime() {
			const now = new Date()
			const y = now.getFullYear()
			const m = String(now.getMonth() + 1).padStart(2, '0')
			const d = String(now.getDate()).padStart(2, '0')
			const h = String(now.getHours()).padStart(2, '0')
			const min = String(now.getMinutes()).padStart(2, '0')
			const s = String(now.getSeconds()).padStart(2, '0')
			this.enterTime = `${y}-${m}-${d} ${h}:${min}:${s}`
		},

		// 打卡类型选择变化
		onCheckInTypeChange(e) {
			const index = e.detail.value;
			this.message = this.checkInTypes[index];
		},

		// 重新扫码
		scanCode() {
			uni.scanCode({
				success: (res) => {
					this.handleScanData(res.result);
				},
				fail: (err) => {
					if (err.errMsg && !err.errMsg.includes('cancel')) {
						uni.showToast({ title: '扫码失败', icon: 'none' });
					}
				}
			});
		},

		// 处理扫码数据
		async handleScanData(jsonStr) {
			try {
				const qrData = JSON.parse(jsonStr);
				if (!qrData.qrNo) {
					uni.showToast({ title: '二维码格式错误', icon: 'none' });
					return;
				}
				
				uni.showLoading({ title: '加载中...', mask: true });
				const qrDetails = await http.post(API_ENDPOINTS.DEVICE_QR_DETAILS_API, { qrNo: qrData.qrNo });
				uni.hideLoading();
				
				// 判定设备绑定状态
				if (qrDetails && qrDetails.status !== undefined) {
					if (qrDetails.status === 0) {
						// 未绑定，弹窗跳转
						uni.showModal({
							title: '提示',
							content: '该设备未绑定，是否前往绑定设备？',
							confirmText: '确认',
							cancelText: '取消',
							success: (res) => {
								if (res.confirm) {
									uni.redirectTo({
										url: '/pages/home/level/BindDevice?qrCode=' + encodeURIComponent(jsonStr)
									});
								}
							}
						});
					} else if (qrDetails.status === 1) {
						// 已绑定，更新数据
						if (qrDetails.deviceNo) this.shebei = qrDetails.deviceNo;
						if (qrDetails.deviceName) this.shengchan = qrDetails.deviceName;
						if (qrDetails.deviceId) this.deviceId = qrDetails.deviceId;
						if (qrDetails.url) this.qrCodeUrl = qrDetails.url;
						
						uni.showToast({
							title: '设备信息加载成功',
							icon: 'none' // 【修复1】：用 none 解决字数多被截断的问题
						});
					} else {
						uni.showToast({ title: '二维码状态异常', icon: 'none' });
					}
				} else {
					uni.showToast({ title: '获取设备信息失败', icon: 'none' });
				}

			} catch (e) {
				uni.hideLoading();
				console.error("处理二维码失败", e);
				
				// 【修复2】：精准区分解析错误与网络错误
				if (e instanceof SyntaxError) {
					uni.showToast({ title: '二维码格式错误', icon: 'none' });
				} else if (e && typeof e === 'object' && e.code !== undefined && e.code !== 0) {
					// 业务错误，request.js 已提示
				} else {
					// 真正的原因：断网
					uni.showToast({ title: '网络连接失败，请检查网络', icon: 'none' });
				}

				this.shebei = '';
				this.shengchan = '';
				this.deviceId = 0;
				this.qrCodeUrl = '';
			}
		},

		previewQrCode() {
			if (this.qrCodeUrl) {
				uni.previewImage({
					urls: [this.qrCodeUrl],
					current: this.qrCodeUrl
				});
			}
		},

		upload(){
			if (this.images.length >= 5) {
				uni.showToast({ title: "最多上传5张图片", icon: "none" });
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
						uni.showToast({ title: "仅支持JPG/PNG格式", icon: "none" });
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
			return new Promise((resolve) => {
				uni.getLocation({
					type: 'gcj02',
					success: (res) => {
						this.lng = String(res.longitude);
						this.lat = String(res.latitude);
						
						uni.request({
							url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${res.latitude},${res.longitude}&key=OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77&get_poi=1`,
							success: (addrRes) => {
								if (addrRes.data && addrRes.data.result) {
									this.address = addrRes.data.result.address || '';
								} else {
									this.address = `经度:${this.lng},纬度:${this.lat}`;
								}
								resolve({ lng: this.lng, lat: this.lat, address: this.address });
							},
							fail: () => {
								// 【修复3】：断网时依然保留经纬度作为打卡地址
								this.address = `经度:${this.lng},纬度:${this.lat}`;
								resolve({ lng: this.lng, lat: this.lat, address: this.address });
							}
						});
					},
					fail: (err) => {
						console.error('获取位置失败:', err);
						this.lng = '';
						this.lat = '';
						this.address = '未获取到位置';
						resolve({ lng: '', lat: '', address: this.address });
					}
				});
			});
		},
		 
		// 上传图片（兼容离线和单张失败）
		async uploadImages() {
			if (!this.images || this.images.length === 0) return '';
			
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
			const successUrls = results.filter(url => url !== null);
			return successUrls.join(',');
		},
		 
		// 【终极修复4】：乐观上传 + 精准缓存 + 安全传参 pid
		async submitCheckIn() {
			if (!this.deviceId || this.deviceId === 0) { uni.showToast({ title: '请先扫码获取设备信息', icon: 'none' }); return; }
			if (!this.shebei || !this.shebei.trim()) { uni.showToast({ title: '设备编号不能为空', icon: 'none' }); return; }
			if (!this.message || (this.message !== '在用' && this.message !== '维修')) { uni.showToast({ title: '请选择打卡类型', icon: 'none' }); return; }
			if (!this.enterTime) { uni.showToast({ title: '时间信息错误', icon: 'none' }); return; }
			if (this.submitting) return;
			
			this.submitting = true;
			
			try {
				uni.showLoading({ title: '提交中...', mask: true });
				
				await this.getLocation();
				
				const selectedProjectIds = uni.getStorageSync('selectedProjectIds');
				const pidStr = selectedProjectIds ? selectedProjectIds.split(',')[0] : '';
				const pid = pidStr ? Number(pidStr) : null; 
				
				let timeStr = this.enterTime;
				if (!timeStr.includes(':')) timeStr = timeStr + ' 00:00:00';
				else if (timeStr.split(':').length === 2) timeStr = timeStr + ':00';
				
				const type = this.message === "在用" ? 1 : 2;
				
				let imgs = await this.uploadImages();
				
				const submitData = {
					deviceId: this.deviceId,
					deviceNo: this.shebei || "",
					type: type,
					address: this.address || "",
					lng: this.lng || "",
					lat: this.lat || "",
					imgs: imgs || "",
					remark: "",
					time: timeStr,
					status: 0,
					pid: pid,         
					projectId: pid    
				};
				
				try {
					await http.post(API_ENDPOINTS.ATTENDANCE_ADD_API, submitData, {
						header: { 'Content-Type': 'application/json' }
					});
					
					uni.hideLoading();
					uni.showToast({ title: "打卡成功", icon: "success" });
					setTimeout(() => { uni.navigateBack(); }, 1500);
					
				} catch (error) {
					if (error && typeof error === 'object' && error.code !== undefined && error.code !== 0) {
						uni.hideLoading();
						this.submitting = false;
						return;
					}
					
					console.warn('网络不稳定，转入离线流程', error);
					
					const cacheData = {
						type: 'attendance',
						deviceId: this.deviceId,
						deviceNo: this.shebei,
						deviceName: this.shengchan,
						tag: this.message,
						time: timeStr,
						address: this.address || "",
						lng: this.lng || "",
						lat: this.lat || "",
						imgs: imgs, 
						images: this.images || [], 
						remark: "",
						status: 0,
						data: JSON.stringify(submitData) 
					};
					
					const result = saveCacheRecord(cacheData);
					uni.hideLoading();
					
					if (result.success) {
						uni.showToast({ title: '网络不稳定，已自动保存到本地离线', icon: 'none', duration: 3000, mask: true });
						setTimeout(() => { uni.navigateBack(); }, 1500);
					} else {
						uni.showModal({ title: '提示', content: result.error || '缓存失败，请重试', showCancel: false, confirmText: '确定', confirmColor: '#E02020' });
					}
				}
			} finally {
				this.submitting = false;
			}
		}
	}
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