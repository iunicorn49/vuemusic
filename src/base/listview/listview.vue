<template>
  <Scroll class="listview"
          :data="data"
          :listenScroll="listenScroll"
          :probeType="probeType"
          @scroll="scroll"
          ref="listview">
    <!-- 整体 -->
    <ul>
      <li v-for="group in data" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li @click="selectItem(item)" v-for="item in group.items" class="list-group-item">
            <img v-lazy="item.avatar" class="avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!-- 右侧快速入口 -->
    <!-- touchstart是vue调用的原生DOM事件 -->
    <!-- touchmove需要通过stop阻止事件冒泡
         否则会时底层的列表一起触发这个事件
         还需要添加prevent阻止浏览器的原生滚动 -->
    <div class="list-shortcut"
         @touchstart.stop.prevent="onShortcutTouchStart"
         @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li v-for="(item, index) in shortcutList"
            :data-index="index"
            class="item"
            :class="{current: currentIndex === index}">
          {{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>
    <div v-show="!data.length" class="loading-container">
      <Loading></Loading>
    </div>
  </Scroll>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import {getData} from 'common/js/dom'

  const ANCHOR_HEIGHT = 18 // 锚点的高度,字体大小12,行高1倍,上下padding各3,总和18
  const TITLE_HEIGHT = 30

  export default {
    created() {
      this.touch = {} // 如果不需要对dom进行绑定,可以在这里定义一个容器用来存储数据
      this.listenScroll = true // 通过v-bind将这个值绑定给scroll组件
      this.listHeight = [] // 用来存放各个锚点的y坐标
      this.probeType = 3
    }, // created end
    data() {
      return {
        scrollY: -1,
        currentIndex: 0,
        diff: -1 // fixedTitle举例顶部的间距
      }
    }, // data end
    props: {
      data: {
        type: Array,
        default: []
      }
    }, // props end
    computed: {
      fixedTitle() {
        if (this.scrollY > 0) return false
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }, // fixedTitle end
      shortcutList() { // 调整右侧快速入口列表的数据
        return this.data.map(group => {
          // 截取"热门"的第一个字:热
          return group.title.substr(0, 1)
        })
      } // shortcutList end
    }, // computed end
    methods: {
      onShortcutTouchStart(e) { // 点击右侧快速入口,使底层列表跳至对应锚点
        let anchorIndex = getData(e.target, 'index')
        let firstTouch = e.touches[0]
        this.touch.y1 = firstTouch.pageY
        this.touch.anchorIndex = anchorIndex
        this._scrollTo(anchorIndex)
      }, // onShortcutTouchStart end
      onShortcutTouchMove(e) { // 右侧快速入口列表,滑动效果
        let firstTouch = e.touches[0]
        this.touch.y2 = firstTouch.pageY
        // y轴偏移的锚点,'|'在js整数操作的时候,相当于去除小数点,parseInt。在正数的时候相当于Math.floor(),负数的时候相当于Math.ceil()
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
        // 记得转化为数值
        let anchorIndex = (+this.touch.anchorIndex) + delta
        this._scrollTo(anchorIndex)
      }, // shortcutList end
      refresh() {
        this.$refs.listview.refresh() // scroll组件的refresh方法
      },
      scroll(pos) {
        this.scrollY = pos.y
      }, // scroll end
      _calculateHeight() {
        this.listHeight = []
        const list = this.$refs.listGroup // 获取所有li元素
        let height = 0
        this.listHeight.push(height)
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          height += item.clientHeight
          this.listHeight.push(height)
        }
      }, // _calculateHeight end
      _scrollTo(index) {
        // 右侧栏,上下两部分留白处理
        if (!index && index !== 0) return
        if (index < 0) {
          index = 0
        } else if (index > this.listHeight.length - 2) {
          index = this.listHeight.length - 2
        }
        this.scrollY = -this.listHeight[index]
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
      }, // _scrollTo end
      selectItem(item) { // 这个组件被点击的时候,告诉外部我某个东西被点击了,顺便把参数传出去,自己本身不处理任何业务逻辑
        this.$emit('select', item)
      } // selectItem end
    }, // methods end
    watch: {
      data() {
        setTimeout(() => {
          this._calculateHeight()
        }, 20)
      }, // data end
      scrollY(newY) {
        const listHeight = this.listHeight
        // 当页面在顶部
        if (newY > 0) {
          this.currentIndex = 0
          return
        }
        // 页面在中间部分,listHeight比元素总个数多一个
        for (let i = 0; i < listHeight.length - 1; i++) {
          let height1 = listHeight[i] // 区块顶端
          let height2 = listHeight[i + 1] // 区块底端
          // 向上滚动式,y是负值,-newy就是正值
          if (-newY >= height1 && -newY < height2) {
            this.currentIndex = i
            this.diff = height2 + newY
            return
          }
        }
        // 当页面滚动到底部,且-newY大于最后一个元素的上限,这个例子的最后一个元素太高,貌似无法验证
        this.currentIndex = listHeight.length - 2
      }, // scrollY end
      diff(newVal) {
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
        if (this.fixedTop === fixedTop) return
        this.fixedTop = fixedTop
        this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`
      } // diff end
    }, // watch end
    components: {
      Scroll,
      Loading
    } // components end
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
