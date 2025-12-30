<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')

			// -----------------------------------------------------------
			// 1. 版本更新检查 (新增功能)
			// -----------------------------------------------------------
			// #ifdef APP-PLUS
			// 只有在 App 环境下才检查更新，H5不需要
			this.checkUpdate();
			// #endif

			// -----------------------------------------------------------
			// 2. 原有的登录跳转逻辑
			// -----------------------------------------------------------
			const selectedProjectIds = uni.getStorageSync('selectedProjectIds')
			if (selectedProjectIds) {
				console.log('检测到已选择项目，自动跳转到首页')
				uni.switchTab({
					url: '/pages/home/level/home/home'
				})
			}

			// -----------------------------------------------------------
			// 3. 原有的中间按钮扫码逻辑
			// -----------------------------------------------------------
			uni.onTabBarMidButtonTap(() => {
				console.log("点击了中间按钮，跳转到扫码页面")
				uni.scanCode({
					scanType: ['barCode', 'qrCode'],
					success: (res) => {
						console.log('条码类型：' + res.scanType);
						console.log('条码内容：' + res.result);
						
						uni.showToast({
							title: '扫码成功',
							icon: 'success'
						});

						uni.navigateTo({
							url: '/pages/home/level/UploadData?result=' + encodeURIComponent(res.result)
						});
					},
					fail: (err) => {
						console.error('扫码失败:', err);
						if (err.errMsg && !err.errMsg.includes('cancel')) {
							uni.showToast({
								title: '扫码失败',
								icon: 'none'
							});
						}
					}
				});
			})
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		
		methods: {
			/**
			 * 检查更新的核心方法
			 */
			checkUpdate() {
				// 获取当前 App 的版本信息
				plus.runtime.getProperty(plus.runtime.appid, (widgetInfo) => {
					const currentVersion = widgetInfo.version; // 当前版本号
					console.log('当前App版本:', currentVersion);
					
					const systemInfo = uni.getSystemInfoSync();
					// 判断平台：根据你的接口文档，0是安卓，1是iOS
					let platformType = 0;
					if (systemInfo.platform === 'ios') {
						platformType = 1;
					}

		
					uni.request({
						
						url: 'https://bt.dslove.fun:10000/app/last',
						method: 'POST',
						header: {
							'content-type': 'application/x-www-form-urlencoded'
						},
						data: {
							_uid: 0, 
							platform: platformType,
							version: currentVersion
						},
						success: (res) => {
							console.log('检查更新返回:', res.data);
							
							// 假设后端返回结构是 code: 200, data: { ... }
							// 请根据你实际的 HTTP 状态码调整判断，这里假设 HTTP 200 且业务 code 也是成功
							if (res.statusCode === 200 && res.data.data) {
								const serverData = res.data.data;
								const serverVersion = serverData.version;

								// 如果版本号不一样，且 serverData 有值，则弹窗
								// (这里是简单的字符串比对，如果需要更复杂的 x.y.z 比对可以优化)
								if (serverVersion && serverVersion !== currentVersion) {
									this.showUpdateModal(serverData);
								}
							}
						},
						fail: (err) => {
							console.error('检查更新请求失败，请检查网络或域名配置', err);
						}
					});
				});
			},

			/**
			 * 显示更新弹窗
			 */
			/**
			 * 显示更新弹窗（优化版）
			 */
			showUpdateModal(serverData) {
			    const isForceUpdate = serverData.type === 1; 
			    const updateContent = serverData.remark || '检测到新版本，请立即更新';
			    const downloadUrl = serverData.url;
			
			    uni.showModal({
			        title: '发现新版本 ' + serverData.version,
			        content: updateContent,
			        showCancel: !isForceUpdate, // 强制更新时隐藏取消按钮
			        confirmText: '立即更新',
			        cancelText: '退出应用', // 如果是强制更新，取消按钮（如果被显示出来）逻辑改成退出
			        success: (res) => {
			            if (res.confirm) {
			                // 用户点击确定，开始下载
			                this.doDownload(downloadUrl);
			            } else {
			                // 这里处理：用户点击了取消，或者按了安卓物理返回键关掉了弹窗
			                if (isForceUpdate) {
			                    // 🛑 核心逻辑：如果是强制更新，用户却没点更新
			                    // 方案A：直接退出 App (更狠，推荐)
			                    plus.runtime.quit();
			                    
			                    // 方案B：再次弹出，死缠烂打 (如果不希望用户退出)
			                    // this.showUpdateModal(serverData);
			                }
			            }
			        }
			    });
			},

			/**
			 * 执行下载逻辑
			 */
			doDownload(url) {
				if (!url) return;

				// iOS 处理：直接跳转浏览器或 AppStore
				if (uni.getSystemInfoSync().platform === 'ios') {
					plus.runtime.openURL(url);
					return;
				}

				// 安卓处理：下载 APK 并安装
				uni.showLoading({ title: '正在下载...' });

				const downloadTask = uni.downloadFile({
					url: url,
					success: (downloadRes) => {
						uni.hideLoading();
						if (downloadRes.statusCode === 200) {
							console.log('下载成功，准备安装');
							
							// 安装 APK
							plus.runtime.install(downloadRes.tempFilePath, {
								force: false
							}, () => {
								console.log('安装成功，重启App');
								plus.runtime.restart();
							}, (e) => {
								console.error('安装失败', e);
								uni.showToast({ title: '安装失败', icon: 'none' });
							});
						}
					},
					fail: (e) => {
						uni.hideLoading();
						console.error('下载请求失败', e);
						uni.showToast({ title: '下载失败，请检查网络', icon: 'none' });
					}
				});
				
				// (可选) 可以在这里监听进度条
				// downloadTask.onProgressUpdate((res) => { ... })
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>