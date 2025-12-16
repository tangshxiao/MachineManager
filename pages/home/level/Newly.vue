<template>
	<view class="root">
		<view class="Basic">
			<view class="Basic-text">
				基本信息
			</view>
			
			<view class="Basic-box">

					<view class="">
						<view class="Title">
							设备编号
						</view>
						<view class="Content">
							<input type="text"  placeholder="EQ-2005-001" placeholder-style="color:#000"/>
						</view>
						
						<view class="Title">
							设备名称
						</view>
						<view class="Content">
							<input type="text"  placeholder="挖掘机" placeholder-style="color:#000"/>
						</view>
						<view class="Title">
							司机名称
						</view>
						<view class="Content">
							<input type="text"  placeholder="张三" placeholder-style="color:#000"/>
						</view>

						<view class="Title">
							审核状态
						</view>
						<view class="Content">
							<input type="text"  placeholder="已通过" placeholder-style="color:#000"/>
						</view>

						<view class="Title">
							录入时间
						</view>
						<view class="Content">
							<input type="text"  placeholder="2025-11-11" placeholder-style="color:#000"/>
						</view>
				</view>
				
				<view class="">
						<view class="Title">
							所属分包单位
						</view>
						<view class="Content">
							<input type="text"  placeholder="第一建筑工程队" placeholder-style="color:#000"/>
						</view>
				
					
						<view class="Title">
							设备名称
						</view>
						<view class="Content">
							<input type="text"  placeholder="重型机械" placeholder-style="color:#000"/>
						</view>
				
				
						<view class="Title">
							设备状态
						</view>
						<view class="Content">
							<input type="text"  placeholder="在用" placeholder-style="color:#000"/>
						</view>
		
				
						<view class="Title">
							二维码状态
						</view>
						<view class="Content">
							<input type="text"  placeholder="已生成" placeholder-style="color:#000"/>
						</view>
			
			
						<view class="Title">
							二维码状态
						</view>
						<view class="Content">
							<input type="text"  placeholder="已生成" placeholder-style="color:#000"/>
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
				设备型号
			</view>
			<view class="Content">
				PC200-8
			</view>
			<view class="Parameter-box-box">
				<view class="">
					<view class="Title">
						生产日期
					</view>
					<view class="Content">
						2023-11-08
					</view>
					<view class="Title">
						存放地址
					</view>
					<view class="Content">
						工厂A区
					</view>
				</view>
				
				<view class="">
					<view class="Title">
						购置日期
					</view>
					<view class="Content">
						2024-05-11
					</view>
					<view class="Title">
						设备管理
					</view>
					<view class="Content">
						老雷
					</view>
				</view>
			</view>
			<view class="Title">
				生成厂家
			</view>
			<view class="Content">
				小松(中国)投资有限公司
			</view>
			<view class="Title">
				保修期
			</view>
			<view class="Content">
				2024-05-11至2029-05-10
			</view>
			<view class="Title">
				联系电话
			</view>
			<view class="Content">
				130000000000
			</view>
			<view class="">
				备注
			</view>
			<input type="text"  placeholder="定期保养，状态良好" />
		</view>
	</view >
		
	</view>
	<view class="btn">
		<button class="btn-btn">取消</button>
		<button class="btn-but">确定</button>
	</view>
</template>

<script>
</script>

<style>
	page{
		position: relative;
		padding: 32rpx 30rpx 200rpx 30rpx;
		background-color: #F5F8FC;
	}
	.Basic{
		padding-bottom: 30rpx;
	}
	.Basic-text{
		padding-bottom: 24rpx;
		font-weight:bold;
		font-size: 30rpx;
	}
	.Basic-box{
		display: flex;
		background-color: #ffffff;
		justify-content: space-between;
		padding: 30rpx 50rpx 30rpx 24rpx;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	}
	.Title{
		color: #BFC2C8;
		font-size: 28rpx;
	}
	.Content{
		font-size: 30rpx;
		padding-bottom: 20rpx;
		font-weight:bold;
		
	}
	.Content input{
		color: #000000;
	}
	.Parameter-box{
		background-color: #ffffff;
		padding: 30rpx 50rpx 30rpx 24rpx;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		margin-bottom: 20rpx;
	}
	.Parameter-box-box{
		display: flex;
		justify-content: space-between;
	}
	.btn{
		width: 681rpx;
		height: 130rpx;
		background-color: #ffffff;
		padding:30rpx;
		position: fixed;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.5);
		bottom: 0;
		left: 0;
		right: 0;
		display: block;
		justify-content: space-between;
		display: flex;           /* 使用弹性布局 */
		  align-items: center;     /* 垂直方向居中 */
		  justify-content: center; 
		  
		
	}
	.btn-btn{
		background-color: #E4F1FF;
		color: white;
		border: none;
		border-radius: 99pt;
		padding: 28rpx 0;
		font-size: 36rpx;
		color: #004CA2;
		width: 304rpx;
		height: 90rpx;
		display: flex;           /* 使用弹性布局 */
		  align-items: center;     /* 垂直方向居中 */
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
		display: flex;           /* 使用弹性布局 */
		  align-items: center;     /* 垂直方向居中 */
		  justify-content: center; 
	}
</style>