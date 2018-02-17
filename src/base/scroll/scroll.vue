<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll'
  export default {
    //  配置参考better-scroll的官方文档
    props: {
      probeType: {type: Number, default: 1}, // betterScroll配置项,滚动方式
      click: {type: Boolean, default: true}, // 是否触发点击
      data: {type: Array, default: null}, // 外部传入的数据, 用于决定组件的宽高
      listenScroll: {type: Boolean, default: false}, // 是否监听滚动坐标
      pullup: {type: Boolean, default: false}, // 上拉刷新
      beforeScroll: {type: Boolean, default: false}, // 滚动时,让input失去焦点,可以让键盘收起来
      // 当scroll组件内部组件有动画过渡时,会有100多毫秒的动画时间,如果只延迟20毫秒来重新获取高度是不行的
      // 所以,需要加一个配置项
      refreshDelay: {type: Number, default: 20}
    },
    mounted() {
      setTimeout(() => {
        this._initScroll()
      }, 20)
    },
    methods: {
      _initScroll() { // 初始化组件
        if (!this.$refs.wrapper) {
          return
        }
        this.scroll = new BScroll(this.$refs.wrapper, {
          probeType: this.probeType,
          click: this.click
        })
        if (this.listenScroll) {
          let me = this // 保留vue实例的this
          // 这个貌似是原生scroll的事件
          this.scroll.on('scroll', pos => {
            // 向外面派发事件
            me.$emit('scroll', pos)
          })
        }
        if (this.pullup) {
          this.scroll.on('scrollEnd', () => {
            if (this.scroll.y <= this.scroll.maxScrollY + 50) {
              this.$emit('scrollToEnd') // 满足条件,向外面派发事件.
            }
          })
        }
        if (this.beforeScroll) {
          this.scroll.on('beforeScrollStart', () => {
            this.$emit('beforeScroll')
          })
        }
      },
      // 下面的方法都是从better-scroll实例的原型上调用的
      enable() {  //  启用better-scroll,默认开启
        this.scroll && this.scroll.enable()
      },
      disable() {  //  禁用better-scroll,及其相关的dom事件
        this.scroll && this.scroll.disable()
      },
      refresh() {  //  重新计算高度
        this.scroll && this.scroll.refresh()
      },
      scrollTo() { // 滚动
        this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
      },
      scrollToElement() { // 滚动至
        this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
      }
    },
    watch: {
      data() {
        setTimeout(() => {
          this.refresh()
        }, this.refreshDelay)
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

</style>
