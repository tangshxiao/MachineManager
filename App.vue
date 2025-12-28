<script>
	export default {
		onLaunch: function() {
			// 检查是否已选择项目，如果已选择则直接跳转到首页
			const selectedProjectIds = uni.getStorageSync('selectedProjectIds')
			if (selectedProjectIds) {
				console.log('检测到已选择项目，自动跳转到首页')
				uni.switchTab({
					url: '/pages/home/level/home/home'
				})
			}
			
			uni.onTabBarMidButtonTap(()=>{
				console.log("点击了中间按钮，跳转到扫码页面")
				// 跳转到扫码页面（tabBar 页面需要使用 switchTab）
				uni.scanCode({
					scanType: ['barCode', 'qrCode'],
					success: (res) => {
						console.log('条码类型：' + res.scanType);
						console.log('条码内容：' + res.result);
						// 这里可以根据扫码结果更新页面数据
						// 例如：this.shebei = res.result;
						uni.showToast({
						title: '扫码成功',
						icon: 'success'
						});
					},
					fail: (err) => {
						console.error('扫码失败:', err);
						// 扫码失败时不显示错误提示，避免影响用户体验
						// 如果用户主动取消扫码，不需要提示
						if (err.errMsg && !err.errMsg.includes('cancel')) {
						uni.showToast({
							title: '扫码失败',
							icon: 'none'
						});
						}
					}
					});
			})
			
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
