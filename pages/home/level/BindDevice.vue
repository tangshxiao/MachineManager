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

			<!-- 设备编号 -->
			<view class="form-item">
				<view class="form-label">设备编号:</view>
				<input 
					class="form-input" 
					v-model="formData.deviceNo" 
					placeholder="输入编号" 
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
					placeholder="根据编号带出" 
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
					placeholder="根据编号带出" 
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

		<!-- 提交按钮 -->
		<view class="submit-btn-container">
			<button class="submit-btn" @click="handleSubmit" :disabled="submitting">
				{{ submitting ? '绑定中...' : '绑定' }}
			</button>
		</view>
	</view>
</template>

<script>
import http from '@/utils/request.js'
import API_ENDPOINTS from '@/config/api.js'
import api from '@/services/api.js'

export default {
	data() {
		return {
			qrCode: '', // 二维码内容
			qrNo: '', // 二维码编号
			formData: {
				deviceNo: '', // 设备编号
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
		// 加载项目列表
		async loadProjectList() {
			try {
				const res = await api.fetchProjectList(1, 100) // 获取前100个项目
				this.projectList = (res && res.records) || []
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

					// 设备编号
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
						this.formData.projectId = String(res.pid)
						// 查找对应的项目并设置选中状态
						const projectIndex = this.projectList.findIndex(p => String(p.id) === String(res.pid))
						if (projectIndex !== -1) {
							this.projectIndex = projectIndex
							this.selectedProject = this.projectList[projectIndex]
						}
					}

					// 设备状态：0进场 1在用 2维修 3退场
					// 映射到表单的"进场"/"退场"
					if (res.deviceStatus !== undefined && res.deviceStatus !== null) {
						if (res.deviceStatus === 0) {
							// 进场
							this.formData.status = '进场'
							this.statusIndex = 0
						} else if (res.deviceStatus === 3) {
							// 退场
							this.formData.status = '退场'
							this.statusIndex = 1
						} else {
							// 其他状态（在用、维修）默认显示为进场
							this.formData.status = '进场'
							this.statusIndex = 0
						}
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

		// 设备编号失焦时，根据编号直接查询设备详情
		async onDeviceNoBlur() {
			if (!this.formData.deviceNo || !this.formData.deviceNo.trim()) {
				return
			}

			try {
				uni.showLoading({
					title: '查询中...',
					mask: true
				})

				// 直接通过设备编号调用设备详情接口
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

		// 表单验证
		validateForm() {
			if (!this.formData.deviceNo || !this.formData.deviceNo.trim()) {
				uni.showToast({
					title: '请输入设备编号',
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
				title: '绑定中...',
				mask: true
			})

			try {
				// 构建提交数据
				// 状态映射：0进场 1在用 2维修 3退场
				// 表单中只有"进场"/"退场"，所以映射为：进场->0, 退场->3
				const statusMap = {
					'进场': 0,
					'退场': 3
				}

				const submitData = {
					qrNo: this.qrNo, // 二维码编号
					deviceNo: this.formData.deviceNo.trim(), // 设备编号
					pid: Number(this.formData.projectId), // 归属项目ID（转换为整数）
					address: this.address || '', // 地址
					lng: this.lng || '', // 经度
					lat: this.lat || '', // 纬度
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
					title: '绑定成功',
					icon: 'success'
				})

				// 延迟返回上一页
				setTimeout(() => {
					uni.navigateBack()
				}, 1500)

			} catch (error) {
				console.error('绑定设备失败:', error)
				uni.hideLoading()
				uni.showToast({
					title: error.msg || '绑定失败，请重试',
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
</style>


