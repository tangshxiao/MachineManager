<template>
	 <view class="page">
		<view class="user-card">
			<view class="user-card-button">
				<button class="user-card-btn"@click="daka" style="display:flex;align-items:center;justify-content:center;">
					<image src="/static/icon_scan_img.png" mode="aspectFill" style="width:40rpx;height:40rpx;margin-right:10rpx;"></image>
					扫码打卡
				</button>
			</view>
			
			<!-- 网络提示 -->
			<view class="network-notice" v-if="showNetworkNotice && hasPendingRecords">
				<text>已检测到网络，可上传缓存数据</text>
				<view class="notice-upload-btn" @click="uploadAll">立即上传</view>
			</view>
			
			<!-- 无网络提示 -->
			<view class="offline-notice" v-if="!isOnline && hasPendingRecords">
				<text>当前无网络，数据已本地缓存，已缓存数据{{ pendingCount }}条</text>
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
					<view class="user-card-Function-imga"  @click="Offline">
						<image src="/imgs/shouyetu3.png" alt="" />
						<view class="user-card-Function-text">
							离线存储
						</view>
					</view>
				</view>
			</view>
			<view class="user-card-Record" @click="goToAllRecords">
				<view class="user-card-Record-text">
					<view class="user-card-Record-text-img">
					</view>
					最近打卡纪录
				</view>
					<!-- @click.stop="goToRecordDetail(item)" -->
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
										:class="getStatusButtonClass(item.type)"
									>
										{{ getStatusText(item.type) }}
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
								@click="goToDeviceDetail(item)"
							>
								<view class="user-card-Equipment-Component-text">
									<view class="record-info">
										<view>{{ item.deviceNo || '-' }} {{ item.name || '' }}</view>
									</view>
									<button
										:class="getStatusButtonClass(item.status)"
									>
										{{ getStatusText(item.status) }}
									</button>
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
	</view>
</template>

