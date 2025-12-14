<template>
	<view class="root">
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
					 <view class="box1-picker-sele">
						<view>{{ sele }}</view>
						<view>&#xe601;</view>
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
			<view class="box1-time">
				<view class="">
					{{enterTime}}
				</view>
				<view class="">
					&#x101eb;
				</view>
			</view>
				
		</view>
		
		<view class="box1">
			<view class="box1-text">
				证明材料<view class="red">*</view>
			</view>
				<view class="photo" @click="upload">
					<view class="photo-tb">
						&#xe8bc;
					</view>
					<view class="">
						相机拍照/从相机选择
					</view>
				</view>
				<view class="photo-text">
					支持JPG/PNG格式，最多上传5张
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
</view>
</template>
<script>
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
	  errorShebie: "",
	  picker:"",
    };
  },
  onLoad() {
    this.getEnterTime(); // 页面初始化获取当前时间
  },
  methods: {
    openchange(e) {
      const index = e.detail.value;
      this.sele = this.equipment[index];
    },
    getEnterTime() {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      const h = String(now.getHours()).padStart(2, "0");
      const min = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      this.enterTime = `${y}-${m}-${d} ${h}:${min}:${s}`;
    },
    upload() {
      uni.chooseImage({
        count: 1,
        sizeType: ["original", "compressed"],
        sourceType: ["camera", "album"],
        success: (res) => {
          const filePath = res.tempFilePaths[0];
          uni.uploadFile({
            url: "",
            filePath,
            name: "file",
            success: (r) => {
              console.log("上传成功", r.data);
            },
            fail: (e) => {
              console.error("上传失败", e);
            }
          });
        }
      });
    },
	
    oninput(e) {
      this.count = e.detail.value.length;
    },
	
	
	
    submit() {
		if (!this.shebie.trim()) {
		    this.errorShebie = "设备编号不能为空";
		    return;
		  }
		
		  // ② 判断输入的编号是否在合法数组里
		  if (!validDevices.includes(this.shebie)) {
		    this.errorShebie = "该设备编号不存在，请重新输入";
		    return;
		  }
		  if(this.sele=="请选择设备类型"){
			    this.picker = "请选择数据类型";
			    return;
			    
		  }else{
			  // ③ 如果都合法就清掉错误信息
			  this.errorShebie = "";
			  		
			  console.log("提交数据", {
			    shebie: this.shebie,
			    sele: this.sele,
			    enterTime: this.enterTime,
			    beizhu: this.beizhu,
			  });
			  		
			  uni.showToast({
			    title: "校验通过",
			    icon: "success"
			  });
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
		.photo-tb{
			font-size: 52rpx;
		}
		.photo-text{
			font-size: 28rpx;
			color: #808080;
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
			 position: relative;
			  top: 20rpx;
			  left: 20rpx;
			  width: 90%;
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

</style>
