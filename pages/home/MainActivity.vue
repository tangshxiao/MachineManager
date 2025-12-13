<template>
	<view>
		 <view class="status_bar">
		      <!-- 这里是状态栏 -->
		    </view>
			    <view> 状态栏下的文字 </view>

	</view>
</template>

<script >
	 export default {
 
	    mounted() {
	      // 设置排行榜页面的徽标
	      uni.setTabBarBadge({
	        index: 3, // 页面下标
	        text: '12', // text 的值必须是字符串
	      })
	    }
	  }
</script>

<style>
	       
</style>
