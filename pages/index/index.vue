<template>
  <view class="container">
    <!-- 标题区域 -->
    <view class="header">
      <text class="title">选择项目</text>
    </view>
    
    <!-- 项目列表区域，需要添加底部内边距给浮动按钮留出空间 -->
    <view class="content-area">
      <radio-group 
        @change="handleRadioChange"
        class="project-list"
      >
        <view 
          v-for="(project, index) in projects" 
          :key="index" 
          class="project-item"
        >
          <label class="radio-wrapper">
            <radio 
              :value="project.id" 
              :checked="selectedProject === project.id"
              color="#007AFF"
            />
            <text class="project-name">{{ project.name }}</text>
          </label>
          <text class="project-description">{{ project.description }}</text>
        </view>
      </radio-group>
      
      <!-- 如果没有项目数据时显示提示 -->
      <view class="empty-tip" v-if="projects.length === 0">
        <text>暂无项目数据</text>
      </view>
    </view>
    
    <!-- 固定在底部的浮动按钮区域 -->
    <view class="floating-footer">
      <!-- 浮动按钮 -->
      <button 
        class="load-btn" 
        @click="loadProjectData"
        :disabled="loading"
      >
        <!-- 按钮加载状态 -->
        <view class="btn-content">
          <text v-if="loading" class="btn-text">加载中...</text>
          <text v-else class="btn-text">加载项目数据</text>
          <view class="btn-icon" v-if="!loading">↓</view>
        </view>
      </button>
      
      <!-- 已选项目信息 -->
      <view class="selected-info" v-if="selectedProject">
        <text>已选项目: {{ getSelectedProjectName() }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      selectedProject: '',
      loading: false,
      projects: [
        { id: '1', name: '地铁18号线延伸工程', description: '线路全长25.3公里，设站15座' },
        { id: '2', name: '地铁18号线延伸工程', description: '二期规划，连接机场与市中心' },
        { id: '3', name: '地铁18号线延伸工程', description: '北延伸段，服务北部新城' },
        { id: '4', name: '地铁18号线延伸工程', description: '南延伸段，连接高铁站' },
        { id: '5', name: '地铁18号线延伸工程', description: '东延伸段，贯穿商务区' },
        { id: '6', name: '地铁18号线延伸工程', description: '西延伸段，服务科技园区' },
        { id: '7', name: '地铁18号线延伸工程', description: '支线工程，连接卫星城' },
        { id: '8', name: '地铁18号线延伸工程', description: '延长线，增加换乘站' }
      ]
    }
  },
  methods: {
    handleRadioChange(e) {
      this.selectedProject = e.detail.value
      console.log('选中的项目ID:', this.selectedProject)
      
      const selected = this.projects.find(p => p.id === this.selectedProject)
      if (selected) {
        uni.showToast({
          title: `已选择: ${selected.name}`,
          icon: 'none'
        })
      }
    },
    
    loadProjectData() {
      if (this.loading) return
      
      this.loading = true
      
      // 模拟加载数据
      setTimeout(() => {
        uni.showToast({
          title: '项目数据加载完成',
          icon: 'success'
        })
        
        this.loading = false
      }, 1500)
    },
    
    // 获取选中的项目名称
    getSelectedProjectName() {
      const selected = this.projects.find(p => p.id === this.selectedProject)
      return selected ? selected.name : ''
    }
  }
}
</script>

<style>
.container {
  padding: 30rpx;
  background-color: #f8f8f8;
  min-height: 100vh;
  /* 添加底部内边距，为浮动按钮留出空间 */
  padding-bottom: 160rpx;
  box-sizing: border-box;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
  padding: 30rpx 0;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.title {
  font-size: 44rpx;
  font-weight: bold;
  color: #333;
}

/* 内容区域 */
.content-area {
  margin-bottom: 20rpx;
}

.project-list {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.project-item {
  padding: 32rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.project-item:last-child {
  border-bottom: none;
}

.radio-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.radio-wrapper radio {
  margin-right: 24rpx;
}

.project-name {
  font-size: 36rpx;
  color: #333;
  font-weight: 500;
}

.project-description {
  font-size: 28rpx;
  color: #666;
  margin-left: 68rpx;
  display: block;
  line-height: 1.5;
}

/* 空数据提示 */
.empty-tip {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 32rpx;
}

/* 浮动底部区域 */
.floating-footer {
  /* 固定定位，始终停留在页面底部 */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  /* 内边距 */
  padding: 30rpx;
  /* 背景颜色 */
  background-color: #fff;
  /* 阴影效果，增加层次感 */
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
  /* 圆角，只在上方显示 */
  border-radius: 24rpx 24rpx 0 0;
  /* 确保在内容上方 */
  z-index: 100;
}

/* 加载按钮样式 */
.load-btn {
  background-color: #007AFF;
  color: white;
  border: none;
  border-radius: 12rpx;
  padding: 28rpx 0;
  font-size: 36rpx;
  margin-bottom: 20rpx;
  /* 添加过渡效果 */
  transition: all 0.3s;
}

/* 按钮悬停效果 */
.load-btn:active {
  background-color: #0056cc;
  transform: scale(0.98);
}

.load-btn:disabled {
  background-color: #ccc;
  opacity: 0.7;
  transform: none;
}

/* 按钮内容容器 */
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

/* 按钮图标 */
.btn-icon {
  color: white;
  font-size: 36rpx;
  font-weight: bold;
}

/* 已选项目信息 */
.selected-info {
  text-align: center;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
}

.selected-info text {
  font-size: 32rpx;
  color: #007AFF;
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 750rpx) {
  .container {
    padding: 20rpx;
    padding-bottom: 160rpx;
  }
  
  .project-item {
    padding: 24rpx;
  }
  
  .project-name {
    font-size: 32rpx;
  }
  
  .project-description {
    font-size: 26rpx;
  }
  
  .floating-footer {
    padding: 20rpx;
  }
  
  .load-btn {
    padding: 24rpx 0;
    font-size: 32rpx;
  }
  
  .btn-text {
    font-size: 32rpx;
  }
  
  .btn-icon {
    font-size: 32rpx;
  }
}

/* 针对不同屏幕高度的适配 */
@media (max-height: 600px) {
  /* 在小高度屏幕上减少一些内边距 */
  .container {
    padding-bottom: 140rpx;
  }
  
  .floating-footer {
    padding: 20rpx;
  }
}
</style>