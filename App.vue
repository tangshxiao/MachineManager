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
									// 显示更新对话框前，按 uni-app 官方方式处理权限（如通知权限）
									this.ensureUpdatePermission(() => {
										this.showUpdateModal(serverData);
									});
								}
							}
						},
						fail: (err) => {
							console.error('检查更新请求失败', err);
						}
					});
				});
			},

			/**
			 * 显示更新弹窗前按 uni-app 官方方式处理权限（如 Android 13+ 通知权限）
			 * 使用 uni.getAppAuthorizeSetting() 查询、uni.openAppAuthorizeSetting() 打开设置
			 * @param {Function} callback 权限处理完成后执行，用于显示更新对话框
			 */
			ensureUpdatePermission(callback) {
				// #ifdef APP-PLUS
				const systemInfo = uni.getSystemInfoSync();
				if (systemInfo.platform !== 'android') {
					callback();
					return;
				}
				try {
					// uni-app 官方 API：获取应用授权设置（HBuilderX 3.5.3+）
					const setting = uni.getAppAuthorizeSetting();
					// Android 13+ 通知权限：未授权时引导用户去设置页
					const needNotify = setting.notificationAuthorized === 'denied' || setting.notificationAuthorized === false;
					if (needNotify) {
						uni.showModal({
							title: '权限说明',
							content: '为在后台下载更新时及时提醒您，请开启通知权限。是否前往设置？',
							confirmText: '去设置',
							cancelText: '暂不',
							success: (res) => {
								if (res.confirm) {
									// uni-app 官方 API：打开应用权限设置页
									uni.openAppAuthorizeSetting();
									// 去设置后不自动弹出更新框，下次启动再检查
								} else {
									callback();
								}
							},
							fail: () => { callback(); }
						});
						return;
					}
				} catch (e) {
					console.warn('ensureUpdatePermission:', e);
				}
				// #endif
				callback();
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

				const waiting = plus.nativeUI.showWaiting("准备下载...", {
				        back: "none" 
				    });

				const downloadTask = uni.downloadFile({
					url: url,
					success: (downloadRes) => {
						waiting.close();
						uni.hideLoading();
						if (downloadRes.statusCode === 200) {
							console.log('下载成功，准备安装，本地apk路径为：', downloadRes.tempFilePath);
							plus.runtime.install(downloadRes.tempFilePath, { force: false }, () => {
								plus.runtime.restart();
							}, (e) => {
								console.error('安装失败', e);
								let msg = '';
								if (e && (e.message || e.code)) {
									msg = e.message || ('错误码：' + e.code);
								} else {
									msg = '请卸载旧版本后重试';
								}
								uni.showToast({
									title: '安装失败：' + msg,
									icon: 'none',
									duration: 4000
								});
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

				let lastProgress = 0;
				
				    downloadTask.onProgressUpdate((res) => {
		
				        if (res.progress > lastProgress) {
				            lastProgress = res.progress;
							
				            waiting.setTitle(`已下载 ${res.progress}%`);
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