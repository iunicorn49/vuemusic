<template>
  <!-- 这个好像是vue自带的动画组件 -->
  <transition name="slide">
    <music-list
      :songs="songs"
      :title="title"
      :bg-image="bgImage">
    </music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  import {mapGetters} from 'vuex'
  import {getSingerDetail} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import {createSong, isValidMusic} from 'common/js/song'
  import MusicList from 'components/music-list/music-list'

  export default {
    data() {
      return {
        songs: []
      }
    }, // data end
    computed: {
      title() {
        return this.singer.name
      },
      bgImage() {
        return this.singer.avatar
      },
      ...mapGetters([ // 映射,语法糖
        'singer'
      ])
    }, // computed end
    created() {
      this._getDetail()
    }, // created end
    methods: {
      _getDetail() {
        if (!this.singer.id) {
          /**
           * 直接返回singer页面
           * 当手动在地址栏输入网址的时候,vuex其实并没有获取到singer这条数据
           * 从而导致,singer为空
           * 这个时候,我们需要手动返回singer页面
           * 只有从singer页面点击某一条目的时候,才能获取singer数据
           */
          this.$router.push('/singer')
          return
        }
        getSingerDetail(this.singer.id).then(res => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeSongs(res.data.list)
          }
        })
      }, // _getDetail end
      _normalizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          let {musicData} = item
          if (isValidMusic(musicData)) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      } // _normalizeSongs end
    }, // methods end
    components: {
      MusicList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  // vue动画
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s
  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
