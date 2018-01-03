import 'babel-polyfill' // 辅助编译 ES6 源码
import Vue from 'vue'
import App from './App'
// import router from './router'
import fastclick from 'fastclick' // 解决移动端 300ms 延迟

import 'common/stylus/index.styl'
// 将 fastclick 挂载到 body 上
fastclick.attach(document.body)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