<script>
	import http from '@/utils/request.js'
	import API_ENDPOINTS from '@/config/api.js'
	import { getAllCacheRecords, markRecordUploaded, getCacheStats } from '@/utils/offlineCache.js'
	
	export default {
  data() {
    return {
      // 最近打卡记录分页
      attendanceList: [],
      attendanceCurrent: 1,
      attendanceSize: 10,
      // 常用设备分页
      deviceList: [],
      deviceCurrent: 1,
      deviceSize: 10,
      // 选择的项目 IDs
      selectedProjectIds: [],
      // 网络提示相关
      showNetworkNotice: false,
      uploading: false,
      isOnline: true // 网络状态
    }
  },
  
  computed: {
    // 是否有待上传的记录
    hasPendingRecords() {
      const stats = getCacheStats()
      return stats.pending > 0
    },
    // 待上传记录数量
    pendingCount() {
      const stats = getCacheStats()
      return stats.pending
    }
  },

  mounted() {
    this.loadAttendanceList()
    this.loadDeviceList()
  },

  onShow() {
    // 从本地存储读取选择的项目 IDs
    const idsStr = uni.getStorageSync('selectedProjectIds') || ''
    if (idsStr) {
      this.selectedProjectIds = idsStr.split(',')
      console.log('首页接收到的项目 IDs:', this.selectedProjectIds)
      // 读取后可以清空，避免重复使用
      // uni.removeStorageSync('selectedProjectIds')
    }
    // 刷新打卡记录和设备列表（重置到第一页，确保显示最新数据）
    this.attendanceCurrent = 1
    this.deviceCurrent = 1
    this.loadAttendanceList()
    this.loadDeviceList()
    // 检测网络状态和待上传记录
    this.checkNetworkStatus()
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
        // 获取项目ID
        const selectedProjectIds = uni.getStorageSync('selectedProjectIds');
        if (!selectedProjectIds) {
          console.error('未找到项目ID');
          return;
        }
        // 取第一个项目ID作为pid
        const pid = selectedProjectIds.split(',')[0];
        
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

    //   uni.navigateTo({
    //     url: '/pages/home/level/UploadData'
    //   });
		// uni.scanCode({
		// 	scanType: ['barCode', 'qrCode'],
		// 	success: (res) => {
		// 		console.log('条码类型：' + res.scanType);
		// 		console.log('条码内容：' + res.result);
		// 		// 这里可以根据扫码结果更新页面数据
		// 		// 例如：this.shebei = res.result;
		// 		uni.showToast({
		// 		title: '扫码成功',
		// 		icon: 'success'
		// 		});
		// 	},
		// 	fail: (err) => {
		// 		console.error('扫码失败:', err);
		// 		// 扫码失败时不显示错误提示，避免影响用户体验
		// 		// 如果用户主动取消扫码，不需要提示
		// 		if (err.errMsg && !err.errMsg.includes('cancel')) {
		// 		uni.showToast({
		// 			title: '扫码失败',
		// 			icon: 'none'
		// 		});
		// 		}
		// 	}
		// });

  //   },

    		// 1. 开始扫码
    		uni.scanCode({
    			success: async (jieguo) => {
    				console.log('扫码成功,内容:', jieguo.result);
    				
    				try {
    					// 解析二维码JSON数据，提取qrNo
    					const qrData = JSON.parse(jieguo.result);
    					if (!qrData.qrNo) {
    						uni.showToast({
    							title: '二维码格式错误',
    							icon: 'none'
    						});
    						return;
    					}
    					
    					// 调用二维码详情接口，检查状态
    					uni.showLoading({
    						title: '检查中...',
    						mask: true
    					});
    					
    					const qrDetails = await http.post(API_ENDPOINTS.DEVICE_QR_DETAILS_API, {
    						qrNo: qrData.qrNo
    					});
    					
    					uni.hideLoading();
    					
    					// 检查二维码状态：0未绑定 1已绑定
    					if (qrDetails && qrDetails.status !== undefined) {
    						if (qrDetails.status === 0) {
    							// 未绑定，弹出对话框提示用户
    							uni.showModal({
    								title: '提示',
    								content: '该设备未绑定，是否前往绑定设备？',
    								confirmText: '确认',
    								cancelText: '取消',
    								success: (res) => {
    									if (res.confirm) {
    										// 用户点击确认，跳转到绑定设备页面
    										uni.navigateTo({
    											url: '/pages/home/level/BindDevice?qrCode=' + encodeURIComponent(jieguo.result)
    										});
    									}
    									// 用户点击取消，直接关闭对话框，不做任何操作
    								}
    							});
    						} else if (qrDetails.status === 1) {
    							// 已绑定，跳转到打卡页面
    							uni.navigateTo({
    								url: '/pages/home/level/UploadData?result=' + encodeURIComponent(jieguo.result)
    							});
    						} else {
    							uni.showToast({
    								title: '二维码状态异常',
    								icon: 'none'
    							});
    						}
    					} else {
    						uni.showToast({
    							title: '获取二维码信息失败',
    							icon: 'none'
    						});
    					}
    				} catch (e) {
    					uni.hideLoading();
    					console.error('处理二维码失败:', e);
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
    				}
    			},
    			fail: (err) => {
    				console.log('扫码失败', err);
    				if (err.errMsg && !err.errMsg.includes('cancel')) {
    					uni.showToast({
    						title: '扫码失败',
    						icon: 'none'
    					});
    				}
    			}
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
	},
	Offline(){
		uni.navigateTo({
		  url: '/pages/home/level/Offline/Offline'
		});
	},
	// 更多功能
	moreFunctions(){
		uni.showToast({
		  title: '暂无更多功能',
		  icon: 'none'
		});
	},
	// 跳转到设备详情
	goToDeviceDetail(item) {
	  if (!item.id) {
		uni.showToast({
		  title: '设备信息错误',
		  icon: 'none'
		})
		return
	  }
	  uni.navigateTo({
		url: `/pages/home/level/record/device-detail/device-detail?id=${item.id}`
	  })
	},
	
	// 跳转到所有打卡数据
	goToAllRecords() {
	  uni.navigateTo({
		url: '/pages/home/level/record/record'
	  })
	},
	
	// 跳转到打卡记录详情（设备详情页）
	goToRecordDetail(item) {
	  if (!item.deviceId && !item.id) {
		uni.showToast({
		  title: '设备信息错误',
		  icon: 'none'
		})
		return
	  }
	  // 使用deviceId或id跳转到设备详情页
	  const deviceId = item.deviceId || item.id
	  uni.navigateTo({
		url: `/pages/home/level/record/device-detail/device-detail?id=${deviceId}`
	  })
	},
	
	// 获取状态文字：0进场 1在用 2维修 3退场
	getStatusText(type) {
	  const statusMap = {
		0: '进场',
		1: '在用',
		2: '维修',
		3: '退场'
	  }
	  return statusMap[type] || '未知'
	},
	
	// 获取状态按钮样式类
	getStatusButtonClass(type) {
	  // 0进场-蓝色, 1在用-绿色, 2维修-橙色, 3退场-灰色
	  if (type === 0) {
		return 'user-card-Record-Component-btn' // 进场-蓝色
	  } else if (type === 1) {
		return 'user-card-Record-Component-btn-using' // 在用-绿色
	  } else if (type === 2) {
		return 'user-card-Record-Component-btn-maintenance' // 维修-橙色
	  } else if (type === 3) {
		return 'user-card-Record-Component-btnt' // 退场-灰色
	  }
	  return 'user-card-Record-Component-btnt' // 默认灰色
	},
	
	// 检测网络状态
	async checkNetworkStatus() {
	  return new Promise((resolve) => {
		uni.getNetworkType({
		  success: (res) => {
			const isOnline = res.networkType !== 'none' && res.networkType !== 'unknown'
			this.isOnline = isOnline
			// 重新获取统计数据，确保是最新的
			const stats = getCacheStats()
			const hasPending = stats.pending > 0
			this.showNetworkNotice = isOnline && hasPending
			resolve(isOnline)
		  },
		  fail: () => {
			this.isOnline = false
			this.showNetworkNotice = false
			resolve(false)
		  }
		})
	  })
	},
	
	// 上传全部缓存记录
	async uploadAll() {
	  if (this.uploading) return
	  
	  const isOnline = await this.checkNetworkStatus()
	  if (!isOnline) {
		uni.showToast({
		  title: '当前无网络，无法上传',
		  icon: 'none'
		})
		return
	  }
	  
	  const records = getAllCacheRecords()
	  const pendingRecords = records
		.filter(record => record.uploadStatus === 'pending')
		.map(record => ({
		  id: record.id,
		  rawData: record
		}))
	  
	  if (pendingRecords.length === 0) {
		uni.showToast({
		  title: '没有可上传的记录',
		  icon: 'none'
		})
		return
	  }
	  
	  await this.uploadRecords(pendingRecords)
	},
	
	// 上传记录（核心上传逻辑）
	async uploadRecords(records) {
	  this.uploading = true
	  uni.showLoading({
		title: '上传中...',
		mask: true
	  })
	  
	  let successCount = 0
	  let failedCount = 0
	  
	  for (const item of records) {
		try {
		  const rawData = item.rawData
		  if (!rawData || !rawData.data) {
			markRecordUploaded(item.id, false, '数据格式错误')
			failedCount++
			continue
		  }
		  
		  // 解析提交数据
		  let submitData
		  try {
			submitData = JSON.parse(rawData.data)
		  } catch (e) {
			markRecordUploaded(item.id, false, '数据解析失败')
			failedCount++
			continue
		  }
		  
		  // 如果有本地图片，先上传图片
		  if (rawData.images && rawData.images.length > 0 && !submitData.imgs) {
			try {
			  const uploadPromises = rawData.images.map(filePath => {
				return http.upload(filePath, {
				  url: API_ENDPOINTS.UPLOAD_API,
				  name: 'file',
				  showLoading: false
				}).catch(err => {
				  console.error('图片上传失败:', err)
				  return null
				})
			  })
			  
			  const results = await Promise.all(uploadPromises)
			  const successUrls = results.filter(url => url !== null)
			  submitData.imgs = successUrls.join(',')
			} catch (imgError) {
			  console.error('图片上传失败:', imgError)
			  // 继续提交，但不包含图片
			}
		  }
		  
		  // 提交数据
		  await http.post(API_ENDPOINTS.ATTENDANCE_ADD_API, submitData, {
			header: {
			  'Content-Type': 'application/json'
			}
		  })
		  
		  // 标记为已上传
		  markRecordUploaded(item.id, true)
		  successCount++
		  
		} catch (error) {
		  console.error('上传失败:', error)
		  markRecordUploaded(item.id, false, error.message || '上传失败')
		  failedCount++
		}
	  }
	  
	  uni.hideLoading()
	  this.uploading = false
	  
	  if (successCount > 0) {
		uni.showToast({
		  title: `成功上传${successCount}条记录`,
		  icon: 'success'
		})
	  }
	  
	  // 重新检测网络状态和待上传记录，更新提示显示状态
	  // 使用 $nextTick 确保计算属性已更新
	  this.$nextTick(() => {
		this.checkNetworkStatus()
	  })
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
	
	/* 网络提示条 */
	.network-notice {
		margin: 20rpx 0;
		background: #FFF8E1;
		border: 2rpx solid #FFC107;
		border-radius: 16rpx;
		padding: 20rpx 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 26rpx;
		color: #F57C00;
	}
	
	.notice-upload-btn {
		background: #FF9800;
		color: #fff;
		padding: 10rpx 30rpx;
		border-radius: 30rpx;
		font-size: 24rpx;
	}
	
	/* 无网络提示条 */
	.offline-notice {
		margin: 20rpx 0;
		background: #FFF3E0;
		border: 2rpx solid #FF9800;
		border-radius: 16rpx;
		padding: 20rpx 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 26rpx;
		color: #E65100;
		text-align: center;
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
		background-color: #3AA7F9; /* 进场-蓝色 */
		width: 120rpx;
		height: 60rpx;
		line-height: 60rpx;
		border-radius: 176rpx;
		font-size: 28rpx; 
		color: white;
	}
	
	.user-card-Record-Component-btn-using{
		margin-right: 5rpx; 
		background-color: #39CCA6; /* 在用-绿色 */
		width: 120rpx;
		height: 60rpx;
		line-height: 60rpx;
		border-radius: 176rpx;
		font-size: 28rpx; 
		color: white;
	}
	
	.user-card-Record-Component-btn-maintenance{
		margin-right: 5rpx; 
		background-color: #FFB647; /* 维修-橙色 */
		width: 120rpx;
		height: 60rpx;
		line-height: 60rpx;
		border-radius: 176rpx;
		font-size: 28rpx; 
		color: white;
	}
	
	.user-card-Record-Component-btnt{
		margin-right: 5rpx; 
		background-color: #A4B6D3; /* 退场-灰色 */
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
		cursor: pointer;
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
		padding-bottom: 100rpx;
		padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
	}
	
</style>