<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd"
           ref="progressBtn">
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {prefixStyle} from 'common/js/dom'

  // 常量数据来自css预设
  const PROGRESS_BTN_WIDTH = 16
  const transform = prefixStyle('transform')

  export default {
    props: {
      percent: {type: Number, default: 0}
    }, // props
    created() {
      this.touch = {} // touch事件公用的参数
    }, // created
    methods: {
      progressClick(e) {
        const rect = this.$refs.progressBar.getBoundingClientRect()
        const offsetWidth = e.pageX - rect.left
        this._offset(offsetWidth)
        // 点击progressBtn的时候,e.offsetX获取出错,用上面方法替代
        // this._offset(e.offsetX)
        this._triggerPercent()
      }, // progressClick
      progressTouchStart(e) {
        this.touch.initiated = true // 已经初始化
        this.touch.startX = e.touches[0].pageX
        this.touch.left = this.$refs.progress.clientWidth // 进度条当前偏移
      }, // progressTouchStart
      progressTouchMove(e) {
        if (!this.touch.initiated) return
        const deltaX = e.touches[0].pageX - this.touch.startX
        const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - PROGRESS_BTN_WIDTH, Math.max(0, this.touch.left + deltaX))
        this._offset(offsetWidth)
      }, // progressTouchMove
      progressTouchEnd() {
        this.touch.initiated = false
        this._triggerPercent()
      }, // progressTouchEnd
      _triggerPercent() {
        const barWidth = this.$refs.progressBar.clientWidth - PROGRESS_BTN_WIDTH
        const percent = this.$refs.progress.clientWidth / barWidth
        this.$emit('percentChange', percent)
      }, // _triggerPercent
      _offset(offsetWidth) {
        this.$refs.progress.style.width = `${offsetWidth}px`
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      } // _offset
    }, // methods
    watch: {
      percent(newVal) {
        if (newVal >= 0 && !this.touch.initiated) {
          const barWidth = this.$refs.progressBar.clientWidth - PROGRESS_BTN_WIDTH
          const offsetWidth = newVal * barWidth
          this._offset(offsetWidth)
        }
      } // percent
    } // watch
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
