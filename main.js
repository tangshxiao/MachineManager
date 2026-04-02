import App from './App'

// 全局 Toast 兼容：带成功图标时长文案会被平台截断，自动降级为无图标文本提示
function patchUniShowToast() {
  if (typeof uni === 'undefined' || !uni.showToast || uni.__patchedShowToastForLongText__) return
  const originalShowToast = uni.showToast.bind(uni)
  uni.showToast = function patchedShowToast(options = {}) {
    const opts = (options && typeof options === 'object') ? { ...options } : { title: String(options || '') }
    const title = String(opts.title || '')
    const icon = opts.icon || 'success'
    const likelyTruncated = title.length > 7

    if (likelyTruncated && icon !== 'none') {
      opts.icon = 'none'
      if (!opts.duration || opts.duration < 2500) {
        opts.duration = 2500
      }
    }
    return originalShowToast(opts)
  }
  uni.__patchedShowToastForLongText__ = true
}

patchUniShowToast()

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif