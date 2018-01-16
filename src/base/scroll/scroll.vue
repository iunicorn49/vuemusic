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
      probeType: {
        type: Number,
        default: 1
      },
      click: {
        type: Boolean,
        default: true
      },
      data: {
        type: Array,
        default: null
      },
      listenScroll: {
        type: Boolean,
        default: false
      }
    },
    mounted() {
      setTimeout(() => {
        this._initScroll()
      }, 20)
    },
    methods: {
      _initScroll() {
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
            // 里面调用better-scroll事件
            me.$emit('scroll', pos)
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
        }, 20)
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

</style>
