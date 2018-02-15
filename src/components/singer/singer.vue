<template>
  <div class="singer" ref="singer">
    <list-view @select="selectSinger" :data="singers" ref="list"></list-view>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
  import {getSingerList} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import Singer from 'common/js/singer'
  import ListView from 'base/listview/listview'
  import {mapMutations} from 'vuex' // vuex的方法
  import {playlistMixin} from 'common/js/mixin'

  const HOT_NAME = '热门'
  const HOT_SINGER_LEN = 10
  export default {
    mixins: [playlistMixin],
    data() {
      return {
        singers: []
      }
    },
    created() {
      this._getSingerList()
    },
    methods: {
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.singer.style.bottom = bottom
        this.$refs.list.refresh() // 调用这个组件中的方法
      },
      selectSinger(singer) {
        this.$router.push({ // router 编程式接口
          path: `/singer/${singer.id}`
        })
        // vuex的语法糖
        this.setSinger(singer)
      }, // selectSinger end
      _getSingerList() {
        getSingerList().then(res => {
          if (res.code === ERR_OK) {
            this.singers = this._normalizeSinger(res.data.list)
          }
        })
      }, // _getSingerList end
      _normalizeSinger(list) {
        let map = {
          hot: {
            title: HOT_NAME,
            items: []
          } // hot end
        }
        list.forEach((item, index) => {
          // 取前10条当做热门歌手,并填充东西
          if (index < HOT_SINGER_LEN) {
            map.hot.items.push(new Singer({id: item.Fsinger_mid, name: item.Fsinger_name}))
          }
          // 按照数据中的Findex进行分类
          const key = item.Findex
          // 如果没有分类就创建一个
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
          }
          // 如有分类直接填充东西
          map[key].items.push(new Singer({id: item.Fsinger_mid, name: item.Fsinger_name}))
        })
        // 将map进行排序,获得有序列表
        let hot = []
        let ret = []
        for (let key in map) {
          let val = map[key]
          // match是一个正则校验方法,用来匹配a-Z
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
          } else if (val.title === HOT_NAME) {
            hot.push(val)
          }
          // 通过字符编码,将字母排序
          ret.sort((a, b) => {
            return a.title.charCodeAt(0) - b.title.charCodeAt(0)
          })
        }
        return hot.concat(ret)
      }, // _normalizeSinger end
      ...mapMutations({ // 映射
        setSinger: 'SET_SINGER'
      })
    }, // methods end
    components: {
      ListView
    } // components end
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>
