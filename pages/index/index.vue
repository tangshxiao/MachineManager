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

    <view  class="floating-footer">
      <button @click="sweep" class="load-btn">
        <view class="btn-content">
          <text class="btn-text">加载项目数据</text>
        </view>
      </button>
    </view>
  </view>
</template>



<script>
import http from '../../utils/request.js'
import API_ENDPOINTS from '../../config/api.js'

export default {
  data() {
    return {
      selected: [],   // 多选保存数组
      loading: false,
      // 项目列表与分页
      projects: [],
      pageNum: 1,
      pageSize: 10,
      hasMore: true
    }
  },

  // 下拉加载更多
  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.loadProjectList(false)
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

    // 登录并加载第一页项目列表
    async sweep() {
      if (this.loading) return
      this.loading = true
      try {
        // 1. 登录，获取 token（账号密码写死）
        const loginData = await http.post(API_ENDPOINTS.LOGIN_API, {
          username: 'test',
          password: '123456'
        })

        if (loginData && loginData.token) {
          uni.setStorageSync('token', loginData.token)
        }

      

        // 2. 登录成功后，请求项目列表第一页
        await this.loadProjectList(true)
        // uni.showToast({
        //         title: '登录成功',
        //         icon: 'success'
        //       })
        // // 3. 获取列表后再跳转
        //uni.navigateTo({
          //url: '/pages/home/level/MainContainer',
        // })
      } catch (err) {
        console.error('登录或加载项目列表失败:', err)
        uni.showToast({
          title: '登录或加载列表失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    // 加载项目列表，支持分页
    async loadProjectList(reset = false) {
      try {
        const nextPage = reset ? 1 : this.pageNum + 1
        const res = await http.post(API_ENDPOINTS.PROJECT_LIST_API, {
          current: nextPage,
          size: this.pageSize
        })

        // res 是 data，对象里有 records/total/size/current/pages
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
