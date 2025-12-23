<template>

 <view class="page">
			<view class="status-bar" style="height:80px;background:#004CA2;display:block;"></view>
	
	<view class="root" style="margin-top: 80px;" >
		
		<view >
		<view class="box1">
				<view class="box1-text">
					设备编号<view class="red">*</view>
				</view>
				<input class="box1-input"  v-model="shebie" type="text" placeholder="输入内容" />
				<view v-if="errorShebie" class="error-text">
					{{ errorShebie }}
				</view>
		</view>
		
		<view class="box1">
			<view class="box1-text">
				设备类型<view class="red">*</view>
			</view>
				<picker class="box1-picker" mode="selector" :range="equipment" @change="openchange">
					 <view class="box1-picker-sele" style="display:flex;justify-content:space-between;align-items:center;width:100%;">
						<view>{{ sele }}</view>
						<image src="/static/icon_jt_xx.png" style="width:32rpx; height: 32rpx;flex-shrink:0;margin-right:16rpx;" ></image>
					 </view> 
				</picker>
				<view v-if="picker" class="error-text">
					{{ picker }}
				</view>
		</view>
		
		<view class="box1">
			<view class="box1-text">
				操作时间<view class="red">*</view>
			</view>
			<picker v-if="dateTimeArray.length > 0" mode="multiSelector" :range="dateTimeArray" :value="dateTimeIndex" @change="onDateTimeChange" @columnchange="onDateTimeColumnChange" class="box1-time">
				<view style="display:flex; justify-content:space-between; align-items:center; width:100%; height:90rpx; padding:0 20rpx;">
					<view>{{enterTime || '请选择操作时间'}}</view>
					<image src="/static/icon_time_bigimg.png" style="width:32rpx; height: 32rpx;"></image>
				</view>
			</picker>
			<view v-else class="box1-time" style="display:flex; justify-content:space-between; align-items:center; width:100%; height:90rpx; padding:0 20rpx;">
				<view>请选择操作时间</view>
				<image src="/static/icon_time_bigimg.png" style="width:32rpx; height: 32rpx;"></image>
			</view>
		</view>
		
		<view class="box1">
			<view class="box1-text">
				证明材料<view class="red">*</view>
			</view>
				<view v-if="!images.length" class="photo" @click="upload">
					<view class="photo-tb">
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
		</view>
		
		<view class="box1">
			<view class="box1-text">
				备注<view class="red">*</view>
			</view>
			<view class="Remarks">
				<textarea class="box2-input" v-model="beizhu" type="text" placeholder="输入内容" @input="oninput" maxlength="100"/>
				<view class="box2-count">
					{{count}}/100
				</view>
			</view>
		</view>	
		
		</view>
		<view class="">
			<button class="Submit-btn" @click="submit">提交上报</button>
		</view>
    </view>
 </view>
</template>
<script>
import http from '@/utils/request.js'
import API_ENDPOINTS from '@/config/api.js'

//模拟设备编号
const validDevices = ["DEV001", "DEV002", "DEV003"];

