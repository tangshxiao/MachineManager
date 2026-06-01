<template>
	<view class="root">
		<!-- 黄色提示框 -->
		<!-- <view class="tip-banner">
			<view class="tip-text">由分包管理员做此次操作</view>
			<view class="tip-text">一个设备可以绑定多个二维码。</view>
			<view class="tip-text">只做绑定机器操作,当前一台被设定了进场,再扫二维码,状态同步</view>
		</view> -->

		<!-- 表单区域 -->
		<view class="form-container">
			<!-- 二维码 -->
			<view class="form-item">
				<view class="form-label">二维码:</view>
				<view class="form-value">{{ qrNo || '--' }}</view>
			</view>

			<!-- 序号 -->
			<view class="form-item">
				<view class="form-label">序号:</view>
				<input 
					class="form-input" 
					v-model="formData.deviceNo" 
					placeholder="输入序号" 
					placeholder-style="color:#999"
					@blur="onDeviceNoBlur"
				/>
			</view>

			<!-- 设备名称 -->
			<view class="form-item">
				<view class="form-label">设备名称:</view>
				<input 
					class="form-input" 
					v-model="formData.deviceName" 
					placeholder="根据序号带出" 
					placeholder-style="color:#999"
					:disabled="true"
				/>
			</view>

			<!-- 归属公司 -->
			<view class="form-item">
				<view class="form-label">归属公司:</view>
				<input 
					class="form-input" 
					v-model="formData.companyName" 
					placeholder="根据序号带出" 
					placeholder-style="color:#999"
					:disabled="true"
				/>
			</view>

			<!-- 归属项目 -->
			<view class="form-item">
				<view class="form-label">归属项目:</view>
				<picker 
					mode="selector" 
					:range="projectList" 
					range-key="name" 
					:value="projectIndex" 
					@change="onProjectChange"
				>
					<view class="form-picker">
						<text :class="selectedProject ? 'picker-text' : 'picker-placeholder'">
							{{ selectedProject ? selectedProject.name : '选择项目(单选)' }}
						</text>
						<image src="/static/icon_jt_xx.png" class="picker-arrow"></image>
					</view>
				</picker>
			</view>

			<!-- 当前位置 -->
			<view class="form-item">
				<view class="form-label">当前位置:</view>
				<input 
					class="form-input" 
					v-model="currentLocation" 
					placeholder="打卡的坐标" 
					placeholder-style="color:#999"
					:disabled="true"
				/>
			</view>

			<!-- 当前状态 -->
			<view class="form-item">
				<view class="form-label">当前状态:</view>
				<picker 
					mode="selector" 
					:range="statusOptions" 
					:value="statusIndex" 
					@change="onStatusChange"
				>
					<view class="form-picker">
						<text class="picker-text">{{ formData.status || '进场/退场' }}</text>
						<image src="/static/icon_jt_xx.png" class="picker-arrow"></image>
					</view>
				</picker>
			</view>
		</view>

		<!-- 证明材料 -->
		<view class="photo-section">
			<view class="photo-section-title">证明材料（必填）:</view>
			<view v-if="!images.length" class="photo" @click="uploadPhoto">
				<view class="photo-tb">
					<image src="/static/icon_phone_img.png"></image>
				</view>
				<view>拍照</view>
			</view>
			<view v-else class="photo-row">
				<view class="photo-slot" v-for="(item, index) in images" :key="item">
					<image class="thumb-img" :src="item" mode="aspectFill" @click.stop="previewPhoto(index)"></image>
					<view class="delete-btn" @click.stop="removePhoto(index)">删除</view>
				</view>
				<view
					class="photo-slot add-slot"
					v-if="images.length < MAX_PHOTOS"
					@click="uploadPhoto"
				>
					<text class="add-icon">+</text>
				</view>
			</view>
			<view class="photo-hint">
				必填，至少{{ MIN_PHOTOS }}张现场照片，仅支持拍照，最多{{ MAX_PHOTOS }}张（已选 {{ images.length }} 张）。照片必须包含机具整体和二维码
			</view>
		</view>

		<!-- 提交按钮 -->
		<view class="submit-btn-container">
			<button class="submit-btn" @click="handleSubmit" :disabled="submitting">
				{{ submitting ? '确认中...' : '确认' }}
			</button>
		</view>
	</view>
</template>

<script>
import http from '@/utils/request.js'
import API_ENDPOINTS from '@/config/api.js'
import api from '@/services/api.js'

const MIN_PHOTOS = 2
const MAX_PHOTOS = 5

