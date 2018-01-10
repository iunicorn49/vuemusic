<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span class="dot" v-for="(item, index) in dots" :class="{active: currentPageIndex === index}"></span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  // 使用的一个第三方库,需要基于这个构建轮播图组件
  import BScroll from 'better-scroll'
  import {addClass} from 'common/js/dom'
  export default {
    // 自己定义属性
    props: {
      loop: { // 无限循环
        type: Boolean,
        default: true
      },
      autoPlay: { // 自动轮播
        type: Boolean,
        default: true
      },
      interval: { // 轮播间隔
        type: Number,
        default: 1000
      }
    },
    data() {
      return {
        dots: [],
        currentPageIndex: 0
      }
    },
    mounted() { // mounted钩子下才能获取dom元素
      setTimeout(() => {
        this._setSliderWidth()
        this._initDots()
        this._initSlider()
        if (this.autoPlay) {
          this._play()
        }
        window.addEventListener('resize', () => { // 监听窗口改变
          if (!this.slider) return
          this._setSliderWidth(true)
          this.slider.refresh() // better-scroll的接口
        })
      }, 20) // 浏览器会每17毫秒刷新一次
    },
    methods: {
      _setSliderWidth(isResize) {
        // 获取所有列表的元素,sliderGroup是一个dom对象
        this.children = this.$refs.sliderGroup.children
        let width = 0
        // 获取单张banner的宽度
        let sliderWidth = this.$refs.slider.clientWidth
        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i]
          addClass(child, 'slider-item')
          child.style.width = sliderWidth + 'px'
          width += sliderWidth
        }
        if (this.loop && !isResize) {
          width += 2 * sliderWidth
        }
        this.$refs.sliderGroup.style.width = width + 'px'
      },
      //  轮播图,小点点
      _initDots() {
        //  这种方法可以建立一个长度为 this.children.length 的空数组
        this.dots = new Array(this.children.length)
      },
      //  初始化轮播图,里面的配置参考 better-scroll 的文档
      _initSlider() {
        // this.$refs.slider:获取dom对象
        this.slider = new BScroll(this.$refs.slider, {
          scrollX: true,
          scrollY: false,
          momentum: false,
          snap: {
            loop: this.loop,
            threshold: 0.3,
            speed: 400
          }
        })
        //  better-scroll 自带的事件
        this.slider.on('scrollEnd', () => {
          // 获取当前元素在父容器中是第几个子元素
          let pageIndex = this.slider.getCurrentPage().pageX
          this.currentPageIndex = pageIndex
          if (this.autoPlay) {
            this._play()
          }
        })
      },
      // 自动轮播,其中所有的方法都属于 better-scroll
      _play() {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.slider.next()
        }, this.interval)
      }
    },
    destroyed() {
      // 当组件被销毁的时候,清掉所有定时器释放内存
      clearTimeout(this.timer)
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      transform: translateZ(1px)
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
