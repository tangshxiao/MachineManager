<script>
	import API_ENDPOINTS from '@/config/api.js';

	export default {
		onLaunch: function() {
			console.log('App Launch')

			// #ifdef APP-PLUS
			this.checkUpdate();
			// #endif


			const selectedProjectIds = uni.getStorageSync('selectedProjectIds')
			if (selectedProjectIds) {
				console.log('检测到已选择项目，自动跳转到首页')
				uni.switchTab({
					url: '/pages/home/level/home/home'
				})
			}

			uni.onTabBarMidButtonTap(() => {
				console.log("点击了中间按钮，跳转到扫码页面")
				uni.scanCode({
					scanType: ['barCode', 'qrCode'],
					success: (res) => {
						console.log('条码内容：' + res.result);
						uni.showToast({ title: '扫码成功', icon: 'success' });
						uni.navigateTo({
							url: '/pages/home/level/UploadData?result=' + encodeURIComponent(res.result)
						});
					},
					fail: (err) => {
						console.error('扫码失败:', err);
						if (err.errMsg && !err.errMsg.includes('cancel')) {
							uni.showToast({ title: '扫码失败', icon: 'none' });
						}
					}
				});
			})
		},
		onShow: function() { console.log('App Show') },
		onHide: function() { console.log('App Hide') },

		methods: {
			checkUpdate() {
				plus.runtime.getProperty(plus.runtime.appid, (widgetInfo) => {
					const currentVersion = widgetInfo.version ? widgetInfo.version.trim() : '1.0.0';
					console.log('当前App版本:', currentVersion);

					const systemInfo = uni.getSystemInfoSync();
					let platformType = systemInfo.platform === 'ios' ? 1 : 0;

					uni.request({
						url: API_ENDPOINTS.APP_UPDATE_API,
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

							if (res.statusCode === 200 && res.data.data) {
								const serverData = res.data.data;
								const serverVersion = serverData.version;

								if (serverVersion && this.compareVersion(serverVersion, currentVersion)) {
									this.showUpdateModal(serverData);
								}
							}
						},
						fail: (err) => {
							console.error('检查更新请求失败', err);
						}
					});
				});
			},

			showUpdateModal(serverData) {
				const isForceUpdate = serverData.type === 1;
				const updateContent = serverData.remark || '检测到新版本，请立即更新';
				const downloadUrl = serverData.url;

				uni.showModal({
					title: '发现新版本 ' + serverData.version,
					content: updateContent,
					showCancel: !isForceUpdate, 
					confirmText: '立即更新',
					cancelText: isForceUpdate ? '退出应用' : '稍后更新',
					success: (res) => {
						if (res.confirm) {
							this.doDownload(downloadUrl);
						} else {
							if (isForceUpdate) {
								plus.runtime.quit();
							}
						}
					}
				});
			},

			doDownload(url) {
				if (!url) return;

				if (uni.getSystemInfoSync().platform === 'ios') {
					plus.runtime.openURL(url);
					return;
				}

				uni.showLoading({ title: '准备下载...', mask: true });

				const downloadTask = uni.downloadFile({
					url: url,
					success: (downloadRes) => {
						uni.hideLoading();
						if (downloadRes.statusCode === 200) {
							console.log('下载成功，准备安装');
							plus.runtime.install(downloadRes.tempFilePath, { force: false }, () => {
								plus.runtime.restart();
							}, (e) => {
								console.error('安装失败', e);
								uni.showToast({ title: '安装失败', icon: 'none' });
							});
						} else {
							uni.showToast({ title: '下载失败', icon: 'none' });
						}
					},
					fail: (e) => {
						uni.hideLoading();
						console.error('下载请求失败', e);
						uni.showToast({ title: '下载失败，请检查网络', icon: 'none' });
					}
				});

				downloadTask.onProgressUpdate((res) => {
					if (res.progress > 0) {
						uni.showLoading({
							title: `已下载 ${res.progress}%`,
							mask: true
						});
					}
				});
			},

			compareVersion(v1, v2) {
				if (!v1 || !v2) return false;
				const v1Parts = v1.split('.');
				const v2Parts = v2.split('.');
				const len = Math.max(v1Parts.length, v2Parts.length);

				for (let i = 0; i < len; i++) {
					const num1 = parseInt(v1Parts[i] || 0);
					const num2 = parseInt(v2Parts[i] || 0);
					if (num1 > num2) return true;
					if (num1 < num2) return false;
				}
				return false;
			}
		}
	}
</script>