export default {
	data() {
		return {
			MIN_PHOTOS,
			MAX_PHOTOS,
			images: [],
			qrCode: '', // 二维码内容
			qrNo: '', // 二维码编号
			formData: {
				deviceNo: '', // 序号
				deviceName: '', // 设备名称
				companyName: '', // 归属公司
				projectId: '', // 归属项目ID
				status: '进场' // 当前状态
			},
			qrDetails: null, // 二维码详情数据
			currentLocation: '', // 当前位置（坐标）
			address: '', // 地址
			lng: '', // 经度
			lat: '', // 纬度
			projectList: [], // 项目列表
			projectIndex: -1, // 选中的项目索引
			selectedProject: null, // 选中的项目对象
			statusOptions: ['进场', '退场'],
			statusIndex: 0,
			submitting: false,
			deviceId: '' // 设备ID
		}
	},
	async onLoad(options) {
		// 获取二维码参数
		if (options.qrCode) {
			this.qrCode = decodeURIComponent(options.qrCode)
			// 解析二维码JSON数据，提取qrNo
			try {
				const qrData = JSON.parse(this.qrCode)
				if (qrData.qrNo) {
					this.qrNo = qrData.qrNo
					// 加载项目列表后再获取二维码详情
					await this.loadProjectList()
					// 获取二维码详情并反显数据
					await this.loadQrDetails()
				} else {
					uni.showToast({
						title: '二维码格式错误',
						icon: 'none'
					})
				}
			} catch (e) {
				console.error('解析二维码JSON失败:', e)
				uni.showToast({
					title: '二维码格式错误',
					icon: 'none'
				})
			}
		} else {
			// 如果没有二维码参数，只加载项目列表
			await this.loadProjectList()
		}
		
		// 获取当前位置
		this.getLocation()
	},
	methods: {
		// 获取当前本地选中的项目ID集合
		getSelectedProjectIdSet() {
			const selectedProjectIds = uni.getStorageSync('selectedProjectIds') || ''
			const ids = String(selectedProjectIds)
				.split(',')
				.map(id => id.trim())
				.filter(Boolean)
			return new Set(ids)
		},

		// 获取当前默认选中的项目ID（多选时取第一个）
		getDefaultSelectedProjectId() {
			const selectedProjectIds = uni.getStorageSync('selectedProjectIds') || ''
			if (!selectedProjectIds) return ''
			return String(selectedProjectIds).split(',')[0] || ''
		},

		// 按本地默认项目进行回选，成功返回 true
		applyDefaultProjectSelection() {
			const defaultProjectId = this.getDefaultSelectedProjectId()
			if (!defaultProjectId || !this.projectList.length) return false

			const defaultIndex = this.projectList.findIndex(p => String(p.id) === String(defaultProjectId))
			if (defaultIndex === -1) return false

			this.projectIndex = defaultIndex
			this.selectedProject = this.projectList[defaultIndex]
			this.formData.projectId = String(this.selectedProject.id)
			return true
		},

		// 加载项目列表
		async loadProjectList() {
			try {
				const res = await api.fetchProjectList(1, 100) // 获取前100个项目
				const allProjects = (res && res.records) || []
				const selectedIdSet = this.getSelectedProjectIdSet()
				// 仅展示本地已选中的项目，避免出现非当前客户项目
				this.projectList = allProjects.filter(p => selectedIdSet.has(String(p.id)))
				if (!this.projectList.length) {
					this.projectIndex = -1
					this.selectedProject = null
					this.formData.projectId = ''
				}
				// 绑定设备时默认回选当前客户选中的项目（多选取第一个）
				this.applyDefaultProjectSelection()
			} catch (e) {
				console.error('加载项目列表失败:', e)
				uni.showToast({
					title: '加载项目列表失败',
					icon: 'none'
				})
			}
		},

		// 获取二维码详情并反显数据
		async loadQrDetails() {
			if (!this.qrNo) {
				console.warn('qrNo为空，无法获取二维码详情')
				return
			}

			try {
				uni.showLoading({
					title: '加载中...',
					mask: true
				})

				// 调用二维码详情接口
				const res = await http.post(API_ENDPOINTS.DEVICE_QR_DETAILS_API, {
					qrNo: this.qrNo
				})

				console.log('二维码详情数据:', res)

				if (res) {
					this.qrDetails = res

					// 反显数据到表单
					// 设备ID
					if (res.deviceId) {
						this.deviceId = String(res.deviceId)
					}

					// 序号
					if (res.deviceNo) {
						this.formData.deviceNo = res.deviceNo
					}

					// 设备名称
					if (res.deviceName) {
						this.formData.deviceName = res.deviceName
					}

					// 归属公司
					if (res.companyName) {
						this.formData.companyName = res.companyName
					}

					// 归属项目
					if (res.pid) {
						// 优先使用当前客户默认选中的项目；若本地无默认项目，再回显接口项目
						const appliedDefault = this.applyDefaultProjectSelection()
						if (!appliedDefault) {
							this.formData.projectId = String(res.pid)
							// 查找对应的项目并设置选中状态
							const projectIndex = this.projectList.findIndex(p => String(p.id) === String(res.pid))
							if (projectIndex !== -1) {
								this.projectIndex = projectIndex
								this.selectedProject = this.projectList[projectIndex]
							}
						}
					}

					// 扫码后默认当前状态：未反显到序号/名称/归属公司等信息 → 进场；已查到设备信息 → 退场
					const hasDeviceInfo =
						(res.deviceId != null && res.deviceId !== '' && Number(res.deviceId) !== 0) ||
						!!(res.deviceNo && String(res.deviceNo).trim()) ||
						!!(res.deviceName && String(res.deviceName).trim()) ||
						!!(res.companyName && String(res.companyName).trim())
					if (hasDeviceInfo) {
						this.formData.status = '退场'
						this.statusIndex = 1
					} else {
						this.formData.status = '进场'
						this.statusIndex = 0
					}
				}

				uni.hideLoading()
			} catch (e) {
				console.error('获取二维码详情失败:', e)
				uni.hideLoading()
				uni.showToast({
					title: e.msg || '获取二维码详情失败',
					icon: 'none'
				})
			}
		},

		// 序号失焦时，根据序号直接查询设备详情
		async onDeviceNoBlur() {
			if (!this.formData.deviceNo || !this.formData.deviceNo.trim()) {
				return
			}

			try {
				uni.showLoading({
					title: '查询中...',
					mask: true
				})

				// 直接通过序号调用设备详情接口
				const detailRes = await http.post(API_ENDPOINTS.DEVICE_DETAILS_API, {
					deviceNo: this.formData.deviceNo.trim()
				}, {
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				})

				console.log('设备详情数据:', detailRes)

				if (detailRes) {
					// 反显设备详情数据到表单
					// 设备ID
					if (detailRes.id) {
						this.deviceId = String(detailRes.id)
					}

					// 设备名称
					if (detailRes.name) {
						this.formData.deviceName = detailRes.name
					}

					// 归属公司
					if (detailRes.companyName) {
						this.formData.companyName = detailRes.companyName
					}

					// 归属项目：根据projectName在项目列表中查找并自动选中
					if (detailRes.projectName) {
						// 在项目列表中查找匹配的项目
						const projectIndex = this.projectList.findIndex(p => 
							p.name === detailRes.projectName
						)
						
						if (projectIndex !== -1) {
							// 找到匹配的项目，自动选中
							this.projectIndex = projectIndex
							this.selectedProject = this.projectList[projectIndex]
							this.formData.projectId = String(this.selectedProject.id)
						} else {
							// 如果项目列表中找不到，清空项目选择
							this.projectIndex = -1
							this.selectedProject = null
							this.formData.projectId = ''
							console.warn('项目列表中未找到匹配的项目:', detailRes.projectName)
						}
					}
				} else {
					// 如果没有返回数据，清空自动填充的字段
					this.formData.deviceName = ''
					this.formData.companyName = ''
					this.deviceId = ''
					uni.showToast({
						title: '未找到该设备',
						icon: 'none'
					})
				}

				uni.hideLoading()
			} catch (e) {
				console.error('查询设备信息失败:', e)
				uni.hideLoading()
				// 如果查询失败，清空自动填充的字段
				this.formData.deviceName = ''
				this.formData.companyName = ''
				this.deviceId = ''
				uni.showToast({
					title: e.msg || '查询设备信息失败',
					icon: 'none'
				})
			}
		},

		// 项目选择
		onProjectChange(e) {
			const index = e.detail.value
			this.projectIndex = index
			this.selectedProject = this.projectList[index]
			this.formData.projectId = this.selectedProject ? this.selectedProject.id : ''
		},

		// 状态选择
		onStatusChange(e) {
			const index = e.detail.value
			this.statusIndex = index
			this.formData.status = this.statusOptions[index]
		},

		// 获取位置信息
		async getLocation() {
			try {
				uni.getLocation({
					type: 'gcj02',
					highAccuracy: true,// 开启高精度（GPS 硬件）
					success: (res) => {
						this.lng = String(res.longitude)
						this.lat = String(res.latitude)
						this.currentLocation = `${this.lat},${this.lng}`
						
						// 逆地理编码获取地址
						uni.request({
							url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${res.latitude},${res.longitude}&key=OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77&get_poi=1`,
							success: (addrRes) => {
								if (addrRes.data && addrRes.data.result) {
									const address = addrRes.data.result.address || ''
									if (address) {
										this.address = address
										this.currentLocation = `${address} (${this.lat},${this.lng})`
									}
								}
							},
							fail: () => {
								// 地址获取失败，只显示坐标
								this.address = ''
							}
						})
					},
					fail: (err) => {
						console.error('获取位置失败:', err)
						this.currentLocation = '获取位置失败'
					}
				})
			} catch (e) {
				console.error('获取位置异常:', e)
				this.currentLocation = '获取位置失败'
			}
		},

		uploadPhoto() {
			if (this.images.length >= MAX_PHOTOS) {
				uni.showToast({ title: `最多上传${MAX_PHOTOS}张图片`, icon: 'none' })
				return
			}
			const remain = MAX_PHOTOS - this.images.length
			uni.chooseImage({
				count: remain,
				sizeType: ['original', 'compressed'],
				sourceType: ['camera'],
				success: (res) => {
					const paths = res.tempFilePaths || []
					const validExt = ['.jpg', '.jpeg', '.png']
					const newImages = []
					paths.forEach((p) => {
						const lower = String(p).toLowerCase()
						if (validExt.some((ext) => lower.endsWith(ext))) {
							newImages.push(p)
						}
					})
					if (newImages.length < paths.length) {
						uni.showToast({ title: '仅支持JPG/PNG格式', icon: 'none' })
					}
					this.images = this.images.concat(newImages).slice(0, MAX_PHOTOS)
				}
			})
		},

		removePhoto(index) {
			this.images.splice(index, 1)
		},

		previewPhoto(index) {
			uni.previewImage({
				urls: this.images,
				current: this.images[index]
			})
		},

		async uploadImages() {
			if (!this.images || this.images.length === 0) return ''
			const uploadPromises = this.images.map((filePath) => {
				return http.upload(filePath, {
					url: API_ENDPOINTS.UPLOAD_API,
					name: 'file',
					showLoading: false
				}).catch((err) => {
					console.error('图片上传失败:', err)
					return null
				})
			})
			const results = await Promise.all(uploadPromises)
			return results.filter((url) => url !== null).join(',')
		},

		// 表单验证
		validateForm() {
			if (!this.images || this.images.length < MIN_PHOTOS) {
				uni.showToast({
					title: `请至少上传${MIN_PHOTOS}张现场照片`,
					icon: 'none'
				})
				return false
			}

			if (!this.formData.deviceNo || !this.formData.deviceNo.trim()) {
				uni.showToast({
					title: '请输入序号',
					icon: 'none'
				})
				return false
			}

			if (!this.deviceId) {
				uni.showToast({
					title: '请先选择有效设备',
					icon: 'none'
				})
				return false
			}

			if (!this.formData.projectId) {
				uni.showToast({
					title: '请选择归属项目',
					icon: 'none'
				})
				return false
			}

			if (!this.qrNo) {
				uni.showToast({
					title: '二维码信息缺失',
					icon: 'none'
				})
				return false
			}

			return true
		},

		// 提交
		async handleSubmit() {
			if (this.submitting) return

			if (!this.validateForm()) {
				return
			}

			this.submitting = true
			uni.showLoading({
				title: '提交中...',
				mask: true
			})

			try {
				let imgs = ''
				try {
					imgs = await this.uploadImages()
				} catch (imgError) {
					console.warn('图片上传失败:', imgError)
				}
				if (!imgs) {
					uni.hideLoading()
					uni.showToast({
						title: '照片上传失败，请检查网络后重试',
						icon: 'none'
					})
					this.submitting = false
					return
				}

				// 构建提交数据
				// 状态映射：0进场 1在用 2维修 3退场
				// 表单中只有"进场"/"退场"，所以映射为：进场->0, 退场->3
				const statusMap = {
					'进场': 0,
					'退场': 3
				}

				const submitData = {
					qrNo: this.qrNo, // 二维码编号
					deviceId: Number(this.deviceId), // 设备ID（根据选择设备回填）
					deviceNo: this.formData.deviceNo.trim(), // 序号
					pid: Number(this.formData.projectId), // 归属项目ID（转换为整数）
					address: this.address || '', // 地址
					lng: this.lng || '', // 经度
					lat: this.lat || '', // 纬度
					imgs,
					status: statusMap[this.formData.status] !== undefined ? statusMap[this.formData.status] : 0 // 状态：0进场 1在用 2维修 3退场
				}

				console.log('提交绑定设备数据:', submitData)

				// 调用绑定设备的API接口
				const res = await http.post(API_ENDPOINTS.DEVICE_BIND_QRCODE_API, submitData, {
					header: {
						'Content-Type': 'application/json'
					}
				})

				uni.hideLoading()
				uni.showToast({
					title: '提交成功',
					icon: 'success'
				})

				// 延迟返回上一页
				setTimeout(() => {
					uni.navigateBack()
				}, 1500)

			} catch (error) {
				console.error('绑定设备失败:', error)
				uni.hideLoading()
				// request.js 已经显示了接口返回的 msg（如果 code !== 0）
				// 如果是接口返回的错误，不需要额外处理
				if (error && typeof error === 'object' && error.code !== undefined && error.code !== 0) {
					// 接口返回的错误，request.js 已经显示了 msg
					return
				}
				// 其他错误（如网络错误）才显示通用错误提示
				uni.showToast({
					title: '绑定失败，请重试',
					icon: 'none'
				})
			} finally {
				this.submitting = false
			}
		}
	}
}
</script>

<style>
page {
	background-color: #F5F8FC;
	min-height: 100vh;
}

.root {
	padding: 30rpx;
	padding-bottom: 200rpx;
}

/* 黄色提示框 */
.tip-banner {
	background-color: #FFF9E6;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 30rpx;
}

.tip-text {
	font-size: 26rpx;
	color: #333;
	line-height: 1.6;
	margin-bottom: 8rpx;
}

.tip-text:last-child {
	margin-bottom: 0;
}

/* 表单容器 */
.form-container {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx 24rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

/* 表单项 */
.form-item {
	display: flex;
	align-items: center;
	padding: 24rpx 0;
	border-bottom: 1rpx solid #F0F0F0;
}

.form-item:last-child {
	border-bottom: none;
}

.form-label {
	font-size: 28rpx;
	color: #333;
	width: 180rpx;
	flex-shrink: 0;
}

.form-value {
	font-size: 28rpx;
	color: #333;
	flex: 1;
}

.form-input {
	flex: 1;
	font-size: 28rpx;
	color: #333;
	border: none;
	outline: none;
	background: transparent;
}

.form-picker {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.picker-text {
	font-size: 28rpx;
	color: #333;
}

.picker-placeholder {
	font-size: 28rpx;
	color: #999;
}

.picker-arrow {
	width: 32rpx;
	height: 32rpx;
	flex-shrink: 0;
}

/* 提交按钮 */
.submit-btn-container {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 30rpx;
	background-color: #ffffff;
	box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.08);
	z-index: 999;
}

.submit-btn {
	width: 100%;
	height: 90rpx;
	background-color: #004CA2;
	color: #ffffff;
	border: none;
	border-radius: 99rpx;
	font-size: 36rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.submit-btn[disabled] {
	background-color: #999;
	opacity: 0.6;
}

.photo-section {
	margin-top: 30rpx;
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx 24rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.photo-section-title {
	font-size: 28rpx;
	color: #333;
	margin-bottom: 20rpx;
}

.photo {
	height: 200rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	color: #808080;
	background-color: #F5F9FC;
	border-radius: 16rpx;
}

.photo-tb {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 10rpx;
}

.photo-tb image {
	width: 58rpx;
	height: 52rpx;
}

.photo-hint {
	font-size: 26rpx;
	color: #808080;
	line-height: 1.5;
	margin-top: 16rpx;
}

.photo-row {
	min-height: 200rpx;
	display: flex;
	flex-wrap: wrap;
	align-items: flex-start;
	background-color: #F5F9FC;
	border-radius: 16rpx;
	padding: 16rpx 20rpx;
}

.photo-slot {
	position: relative;
	width: 30%;
	height: 170rpx;
	border-radius: 12rpx;
	overflow: hidden;
	background-color: #FFFFFF;
	margin-right: 3%;
	margin-bottom: 16rpx;
}

.photo-slot:nth-child(3n) {
	margin-right: 0;
}

.thumb-img {
	width: 100%;
	height: 100%;
}

.delete-btn {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 40rpx;
	line-height: 40rpx;
	text-align: center;
	font-size: 24rpx;
	color: #FFFFFF;
	background: rgba(0, 0, 0, 0.45);
}

.add-slot {
	justify-content: center;
	align-items: center;
	display: flex;
	border: 2rpx dashed #CCCCCC;
	background-color: transparent;
}

.add-icon {
	font-size: 56rpx;
	color: #CCCCCC;
}
</style>


