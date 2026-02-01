<template>
	<view class="root">
		<view >

		<view class="box1">
				<view class="box1-text">
					设备编号<view class="red">*</view>
				</view>
				<view class="device-select-wrapper">
					<input 
						class="box1-input" 
						v-model="deviceKeyword" 
						type="text" 
						placeholder="输入设备编号或名称搜索"
						@input="onDeviceSearch"
						@focus="handleDeviceInputFocus"
						@blur="handleDeviceInputBlur"
						:id="'device-input'"
					/>
					<!-- 设备下拉列表 -->
					<view v-if="showDeviceList && deviceList.length > 0" class="device-dropdown" :style="{ top: dropdownTop + 'px' }">
						<view 
							v-for="(item, index) in deviceList" 
							:key="index"
							class="device-dropdown-item"
							@click="selectDevice(item)"
						>
							<view class="device-item-text">
								<text class="device-no">{{ item.deviceNo || '-' }}</text>
								<text class="device-name">{{ item.name || '' }}</text>
							</view>
						</view>
					</view>
					<!-- 加载中 -->
					<view v-if="deviceLoading" class="device-loading" :style="{ top: dropdownTop + 'px' }">
						加载中...
					</view>
					<!-- 无数据 -->
					<view v-if="showDeviceList && !deviceLoading && deviceList.length === 0 && deviceKeyword" class="device-empty" :style="{ top: dropdownTop + 'px' }">
						暂无设备
					</view>
				</view>
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
			<picker mode="multiSelector" :range="dateTimeArray" :value="dateTimeIndex" @change="onDateTimeChange" @columnchange="onDateTimeColumnChange" class="box1-time">
				<view style="display:flex; justify-content:space-between; align-items:center; width:100%; height:90rpx; padding:0 20rpx;">
					<view>{{enterTime || '请选择操作时间'}}</view>
					<image src="/static/icon_time_bigimg.png" style="width:32rpx; height: 32rpx;"></image>
				</view>
			</picker>
		</view>
		
		<view class="box1">
			<view class="box1-text">
				证明材料<view class="red">*</view>
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
			<button class="Submit-btn" @click="submit">提交异常上报</button>
		</view>
		<!-- 遮罩层，点击关闭设备列表 -->
		<view v-if="showDeviceList" class="device-mask" @click="showDeviceList = false"></view>
	</view>
</template>
<script>
import http from '@/utils/request.js'
import API_ENDPOINTS from '@/config/api.js'
import { saveCacheRecord } from '@/utils/offlineCache.js'

