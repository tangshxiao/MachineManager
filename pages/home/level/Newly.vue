<template>
	<view class="root">
		<view class="Basic">
			<view class="Basic-text">
				基本信息
			</view>
			
			<view class="Basic-box">
				<view class="">
					<view class="Title">
						设备编号 <text class="required">*</text>
					</view>
					<view class="Content">
						<input type="text" v-model="formData.deviceNo" placeholder="EQ-2005-001" placeholder-style="color:#999"/>
					</view>
					
					<view class="Title">
						设备名称 <text class="required">*</text>
					</view>
					<view class="Content">
						<input type="text" v-model="formData.name" placeholder="挖掘机" placeholder-style="color:#999"/>
					</view>
					
					<view class="Title">
						设备类型
					</view>
					<view class="Content">
						<picker mode="selector" :range="typeOptions" range-key="label" :value="typeIndex" @change="onTypeChange">
							<view class="picker-view">{{ formData.type !== null && formData.type !== undefined ? typeOptions.find(t => t.value === formData.type)?.label || '请选择' : '请选择' }}</view>
						</picker>
					</view>
					
					<view class="Title">
						司机名称
					</view>
					<view class="Content">
						<input type="text" v-model="formData.driver" placeholder="张三" placeholder-style="color:#999"/>
					</view>

					<view class="Title">
						审核状态
					</view>
					<view class="Content">
						<picker mode="selector" :range="verifyStatusOptions" range-key="label" :value="verifyStatusIndex" @change="onVerifyStatusChange">
							<view class="picker-view">{{ formData.verifyStatus !== null && formData.verifyStatus !== undefined ? verifyStatusOptions.find(v => v.value === formData.verifyStatus)?.label || '待审核' : '待审核' }}</view>
						</picker>
					</view>

					<view class="Title">
						设备状态
					</view>
					<view class="Content">
						<picker mode="selector" :range="statusOptions" range-key="label" :value="statusIndex" @change="onStatusChange">
							<view class="picker-view">{{ formData.status !== null && formData.status !== undefined ? statusOptions.find(s => s.value === formData.status)?.label || '正常' : '正常' }}</view>
						</picker>
					</view>
				</view>
				
				<view class="">
					<view class="Title">
						设备型号
					</view>
					<view class="Content">
						<input type="text" v-model="formData.model" placeholder="PC200-8" placeholder-style="color:#999"/>
					</view>
				
					<view class="Title">
						规格参数
					</view>
					<view class="Content">
						<input type="text" v-model="formData.attr" placeholder="请输入规格参数" placeholder-style="color:#999"/>
					</view>
				
						<view class="Title">
							存放地址
						</view>
						<view class="Content">
							<input type="text" v-model="formData.address" placeholder="工厂A区" placeholder-style="color:#999"/>
						</view>
				
					<view class="Title">
						联系电话
					</view>
					<view class="Content">
						<input type="text" v-model="formData.phone" placeholder="13000000000" placeholder-style="color:#999"/>
					</view>
				</view>
			</view>
		</view>
		
		<view class="Parameter">
			<view class="Basic-text">
				详细参数
			</view>
			
			<view class="Parameter-box">
				<view class="Title">
					生产厂家
				</view>
				<view class="Content">
					<input type="text" v-model="formData.factory" placeholder="小松(中国)投资有限公司" placeholder-style="color:#999"/>
				</view>
				
				<view class="Parameter-box-box">
					<view class="">
						<view class="Title">
							生产日期
						</view>
						<view class="Content">
							<picker mode="date" :value="formData.productTime" @change="onProductTimeChange">
								<view class="picker-view">{{ formData.productTime || '请选择' }}</view>
							</picker>
						</view>
					</view>
					
					<view class="">
						<view class="Title">
							购置日期
						</view>
						<view class="Content">
							<picker mode="date" :value="formData.buyTime" @change="onBuyTimeChange">
								<view class="picker-view">{{ formData.buyTime || '请选择' }}</view>
							</picker>
						</view>
						
						<view class="Title">
							设备管理员ID
						</view>
						<view class="Content">
							<input type="number" v-model.number="formData.directorId" placeholder="0" placeholder-style="color:#999"/>
						</view>
					</view>
				</view>
				
				<view class="Title">
					保修开始时间
				</view>
				<view class="Content">
					<picker mode="date" :value="formData.warrantyStartTime" @change="onWarrantyStartTimeChange">
						<view class="picker-view">{{ formData.warrantyStartTime || '请选择' }}</view>
					</picker>
				</view>
				
				<view class="Title">
					保修结束时间
				</view>
				<view class="Content">
					<picker mode="date" :value="formData.warrantyEndTime" @change="onWarrantyEndTimeChange">
						<view class="picker-view">{{ formData.warrantyEndTime || '请选择' }}</view>
					</picker>
				</view>
				
				<view class="Title">
					备注
				</view>
				<view class="Content">
					<input type="text" v-model="formData.remark" placeholder="定期保养，状态良好" placeholder-style="color:#999"/>
				</view>
			</view>
		</view>
		
		<view class="btn">
			<button class="btn-btn" @click="handleCancel">取消</button>
			<button class="btn-but" @click="handleSubmit">确定</button>
		</view>
	</view>
</template>

<script>
import http from '@/utils/request.js'
import API_ENDPOINTS from '@/config/api.js'

