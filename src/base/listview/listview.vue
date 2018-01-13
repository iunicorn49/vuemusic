<template>
  <Scroll class="listview" :data="data" ref="listview">
    <!-- 整体 -->
    <ul>
      <li v-for="group in data" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li v-for="item in group.items" class="list-group-item">
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
         @touchstart="onShortcutTouchStart"
         @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li v-for="(item, index) in shortcutList" :data-index="index" class="item">
          {{item}}
        </li>
      </ul>
    </div>
  </Scroll>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import {getData} from 'common/js/dom'

  const ANCHOR_HEIGHT = 18 // 锚点的高度,字体大小12,行高1倍,上下padding各3,总和18

  export default {
    created() {
      this.touch = {} // 如果不需要对dom进行绑定,可以在这里定义一个容器用来存储数据
    }, // created end
    props: {
      data: {
        type: Array,
        default: []
      }
    }, // props end
    computed: {
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
        // y轴偏移的锚点,`||0` 是向下取整的意思,和Math.floor的效果一样
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT || 0
        let anchorIndex = this.touch.anchorIndex + delta
        this._scrollTo(anchorIndex)
      }, // shortcutList end
      _scrollTo(index) {
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
      } // _scrollTo end
    }, // methods end
    components: {
      Scroll
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
