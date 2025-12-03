<template>
  <view class="container">
    <view class="content-area">
      <view class="project-list">
        <view 
          v-for="(project, index) in projects" 
          :key="index" 
          class="project-item" 
          @tap="toggleSelect(project.id)">
          <view class="radio-wrapper">
            <text class="project-name">{{ project.name }}</text>

            <view class="circle-checkbox" :class="{ active: selected.includes(project.id) }">
              <text class="checkmark" v-if="selected.includes(project.id)">✓</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="floating-footer">
      <button class="load-btn">
        <view class="btn-content">
          <text class="btn-text">加载项目数据</text>
        </view>
      </button>
    </view>
  </view>
</template>



<script>
export default {
  data() {
    return {
      selected: [],   // 多选保存数组
      loading: false,
      projects: [
        { id: '1', name: '地铁18号线延伸工程' },
        { id: '2', name: '地铁18号线延伸工程'},
        { id: '3', name: '地铁18号线延伸工程' },
        { id: '4', name: '地铁18号线延伸工程' },
        { id: '5', name: '地铁18号线延伸工程'},
        { id: '6', name: '地铁18号线延伸工程' },
        { id: '7', name: '地铁18号线延伸工程' },
        { id: '8', name: '地铁18号线延伸工程' },
		{ id: '9', name: '地铁18号线延伸工程' },
		{ id: '10', name: '地铁18号线延伸工程' },
		{ id: '11', name: '地铁18号线延伸工程' },
		{ id: '12', name: '地铁18号线延伸工程' },
		{ id: '13', name: '地铁18号线延伸工程' },
		{ id: '14', name: '地铁18号线延伸工程' },
      ]
    }
  },

  methods: {
    toggleSelect(id) {
      const index = this.selected.indexOf(id)
      if (index > -1) {
        // 已选中 → 取消
        this.selected.splice(index, 1)
      } else {
        // 未选中 → 添加
        this.selected.push(id)
      }
    },
<<<<<<< Updated upstream
=======
    
    loadProjectData() {
      // if (this.loading) return
      
      // this.loading = true
      
      // // 模拟加载数据
      // setTimeout(() => {
      //   uni.showToast({
      //     title: '项目数据加载完成',
      //     icon: 'success'
      //   })
        
      //   this.loading = false
      // }, 1500)
	  // 调起条码扫描
	  uni.scanCode({
	  	scanType: ['barCode'],
	  	success: function (res) {
	  		console.log('条码类型：' + res.scanType);
	  		console.log('条码内容：' + res.result);
	  	}
	  });
    },
    
    // 获取选中的项目名称
    getSelectedProjectName() {
      const selected = this.projects.find(p => p.id === this.selectedProject)
      return selected ? selected.name : ''
    }
>>>>>>> Stashed changes
  }
}
</script>

<style>
.container {
  padding: 10rpx;
  background-color: #F5F8FC;
  min-height: 100vh;
  padding-bottom: 160rpx;
  box-sizing: border-box;
}

.content-area {
  margin-bottom: 100rpx;
}

.project-list {
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.project-item {
  padding: 5rpx;
  background-color: #FFFFFF;
  border-radius: 8rpx;
  margin: 20rpx 0;
}

.radio-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 11rpx;
  margin-bottom: 10rpx;
}

.project-name {
  font-size: 36rpx;
  color: #333;
  font-weight: 500;
}

/* 圆形多选框 */
.circle-checkbox {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 4rpx solid #D1D2D7;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 选中时填充颜色 */
.circle-checkbox.active {
  background-color: #004CA2;
  border-color: #004CA2;
}

/* 对勾样式 */
.checkmark {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: bold;
  margin-top: -4rpx;
}

.floating-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30rpx;
  background-color: #FFFFFF;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
  border-radius: 24rpx 24rpx 0 0;
  z-index: 100;
}

.load-btn {
  background-color: #004CA2;
  color: white;
  border: none;
  border-radius: 99pt;
  padding: 28rpx 0;
  font-size: 36rpx;
  margin-bottom: 20rpx;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-text {
  color: white;
  font-size: 36rpx;
  margin-right: 10rpx;
}
</style>
