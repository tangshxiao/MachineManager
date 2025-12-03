<template>
    <!-- 自定义 Tabbar 容器 -->
    <view class="custom-tabbar">
        <!-- 遍历 tabList 生成 Tabbar 项 -->
        <view 
            v-for="(item, index) in tabList" 
            :key="index" 
            class="tabbar-item" 
            :class="{'tabbar-item-active': current === index}" 
            @click="switchTab(item.pagePath)"
        >
            <!-- 使用 Vant UI 的图标组件 -->
            <van-icon 
                :name="current === index ? item.selectedIcon : item.icon" 
                class="tabbar-icon" 
                :class="{'tabbar-icon-active': current === index}" 
            />
            <text>{{ item.text }}</text>
        </view>
    </view>
</template>

<script>
// 定义路由映射关系，用于快速查找当前页面对应的索引
const TAB_ROUTES = {
    '/pages/index/index': 0,
    '/pages/detail/detail': 1,
    '/pages/course/course': 2,  
    '/pages/profile/profile': 3
};

export default {
    data() {
        return {
            current: 0,  // 当前选中的 tab 索引
            tabList: [
                {
                    pagePath: '/pages/index/index',
                    text: '首页',
                    icon: 'home-o',
                    selectedIcon: 'home-o'
                },
                {
                    pagePath: '/pages/detail/detail',
                    text: '详情',
                    icon: 'records',
                    selectedIcon: 'records'
                },
                {
                    pagePath: '/pages/course/course',  
                    text: '课程',
                    icon: 'clock-o',
                    selectedIcon: 'clock-o'
                },
                {
                    pagePath: '/pages/profile/profile',
                    text: '我的',
                    icon: 'contact',
                    selectedIcon: 'contact'
                }
            ]
        }
    },
    methods: {
        // 切换 tab 的方法
        switchTab(url) {
            uni.switchTab({ url });
        }
    },
    watch: {
        // 监听路由变化，更新当前选中的 tab
        '$route.path': {
            immediate: true,
            handler(path) {
                this.current = TAB_ROUTES[path] || 0;
            }
        }
    }
}
</script>

<style>
/* Tabbar 容器样式 */
.custom-tabbar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 110rpx;
    display: flex;
    justify-content: space-around;
    align-items: center;
    background-color: #fff;
    border-top: 1rpx solid #e2e8f0;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    z-index: 9999;
    padding-bottom: env(safe-area-inset-bottom);  /* 适配全面屏 */
}

/* Tabbar 项基础样式 */
.tabbar-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    color: #64748b;
    padding: 10rpx 0;
    transition: all 0.2s ease;
    position: relative;
}

/* 激活状态样式 */
.tabbar-item-active {
    color: #3b82f6;
    font-weight: 600;
}

/* 点击效果 */
.tabbar-item:active {
    transform: scale(0.95);
}

/* 图标样式 */
:deep(.tabbar-icon) {
    font-size: 48rpx !important;
    margin-bottom: 4rpx;
}

/* 激活状态图标样式 */
:deep(.tabbar-icon-active) {
    color: #3b82f6 !important;
}

/* 文字样式 */
.tabbar-item text {
    margin-top: 6rpx;
    font-weight: 500;
}

/* 底部指示条 */
.tabbar-item-active:before {
    content: '';
    position: absolute;
    bottom: -10rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 16rpx;
    height: 3px;
    background: #3b82f6;
    border-radius: 3px;
}
</style>