export default {
	data() {
		return {
			formData: {
				name: '',
				deviceNo: '',
				type: 0,
				model: '',
				attr: '',
				factory: '',
				productTime: '',
				buyTime: '',
				warrantyStartTime: '',
				warrantyEndTime: '',
				address: '',
				driver: '',
				directorId: 0,
				phone: '',
				remark: '',
				verifyStatus: 0,
				status: 0
			},
			typeOptions: [
				{ label: '重型机器', value: 0 }
			],
			typeIndex: 0,
			verifyStatusOptions: [
				{ label: '待审核', value: 0 },
				{ label: '已驳回', value: 1 },
				{ label: '已通过', value: 2 }
			],
			verifyStatusIndex: 0,
			statusOptions: [
				{ label: '正常', value: 0 },
				{ label: '警告', value: 1 },
				{ label: '故障', value: 2 }
			],
			statusIndex: 0,
			submitting: false
		}
	},
	methods: {
		// 设备类型选择
		onTypeChange(e) {
			const index = e.detail.value
			this.typeIndex = index
			this.formData.type = this.typeOptions[index].value
		},
		
		// 审核状态选择
		onVerifyStatusChange(e) {
			const index = e.detail.value
			this.verifyStatusIndex = index
			this.formData.verifyStatus = this.verifyStatusOptions[index].value
		},
		
		// 设备状态选择
		onStatusChange(e) {
			const index = e.detail.value
			this.statusIndex = index
			this.formData.status = this.statusOptions[index].value
		},
		
		// 生产日期选择
		onProductTimeChange(e) {
			this.formData.productTime = e.detail.value
		},
		
		// 购置日期选择
		onBuyTimeChange(e) {
			this.formData.buyTime = e.detail.value
		},
		
		// 保修开始时间选择
		onWarrantyStartTimeChange(e) {
			this.formData.warrantyStartTime = e.detail.value
		},
		
		// 保修结束时间选择
		onWarrantyEndTimeChange(e) {
			this.formData.warrantyEndTime = e.detail.value
		},
		
		// 取消
		handleCancel() {
			uni.navigateBack()
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
			
			if (!this.formData.name || !this.formData.name.trim()) {
				uni.showToast({
					title: '请输入设备名称',
					icon: 'none'
				})
				return false
			}
			
			return true
		},
		
		// 格式化日期为 ISO 格式
		formatDate(dateStr) {
			if (!dateStr) return ''
			// 如果是 YYYY-MM-DD 格式，转换为 ISO 格式
			if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
				return dateStr + ' 00:00:00'
			}
			return dateStr
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
				// 准备提交数据
				const submitData = {
					name: this.formData.name.trim(),
					deviceNo: this.formData.deviceNo.trim(),
					type: this.formData.type || 0,
					model: this.formData.model || '',
					attr: this.formData.attr || '',
					factory: this.formData.factory || '',
					productTime: this.formatDate(this.formData.productTime),
					buyTime: this.formatDate(this.formData.buyTime),
					warrantyStartTime: this.formatDate(this.formData.warrantyStartTime),
					warrantyEndTime: this.formatDate(this.formData.warrantyEndTime),
					address: this.formData.address || '',
					driver: this.formData.driver || '',
					directorId: this.formData.directorId || 0,
					phone: this.formData.phone || '',
					remark: this.formData.remark || '',
					verifyStatus: this.formData.verifyStatus !== undefined ? this.formData.verifyStatus : 0,
					status: this.formData.status !== undefined ? this.formData.status : 0
				}
				
				console.log('提交设备数据:', submitData)
				
				// 调用接口
				const res = await http.post(API_ENDPOINTS.DEVICE_ADD_API, submitData, {
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
				console.error('提交设备失败:', error)
				uni.hideLoading()
				uni.showToast({
					title: '提交失败，请重试',
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
	page{
		position: relative;
		height: 100vh;
		padding: 32rpx 30rpx 200rpx 30rpx;
		background-color: #F5F8FC;
	}
	
	.required {
		color: #ff4d4f;
		margin-left: 4rpx;
	}
	
	.Basic{
		padding-bottom: 30rpx;
	}
	
	.Basic-text{
		padding-bottom: 24rpx;
		font-weight: bold;
		font-size: 30rpx;
	}
	
	.Basic-box{
		display: flex;
		background-color: #ffffff;
		width: 100%;
		box-sizing: border-box;
		padding: 30rpx 0rpx 30rpx 24rpx;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		width: 690rpx;
	}
	
	.Title{
		color: #BFC2C8;
		font-size: 28rpx;
	}
	
	.Content{
		font-size: 30rpx;
		padding-bottom: 20rpx;
		font-weight: bold;
	}
	
	.Content input{
		color: #000000;
		width: 100%;
		border: none;
		outline: none;
		background: transparent;
	}
	
	.picker-view {
		color: #000000;
		font-weight: bold;
	}
	
	.Parameter-box{
		background-color: #ffffff;
		padding: 30rpx 50rpx 30rpx 24rpx;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		margin-bottom: 20rpx;
		width: 610rpx;
	}
	
	.Parameter-box-box{
		display: flex;
		justify-content: space-between;
	}
	
	.Parameter-box-box .Content {
		padding-bottom: 20rpx;
	}
	
	.btn{
		height: 130rpx;
		background-color: #ffffff;
		padding: 30rpx;
		position: fixed;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.5);
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 20rpx;
		z-index: 999;
	}
	
	.btn-btn{
		background-color: #E4F1FF;
		color: #004CA2;
		border: none;
		border-radius: 99pt;
		padding: 28rpx 0;
		font-size: 36rpx;
		width: 304rpx;
		height: 90rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.btn-but{
		background-color: #004CA2;
		color: white;
		border: none;
		border-radius: 99pt;
		padding: 28rpx 0;
		font-size: 36rpx;
		width: 304rpx;
		height: 90rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>

