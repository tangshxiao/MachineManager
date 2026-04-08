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
				打卡时间:<view class="Content-text-left">
					{{ (gpsObtainTime && lng && lat) ? gpsObtainTime : enterTime }}
				</view>
			</view>
			<view class="Content-text">
				证明材料（必填）:
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
				必填，至少1张现场设备照片，支持JPG/PNG格式，最多5张（已选 {{ images.length }} 张）
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
import { saveCacheRecordWithPersistedImages } from '@/utils/offlineCache.js'
import { saveSuccessRecord } from '@/utils/successRecordCache.js'
import { getSelectedProjectIdForApi } from '@/utils/attendancePid.js'
import { checkAttendanceInRange } from '@/utils/attendanceCheck.js'
import { ensureDeviceInSelectedProject } from '@/utils/projectScopeCheck.js'

const HOME_DEVICE_LIST_CACHE_KEY = 'HOME_DEVICE_LIST_CACHE'

export default {
	data() {
		return {
			shebei: "--",
			shengchan: "--",
			message: "在用",
			checkInTypes: ["在用", "维修"],
			enterTime: "",
			person: "老周",
			images: [],
			deviceId: 0,
			address: "",
			lng: "",
			lat: "",
			gpsObtainTime: "", // 定位成功那一刻的时间，用于打卡上报（优先于 enterTime）
			submitting: false,
			qrCodeUrl: "",
			qrNo: "",
			scanRawResult: ""
			,
			deviceProjectId: '' // 设备归属项目ID（用于打卡前校验）
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
		// 每次进入页面时，先尝试预获取一次定位，提高后续打卡成功率
		this.getLocation();
		// 每次显示页面时触发扫码（如需每次都扫码可放开）
		// this.scanCode();
	},
	  
	methods: {
		// 离线时：从首页缓存的设备列表里用 qrNo 匹配设备，回填设备编号/名称
		getDeviceInfoFromHomeCacheByQrNo(qrNo) {
			if (!qrNo) return null
			try {
				const raw = uni.getStorageSync(HOME_DEVICE_LIST_CACHE_KEY)
				if (!raw) return null
				const cache = typeof raw === 'string' ? JSON.parse(raw) : raw
				const records = cache && cache.records
				if (!Array.isArray(records) || records.length === 0) return null

				for (const record of records) {
					const qrList = record && record.qrCodeList
					if (!Array.isArray(qrList)) continue
					const matched = qrList.find(item => item && String(item.qrNo) === String(qrNo))
					if (!matched) continue
					return {
						deviceId: record.id != null ? String(record.id) : '',
						deviceNo: record.deviceNo || '',
						deviceName: record.name || ''
					}
				}
			} catch (e) {
				console.warn('离线从首页缓存匹配设备失败:', e)
			}
			return null
		},

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
				// 记录扫码原始内容和 qrNo，供离线缓存/上报使用
				this.scanRawResult = jsonStr;
				this.qrNo = qrData.qrNo;

				// 离线扫码打开：优先从首页缓存里反显设备信息
				const isOnline = await this.checkNetworkStatus()
				if (!isOnline) {
					const cached = this.getDeviceInfoFromHomeCacheByQrNo(this.qrNo)
					if (cached && (cached.deviceNo || cached.deviceName)) {
						this.deviceId = cached.deviceId ? Number(cached.deviceId) : 0
						this.shebei = cached.deviceNo || ''
						this.shengchan = cached.deviceName || ''
						// uni.showToast({ title: '离线模式：已从缓存反显设备', icon: 'none', duration: 2500 })
						return
					}
					// 缓存没有找到：继续走原来的逻辑（调用 qrDetails，catch 中做兜底缓存）
				}

				uni.showLoading({ title: '加载中...', mask: true });
				const qrDetails = await http.post(
					API_ENDPOINTS.DEVICE_QR_DETAILS_API,
					{ qrNo: qrData.qrNo },
					{ showLoading: false, suppressNoNetworkToast: true }
				);
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
						if (qrDetails.pid !== undefined && qrDetails.pid !== null) this.deviceProjectId = String(qrDetails.pid);
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

				const errMsg = (e && (e.errMsg || e.message || (typeof e === 'string' ? e : ''))) || '';
				// 网络/请求失败（含 request:fail、无网络、超时等）
				const isNetworkError = /request:fail|timeout|无网络|网络|连接|失败/i.test(errMsg);
				// 断网时网关可能返回 HTML，运行时当 JSON 解析会抛 SyntaxError（如 Unexpected token < in JSON at position 0）
				const isResponseParseError = e instanceof SyntaxError && /Unexpected token|position|JSON/i.test(errMsg);

				if (isNetworkError || isResponseParseError) {
					uni.showToast({ title: '网络连接失败，请检查网络', icon: 'none' });
				} else if (e instanceof SyntaxError) {
					uni.showToast({ title: '二维码格式错误', icon: 'none' });
				} else if (e && typeof e === 'object' && e.code !== undefined && e.code !== 0) {
					// 业务错误，request.js 已提示
				} else {
					uni.showToast({ title: '网络连接失败，请检查网络', icon: 'none' });
				}

				// 接口失败时保留扫码结果（qrNo），允许用户继续离线打卡
				if (!this.qrNo) {
					try {
						const backupQr = JSON.parse(jsonStr || '{}');
						this.qrNo = backupQr.qrNo || '';
						this.scanRawResult = jsonStr || '';
					} catch (parseErr) {
						console.warn('保底解析扫码结果失败:', parseErr);
					}
				}
				this.shebei = this.shebei || '';
				this.shengchan = this.shengchan || '';
				this.deviceId = this.deviceId || 0;
				this.qrCodeUrl = this.qrCodeUrl || '';
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
		 
		// 获取位置信息（支持离线GPS定位）
		async getLocation() {
			return new Promise((resolve, reject) => {
				// 尝试获取GPS定位（不依赖网络）
				// 注意：GPS定位理论上不依赖网络，但首次定位可能需要更长时间
				uni.getLocation({
					type: 'gcj02', // 使用国测局坐标系（GCJ-02）
					altitude: false, // 不需要高度信息，加快获取速度
					geocode: false, // 禁用逆地理编码，避免依赖网络
					highAccuracy: true,// 开启高精度（GPS 硬件）
					timeout: 20000, // 20秒超时（离线时GPS可能需要更长时间，特别是首次定位）
					success: (res) => {
						// GPS定位成功，先保存经纬度（不依赖网络）
						if (res.longitude && res.latitude) {
							this.lng = String(res.longitude);
							this.lat = String(res.latitude);
							// 记录定位成功这一刻的时间，用于打卡上报（uni-app getLocation 不返回时间，用当前时间表示“GPS 获取到的时间”）
							const now = new Date();
							const y = now.getFullYear(), m = String(now.getMonth() + 1).padStart(2, '0'), d = String(now.getDate()).padStart(2, '0');
							const h = String(now.getHours()).padStart(2, '0'), min = String(now.getMinutes()).padStart(2, '0'), s = String(now.getSeconds()).padStart(2, '0');
							this.gpsObtainTime = `${y}-${m}-${d} ${h}:${min}:${s}`;
							console.log('GPS定位成功（离线也可用）:', { lng: this.lng, lat: this.lat, gpsObtainTime: this.gpsObtainTime });
						}
						
						// 尝试逆地理编码获取地址（需要网络，失败也不影响GPS坐标）
						// 注意：即使离线，GPS坐标已经获取到了，可以正常缓存
						uni.request({
							url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${res.latitude},${res.longitude}&key=OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77&get_poi=1`,
							timeout: 5000, // 地址查询5秒超时
							success: (addrRes) => {
								if (addrRes.data && addrRes.data.result) {
									this.address = addrRes.data.result.address || '';
								}
								resolve({ lng: this.lng, lat: this.lat, address: this.address });
							},
							fail: () => {
								// 网络请求失败不影响，GPS坐标已经获取到了
								console.log('逆地理编码失败（可能离线），但GPS坐标已获取，可以正常缓存');
								this.address = '';
								resolve({ lng: this.lng, lat: this.lat, address: '' });
							}
						});
					},
					fail: (err) => {
						console.error('GPS定位失败:', err);
						const errMsg = (err && err.errMsg) ? String(err.errMsg) : '';
						// 如果GPS获取失败，检查是否有之前的位置信息（可能是上次定位的缓存）
						if (this.lng && this.lat) {
							console.log('GPS定位失败，使用之前的位置信息');
							resolve({ lng: this.lng, lat: this.lat, address: this.address || '' });
						} else {
							this.lng = '';
							this.lat = '';
							this.address = '';
							// 根据错误码给出明确提示：多为系统「定位服务」总开关未开启
							if (errMsg.includes('定位服务没有开启') || errMsg.includes('缺少定位权限') || errMsg.includes('geolocation:12')) {
								uni.showModal({
									title: '定位失败',
									content: '请先打开手机「定位服务」总开关（在系统设置或下拉菜单中），再允许本应用使用位置权限。',
									showCancel: false,
									confirmText: '我知道了'
								});
							}
							resolve({ lng: '', lat: '', address: '' });
						}
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
			 if ((!this.deviceId || this.deviceId === 0) && !this.qrNo) {
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
			 
			 if (!this.images || this.images.length === 0) {
				 uni.showToast({
					 title: '请上传现场设备照片',
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
				 
				 // 1. 获取位置信息（优先尝试获取，但不在这里直接拦截离线流程）
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
				 
				 // 4. 打卡时间：优先使用定位成功那一刻的时间（gpsObtainTime），否则用进入页面时间（enterTime）
				 let timeStr = (this.gpsObtainTime && this.lng && this.lat) ? this.gpsObtainTime : this.enterTime;
				 if (!timeStr.includes(':')) {
					 timeStr = timeStr + ' 00:00:00';
				 } else if (timeStr.split(':').length === 2) {
					 timeStr = timeStr + ':00';
				 }
				 
				 // 5. 构建提交数据
				 const submitData = {
					 deviceId: this.deviceId,
					 deviceNo: this.shebei || "", // 设备编号
					 qrNo: this.qrNo || "",
					 type: type, // 1在用 2维修
					 pid: getSelectedProjectIdForApi(),
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
				 
				 // 在线时：校验设备归属项目是否与当前选择项目一致
				 if (isOnline) {
					 const inSelectedProject = await ensureDeviceInSelectedProject({
						 submitData,
						 rawData: { qrNo: this.qrNo }
					 })
					 if (!inSelectedProject) {
						 uni.hideLoading()
						 return
					 }
				 }
				 
				 // 在线提交时，经纬度必填，避免接口返回“位置信息不能为空”
				 if (isOnline && (!this.lng || !this.lat)) {
					 uni.hideLoading();
					 uni.showModal({
						 title: '提示',
						 content: '未获取到位置信息。请确认：1. 已打开手机「定位服务」总开关（设置或下拉菜单）；2. 已允许本应用使用位置权限。',
						 cancelText: '我知道了',
						 confirmText: '去设置',
						 success: (res) => {
							 if (res.confirm && uni.openAppAuthorizeSetting) {
								 uni.openAppAuthorizeSetting(); // 跳转到本应用权限设置页
							 }
						 }
					 });
					 return;
				 }
				 
				 // 在线但未拿到 deviceId 时，先用 qrNo 再做一次设备校验
				 if (isOnline && (!submitData.deviceId || submitData.deviceId === 0) && submitData.qrNo) {
					 try {
						 const detailRes = await http.post(API_ENDPOINTS.DEVICE_QR_DETAILS_API, { qrNo: submitData.qrNo });
						 if (detailRes && detailRes.status === 1 && detailRes.deviceId) {
							 submitData.deviceId = detailRes.deviceId;
							 submitData.deviceNo = submitData.deviceNo || detailRes.deviceNo || '';
						 } else {
							 throw new Error('设备未绑定或信息不可用');
						 }
					 } catch (detailErr) {
						 // 校验失败时走离线缓存，避免阻断打卡
						 console.warn('在线校验设备失败，转离线缓存:', detailErr);
						 const forceOffline = {
							 type: 'attendance',
							 deviceId: submitData.deviceId || 0,
							 deviceNo: this.shebei || '',
							 deviceName: this.shengchan || '',
							 qrNo: this.qrNo || '',
							 scanRawResult: this.scanRawResult || '',
							 tag: this.message,
							 time: timeStr,
							 pid: submitData.pid,
							 address: this.address || '',
							 lng: this.lng || '',
							 lat: this.lat || '',
							 imgs: imgs || '',
							 images: this.images || [],
							 remark: '',
							 status: 0,
							 data: JSON.stringify(submitData)
						 };
						 uni.hideLoading();
						 const forceRes = await saveCacheRecordWithPersistedImages(forceOffline);
						 if (forceRes.success) {
							 uni.showToast({ title: '设备校验失败，已离线缓存', icon: 'none', duration: 2500 });
							 setTimeout(() => uni.navigateBack(), 1200);
						 } else {
							 uni.showToast({ title: forceRes.error || '缓存失败', icon: 'none' });
						 }
						 return;
					 }
				 }

				 if (!isOnline) {
					 // 离线状态，确保已获取位置信息（GPS不依赖网络）
					 // 如果之前获取失败，再次尝试获取GPS坐标
					 if (!this.lng || !this.lat) {
						 console.log('离线状态下重新尝试获取GPS坐标...');
						 await this.getLocation();
					 }
					 
					 // 调试：打印要保存的位置信息
					 console.log('离线缓存 - 位置信息:', {
						 address: this.address,
						 lng: this.lng,
						 lat: this.lat,
						 hasAddress: !!this.address,
						 hasLng: !!this.lng,
						 hasLat: !!this.lat
					 });
					 
					 // 离线状态，保存到本地缓存
					 uni.hideLoading();
					 
					 const cacheData = {
						 type: 'attendance', // 打卡类型
						 deviceId: this.deviceId,
						 deviceNo: this.shebei,
						 deviceName: this.shengchan,
						 qrNo: this.qrNo || "",
						 scanRawResult: this.scanRawResult || "",
						 tag: this.message, // 在用 或 维修
						 time: timeStr,
						 pid: submitData.pid,
						 address: this.address || "", // 地址（离线时可能为空）
						 lng: this.lng || "", // 确保包含经纬度（GPS坐标，离线时应该能获取）
						 lat: this.lat || "", // 确保包含经纬度（GPS坐标，离线时应该能获取）
						 imgs: imgs || "",
						 images: this.images || [], // 保存本地图片路径
						 remark: "",
						 status: 0,
						 data: JSON.stringify(submitData) // 保存完整提交数据（包含经纬度）
					 };
					 
					 // 调试：打印实际保存的缓存数据
					 console.log('离线缓存 - 保存的数据:', {
						 address: cacheData.address,
						 lng: cacheData.lng,
						 lat: cacheData.lat,
						 submitDataAddress: submitData.address,
						 submitDataLng: submitData.lng,
						 submitDataLat: submitData.lat
					 });
					 
					 const result = await saveCacheRecordWithPersistedImages(cacheData);
					 
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
				 const inRange = await checkAttendanceInRange(submitData)
				 if (!inRange) {
					 uni.hideLoading()
					 return
				 }
				 // 如果 code !== 0，request.js 会显示 msg 并 reject，这里会被 catch 捕获
				 await http.post(API_ENDPOINTS.ATTENDANCE_ADD_API, submitData, {
					 header: {
						 'Content-Type': 'application/json'
					 }
				 });

				 // 在线打卡成功后缓存到本地，供离线查看“所有打卡记录”
				 saveSuccessRecord({
					 deviceId: submitData.deviceId || this.deviceId || 0,
					 deviceNo: submitData.deviceNo || this.shebei || '',
					 deviceName: this.shengchan || '',
					 name: this.shengchan || '',
					 type: submitData.type,
					 time: submitData.time,
					 address: submitData.address || this.address || '',
					 lng: submitData.lng || this.lng || '',
					 lat: submitData.lat || this.lat || '',
					 imgs: submitData.imgs || '',
					 localImages: this.images || [],
					 qrNo: submitData.qrNo || this.qrNo || '',
					 source: 'online'
				 })
				 
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
				 
				 // 判断是否是接口返回的错误（有 code 和 msg）
				 // 如果 code !== 0，说明是业务错误（如权限不足），不应该缓存
				 if (error && typeof error === 'object' && error.code !== undefined && error.code !== 0) {
					 // 接口返回的错误，request.js 已经显示了 msg，这里直接返回
					 // 不需要额外处理，也不需要缓存
					 // 注意：finally 块会执行，所以 submitting 会被正确重置
					 return;
				 }
				 
				 // 如果是网络错误或其他错误，尝试保存到离线缓存
				 // 确保已获取位置信息
				 if (!this.lng || !this.lat) {
					 console.log('网络错误，重新尝试获取GPS坐标...');
					 await this.getLocation();
				 }
				 
				 try {
					 // 打卡时间：优先使用定位成功那一刻的时间
					 let errorTimeStr = (this.gpsObtainTime && this.lng && this.lat) ? this.gpsObtainTime : this.enterTime;
					 if (!errorTimeStr.includes(':')) {
						 errorTimeStr = errorTimeStr + ' 00:00:00';
					 } else if (errorTimeStr.split(':').length === 2) {
						 errorTimeStr = errorTimeStr + ':00';
					 }
					 
					 const errorSubmitData = {
						 deviceId: this.deviceId,
						 deviceNo: this.shebei || "",
						 type: this.message === "在用" ? 1 : 2, // 1在用 2维修
						 pid: getSelectedProjectIdForApi(),
						 address: this.address || "",
						 lng: this.lng || "", // 确保包含经纬度
						 lat: this.lat || "", // 确保包含经纬度
						 imgs: "",
						 remark: "",
						 time: errorTimeStr,
						 status: 0
					 };
					 
					 const cacheData = {
						 type: 'attendance',
						 deviceId: this.deviceId,
						 deviceNo: this.shebei,
						 deviceName: this.shengchan,
						 qrNo: this.qrNo || "",
						 scanRawResult: this.scanRawResult || "",
						 tag: this.message, // 在用 或 维修
						 time: errorTimeStr,
						 pid: errorSubmitData.pid,
						 address: this.address || "",
						 lng: this.lng || "", // 确保包含经纬度
						 lat: this.lat || "", // 确保包含经纬度
						 imgs: "",
						 images: this.images || [],
						 remark: "",
						 status: 0,
						 data: JSON.stringify(errorSubmitData) // 保存完整提交数据（包含经纬度）
					 };
					 
					 const cacheResult = await saveCacheRecordWithPersistedImages(cacheData);
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