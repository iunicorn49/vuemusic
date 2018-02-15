<template>
  <div class="search">
    <div class="search-box-wrapper">
      <SearchBox ref="searchBox" @queryEvent="onQueryChange"></SearchBox>
    </div>
    <div class="shortcut-wrapper" v-show="!query">
      <div class="shortcut">
        <div class="hot-key">
          <h1 class="title">热门搜索</h1>
          <ul>
            <li @click="addQuery(item.k)" v-for="item in hotKey" class="item">
              <span>{{item.k}}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="search-result" v-show="query">
      <Suggest @select="saveSearch" @listScroll="blurInput" :query="query"></Suggest>
    </div>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
  import SearchBox from 'base/search-box/search-box'
  import {getHotKey} from 'api/search'
  import {ERR_OK} from 'api/config'
  import Suggest from 'components/suggest/suggest'
  import {mapActions} from 'vuex'

  export default {
    data() {
      return {
        hotKey: [],
        query: '' // 给suggest用
      }
    },
    created() {
      this._getHotKey()
    },
    methods: {
      saveSearch() { // 保存搜索历史
        this.saveSearchHistory(this.query)
      },
      onQueryChange(query) {
        this.query = query
      },
      addQuery(query) {
        /**
         * 获取SearchBox的引用
         * 直接调用它的方法,将query传递进去
         */
        this.$refs.searchBox.setQuery(query)
      },
      _getHotKey() {
        getHotKey().then(res => {
          if (res.code === ERR_OK) {
            this.hotKey = res.data.hotkey.slice(0, 10) // 只需要前10条数据
          }
        })
      }, // _getHotKey
      blurInput() {
        this.$refs.searchBox.blur() // 调用子组件的方法
      },
      ...mapActions([
        'saveSearchHistory'
      ])
    },
    components: {
      SearchBox,
      Suggest
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>
