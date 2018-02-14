<template>
  <div class="suggest">
    <ul class="suggest-list">
      <li v-for="item in result" class="suggest-item">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script type="text/ecmascript-6">
  import {search} from 'api/search'
  import {ERR_OK} from 'api/config'
  import {filterSinger} from 'common/js/song'

  const TYPE_SINGER = 'singer' // 区分是否是歌手

  export default {
    props: {
      query: {type: String, default: ''}, // 关键字
      showSinger: {type: Boolean, default: true} // 是否展示歌手
    },
    data() {
      return {
        page: 1, // 当前页
        result: [] // 搜索返回的数据
      }
    },
    methods: {
      search() {
        search(this.query, this.page, this.showSinger).then(res => {
          if (res.code === ERR_OK) {
            this.result = this._genResult(res.data)
          }
        })
      }, // search
      _genResult(data) {
        let ret = []
        if (data.zhida && data.zhida.singerid) { // 判断是否有歌直达
          ret.push({...data.zhida, ...{type: TYPE_SINGER}})
        }
        if (data.song) { // 判断是否有音乐数据
          ret = ret.concat(data.song.list)
        }
        return ret
      }, // _genResult
      getIconCls(item) { // 返回类名
        if (item.type === TYPE_SINGER) {
          return 'icon-mine'
        } else {
          return 'icon-music'
        }
      }, // getIconCls
      getDisplayName(item) { // 返回文字
        if (item.type === TYPE_SINGER) {
          return item.singername
        } else {
          return `${item.songname}-${filterSinger(item.singer)}`
        }
      } // getDisplayName
    },
    watch: {
      query(query) {
        console.log(query)
        this.search()
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
