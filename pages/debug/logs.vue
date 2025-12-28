<template>
  <view class="logs-container">
    <view class="header">
      <text class="title">网络请求日志</text>
      <view class="actions">
        <button class="btn" @click="refreshLogs" size="mini">刷新</button>
        <button class="btn" @click="clearLogs" size="mini">清除</button>
        <button class="btn" @click="exportLogs" size="mini">导出</button>
      </view>
    </view>
    
    <view class="stats">
      <text>共 {{ logs.length }} 条日志</text>
    </view>
    
    <scroll-view scroll-y class="logs-list">
      <view v-if="logs.length === 0" class="empty">
        <text>暂无日志</text>
      </view>
      
      <view v-for="(log, index) in logs" :key="log.id" class="log-item">
        <view class="log-header">
          <text class="log-index">#{{ logs.length - index }}</text>
          <text class="log-time">{{ log.timestamp }}</text>
          <text class="log-type" :class="'type-' + log.type">{{ getTypeText(log.type) }}</text>
        </view>
        
        <view v-if="log.type === 'request'" class="log-content">
          <view class="log-row">
            <text class="label">URL:</text>
            <text class="value">{{ log.url }}</text>
          </view>
          <view class="log-row">
            <text class="label">方法:</text>
            <text class="value">{{ log.method }}</text>
          </view>
          <view class="log-row" v-if="log.requestHeader">
            <text class="label">请求头:</text>
            <text class="value json">{{ formatJSON(log.requestHeader) }}</text>
          </view>
          <view class="log-row" v-if="log.requestData">
            <text class="label">请求数据:</text>
            <text class="value json">{{ log.requestData }}</text>
          </view>
        </view>
        
        <view v-else-if="log.type === 'response'" class="log-content">
          <view class="log-row" v-if="log.url">
            <text class="label">URL:</text>
            <text class="value">{{ log.url }}</text>
          </view>
          <view class="log-row">
            <text class="label">状态码:</text>
            <text class="value" :class="log.statusCode === 200 ? 'success' : 'error'">{{ log.statusCode }}</text>
          </view>
          <view class="log-row" v-if="log.duration">
            <text class="label">耗时:</text>
            <text class="value">{{ log.duration }}</text>
          </view>
          <view class="log-row" v-if="log.responseHeader">
            <text class="label">响应头:</text>
            <text class="value json">{{ formatJSON(log.responseHeader) }}</text>
          </view>
          <view class="log-row" v-if="log.responseData">
            <text class="label">响应数据:</text>
            <text class="value json">{{ log.responseData }}</text>
          </view>
        </view>
        
        <view v-else-if="log.type === 'error'" class="log-content">
          <view class="log-row" v-if="log.url">
            <text class="label">URL:</text>
            <text class="value">{{ log.url }}</text>
          </view>
          <view class="log-row">
            <text class="label">错误:</text>
            <text class="value error">{{ log.error }}</text>
          </view>
          <view class="log-row" v-if="log.duration">
            <text class="label">耗时:</text>
            <text class="value">{{ log.duration }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import logger from '@/utils/logger.js'

export default {
  data() {
    return {
      logs: []
    }
  },
  onLoad() {
    this.refreshLogs()
  },
  onShow() {
    // 每次显示页面时刷新日志
    this.refreshLogs()
  },
  methods: {
    refreshLogs() {
      this.logs = logger.getLogs().reverse() // 最新的在前
    },
    clearLogs() {
      uni.showModal({
        title: '确认清除',
        content: '确定要清除所有日志吗？',
        success: (res) => {
          if (res.confirm) {
            logger.clearLogs()
            this.logs = []
            uni.showToast({
              title: '日志已清除',
              icon: 'success'
            })
          }
        }
      })
    },
    exportLogs() {
      logger.saveLogsToFile()
    },
    getTypeText(type) {
      const map = {
        'request': '请求',
        'response': '响应',
        'error': '错误'
      }
      return map[type] || type
    },
    formatJSON(obj) {
      try {
        return JSON.stringify(obj, null, 2)
      } catch (e) {
        return String(obj)
      }
    }
  }
}
</script>

<style>
.logs-container {
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #004CA2;
  color: white;
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
}

.actions {
  display: flex;
  gap: 10rpx;
}

.btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 8rpx 20rpx;
  font-size: 24rpx;
}

.stats {
  padding: 20rpx;
  background-color: white;
  font-size: 28rpx;
  color: #666;
}

.logs-list {
  flex: 1;
  padding: 20rpx;
}

.empty {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}

.log-item {
  background-color: white;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.log-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #eee;
  margin-bottom: 15rpx;
}

.log-index {
  font-weight: bold;
  color: #004CA2;
  font-size: 28rpx;
}

.log-time {
  flex: 1;
  color: #666;
  font-size: 24rpx;
}

.log-type {
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  font-size: 22rpx;
  color: white;
}

.type-request {
  background-color: #1890ff;
}

.type-response {
  background-color: #52c41a;
}

.type-error {
  background-color: #ff4d4f;
}

.log-content {
  font-size: 26rpx;
}

.log-row {
  margin-bottom: 15rpx;
  word-break: break-all;
}

.log-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #999;
  margin-right: 10rpx;
  font-weight: 500;
}

.value {
  color: #333;
}

.value.json {
  display: block;
  margin-top: 8rpx;
  padding: 10rpx;
  background-color: #f5f5f5;
  border-radius: 6rpx;
  font-family: monospace;
  font-size: 24rpx;
  white-space: pre-wrap;
  word-break: break-all;
}

.value.success {
  color: #52c41a;
  font-weight: bold;
}

.value.error {
  color: #ff4d4f;
  font-weight: bold;
}
</style>

