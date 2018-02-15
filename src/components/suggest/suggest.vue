<template>
  <Scroll :beforeScroll="beforeScroll" @beforeScroll="listScroll" :pullup="pullup" :data="result" class="suggest" @scrollToEnd="searchMore" ref="suggest">
    <ul class="suggest-list">
      <li @click="selectItem(item)" v-for="item in result" class="suggest-item">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <Loading v-show="hasMore" title=""></Loading>
    </ul>
    <div class="no-result-wrapper">
      <!-- 如果给组件传入固定的值,不需要v-bing,直接绑定属性名和属性值即可 -->
      <NoResult v-show="!hasMore && !result.length" title="抱歉暂无搜索结果"></NoResult>
    </div>
  </Scroll>
</template>

<script type="text/ecmascript-6">
  import {search} from 'api/search'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import Singer from 'common/js/singer'
  import {mapMutations, mapActions} from 'vuex'
  import NoResult from 'base/no-result/no-result'

  const TYPE_SINGER = 'singer' // 区分是否是歌手
  const perpage = 20 // 单词查询条目数

  export default {
    props: {
      query: {type: String, default: ''}, // 关键字
      showSinger: {type: Boolean, default: true} // 是否展示歌手
    },
    data() {
      return {
        page: 1, // 当前页
        result: [], // 搜索返回的数据
        pullup: true, // 上啦刷新
        hasMore: true, // 是否可以加载更多
        beforeScroll: true // 处理键盘
      }
    },
    methods: {
      selectItem(item) {
        if (item.type === TYPE_SINGER) {
          const singer = new Singer({
            id: item.singermid,
            name: item.singername
          })
          this.$router.push({
            path: `/search/${singer.id}`
          })
          this.setSinger(singer)
        } else { // 如果不是歌手,就将歌曲插入到播放列表
          this.insertSong(item)
        }
        this.$emit('select')
      },
      search() { // 第一次进入触发, 所以, 需要全部初始化
        this.page = 1
        this.hasMore = true
        this.$refs.suggest.scrollTo(0, 0) // 返回初始位置
        search(this.query, this.page, this.showSinger, perpage).then(res => {
          if (res.code === ERR_OK) {
            this.result = this._genResult(res.data)
            this._checkMore(res.data)
          }
        })
      }, // search
      searchMore() { // 下拉刷新触发
        if (!this.hasMore) return
        this.page++
        search(this.query, this.page, this.showSinger, perpage).then(res => {
          if (res.code === ERR_OK) {
            this.result = this.result.concat(this._genResult(res.data))
            this._checkMore(res.data)
          }
        })
      },
      _genResult(data) {
        let ret = []
        if (data.zhida && data.zhida.singerid) { // 判断是否有歌直达
          ret.push({...data.zhida, ...{type: TYPE_SINGER}})
        }
        if (data.song) { // 判断是否有音乐数据
          ret = ret.concat(this._normalizeSongs(data.song.list))
        }
        return ret
      }, // _genResult
      _normalizeSongs(list) {
        let ret = []
        list.forEach(musicData => {
          if (musicData.songid && musicData.albumid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      },
      _checkMore(data) { // 检测是否还能获取更多数据
        const song = data.song
        if (!song.list.length || (song.curnum + (song.curpage - 1) * perpage) >= song.totalnum) {
          this.hasMore = false
        }
      },
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
          return `${item.name}-${item.singer}`
        }
      }, // getDisplayName
      listScroll() {
        this.$emit('listScroll')
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'
      }),
      ...mapActions(['insertSong'])
    },
    watch: {
      query(query) {
        this.search()
      }
    },
    components: {
      Scroll,
      Loading,
      NoResult
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