export default {
  data() {
    return {
      shebie: "",
      equipment: ["进场", "出场"],
      sele: "请选择设备类型",
      beizhu: "",
      count: 0,
      enterTime: "",
      dateTimeArray: [],
      dateTimeIndex: [0, 0, 0, 0, 0],
      errorShebie: "",
      picker:"",
      images: [],
      // 位置信息
      address: "",
      lng: "",
      lat: "",
      // 提交状态
      submitting: false,
    };
  },
  mounted() {
    // 组件挂载时初始化日期时间选择器
    this.initDateTimePicker();
    this.getEnterTime();
  },
  methods: {
    openchange(e) {
      const index = e.detail.value;
      this.sele = this.equipment[index];
    },
    // 生成天数数组（根据年月）
    generateDaysArray(year, month) {
      const days = [];
      const daysInMonth = new Date(year, month, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(String(i).padStart(2, '0') + '日');
      }
      return days;
    },
    // 初始化日期时间选择器数据
    initDateTimePicker() {
      const years = [];
      const months = [];
      const hours = [];
      const minutes = [];
      
      // 年份：当前年份前后各10年
      const currentYear = new Date().getFullYear();
      for (let i = currentYear - 10; i <= currentYear + 10; i++) {
        years.push(i + '年');
      }
      
      // 月份：1-12月
      for (let i = 1; i <= 12; i++) {
        months.push(String(i).padStart(2, '0') + '月');
      }
      
      // 日期：根据当前年月生成
      const now = new Date();
      const days = this.generateDaysArray(now.getFullYear(), now.getMonth() + 1);
      
      // 小时：0-23时
      for (let i = 0; i <= 23; i++) {
        hours.push(String(i).padStart(2, '0') + '时');
      }
      
      // 分钟：0-59分
      for (let i = 0; i <= 59; i++) {
        minutes.push(String(i).padStart(2, '0') + '分');
      }
      
      this.dateTimeArray = [years, months, days, hours, minutes];
    },
    // 获取当前日期时间的索引
    getCurrentDateTimeIndex() {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const hour = now.getHours();
      const minute = now.getMinutes();
      
      const currentYear = new Date().getFullYear();
      const yearIndex = year - (currentYear - 10);
      const monthIndex = month - 1;
      const dayIndex = day - 1;
      const hourIndex = hour;
      const minuteIndex = minute;
      
      return [yearIndex, monthIndex, dayIndex, hourIndex, minuteIndex];
    },
    getEnterTime() {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      const h = String(now.getHours()).padStart(2, "0");
      const min = String(now.getMinutes()).padStart(2, "0");
      this.enterTime = `${y}-${m}-${d} ${h}:${min}`;
      this.dateTimeIndex = this.getCurrentDateTimeIndex();
    },
    // 更新 enterTime 显示（根据当前 dateTimeIndex）
    updateEnterTimeDisplay() {
      const currentYear = new Date().getFullYear();
      const year = currentYear - 10 + this.dateTimeIndex[0];
      const month = this.dateTimeIndex[1] + 1;
      const day = this.dateTimeIndex[2] + 1;
      const hour = this.dateTimeIndex[3];
      const minute = this.dateTimeIndex[4];
      
      this.enterTime = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    },
    // 日期时间选择器列变化事件（当月份或年份变化时，更新天数数组）
    onDateTimeColumnChange(e) {
      const column = e.detail.column;
      const value = e.detail.value;
      
      // 先更新对应列的索引
      const newIndex = [...this.dateTimeIndex];
      newIndex[column] = value;
      
      // 如果变化的是年份（0）或月份（1），需要更新天数数组
      if (column === 0 || column === 1) {
        const currentYear = new Date().getFullYear();
        const yearIndex = newIndex[0];
        const monthIndex = newIndex[1];
        
        const year = currentYear - 10 + yearIndex;
        const month = monthIndex + 1;
        
        // 重新生成天数数组
        const newDays = this.generateDaysArray(year, month);
        
        // 更新 dateTimeArray 中的天数数组
        const newDateTimeArray = [...this.dateTimeArray];
        newDateTimeArray[2] = newDays;
        this.dateTimeArray = newDateTimeArray;
        
        // 如果当前选择的天数超过了新月份的最大天数，调整天数索引
        if (newIndex[2] >= newDays.length) {
          newIndex[2] = newDays.length - 1;
        }
      }
      
      // 更新 dateTimeIndex
      this.dateTimeIndex = newIndex;
      
      // 实时更新显示的时间
      this.updateEnterTimeDisplay();
    },
    // 日期时间选择器变化事件（用户确认选择后触发）
    onDateTimeChange(e) {
      const values = e.detail.value;
      this.dateTimeIndex = values;
      
      // 更新显示的时间
      this.updateEnterTimeDisplay();
    },
	upload() {
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
		  // 支持的文件扩展名（不区分大小写）
		  const validExt = [".jpg", ".jpeg", ".png"];
		  const newImages = [];
		  paths.forEach((p) => {
			// 转换为小写进行比较，实现不区分大小写
			const lowerPath = String(p).toLowerCase();
			const ok = validExt.some((ext) => lowerPath.endsWith(ext));
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
	removeImage(index) {
	  this.images.splice(index, 1);
	},
	previewImage(index) {
	  uni.previewImage({
		urls: this.images,
		current: this.images[index],
	  });
	},
	
	oninput(e) {
	  this.count = e.detail.value.length;
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
	
	// 提交上报
	async submit() {
	  // 表单验证
	  if (!this.shebie.trim()) {
		this.errorShebie = "设备编号不能为空";
		return;
	  }
	  
	  if (!validDevices.includes(this.shebie)) {
		this.errorShebie = "该设备编号不存在，请重新输入";
		return;
	  }
	  
	  if (this.sele == "请选择设备类型") {
		this.picker = "请选择设备类型";
		return;
	  }
	  
	  if (!this.enterTime) {
		uni.showToast({
		  title: "请选择操作时间",
		  icon: "none"
		});
		return;
	  }
	  
	  if (!this.images || this.images.length === 0) {
		uni.showToast({
		  title: "请上传证明材料",
		  icon: "none"
		});
		return;
	  }
	  
	  if (!this.beizhu.trim()) {
		uni.showToast({
		  title: "请输入备注",
		  icon: "none"
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
		
		// 2. 上传图片
		const imgs = await this.uploadImages();
		if (!imgs) {
		  uni.hideLoading();
		  uni.showToast({
			title: "图片上传失败",
			icon: "none"
		  });
		  this.submitting = false;
		  return;
		}
		
		// 3. 确定类型：0进场 1离场
		const type = this.sele === "进场" ? 0 : 1;
		
		// 4. 提交上报数据
		const submitData = {
		  id: 0,
		  deviceId: 0, // 这里可能需要根据设备编号获取实际设备ID
		  type: type,
		  address: this.address || "",
		  lng: this.lng || "",
		  lat: this.lat || "",
		  imgs: imgs,
		  remark: this.beizhu.trim(),
		  time: this.enterTime,
		  status: 1 // 1异常（因为这是异常上报）
		};
		
		const result = await http.post(API_ENDPOINTS.ATTENDANCE_ADD_API, submitData, {
		  header: {
			'Content-Type': 'application/json'
		  }
		});
		
		uni.hideLoading();
		uni.showToast({
		  title: "提交成功",
		  icon: "success"
		});
		
		// 提交成功后，延迟返回上一页
		setTimeout(() => {
		  uni.navigateBack();
		}, 1500);
		
	  } catch (error) {
		console.error('提交失败:', error);
		uni.hideLoading();
		uni.showToast({
		  title: "提交失败，请重试",
		  icon: "none"
		});
	  } finally {
		this.submitting = false;
	  }
	}
  }
};
</script>

<style>
	   /* 在线链接服务仅供平台体验和调试使用，平台不承诺服务的稳定性，企业客户需下载字体包自行发布使用并做好备份。 */
	   @font-face {
		 font-family: 'iconfont';  /* Project id 5080572 */
		 src: url('//at.alicdn.com/t/c/font_5080572_ixn9fy5br7e.woff2?t=1765613286245') format('woff2'),
			  url('//at.alicdn.com/t/c/font_5080572_ixn9fy5br7e.woff?t=1765613286245') format('woff'),
			  url('//at.alicdn.com/t/c/font_5080572_ixn9fy5br7e.ttf?t=1765613286245') format('truetype');
	   }
	   .page {
		background: linear-gradient(to bottom, #4E83BE, #ffffff);
		min-height: 100vh;
		box-sizing: border-box;
		padding-top: 44px;
		padding-top: env(safe-area-inset-top);
	}
		.root{
			font-family: iconfont;
			padding:26rpx 24rpx 78rpx 24rpx;
			height: 88vh;
			background-color:#F5F9FC;
			display: flex;
			flex-direction: column; 
			justify-content: space-between; 
		}
		.box1{
			padding-bottom: 20rpx;
		}
		.box1-text{
			display: flex;
			height: 44rpx;
			padding-bottom: 20rpx;
			font-weight: bold;
		}
		.red{
			
			color: red;
		}
		.box1-input{
			height: 90rpx;
			background-color: #FFFFFF;
			padding: 0 0 0 20rpx;
			border-radius:16rpx;
		}
		.box1-picker{
			height: 90rpx;
			display: flex;
			align-items: center;
			padding: 0 0 0 20rpx;
			background-color: #FFFFFF;
			border-radius:16rpx;
		}
		.box1-picker-sele{
			display: flex;
			justify-content: space-between; 
			color: #808080;
		}
		.box1-time{
			height: 90rpx;
			display: flex;
			align-items: center;
			padding: 0 20rpx 0 20rpx;
			background-color: #FFFFFF;
			border-radius:16rpx;
			color: #808080;
			justify-content: space-between; 
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
		.Remarks{
			height: 210rpx;
			display: flex;
			justify-content: space-between; 
			position: relative;
			color: #808080;
			background-color: #FFFFFF;
			border-radius:16rpx;
		}
		.box2-input{
			 position: absolute;
			  top: 20rpx;
			  left: 20rpx;
			  width: 638rpx;
			  height: 170rpx;
			  padding: 10rpx 0 0 10rpx; 
			  padding: rpx;
			  background-color: #F5F9FC;
			  border-radius:16rpx;
		}
		.box2-count{
			position: absolute;
			  bottom: 24rpx;
			  right: 24rpx;
			  font-size: 28rpx;
		}
		
		.Submit-btn{
			background-color: #004ca2;
			width: 640rpx;
			height: 90rpx;
			line-height: 90rpx;
			border-radius: 198rpx;
			color: #ffffff;
			font-size: 30rpx; 
			transition: all 0.2s ease;
		}
		
		.error-text {
		  color: red;
		  font-size: 26rpx;
		  margin-top: 8rpx;
		}
		.image-thumb {
		  position: relative;
		  margin-top: 10rpx;
		}
		.format-error {
		  position: absolute;
		  bottom: 0;
		  left: 0;
		  color: red;
		  font-size: 24rpx;
		}
		.thumb-img {
		  width: 200rpx;
		  height: 200rpx;
		}	.status-bar {
		height: 80px;
		height: env(safe-area-inset-top);
		width: 100%;
		background: #004CA2;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 999;
	}

</style>
