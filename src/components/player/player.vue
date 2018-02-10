<template>
  <div class="player" v-show="playlist.length>0">
    <!-- vue自带的动画钩子函数 -->
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave">
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle"
             @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend="middleTouchEnd"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <!-- 当 currentLyric 有值的时候,才将line传递给组件 -->
          <Scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine"
                   class="text"
                   :class="{'current': currentLineNum === index}"
                   v-for="(line, index) in currentLyric.lines"
                >{{line.txt}}</p>
              </div>
            </div>
          </Scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active': currentShow === 'cd'}"></span>
            <span class="dot" :class="{'active': currentShow === 'lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar @percentChange="onProgressBarChange" :percent="percent"></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <div class="imgWrapper">
            <img width="40" height="40" :class="cdCls" :src="currentSong.image">
          </div>
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <!-- canplay:当这个标签准备好了之后触发
         error:当url有问题时以及出现网络问题时触发
         timpeupdate:播放进度改变时触发 -->
    <audio @canplay="ready"
           @error="error"
           @timeupdate="updateTime"
           @ended="end"
           ref="audio"
           :src="currentSong.url"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
  import {mapGetters, mapMutations} from 'vuex'
  import animations from 'create-keyframe-animation'
  import {prefixStyle} from 'common/js/dom'
  import ProgressBar from 'base/progress-bar/progress-bar'
  import ProgressCircle from 'base/progress-circle/progress-circle'
  import {playMode} from 'common/js/config'
  import {shuffle} from 'common/js/util'
  import Lyric from 'lyric-parser'
  import Scroll from 'base/scroll/scroll'

  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')

  export default {
    data() {
      return {
        songReady: false,
        currentTime: 0,
        radius: 32, // 数据来自css预设
        currentLyric: null, // 歌词
        currentLineNum: 0, // 歌词第几行
        currentShow: 'cd', // 切换歌词页面或播放器页面
        playingLyric: '' // 播放器页面的当前歌词
      }
    }, // data end
    created() {
      this.touch = {} // 用来存放左右滑动的参数,不需要进行数据绑定,所以不用添加到data中
    },
    methods: {
      back() {
        this.setFullScreen(false)
      }, // back end
      open() {
        this.setFullScreen(true)
      },
      togglePlaying() {
        if (!this.songReady) return
        this.setPlayingState(!this.playing)
        if (this.currentLyric) this.currentLyric.togglePlay() // lyric-parse 的 方法,来暂停和开始歌词的自动滚动
      }, // togglePlaying end
      end() {
        if (this.mode === playMode.loop) {
          this.loop()
        } else {
          this.next()
        }
      }, // end
      loop() {
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        if (this.currentLyric) this.currentLyric.seek(0) // lyric-parse 的 方法, 单曲循环时,重置歌词
      }, // loop
      /**
       * songReady用于节流
       */
      next() {
        if (!this.songReady) return
        if (this.playlist.length === 1) { // 当列表只有一首歌的时候
          this.loop()
        } else {
          let index = this.currentIndex + 1
          if (index === this.playlist.length) index = 0
          this.setCurrentIndex(index)
          if (!this.playing) this.setPlayingState(true)
        }
        this.songReady = false
      },
      prev() {
        if (!this.songReady) return
        if (this.playlist.length === 1) { // 当列表只有一首歌的时候
          this.loop()
        } else {
          let index = this.currentIndex - 1
          if (index === -1) index = this.playlist.length - 1
          this.setCurrentIndex(index)
          if (!this.playing) this.setPlayingState(true)
        }
        this.songReady = false
      },
      // vue自带的动画钩子
      enter(el, done) {
        const {x, y, scale} = this._getPosAndScale()
        let animation = {
          0: {transform: `translate3d(${x}px,${y}px,0) scale(${scale})`},
          60: {transform: `translate3d(0,0,0) scale(1.1)`},
          100: {transform: `translate3d(0,0,0) scale(1)`}
        }
        // create-keyframe-animation的api,详情查阅官方文档
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })
        /**
         * 参数一: 目标dom元素
         * 参数二: 执行的动画名称
         * 参数三: vue自己的动画gouzi的done回调函数
         * done函数会让动画执行完以后,进入下一个动画钩子enter=>afterEnter
         */
        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      }, // enter end
      afterEnter() {
        // 动画执行完毕后,清理所有style
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animations = ''
      }, // afterEnter end
      leave(el, done) {
        let cd = this.$refs.cdWrapper
        cd.style.transition = 'all 0.4s'
        const {x, y, scale} = this._getPosAndScale()
        cd.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
        cd.addEventListener('transitionend', done)
      }, // leave end
      afterLeave() {
        this.$refs.cdWrapper.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      }, // afterLeave end
      ready() { this.songReady = true }, // ready
      error() { this.songReady = true }, // error
      updateTime(e) {
        // e.target.currentTime:返回多媒体的播放位置,秒为单位
        this.currentTime = e.target.currentTime
      }, // updateTime
      format(interval) {
        // num|0,正数向下取整
        interval = interval | 0
        const minute = interval / 60 | 0
        const second = this._pad(interval % 60)
        return `${minute}:${second}`
      }, // format end
      onProgressBarChange(percent) {
        const currentTime = this.currentSong.duration * percent
        this.$refs.audio.currentTime = currentTime
        if (!this.playing) this.togglePlaying()
        if (this.currentLyric) {
          this.currentLyric.seek(currentTime * 1000)
        }
      }, // onProgressBarChange
      changeMode() {
        // 三种状态,余3
        const mode = (this.mode + 1) % 3
        this.setPlayMode(mode)
        let list = null
        if (mode === playMode.random) {
          list = shuffle(this.sequenceList)
        } else {
          list = this.sequenceList
        }
        this.resetCurrentIndex(list)
        this.setPlayList(list)
      }, // changeMode
      resetCurrentIndex(list) { // 找出目前正在播放的歌曲
        let index = list.findIndex(item => {
          return item.id === this.currentSong.id
        })
        this.setCurrentIndex(index)
      }, // resetCurrentIndex
      // 补零,n=2的意思是,n默认值为2
      _pad(num, n = 2) {
        let len = num.toString().length
        while (len < n) {
          num = '0' + num
          len++
        }
        return num
      }, // _pad
      _getPosAndScale() { // 获取元素初始位置
        // 下面属性的值,均来自css中的样式
        const targetWidth = 40 // 初始miniplayIMG的宽度
        const paddingLeft = 40 // 初始miniplayIMG距离左边的间隙
        const paddingBottom = 30 // 初始miniplayIMG距离底部的间隙
        const paddingTop = 80 // 最终miniplayIMG距离顶部的间隙
        const width = window.innerWidth * 0.8 // 最终miniplayIMG的宽度
        const scale = targetWidth / width // 初始缩放比例
        const x = -(window.innerWidth / 2 - paddingLeft) // 初始x坐标
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom // 初始y坐标
        return {x, y, scale}
      }, // _getPosAndScale end
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN',
        setPlayingState: 'SET_PLAYING_STATE',
        setCurrentIndex: 'SET_CURRENT_INDEX',
        setPlayMode: 'SET_PLAY_MODE',
        setPlayList: 'SET_PLAYLIST'
      }),
      getLyric() {
        this.currentSong.getLyric().then(lyric => {
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          if (this.playing) {
            this.currentLyric.play()
          }
          console.log(this.currentLyric)
        }).catch(() => { // 当获取不到歌词的情况下,执行的操作
          this.currentLyric = null
          this.playingLyric = ''
          this.currentLineNum = 0
        })
      }, // getLyric
      handleLyric({lineNum, txt}) {
        this.currentLineNum = lineNum
        if (lineNum > 5) {
          let lineEl = this.$refs.lyricLine[lineNum - 5]
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
        this.playingLyric = txt
      }, // handleLyric end
      middleTouchStart(e) { // 记录坐标
        this.touch.initiated = true // 用来标记手指已经按住屏幕
        const touched = e.touches[0]
        this.touch.startX = touched.pageX // X轴用于切换播放器和歌词页面
        this.touch.startY = touched.pageY // Y轴用于维护歌词滚动
      }, // middleTouchStart
      middleTouchMove(e) {
        if (!this.touch.initiated) return // 节流
        const touched = e.touches[0]
        const deltaX = touched.pageX - this.touch.startX
        const deltaY = touched.pageY - this.touch.startY
        if (Math.abs(deltaY) > Math.abs(deltaX)) { // 如果Y轴偏差大于X轴偏差,就判断是在操作歌词滚动
          return
        }
        // 判断当前页面是那一页,来决定左右滑动的效果
        const LEFT = this.currentShow === 'cd' ? 0 : -window.innerWidth
        // 偏移量, 0 到 屏幕的宽度
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, LEFT + deltaX))
        // 记录滑动举例与屏幕宽度的比例
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
        // lyricList绑定的是一个vue组件,不能直接访问dom,需要通过$el来访问
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.lyricList.$el.style[transitionDuration] = 0 // 取消过度时间
        this.$refs.middleL.style.opacity = 1 - this.touch.percent // 随着屏幕滑动可以淡入淡出
        this.$refs.middleL.style[transitionDuration] = 0
      }, // middleTouchMove
      middleTouchEnd(e) {
        let offsetWidth = 0 // 偏移量
        let opacity = 0
        if (this.currentShow === 'cd') { // 从右向左滑
          // 这里认为决定,滑动比例界限为10%
          if (this.touch.percent > 0.1) {
            offsetWidth = -window.innerWidth
            opacity = 0
            this.currentShow = 'lyric'
          } else {
            offsetWidth = 0
            opacity = 1
          }
        } else { // 从左向右滑
          if (this.touch.percent < 0.9) {
            offsetWidth = 0
            opacity = 1
            this.currentShow = 'cd'
          } else {
            offsetWidth = -window.innerWidth
            opacity = 0
          }
        }
        const time = 300
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.lyricList.$el.style[transitionDuration] = time + 'ms'
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style[transitionDuration] = time + 'ms'
      } // middleTouchEnd
    }, // methods end
    computed: {
      cdCls() {
        return this.playing ? 'play' : 'play pause'
      },
      playIcon() {
        return this.playing ? 'icon-pause' : 'icon-play'
      }, // playIcon end
      iconMode() {
        return this.mode === playMode.sequence
          ? 'icon-sequence'
          : this.mode === playMode.loop
          ? 'icon-loop' : 'icon-random'
      }, // iconMode
      miniIcon() {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      }, // miniIcon end
      disableCls() {
        return this.songReady ? '' : 'disable'
      }, // disableCls
      percent() {
        return this.currentTime / this.currentSong.duration
      }, // percent
      ...mapGetters([
        'playlist',
        'fullScreen',
        'currentSong',
        'playing',
        'currentIndex',
        'mode',
        'sequenceList'
      ])
    }, // computed end
    watch: {
      currentSong(newVal, val) {
        if (newVal.id === val.id) return // 在暂停时,切换播放模式时,不触发
        if (this.currentLyric) {
          this.currentLyric.stop() // lyric-parser的方法,清理内部的定时器,重新开始
        }
        setTimeout(() => { // 手机浏览器在后台是不执行js代码的,这个定时器可以保证,从后台切换前台时,里面的东西依然在播放,原理未知
          this.$refs.audio.play()
          this.getLyric()
        }, 1000)
      },
      playing(newPlaying) {
        const audio = this.$refs.audio
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause()
        })
      }
    }, // watch
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll
    }
  }
</script>


<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            box-sizing: border-box
            height: 100%
            .cd
              width: 100%
              height: 100%
              border-radius: 50%
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                box-sizing: border-box
                border-radius: 50%
                border: 10px solid rgba(255, 255, 255, 0.1)
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
            .pure-music
              padding-top: 50%
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        height: 40px
        padding: 0 10px 0 20px
        .imgWrapper
          height: 100%
          width: 100%
          img
            border-radius: 50%
            &.play
              animation: rotate 10s linear infinite
            &.pause
              animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>

