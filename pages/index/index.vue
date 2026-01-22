<template>
  <view class="container">
    <view class="content-area">
      <view class="project-list">
        <view 
          v-for="(project, index) in projects" 
          :key="index" 
          class="project-item" 
          @tap="toggleSelect(project.id)">
          <view class="radio-wrapper" >
            <text class="project-name">{{ project.name }}</text>

            <view class="circle-checkbox" :class="{ active: selected.includes(project.id) }">
              <text class="checkmark" v-if="selected.includes(project.id)">✓</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view  class="floating-footer">
      <button @click="goNext" class="load-btn" :disabled="!selected.length" style="height: 90rpx;">
        <view class="btn-content">
          <text class="btn-text">加载项目数据</text>
        </view>
      </button>
    </view>
  </view>
</template>

<script>
import api from '../../services/api.js'

export default {
  onLoad() {
    const selectedProjectIds = uni.getStorageSync('selectedProjectIds')
    if (selectedProjectIds) {
      console.log('检测到已选择项目，自动跳转到首页')
      uni.switchTab({
        url: '/pages/home/level/home/home'
      })
      return
    }
    this.sweep()
  },
  data() {
    return {
      selected: [],
      loading: false,

      projects: [],
      pageNum: 1,
      pageSize: 10,
      hasMore: true
    }
  },

  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.loadProjectList(false)
    }
  },

  methods: {
    toggleSelect(id) {
      const index = this.selected.indexOf(id)
      if (index > -1) {
        this.selected.splice(index, 1)
      } else {
        this.selected.push(id)
      }
    },

    async sweep() {
      if (this.loading) return
      this.loading = true
      try {
        const loginData = await api.login()

        console.log('登录成功，返回数据:', loginData)

        if (loginData && loginData.token) {
          uni.setStorageSync('token', loginData.token)
        }

        await this.loadProjectList(true)

      } catch (err) {
        console.error('登录或加载项目列表失败:', err)
        if (err.code === -2) {
             uni.showModal({
                 title: '设备未注册',
                 content: '请联系管理员添加此设备ID到数据库',
                 showCancel: false
             })
        } else {
            uni.showToast({
              title: (err.msg || '登录失败'),
              icon: 'none'
            })
        }
      } finally {
        this.loading = false
      }
    },

    goNext() {
      if (!this.selected.length) return
      const ids = this.selected.join(',')

      uni.setStorageSync('selectedProjectIds', ids)
      uni.switchTab({
        url: '/pages/home/level/home/home'
      })
    },


    async loadProjectList(reset = false) {
      try {
        const nextPage = reset ? 1 : this.pageNum + 1

        const res = await api.fetchProjectList(nextPage, this.pageSize)

        const records = (res && res.records) || []

        if (reset) {
          this.projects = records
        } else {
          this.projects = this.projects.concat(records)
        }

        this.pageNum = res.current || nextPage
        this.total = res.total || this.projects.length
        this.size = res.size || this.pageSize
        this.hasMore = this.projects.length < this.total && records.length >= this.size
      } catch (e) {
        console.error('加载项目列表失败:', e)
        uni.showToast({
          title: '加载列表失败',
          icon: 'none'
        })
      }
    },

    getSelectedProjectName() {
      const selected = this.projects.find(p => p.id === this.selectedProject)
      return selected ? selected.name : ''
    }
  }
} 
</script>

<style>
/* 样式保持不变 */
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
  margin-top: 20rpx;
  margin-left: 24rpx;
  margin-right: 24rpx;
}

.radio-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 11rpx;
  margin-bottom: 10rpx;
  padding: 8rpx;

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
  height: 90rpx;
  padding: 0;
  font-size: 36rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.load-btn[disabled] {
  background-color: #999999;
  color: #666666;
  opacity: 1;
}

.load-btn[disabled] .btn-text {
  color: #666666;
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