export default {
  data() {
    return {
      shebie: "",
      deviceId: "", // 选中的设备ID
      deviceKeyword: "", // 设备搜索关键词
      deviceList: [], // 设备列表
      showDeviceList: false, // 是否显示设备列表
      deviceLoading: false, // 设备列表加载中
      deviceSearchTimer: null, // 搜索防抖定时器
      dropdownTop: 0, // 下拉列表顶部位置
      equipment: [], // 异常上报类型列表（从接口获取）
      exceptionTypeList: [], // 异常上报类型完整数据
      selectedTypeValue: "", // 选中的异常上报类型值
      sele: "请选择异常类型",
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
  onLoad() {
    this.initDateTimePicker(); // 初始化日期时间选择器
    this.getEnterTime(); // 页面初始化获取当前时间
    // 加载异常上报类型列表
    this.loadExceptionTypes();
  },
  methods: {
    // 处理设备输入框聚焦
    handleDeviceInputFocus() {
      this.showDeviceList = true;
      this.updateDropdownPosition();
    },
    
    // 处理设备输入框失焦
    handleDeviceInputBlur() {
      // 延迟关闭，让点击事件先执行
      setTimeout(() => {
        this.showDeviceList = false;
      }, 200);
    },
    
    // 更新下拉列表位置
    updateDropdownPosition() {
      this.$nextTick(() => {
        const query = uni.createSelectorQuery().in(this);
        query.select('#device-input').boundingClientRect((data) => {
          if (data) {
            // 计算下拉列表的top位置：输入框底部 + 8rpx间距，转换为px（1rpx ≈ 0.5px）
            this.dropdownTop = data.bottom + 8;
          }
        }).exec();
      });
    },
    
    // 设备搜索
    onDeviceSearch(e) {
      // 只允许输入数字和英文字母
      const value = e.detail.value;
      const filteredValue = value.replace(/[^a-zA-Z0-9]/g, '');
      
      // 如果输入被过滤，更新输入框的值
      if (value !== filteredValue) {
        this.deviceKeyword = filteredValue;
        // 使用 nextTick 确保值更新后再触发搜索
        this.$nextTick(() => {
          this.handleDeviceSearch();
        });
      } else {
        this.deviceKeyword = value;
        this.handleDeviceSearch();
      }
      
      // 清除错误提示
      this.errorShebie = "";
    },
    
    // 处理设备搜索（防抖）
    handleDeviceSearch() {
      // 防抖处理
      if (this.deviceSearchTimer) {
        clearTimeout(this.deviceSearchTimer);
      }
      
      this.deviceSearchTimer = setTimeout(() => {
        if (this.deviceKeyword.trim()) {
          this.searchDevices();
        } else {
          this.deviceList = [];
          this.showDeviceList = false;
        }
      }, 300);
    },
    
    // 搜索设备列表
    async searchDevices() {
      if (this.deviceLoading) return;
      
      // 获取项目ID
      const selectedProjectIds = uni.getStorageSync('selectedProjectIds');
      if (!selectedProjectIds) {
        uni.showToast({
          title: '请先选择项目',
          icon: 'none'
        });
        return;
      }
      // 取第一个项目ID作为pid
      const pid = selectedProjectIds.split(',')[0];
      
      this.deviceLoading = true;
      try {
        const res = await http.post(API_ENDPOINTS.DEVICE_LIST_API, {
          sort: 0,
          current: 1,
          size: 20,
          keyword: this.deviceKeyword.trim(),
          pid: pid
        });
        const records = (res && res.records) || [];
        this.deviceList = records;
        this.showDeviceList = true;
        this.updateDropdownPosition();
      } catch (e) {
        console.error('搜索设备失败:', e);
        this.deviceList = [];
      } finally {
        this.deviceLoading = false;
      }
    },
    
    // 选择设备
    selectDevice(item) {
      this.shebie = item.deviceNo || "";
      this.deviceId = item.id || "";
      this.deviceKeyword = item.deviceNo || "";
      this.showDeviceList = false;
      this.errorShebie = "";
    },
    
    // 关闭设备列表
    closeDeviceList() {
      this.showDeviceList = false;
    },
    
    // 加载异常上报类型列表
    async loadExceptionTypes() {
      try {
        const res = await http.post(API_ENDPOINTS.DICT_LIST_API, {
          code: 'exception_report_type'
        }, {
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        
        // http.post 在成功时已经返回了 data.data，所以 res 就是数组
        if (res && Array.isArray(res) && res.length > 0) {
          // 保存完整数据
          this.exceptionTypeList = res;
          // 提取 label 用于 picker 显示
          this.equipment = res.map(item => item.label);
        } else {
          console.error('获取异常上报类型失败: 数据格式错误', res);
          uni.showToast({
            title: '加载异常类型失败',
            icon: 'none'
          });
        }
      } catch (e) {
        console.error('获取异常上报类型失败:', e);
        uni.showToast({
          title: '加载异常类型失败',
          icon: 'none'
        });
      }
    },
    
    openchange(e) {
      const index = e.detail.value;
      if (this.exceptionTypeList && this.exceptionTypeList[index]) {
        this.sele = this.exceptionTypeList[index].label;
        this.selectedTypeValue = this.exceptionTypeList[index].value;
        this.picker = ""; // 清除错误提示
      }
      // 关闭设备选择列表
      this.showDeviceList = false;
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
    
    // 检测网络状态
    async checkNetworkStatus() {
      return new Promise((resolve) => {
        uni.getNetworkType({
          success: (res) => {
            resolve(res.networkType !== 'none' && res.networkType !== 'unknown')
          },
          fail: () => {
            resolve(false)
          }
        })
      })
    },
    
    // 提交上报
    async submit() {
      // 表单验证
      if (!this.shebie.trim() || !this.deviceId) {
        this.errorShebie = "请选择设备";
        return;
      }
      
      if (this.sele == "请选择异常类型" || !this.selectedTypeValue) {
        this.picker = "请选择异常类型";
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
        
        // 1. 上传图片（离线时也尝试上传，失败则在离线数据中保存图片路径）
        let imgs = '';
        try {
          imgs = await this.uploadImages();
          if (!imgs) {
            console.warn('图片上传失败，将在离线数据中保存图片路径');
          }
        } catch (imgError) {
          console.warn('图片上传失败，将在离线数据中保存图片路径', imgError);
        }
        
        // 2. 使用选中的异常类型值
        const type = parseInt(this.selectedTypeValue) || 0;
        
        // 3. 格式化时间
        let createTime = this.enterTime;
        if (!createTime.includes(':')) {
          createTime = createTime + ' 00:00:00';
        } else if (createTime.split(':').length === 2) {
          createTime = createTime + ':00';
        }
        
        // 4. 构建提交数据（新接口只需要这些字段）
        const submitData = {
          deviceId: parseInt(this.deviceId) || 0,
          type: type,
          remark: this.beizhu.trim(),
          imgs: imgs || "",
          createTime: createTime
        };
        
        // 5. 检测网络状态
        const isOnline = await this.checkNetworkStatus();
        
        if (!isOnline) {
          // 离线状态，保存到本地缓存
          uni.hideLoading();
          
          const cacheData = {
            type: 'report', // 异常上报类型
            deviceNo: this.shebie,
            deviceName: '', // 异常上报可能没有设备名称
            tag: '异常上报',
            time: createTime,
            imgs: imgs || "",
            images: this.images || [], // 保存本地图片路径
            remark: this.beizhu.trim(),
            data: JSON.stringify(submitData)
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
          this.submitting = false;
          return;
        }
        
        // 在线状态，正常提交
        // 注意：新接口不强制要求图片，所以移除图片验证
        
        const result = await http.post(API_ENDPOINTS.REPORT_SAVE_API, submitData, {
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
        
        // 如果网络请求失败，尝试保存到离线缓存
        try {
          const createTime = this.enterTime.split(':').length === 2 ? this.enterTime + ':00' : this.enterTime;
          const type = parseInt(this.selectedTypeValue) || 0;
          
          const cacheData = {
            type: 'report',
            deviceNo: this.shebie,
            deviceName: '',
            tag: '异常上报',
            time: createTime,
            imgs: "",
            images: this.images || [],
            remark: this.beizhu.trim(),
            data: JSON.stringify({
              deviceId: parseInt(this.deviceId) || 0,
              type: type,
              remark: this.beizhu.trim(),
              imgs: "",
              createTime: createTime
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
		}
		
		.device-select-wrapper {
		  position: relative;
		}
		
		.device-dropdown {
		  position: fixed;
		  left: 24rpx;
		  right: 24rpx;
		  background-color: #FFFFFF;
		  border-radius: 16rpx;
		  max-height: 500rpx;
		  overflow-y: auto;
		  z-index: 9999;
		  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
		}
		
		.device-dropdown-item {
		  padding: 24rpx 20rpx;
		  border-bottom: 1rpx solid #F5F9FC;
		}
		
		.device-dropdown-item:last-child {
		  border-bottom: none;
		}
		
		.device-item-text {
		  display: flex;
		  flex-direction: column;
		  gap: 8rpx;
		}
		
		.device-no {
		  font-size: 30rpx;
		  color: #333;
		  font-weight: 500;
		}
		
		.device-name {
		  font-size: 26rpx;
		  color: #999;
		}
		
		.device-loading,
		.device-empty {
		  position: fixed;
		  left: 24rpx;
		  right: 24rpx;
		  background-color: #FFFFFF;
		  border-radius: 16rpx;
		  padding: 40rpx;
		  text-align: center;
		  color: #999;
		  font-size: 28rpx;
		  z-index: 9999;
		  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
		}
		
		.device-mask {
		  position: fixed;
		  top: 0;
		  left: 0;
		  right: 0;
		  bottom: 0;
		  z-index: 9998;
		}

</style>
